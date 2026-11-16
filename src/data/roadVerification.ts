import { Coordinates } from '../types/location';

export interface RoadVerificationPointData {
  id: string;
  name: string;
  coordinates: Coordinates;
  status: 'pending_verification';
  adminNotes: string;
  nearestOsmSegment: {
    id: string;
    wayId: string;
    name: string;
    highwayType: string;
    category: string;
    surface: string;
    distanceMeters: number;
    permittedModes: string[];
  };
  nearestJunction: {
    nodeId: string;
    coordinates: Coordinates;
    distanceMeters: number;
    degree: number;
    isJunction: boolean;
    connectedWays: Array<{
      wayId: string;
      name: string;
      category: string;
    }>;
  };
  sectorSummary: {
    distanceToMainGateMeters: number;
    nearestDisconnectedComponentId: number;
    distanceToDisconnectedSegmentMeters: number;
    nearestDeadEndNodeId: string;
    distanceToDeadEndMeters: number;
  };
  connectionPolicy: string;
}

/**
 * Temporary admin-visible Road Verification Point candidate coordinate.
 * User-supplied for ground verification:
 * Latitude: 31.258513739139417
 * Longitude: 75.70787809596429
 * 
 * Strict GIS Rule: Do NOT connect to arbitrary nearby road without physical survey.
 */
export const ROAD_VERIFICATION_POINT: RoadVerificationPointData = {
  id: 'road-ref-point-1',
  name: 'Road Verification Point (Admin Inspection)',
  coordinates: {
    lat: 31.258513739139417,
    lng: 75.70787809596429,
  },
  status: 'pending_verification',
  adminNotes:
    'User-supplied reference coordinate for campus roadway alignment. Strictly restricted to administrative inspection view. No simulated or arbitrary road connection created.',
  nearestOsmSegment: {
    id: 'osm_e_1551038399_3_15',
    wayId: '1551038399',
    name: 'Pedestrian Promenade',
    highwayType: 'living_street',
    category: 'pedestrian_walkway',
    surface: 'paver_blocks',
    distanceMeters: 2.2,
    permittedModes: ['walking', 'bike', 'wheelchair'],
  },
  nearestJunction: {
    nodeId: '14107324490',
    coordinates: {
      lat: 31.258568,
      lng: 75.707962,
    },
    distanceMeters: 10.0,
    degree: 6,
    isJunction: true,
    connectedWays: [
      { wayId: '1116524605', name: 'Internal Campus Road', category: 'internal_vehicle' },
      { wayId: '1116524605', name: 'Internal Campus Road', category: 'internal_vehicle' },
      { wayId: '1551038395', name: 'Campus Walkway', category: 'footpath' },
      { wayId: '1551038395', name: 'Campus Walkway', category: 'footpath' },
      { wayId: '1551038399', name: 'Pedestrian Promenade', category: 'pedestrian_walkway' },
      { wayId: '1552759649', name: 'Campus Walkway', category: 'footpath' },
    ],
  },
  sectorSummary: {
    distanceToMainGateMeters: 264.7,
    nearestDisconnectedComponentId: 7,
    distanceToDisconnectedSegmentMeters: 185.9,
    nearestDeadEndNodeId: '14268926787',
    distanceToDeadEndMeters: 89.2,
  },
  connectionPolicy:
    'Connection to the active campus routing graph is withheld until physical ground verification confirms pedestrian/vehicular access and curb transitions. Fake straight-line shortcuts are strictly barred.',
};
