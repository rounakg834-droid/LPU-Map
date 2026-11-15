/**
 * TypeScript definitions for Google Maps Platform JavaScript API
 * Tailored for LPU Smart Campus Navigator integration.
 */

export type GoogleMapsStatus = 'unconfigured' | 'loading' | 'ready' | 'error';

export interface GooglePlaceResult {
  placeId: string;
  name: string;
  formattedAddress?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  types?: string[];
  rating?: number;
  userRatingsTotal?: number;
  photoUrl?: string;
  source: 'google_places';
  isCampusLocation?: boolean;
  matchedCampusId?: string;
}

export interface GoogleDirectionsOptions {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  travelMode: 'WALKING' | 'DRIVING' | 'BICYCLING' | 'TRANSIT';
}

export interface GoogleRouteResponse {
  status: 'OK' | 'ZERO_RESULTS' | 'NOT_FOUND' | 'ERROR';
  pathCoordinates: Array<{ lat: number; lng: number }>;
  distanceMeters: number;
  durationSeconds: number;
  summary?: string;
  warnings?: string[];
  legs?: any[];
  steps?: Array<{
    instruction: string;
    distanceMeters: number;
    durationSeconds: number;
    maneuver?: string;
    startLocation: { lat: number; lng: number };
    endLocation: { lat: number; lng: number };
  }>;
}

// Global declaration for window.google
declare global {
  interface Window {
    google?: any;
    initGoogleMapsCallback?: () => void;
    gm_authFailure?: () => void;
  }
}
