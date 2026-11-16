import { Coordinates } from '../types/location';
import { NavigationMode } from '../types/navigation';
import { GoogleMapsStatus, GooglePlaceResult, GoogleRouteResponse } from '../types/googleMaps';
import { LPU_CAMPUS_BOUNDS, LPU_CAMPUS_CENTER } from '../data/campusBounds';

const STORAGE_KEY_API_KEY = 'lpu_custom_google_maps_api_key';

type StatusListener = (status: GoogleMapsStatus, errorMessage?: string) => void;

/**
 * Official Google Maps inline dynamic bootstrap loader
 * Sets up window.google.maps.importLibrary and prevents duplicate script injection.
 */
function injectOfficialLoader(apiKey: string): void {
  const w = window as any;
  w.google = w.google || {};
  const maps = w.google.maps || (w.google.maps = {});

  if (typeof maps.importLibrary === 'function') {
    return; // Already initialized; avoids duplicate script insertion
  }

  // Hook gm_authFailure callback for API key/referrer restriction issues
  w.gm_authFailure = () => {
    console.error('Google Maps Platform: gm_authFailure (API key invalid or HTTP referrer rejected).');
    googleMapsService.handleAuthFailure();
  };

  const g = { key: apiKey, v: 'weekly' };
  const r = new Set<string>();
  const e = new URLSearchParams();
  let h: Promise<any> | null = null;

  const u = () =>
    h ||
    (h = new Promise((resolve, reject) => {
      // Check if script element already exists in document
      const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
      if (existingScript) {
        resolve(undefined);
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-api-script';
      script.async = true;
      e.set('libraries', [...r].join(','));
      for (const k in g) {
        e.set(k.replace(/[A-Z]/g, (t) => '_' + t[0].toLowerCase()), (g as any)[k]);
      }
      e.set('callback', 'google.maps.__ib__');
      script.src = `https://maps.googleapis.com/maps/api/js?` + e.toString();
      maps.__ib__ = () => resolve(undefined);
      script.onerror = () => {
        h = null;
        reject(new Error('Google Maps script failed to load. Check network connection or API key referrer restrictions.'));
      };
      document.head.append(script);
    }));

  maps.importLibrary = (f: string, ...n: any[]) => {
    r.add(f);
    return u().then(() => maps.importLibrary(f, ...n));
  };
}

class GoogleMapsService {
  private status: GoogleMapsStatus = 'unconfigured';
  private errorMessage: string | null = null;
  private loadPromise: Promise<boolean> | null = null;
  private listeners: Set<StatusListener> = new Set();
  private dummyMapDiv: HTMLDivElement | null = null;
  private libraryCache: Map<string, any> = new Map();

  constructor() {
    if (this.isConfigured()) {
      this.status = 'unconfigured';
    }
  }

  /**
   * Get currently configured API key (env variable or user-provided override in localStorage).
   * Key is never exposed in logs or user-facing errors.
   */
  public getApiKey(): string {
    const customKey = localStorage.getItem(STORAGE_KEY_API_KEY)?.trim();
    if (customKey) return customKey;

    const envKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
    return envKey;
  }

  /**
   * Check if a valid API key is present
   */
  public isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.length > 5 && !key.includes('YOUR_'));
  }

  /**
   * Save a custom API key for testing in the browser
   */
  public setCustomApiKey(key: string) {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY_API_KEY, trimmed);
    } else {
      localStorage.removeItem(STORAGE_KEY_API_KEY);
    }
    this.status = 'unconfigured';
    this.errorMessage = null;
    this.loadPromise = null;
    this.libraryCache.clear();
    this.notify();
  }

  public getStatus(): GoogleMapsStatus {
    return this.status;
  }

  public getErrorMessage(): string | null {
    return this.errorMessage;
  }

  public handleAuthFailure() {
    this.status = 'error';
    this.errorMessage = 'Google Maps authentication failed. Please verify that your API key is valid and authorized for this domain.';
    this.loadPromise = null;
    this.notify();
  }

  public subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.status, this.errorMessage || undefined);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.status, this.errorMessage || undefined));
  }

  /**
   * Asynchronously load Google Maps JavaScript API via the official dynamic loader
   */
  public async load(): Promise<boolean> {
    if (this.status === 'ready' && window.google?.maps?.importLibrary) {
      return true;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    const apiKey = this.getApiKey();
    if (!apiKey || !this.isConfigured()) {
      this.status = 'unconfigured';
      this.errorMessage = 'Google Maps API key is unconfigured. Add VITE_GOOGLE_MAPS_API_KEY in .env or enter your key in settings.';
      this.notify();
      return false;
    }

    this.status = 'loading';
    this.errorMessage = null;
    this.notify();

    this.loadPromise = (async () => {
      try {
        injectOfficialLoader(apiKey);

        // Pre-import 'maps' library to verify connectivity and Map constructor availability
        const mapsLib = await window.google.maps.importLibrary('maps');
        this.libraryCache.set('maps', mapsLib);

        this.status = 'ready';
        this.errorMessage = null;
        this.notify();
        return true;
      } catch (err: any) {
        console.error('Failed to load Google Maps Platform:', err?.message || err);
        this.status = 'error';
        this.errorMessage = err?.message || 'Failed to load Google Maps Platform. Check network or referrer restrictions.';
        this.loadPromise = null;
        this.notify();
        return false;
      }
    })();

    return this.loadPromise;
  }

  /**
   * Import a Google Maps library using google.maps.importLibrary
   */
  public async importLibrary(libraryName: string): Promise<any> {
    if (this.libraryCache.has(libraryName)) {
      return this.libraryCache.get(libraryName);
    }

    const isLoaded = await this.load();
    if (!isLoaded || !window.google?.maps?.importLibrary) {
      throw new Error(this.errorMessage || 'Google Maps Platform failed to load.');
    }

    const lib = await window.google.maps.importLibrary(libraryName);
    this.libraryCache.set(libraryName, lib);
    return lib;
  }

  /**
   * Search places via Google Places API (Text Search biased to LPU Campus)
   */
  public async searchPlaces(query: string): Promise<GooglePlaceResult[]> {
    if (!query.trim()) return [];

    const isLoaded = await this.load();
    if (!isLoaded) return [];

    try {
      const placesLib = await this.importLibrary('places');
      const coreLib = await this.importLibrary('core');

      const PlacesServiceClass = placesLib.PlacesService || window.google?.maps?.places?.PlacesService;
      if (!PlacesServiceClass) return [];

      if (!this.dummyMapDiv) {
        this.dummyMapDiv = document.createElement('div');
        this.dummyMapDiv.style.display = 'none';
        document.body.appendChild(this.dummyMapDiv);
      }

      const service = new PlacesServiceClass(this.dummyMapDiv);
      const LatLngBoundsClass = coreLib.LatLngBounds || window.google.maps.LatLngBounds;
      const LatLngClass = coreLib.LatLng || window.google.maps.LatLng;

      return new Promise<GooglePlaceResult[]>((resolve) => {
        const lpuBounds = new LatLngBoundsClass(
          new LatLngClass(LPU_CAMPUS_BOUNDS.southWest.lat, LPU_CAMPUS_BOUNDS.southWest.lng),
          new LatLngClass(LPU_CAMPUS_BOUNDS.northEast.lat, LPU_CAMPUS_BOUNDS.northEast.lng)
        );

        const request = {
          query: `${query} Lovely Professional University Phagwara`,
          bounds: lpuBounds,
          location: new LatLngClass(LPU_CAMPUS_CENTER.lat, LPU_CAMPUS_CENTER.lng),
          radius: 1800,
        };

        service.textSearch(request, (results: any[], status: any) => {
          const PlacesServiceStatus = placesLib.PlacesServiceStatus || window.google?.maps?.places?.PlacesServiceStatus;
          if (
            status !== PlacesServiceStatus?.OK &&
            status !== 'OK' ||
            !results ||
            results.length === 0
          ) {
            resolve([]);
            return;
          }

          const parsed: GooglePlaceResult[] = results
            .filter((place) => place.geometry && place.geometry.location)
            .map((place) => {
              const lat = typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat;
              const lng = typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng;

              let photoUrl: string | undefined = undefined;
              if (place.photos && place.photos.length > 0) {
                try {
                  photoUrl = place.photos[0].getUrl({ maxWidth: 500 });
                } catch {
                  // Ignore photo URL error
                }
              }

              return {
                placeId: place.place_id || `gplace-${Math.random()}`,
                name: place.name || query,
                formattedAddress: place.formatted_address,
                coordinates: { lat, lng },
                types: place.types,
                rating: place.rating,
                userRatingsTotal: place.user_ratings_total,
                photoUrl,
                source: 'google_places' as const,
                isCampusLocation: this.isWithinLpuBounds(lat, lng),
              };
            });

          resolve(parsed);
        });
      });
    } catch (err) {
      console.warn('Google Places search error:', err);
      return [];
    }
  }

  /**
   * Calculate route using official Google Maps DirectionsService
   */
  public async calculateDirections(
    origin: Coordinates,
    destination: Coordinates,
    mode: NavigationMode
  ): Promise<GoogleRouteResponse> {
    const isLoaded = await this.load();
    if (!isLoaded) {
      return {
        status: 'ERROR',
        pathCoordinates: [],
        distanceMeters: 0,
        durationSeconds: 0,
      };
    }

    try {
      const routesLib = await this.importLibrary('routes');
      const coreLib = await this.importLibrary('core');

      const DirectionsServiceClass = routesLib.DirectionsService || window.google?.maps?.DirectionsService;
      const TravelModeEnum = routesLib.TravelMode || window.google?.maps?.TravelMode;
      const DirectionsStatusEnum = routesLib.DirectionsStatus || window.google?.maps?.DirectionsStatus;
      const LatLngClass = coreLib.LatLng || window.google?.maps?.LatLng;

      if (!DirectionsServiceClass || !TravelModeEnum) {
        return {
          status: 'ERROR',
          pathCoordinates: [],
          distanceMeters: 0,
          durationSeconds: 0,
        };
      }

      const directionsService = new DirectionsServiceClass();

      let travelMode = TravelModeEnum.WALKING;
      if (mode === 'car') {
        travelMode = TravelModeEnum.DRIVING;
      } else if (mode === 'bike') {
        travelMode = TravelModeEnum.BICYCLING;
      } else if (mode === 'wheelchair') {
        travelMode = TravelModeEnum.WALKING;
      }

      return new Promise<GoogleRouteResponse>((resolve) => {
        directionsService.route(
          {
            origin: new LatLngClass(origin.lat, origin.lng),
            destination: new LatLngClass(destination.lat, destination.lng),
            travelMode: travelMode,
            provideRouteAlternatives: false,
          },
          (result: any, status: any) => {
            const isOk = status === DirectionsStatusEnum?.OK || status === 'OK';
            const isZero = status === DirectionsStatusEnum?.ZERO_RESULTS || status === 'ZERO_RESULTS';

            if (isOk && result?.routes?.[0]) {
              const route = result.routes[0];
              const leg = route.legs?.[0];

              const pathCoordinates: Array<{ lat: number; lng: number }> = [];
              if (route.overview_path) {
                for (let i = 0; i < route.overview_path.length; i++) {
                  const pt = route.overview_path[i];
                  const lat = typeof pt.lat === 'function' ? pt.lat() : pt.lat;
                  const lng = typeof pt.lng === 'function' ? pt.lng() : pt.lng;
                  pathCoordinates.push({ lat, lng });
                }
              }

              const steps = (leg?.steps || []).map((step: any) => {
                const cleanInstruction = (step.instructions || '')
                  .replace(/<[^>]*>?/gm, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();

                const startLat = typeof step.start_location?.lat === 'function' ? step.start_location.lat() : step.start_location?.lat || 0;
                const startLng = typeof step.start_location?.lng === 'function' ? step.start_location.lng() : step.start_location?.lng || 0;
                const endLat = typeof step.end_location?.lat === 'function' ? step.end_location.lat() : step.end_location?.lat || 0;
                const endLng = typeof step.end_location?.lng === 'function' ? step.end_location.lng() : step.end_location?.lng || 0;

                return {
                  instruction: cleanInstruction,
                  distanceMeters: step.distance?.value || 0,
                  durationSeconds: step.duration?.value || 0,
                  maneuver: step.maneuver || 'straight',
                  startLocation: { lat: startLat, lng: startLng },
                  endLocation: { lat: endLat, lng: endLng },
                };
              });

              resolve({
                status: 'OK',
                pathCoordinates,
                distanceMeters: leg?.distance?.value || 0,
                durationSeconds: leg?.duration?.value || 0,
                summary: route.summary,
                warnings: route.warnings,
                legs: route.legs,
                steps,
              });
            } else if (isZero) {
              resolve({
                status: 'ZERO_RESULTS',
                pathCoordinates: [],
                distanceMeters: 0,
                durationSeconds: 0,
              });
            } else {
              resolve({
                status: 'ERROR',
                pathCoordinates: [],
                distanceMeters: 0,
                durationSeconds: 0,
              });
            }
          }
        );
      });
    } catch (err) {
      console.warn('Google Directions error:', err);
      return {
        status: 'ERROR',
        pathCoordinates: [],
        distanceMeters: 0,
        durationSeconds: 0,
      };
    }
  }

  public isWithinLpuBounds(lat: number, lng: number): boolean {
    return (
      lat >= LPU_CAMPUS_BOUNDS.southWest.lat &&
      lat <= LPU_CAMPUS_BOUNDS.northEast.lat &&
      lng >= LPU_CAMPUS_BOUNDS.southWest.lng &&
      lng <= LPU_CAMPUS_BOUNDS.northEast.lng
    );
  }
}

export const googleMapsService = new GoogleMapsService();
