import fs from 'fs';

const highways = JSON.parse(fs.readFileSync('src/data/osm_highways.geojson.json', 'utf8'));

const targetIds = ['422550022', '422552449', '422823429', '1116524620', '1116524624', '1116524625', '1116524626', '422550020', '422550021', '422554489'];

for (const f of highways.features) {
  if (targetIds.includes(f.properties.osmId)) {
    console.log(`\n=== Way ${f.properties.osmId} (${f.properties.highway}: ${f.properties.name}) ===`);
    console.log(`Coords (${f.geometry.coordinates.length}):`);
    f.geometry.coordinates.forEach((pt, i) => {
      console.log(`  ${i}: lat: ${pt[1]}, lng: ${pt[0]}`);
    });
  }
}
