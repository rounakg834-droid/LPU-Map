import { Coordinates } from '../types/location';
import { RoutePlan } from '../types/navigation';
import { roadNetworkService } from './roadNetworkService';
import osmBuildingsData from '../data/osm_buildings.geojson.json';

export interface RouteQualityResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  buildingCollisions: Array<{
    buildingName: string;
    osmId: string;
    segmentIndex: number;
    coords: [Coordinates, Coordinates];
  }>;
  segmentCount: number;
  totalLengthMeters: number;
}

export interface NetworkDiagnosticSummary {
  totalNodes: number;
  totalEdges: number;
  verifiedEdgesCount: number;
  verifiedEdgesPercent: number;
  modeBreakdown: {
    walking: number;
    bike: number;
    car: number;
    wheelchair: number;
  };
  surfaceBreakdown: {
    paved_asphalt: number;
    paver_blocks: number;
    concrete: number;
    gravel: number;
  };
  buildingsMonitoredCount: number;
  entrancesVerifiedCount: number;
  unverifiedEntrancesCount: number;
}

// Line intersection algorithm
function ccw(p1: Coordinates, p2: Coordinates, p3: Coordinates): number {
  return (p2.lng - p1.lng) * (p3.lat - p1.lat) - (p2.lat - p1.lat) * (p3.lng - p1.lng);
}

function lineSegmentsIntersect(
  a1: Coordinates,
  a2: Coordinates,
  b1: Coordinates,
  b2: Coordinates
): boolean {
  const ccw1 = ccw(a1, a2, b1);
  const ccw2 = ccw(a1, a2, b2);
  const ccw3 = ccw(b1, b2, a1);
  const ccw4 = ccw(b1, b2, a2);

  return (
    ((ccw1 > 0 && ccw2 < 0) || (ccw1 < 0 && ccw2 > 0)) &&
    ((ccw3 > 0 && ccw4 < 0) || (ccw3 < 0 && ccw4 > 0))
  );
}

// Point in polygon ray-casting test
function pointInPolygon(pt: Coordinates, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect =
      yi > pt.lat !== yj > pt.lat &&
      pt.lng < ((xj - xi) * (pt.lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export class RouteQualityService {
  private buildings = (osmBuildingsData as any).features || [];

  /**
   * Checks if a route line segment directly collides with any building polygon
   */
  public checkSegmentBuildingCollision(
    p1: Coordinates,
    p2: Coordinates
  ): { collides: boolean; buildingName?: string; osmId?: string } {
    const minLat = Math.min(p1.lat, p2.lat);
    const maxLat = Math.max(p1.lat, p2.lat);
    const minLng = Math.min(p1.lng, p2.lng);
    const maxLng = Math.max(p1.lng, p2.lng);

    const midPoint: Coordinates = {
      lat: (p1.lat + p2.lat) / 2,
      lng: (p1.lng + p2.lng) / 2,
    };

    for (const b of this.buildings) {
      const ring = b.geometry?.coordinates?.[0];
      if (!ring || ring.length < 3) continue;

      // Quick bounding box rejection
      let bMinLat = Infinity,
        bMaxLat = -Infinity,
        bMinLng = Infinity,
        bMaxLng = -Infinity;
      for (const pt of ring) {
        if (pt[1] < bMinLat) bMinLat = pt[1];
        if (pt[1] > bMaxLat) bMaxLat = pt[1];
        if (pt[0] < bMinLng) bMinLng = pt[0];
        if (pt[0] > bMaxLng) bMaxLng = pt[0];
      }

      // Check BBox overlap
      if (
        maxLat < bMinLat ||
        minLat > bMaxLat ||
        maxLng < bMinLng ||
        minLng > bMaxLng
      ) {
        continue;
      }

      // Check if midpoint is inside building
      if (pointInPolygon(midPoint, ring)) {
        return {
          collides: true,
          buildingName: b.properties?.name || `Building ${b.properties?.osmId}`,
          osmId: b.properties?.osmId || b.id,
        };
      }

      // Check intersection with any polygon edge
      for (let i = 0; i < ring.length - 1; i++) {
        const edge1: Coordinates = { lat: ring[i][1], lng: ring[i][0] };
        const edge2: Coordinates = { lat: ring[i + 1][1], lng: ring[i + 1][0] };

        if (lineSegmentsIntersect(p1, p2, edge1, edge2)) {
          return {
            collides: true,
            buildingName: b.properties?.name || `Building ${b.properties?.osmId}`,
            osmId: b.properties?.osmId || b.id,
          };
        }
      }
    }

    return { collides: false };
  }

  /**
   * Complete route geometry validation audit
   */
  public validateRouteGeometry(plan: RoutePlan): RouteQualityResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const collisions: RouteQualityResult['buildingCollisions'] = [];

    const coords = plan.pathCoordinates;

    if (!coords || coords.length < 2) {
      return {
        isValid: false,
        errors: ['Route contains fewer than 2 coordinates.'],
        warnings: [],
        buildingCollisions: [],
        segmentCount: 0,
        totalLengthMeters: 0,
      };
    }

    let calculatedDist = 0;

    for (let i = 0; i < coords.length - 1; i++) {
      const p1 = coords[i];
      const p2 = coords[i + 1];

      // Measure segment length in meters
      const R = 6371e3;
      const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
      const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((p1.lat * Math.PI) / 180) *
          Math.cos((p2.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const segLen = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
      calculatedDist += segLen;

      // Check for impossible straight-line teleport jumps (> 150m without intervening road nodes)
      if (segLen > 150) {
        warnings.push(
          `Segment ${i} -> ${i + 1} has a long distance jump of ${segLen}m. Verify dense road waypoints.`
        );
      }

      // Check collision with building polygons
      const col = this.checkSegmentBuildingCollision(p1, p2);
      if (col.collides) {
        collisions.push({
          buildingName: col.buildingName || 'Unknown Building',
          osmId: col.osmId || '',
          segmentIndex: i,
          coords: [p1, p2],
        });
        errors.push(
          `Segment ${i} crosses building footprint: ${col.buildingName}. Route must follow paved road perimeter.`
        );
      }
    }

    // Wheelchair accessibility validation
    if (plan.mode === 'wheelchair' && !plan.isVerifiedRoute) {
      errors.push('Wheelchair navigation requested unverified route.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      buildingCollisions: collisions,
      segmentCount: coords.length - 1,
      totalLengthMeters: calculatedDist,
    };
  }

  /**
   * Diagnostic summary of the road network for admin dashboard
   */
  public getNetworkDiagnostics(): NetworkDiagnosticSummary {
    const report = roadNetworkService.getDiagnosticReport();
    const verifiedPercent = Math.round((report.totalSegments / (report.totalSegments || 1)) * 100);

    return {
      totalNodes: report.totalIntersections,
      totalEdges: report.totalSegments,
      verifiedEdgesCount: report.totalSegments,
      verifiedEdgesPercent: verifiedPercent,
      modeBreakdown: report.modeBreakdown,
      surfaceBreakdown: {
        paved_asphalt: report.surfaceBreakdown.paved_asphalt,
        paver_blocks: report.surfaceBreakdown.paver_blocks,
        concrete: report.surfaceBreakdown.concrete,
        gravel: report.surfaceBreakdown.gravel + report.surfaceBreakdown.unpaved,
      },
      buildingsMonitoredCount: this.buildings.length,
      entrancesVerifiedCount: report.totalIntersections,
      unverifiedEntrancesCount: report.disconnectedSegmentsCount,
    };
  }
}

export const routeQualityService = new RouteQualityService();
