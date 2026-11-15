import { CampusLocation, Coordinates } from '../types/location';
import {
  NavigationMode,
  NavigationModeConfig,
  RoutePlan,
  TurnInstruction,
  ManeuverType,
} from '../types/navigation';
import { CampusGraphNode, CampusGraphEdge, IRoutingService } from '../types/routing';
import { campusRouteGraph } from '../data/campusRouteGraph';
import { roadClosureService } from './roadClosureService';

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
  private graph = campusRouteGraph;

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
   * Dijkstra / A* shortest path search over the campus graph with mode filtering
   */
  public findShortestPath(
    startNodeId: string,
    endNodeId: string,
    mode: NavigationMode
  ): { path: CampusGraphNode[]; edges: CampusGraphEdge[]; distance: number; closuresAvoided?: string[] } | null {
    const nodes = this.graph.nodes;
    const edges = this.graph.edges;
    const activeClosures = roadClosureService.getActiveClosures();

    type PrevEntry = { nodeId: string; edge: CampusGraphEdge } | null;
    const distances: Record<string, number> = {};
    const previous: Record<string, PrevEntry> = {};
    const unvisited = new Set<string>();

    for (const id of Object.keys(nodes)) {
      distances[id] = Infinity;
      previous[id] = null;
      unvisited.add(id);
    }

    distances[startNodeId] = 0;

    while (unvisited.size > 0) {
      // Pick unvisited node with lowest distance
      let currentId: string | null = null;
      let minDis = Infinity;
      for (const id of unvisited) {
        if (distances[id] < minDis) {
          minDis = distances[id];
          currentId = id;
        }
      }

      if (!currentId || minDis === Infinity) {
        break; // Remaining nodes are unreachable
      }

      if (currentId === endNodeId) {
        break; // Destination reached
      }

      unvisited.delete(currentId);

      // Find valid outgoing edges matching the requested navigation mode and NOT closed by active road maintenance
      const outgoingEdges = edges.filter((e) => {
        if (e.from !== currentId) return false;
        if (!e.allowedModes.includes(mode)) return false;
        if (mode === 'wheelchair' && !e.isWheelchairAccessible) return false;

        // Check if edge is blocked by active road closure
        const isClosed = activeClosures.some(
          (c) =>
            (c.edgeId && c.edgeId === e.id) ||
            (c.nodeA === e.from && c.nodeB === e.to) ||
            (c.nodeA === e.to && c.nodeB === e.from)
        );
        return !isClosed;
      });

      for (const edge of outgoingEdges) {
        if (!unvisited.has(edge.to)) continue;

        const alt = distances[currentId] + edge.distanceMeters;
        if (alt < distances[edge.to]) {
          distances[edge.to] = alt;
          previous[edge.to] = { nodeId: currentId, edge };
        }
      }
    }

    // If destination was not reached
    if (distances[endNodeId] === Infinity) {
      return null;
    }

    // Reconstruct path
    const pathNodes: CampusGraphNode[] = [];
    const pathEdges: CampusGraphEdge[] = [];
    let curr: string | null = endNodeId;

    while (curr && curr !== startNodeId) {
      const entry: PrevEntry = previous[curr];
      if (!entry) break;
      pathNodes.unshift(nodes[curr]);
      pathEdges.unshift(entry.edge);
      curr = entry.nodeId;
    }
    pathNodes.unshift(nodes[startNodeId]);

    const closuresAvoided = activeClosures.map((c) => c.title);

    return {
      path: pathNodes,
      edges: pathEdges,
      distance: distances[endNodeId],
      closuresAvoided: activeClosures.length > 0 ? closuresAvoided : undefined
    };
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
   * Main Route Calculation API
   */
  public async calculateRoute(
    origin: Coordinates | null,
    destination: CampusLocation,
    mode: NavigationMode
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

    const destNode = this.findNodeForLocation(destination);
    const startNode = this.findNearestNode(effectiveOrigin, mode);

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
        const parkingNodes = ['n_unimall_parking', 'n_gate1_parking'];
        let bestParkingId = 'n_gate1_parking';
        let minParkingDist = Infinity;

        for (const pId of parkingNodes) {
          const pNode = this.graph.nodes[pId];
          const d = this.calculateStraightLineMeters(destNode.coords, pNode.coords);
          if (d < minParkingDist) {
            minParkingDist = d;
            bestParkingId = pId;
          }
        }

        targetNodeId = bestParkingId;
        const parkingName = this.graph.nodes[bestParkingId].name;
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
    const estimatedMinutes = Math.max(1, Math.round(pathResult.distance / speedMps / 60));

    // Compile path coordinates: prepend user origin coordinate, then path node coords, then destination entrance coordinate
    const pathCoords: Coordinates[] = [
      effectiveOrigin,
      ...pathResult.path.map((n) => n.coords),
    ];

    const effectiveDestCoord = destination.entranceCoordinates || destination.coordinates;
    if (effectiveDestCoord && targetNodeId === destNode.id) {
      pathCoords.push(effectiveDestCoord);
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
      distanceMeters: pathResult.distance,
      estimatedTimeMinutes: estimatedMinutes,
      pathCoordinates: pathCoords,
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
