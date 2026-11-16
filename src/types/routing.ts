import { Coordinates, CampusLocation } from './location';
import { NavigationMode, RoutePlan, TurnInstruction } from './navigation';

/**
 * Detailed routing graph specifications for Lovely Professional University.
 * Maps exact footpath segments, campus roads, cycle lanes, intersections, and building entrance nodes.
 */
export interface CampusGraphNode {
  id: string;
  name: string;
  coords: Coordinates;
  nodeType?: 'intersection' | 'entrance' | 'gate' | 'roundabout' | 'waypoint';
  isEntrance?: boolean;
  locationId?: string; // ID of CampusLocation if this node is its entrance
  hasStepFreeRamp?: boolean; // Verified step-free ground plinth
  description?: string;
  isVerified?: boolean;
  verificationSource?: string;
  componentId?: number;
  degree?: number;
}

export interface CampusGraphEdge {
  id: string;
  from: string;
  to: string;
  distanceMeters: number;
  allowedModes: NavigationMode[]; // ['walking', 'bike', 'car', 'wheelchair']
  pathName: string;
  isWheelchairAccessible: boolean;
  surface: 'paved_asphalt' | 'concrete' | 'paver_blocks' | 'gravel' | 'unpaved';
  isOneWay?: boolean;
  waypoints?: Coordinates[]; // Additional intermediate curve/bend points
  geometry?: Coordinates[]; // Full ordered polyline from `from` node to `to` node
  isVerified?: boolean;
  verificationSource?: string;
  isRestrictedVehicle?: boolean;
  maxSpeedKmh?: number;
  category?: string;
  highwayType?: string;
  componentId?: number;
  buildingCollision?: {
    collides: boolean;
    buildingName?: string;
    osmId?: string;
  };
}

export interface CampusRouteGraph {
  nodes: Record<string, CampusGraphNode>;
  edges: CampusGraphEdge[];
  version: string;
}

export interface IRoutingService {
  isGraphLoaded(): boolean;
  calculateRoute(
    origin: Coordinates | null,
    destination: CampusLocation,
    mode: NavigationMode,
    preferEngine?: 'campus' | 'google'
  ): Promise<RoutePlan>;
  generateInstructions(
    pathNodes: CampusGraphNode[],
    edges: CampusGraphEdge[],
    destination: CampusLocation,
    speedMps: number
  ): TurnInstruction[];
}
