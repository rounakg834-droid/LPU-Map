import { CampusLocation, Coordinates } from './location';

export type NavigationMode = 'walking' | 'bike' | 'car' | 'wheelchair';

export interface GeoPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null; // meters per second
  };
  timestamp: number;
}

export type GeolocationStatus =
  | 'idle'
  | 'prompt'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'weak_signal'
  | 'insecure_context';

export type ManeuverType =
  | 'depart'
  | 'straight'
  | 'slight_left'
  | 'turn_left'
  | 'sharp_left'
  | 'slight_right'
  | 'turn_right'
  | 'sharp_right'
  | 'arrive';

export interface TurnInstruction {
  id: string;
  instruction: string;
  maneuver: ManeuverType;
  distanceMeters: number;
  durationSeconds: number;
  coordinates: Coordinates;
  pathName: string;
}

export interface RoutePlan {
  origin: Coordinates | null;
  destination: CampusLocation;
  mode: NavigationMode;
  status: 'available' | 'calculating' | 'unavailable' | 'error';
  distanceMeters: number;
  estimatedTimeMinutes: number;
  pathCoordinates: Coordinates[];
  instructions: TurnInstruction[];
  isVerifiedRoute: boolean;
  notes?: string;
  accessibilityNotice?: string;
  unreachableReason?: string;
  roadClosureNotice?: string;
}

export interface NavigationModeConfig {
  id: NavigationMode;
  label: string;
  icon: string;
  speedKmh: number;
  description: string;
  requiresVerifiedPavement: boolean;
  allowedOnPedestrianSpine: boolean;
}
