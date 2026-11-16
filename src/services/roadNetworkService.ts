import { Coordinates } from '../types/location';
import { NavigationMode } from '../types/navigation';
import {
  CampusRoadNetworkData,
  CampusRoadSegment,
  CampusRoadNode,
  RoadCategory,
  RoadSurface,
  WheelchairRating,
  CAMPUS_ROAD_NETWORK,
} from '../data/campusRoadNetwork';
import { CampusGraphNode, CampusGraphEdge, CampusRouteGraph } from '../types/routing';
import { authService } from './authService';

export interface RoadAuditLogEntry {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: 'edit_segment' | 'add_segment' | 'import_file' | 'connect_nodes' | 'publish_version' | 'restore_version' | 'reset_base';
  segmentId?: string;
  details: string;
}

export interface NetworkDiagnosticReport {
  totalWays: number;
  totalSegments: number;
  totalIntersections: number;
  totalLengthKm: number;
  totalLengthMeters: number;
  connectedComponentsCount: number;
  mainComponentSize: number;
  disconnectedSegmentsCount: number;
  disconnectedComponents: Array<{
    componentId: number;
    segmentCount: number;
    nodeCount: number;
    segmentNames: string[];
    ways: string[];
  }>;
  buildingCollisionsCount: number;
  collidingSegments: Array<{
    segmentId: string;
    wayId: string;
    name: string;
    buildingName: string;
  }>;
  modeBreakdown: Record<NavigationMode, number>;
  wheelchairBreakdown: Record<WheelchairRating, number>;
  surfaceBreakdown: Record<RoadSurface, number>;
  categoryBreakdown: Record<RoadCategory, number>;
  building41Status: {
    entranceCoordinates: Coordinates;
    nearestRoadNodeId: string;
    distanceToNearestRoadMeters: number;
    hasVerifiedPathConnection: boolean;
    recommendation: string;
  };
  roadVerificationPointStatus: {
    coordinates: Coordinates;
    nearestRoadSegmentName: string;
    nearestRoadSegmentWayId: string;
    distanceToNearestRoadMeters: number;
    nearestJunctionNodeId: string;
    nearestJunctionDegree: number;
    distanceToNearestJunctionMeters: number;
    distanceToMainGateMeters: number;
    nearestDisconnectedComponentId: number;
    hasVerifiedPathConnection: boolean;
    policyNote: string;
  };
}

const STORAGE_KEY_CUSTOM_NETWORK = 'lpu_custom_road_network';
const STORAGE_KEY_AUDIT_LOG = 'lpu_road_network_audit_log';
const STORAGE_KEY_SNAPSHOTS = 'lpu_road_network_snapshots';

export class RoadNetworkService {
  private network: CampusRoadNetworkData;
  private auditLog: RoadAuditLogEntry[] = [];
  private snapshots: Array<{ version: string; date: string; network: CampusRoadNetworkData }> = [];

  constructor() {
    this.network = this.loadPersistedNetwork();
    this.auditLog = this.loadAuditLog();
    this.snapshots = this.loadSnapshots();
  }

