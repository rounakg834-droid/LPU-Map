import fs from 'fs';

const osmBuildings = JSON.parse(fs.readFileSync('src/data/osm_buildings.geojson.json', 'utf8'));

// Campus location targets
const targets = [
  { id: 'gate-1', name: 'Gate 1', center: [75.70220, 31.25230] },
  { id: 'building-41', name: 'Building 41', center: [75.701877, 31.251697] },
  { id: 'block-30-admin', name: 'Block 30', center: [75.70280, 31.25300] },
  { id: 'block-13', name: 'Block 13', center: [75.70190, 31.25290] },
  { id: 'block-25-28', name: 'Block 25', center: [75.70250, 31.25350] },
  { id: 'central-library', name: 'Central Library', center: [75.70360, 31.25410] },
  { id: 'block-34', name: 'Block 34', center: [75.70375, 31.25475] },
  { id: 'block-36', name: 'Block 36', center: [75.70415, 31.25565] },
  { id: 'block-38', name: 'Block 38', center: [75.70455, 31.25655] },
  { id: 'unimall', name: 'UniMall', center: [75.70560, 31.25420] },
  { id: 'unihospital', name: 'UniHospital', center: [75.70500, 31.25260] },
  { id: 'unipolis', name: 'Unipolis', center: [75.70270, 31.25620] },
  { id: 'sports-complex', name: 'Sports Complex', center: [75.70650, 31.25700] },
  { id: 'bh-1', name: 'BH-1', center: [75.70700, 31.25320] },
  { id: 'bh-2', name: 'BH-2', center: [75.70780, 31.25380] },
  { id: 'bh-3', name: 'BH-3', center: [75.70820, 31.25460] },
  { id: 'bh-4', name: 'BH-4', center: [75.70850, 31.25520] },
  { id: 'bh-5', name: 'BH-5', center: [75.70650, 31.25200] },
  { id: 'bh-6', name: 'BH-6', center: [75.70720, 31.25150] },
  { id: 'gh-1', name: 'GH-1', center: [75.70220, 31.25720] },
  { id: 'gh-2', name: 'GH-2', center: [75.70250, 31.25780] },
  { id: 'gh-3', name: 'GH-3', center: [75.70280, 31.25850] },
  { id: 'gh-4', name: 'GH-4', center: [75.70320, 31.25900] }
];

console.log('--- Matching Campus Targets to Real OSM Building Polygons ---');
for (const t of targets) {
  let closest = null;
  let minDist = Infinity;

  for (const b of osmBuildings.features) {
    const ring = b.geometry.coordinates[0];
    let sumLng = 0, sumLat = 0;
    for (const pt of ring) {
      sumLng += pt[0];
      sumLat += pt[1];
    }
    const cLng = sumLng / ring.length;
    const cLat = sumLat / ring.length;

    const dLat = (cLat - t.center[1]) * 111000;
    const dLng = (cLng - t.center[0]) * 95000;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);

    if (dist < minDist) {
      minDist = dist;
      closest = {
        osmId: b.properties.osmId,
        name: b.properties.name,
        dist: Math.round(dist),
        coordsCount: ring.length,
        ring
      };
    }
  }

  console.log(`${t.name} (${t.id}): closest OSM building is [${closest.osmId}] (${closest.name}) at ${closest.dist}m, vertices: ${closest.coordsCount}`);
}
