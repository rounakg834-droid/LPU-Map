/**
 * Types representing campus locations and geographic verification states.
 * Adheres to strict verification rules: coordinates are only set when verified
 * against OpenStreetMap and official campus layouts.
 */

export type LocationCategory =
  | 'academic'
  | 'hostel_boys'
  | 'hostel_girls'
  | 'library'
  | 'commercial'
  | 'auditorium_events'
  | 'cafeteria'
  | 'parking'
  | 'gate'
  | 'medical'
  | 'sports'
  | 'administration';

export type VerificationStatus =
  | 'verified_osm'      // Exact coordinates verified via OpenStreetMap node/way
  | 'approximate_osm'   // Approximate campus sector verified via OSM campus zone
  | 'pending_survey';   // University facility verified, GPS marker pending on-ground survey

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface CampusImageMetadata {
  url: string;
  thumbnailUrl?: string;
  caption: string;
  credit: string;
  sourceUrl?: string;
  license: string;
  isVerified: boolean;
  dateSurveyed?: string;
}

export interface CampusLocation {
  id: string;
  name: string;
  shortName?: string;
  category: LocationCategory;
  blockNumber?: string;
  coordinates?: Coordinates;
  verificationStatus: VerificationStatus;
  isVerified: boolean;
  description: string;
  features?: string[];
  source: string;
  imageUrl?: string;
  imageAttribution?: string;
  imageMetadata?: CampusImageMetadata;
  minZoom?: number;
  tags: string[];
  gateAccess?: string;
  accessibilityNotes?: string;
  // Entrance & Verification Metadata
  entranceCoordinates?: Coordinates;
  isEntranceConfirmed?: boolean;
  entranceVerifiedBy?: string;
  entranceVerifiedAt?: string;
  proposedEntrance?: {
    lat: number;
    lng: number;
    sourceNote?: string;
    submittedAt?: string;
    submittedBy?: string;
  };
  // Architectural & Facility Information
  totalFloors?: number;
  hasElevator?: boolean;
  hasRestrooms?: boolean;
  hasWaterDispenser?: boolean;
  departments?: string[];
  selectedClassroom?: import('./classroom').ClassroomInfo;
}

export interface CategoryMetadata {
  id: LocationCategory;
  label: string;
  iconName: string;
  color: string;
  bgColor: string;
}

export interface LocationCorrection {
  locationId: string;
  entranceCoordinates: Coordinates;
  isConfirmed: boolean;
  confirmedAt?: string;
  confirmedBy?: string;
  proposedAt?: string;
  proposedBy?: string;
  notes?: string;
  sourceUrl?: string;
}