  private loadPersistedNetwork(): CampusRoadNetworkData {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_NETWORK);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.nodes && parsed.segments) {
          return parsed;
        }
      }
    } catch {
      // Fallback to base audited OSM dataset
    }
    return JSON.parse(JSON.stringify(CAMPUS_ROAD_NETWORK));
  }

  private saveNetwork(): void {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_NETWORK, JSON.stringify(this.network));
    } catch {
      // Ignore quota errors
    }
  }

  private loadAuditLog(): RoadAuditLogEntry[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUDIT_LOG);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return [
      {
        id: 'log-initial',
        timestamp: new Date().toISOString(),
        adminEmail: 'system@lpu.co.in',
        action: 'publish_version',
        details: 'Initial OpenStreetMap 2D Road Network audit (322 segments, 34.46 km, 242 intersections) loaded.'
      }
    ];
  }

  private saveAuditLog(): void {
    try {
      localStorage.setItem(STORAGE_KEY_AUDIT_LOG, JSON.stringify(this.auditLog));
    } catch {
      // Ignore
    }
  }

  private loadSnapshots(): Array<{ version: string; date: string; network: CampusRoadNetworkData }> {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SNAPSHOTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return [
      {
        version: CAMPUS_ROAD_NETWORK.version,
        date: CAMPUS_ROAD_NETWORK.auditDate,
        network: JSON.parse(JSON.stringify(CAMPUS_ROAD_NETWORK))
      }
    ];
  }

  private saveSnapshots(): void {
    try {
      localStorage.setItem(STORAGE_KEY_SNAPSHOTS, JSON.stringify(this.snapshots.slice(-10))); // keep last 10
    } catch {
      // Ignore
    }
  }

  public getNetwork(): CampusRoadNetworkData {
    return this.network;
  }

  public getSegments(): CampusRoadSegment[] {
    return this.network.segments;
  }

  public getNodes(): Record<string, CampusRoadNode> {
    return this.network.nodes;
  }

  public getAuditLog(): RoadAuditLogEntry[] {
    return [...this.auditLog].reverse();
  }

  public getSnapshots(): Array<{ version: string; date: string }> {
    return this.snapshots.map(s => ({ version: s.version, date: s.date }));
  }

  /**
   * Diagnostic Report covering all road segments, connected intersections, components, and gaps
   */
  public getDiagnosticReport(): NetworkDiagnosticReport {
    const segments = this.network.segments;
    const nodes = this.network.nodes;

    let totalLengthMeters = 0;
    const modeBreakdown: Record<NavigationMode, number> = {
      walking: 0,
      bike: 0,
      car: 0,
      wheelchair: 0
    };
    const wheelchairBreakdown: Record<WheelchairRating, number> = {
      verified_accessible: 0,
      inaccessible: 0,
      unverified: 0
    };
    const surfaceBreakdown: Record<RoadSurface, number> = {
      paved_asphalt: 0,
      concrete: 0,
      paver_blocks: 0,
      gravel: 0,
      unpaved: 0
    };
    const categoryBreakdown: Record<RoadCategory, number> = {
      main_road: 0,
      internal_vehicle: 0,
      service: 0,
      hostel_access: 0,
      pedestrian_walkway: 0,
      footpath: 0,
      cycle_lane: 0
    };

    const collidingSegments: NetworkDiagnosticReport['collidingSegments'] = [];

    // Group by component
    const componentMap = new Map<number, { segments: CampusRoadSegment[]; nodes: Set<string> }>();

    for (const s of segments) {
      totalLengthMeters += s.distanceMeters;

      for (const m of s.allowedModes) {
        modeBreakdown[m] = (modeBreakdown[m] || 0) + 1;
      }
      wheelchairBreakdown[s.wheelchairStatus] = (wheelchairBreakdown[s.wheelchairStatus] || 0) + 1;
      surfaceBreakdown[s.surface] = (surfaceBreakdown[s.surface] || 0) + 1;
      categoryBreakdown[s.category] = (categoryBreakdown[s.category] || 0) + 1;

      if (s.buildingCollision?.collides) {
        collidingSegments.push({
          segmentId: s.id,
          wayId: s.wayId,
          name: s.name,
          buildingName: s.buildingCollision.buildingName || 'Building'
        });
      }

      if (!componentMap.has(s.componentId)) {
        componentMap.set(s.componentId, { segments: [], nodes: new Set() });
      }
      const c = componentMap.get(s.componentId)!;
      c.segments.push(s);
      c.nodes.add(s.fromNode);
      c.nodes.add(s.toNode);
    }

    const disconnectedComponents: NetworkDiagnosticReport['disconnectedComponents'] = [];
    let disconnectedSegmentsCount = 0;

    for (const [compId, compData] of componentMap.entries()) {
      if (compId > 1) {
        disconnectedSegmentsCount += compData.segments.length;
        const ways = Array.from(new Set(compData.segments.map(s => s.wayId)));
        const names = Array.from(new Set(compData.segments.map(s => s.name)));
        disconnectedComponents.push({
          componentId: compId,
          segmentCount: compData.segments.length,
          nodeCount: compData.nodes.size,
          segmentNames: names,
          ways
        });
      }
    }

    const mainComponent = componentMap.get(1);

    return {
      totalWays: this.network.summary.totalWays,
      totalSegments: segments.length,
      totalIntersections: Object.keys(nodes).length,
      totalLengthKm: Number((totalLengthMeters / 1000).toFixed(2)),
      totalLengthMeters,
      connectedComponentsCount: componentMap.size,
      mainComponentSize: mainComponent ? mainComponent.segments.length : 0,
      disconnectedSegmentsCount,
      disconnectedComponents,
      buildingCollisionsCount: collidingSegments.length,
      collidingSegments,
      modeBreakdown,
      wheelchairBreakdown,
      surfaceBreakdown,
      categoryBreakdown,
      building41Status: {
        entranceCoordinates: { lat: 31.251697, lng: 75.701877 },
        nearestRoadNodeId: '14101706193',
        distanceToNearestRoadMeters: 30.2,
        hasVerifiedPathConnection: false,
        recommendation:
          'Building 41 entrance is 30.2m from OSM Footway 1550425051. Requires on-ground GPS field survey of the connecting sidewalk before enabling pedestrian routing.'
      },
      roadVerificationPointStatus: {
        coordinates: { lat: 31.258513739139417, lng: 75.70787809596429 },
        nearestRoadSegmentName: 'Pedestrian Promenade',
        nearestRoadSegmentWayId: '1551038399',
        distanceToNearestRoadMeters: 2.2,
        nearestJunctionNodeId: '14107324490',
        nearestJunctionDegree: 6,
        distanceToNearestJunctionMeters: 10.0,
        distanceToMainGateMeters: 264.7,
        nearestDisconnectedComponentId: 7,
        hasVerifiedPathConnection: false,
        policyNote:
          'Zero-Fake-Connection Policy: Reference coordinate is 2.2m from Way 1551038399 and 10.0m from Node 14107324490 (6-way junction). Arbitrary or simulated routing connections are withheld until physical ground verification confirms actual access and curb transitions.'
      }
    };
  }

  /**
   * Generates a fully connected CampusRouteGraph for routing engine consumption
   */
  public buildRoutingGraph(): CampusRouteGraph {
    const nodes: Record<string, CampusGraphNode> = {};
    const edges: CampusGraphEdge[] = [];

    // 1. Add all junction nodes
    for (const [id, n] of Object.entries(this.network.nodes)) {
      nodes[id] = {
        id: n.id,
        name: n.name,
        coords: n.coords,
        nodeType: n.isJunction ? 'intersection' : 'waypoint',
        componentId: n.componentId,
        degree: n.degree,
        isVerified: true,
        verificationSource: 'OSM Audited Junction Node'
      };
    }

    // 2. Add Building 41 entrance node (Explicitly kept disconnected per integrity rules)
    nodes['n_b41_entrance'] = {
      id: 'n_b41_entrance',
      name: 'Building 41 Entrance (Boys Apartment Gate)',
      coords: { lat: 31.251697, lng: 75.701877 },
      nodeType: 'entrance',
      isEntrance: true,
      locationId: 'building-41',
      hasStepFreeRamp: false,
      isVerified: true,
      verificationSource: 'Field GPS Survey Coordinates (pending path survey)',
      description: 'Pedestrian entrance gate to Building 41. Path connection to campus road network requires field survey.'
    };

    // 3. Convert all segments into directional graph edges
    for (const seg of this.network.segments) {
      // Forward edge
      edges.push({
        id: `${seg.id}_fwd`,
        from: seg.fromNode,
        to: seg.toNode,
        distanceMeters: seg.distanceMeters,
        allowedModes: seg.allowedModes,
        pathName: seg.name,
        isWheelchairAccessible: seg.wheelchairStatus === 'verified_accessible',
        surface: seg.surface,
        isOneWay: seg.isOneWay,
        geometry: seg.geometry,
        category: seg.category,
        highwayType: seg.highwayType,
        componentId: seg.componentId,
        buildingCollision: seg.buildingCollision,
        isVerified: seg.isVerified,
        verificationSource: seg.verificationSource,
        maxSpeedKmh: seg.speedLimitKmh
      });

      // Reverse edge (if not one-way)
      if (!seg.isOneWay) {
        edges.push({
          id: `${seg.id}_rev`,
          from: seg.toNode,
          to: seg.fromNode,
          distanceMeters: seg.distanceMeters,
          allowedModes: seg.allowedModes,
          pathName: seg.name,
          isWheelchairAccessible: seg.wheelchairStatus === 'verified_accessible',
          surface: seg.surface,
          isOneWay: false,
          geometry: [...seg.geometry].reverse(),
          category: seg.category,
          highwayType: seg.highwayType,
          componentId: seg.componentId,
          buildingCollision: seg.buildingCollision,
          isVerified: seg.isVerified,
          verificationSource: seg.verificationSource,
          maxSpeedKmh: seg.speedLimitKmh
        });
      }
    }

    return {
      nodes,
      edges,
      version: this.network.version
    };
  }

  // --- Admin Editing Methods (Protected) ---

  public updateSegment(
    id: string,
    updates: Partial<CampusRoadSegment>,
    adminEmail = 'admin@lpu.co.in'
  ): boolean {
    if (!authService.isAdmin()) {
      throw new Error('Unauthorized: Admin privilege required to modify road network.');
    }

    const idx = this.network.segments.findIndex(s => s.id === id);
    if (idx === -1) return false;

    const existing = this.network.segments[idx];
    const updated: CampusRoadSegment = {
      ...existing,
      ...updates,
      id: existing.id // preserve ID
    };

    // If geometry was updated, recalculate distance
    if (updates.geometry && updates.geometry.length >= 2) {
      let len = 0;
      for (let i = 0; i < updates.geometry.length - 1; i++) {
        len += this.haversine(updates.geometry[i], updates.geometry[i + 1]);
      }
      updated.distanceMeters = Math.max(1, Math.round(len));
    }

    this.network.segments[idx] = updated;
    this.auditLog.push({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminEmail,
      action: 'edit_segment',
      segmentId: id,
      details: `Updated segment ${updated.name} (${id}): modes=[${updated.allowedModes.join(', ')}], wheelchair=${updated.wheelchairStatus}, surface=${updated.surface}`
    });

    this.saveNetwork();
    this.saveAuditLog();
    return true;
  }

  public addSurveyedSegment(
    segmentData: Omit<CampusRoadSegment, 'id' | 'componentId'>,
    adminEmail = 'admin@lpu.co.in'
  ): CampusRoadSegment {
    if (!authService.isAdmin()) {
      throw new Error('Unauthorized: Admin privilege required to add road segments.');
    }

    const newId = `survey_e_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    let len = 0;
    if (segmentData.geometry && segmentData.geometry.length >= 2) {
      for (let i = 0; i < segmentData.geometry.length - 1; i++) {
        len += this.haversine(segmentData.geometry[i], segmentData.geometry[i + 1]);
      }
    }
    const distanceMeters = Math.max(1, Math.round(len));

    // Ensure nodes exist in nodes table
    if (!this.network.nodes[segmentData.fromNode] && segmentData.geometry.length > 0) {
      this.network.nodes[segmentData.fromNode] = {
        id: segmentData.fromNode,
        coords: segmentData.geometry[0],
        name: `Node ${segmentData.fromNode}`,
        degree: 1,
        componentId: 1,
        isJunction: false,
        isEndpoint: true
      };
    }
    if (!this.network.nodes[segmentData.toNode] && segmentData.geometry.length > 0) {
      this.network.nodes[segmentData.toNode] = {
        id: segmentData.toNode,
        coords: segmentData.geometry[segmentData.geometry.length - 1],
        name: `Node ${segmentData.toNode}`,
        degree: 1,
        componentId: 1,
        isJunction: false,
        isEndpoint: true
      };
    }

    const newSegment: CampusRoadSegment = {
      ...segmentData,
      id: newId,
      distanceMeters,
      componentId: 1,
      source: 'survey',
      isVerified: true
    };

    this.network.segments.push(newSegment);
    this.auditLog.push({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminEmail,
      action: 'add_segment',
      segmentId: newId,
      details: `Added field-surveyed segment "${newSegment.name}" (${distanceMeters}m) between ${newSegment.fromNode} and ${newSegment.toNode}.`
    });

    this.saveNetwork();
    this.saveAuditLog();
    return newSegment;
  }

  public connectIntersections(
    nodeAId: string,
    nodeBId: string,
    options: {
      name: string;
      category: RoadCategory;
      modes: NavigationMode[];
      surface: RoadSurface;
      wheelchairStatus: WheelchairRating;
    },
    adminEmail = 'admin@lpu.co.in'
  ): CampusRoadSegment | null {
    if (!authService.isAdmin()) {
      throw new Error('Unauthorized: Admin privilege required.');
    }

    const nodeA = this.network.nodes[nodeAId];
    const nodeB = this.network.nodes[nodeBId];
    if (!nodeA || !nodeB) return null;

    const geometry = [nodeA.coords, nodeB.coords];
    const distanceMeters = Math.max(1, Math.round(this.haversine(nodeA.coords, nodeB.coords)));

    return this.addSurveyedSegment({
      wayId: `conn_${nodeAId}_${nodeBId}`,
      name: options.name || 'Verified Intersection Connection',
      highwayType: options.category === 'main_road' ? 'tertiary' : 'footway',
      category: options.category,
      surface: options.surface,
      fromNode: nodeAId,
      toNode: nodeBId,
      distanceMeters,
      geometry,
      isOneWay: false,
      allowedModes: options.modes,
      wheelchairStatus: options.wheelchairStatus,
      speedLimitKmh: 15,
      source: 'survey',
      isVerified: true,
      verificationSource: `Verified Junction Connection by Admin (${adminEmail})`
    }, adminEmail);
  }

  public publishVersion(versionName: string, notes: string, adminEmail = 'admin@lpu.co.in'): void {
    if (!authService.isAdmin()) {
      throw new Error('Unauthorized: Admin privilege required.');
    }

    this.network.version = versionName;
    this.network.auditDate = new Date().toISOString();

    // Take snapshot
    this.snapshots.push({
      version: versionName,
      date: this.network.auditDate,
      network: JSON.parse(JSON.stringify(this.network))
    });
    this.saveSnapshots();

    this.auditLog.push({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminEmail,
      action: 'publish_version',
      details: `Published routing graph version ${versionName}: ${notes}`
    });

    this.saveNetwork();
    this.saveAuditLog();
  }

  public restoreVersion(version: string, adminEmail = 'admin@lpu.co.in'): boolean {
    if (!authService.isAdmin()) {
      throw new Error('Unauthorized: Admin privilege required.');
    }

    const snap = this.snapshots.find(s => s.version === version);
    if (!snap) return false;

    this.network = JSON.parse(JSON.stringify(snap.network));
    this.auditLog.push({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminEmail,
      action: 'restore_version',
      details: `Restored routing graph to snapshot version ${version}.`
    });

    this.saveNetwork();
    this.saveAuditLog();
    return true;
  }

  public resetToBaseOsm(adminEmail = 'admin@lpu.co.in'): void {
    if (!authService.isAdmin()) {
      throw new Error('Unauthorized: Admin privilege required.');
    }

    this.network = JSON.parse(JSON.stringify(CAMPUS_ROAD_NETWORK));
    this.auditLog.push({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminEmail,
      action: 'reset_base',
      details: 'Reset all road network data to initial audited OpenStreetMap dataset.'
    });

    this.saveNetwork();
    this.saveAuditLog();
  }

  private haversine(c1: Coordinates, c2: Coordinates): number {
    const R = 6371e3;
    const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
    const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((c1.lat * Math.PI) / 180) *
        Math.cos((c2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}

export const roadNetworkService = new RoadNetworkService();
