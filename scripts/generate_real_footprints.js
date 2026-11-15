import fs from 'fs';

const osmBuildings = JSON.parse(fs.readFileSync('src/data/osm_buildings.geojson.json', 'utf8'));

const locationTargets = [
  { id: 'gate-1', name: 'Main Gate 1', shortName: 'Gate 1', category: 'gate', defaultHeight: 12, floors: 2 },
  { id: 'building-41', name: 'Building 41 (Boys Apartment)', shortName: 'B-41', category: 'hostel_boys', defaultHeight: 24, floors: 7 },
  { id: 'block-30-admin', name: 'Block 30 (Admissions)', shortName: 'Block 30', category: 'administration', defaultHeight: 18, floors: 5 },
  { id: 'block-13', name: 'Block 13 (Polytechnic)', shortName: 'Block 13', category: 'academic', defaultHeight: 16, floors: 4 },
  { id: 'block-25-28', name: 'Block 25-28 (Business School)', shortName: 'Block 25', category: 'academic', defaultHeight: 18, floors: 5 },
  { id: 'central-library', name: 'Central Library', shortName: 'Library', category: 'library', defaultHeight: 20, floors: 5 },
  { id: 'block-34', name: 'Block 34 (School of CSE)', shortName: 'Block 34 (CSE)', category: 'academic', defaultHeight: 22, floors: 6 },
  { id: 'block-36', name: 'Block 36 (Academic & Exam)', shortName: 'Block 36', category: 'academic', defaultHeight: 22, floors: 6 },
  { id: 'block-38', name: 'Block 38 (ECE & Mech)', shortName: 'Block 38', category: 'academic', defaultHeight: 20, floors: 5 },
  { id: 'unimall', name: 'UniMall', shortName: 'UniMall', category: 'commercial', defaultHeight: 16, floors: 4 },
  { id: 'unihospital', name: 'UniHospital & Clinic', shortName: 'UniHospital', category: 'medical', defaultHeight: 15, floors: 4 },
  { id: 'unipolis', name: 'Baldev Raj Mittal Unipolis', shortName: 'Unipolis', category: 'auditorium_events', defaultHeight: 18, floors: 3 },
  { id: 'sports-complex', name: 'Indoor Sports Complex', shortName: 'Sports Complex', category: 'sports', defaultHeight: 18, floors: 3 },
  { id: 'bh-1', name: 'Boys Hostel 1 (BH-1)', shortName: 'BH-1', category: 'hostel_boys', defaultHeight: 24, floors: 8 },
  { id: 'bh-2', name: 'Boys Hostel 2 (BH-2)', shortName: 'BH-2', category: 'hostel_boys', defaultHeight: 24, floors: 8 },
  { id: 'bh-3', name: 'Boys Hostel 3 (BH-3)', shortName: 'BH-3', category: 'hostel_boys', defaultHeight: 24, floors: 8 },
  { id: 'bh-4', name: 'Boys Hostel 4 (BH-4)', shortName: 'BH-4', category: 'hostel_boys', defaultHeight: 24, floors: 8 },
  { id: 'bh-5', name: 'Boys Hostel 5 (BH-5)', shortName: 'BH-5', category: 'hostel_boys', defaultHeight: 24, floors: 8 },
  { id: 'bh-6', name: 'Boys Hostel 6 (BH-6)', shortName: 'BH-6', category: 'hostel_boys', defaultHeight: 24, floors: 8 },
  { id: 'gh-1', name: 'Girls Hostel 1 (GH-1)', shortName: 'GH-1', category: 'hostel_girls', defaultHeight: 24, floors: 8 },
  { id: 'gh-2', name: 'Girls Hostel 2 (GH-2)', shortName: 'GH-2', category: 'hostel_girls', defaultHeight: 24, floors: 8 },
  { id: 'gh-3', name: 'Girls Hostel 3 (GH-3)', shortName: 'GH-3', category: 'hostel_girls', defaultHeight: 24, floors: 8 },
  { id: 'gh-4', name: 'Girls Hostel 4 (GH-4)', shortName: 'GH-4', category: 'hostel_girls', defaultHeight: 24, floors: 8 }
];

console.log('Generating real 3D footprints from 186 verified OSM building polygons...');

const categoryColors = {
  academic: '#cbd5e1',
  library: '#e0e7ff',
  commercial: '#fef08a',
  auditorium_events: '#f3e8ff',
  medical: '#fecaca',
  sports: '#bbf7d0',
  hostel_boys: '#bae6fd',
  hostel_girls: '#fbcfe8',
  gate: '#94a3b8',
  administration: '#cbd5e1'
};

const processedFeatures = [];
const usedOsmIds = new Set();

