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
  isEntrance?: boolean;
  locationId?: string; // ID of CampusLocation if this node is its entrance
  hasStepFreeRamp?: boolean; // Verified step-free ground plinth
  description?: string;
}

export interface CampusGraphEdge {
  id: string;
  from: string;
  to: string;
  distanceMeters: number;
  allowedModes: NavigationMode[]; // ['walking', 'bike', 'car', 'wheelchair']
  pathName: string;
  isWheelchairAccessible: boolean;
  surface: 'paved_asphalt' | 'concrete' | 'paver_blocks';
  isOneWay?: boolean;
  waypoints?: Coordinates[]; // Additional intermediate curve points
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
    mode: NavigationMode
  ): Promise<RoutePlan>;
  generateInstructions(
    pathNodes: CampusGraphNode[],
    edges: CampusGraphEdge[],
    destination: CampusLocation,
    speedMps: number
  ): TurnInstruction[];
}
