import fs from 'fs';
import { testPolyline } from './solve_graph_collisions.js';

const hw = JSON.parse(fs.readFileSync('./src/data/osm_highways.geojson.json', 'utf8'));

console.log('Total OSM highway features:', hw.features.length);

// Check all highway ways for collisions against building polygons
let cleanCount = 0;
let dirtyCount = 0;
const cleanWays = [];

for (const f of hw.features) {
  if (f.geometry.type === 'LineString') {
    const coords = f.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }));
    const res = testPolyline(coords);
    if (!res.collides) {
      cleanCount++;
      cleanWays.push(f);
    } else {
      dirtyCount++;
    }
  }
}

console.log(`OSM Clean (0 building collisions) ways: ${cleanCount}`);
console.log(`OSM Ways with building intersection: ${dirtyCount}`);

// Print clean ways by name/id
for (const w of cleanWays) {
  console.log(`Clean Way: ${w.id} (${w.properties.name || w.properties.highway}), points: ${w.geometry.coordinates.length}`);
}
