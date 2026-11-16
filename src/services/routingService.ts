import { CampusLocation, Coordinates } from '../types/location';
import {
  NavigationMode,
  NavigationModeConfig,
  RoutePlan,
  TurnInstruction,
  ManeuverType,
} from '../types/navigation';
import { CampusGraphNode, CampusGraphEdge, IRoutingService } from '../types/routing';
import { roadNetworkService } from './roadNetworkService';
import { roadClosureService } from './roadClosureService';
import { routeQualityService } from './routeQualityService';
import { googleMapsService } from './googleMapsService';
import { geoapifyService } from './geoapifyService';

function mapGoogleManeuver(gManeuver?: string): ManeuverType {
  if (!gManeuver) return 'straight';
  const m = gManeuver.toLowerCase();
  if (m.includes('sharp-left') || m.includes('sharp_left')) return 'sharp_left';
  if (m.includes('sharp-right') || m.includes('sharp_right')) return 'sharp_right';
  if (m.includes('turn-left') || m.includes('turn_left')) return 'turn_left';
  if (m.includes('turn-right') || m.includes('turn_right')) return 'turn_right';
  if (m.includes('slight-left') || m.includes('slight_left')) return 'slight_left';
  if (m.includes('slight-right') || m.includes('slight_right')) return 'slight_right';
  if (m.includes('straight')) return 'straight';
  if (m.includes('depart')) return 'depart';
  return 'straight';
}

export const NAVIGATION_MODES: NavigationModeConfig[] = [
  {
    id: 'walking',
    label: 'Walk',
    icon: 'Footprints',
    speedKmh: 4.5, // ~1.25 m/s
    description: 'Pedestrian avenues, shaded tree walkways & building corridors.',
    requiresVerifiedPavement: false,
    allowedOnPedestrianSpine: true,
  },
  {
    id: 'bike',
    label: 'Bike',
    icon: 'Bike',
    speedKmh: 14.0, // ~3.89 m/s
    description: 'Campus ring road, student cycle bays & peripheral paved lanes.',
    requiresVerifiedPavement: false,
    allowedOnPedestrianSpine: true,
  },
  {
    id: 'car',
    label: 'Drive',
    icon: 'Car',
    speedKmh: 20.0, // ~5.56 m/s
    description: 'Designated campus vehicular roads, Gate 1 loop & parking bays.',
    requiresVerifiedPavement: false,
    allowedOnPedestrianSpine: false,
  },
  {
    id: 'wheelchair',
    label: 'Accessible',
    icon: 'Accessibility',
    speedKmh: 3.5, // ~0.97 m/s
    description: 'Strict step-free routes, ground ramps & elevator plinths.',
    requiresVerifiedPavement: true,
    allowedOnPedestrianSpine: true,
  },
];

export class RoutingService implements IRoutingService {
  private graph = roadNetworkService.buildRoutingGraph();
  private edgeMap: Map<string, CampusGraphEdge[]> = new Map();

  constructor() {
    this.rebuildEdgeIndex();
  }

  public rebuildEdgeIndex(): void {
    this.edgeMap.clear();
    for (const edge of this.graph.edges) {
      if (!this.edgeMap.has(edge.from)) {
        this.edgeMap.set(edge.from, []);
      }
      this.edgeMap.get(edge.from)!.push(edge);
    }
  }

  public refreshGraph(): void {
    this.graph = roadNetworkService.buildRoutingGraph();
    this.rebuildEdgeIndex();
  }

  public isGraphLoaded(): boolean {
    return Object.keys(this.graph.nodes).length > 0 && this.graph.edges.length > 0;
  }

  /**
   * Checks whether coordinates fall within verified LPU campus boundaries
   */
  public isWithinCampus(coords: Coordinates): boolean {
    return (
      coords.lat >= 31.2460 &&
      coords.lat <= 31.2650 &&
      coords.lng >= 75.6940 &&
      coords.lng <= 75.7170
    );
  }

  /**
   * Minimum distance from a coordinate to a route polyline in meters
   */
  public getDistanceFromRoute(coords: Coordinates, polyline: Coordinates[]): number {
    if (polyline.length === 0) return Infinity;
    let minDistance = Infinity;

    for (let i = 0; i < polyline.length; i++) {
      const d = this.calculateStraightLineMeters(coords, polyline[i]);
      if (d < minDistance) {
        minDistance = d;
      }
    }
    return minDistance;
  }

  /**
   * Accurate remaining distance calculation along the actual path geometry
   */
  public calculateRemainingDistance(
    currentCoords: Coordinates | null,
    plan: RoutePlan,
    currentStepIndex: number
  ): number {
    if (!plan || plan.instructions.length === 0) return 0;
    const instructions = plan.instructions;

    // Sum all step distances from next step to end
    let remaining = 0;
    for (let i = currentStepIndex + 1; i < instructions.length; i++) {
      remaining += instructions[i].distanceMeters;
    }

    // Add distance from user's current GPS position to the next waypoint
    if (currentCoords && currentStepIndex < instructions.length - 1) {
      const nextWaypoint = instructions[currentStepIndex + 1].coordinates;
      remaining += this.calculateStraightLineMeters(currentCoords, nextWaypoint);
    } else if (currentStepIndex < instructions.length) {
      remaining += instructions[currentStepIndex].distanceMeters;
    }

    return Math.max(0, Math.round(remaining));
  }

