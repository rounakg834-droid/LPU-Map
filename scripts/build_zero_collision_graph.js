import fs from 'fs';
import { testPolyline } from './solve_graph_collisions.js';

// Load OSM highways
const hwData = JSON.parse(fs.readFileSync('./src/data/osm_highways.geojson.json', 'utf8'));

function getWayCoords(id) {
  const f = hwData.features.find(x => x.id === id);
  if (!f) throw new Error(`Way ${id} not found`);
  return f.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }));
}

// Distance helper
function dist(p1, p2) {
  const R = 6371e3;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function polyLength(coords) {
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    total += dist(coords[i], coords[i + 1]);
  }
  return Math.round(total);
}

// Extract OSM Ways
const way1461354406 = getWayCoords('osm_way_1461354406'); // Gate 1 to South Promenade
const way422823429 = getWayCoords('osm_way_422823429');   // South Promenade
const way422550021 = getWayCoords('osm_way_422550021');   // West Academic Boulevard
const way422550020 = getWayCoords('osm_way_422550020');   // Block 34/36 CSE concourse arc
const way1116524626 = getWayCoords('osm_way_1116524626'); // UniMall Loop
const way422553589 = getWayCoords('osm_way_422553589');   // North Perimeter
const way422883192 = getWayCoords('osm_way_422883192');   // East Perimeter
const way422550022 = getWayCoords('osm_way_422550022');   // Gate 1 south approach

console.log('OSM Ways successfully extracted.');
