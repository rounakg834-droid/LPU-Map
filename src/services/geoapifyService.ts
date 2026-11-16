import { Coordinates } from '../types/location';
import { NavigationMode } from '../types/navigation';
import { GeoapifyPlaceResult, GeoapifyRouteResult, GeoapifyRoutingStep, GeoapifyServiceStatus } from '../types/geoapify';
import { LPU_CAMPUS_BOUNDS, LPU_CAMPUS_CENTER } from '../data/campusBounds';

const STORAGE_KEY_API_KEY = 'lpu_geoapify_api_key';

// LPU Campus Bounding Box in minLon,minLat,maxLon,maxLat format for Geoapify filter=rect:...
const LPU_FILTER_RECT = `${LPU_CAMPUS_BOUNDS.southWest.lng},${LPU_CAMPUS_BOUNDS.southWest.lat},${LPU_CAMPUS_BOUNDS.northEast.lng},${LPU_CAMPUS_BOUNDS.northEast.lat}`;
const LPU_PROXIMITY_BIAS = `proximity:${LPU_CAMPUS_CENTER.lng},${LPU_CAMPUS_CENTER.lat}`;

type GeoapifyListener = (status: GeoapifyServiceStatus, error?: string | null) => void;

export class GeoapifyService {
  private static instance: GeoapifyService;
  private status: GeoapifyServiceStatus = 'unconfigured';
  private errorMessage: string | null = null;
  private listeners: Set<GeoapifyListener> = new Set();
  private cache: Map<string, GeoapifyPlaceResult[]> = new Map();

  private constructor() {
    this.status = this.isConfigured() ? 'ready' : 'unconfigured';
  }

  public static getInstance(): GeoapifyService {
    if (!GeoapifyService.instance) {
      GeoapifyService.instance = new GeoapifyService();
    }
    return GeoapifyService.instance;
  }