  /**
   * Exact straight-line geographic distance in meters using Haversine formula
   */
  public calculateStraightLineMeters(from: Coordinates, to: Coordinates): number {
    const R = 6371e3;
    const phi1 = (from.lat * Math.PI) / 180;
    const phi2 = (to.lat * Math.PI) / 180;
    const deltaPhi = ((to.lat - from.lat) * Math.PI) / 180;
    const deltaLambda = ((to.lng - from.lng) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  /**
   * Forward bearing in degrees (0 to 360) between two geographic coordinates
   */
  public getBearing(from: Coordinates, to: Coordinates): number {
    const lat1 = (from.lat * Math.PI) / 180;
    const lat2 = (to.lat * Math.PI) / 180;
    const dLng = ((to.lng - from.lng) * Math.PI) / 180;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return (Math.round((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360;
  }

  /**
   * Project a GPS coordinate onto a polyline segment segA -> segB
   */
  public getClosestPointOnSegment(
    point: Coordinates,
    segA: Coordinates,
    segB: Coordinates
  ): { point: Coordinates; distanceMeters: number; fraction: number } {
    const cosLat = Math.cos((((segA.lat + segB.lat) / 2) * Math.PI) / 180);
    const dx = (segB.lng - segA.lng) * cosLat;
    const dy = segB.lat - segA.lat;
    const segLenSq = dx * dx + dy * dy;

    if (segLenSq < 1e-12) {
      return {
        point: segA,
        distanceMeters: this.calculateStraightLineMeters(point, segA),
        fraction: 0,
      };
    }

    const px = (point.lng - segA.lng) * cosLat;
    const py = point.lat - segA.lat;
    const t = Math.max(0, Math.min(1, (px * dx + py * dy) / segLenSq));

    const closestPoint: Coordinates = {
      lat: Number((segA.lat + t * (segB.lat - segA.lat)).toFixed(7)),
      lng: Number((segA.lng + t * (segB.lng - segA.lng)).toFixed(7)),
    };

    return {
      point: closestPoint,
      distanceMeters: this.calculateStraightLineMeters(point, closestPoint),
      fraction: t,
    };
  }

  /**
   * Snaps GPS position onto active route polyline within maxSnapMeters.
   * Computes the forward segment bearing and perpendicular deviation.
   */
  public snapPointToPolyline(
    point: Coordinates,
    polyline: Coordinates[],
    maxSnapMeters = 35
  ): {
    snappedPoint: Coordinates;
    segmentIndex: number;
    distanceToRoute: number;
    isOffRoute: boolean;
    fraction: number;
    bearing: number;
  } {
    if (polyline.length === 0) {
      return {
        snappedPoint: point,
        segmentIndex: 0,
        distanceToRoute: 0,
        isOffRoute: false,
        fraction: 0,
        bearing: 0,
      };
    }
    if (polyline.length === 1) {
      const dist = this.calculateStraightLineMeters(point, polyline[0]);
      return {
        snappedPoint: polyline[0],
        segmentIndex: 0,
        distanceToRoute: dist,
        isOffRoute: dist > maxSnapMeters,
        fraction: 0,
        bearing: 0,
      };
    }

    let minDistance = Infinity;
    let bestSnapped = polyline[0];
    let bestSegment = 0;
    let bestFraction = 0;

    for (let i = 0; i < polyline.length - 1; i++) {
      const segA = polyline[i];
      const segB = polyline[i + 1];
      const { point: proj, distanceMeters, fraction } = this.getClosestPointOnSegment(point, segA, segB);
      if (distanceMeters < minDistance) {
        minDistance = distanceMeters;
        bestSnapped = proj;
        bestSegment = i;
        bestFraction = fraction;
      }
    }

    const nextIndex = Math.min(bestSegment + 1, polyline.length - 1);
    const bearing = this.getBearing(polyline[bestSegment], polyline[nextIndex]);

    return {
      snappedPoint: bestSnapped,
      segmentIndex: bestSegment,
      distanceToRoute: Math.round(minDistance),
      isOffRoute: minDistance > maxSnapMeters,
      fraction: bestFraction,
      bearing,
    };
  }

  /**
   * Accurate remaining distance along polyline geometry from current user position,
   * split into traveled and remaining route coordinates for Google Maps styling.
   */
  public calculateRemainingDistanceAlongRoute(
    currentCoords: Coordinates | null,
    plan: RoutePlan
  ): {
    remainingMeters: number;
    snappedCoords: Coordinates | null;
    isOffRoute: boolean;
    traveledCoords: Coordinates[];
    remainingCoords: Coordinates[];
    nextStepIndex: number;
    distanceToNextManeuver: number;
    roadBearing: number;
  } {
    if (!plan || plan.pathCoordinates.length < 2) {
      return {
        remainingMeters: 0,
        snappedCoords: currentCoords,
        isOffRoute: false,
        traveledCoords: [],
        remainingCoords: plan?.pathCoordinates || [],
        nextStepIndex: 0,
        distanceToNextManeuver: 0,
        roadBearing: 0,
      };
    }

    const polyline = plan.pathCoordinates;

    if (!currentCoords) {
      const initialBearing = this.getBearing(polyline[0], polyline[1]);
      return {
        remainingMeters: plan.distanceMeters,
        snappedCoords: polyline[0],
        isOffRoute: false,
        traveledCoords: [],
        remainingCoords: polyline,
        nextStepIndex: 0,
        distanceToNextManeuver: plan.instructions[0]?.distanceMeters || 0,
        roadBearing: initialBearing,
      };
    }

    const snap = this.snapPointToPolyline(currentCoords, polyline, 35);
    const segIdx = snap.segmentIndex;
    const snapped = snap.snappedPoint;

    // Remaining distance along polyline from snapped point to destination
    let remaining = this.calculateStraightLineMeters(snapped, polyline[segIdx + 1]);
    for (let i = segIdx + 1; i < polyline.length - 1; i++) {
      remaining += this.calculateStraightLineMeters(polyline[i], polyline[i + 1]);
    }

    // Traveled vs Remaining Coordinates
    const traveled: Coordinates[] = [...polyline.slice(0, segIdx + 1), snapped];
    const remainingLine: Coordinates[] = [snapped, ...polyline.slice(segIdx + 1)];

    // Dynamically advance maneuver instruction based on proximity to turn waypoints
    let activeStepIdx = 0;
    for (let j = 0; j < plan.instructions.length; j++) {
      const inst = plan.instructions[j];
      const distToInst = this.calculateStraightLineMeters(snapped, inst.coordinates);
      if (distToInst < 18 && j < plan.instructions.length - 1) {
        activeStepIdx = j + 1;
        break;
      } else if (distToInst < 40) {
        activeStepIdx = j;
      }
    }

    const nextInst = plan.instructions[activeStepIdx];
    const distanceToNext = nextInst
      ? this.calculateStraightLineMeters(snapped, nextInst.coordinates)
      : 0;

    return {
      remainingMeters: Math.max(0, Math.round(remaining)),
      snappedCoords: snapped,
      isOffRoute: snap.isOffRoute,
      traveledCoords: traveled,
      remainingCoords: remainingLine,
      nextStepIndex: activeStepIdx,
      distanceToNextManeuver: Math.round(distanceToNext),
      roadBearing: snap.bearing,
    };
  }

  /**
   * Find closest graph node to a geographic coordinate
   */
  public findNearestNode(
    coords: Coordinates,
    filterMode?: NavigationMode
  ): CampusGraphNode | null {
    let bestNode: CampusGraphNode | null = null;
    let minDistance = Infinity;

    for (const node of Object.values(this.graph.nodes)) {
      // If mode is wheelchair, prefer nodes with verified step-free ramp access
      if (filterMode === 'wheelchair' && node.isEntrance && !node.hasStepFreeRamp) {
        continue;
      }

      const dist = this.calculateStraightLineMeters(coords, node.coords);
      if (dist < minDistance) {
        minDistance = dist;
        bestNode = node;
      }
    }

    return bestNode;
  }

  /**
   * Snaps a geographic coordinate to the nearest walkable road or footpath segment
   * using point-to-segment orthogonal projection rather than just selecting nearest graph node.
   */
  public snapPointToWalkableNetwork(
    coords: Coordinates,
    mode: NavigationMode = 'walking',
    maxSnapRadiusMeters = 150
  ): {
    snappedPoint: Coordinates;
    nearestNode: CampusGraphNode;
    edge: CampusGraphEdge;
    distanceMeters: number;
    segmentIndex: number;
    fraction: number;
  } | null {
    let bestMatch: {
      snappedPoint: Coordinates;
      nearestNode: CampusGraphNode;
      edge: CampusGraphEdge;
      distanceMeters: number;
      segmentIndex: number;
      fraction: number;
    } | null = null;
    let minDistance = Infinity;

    const nodes = this.graph.nodes;

    for (const edge of this.graph.edges) {
      if (!edge.allowedModes.includes(mode)) continue;

      const polyline =
        edge.geometry && edge.geometry.length >= 2
          ? edge.geometry
          : ([nodes[edge.from]?.coords, ...(edge.waypoints || []), nodes[edge.to]?.coords].filter(Boolean) as Coordinates[]);

      if (polyline.length < 2) continue;

      for (let i = 0; i < polyline.length - 1; i++) {
        const segA = polyline[i];
        const segB = polyline[i + 1];
        const { point: proj, distanceMeters, fraction } = this.getClosestPointOnSegment(coords, segA, segB);

        if (distanceMeters < minDistance) {
          minDistance = distanceMeters;
          const fromNode = nodes[edge.from];
          const toNode = nodes[edge.to];
          const distToFrom = fromNode ? this.calculateStraightLineMeters(proj, fromNode.coords) : Infinity;
          const distToTo = toNode ? this.calculateStraightLineMeters(proj, toNode.coords) : Infinity;
          const chosenNode = distToTo < distToFrom ? toNode : fromNode;

          if (chosenNode) {
            bestMatch = {
              snappedPoint: proj,
              nearestNode: chosenNode,
              edge,
              distanceMeters: Math.round(distanceMeters),
              segmentIndex: i,
              fraction,
            };
          }
        }
      }
    }

    if (bestMatch && bestMatch.distanceMeters <= maxSnapRadiusMeters) {
      return bestMatch;
    }

    return null;
  }

  /**
   * Find specific entrance node for a campus location
   */
  public findNodeForLocation(location: CampusLocation): CampusGraphNode | null {
    // 1. Exact match by locationId
    for (const node of Object.values(this.graph.nodes)) {
      if (node.locationId === location.id) {
        return node;
      }
    }

    // 2. Exact match using entrance coordinates if present
    if (location.entranceCoordinates) {
      const nearest = this.findNearestNode(location.entranceCoordinates);
      if (nearest) return nearest;
    }

    // 3. Geographic nearest match if centroid coordinates exist
    if (location.coordinates) {
      return this.findNearestNode(location.coordinates);
    }

    return null;
  }

  /**
   * High-Performance A* Shortest Path Engine with Transit Profile Enforcement & Road Closures
   */
  public findShortestPath(
    startNodeId: string,
    endNodeId: string,
    mode: NavigationMode,
    penalizedEdgeIds?: Set<string>
  ): { path: CampusGraphNode[]; edges: CampusGraphEdge[]; distance: number; closuresAvoided?: string[] } | null {
    const nodes = this.graph.nodes;
    if (!nodes[startNodeId] || !nodes[endNodeId]) return null;

    const activeClosures = roadClosureService.getActiveClosures();
    const endCoords = nodes[endNodeId].coords;

    type PrevEntry = { nodeId: string; edge: CampusGraphEdge } | null;
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();
    const previous = new Map<string, PrevEntry>();
    const openSet = new Set<string>([startNodeId]);
    const closedSet = new Set<string>();

    gScore.set(startNodeId, 0);
    fScore.set(startNodeId, this.calculateStraightLineMeters(nodes[startNodeId].coords, endCoords));

    while (openSet.size > 0) {
      // Find node in openSet with lowest fScore
      let currentId: string | null = null;
      let minF = Infinity;

      for (const id of openSet) {
        const f = fScore.get(id) ?? Infinity;
        if (f < minF) {
          minF = f;
          currentId = id;
        }
      }

      if (!currentId || minF === Infinity) {
        break; // Remaining unreachable
      }

      if (currentId === endNodeId) {
        // Goal reached: reconstruct path
        const pathNodes: CampusGraphNode[] = [];
        const pathEdges: CampusGraphEdge[] = [];
        let curr: string | null = endNodeId;
        let realDistance = 0;

        while (curr && curr !== startNodeId) {
          const entry = previous.get(curr);
          if (!entry) break;
          pathNodes.unshift(nodes[curr]);
          pathEdges.unshift(entry.edge);
          realDistance += entry.edge.distanceMeters;
          curr = entry.nodeId;
        }
        pathNodes.unshift(nodes[startNodeId]);

        const closuresAvoided = activeClosures.map((c) => c.title);
        return {
          path: pathNodes,
          edges: pathEdges,
          distance: realDistance > 0 ? realDistance : Math.round(gScore.get(endNodeId) ?? 0),
          closuresAvoided: activeClosures.length > 0 ? closuresAvoided : undefined,
        };
      }

      openSet.delete(currentId);
      closedSet.add(currentId);

      // Fast O(1) lookup of outgoing edges
      const outgoingEdges = this.edgeMap.get(currentId) || [];

      for (const edge of outgoingEdges) {
        if (closedSet.has(edge.to)) continue;

        // Mode constraint checks
        if (!edge.allowedModes.includes(mode)) continue;

        if (mode === 'wheelchair') {
          // Strict requirement: Never classify unknown wheelchair accessibility as confirmed safe
          if (!edge.isWheelchairAccessible) continue;
          if (edge.surface === 'gravel' || edge.surface === 'unpaved') continue;
          if (edge.highwayType === 'steps') continue;
        }

        if (mode === 'car') {
          // Car barred from pedestrian-only paths and steps
          if (edge.category === 'pedestrian_walkway' || edge.category === 'footpath' || edge.highwayType === 'steps') {
            continue;
          }
          if (edge.isRestrictedVehicle) continue;
        }

        if (mode === 'bike') {
          // Bike barred from steps
          if (edge.highwayType === 'steps') continue;
        }

        // Road closure check
        const isClosed = activeClosures.some(
          (c) =>
            (c.edgeId && c.edgeId === edge.id) ||
            (c.nodeA === edge.from && c.nodeB === edge.to) ||
            (c.nodeA === edge.to && c.nodeB === edge.from)
        );
        if (isClosed) continue;

        // Calculate traversal cost with building collision and alternative penalties
        let edgeWeight = edge.distanceMeters;
        if (edge.buildingCollision?.collides) {
          edgeWeight += 10000; // Heavily penalize segments crossing building footprints to prefer safe perimeter paths
        }
        if (penalizedEdgeIds && (penalizedEdgeIds.has(edge.id) || penalizedEdgeIds.has(edge.id.replace(/_(fwd|rev)$/, '')))) {
          edgeWeight *= 2.5; // Alternative route penalty
        }

        const tentativeG = (gScore.get(currentId) ?? Infinity) + edgeWeight;
        const currentNeighborG = gScore.get(edge.to) ?? Infinity;

        if (tentativeG < currentNeighborG) {
          previous.set(edge.to, { nodeId: currentId, edge });
          gScore.set(edge.to, tentativeG);

          const h = this.calculateStraightLineMeters(nodes[edge.to].coords, endCoords);
          fScore.set(edge.to, tentativeG + h);

          openSet.add(edge.to);
        }
      }
    }

    return null;
  }

  /**
   * Calculate alternative route by penalizing edges of the primary route
   */
  public findAlternativePath(
    startNodeId: string,
    endNodeId: string,
    mode: NavigationMode,
    primaryEdges: CampusGraphEdge[]
  ): { path: CampusGraphNode[]; edges: CampusGraphEdge[]; distance: number } | null {
    if (primaryEdges.length < 2) return null;

    const penalizedEdgeIds = new Set<string>();
    for (const e of primaryEdges) {
      penalizedEdgeIds.add(e.id);
      penalizedEdgeIds.add(e.id.replace(/_(fwd|rev)$/, ''));
    }

    const altResult = this.findShortestPath(startNodeId, endNodeId, mode, penalizedEdgeIds);
    if (!altResult) return null;

    // Check if alternative route is genuinely distinct (> 25% different edges)
    let overlapCount = 0;
    for (const e of altResult.edges) {
      if (penalizedEdgeIds.has(e.id)) overlapCount++;
    }

    const overlapRatio = overlapCount / (altResult.edges.length || 1);
    if (overlapRatio > 0.75) {
      return null; // Not distinct enough
    }

    return altResult;
  }

  /**
   * Generate turn-by-turn instructions based on angles and pathnames
   */
  public generateInstructions(
    pathNodes: CampusGraphNode[],
    edges: CampusGraphEdge[],
    destination: CampusLocation,
    speedMps: number
  ): TurnInstruction[] {
    if (pathNodes.length < 2) {
      return [
        {
          id: 'inst_0',
          instruction: `Arrive at ${destination.name}`,
          maneuver: 'arrive',
          distanceMeters: 0,
          durationSeconds: 0,
          coordinates: destination.coordinates || pathNodes[0].coords,
          pathName: 'Destination Entrance',
        },
      ];
    }

    const instructions: TurnInstruction[] = [];

    // Helper to calculate bearing between two coordinates (0 to 360)
    const getBearing = (c1: Coordinates, c2: Coordinates) => {
      const lat1 = (c1.lat * Math.PI) / 180;
      const lat2 = (c2.lat * Math.PI) / 180;
      const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
      const y = Math.sin(dLng) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
      return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
    };

    // First instruction: Depart
    const firstEdge = edges[0];
    const initialHeading = getBearing(pathNodes[0].coords, pathNodes[1].coords);
    const cardinal = this.getCardinalDirection(initialHeading);

    instructions.push({
      id: `inst_0`,
      instruction: `Head ${cardinal} on ${firstEdge?.pathName || 'Campus Pathway'}`,
      maneuver: 'depart',
      distanceMeters: firstEdge?.distanceMeters || 20,
      durationSeconds: Math.round((firstEdge?.distanceMeters || 20) / speedMps),
      coordinates: pathNodes[0].coords,
      pathName: firstEdge?.pathName || 'Campus Pathway',
    });

    // Intermediate turn instructions
    for (let i = 1; i < pathNodes.length - 1; i++) {
      const prevNode = pathNodes[i - 1];
      const currNode = pathNodes[i];
      const nextNode = pathNodes[i + 1];
      const nextEdge = edges[i];

      const b1 = getBearing(prevNode.coords, currNode.coords);
      const b2 = getBearing(currNode.coords, nextNode.coords);

      let delta = b2 - b1;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      let maneuver: ManeuverType = 'straight';
      let actionText = 'Continue straight onto';

      if (delta > 20 && delta <= 60) {
        maneuver = 'slight_right';
        actionText = 'Slight right onto';
      } else if (delta > 60 && delta <= 125) {
        maneuver = 'turn_right';
        actionText = 'Turn right onto';
      } else if (delta > 125) {
        maneuver = 'sharp_right';
        actionText = 'Sharp right onto';
      } else if (delta < -20 && delta >= -60) {
        maneuver = 'slight_left';
        actionText = 'Slight left onto';
      } else if (delta < -60 && delta >= -125) {
        maneuver = 'turn_left';
        actionText = 'Turn left onto';
      } else if (delta < -125) {
        maneuver = 'sharp_left';
        actionText = 'Sharp left onto';
      }

      // Only generate instruction if there is a turn or street name change
      const prevEdge = edges[i - 1];
      if (maneuver !== 'straight' || (nextEdge && prevEdge && nextEdge.pathName !== prevEdge.pathName)) {
        instructions.push({
          id: `inst_${i}`,
          instruction: `${actionText} ${nextEdge?.pathName || currNode.name}`,
          maneuver,
          distanceMeters: nextEdge?.distanceMeters || 30,
          durationSeconds: Math.round((nextEdge?.distanceMeters || 30) / speedMps),
          coordinates: currNode.coords,
          pathName: nextEdge?.pathName || currNode.name,
        });
      }
    }

    // Final arrival instruction
    const lastNode = pathNodes[pathNodes.length - 1];
    const finalCoord = destination.entranceCoordinates || destination.coordinates || lastNode.coords;
    const finalName = destination.entranceCoordinates ? `${destination.shortName || destination.name} Entrance` : (destination.shortName || destination.name);

    instructions.push({
      id: `inst_${pathNodes.length}`,
      instruction: `Arrive at ${finalName}`,
      maneuver: 'arrive',
      distanceMeters: 0,
      durationSeconds: 0,
      coordinates: finalCoord,
      pathName: finalName,
    });

    return instructions;
  }

  private getCardinalDirection(bearing: number): string {
    if (bearing >= 337.5 || bearing < 22.5) return 'north';
    if (bearing >= 22.5 && bearing < 67.5) return 'northeast';
    if (bearing >= 67.5 && bearing < 112.5) return 'east';
    if (bearing >= 112.5 && bearing < 157.5) return 'southeast';
    if (bearing >= 157.5 && bearing < 202.5) return 'south';
    if (bearing >= 202.5 && bearing < 247.5) return 'southwest';
    if (bearing >= 247.5 && bearing < 292.5) return 'west';
    return 'northwest';
  }

  /**
   * Main Route Calculation API (Supports Campus Dijkstra Graph & Google Directions Engine)
   */
  public async calculateRoute(
    origin: Coordinates | null,
    destination: CampusLocation,
    mode: NavigationMode,
    preferEngine?: 'campus' | 'google'
  ): Promise<RoutePlan> {
    if (!destination.coordinates) {
      return {
        origin,
        destination,
        mode,
        status: 'error',
        distanceMeters: 0,
        estimatedTimeMinutes: 0,
        pathCoordinates: [],
        instructions: [],
        isVerifiedRoute: false,
        unreachableReason: `${destination.name} has coordinates pending on-ground physical GPS survey.`,
      };
    }

    // 0. Immediate Arrival Check (Fixes BH-1 794m bug when standing at gate)
    const targetCoord = destination.entranceCoordinates || destination.coordinates;
    if (origin && targetCoord) {
      const directDist = this.calculateStraightLineMeters(origin, targetCoord);
      if (directDist <= 35) {
        return {
          origin,
          destination,
          mode,
          status: 'available',
          distanceMeters: 0,
          estimatedTimeMinutes: 0,
          pathCoordinates: [origin, targetCoord],
          instructions: [
            {
              id: 'inst_arrived_now',
              instruction: `You have arrived at ${destination.shortName || destination.name}!`,
              maneuver: 'arrive',
              distanceMeters: 0,
              durationSeconds: 0,
              coordinates: targetCoord,
              pathName: `${destination.shortName || destination.name} Entrance`,
            },
          ],
          isVerifiedRoute: true,
          notes: 'You are already at this destination entrance.',
          isAlreadyAtDestination: true,
        };
      }
    }

    // Prefer Google Directions if selected and Google Maps is configured
    if (preferEngine === 'google' && googleMapsService.isConfigured()) {
      const googlePlan = await this.calculateGoogleRoute(origin, destination, mode);
      if (googlePlan) return googlePlan;
    }

    // 1. Primary Routing Engine: Verified Campus Routing Graph
    const campusPlan = await this.calculateCampusGraphRoute(origin, destination, mode);
    if (campusPlan.status === 'available') {
      return campusPlan;
    }

    // If destination is one of the candidate locations awaiting entrance verification,
    // we strictly preserve the verified unavailable status and reason (no artificial shortcut).
    if (
      destination.id === 'baldevraj-mittal-auditorium' ||
      destination.id === 'uni-health-center' ||
      (destination.id === 'building-41' && !destination.isEntranceConfirmed)
    ) {
      return campusPlan;
    }

    // 2. Secondary Optional Fallback: Geoapify Routing API (for public walking / cycling / driving)
    if (origin && destination.coordinates && geoapifyService.isConfigured()) {
      try {
        const destCoord = destination.entranceCoordinates || destination.coordinates;
        const geoapifyResult = await geoapifyService.calculateRoute(origin, destCoord, mode);
        if (geoapifyResult && geoapifyResult.coordinates.length > 1) {
          const instructions: TurnInstruction[] = geoapifyResult.steps.map((st, i) => ({
            id: `inst_geoapify_${i}`,
            instruction: st.instruction,
            maneuver: (i === geoapifyResult.steps.length - 1 ? 'arrive' : 'turn_right') as ManeuverType,
            distanceMeters: st.distanceMeters,
            durationSeconds: st.durationSeconds,
            coordinates: st.coordinates,
            pathName: 'Public Road Pathway',
          }));

          return {
            origin,
            destination,
            mode,
            status: 'available',
            distanceMeters: geoapifyResult.distanceMeters,
            estimatedTimeMinutes: geoapifyResult.durationMinutes,
            pathCoordinates: geoapifyResult.coordinates,
            instructions,
            isVerifiedRoute: false,
            notes: 'Route calculated via Geoapify Public Road Routing API. Internal campus path survey pending.',
          };
        }
      } catch (err) {
        console.warn('Geoapify route fallback failed gracefully:', err);
      }
    }

    // 3. Fallback to campus plan explanation (never drawing fake shortcuts)
    return campusPlan;
  }

  /**
   * Calculate route via official Google Routes / Directions API with safe campus fallbacks
   */
  public async calculateGoogleRoute(
    origin: Coordinates | null,
    destination: CampusLocation,
    mode: NavigationMode
  ): Promise<RoutePlan | null> {
    if (!destination.coordinates) return null;

    // Wheelchair accessibility constraint:
    // Google Directions API does NOT offer wheelchair pedestrian routing in India.
    // Do not falsely mark unsupported wheelchair routes as accessible.
    if (mode === 'wheelchair') {
      const campusPlan = await this.calculateCampusGraphRoute(origin, destination, mode);
      if (campusPlan.status === 'available') {
        campusPlan.notes =
          'Routing via Verified Campus Step-Free Network. (Google Maps lacks verified wheelchair pedestrian ramp data inside LPU).';
        campusPlan.accessibilityNotice =
          'Step-free route verified along campus ramps and level boulevards.';
      }
      return campusPlan;
    }

    const targetCoord = destination.entranceCoordinates || destination.coordinates;
    const isFallbackOrigin = !origin;
    let effectiveOrigin: Coordinates = origin || {
      lat: 31.25230,
      lng: 75.70220,
    };

    if (origin && !this.isWithinCampus(origin)) {
      effectiveOrigin = {
        lat: 31.25230,
        lng: 75.70220,
      };
    }

    try {
      const gResult = await googleMapsService.calculateDirections(
        effectiveOrigin,
        targetCoord,
        mode
      );

      if (gResult.status === 'OK' && gResult.pathCoordinates.length >= 2) {
        // Build TurnInstruction list
        const instructions: TurnInstruction[] = (gResult.steps || []).map((step, idx) => ({
          id: `g_inst_${idx}`,
          instruction: step.instruction,
          maneuver: mapGoogleManeuver(step.maneuver),
          distanceMeters: step.distanceMeters,
          durationSeconds: step.durationSeconds,
          coordinates: step.startLocation,
          pathName: step.instruction,
        }));

        // Final arrival instruction
        const finalName = destination.entranceCoordinates
          ? `${destination.shortName || destination.name} Entrance`
          : (destination.shortName || destination.name);

        instructions.push({
          id: `g_inst_arrival`,
          instruction: `Arrive at ${finalName}`,
          maneuver: 'arrive',
          distanceMeters: 0,
          durationSeconds: 0,
          coordinates: targetCoord,
          pathName: finalName,
        });

        const estimatedMinutes = Math.max(1, Math.round(gResult.durationSeconds / 60));

        return {
          origin: effectiveOrigin,
          destination,
          mode,
          status: 'available',
          distanceMeters: gResult.distanceMeters,
          estimatedTimeMinutes: estimatedMinutes,
          pathCoordinates: gResult.pathCoordinates,
          instructions,
          isVerifiedRoute: true,
          notes: `Route calculated via Google Maps Routes API (${gResult.summary || 'Official Roads & Pathways'}).`,
          isFallbackOrigin,
        };
      }
    } catch (e) {
      console.warn('Google Directions failed, falling back to verified campus graph:', e);
    }

    // If Google Directions returns ZERO_RESULTS (e.g. private internal pedestrian path unmapped by Google)
    // or fails: transparently fall back to verified campus graph!
    const campusPlan = await this.calculateCampusGraphRoute(origin, destination, mode);
    if (campusPlan.status === 'available') {
      campusPlan.notes = `${campusPlan.notes || ''} (Google Maps lacks coverage for this internal campus corridor; route seamlessly resolved via verified campus network).`.trim();
    }
    return campusPlan;
  }

  /**
   * Calculate route using the authoritative campus road and pathway graph
   */
  public async calculateCampusGraphRoute(
    origin: Coordinates | null,
    destination: CampusLocation,
    mode: NavigationMode
  ): Promise<RoutePlan> {
    const isFallbackOrigin = !origin;

    // If no origin GPS is provided or user is off campus, snap origin to Main Gate 1
    let effectiveOrigin: Coordinates = origin || {
      lat: 31.25230,
      lng: 75.70220,
    };
    let offCampusNotice: string | undefined;

    if (origin && !this.isWithinCampus(origin)) {
      effectiveOrigin = {
        lat: 31.25230,
        lng: 75.70220,
      };
      offCampusNotice =
        'You are currently outside LPU campus grounds. Route origin snapped to Main Gate 1 (NH-44 entrance).';
    }

    // Snap origin to nearest walkable road segment using point-to-segment orthogonal projection
    const snappedOrigin = this.snapPointToWalkableNetwork(effectiveOrigin, mode);
    const startNode = snappedOrigin ? snappedOrigin.nearestNode : this.findNearestNode(effectiveOrigin, mode);
    const destNode = this.findNodeForLocation(destination);

    if (!destNode || !startNode) {
      return {
        origin: effectiveOrigin,
        destination,
        mode,
        status: 'error',
        distanceMeters: 0,
        estimatedTimeMinutes: 0,
        pathCoordinates: [],
        instructions: [],
        isVerifiedRoute: false,
        unreachableReason: 'Campus routing node could not be resolved for this location.',
      };
    }

    // Real connectivity validation for LPU Main Gate candidate (user-confirmed coordinates):
    // Main Gate is connected to the campus network via the gateway boulevard (Way 1116524609 & Way 354744722).
    // Ensure both endpoints exist in the routing graph; fake shortcuts or crossing NH-44 are strictly prohibited.
    if (destination.id === 'lpu-main-gate') {
      if (!destNode || destNode.componentId !== 1) {
        return {
          origin: effectiveOrigin,
          destination,
          mode,
          status: 'unavailable',
          distanceMeters: 0,
          estimatedTimeMinutes: 0,
          pathCoordinates: [],
          instructions: [],
          isVerifiedRoute: false,
          unreachableReason:
            'Verified route unavailable: Road connectivity for the user-confirmed LPU Main Gate candidate (31.260692, 75.706754) is pending physical ground verification. Fake shortcuts are not simulated.',
        };
      }
    }

    // Specific road connectivity guard for Sh. Baldevraj Mittal Auditorium:
    // (Coordinates: 31.258514, 75.707878)
    // Physical entrance awaiting separate verification. Automatic walking connection is barred.
    const isOriginAuditorium =
      Math.abs(effectiveOrigin.lat - 31.258513739139417) < 0.00005 &&
      Math.abs(effectiveOrigin.lng - 75.70787809596429) < 0.00005;

    const isDestAuditorium =
      destination.id === 'baldevraj-mittal-auditorium' ||
      destination.id === 'road-ref-point-1' ||
      (destination.coordinates &&
        Math.abs(destination.coordinates.lat - 31.258513739139417) < 0.00005 &&
        Math.abs(destination.coordinates.lng - 75.70787809596429) < 0.00005);

    if (isOriginAuditorium || isDestAuditorium) {
      return {
        origin: effectiveOrigin,
        destination,
        mode,
        status: 'unavailable',
        distanceMeters: 0,
        estimatedTimeMinutes: 0,
        pathCoordinates: [],
        instructions: [],
        isVerifiedRoute: false,
        unreachableReason:
          'Verified route unavailable: Physical entrance for Sh. Baldevraj Mittal Auditorium is awaiting separate on-ground verification. Fake walking shortcuts are not simulated.',
      };
    }

    // Specific road connectivity guard for Uni Health Center:
    // (Coordinates: 31.258118, 75.706783)
    // Physical entrance awaiting separate verification. Automatic walking connection is barred.
    const isOriginHealthCenter =
      Math.abs(effectiveOrigin.lat - 31.258118286319235) < 0.00005 &&
      Math.abs(effectiveOrigin.lng - 75.70678342134359) < 0.00005;

    const isDestHealthCenter =
      destination.id === 'uni-health-center' ||
      (destination.coordinates &&
        Math.abs(destination.coordinates.lat - 31.258118286319235) < 0.00005 &&
        Math.abs(destination.coordinates.lng - 75.70678342134359) < 0.00005);

    if (isOriginHealthCenter || isDestHealthCenter) {
      return {
        origin: effectiveOrigin,
        destination,
        mode,
        status: 'unavailable',
        distanceMeters: 0,
        estimatedTimeMinutes: 0,
        pathCoordinates: [],
        instructions: [],
        isVerifiedRoute: false,
        unreachableReason:
          'Verified route unavailable: Physical entrance for Uni Health Center is awaiting separate on-ground verification. Fake walking shortcuts are not simulated.',
      };
    }

    // Specific verification guard for Building 41 (field coordinates):
    // Requires administrator confirmation and restricts to verified pedestrian walkway
    if (destination.id === 'building-41') {
      if (!destination.isEntranceConfirmed) {
        return {
          origin: effectiveOrigin,
          destination,
          mode,
          status: 'unavailable',
          distanceMeters: 0,
          estimatedTimeMinutes: 0,
          pathCoordinates: [],
          instructions: [],
          isVerifiedRoute: false,
          unreachableReason:
            'Verified route unavailable: Entrance coordinates for Building 41 require university administrator confirmation before live navigation can proceed.',
        };
      }

      // Wheelchair accessibility unverified for user-provided field coordinates
      if (mode === 'wheelchair') {
        return {
          origin: effectiveOrigin,
          destination,
          mode,
          status: 'unavailable',
          distanceMeters: 0,
          estimatedTimeMinutes: 0,
          pathCoordinates: [],
          instructions: [],
          isVerifiedRoute: false,
          accessibilityNotice:
            'Step-free entrance unavailable. Step-free ramp accessibility has not been verified for user-provided field coordinates.',
          unreachableReason:
            'Verified route unavailable: Step-free ramp accessibility has not been verified for user-provided field coordinates. Physical survey pending.',
        };
      }
    }

    // Wheelchair validation check
    if (mode === 'wheelchair') {
      if (destNode.isEntrance && destNode.hasStepFreeRamp === false) {
        return {
          origin: effectiveOrigin,
          destination,
          mode,
          status: 'unavailable',
          distanceMeters: 0,
          estimatedTimeMinutes: 0,
          pathCoordinates: [],
          instructions: [],
          isVerifiedRoute: false,
          accessibilityNotice:
            'Step-free entrance unavailable. This building plinth has physical steps and lacks a verified ramp. Physical ramp installation/survey pending.',
          unreachableReason:
            'No verified step-free accessible route exists to this building entrance.',
        };
      }
    }

    // Car mode handling:
    // Cars are restricted from entering pedestrian-only academic boulevards (Block 34, 36, Library, etc.)
    let targetNodeId = destNode.id;
    let carNotice: string | undefined;

    if (mode === 'car') {
      const modeConfig = NAVIGATION_MODES.find((m) => m.id === 'car');
      // If destination is in pedestrian zone, route car to nearest parking
      const isPedestrianOnly = !['gate-1', 'main-gate-parking', 'unimall-parking', 'unihospital', 'gate-2'].includes(
        destination.id
      );

      if (isPedestrianOnly && !modeConfig?.allowedOnPedestrianSpine) {
        // Find nearest parking to destination
        const parkingNodes = ['n_gate1_parking'];
        let bestParkingId = 'n_gate1_parking';
        let minParkingDist = Infinity;

        for (const pId of parkingNodes) {
          const pNode = this.graph.nodes[pId];
          if (!pNode || !pNode.coords) continue;
          const d = this.calculateStraightLineMeters(destNode.coords, pNode.coords);
          if (d < minParkingDist) {
            minParkingDist = d;
            bestParkingId = pId;
          }
        }

        targetNodeId = bestParkingId;
        const parkingName = this.graph.nodes[bestParkingId]?.name || 'Gate 1 Visitor Parking Bay';
        carNotice = `Private vehicles are prohibited inside central academic corridors. Route calculated to nearest parking: ${parkingName}.`;
      }
    }

    // Run graph search
    const pathResult = this.findShortestPath(startNode.id, targetNodeId, mode);

    if (!pathResult) {
      const activeClosures = roadClosureService.getActiveClosures();
      let failureReason = `Verified route unavailable: No permitted ${mode} pathway connects these two campus points on the verified network.`;
      if (activeClosures.length > 0) {
        failureReason = `Verified route unavailable: Pathway closed due to active campus road maintenance: ${activeClosures
          .map((c) => c.title)
          .join(', ')}.`;
      }

      return {
        origin: effectiveOrigin,
        destination,
        mode,
        status: 'unavailable',
        distanceMeters: 0,
        estimatedTimeMinutes: 0,
        pathCoordinates: [],
        instructions: [],
        isVerifiedRoute: false,
        unreachableReason: failureReason,
        roadClosureNotice:
          activeClosures.length > 0
            ? `Campus pathway closed: ${activeClosures.map((c) => c.segmentDescription).join(', ')}`
            : undefined,
      };
    }

    const modeConfig = NAVIGATION_MODES.find((m) => m.id === mode);
    const speedKmh = modeConfig?.speedKmh || 4.5;
    const speedMps = (speedKmh * 1000) / 3600;
    const totalDistance = pathResult.distance + (snappedOrigin ? Math.min(snappedOrigin.distanceMeters, 60) : 0);
    const estimatedMinutes = Math.max(1, Math.round(totalDistance / speedMps / 60));

    // Compile exact road path coordinates: concatenate edge.geometry for all path edges
    const compiledCoords: Coordinates[] = [];

    // Approach connector from origin to path start (using point-to-segment orthogonal snap if available)
    if (snappedOrigin && snappedOrigin.distanceMeters > 0 && snappedOrigin.distanceMeters <= 60) {
      const colCheck = routeQualityService.checkSegmentBuildingCollision(effectiveOrigin, snappedOrigin.snappedPoint);
      if (!colCheck.collides) {
        compiledCoords.push(effectiveOrigin);
        compiledCoords.push(snappedOrigin.snappedPoint);
      } else {
        compiledCoords.push(pathResult.path[0].coords);
      }
    } else {
      const distToStart = this.calculateStraightLineMeters(effectiveOrigin, pathResult.path[0].coords);
      if (distToStart > 0 && distToStart <= 35) {
        const colCheck = routeQualityService.checkSegmentBuildingCollision(effectiveOrigin, pathResult.path[0].coords);
        if (!colCheck.collides) {
          compiledCoords.push(effectiveOrigin);
        }
      }
    }

    for (let i = 0; i < pathResult.edges.length; i++) {
      const edge = pathResult.edges[i];
      const edgeGeometry = edge.geometry && edge.geometry.length > 0
        ? edge.geometry
        : [this.graph.nodes[edge.from].coords, this.graph.nodes[edge.to].coords];

      for (let j = 0; j < edgeGeometry.length; j++) {
        const pt = edgeGeometry[j];
        const last = compiledCoords[compiledCoords.length - 1];
        if (
          !last ||
          Math.abs(last.lat - pt.lat) > 1e-6 ||
          Math.abs(last.lng - pt.lng) > 1e-6
        ) {
          compiledCoords.push(pt);
        }
      }
    }

    const effectiveDestCoord = destination.entranceCoordinates || destination.coordinates;
    if (effectiveDestCoord && targetNodeId === destNode.id) {
      const last = compiledCoords[compiledCoords.length - 1];
      if (
        last &&
        (Math.abs(last.lat - effectiveDestCoord.lat) > 1e-6 ||
          Math.abs(last.lng - effectiveDestCoord.lng) > 1e-6)
      ) {
        const distToDest = this.calculateStraightLineMeters(last, effectiveDestCoord);
        if (distToDest <= 35) {
          const colCheck = routeQualityService.checkSegmentBuildingCollision(last, effectiveDestCoord);
          if (!colCheck.collides) {
            compiledCoords.push(effectiveDestCoord);
          }
        }
      }
    }

    // Automated Route Quality Check (Requirement 7):
    // Audit that the calculated road path does not intersect any campus building footprint
    const validation = routeQualityService.validateRouteGeometry({
      origin: effectiveOrigin,
      destination,
      mode,
      status: 'available',
      distanceMeters: totalDistance,
      estimatedTimeMinutes: estimatedMinutes,
      pathCoordinates: compiledCoords,
      instructions: [],
      isVerifiedRoute: true,
    });

    if (!validation.isValid) {
      const collisionName = validation.buildingCollisions[0]?.buildingName || 'Campus Building';
      return {
        origin: effectiveOrigin,
        destination,
        mode,
        status: 'unavailable',
        distanceMeters: 0,
        estimatedTimeMinutes: 0,
        pathCoordinates: [],
        instructions: [],
        isVerifiedRoute: false,
        unreachableReason: `Accurate route unavailable: Path crosses building footprint (${collisionName}). Physical survey required to establish safe perimeter bypass.`,
      };
    }

    const instructions = this.generateInstructions(
      pathResult.path,
      pathResult.edges,
      destination,
      speedMps
    );

    const activeClosures = roadClosureService.getActiveClosures();
    const closureNotice =
      activeClosures.length > 0
        ? `Route adjusted to bypass campus road closure: ${activeClosures.map((c) => c.title).join('; ')}`
        : undefined;

    return {
      origin: effectiveOrigin,
      destination,
      mode,
      status: 'available',
      distanceMeters: totalDistance,
      estimatedTimeMinutes: estimatedMinutes,
      pathCoordinates: compiledCoords,
      instructions,
      isVerifiedRoute: true,
      notes: [carNotice, offCampusNotice, this.getRouteStatusMessage(mode)].filter(Boolean).join(' '),
      accessibilityNotice:
        mode === 'wheelchair'
          ? 'Route verified step-free on paved campus boulevard with entrance ramp.'
          : undefined,
      roadClosureNotice: closureNotice,
      isFallbackOrigin,
    };
  }

  public getRouteStatusMessage(mode: NavigationMode): string {
    switch (mode) {
      case 'wheelchair':
        return 'Step-free accessible route calculated using verified ground ramps and grade-level pathways.';
      case 'car':
        return 'Campus vehicle regulations apply. Vehicles must park in designated bays.';
      case 'bike':
        return 'Cycle corridor route calculated along wide paved campus boulevards.';
      case 'walking':
      default:
        return 'Verified walking route along LPU pedestrian boulevards and walkways.';
    }
  }
}

export const routingService = new RoutingService();
