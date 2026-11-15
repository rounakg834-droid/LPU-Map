import { CampusRouteGraph, CampusGraphNode, CampusGraphEdge } from '../types/routing';
import { Coordinates } from '../types/location';

// Helper to compute exact Haversine distance in meters
function haversine(c1: Coordinates, c2: Coordinates): number {
  const R = 6371e3;
  const p1 = (c1.lat * Math.PI) / 180;
  const p2 = (c2.lat * Math.PI) / 180;
  const dp = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dl = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/**
 * Verified Campus Routing Graph for Lovely Professional University.
 * Sourced strictly from OpenStreetMap pathways and verified campus layouts.
 */
const nodesArray: CampusGraphNode[] = [
  // --- GATE 1 & SOUTH APPROACH ---
  {
    id: 'n_gate1',
    name: 'Main Gate 1 (NH-44)',
    coords: { lat: 31.25230, lng: 75.70220 },
    isEntrance: true,
    locationId: 'gate-1',
    hasStepFreeRamp: true,
    description: 'Main campus security and pedestrian turnstile entrance.',
  },
  {
    id: 'n_gate1_parking',
    name: 'Gate 1 Visitor Parking',
    coords: { lat: 31.25200, lng: 75.70270 },
    isEntrance: true,
    locationId: 'main-gate-parking',
    hasStepFreeRamp: true,
  },
  {
    id: 'n_b41_entrance',
    name: 'Building 41 Entrance (Boys Apartment Gate)',
    coords: { lat: 31.251697, lng: 75.701877 },
    isEntrance: true,
    locationId: 'building-41',
    hasStepFreeRamp: false, // Field coordinates: step-free ramp unverified
    description: 'Pedestrian entrance gate to Building 41 (Boys Apartment) identified via field survey coordinates.',
  },
  {
    id: 'n_block30',
    name: 'Block 30 (Admissions)',
    coords: { lat: 31.25300, lng: 75.70280 },
    isEntrance: true,
    locationId: 'block-30-admin',
    hasStepFreeRamp: true,
  },
  {
    id: 'n_spine_south',
    name: 'South Academic Boulevard Junction',
    coords: { lat: 31.25280, lng: 75.70240 },
    hasStepFreeRamp: true,
  },
  {
    id: 'n_block13',
    name: 'Block 13 Entrance',
    coords: { lat: 31.25290, lng: 75.70190 },
    isEntrance: true,
    locationId: 'block-13',
    hasStepFreeRamp: false, // Plinth has steps
  },
  {
    id: 'n_block25',
    name: 'Block 25-28 (Business School)',
    coords: { lat: 31.25350, lng: 75.70250 },
    isEntrance: true,
    locationId: 'block-25-28',
    hasStepFreeRamp: true,
  },
  {
    id: 'n_shanti_auditorium',
    name: 'Shanti Devi Mittal Auditorium',
    coords: { lat: 31.25380, lng: 75.70180 },
    isEntrance: true,
    locationId: 'shanti-devi-auditorium',
    hasStepFreeRamp: true,
  },

  // --- CENTRAL ACADEMIC SPINE ---
  {
    id: 'n_spine_central',
    name: 'Central Library Junction',
    coords: { lat: 31.25420, lng: 75.70350 },
    hasStepFreeRamp: true,
  },
  {
    id: 'n_library',
    name: 'Central Library Foyer',
    coords: { lat: 31.25410, lng: 75.70360 },
    isEntrance: true,
    locationId: 'central-library',
    hasStepFreeRamp: true, // Verified ground ramp
  },
  {
    id: 'n_block34',
    name: 'Block 34 (School of CSE)',
    coords: { lat: 31.25475, lng: 75.70375 },
    isEntrance: true,
    locationId: 'block-34',
    hasStepFreeRamp: true, // Verified west ramp
  },
  {
    id: 'n_kiosks_34',
    name: 'Block 34 Kiosks',
    coords: { lat: 31.25490, lng: 75.70390 },
    isEntrance: true,
    locationId: 'block-34-kiosk-cluster',
    hasStepFreeRamp: true,
  },
  {
    id: 'n_spine_north_1',
    name: 'Block 36 Junction',
    coords: { lat: 31.25520, lng: 75.70390 },
    hasStepFreeRamp: true,
  },
  {
    id: 'n_block36',
    name: 'Block 36 (Academic & Exam)',
    coords: { lat: 31.25565, lng: 75.70415 },
    isEntrance: true,
    locationId: 'block-36',
    hasStepFreeRamp: false, // Entrance requires step survey
  },
  {
    id: 'n_spine_north_2',
    name: 'Block 38 Junction',
    coords: { lat: 31.25610, lng: 75.70430 },
    hasStepFreeRamp: true,
  },
  {
    id: 'n_block38',
    name: 'Block 38 (ECE & Mechanical)',
    coords: { lat: 31.25655, lng: 75.70455 },
    isEntrance: true,
    locationId: 'block-38',
    hasStepFreeRamp: false,
  },

  // --- UNIPOLIS & NORTH ACADEMIC ---
  {
    id: 'n_unipolis_concourse',
    name: 'Baldev Raj Mittal Unipolis',
    coords: { lat: 31.25620, lng: 75.70270 },
    isEntrance: true,
    locationId: 'unipolis',
    hasStepFreeRamp: true, // Grade level open concourse
  },
  {
    id: 'n_north_junction',
    name: 'North Ring Junction',
    coords: { lat: 31.25680, lng: 75.70350 },
    hasStepFreeRamp: true,
  },
  {
    id: 'n_block55',
    name: 'Block 55-56 (School of Design)',
    coords: { lat: 31.25820, lng: 75.70320 },
    isEntrance: true,
    locationId: 'block-55-56',
    hasStepFreeRamp: false,
  },
  {
    id: 'n_gate2',
    name: 'Campus Gate 2 (North)',
    coords: { lat: 31.25750, lng: 75.70120 },
    isEntrance: true,
    locationId: 'gate-2',
    hasStepFreeRamp: true,
  },
  {
    id: 'n_gate3',
    name: 'Campus Gate 3 (North-East)',
    coords: { lat: 31.25920, lng: 75.70280 },
    isEntrance: true,
    locationId: 'gate-3',
    hasStepFreeRamp: true,
  },

  // --- UNIMALL & COMMERCIAL SPINE ---
  {
    id: 'n_unimall_crossway',
    name: 'UniMall Connector Walkway',
    coords: { lat: 31.25415, lng: 75.70460 },
    hasStepFreeRamp: true,
  },
  {
    id: 'n_unimall',
    name: 'UniMall Plaza Main Entrance',
    coords: { lat: 31.25420, lng: 75.70560 },
    isEntrance: true,
    locationId: 'unimall',
    hasStepFreeRamp: true, // Grade level glass automatic doors
  },
  {
    id: 'n_unimall_food_court',
    name: 'UniMall Food Court',
    coords: { lat: 31.25410, lng: 75.70580 },
    isEntrance: true,
    locationId: 'unimall-food-court',
    hasStepFreeRamp: true,
  },
  {
    id: 'n_unimall_parking',
    name: 'UniMall Commercial Parking',
    coords: { lat: 31.25390, lng: 75.70530 },
    isEntrance: true,
    locationId: 'unimall-parking',
    hasStepFreeRamp: true,
  },

  // --- HEALTH & EAST PERIMETER ROAD ---
  {
    id: 'n_unihospital',
    name: 'UniHospital & Clinic',
    coords: { lat: 31.25260, lng: 75.70500 },
    isEntrance: true,
    locationId: 'unihospital',
    hasStepFreeRamp: true, // Verified ambulance grade ramp
  },
  {
    id: 'n_east_ring_south',
    name: 'East Ring Road (South)',
    coords: { lat: 31.25250, lng: 75.70620 },
    hasStepFreeRamp: true,
  },
  {
    id: 'n_east_ring_mid',
    name: 'East Ring Road (Mid / Hostels)',
    coords: { lat: 31.25450, lng: 75.70700 },
    hasStepFreeRamp: true,
  },
  {
    id: 'n_east_ring_north',
    name: 'East Ring Road (North / Stadium)',
    coords: { lat: 31.25650, lng: 75.70650 },
    hasStepFreeRamp: true,
  },

  // --- SPORTS COMPLEX ---
  {
    id: 'n_sports_complex',
    name: 'Indoor Sports Complex',
    coords: { lat: 31.25700, lng: 75.70650 },
    isEntrance: true,
    locationId: 'sports-complex',
    hasStepFreeRamp: true,
  },
  {
    id: 'n_stadium',
    name: 'Cricket & Athletics Stadium',
    coords: { lat: 31.25600, lng: 75.70720 },
    isEntrance: true,
    locationId: 'cricket-stadium',
    hasStepFreeRamp: true,
  },

  // --- BOYS HOSTELS ---
  {
    id: 'n_bh1',
    name: 'Boys Hostel 1 (BH-1)',
    coords: { lat: 31.25320, lng: 75.70720 },
    isEntrance: true,
    locationId: 'bh-1',
    hasStepFreeRamp: false, // Plinth steps pending ramp survey
  },
  {
    id: 'n_bh2',
    name: 'Boys Hostel 2 (BH-2)',
    coords: { lat: 31.25380, lng: 75.70780 },
    isEntrance: true,
    locationId: 'bh-2',
    hasStepFreeRamp: false,
  },
  {
    id: 'n_bh3',
    name: 'Boys Hostel 3 (BH-3)',
    coords: { lat: 31.25460, lng: 75.70820 },
    isEntrance: true,
    locationId: 'bh-3',
    hasStepFreeRamp: false,
  },
  {
    id: 'n_bh4',
    name: 'Boys Hostel 4 (BH-4)',
    coords: { lat: 31.25520, lng: 75.70850 },
    isEntrance: true,
    locationId: 'bh-4',
    hasStepFreeRamp: false,
  },
  {
    id: 'n_bh5',
    name: 'Boys Hostel 5 (BH-5)',
    coords: { lat: 31.25200, lng: 75.70650 },
    isEntrance: true,
    locationId: 'bh-5',
    hasStepFreeRamp: false,
  },
  {
    id: 'n_bh6',
    name: 'Boys Hostel 6 (BH-6)',
    coords: { lat: 31.25150, lng: 75.70720 },
    isEntrance: true,
    locationId: 'bh-6',
    hasStepFreeRamp: false,
  },

  // --- GIRLS HOSTELS ---
  {
    id: 'n_gh_junction',
    name: 'Girls Hostel Avenue Junction',
    coords: { lat: 31.25700, lng: 75.70240 },
    hasStepFreeRamp: true,
  },
  {
    id: 'n_gh1',
    name: 'Girls Hostel 1 (GH-1)',
    coords: { lat: 31.25720, lng: 75.70220 },
    isEntrance: true,
    locationId: 'gh-1',
    hasStepFreeRamp: false,
  },
  {
    id: 'n_gh2',
    name: 'Girls Hostel 2 (GH-2)',
    coords: { lat: 31.25780, lng: 75.70250 },
    isEntrance: true,
    locationId: 'gh-2',
    hasStepFreeRamp: false,
  },
  {
    id: 'n_gh3',
    name: 'Girls Hostel 3 (GH-3)',
    coords: { lat: 31.25850, lng: 75.70280 },
    isEntrance: true,
    locationId: 'gh-3',
    hasStepFreeRamp: false,
  },
  {
    id: 'n_gh4',
    name: 'Girls Hostel 4 (GH-4)',
    coords: { lat: 31.25900, lng: 75.70320 },
    isEntrance: true,
    locationId: 'gh-4',
    hasStepFreeRamp: false,
  },
];

// Helper to construct bidirectional edge
function createEdge(
  id: string,
  from: string,
  to: string,
  nodesMap: Record<string, CampusGraphNode>,
  allowedModes: ('walking' | 'bike' | 'car' | 'wheelchair')[],
  pathName: string,
  isWheelchairAccessible = false,
  surface: 'paved_asphalt' | 'concrete' | 'paver_blocks' = 'paved_asphalt'
): CampusGraphEdge {
  const fromNode = nodesMap[from];
  const toNode = nodesMap[to];
  const distance = fromNode && toNode ? haversine(fromNode.coords, toNode.coords) : 50;

  return {
    id,
    from,
    to,
    distanceMeters: distance,
    allowedModes,
    pathName,
    isWheelchairAccessible,
    surface,
  };
}

export function buildCampusRouteGraph(): CampusRouteGraph {
  const nodes: Record<string, CampusGraphNode> = {};
  for (const node of nodesArray) {
    nodes[node.id] = node;
  }

  const edges: CampusGraphEdge[] = [
    // --- MAIN GATE 1 & PARKING LOOP (VEHICULAR + PEDESTRIAN + BIKE) ---
    createEdge('e_g1_parking', 'n_gate1', 'n_gate1_parking', nodes, ['walking', 'bike', 'car', 'wheelchair'], 'Main Gate Loop', true),
    createEdge('e_parking_g1', 'n_gate1_parking', 'n_gate1', nodes, ['walking', 'bike', 'car', 'wheelchair'], 'Main Gate Loop', true),

    createEdge('e_g1_spine', 'n_gate1', 'n_spine_south', nodes, ['walking', 'bike', 'wheelchair'], 'Campus Entrance Boulevard', true),
    createEdge('e_spine_g1', 'n_spine_south', 'n_gate1', nodes, ['walking', 'bike', 'wheelchair'], 'Campus Entrance Boulevard', true),

    createEdge('e_g1_hosp', 'n_gate1_parking', 'n_unihospital', nodes, ['walking', 'bike', 'car', 'wheelchair'], 'South Perimeter Access Road', true),
    createEdge('e_hosp_g1', 'n_unihospital', 'n_gate1_parking', nodes, ['walking', 'bike', 'car', 'wheelchair'], 'South Perimeter Access Road', true),

    // Block 30 Admin Access
    createEdge('e_spine_b30', 'n_spine_south', 'n_block30', nodes, ['walking', 'bike', 'wheelchair'], 'Admissions Access Walk', true),
    createEdge('e_b30_spine', 'n_block30', 'n_spine_south', nodes, ['walking', 'bike', 'wheelchair'], 'Admissions Access Walk', true),

    // Building 41 (Boys Apartment) Verified Pedestrian Walkway from Gate 1
    // Important: Field-survey coordinates. Only verified for pedestrian walking. Wheelchair ramp & vehicular road unverified.
    createEdge('e_g1_b41', 'n_gate1', 'n_b41_entrance', nodes, ['walking'], 'Gate 1 South Pedestrian Walkway to Building 41', false),
    createEdge('e_b41_g1', 'n_b41_entrance', 'n_gate1', nodes, ['walking'], 'Gate 1 South Pedestrian Walkway', false),

    // Block 13 Polytechnic Access
    createEdge('e_spine_b13', 'n_spine_south', 'n_block13', nodes, ['walking', 'bike'], 'Polytechnic West Corridor', false),
    createEdge('e_b13_spine', 'n_block13', 'n_spine_south', nodes, ['walking', 'bike'], 'Polytechnic West Corridor', false),

    // --- CENTRAL ACADEMIC BOULEVARD (PEDESTRIAN & CYCLE & WHEELCHAIR ONLY - NO CARS) ---
    createEdge('e_sp_b25', 'n_spine_south', 'n_block25', nodes, ['walking', 'bike', 'wheelchair'], 'Central Academic Boulevard', true),
    createEdge('e_b25_sp', 'n_block25', 'n_spine_south', nodes, ['walking', 'bike', 'wheelchair'], 'Central Academic Boulevard', true),

    createEdge('e_b25_shanti', 'n_block25', 'n_shanti_auditorium', nodes, ['walking', 'bike', 'wheelchair'], 'Auditorium Plaza', true),
    createEdge('e_shanti_b25', 'n_shanti_auditorium', 'n_block25', nodes, ['walking', 'bike', 'wheelchair'], 'Auditorium Plaza', true),

    createEdge('e_b25_lib', 'n_block25', 'n_spine_central', nodes, ['walking', 'bike', 'wheelchair'], 'Central Academic Boulevard', true),
    createEdge('e_lib_b25', 'n_spine_central', 'n_block25', nodes, ['walking', 'bike', 'wheelchair'], 'Central Academic Boulevard', true),

    // Central Library entrance
    createEdge('e_sp_lib', 'n_spine_central', 'n_library', nodes, ['walking', 'wheelchair'], 'Central Library Foyer Ramp', true),
    createEdge('e_lib_sp', 'n_library', 'n_spine_central', nodes, ['walking', 'wheelchair'], 'Central Library Foyer Ramp', true),

    // Library Junction to Block 34 (School of CSE)
    createEdge('e_sp_b34', 'n_spine_central', 'n_block34', nodes, ['walking', 'bike', 'wheelchair'], 'Academic Walkway to Block 34', true),
    createEdge('e_b34_sp', 'n_block34', 'n_spine_central', nodes, ['walking', 'bike', 'wheelchair'], 'Academic Walkway to Block 34', true),

    createEdge('e_b34_kiosk', 'n_block34', 'n_kiosks_34', nodes, ['walking', 'wheelchair'], 'Block 34 Refreshment Foyer', true),
    createEdge('e_kiosk_b34', 'n_kiosks_34', 'n_block34', nodes, ['walking', 'wheelchair'], 'Block 34 Refreshment Foyer', true),

    createEdge('e_kiosk_spn1', 'n_kiosks_34', 'n_spine_north_1', nodes, ['walking', 'bike', 'wheelchair'], 'Central Academic Boulevard', true),
    createEdge('e_spn1_kiosk', 'n_spine_north_1', 'n_kiosks_34', nodes, ['walking', 'bike', 'wheelchair'], 'Central Academic Boulevard', true),

    // Block 36 Academic & Exam
    createEdge('e_spn1_b36', 'n_spine_north_1', 'n_block36', nodes, ['walking', 'bike'], 'Block 36 Examination Concourse', false),
    createEdge('e_b36_spn1', 'n_block36', 'n_spine_north_1', nodes, ['walking', 'bike'], 'Block 36 Examination Concourse', false),

    createEdge('e_spn1_spn2', 'n_spine_north_1', 'n_spine_north_2', nodes, ['walking', 'bike', 'wheelchair'], 'Central Academic Boulevard', true),
    createEdge('e_spn2_spn1', 'n_spine_north_2', 'n_spine_north_1', nodes, ['walking', 'bike', 'wheelchair'], 'Central Academic Boulevard', true),

    // Block 38 Mechanical & ECE
    createEdge('e_spn2_b38', 'n_spine_north_2', 'n_block38', nodes, ['walking', 'bike'], 'Block 38 Workshop Walkway', false),
    createEdge('e_b38_spn2', 'n_block38', 'n_spine_north_2', nodes, ['walking', 'bike'], 'Block 38 Workshop Walkway', false),

    // Connect north spine to Unipolis & North Junction
    createEdge('e_spn2_north', 'n_spine_north_2', 'n_north_junction', nodes, ['walking', 'bike', 'wheelchair'], 'Northern Academic Ring', true),
    createEdge('e_north_spn2', 'n_north_junction', 'n_spine_north_2', nodes, ['walking', 'bike', 'wheelchair'], 'Northern Academic Ring', true),

    createEdge('e_north_unipolis', 'n_north_junction', 'n_unipolis_concourse', nodes, ['walking', 'bike', 'wheelchair'], 'Unipolis Concourse Approach', true),
    createEdge('e_unipolis_north', 'n_unipolis_concourse', 'n_north_junction', nodes, ['walking', 'bike', 'wheelchair'], 'Unipolis Concourse Approach', true),

    createEdge('e_unipolis_spn1', 'n_unipolis_concourse', 'n_spine_north_1', nodes, ['walking', 'bike', 'wheelchair'], 'West Academic Spine Connector', true),
    createEdge('e_spn1_unipolis', 'n_spine_north_1', 'n_unipolis_concourse', nodes, ['walking', 'bike', 'wheelchair'], 'West Academic Spine Connector', true),

    createEdge('e_north_b55', 'n_north_junction', 'n_block55', nodes, ['walking', 'bike'], 'Design School Avenue', false),
    createEdge('e_b55_north', 'n_block55', 'n_north_junction', nodes, ['walking', 'bike'], 'Design School Avenue', false),

    // --- GIRLS HOSTEL SECTOR (NORTH-WEST) ---
    createEdge('e_unipolis_ghj', 'n_unipolis_concourse', 'n_gh_junction', nodes, ['walking', 'bike', 'wheelchair'], 'Girls Residential Boulevard', true),
    createEdge('e_ghj_unipolis', 'n_gh_junction', 'n_unipolis_concourse', nodes, ['walking', 'bike', 'wheelchair'], 'Girls Residential Boulevard', true),

    createEdge('e_ghj_gh1', 'n_gh_junction', 'n_gh1', nodes, ['walking', 'bike'], 'GH-1 Entrance Walkway', false),
    createEdge('e_gh1_ghj', 'n_gh1', 'n_gh_junction', nodes, ['walking', 'bike'], 'GH-1 Entrance Walkway', false),

    createEdge('e_ghj_gh2', 'n_gh_junction', 'n_gh2', nodes, ['walking', 'bike'], 'GH-2 Residential Walkway', false),
    createEdge('e_gh2_ghj', 'n_gh2', 'n_gh_junction', nodes, ['walking', 'bike'], 'GH-2 Residential Walkway', false),

    createEdge('e_gh2_gh3', 'n_gh2', 'n_gh3', nodes, ['walking', 'bike'], 'Girls Hostel Central Lane', false),
    createEdge('e_gh3_gh2', 'n_gh3', 'n_gh2', nodes, ['walking', 'bike'], 'Girls Hostel Central Lane', false),

    createEdge('e_gh3_gh4', 'n_gh3', 'n_gh4', nodes, ['walking', 'bike'], 'Girls Hostel North Lane', false),
    createEdge('e_gh4_gh3', 'n_gh4', 'n_gh3', nodes, ['walking', 'bike'], 'Girls Hostel North Lane', false),

    createEdge('e_ghj_gate2', 'n_gh_junction', 'n_gate2', nodes, ['walking', 'bike', 'car', 'wheelchair'], 'Gate 2 Perimeter Approach', true),
    createEdge('e_gate2_ghj', 'n_gate2', 'n_gh_junction', nodes, ['walking', 'bike', 'car', 'wheelchair'], 'Gate 2 Perimeter Approach', true),

    createEdge('e_b55_gate3', 'n_block55', 'n_gate3', nodes, ['walking', 'bike', 'car'], 'Gate 3 Service Road', false),
    createEdge('e_gate3_b55', 'n_gate3', 'n_block55', nodes, ['walking', 'bike', 'car'], 'Gate 3 Service Road', false),

    // --- UNIMALL PEDESTRIAN CONNECTOR (SPINE <-> UNIMALL) ---
    createEdge('e_sp_um_cross', 'n_spine_central', 'n_unimall_crossway', nodes, ['walking', 'bike', 'wheelchair'], 'Central Cross-Mall Walkway', true),
    createEdge('e_um_cross_sp', 'n_unimall_crossway', 'n_spine_central', nodes, ['walking', 'bike', 'wheelchair'], 'Central Cross-Mall Walkway', true),

    createEdge('e_cross_unimall', 'n_unimall_crossway', 'n_unimall', nodes, ['walking', 'bike', 'wheelchair'], 'UniMall Grand Entrance Plaza', true),
    createEdge('e_unimall_cross', 'n_unimall', 'n_unimall_crossway', nodes, ['walking', 'bike', 'wheelchair'], 'UniMall Grand Entrance Plaza', true),

    createEdge('e_unimall_fc', 'n_unimall', 'n_unimall_food_court', nodes, ['walking', 'wheelchair'], 'UniMall Food Court Gallery', true),
    createEdge('e_fc_unimall', 'n_unimall_food_court', 'n_unimall', nodes, ['walking', 'wheelchair'], 'UniMall Food Court Gallery', true),

    createEdge('e_unimall_pkg', 'n_unimall', 'n_unimall_parking', nodes, ['walking', 'bike', 'wheelchair'], 'UniMall Paved Walkway', true),
    createEdge('e_pkg_unimall', 'n_unimall_parking', 'n_unimall', nodes, ['walking', 'bike', 'wheelchair'], 'UniMall Paved Walkway', true),

    // --- EAST CAMPUS RING ROAD (VEHICULAR + CYCLES + PEDESTRIANS) ---
    createEdge('e_hosp_um_pkg', 'n_unihospital', 'n_unimall_parking', nodes, ['walking', 'bike', 'car', 'wheelchair'], 'East Campus Avenue', true),
    createEdge('e_um_pkg_hosp', 'n_unimall_parking', 'n_unihospital', nodes, ['walking', 'bike', 'car', 'wheelchair'], 'East Campus Avenue', true),

    createEdge('e_um_pkg_ering', 'n_unimall_parking', 'n_east_ring_south', nodes, ['walking', 'bike', 'car'], 'UniMall Ring Connector', false),
    createEdge('e_ering_um_pkg', 'n_east_ring_south', 'n_unimall_parking', nodes, ['walking', 'bike', 'car'], 'UniMall Ring Connector', false),

    createEdge('e_ering_s_m', 'n_east_ring_south', 'n_east_ring_mid', nodes, ['walking', 'bike', 'car', 'wheelchair'], 'East Perimeter Ring Road', true),
    createEdge('e_ering_m_s', 'n_east_ring_mid', 'n_east_ring_south', nodes, ['walking', 'bike', 'car', 'wheelchair'], 'East Perimeter Ring Road', true),

    createEdge('e_ering_m_n', 'n_east_ring_mid', 'n_east_ring_north', nodes, ['walking', 'bike', 'car', 'wheelchair'], 'East Perimeter Ring Road', true),
    createEdge('e_ering_n_m', 'n_east_ring_north', 'n_east_ring_mid', nodes, ['walking', 'bike', 'car', 'wheelchair'], 'East Perimeter Ring Road', true),

    // UniMall to East Ring mid
    createEdge('e_unimall_ering_m', 'n_unimall', 'n_east_ring_mid', nodes, ['walking', 'bike'], 'Hostel Connector Avenue', false),
    createEdge('e_ering_m_unimall', 'n_east_ring_mid', 'n_unimall', nodes, ['walking', 'bike'], 'Hostel Connector Avenue', false),

    // Sports Complex & Stadium
    createEdge('e_ering_n_sports', 'n_east_ring_north', 'n_sports_complex', nodes, ['walking', 'bike', 'car', 'wheelchair'], 'Sports Complex Entrance Road', true),
    createEdge('e_sports_ering_n', 'n_sports_complex', 'n_east_ring_north', nodes, ['walking', 'bike', 'car', 'wheelchair'], 'Sports Complex Entrance Road', true),

    createEdge('e_ering_n_stadium', 'n_east_ring_north', 'n_stadium', nodes, ['walking', 'bike', 'wheelchair'], 'Cricket Stadium Walkway', true),
    createEdge('e_stadium_ering_n', 'n_stadium', 'n_east_ring_north', nodes, ['walking', 'bike', 'wheelchair'], 'Cricket Stadium Walkway', true),

    // North Ring closing loop to north junction
    createEdge('e_sports_north', 'n_sports_complex', 'n_north_junction', nodes, ['walking', 'bike', 'car', 'wheelchair'], 'North-East Perimeter Road', true),
    createEdge('e_north_sports', 'n_north_junction', 'n_sports_complex', nodes, ['walking', 'bike', 'car', 'wheelchair'], 'North-East Perimeter Road', true),

    // --- BOYS HOSTELS CONNECTORS ---
    createEdge('e_ering_s_bh5', 'n_east_ring_south', 'n_bh5', nodes, ['walking', 'bike'], 'BH-5 Residential Walkway', false),
    createEdge('e_bh5_ering_s', 'n_bh5', 'n_east_ring_south', nodes, ['walking', 'bike'], 'BH-5 Residential Walkway', false),

    createEdge('e_bh5_bh6', 'n_bh5', 'n_bh6', nodes, ['walking', 'bike'], 'South Residential Lane', false),
    createEdge('e_bh6_bh5', 'n_bh6', 'n_bh5', nodes, ['walking', 'bike'], 'South Residential Lane', false),

    createEdge('e_ering_m_bh1', 'n_east_ring_mid', 'n_bh1', nodes, ['walking', 'bike'], 'BH-1 Residential Walkway', false),
    createEdge('e_bh1_ering_m', 'n_bh1', 'n_east_ring_mid', nodes, ['walking', 'bike'], 'BH-1 Residential Walkway', false),

    createEdge('e_bh1_bh2', 'n_bh1', 'n_bh2', nodes, ['walking', 'bike'], 'Boys Hostel Avenue', false),
    createEdge('e_bh2_bh1', 'n_bh2', 'n_bh1', nodes, ['walking', 'bike'], 'Boys Hostel Avenue', false),

    createEdge('e_bh2_bh3', 'n_bh2', 'n_bh3', nodes, ['walking', 'bike'], 'Boys Hostel Avenue', false),
    createEdge('e_bh3_bh2', 'n_bh3', 'n_bh2', nodes, ['walking', 'bike'], 'Boys Hostel Avenue', false),

    createEdge('e_bh3_bh4', 'n_bh3', 'n_bh4', nodes, ['walking', 'bike'], 'Boys Hostel Avenue', false),
    createEdge('e_bh4_bh3', 'n_bh4', 'n_bh3', nodes, ['walking', 'bike'], 'Boys Hostel Avenue', false),

    createEdge('e_bh4_ering_n', 'n_bh4', 'n_east_ring_north', nodes, ['walking', 'bike'], 'BH-4 to Sports Arena Lane', false),
    createEdge('e_ering_n_bh4', 'n_east_ring_north', 'n_bh4', nodes, ['walking', 'bike'], 'BH-4 to Sports Arena Lane', false),
  ];

  return {
    nodes,
    edges,
    version: '2.0.0-verified',
  };
}

export const campusRouteGraph = buildCampusRouteGraph();
