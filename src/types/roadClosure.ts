/**
 * Types for Campus Road Closures & Maintenance (Phase 5)
 */

export type ClosureStatus = 'active' | 'scheduled' | 'expired';

export interface RoadClosure {
  id: string;
  title: string;
  reason: string;
  edgeId?: string; // Matching campusRouteGraph edge ID, e.g. edge_unipolis_concourse
  nodeA: string; // Starting intersection node ID, e.g. n_unipolis_concourse
  nodeB: string; // Ending intersection node ID, e.g. n_boulevard_2
  segmentDescription: string; // Human-friendly description, e.g. "Unipolis West Concourse"
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: ClosureStatus;
  approvedByAdmin: boolean;
  reportedBy: string; // Student display name or "Admin"
  createdAt: string;
}

export interface CreateRoadClosureInput {
  title: string;
  reason: string;
  edgeId?: string;
  nodeA: string;
  nodeB: string;
  segmentDescription: string;
  startTime: string;
  endTime: string;
}

export interface StudentClosureReportInput {
  segmentDescription: string;
  reason: string;
  nodeA?: string;
  nodeB?: string;
}