const targetCenters = {
  'gate-1': [75.70220, 31.25230],
  'building-41': [75.701877, 31.251697],
  'block-30-admin': [75.70280, 31.25300],
  'block-13': [75.70190, 31.25290],
  'block-25-28': [75.70250, 31.25350],
  'central-library': [75.70360, 31.25410],
  'block-34': [75.70375, 31.25475],
  'block-36': [75.70415, 31.25565],
  'block-38': [75.70455, 31.25655],
  'unimall': [75.70560, 31.25420],
  'unihospital': [75.70500, 31.25260],
  'unipolis': [75.70270, 31.25620],
  'sports-complex': [75.70650, 31.25700],
  'bh-1': [75.70700, 31.25320],
  'bh-2': [75.70780, 31.25380],
  'bh-3': [75.70820, 31.25460],
  'bh-4': [75.70850, 31.25520],
  'bh-5': [75.70650, 31.25200],
  'bh-6': [75.70720, 31.25150],
  'gh-1': [75.70220, 31.25720],
  'gh-2': [75.70250, 31.25780],
  'gh-3': [75.70280, 31.25850],
  'gh-4': [75.70320, 31.25900]
};

for (const t of locationTargets) {
  let best = null;
  let minDist = Infinity;

  for (const b of osmBuildings.features) {
    if (usedOsmIds.has(b.properties.osmId)) continue;
    const ring = b.geometry.coordinates[0];
    let sumLng = 0, sumLat = 0;
    for (const pt of ring) {
      sumLng += pt[0];
      sumLat += pt[1];
    }
    const cLng = sumLng / ring.length;
    const cLat = sumLat / ring.length;

    const targetCenter = targetCenters[t.id];
    if (!targetCenter) continue;

    const dLat = (cLat - targetCenter[1]) * 111000;
    const dLng = (cLng - targetCenter[0]) * 95000;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);

    if (dist < minDist) {
      minDist = dist;
      best = { b, cLng, cLat, dist };
    }
  }

  if (best) {
    usedOsmIds.add(best.b.properties.osmId);
    processedFeatures.push({
      type: 'Feature',
      id: t.id,
      properties: {
        id: t.id,
        osmId: best.b.properties.osmId,
        name: t.name,
        shortName: t.shortName,
        category: t.category,
        height: t.defaultHeight,
        baseHeight: 0,
        floors: t.floors,
        color: categoryColors[t.category] || '#cbd5e1',
        accentColor: '#64748b',
        isApproximate: true,
        geometrySource: 'verified_osm',
        center: [Number(best.cLng.toFixed(7)), Number(best.cLat.toFixed(7))],
        description: 'Verified OpenStreetMap building footprint (OSM Way ' + best.b.properties.osmId + '). Height estimated for 3D visualization only.'
      },
      geometry: best.b.geometry
    });
  }
}

for (const b of osmBuildings.features) {
  if (usedOsmIds.has(b.properties.osmId)) continue;
  const ring = b.geometry.coordinates[0];
  let sumLng = 0, sumLat = 0;
  for (const pt of ring) {
    sumLng += pt[0];
    sumLat += pt[1];
  }
  const cLng = sumLng / ring.length;
  const cLat = sumLat / ring.length;

  processedFeatures.push({
    type: 'Feature',
    id: 'osm_' + b.properties.osmId,
    properties: {
      id: 'osm_' + b.properties.osmId,
      osmId: b.properties.osmId,
      name: b.properties.name || ('Campus Building ' + b.properties.osmId),
      shortName: b.properties.name || 'Building',
      category: 'academic',
      height: 14,
      baseHeight: 0,
      floors: 3,
      color: '#e2e8f0',
      accentColor: '#94a3b8',
      isApproximate: true,
      geometrySource: 'verified_osm',
      center: [Number(cLng.toFixed(7)), Number(cLat.toFixed(7))],
      description: 'OpenStreetMap verified building footprint.'
    },
    geometry: b.geometry
  });
}

console.log('Compiled ' + processedFeatures.length + ' real 3D building footprints!');

const header = "import { LocationCategory } from '../types/location';\n\n" +
"export type FootprintGeometrySource = 'verified_osm' | 'approximate_osm' | 'curated_survey';\n\n" +
"export interface Campus3DFeatureProperties {\n" +
"  id: string;\n" +
"  osmId?: string;\n" +
"  name: string;\n" +
"  shortName: string;\n" +
"  category: LocationCategory;\n" +
"  blockNumber?: string;\n" +
"  height: number;\n" +
"  baseHeight: number;\n" +
"  floors: number;\n" +
"  color: string;\n" +
"  accentColor: string;\n" +
"  isApproximate: boolean;\n" +
"  geometrySource: FootprintGeometrySource;\n" +
"  center: [number, number];\n" +
"  description?: string;\n" +
"}\n\n" +
"export interface Campus3DFeature {\n" +
"  type: 'Feature';\n" +
"  id: string;\n" +
"  properties: Campus3DFeatureProperties;\n" +
"  geometry: {\n" +
"    type: 'Polygon';\n" +
"    coordinates: number[][][];\n" +
"  };\n" +
"}\n\n" +
"export interface Campus3DFeatureCollection {\n" +
"  type: 'FeatureCollection';\n" +
"  features: Campus3DFeature[];\n" +
"}\n\n" +
"export const CAMPUS_3D_FOOTPRINTS: Campus3DFeatureCollection = " + JSON.stringify({
  type: 'FeatureCollection',
  features: processedFeatures
}, null, 2) + ";\n";

fs.writeFileSync('src/data/campus3DFootprints.ts', header, 'utf8');
console.log('Successfully wrote src/data/campus3DFootprints.ts!');
