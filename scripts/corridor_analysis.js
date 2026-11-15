import fs from 'fs';

const highways = JSON.parse(fs.readFileSync('src/data/osm_highways.geojson.json', 'utf8'));

console.log('--- Analyzing LPU Campus Road Corridors ---');

// Search for ways around key campus landmarks
function findWaysNear(lat, lng, radiusMeters = 80) {
  const matches = [];
  for (const f of highways.features) {
    for (const pt of f.geometry.coordinates) {
      const dLat = (pt[1] - lat) * 111000;
      const dLng = (pt[0] - lng) * 95000;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist <= radiusMeters) {
        matches.push({
          id: f.properties.osmId,
          highway: f.properties.highway,
          name: f.properties.name,
          dist: Math.round(dist),
          coordsCount: f.geometry.coordinates.length,
          coords: f.geometry.coordinates
        });
        break;
      }
    }
  }
  return matches;
}

console.log('Near Gate 1 (31.2523, 75.7022):');
findWaysNear(31.2523, 75.7022).forEach(w => console.log(`  - [${w.id}] ${w.highway} (${w.name}): ${w.coordsCount} pts`));

console.log('Near Central Library (31.2541, 75.7036):');
findWaysNear(31.2541, 75.7036).forEach(w => console.log(`  - [${w.id}] ${w.highway} (${w.name}): ${w.coordsCount} pts`));

console.log('Near Block 34 (31.25475, 75.70375):');
findWaysNear(31.25475, 75.70375).forEach(w => console.log(`  - [${w.id}] ${w.highway} (${w.name}): ${w.coordsCount} pts`));

console.log('Near UniMall (31.2542, 75.7056):');
findWaysNear(31.2542, 75.7056).forEach(w => console.log(`  - [${w.id}] ${w.highway} (${w.name}): ${w.coordsCount} pts`));

console.log('Near BH-1 (31.2532, 75.7070):');
findWaysNear(31.2532, 75.7070).forEach(w => console.log(`  - [${w.id}] ${w.highway} (${w.name}): ${w.coordsCount} pts`));

console.log('Near UniHospital (31.2526, 75.7050):');
findWaysNear(31.2526, 75.7050).forEach(w => console.log(`  - [${w.id}] ${w.highway} (${w.name}): ${w.coordsCount} pts`));

console.log('Near Unipolis (31.2562, 75.7027):');
findWaysNear(31.2562, 75.7027).forEach(w => console.log(`  - [${w.id}] ${w.highway} (${w.name}): ${w.coordsCount} pts`));
