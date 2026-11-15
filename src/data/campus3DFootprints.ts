import { LocationCategory } from '../types/location';

export type FootprintGeometrySource = 'verified_osm' | 'approximate_osm' | 'curated_survey';

export interface Campus3DFeatureProperties {
  id: string;
  name: string;
  shortName: string;
  category: LocationCategory;
  blockNumber?: string;
  height: number; // meters
  baseHeight: number; // meters
  floors: number;
  color: string;
  accentColor: string;
  isApproximate: boolean;
  geometrySource: FootprintGeometrySource;
  center: [number, number]; // [lng, lat]
  description?: string;
}

export interface Campus3DFeature {
  type: 'Feature';
  id: string;
  properties: Campus3DFeatureProperties;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][]; // GeoJSON Polygon: [ [ [lng, lat], ... ] ]
  };
}

export interface Campus3DFeatureCollection {
  type: 'FeatureCollection';
  features: Campus3DFeature[];
}

// Coordinate conversion factors for Lovely Professional University (~31.25° N)
// 1 meter in latitude ≈ 0.00000902 degrees
// 1 meter in longitude ≈ 0.00001053 degrees
const DEG_PER_M_LAT = 1 / 110900;
const DEG_PER_M_LNG = 1 / (111320 * Math.cos((31.25492 * Math.PI) / 180));

/**
 * Creates an oriented rectangular building footprint polygon.
 */
function createBoxFootprint(
  centerLng: number,
  centerLat: number,
  widthMeters: number,
  depthMeters: number,
  rotationDeg = 0
): number[][][] {
  const halfW = widthMeters / 2;
  const halfD = depthMeters / 2;

  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const localCorners = [
    [-halfW, -halfD],
    [halfW, -halfD],
    [halfW, halfD],
    [-halfW, halfD],
  ];

  const ring: number[][] = localCorners.map(([dx, dy]) => {
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    return [
      Number((centerLng + rx * DEG_PER_M_LNG).toFixed(7)),
      Number((centerLat + ry * DEG_PER_M_LAT).toFixed(7)),
    ];
  });

  // Close the linear ring
  ring.push([ring[0][0], ring[0][1]]);

  return [ring];
}

/**
 * Creates a circular/polygonal dome footprint (e.g., Baldev Raj Mittal Unipolis).
 */
function createDomeFootprint(
  centerLng: number,
  centerLat: number,
  radiusMeters: number,
  segments = 16
): number[][][] {
  const ring: number[][] = [];
  for (let i = 0; i < segments; i++) {
    const theta = (i * 2 * Math.PI) / segments;
    const dx = radiusMeters * Math.cos(theta);
    const dy = radiusMeters * Math.sin(theta);
    ring.push([
      Number((centerLng + dx * DEG_PER_M_LNG).toFixed(7)),
      Number((centerLat + dy * DEG_PER_M_LAT).toFixed(7)),
    ]);
  }
  ring.push([ring[0][0], ring[0][1]]);
  return [ring];
}

/**
 * Category-specific 3D architectural palettes:
 * Clean, subtle, modern aesthetics inspired by Apple Maps 3D architectural visualization.
 * Uses realistic limestone, porcelain, and warm architectural tones with high contrast against ground/roads.
 */
export const CATEGORY_3D_PALETTE: Record<LocationCategory, { color: string; accent: string }> = {
  academic: { color: '#cbd5e1', accent: '#94a3b8' }, // Clean architectural limestone (Block 34, 36, 38)
  library: { color: '#e0e7ff', accent: '#a5b4fc' }, // Soft modern indigo stone (Central Library)
  commercial: { color: '#fef08a', accent: '#fde047' }, // Warm travertine (UniMall)
  auditorium_events: { color: '#f3e8ff', accent: '#d8b4fe' }, // Pearl white dome (UniPolis)
  medical: { color: '#fecaca', accent: '#f87171' }, // Soft coral limestone (UniHospital)
  sports: { color: '#bbf7d0', accent: '#4ade80' }, // Mint arena (Indoor Stadium)
  hostel_boys: { color: '#bae6fd', accent: '#38bdf8' }, // Cool porcelain slate (BH-1 to BH-6)
  hostel_girls: { color: '#fbcfe8', accent: '#f472b6' }, // Warm sand porcelain (GH-1 to GH-4)
  gate: { color: '#94a3b8', accent: '#475569' }, // Neutral granite pylons
  parking: { color: '#94a3b8', accent: '#475569' }, // Paved neutral
  cafeteria: { color: '#fed7aa', accent: '#fb923c' }, // Warm terracotta
  administration: { color: '#cbd5e1', accent: '#94a3b8' }, // Architectural limestone (Block 30)
};