  /**
   * Subscribe to status and authentication events
   */
  public subscribe(listener: GeoapifyListener): () => void {
    this.listeners.add(listener);
    listener(this.status, this.errorMessage);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.status, this.errorMessage));
  }

  public getStatus(): GeoapifyServiceStatus {
    return this.status;
  }

  public getErrorMessage(): string | null {
    return this.errorMessage;
  }

  /**
   * Retrieve API key from environment variable or localStorage.
   * Never exposed in public logs.
   */
  public getApiKey(): string {
    const customKey = localStorage.getItem(STORAGE_KEY_API_KEY)?.trim();
    if (customKey && customKey.length > 5) {
      return customKey;
    }
    return (import.meta.env.VITE_GEOAPIFY_API_KEY || '').trim();
  }

  /**
   * Check if a valid API key is present
   */
  public isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.length > 8 && !key.includes('YOUR_'));
  }

  /**
   * Set custom API key in localStorage
   */
  public setCustomApiKey(key: string): void {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY_API_KEY, trimmed);
      this.status = 'ready';
      this.errorMessage = null;
    } else {
      localStorage.removeItem(STORAGE_KEY_API_KEY);
      this.status = this.isConfigured() ? 'ready' : 'unconfigured';
      this.errorMessage = null;
    }
    this.cache.clear();
    this.notify();
  }

  /**
   * Test API key validity against Geoapify geocode endpoint
   */
  public async testApiKey(testKey?: string): Promise<{ success: boolean; message: string }> {
    const key = (testKey || this.getApiKey()).trim();
    if (!key || key.length < 8) {
      return { success: false, message: 'API key is too short or empty.' };
    }

    try {
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=LPU&filter=rect:${LPU_FILTER_RECT}&limit=1&apiKey=${key}`;
      const res = await fetch(url);

      if (res.status === 401 || res.status === 403) {
        return {
          success: false,
          message: 'Invalid Geoapify API key or request domain is not allowed in Geoapify dashboard.',
        };
      }

      if (res.status === 429) {
        return {
          success: false,
          message: 'Geoapify daily request limit / quota exceeded.',
        };
      }

      if (!res.ok) {
        return {
          success: false,
          message: `Geoapify responded with HTTP error ${res.status}.`,
        };
      }

      return {
        success: true,
        message: 'Geoapify API key is valid and connected to LPU campus boundary filter!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Network error connecting to Geoapify: ${err?.message || 'Check internet connectivity.'}`,
      };
    }
  }

  /**
   * Search places and points of interest around LPU campus using Geoapify
   * Strictly bounds search to the LPU campus area to avoid non-campus distractions.
   */
  public async searchPlaces(query: string): Promise<GeoapifyPlaceResult[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2 || !this.isConfigured()) {
      return [];
    }

    const cacheKey = trimmed.toLowerCase();
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const apiKey = this.getApiKey();
    try {
      // 1. Query Geocode Autocomplete constrained strictly to LPU campus bbox
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        trimmed
      )}&filter=rect:${LPU_FILTER_RECT}&bias=${LPU_PROXIMITY_BIAS}&limit=10&apiKey=${apiKey}`;

      const res = await fetch(url);

      if (res.status === 401 || res.status === 403) {
        this.status = 'error';
        this.errorMessage =
          'Geoapify API key is invalid or restricted to a different domain. Restrict allowed domains in the Geoapify dashboard.';
        this.notify();
        return [];
      }

      if (res.status === 429) {
        this.status = 'quota_exceeded';
        this.errorMessage = 'Geoapify free tier quota limit reached. Using local campus database.';
        this.notify();
        return [];
      }

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      const features: any[] = data.features || [];

      const results: GeoapifyPlaceResult[] = features
        .filter((f) => {
          const coords = f.geometry?.coordinates;
          if (!coords || coords.length < 2) return false;
          const [lng, lat] = coords;
          // Validate strictly within LPU campus bounds
          return (
            lat >= LPU_CAMPUS_BOUNDS.southWest.lat - 0.005 &&
            lat <= LPU_CAMPUS_BOUNDS.northEast.lat + 0.005 &&
            lng >= LPU_CAMPUS_BOUNDS.southWest.lng - 0.005 &&
            lng <= LPU_CAMPUS_BOUNDS.northEast.lng + 0.005
          );
        })
        .map((f) => {
          const p = f.properties || {};
          const [lng, lat] = f.geometry.coordinates;
          const categories = p.categories || [];
          const name = p.name || p.formatted?.split(',')[0] || trimmed;

          return {
            placeId: String(p.place_id || `${lat}_${lng}`),
            name,
            formattedAddress: p.formatted || p.address_line2 || undefined,
            coordinates: { lat, lng },
            categories,
            rawProperties: p,
          };
        });

      this.cache.set(cacheKey, results);
      return results;
    } catch (err: any) {
      console.warn('Geoapify search request failed gracefully:', err?.message || err);
      return [];
    }
  }

  /**
   * Calculate public walking, cycling, or driving route fallback using Geoapify Routing API
   * Used as an optional fallback when internal campus routing graph has no connected path.
   */
  public async calculateRoute(
    origin: Coordinates,
    destination: Coordinates,
    mode: NavigationMode
  ): Promise<GeoapifyRouteResult | null> {
    if (!this.isConfigured()) return null;

    const apiKey = this.getApiKey();
    // Geoapify modes: 'walk', 'bicycle', 'drive'
    let geoapifyMode = 'walk';
    if (mode === 'bike') geoapifyMode = 'bicycle';
    else if (mode === 'car') geoapifyMode = 'drive';

    try {
      const url = `https://api.geoapify.com/v1/routing?waypoints=${origin.lat},${origin.lng}|${destination.lat},${destination.lng}&mode=${geoapifyMode}&apiKey=${apiKey}`;
      const res = await fetch(url);

      if (res.status === 401 || res.status === 403) {
        this.status = 'error';
        this.errorMessage = 'Geoapify Routing unauthorized: verify domain restrictions.';
        this.notify();
        return null;
      }

      if (res.status === 429) {
        this.status = 'quota_exceeded';
        this.errorMessage = 'Geoapify Routing quota exceeded.';
        this.notify();
        return null;
      }

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      const feature = data.features?.[0];
      if (!feature || !feature.geometry) return null;

      const geom = feature.geometry;
      let rawCoords: number[][] = [];

      if (geom.type === 'LineString') {
        rawCoords = geom.coordinates;
      } else if (geom.type === 'MultiLineString') {
        rawCoords = geom.coordinates.flat(1);
      }

      const coordinates: Coordinates[] = rawCoords.map(([lng, lat]) => ({ lat, lng }));
      const props = feature.properties || {};
      const distanceMeters = Math.round(props.distance || 0);
      const durationSeconds = Math.round(props.time || 0);
      const durationMinutes = Math.max(1, Math.ceil(durationSeconds / 60));

      // Parse turn-by-turn steps
      const steps: GeoapifyRoutingStep[] = [];
      const legs = props.legs || [];
      legs.forEach((leg: any) => {
        const rawSteps = leg.steps || [];
        rawSteps.forEach((st: any) => {
          const instruction = st.instruction?.text || 'Continue along pathway';
          const fromIdx = st.from_index ?? 0;
          const stepCoord = coordinates[fromIdx] || origin;
          steps.push({
            instruction,
            distanceMeters: Math.round(st.distance || 0),
            durationSeconds: Math.round(st.time || 0),
            coordinates: stepCoord,
          });
        });
      });

      return {
        distanceMeters,
        durationMinutes,
        coordinates,
        steps,
      };
    } catch (err: any) {
      console.warn('Geoapify routing calculation failed gracefully:', err?.message || err);
      return null;
    }
  }
}

export const geoapifyService = GeoapifyService.getInstance();
