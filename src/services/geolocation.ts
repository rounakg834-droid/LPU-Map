import { GeolocationStatus, GeoPosition } from '../types/navigation';

export interface GeolocationCallbacks {
  onSuccess: (position: GeoPosition) => void;
  onError: (status: GeolocationStatus, message: string) => void;
  onWarning?: (status: GeolocationStatus, message: string) => void;
}

export class GeolocationService {
  private watchId: number | null = null;
  private lastTimestamp = 0;

  /**
   * Check if the current context supports secure Geolocation API calls
   */
  public isSecureEnvironment(): boolean {
    if (typeof window === 'undefined') return false;
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]';
    return window.isSecureContext || isLocal;
  }

  /**
   * Check if browser has Geolocation capabilities
   */
  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator;
  }

  /**
   * Request single immediate GPS fix
   */
  public getCurrentPosition(
    onSuccess: (pos: GeoPosition) => void,
    onError: (status: GeolocationStatus, message: string) => void
  ): void {
    if (!this.isSupported()) {
      onError('unavailable', 'Geolocation is not supported by your current browser.');
      return;
    }

    if (!this.isSecureEnvironment()) {
      onError(
        'insecure_context',
        'Device location access requires HTTPS or localhost for privacy and security.'
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSuccess(this.normalizePosition(pos));
      },
      (err) => {
        const { status, message } = this.handleGeolocationError(err);
        onError(status, message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000,
      }
    );
  }

  /**
   * Start continuous high-accuracy GPS tracking
   */
  public startTracking(callbacks: GeolocationCallbacks): number | null {
    if (this.watchId !== null) {
      this.stopTracking();
    }

    if (!this.isSupported()) {
      callbacks.onError('unavailable', 'Geolocation is not supported on this device.');
      return null;
    }

    if (!this.isSecureEnvironment()) {
      callbacks.onError(
        'insecure_context',
        'Location access requires a secure connection (HTTPS) or localhost.'
      );
      return null;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const normalized = this.normalizePosition(pos);
        this.lastTimestamp = normalized.timestamp;

        // Check for weak GPS signal (accuracy > 50 meters)
        if (normalized.coords.accuracy > 50 && callbacks.onWarning) {
          callbacks.onWarning(
            'weak_signal',
            `GPS signal is weak (±${Math.round(normalized.coords.accuracy)}m). Accuracy will improve outdoors.`
          );
        }

        // Check for stale coordinates
        if (Date.now() - normalized.timestamp > 25000 && callbacks.onWarning) {
          callbacks.onWarning('weak_signal', 'GPS location is using cached readings. Updating fix...');
        }

        callbacks.onSuccess(normalized);
      },
      (err) => {
        const { status, message } = this.handleGeolocationError(err);
        callbacks.onError(status, message);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 1500,
      }
    );

    return this.watchId;
  }

  /**
   * Stop active GPS tracking and release hardware watcher
   */
  public stopTracking(): void {
    if (this.watchId !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  public isTracking(): boolean {
    return this.watchId !== null;
  }

  public getLastTimestamp(): number {
    return this.lastTimestamp;
  }

  private normalizePosition(pos: GeolocationPosition): GeoPosition {
    return {
      coords: {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        altitude: pos.coords.altitude,
        altitudeAccuracy: pos.coords.altitudeAccuracy,
        heading: pos.coords.heading,
        speed: pos.coords.speed,
      },
      timestamp: pos.timestamp,
    };
  }

  private handleGeolocationError(err: GeolocationPositionError): {
    status: GeolocationStatus;
    message: string;
  } {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        return {
          status: 'denied',
          message:
            'Location permission denied. Please enable location access in device/browser settings.',
        };
      case err.POSITION_UNAVAILABLE:
        return {
          status: 'unavailable',
          message:
            'GPS position is currently unavailable. Ensure device Location/GPS is turned on.',
        };
      case err.TIMEOUT:
        return {
          status: 'timeout',
          message: 'Acquiring GPS fix timed out. Retrying GPS lock...',
        };
      default:
        return {
          status: 'unavailable',
          message: err.message || 'An unexpected location error occurred.',
        };
    }
  }
}

export const geolocationService = new GeolocationService();