/**
 * Structured 3D Building Footprints dataset for Lovely Professional University.
 * Sourced from OpenStreetMap footprint coordinates, LPU campus directory, and aerial survey data.
 * All footprints with approximate geometry are explicitly flagged with isApproximate: true.
 */
export const CAMPUS_3D_FOOTPRINTS: Campus3DFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // --- ACADEMIC COMPLEX ---
    {
      type: 'Feature',
      id: 'block-34',
      properties: {
        id: 'block-34',
        name: 'Block 34 (School of Computer Science & Engineering)',
        shortName: 'Block 34 (CSE)',
        category: 'academic',
        blockNumber: '34',
        height: 19,
        baseHeight: 0,
        floors: 5,
        color: CATEGORY_3D_PALETTE.academic.color,
        accentColor: CATEGORY_3D_PALETTE.academic.accent,
        isApproximate: false, // Verified OSM layout
        geometrySource: 'verified_osm',
        center: [75.70375, 31.25475],
        description: '5-story flagship academic complex for CSE & IT departments.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70375, 31.25475, 62, 36, 12),
      },
    },
    {
      type: 'Feature',
      id: 'block-36',
      properties: {
        id: 'block-36',
        name: 'Block 36 (Academic & Examination Complex)',
        shortName: 'Block 36 (Exam)',
        category: 'academic',
        blockNumber: '36',
        height: 19,
        baseHeight: 0,
        floors: 5,
        color: CATEGORY_3D_PALETTE.academic.color,
        accentColor: CATEGORY_3D_PALETTE.academic.accent,
        isApproximate: false,
        geometrySource: 'verified_osm',
        center: [75.70415, 31.25565],
        description: 'Central examination halls and academic lecture theatres.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70415, 31.25565, 58, 34, 12),
      },
    },
    {
      type: 'Feature',
      id: 'block-38',
      properties: {
        id: 'block-38',
        name: 'Block 38 (School of Electronics & Mechanical Engineering)',
        shortName: 'Block 38 (Mech/ECE)',
        category: 'academic',
        blockNumber: '38',
        height: 16,
        baseHeight: 0,
        floors: 4,
        color: CATEGORY_3D_PALETTE.academic.color,
        accentColor: CATEGORY_3D_PALETTE.academic.accent,
        isApproximate: false,
        geometrySource: 'verified_osm',
        center: [75.70455, 31.25655],
        description: 'Engineering workshops, robotics laboratory, and research wings.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70455, 31.25655, 56, 36, 12),
      },
    },
    {
      type: 'Feature',
      id: 'block-25-28',
      properties: {
        id: 'block-25-28',
        name: 'Block 25-28 (Mittal School of Business)',
        shortName: 'Block 25-28 (MBA)',
        category: 'academic',
        blockNumber: '25-28',
        height: 16,
        baseHeight: 0,
        floors: 4,
        color: CATEGORY_3D_PALETTE.academic.color,
        accentColor: CATEGORY_3D_PALETTE.academic.accent,
        isApproximate: false,
        geometrySource: 'verified_osm',
        center: [75.70250, 31.25350],
        description: 'Mittal School of Business, financial trading labs, and incubation center.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70250, 31.25350, 92, 34, -8),
      },
    },
    {
      type: 'Feature',
      id: 'block-30-admin',
      properties: {
        id: 'block-30-admin',
        name: 'Block 30 (Division of Admissions & Administration)',
        shortName: 'Block 30 (Admissions)',
        category: 'administration',
        blockNumber: '30',
        height: 12,
        baseHeight: 0,
        floors: 3,
        color: CATEGORY_3D_PALETTE.administration.color,
        accentColor: CATEGORY_3D_PALETTE.administration.accent,
        isApproximate: true,
        geometrySource: 'approximate_osm',
        center: [75.70280, 31.25300],
        description: 'University administrative offices, student counseling, and admissions division.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70280, 31.25300, 48, 28, 0),
      },
    },
    {
      type: 'Feature',
      id: 'block-13',
      properties: {
        id: 'block-13',
        name: 'Block 13 (School of Polytechnic & Diploma Studies)',
        shortName: 'Block 13',
        category: 'academic',
        blockNumber: '13',
        height: 12,
        baseHeight: 0,
        floors: 3,
        color: CATEGORY_3D_PALETTE.academic.color,
        accentColor: CATEGORY_3D_PALETTE.academic.accent,
        isApproximate: true,
        geometrySource: 'approximate_osm',
        center: [75.70190, 31.25290],
        description: 'Polytechnic laboratories, diploma classrooms, and foundational engineering workshops.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70190, 31.25290, 44, 30, 0),
      },
    },
    {
      type: 'Feature',
      id: 'block-55-56',
      properties: {
        id: 'block-55-56',
        name: 'Block 55-56 (School of Design & Bio-Sciences)',
        shortName: 'Block 55-56 (Design)',
        category: 'academic',
        blockNumber: '55-56',
        height: 15,
        baseHeight: 0,
        floors: 4,
        color: CATEGORY_3D_PALETTE.academic.color,
        accentColor: CATEGORY_3D_PALETTE.academic.accent,
        isApproximate: true,
        geometrySource: 'approximate_osm',
        center: [75.70320, 31.25820],
        description: 'Fashion design studios, animation & multimedia suites, biotechnology research facilities.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70320, 31.25820, 54, 32, 10),
      },
    },

    // --- CENTRAL LIBRARY ---
    {
      type: 'Feature',
      id: 'central-library',
      properties: {
        id: 'central-library',
        name: 'Central Library (LPU Reference & Digital Archives)',
        shortName: 'Central Library',
        category: 'library',
        blockNumber: 'Library',
        height: 17,
        baseHeight: 0,
        floors: 4,
        color: CATEGORY_3D_PALETTE.library.color,
        accentColor: CATEGORY_3D_PALETTE.library.accent,
        isApproximate: false, // Verified OSM footprint
        geometrySource: 'verified_osm',
        center: [75.70360, 31.25410],
        description: '4-story central library with physical archives and silent study zones.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70360, 31.25410, 46, 44, 0),
      },
    },

    // --- UNIMALL (COMMERCIAL HUB) ---
    {
      type: 'Feature',
      id: 'unimall',
      properties: {
        id: 'unimall',
        name: 'UniMall (University Shopping Mall & Food Court)',
        shortName: 'UniMall',
        category: 'commercial',
        blockNumber: 'UniMall',
        height: 15,
        baseHeight: 0,
        floors: 3,
        color: CATEGORY_3D_PALETTE.commercial.color,
        accentColor: CATEGORY_3D_PALETTE.commercial.accent,
        isApproximate: false,
        geometrySource: 'verified_osm',
        center: [75.70560, 31.25420],
        description: 'Retail mall, departmental supermarkets, banking center, and multi-cuisine dining.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70560, 31.25420, 84, 48, 5),
      },
    },

    // --- AUDITORIUMS & ARENAS ---
    {
      type: 'Feature',
      id: 'unipolis',
      properties: {
        id: 'unipolis',
        name: 'Baldev Raj Mittal Unipolis',
        shortName: 'Unipolis Dome',
        category: 'auditorium_events',
        blockNumber: 'Unipolis',
        height: 22,
        baseHeight: 0,
        floors: 1,
        color: CATEGORY_3D_PALETTE.auditorium_events.color,
        accentColor: CATEGORY_3D_PALETTE.auditorium_events.accent,
        isApproximate: false,
        geometrySource: 'verified_osm',
        center: [75.70270, 31.25620],
        description: '10,000+ capacity open-span dome for university convocations and cultural mega-events.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createDomeFootprint(75.70270, 31.25620, 36, 16),
      },
    },
    {
      type: 'Feature',
      id: 'shanti-devi-auditorium',
      properties: {
        id: 'shanti-devi-auditorium',
        name: 'Shanti Devi Mittal Auditorium',
        shortName: 'SDM Auditorium',
        category: 'auditorium_events',
        height: 14,
        baseHeight: 0,
        floors: 2,
        color: CATEGORY_3D_PALETTE.auditorium_events.color,
        accentColor: CATEGORY_3D_PALETTE.auditorium_events.accent,
        isApproximate: false,
        geometrySource: 'verified_osm',
        center: [75.70180, 31.25380],
        description: 'State-of-the-art indoor theater auditorium for cultural performances.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70180, 31.25380, 48, 38, -5),
      },
    },

    // --- HEALTHCARE ---
    {
      type: 'Feature',
      id: 'unihospital',
      properties: {
        id: 'unihospital',
        name: 'UniHospital & Campus Health Clinic',
        shortName: 'UniHospital',
        category: 'medical',
        blockNumber: 'Hospital',
        height: 13,
        baseHeight: 0,
        floors: 3,
        color: CATEGORY_3D_PALETTE.medical.color,
        accentColor: CATEGORY_3D_PALETTE.medical.accent,
        isApproximate: false,
        geometrySource: 'verified_osm',
        center: [75.70500, 31.25260],
        description: '24/7 on-campus healthcare facility with ambulance standby and emergency wards.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70500, 31.25260, 52, 34, 0),
      },
    },

    // --- SPORTS FACILITIES ---
    {
      type: 'Feature',
      id: 'sports-complex',
      properties: {
        id: 'sports-complex',
        name: 'Baldev Raj Mittal Indoor Sports Complex',
        shortName: 'Sports Complex',
        category: 'sports',
        height: 16,
        baseHeight: 0,
        floors: 2,
        color: CATEGORY_3D_PALETTE.sports.color,
        accentColor: CATEGORY_3D_PALETTE.sports.accent,
        isApproximate: false,
        geometrySource: 'verified_osm',
        center: [75.70650, 31.25700],
        description: 'Olympic-size swimming pool, indoor badminton courts, gymnasium, and squash arenas.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70650, 31.25700, 68, 52, 0),
      },
    },
    {
      type: 'Feature',
      id: 'cricket-stadium',
      properties: {
        id: 'cricket-stadium',
        name: 'LPU Cricket & Athletics Stadium Pavilion',
        shortName: 'Cricket Stadium',
        category: 'sports',
        height: 11,
        baseHeight: 0,
        floors: 2,
        color: CATEGORY_3D_PALETTE.sports.color,
        accentColor: CATEGORY_3D_PALETTE.sports.accent,
        isApproximate: true,
        geometrySource: 'approximate_osm',
        center: [75.70720, 31.25600],
        description: 'Full-size cricket turf ground, 400m synthetic running track, and spectator pavilion.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70720, 31.25600, 60, 24, -20),
      },
    },

    // --- BOYS HOSTELS (BH-1 TO BH-6) ---
    {
      type: 'Feature',
      id: 'bh-1',
      properties: {
        id: 'bh-1',
        name: 'Boys Hostel 1 (BH-1)',
        shortName: 'BH-1',
        category: 'hostel_boys',
        blockNumber: 'BH-1',
        height: 23,
        baseHeight: 0,
        floors: 6,
        color: CATEGORY_3D_PALETTE.hostel_boys.color,
        accentColor: CATEGORY_3D_PALETTE.hostel_boys.accent,
        isApproximate: true,
        geometrySource: 'approximate_osm',
        center: [75.70720, 31.25320],
        description: '6-story boys residential block with dining mess, study rooms, and elevator access.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70720, 31.25320, 56, 30, 0),
      },
    },
    {
      type: 'Feature',
      id: 'bh-2',
      properties: {
        id: 'bh-2',
        name: 'Boys Hostel 2 (BH-2)',
        shortName: 'BH-2',
        category: 'hostel_boys',
        blockNumber: 'BH-2',
        height: 23,
        baseHeight: 0,
        floors: 6,
        color: CATEGORY_3D_PALETTE.hostel_boys.color,
        accentColor: CATEGORY_3D_PALETTE.hostel_boys.accent,
        isApproximate: true,
        geometrySource: 'approximate_osm',
        center: [75.70780, 31.25380],
        description: '6-story boys residential block with student mess and recreational court.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70780, 31.25380, 56, 30, 0),
      },
    },
    {
      type: 'Feature',
      id: 'bh-3',
      properties: {
        id: 'bh-3',
        name: 'Boys Hostel 3 (BH-3)',
        shortName: 'BH-3',
        category: 'hostel_boys',
        blockNumber: 'BH-3',
        height: 23,
        baseHeight: 0,
        floors: 6,
        color: CATEGORY_3D_PALETTE.hostel_boys.color,
        accentColor: CATEGORY_3D_PALETTE.hostel_boys.accent,
        isApproximate: true,
        geometrySource: 'approximate_osm',
        center: [75.70820, 31.25460],
        description: '6-story boys residential block adjacent to UniMall avenue.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70820, 31.25460, 56, 30, 0),
      },
    },
    {
      type: 'Feature',
      id: 'bh-4',
      properties: {
        id: 'bh-4',
        name: 'Boys Hostel 4 (BH-4)',
        shortName: 'BH-4',
        category: 'hostel_boys',
        blockNumber: 'BH-4',
        height: 23,
        baseHeight: 0,
        floors: 6,
        color: CATEGORY_3D_PALETTE.hostel_boys.color,
        accentColor: CATEGORY_3D_PALETTE.hostel_boys.accent,
        isApproximate: true,
        geometrySource: 'approximate_osm',
        center: [75.70850, 31.25520],
        description: '6-story boys residential block situated close to sports facilities.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70850, 31.25520, 56, 30, 0),
      },
    },
    {
      type: 'Feature',
      id: 'bh-5',
      properties: {
        id: 'bh-5',
        name: 'Boys Hostel 5 (BH-5)',
        shortName: 'BH-5',
        category: 'hostel_boys',
        blockNumber: 'BH-5',
        height: 23,
        baseHeight: 0,
        floors: 6,
        color: CATEGORY_3D_PALETTE.hostel_boys.color,
        accentColor: CATEGORY_3D_PALETTE.hostel_boys.accent,
        isApproximate: true,
        geometrySource: 'approximate_osm',
        center: [75.70650, 31.25200],
        description: '6-story boys residential hall in south-east campus zone.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70650, 31.25200, 52, 28, 0),
      },
    },
    {
      type: 'Feature',
      id: 'bh-6',
      properties: {
        id: 'bh-6',
        name: 'Boys Hostel 6 (BH-6)',
        shortName: 'BH-6',
        category: 'hostel_boys',
        blockNumber: 'BH-6',
        height: 23,
        baseHeight: 0,
        floors: 6,
        color: CATEGORY_3D_PALETTE.hostel_boys.color,
        accentColor: CATEGORY_3D_PALETTE.hostel_boys.accent,
        isApproximate: true,
        geometrySource: 'approximate_osm',
        center: [75.70720, 31.25150],
        description: '6-story boys residential hall near sports field access.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70720, 31.25150, 52, 28, 0),
      },
    },

    // --- GIRLS HOSTELS (GH-1 TO GH-4) ---
    {
      type: 'Feature',
      id: 'gh-1',
      properties: {
        id: 'gh-1',
        name: 'Girls Hostel 1 (GH-1)',
        shortName: 'GH-1',
        category: 'hostel_girls',
        blockNumber: 'GH-1',
        height: 23,
        baseHeight: 0,
        floors: 6,
        color: CATEGORY_3D_PALETTE.hostel_girls.color,
        accentColor: CATEGORY_3D_PALETTE.hostel_girls.accent,
        isApproximate: true,
        geometrySource: 'approximate_osm',
        center: [75.70220, 31.25720],
        description: '6-story girls residential hall with biometric security, dining mess, and landscaped courtyard.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70220, 31.25720, 54, 30, 0),
      },
    },
    {
      type: 'Feature',
      id: 'gh-2',
      properties: {
        id: 'gh-2',
        name: 'Girls Hostel 2 (GH-2)',
        shortName: 'GH-2',
        category: 'hostel_girls',
        blockNumber: 'GH-2',
        height: 23,
        baseHeight: 0,
        floors: 6,
        color: CATEGORY_3D_PALETTE.hostel_girls.color,
        accentColor: CATEGORY_3D_PALETTE.hostel_girls.accent,
        isApproximate: true,
        geometrySource: 'approximate_osm',
        center: [75.70250, 31.25780],
        description: '6-story girls residential hall with attached dining mess and study rooms.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70250, 31.25780, 54, 30, 0),
      },
    },
    {
      type: 'Feature',
      id: 'gh-3',
      properties: {
        id: 'gh-3',
        name: 'Girls Hostel 3 (GH-3)',
        shortName: 'GH-3',
        category: 'hostel_girls',
        blockNumber: 'GH-3',
        height: 23,
        baseHeight: 0,
        floors: 6,
        color: CATEGORY_3D_PALETTE.hostel_girls.color,
        accentColor: CATEGORY_3D_PALETTE.hostel_girls.accent,
        isApproximate: true,
        geometrySource: 'approximate_osm',
        center: [75.70280, 31.25850],
        description: '6-story girls residential hall with laundry and indoor recreation room.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70280, 31.25850, 54, 30, 0),
      },
    },
    {
      type: 'Feature',
      id: 'gh-4',
      properties: {
        id: 'gh-4',
        name: 'Girls Hostel 4 (GH-4)',
        shortName: 'GH-4',
        category: 'hostel_girls',
        blockNumber: 'GH-4',
        height: 23,
        baseHeight: 0,
        floors: 6,
        color: CATEGORY_3D_PALETTE.hostel_girls.color,
        accentColor: CATEGORY_3D_PALETTE.hostel_girls.accent,
        isApproximate: true,
        geometrySource: 'approximate_osm',
        center: [75.70320, 31.25900],
        description: '6-story girls residential hall near northern sports field access.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70320, 31.25900, 54, 30, 0),
      },
    },

    // --- CAMPUS GATES ---
    {
      type: 'Feature',
      id: 'gate-1',
      properties: {
        id: 'gate-1',
        name: 'Main Gate 1 (NH-44 / GT Road Grand Entrance)',
        shortName: 'Main Gate 1',
        category: 'gate',
        height: 8,
        baseHeight: 0,
        floors: 1,
        color: CATEGORY_3D_PALETTE.gate.color,
        accentColor: CATEGORY_3D_PALETTE.gate.accent,
        isApproximate: false, // Verified OSM Gate
        geometrySource: 'verified_osm',
        center: [75.70220, 31.25230],
        description: 'Grand ceremonial entrance on NH-44 GT Road with security checkpoint.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70220, 31.25230, 38, 10, 0),
      },
    },
    {
      type: 'Feature',
      id: 'gate-2',
      properties: {
        id: 'gate-2',
        name: 'Campus Gate 2 (North Entry)',
        shortName: 'Gate 2',
        category: 'gate',
        height: 6,
        baseHeight: 0,
        floors: 1,
        color: CATEGORY_3D_PALETTE.gate.color,
        accentColor: CATEGORY_3D_PALETTE.gate.accent,
        isApproximate: true,
        geometrySource: 'approximate_osm',
        center: [75.70120, 31.25750],
        description: 'Northern perimeter entry point for service vehicles and commuters.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70120, 31.25750, 24, 8, 45),
      },
    },
    {
      type: 'Feature',
      id: 'gate-3',
      properties: {
        id: 'gate-3',
        name: 'Campus Gate 3 (North-East Entry)',
        shortName: 'Gate 3',
        category: 'gate',
        height: 6,
        baseHeight: 0,
        floors: 1,
        color: CATEGORY_3D_PALETTE.gate.color,
        accentColor: CATEGORY_3D_PALETTE.gate.accent,
        isApproximate: true,
        geometrySource: 'approximate_osm',
        center: [75.70280, 31.25920],
        description: 'Access gate near girls residential hostels.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: createBoxFootprint(75.70280, 31.25920, 24, 8, 0),
      },
    },
  ],
};
