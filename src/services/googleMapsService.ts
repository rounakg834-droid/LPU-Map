import { Coordinates } from '../types/location';
import { NavigationMode } from '../types/navigation';
import { GoogleMapsStatus, GooglePlaceResult, GoogleRouteResponse } from '../types/googleMaps';
import { LPU_CAMPUS_BOUNDS, LPU_CAMPUS_CENTER } from '../data/campusBounds';

const STORAGE_KEY_API_KEY = 'lpu_custom_google_maps_api_key';

type StatusListener = (status: GoogleMapsStatus, errorMessage?: string) => void;

class GoogleMapsService {
  private status: GoogleMapsStatus = 'unconfigured';
  private errorMessage: string | null = null;
  private loadPromise: Promise<boolean> | null = null;
  private listeners: Set<StatusListener> = new Set();
  private dummyMapDiv: HTMLDivElement | null = null;
  private placesService: any = null;

  constructor() {
    // Check if key is available on startup
    const key = this.getApiKey();
    if (key) {
      this.status = 'unconfigured'; // ready to load on demand
    }
  }

  /**
   * Get currently configured API key (env variable or user-provided override in localStorage)
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
    this.placesService = null;
    this.notify();
  }

  public getStatus(): GoogleMapsStatus {
    return this.status;
  }

  public getErrorMessage(): string | null {
    return this.errorMessage;
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
   * Asynchronously load Google Maps JavaScript API script
   */
  public async load(): Promise<boolean> {
    if (this.status === 'ready' && window.google?.maps) {
      return true;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    const apiKey = this.getApiKey();
    if (!apiKey || !this.isConfigured()) {
      this.status = 'unconfigured';
      this.errorMessage = 'Google Maps API key not configured. Add VITE_GOOGLE_MAPS_API_KEY in .env or enter your key in settings.';
      this.notify();
      return false;
    }

    this.status = 'loading';
    this.errorMessage = null;
    this.notify();

    this.loadPromise = new Promise<boolean>((resolve) => {
      // Check if already in DOM
      const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
      if (existingScript && window.google?.maps) {
        this.status = 'ready';
        this.notify();
        resolve(true);
        return;
      }

      // Handle auth failures from Google Maps script
      window.gm_authFailure = () => {
        console.error('Google Maps Platform: gm_authFailure - invalid API key or referrer restriction rejected');
        this.status = 'error';
        this.errorMessage = 'Google Maps authentication failed. Please verify that your API key is valid and authorized for this domain.';
        this.notify();
        resolve(false);
      };

      const script = document.createElement('script');
      script.id = 'google-maps-api-script';
      script.type = 'text/javascript';
      script.async = true;
      script.defer = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        apiKey
      )}&libraries=places,geometry,marker&v=weekly&loading=async`;

      const timeout = setTimeout(() => {
        if (this.status !== 'ready') {
          this.status = 'error';
          this.errorMessage = 'Google Maps script request timed out. Please check network connection and API key.';
          this.notify();
          resolve(false);
        }
      }, 12000);

      script.onload = () => {
        clearTimeout(timeout);
        if (window.google?.maps) {
          this.status = 'ready';
          this.errorMessage = null;
          this.notify();
          resolve(true);
        } else {
          this.status = 'error';
          this.errorMessage = 'Google Maps script loaded but window.google.maps is undefined.';
          this.notify();
          resolve(false);
        }
      };

      script.onerror = () => {
        clearTimeout(timeout);
        this.status = 'error';
        this.errorMessage = 'Failed to load Google Maps script. Check network connection or referrer restrictions.';
        this.notify();
        resolve(false);
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Lazy initialize hidden div for PlacesService if needed
   */
  private getPlacesService(): any {
    if (this.placesService) return this.placesService;
    if (!window.google?.maps?.places?.PlacesService) return null;

    if (!this.dummyMapDiv) {
      this.dummyMapDiv = document.createElement('div');
      this.dummyMapDiv.style.display = 'none';
      document.body.appendChild(this.dummyMapDiv);
    }
    this.placesService = new window.google.maps.places.PlacesService(this.dummyMapDiv);
    return this.placesService;
  }

  /**
   * Search places via Google Places API (Text Search biased to LPU Campus)
   */
  public async searchPlaces(query: string): Promise<GooglePlaceResult[]> {
    if (!query.trim()) return [];

    const isLoaded = await this.load();
    if (!isLoaded || !window.google?.maps?.places) {
      return [];
    }

    const service = this.getPlacesService();
    if (!service) return [];

    return new Promise<GooglePlaceResult[]>((resolve) => {
      // Bias search within LPU campus bounds
      const lpuBounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(LPU_CAMPUS_BOUNDS.southWest.lat, LPU_CAMPUS_BOUNDS.southWest.lng),
        new window.google.maps.LatLng(LPU_CAMPUS_BOUNDS.northEast.lat, LPU_CAMPUS_BOUNDS.northEast.lng)
      );

      const request = {
        query: `${query} Lovely Professional University Phagwara`,
        bounds: lpuBounds,
        location: new window.google.maps.LatLng(LPU_CAMPUS_CENTER.lat, LPU_CAMPUS_CENTER.lng),
        radius: 1800,
      };

      service.textSearch(request, (results: any[], status: any) => {
        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !results ||
          results.length === 0
        ) {
          resolve([]);
          return;
        }

        const parsed: GooglePlaceResult[] = results
          .filter((place) => place.geometry && place.geometry.location)
          .map((place) => {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            let photoUrl: string | undefined = undefined;
            if (place.photos && place.photos.length > 0) {
              try {
                photoUrl = place.photos[0].getUrl({ maxWidth: 500 });
              } catch (e) {
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
              source: 'google_places',
              isCampusLocation: this.isWithinLpuBounds(lat, lng),
            };
          });

        resolve(parsed);
      });
    });
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
    if (!isLoaded || !window.google?.maps?.DirectionsService) {
      return {
        status: 'ERROR',
        pathCoordinates: [],
        distanceMeters: 0,
        durationSeconds: 0,
      };
    }

    const directionsService = new window.google.maps.DirectionsService();

    let travelMode = window.google.maps.TravelMode.WALKING;
    if (mode === 'car') {
      travelMode = window.google.maps.TravelMode.DRIVING;
    } else if (mode === 'bike') {
      travelMode = window.google.maps.TravelMode.BICYCLING;
    } else if (mode === 'wheelchair') {
      // Google Directions API does NOT offer wheelchair pedestrian routing in India.
      // Use WALKING travel mode, and we will attach accessibility notice.
      travelMode = window.google.maps.TravelMode.WALKING;
    }

    return new Promise<GoogleRouteResponse>((resolve) => {
      directionsService.route(
        {
          origin: new window.google.maps.LatLng(origin.lat, origin.lng),
          destination: new window.google.maps.LatLng(destination.lat, destination.lng),
          travelMode: travelMode,
          provideRouteAlternatives: false,
        },
        (result: any, status: any) => {
          if (status === window.google.maps.DirectionsStatus.OK && result?.routes?.[0]) {
            const route = result.routes[0];
            const leg = route.legs?.[0];

            // Extract detailed coordinates along overview path
            const pathCoordinates: Array<{ lat: number; lng: number }> = [];
            if (route.overview_path) {
              for (let i = 0; i < route.overview_path.length; i++) {
                const pt = route.overview_path[i];
                pathCoordinates.push({ lat: pt.lat(), lng: pt.lng() });
              }
            }

            // Extract turn instructions
            const steps = (leg?.steps || []).map((step: any) => {
              // Strip HTML tags from instruction string
              const cleanInstruction = (step.instructions || '')
                .replace(/<[^>]*>?/gm, ' ')
                .replace(/\s+/g, ' ')
                .trim();

              return {
                instruction: cleanInstruction,
                distanceMeters: step.distance?.value || 0,
                durationSeconds: step.duration?.value || 0,
                maneuver: step.maneuver || 'straight',
                startLocation: {
                  lat: step.start_location.lat(),
                  lng: step.start_location.lng(),
                },
                endLocation: {
                  lat: step.end_location.lat(),
                  lng: step.end_location.lng(),
                },
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
          } else if (status === window.google.maps.DirectionsStatus.ZERO_RESULTS) {
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
