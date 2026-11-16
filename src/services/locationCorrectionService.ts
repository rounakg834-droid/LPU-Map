import { CampusLocation, Coordinates, LocationCorrection } from '../types/location';
import { authService } from './authService';
import { shouldAttemptApiSync, getApiUrl } from './apiConfig';

const STORAGE_KEY = 'lpu_location_corrections_v1';
const API_BASE = '/api/locations';

class LocationCorrectionService {
  private corrections: Map<string, LocationCorrection> = new Map();
  private subscribers: Set<() => void> = new Set();
  private isLoaded = false;
  private sseSource: EventSource | null = null;
  private isApiUnavailable = false;

  constructor() {
    this.initLocalStorage();
    this.initSSE();
  }

  private initLocalStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: LocationCorrection[] = JSON.parse(stored);
        parsed.forEach((c) => this.corrections.set(c.locationId, c));
      }
    } catch (e) {
      console.warn('Failed to parse cached location corrections:', e);
    }
  }

  private persistLocal() {
    try {
      const list = Array.from(this.corrections.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save location corrections locally:', e);
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Error in location correction subscriber:', err);
      }
    });
  }

  public subscribe(cb: () => void): () => void {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  private initSSE() {
    if (typeof window === 'undefined' || !window.EventSource || !shouldAttemptApiSync() || this.isApiUnavailable) return;

    try {
      this.sseSource = new EventSource(getApiUrl('/api/events/stream'));
      this.sseSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'LOCATION_MUTATION') {
            const { action, correction, locationId } = payload.payload;
            if (action === 'confirm_entrance' && correction) {
              this.corrections.set(correction.locationId, correction);
              this.persistLocal();
              this.notifySubscribers();
            } else if (action === 'revert_entrance' && locationId) {
              this.corrections.delete(locationId);
              this.persistLocal();
              this.notifySubscribers();
            }
          }
        } catch {
          // Keep-alive or non-JSON ping
        }
      };

      this.sseSource.onerror = () => {
        // Close immediately on static hosts / connection errors to prevent reconnect loops
        if (this.sseSource) {
          this.sseSource.close();
          this.sseSource = null;
        }
        this.isApiUnavailable = true;
      };
    } catch (err) {
      console.warn('SSE connection failed for location corrections:', err);
    }
  }

  public async loadCorrections(): Promise<LocationCorrection[]> {
    if (!shouldAttemptApiSync() || this.isApiUnavailable) {
      this.isLoaded = true;
      return Array.from(this.corrections.values());
    }

    try {
      const res = await fetch(getApiUrl(`${API_BASE}/corrections`));
      if (res.status === 404) {
        this.isApiUnavailable = true;
        if (this.sseSource) {
          this.sseSource.close();
          this.sseSource = null;
        }
      } else if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.corrections)) {
          this.corrections.clear();
          data.corrections.forEach((c: LocationCorrection) => {
            this.corrections.set(c.locationId, c);
          });
          this.persistLocal();
          this.isLoaded = true;
          this.notifySubscribers();
          return data.corrections;
        }
      }
    } catch {
      // Offline fallback: rely on localStorage
    }
    this.isLoaded = true;
    return Array.from(this.corrections.values());
  }

  public isReady(): boolean {
    return this.isLoaded;
  }

  public getCorrection(locationId: string): LocationCorrection | null {
    return this.corrections.get(locationId) || null;
  }

  public getAllCorrections(): LocationCorrection[] {
    return Array.from(this.corrections.values());
  }

  /**
   * Admin-Only: Confirm and persist entrance coordinates to shared campus database.
   * Rejects immediately if current session is not authenticated as university administrator.
   */
  public async confirmEntrance(
    locationId: string,
    entranceCoordinates: Coordinates,
    confirmedBy = 'Campus Administrator',
    notes?: string
  ): Promise<LocationCorrection> {
    if (!authService.isAdmin()) {
      throw new Error('Unauthorized: University administrator privileges are required to confirm campus location data.');
    }

    const payload = {
      locationId,
      entranceCoordinates,
      confirmedBy,
      adminToken: 'admin-authenticated',
      notes: notes || 'Verified entrance coordinates via on-ground Google Maps survey',
    };

    if (shouldAttemptApiSync() && !this.isApiUnavailable) {
      try {
        const res = await fetch(getApiUrl(`${API_BASE}/confirm-entrance`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer admin-authenticated',
          },
          body: JSON.stringify(payload),
        });

        if (res.status === 404) {
          this.isApiUnavailable = true;
        } else if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to persist entrance coordinates on campus server');
        } else {
          const data = await res.json();
          const confirmed = data.correction as LocationCorrection;
          this.corrections.set(locationId, confirmed);
          this.persistLocal();
          this.notifySubscribers();
          return confirmed;
        }
      } catch (err: any) {
        if (err?.message?.includes('Failed to persist')) {
          throw err;
        }
        console.warn('API sync unavailable; persisting entrance locally:', err);
      }
    }

    // Persist locally for authenticated administrator
    const localCorrection: LocationCorrection = {
      locationId,
      entranceCoordinates,
      isConfirmed: true,
      confirmedAt: new Date().toISOString(),
      confirmedBy,
      notes: payload.notes,
    };
    this.corrections.set(locationId, localCorrection);
    this.persistLocal();
    this.notifySubscribers();
    return localCorrection;
  }

  /**
   * Admin-Only: Revert a confirmed entrance back to pending.
   */
  public async revertEntrance(locationId: string): Promise<boolean> {
    if (!authService.isAdmin()) {
      throw new Error('Unauthorized: University administrator privileges required.');
    }

    if (shouldAttemptApiSync() && !this.isApiUnavailable) {
      try {
        const res = await fetch(getApiUrl(`${API_BASE}/revert-entrance`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer admin-authenticated',
          },
          body: JSON.stringify({ locationId, adminToken: 'admin-authenticated' }),
        });
        if (res.status === 404) {
          this.isApiUnavailable = true;
        }
      } catch (e) {
        console.warn('API sync unavailable; reverting locally:', e);
      }
    }

    this.corrections.delete(locationId);
    this.persistLocal();
    this.notifySubscribers();
    return true;
  }

  /**
   * Applies all confirmed entrance corrections to the campus locations list.
   */
  public applyCorrectionsToLocations(locations: CampusLocation[]): CampusLocation[] {
    return locations.map((loc) => {
      const correction = this.corrections.get(loc.id);
      if (correction && correction.isConfirmed) {
        return {
          ...loc,
          entranceCoordinates: correction.entranceCoordinates,
          isEntranceConfirmed: true,
          entranceVerifiedBy: correction.confirmedBy,
          entranceVerifiedAt: correction.confirmedAt,
        };
      }
      return loc;
    });
  }
}

export const locationCorrectionService = new LocationCorrectionService();
