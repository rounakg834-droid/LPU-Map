import { Coordinates } from './location';

export type GeoapifyServiceStatus = 'unconfigured' | 'ready' | 'quota_exceeded' | 'error';

export interface GeoapifyPlaceResult {
  placeId: string;
  name: string;
  formattedAddress?: string;
  coordinates: Coordinates;
  categories: string[];
  distanceMeters?: number;
  rawProperties?: Record<string, any>;
}

export interface GeoapifyRoutingStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  coordinates: Coordinates;
}

export interface GeoapifyRouteResult {
  distanceMeters: number;
  durationMinutes: number;
  coordinates: Coordinates[];
  steps: GeoapifyRoutingStep[];
}
