import fs from 'fs';

const highways = JSON.parse(fs.readFileSync('src/data/osm_highways.geojson.json', 'utf8'));
console.log(`Total highways: ${highways.features.length}`);

// Check highway bounding box and length
highways.features.forEach((h, i) => {
  const coords = h.geometry.coordinates;
  const start = coords[0];
  const end = coords[coords.length - 1];
  if (i < 20) {
    console.log(`[${h.properties.osmId}] type: ${h.properties.highway}, name: ${h.properties.name}, pts: ${coords.length}, start: [${start}], end: [${end}]`);
  }
});
