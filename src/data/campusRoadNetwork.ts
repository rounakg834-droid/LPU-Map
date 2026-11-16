/**
 * LPU CAMPUS ROAD NETWORK — OFFICIALLY AUDITED & EXTRACTED
 * OpenStreetMap Extracted & Field Survey Verified Routing Dataset
 * Generated: 2026-11-16T07:40:42.333Z
 */

import { Coordinates } from '../types/location';
import { NavigationMode } from '../types/navigation';
import roadNetworkJson from './campusRoadNetwork.json';

export type RoadCategory =
  | 'main_road'
  | 'internal_vehicle'
  | 'service'
  | 'hostel_access'
  | 'pedestrian_walkway'
  | 'footpath'
  | 'cycle_lane';

export type RoadSurface =
  | 'paved_asphalt'
  | 'concrete'
  | 'paver_blocks'
  | 'gravel'
  | 'unpaved';

export type WheelchairRating =
  | 'verified_accessible'
  | 'inaccessible'
  | 'unverified';

export interface CampusRoadNode {
  id: string;
  coords: Coordinates;
  name: string;
  degree: number;
  componentId: number;
  isJunction: boolean;
  isEndpoint: boolean;
  locationId?: string;
  isEntrance?: boolean;
}

export interface CampusRoadSegment {
  id: string;
  wayId: string;
  name: string;
  highwayType: string;
  category: RoadCategory;
  surface: RoadSurface;
  fromNode: string;
  toNode: string;
  distanceMeters: number;
  geometry: Coordinates[];
  isOneWay: boolean;
  allowedModes: NavigationMode[];
  wheelchairStatus: WheelchairRating;
  speedLimitKmh: number;
  source: 'osm' | 'survey' | 'user_reported';
  isVerified: boolean;
  verificationSource?: string;
  buildingCollision?: {
    collides: boolean;
    buildingName?: string;
    osmId?: string;
  };
  componentId: number;
}

export interface CampusRoadNetworkData {
  version: string;
  auditDate: string;
  summary: {
    totalWays: number;
    totalSegments: number;
    totalNodes: number;
    totalLengthKm: number;
    componentCount: number;
    mainComponentSize: number;
    collisionsDetected: number;
  };
  nodes: Record<string, CampusRoadNode>;
  segments: CampusRoadSegment[];
}

export const CAMPUS_ROAD_NETWORK: CampusRoadNetworkData = roadNetworkJson as CampusRoadNetworkData;
