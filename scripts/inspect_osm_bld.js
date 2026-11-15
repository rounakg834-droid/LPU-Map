import fs from 'fs';

const buildings = JSON.parse(fs.readFileSync('src/data/osm_buildings.geojson.json', 'utf8'));
console.log(`Total OSM buildings: ${buildings.features.length}`);

const named = buildings.features.filter(b => b.properties.name && !b.properties.name.startsWith('Building '));
console.log(`Named buildings count: ${named.length}`);
named.forEach(b => {
  console.log(`- ${b.properties.name} (${b.properties.osmId})`);
});

// Calculate centroids of buildings
const centroids = buildings.features.map(b => {
  const ring = b.geometry.coordinates[0];
  let sumLat = 0, sumLng = 0;
  for (const pt of ring) {
    sumLng += pt[0];
    sumLat += pt[1];
  }
  return {
    id: b.id,
    osmId: b.properties.osmId,
    name: b.properties.name,
    centroid: [Number((sumLng / ring.length).toFixed(7)), Number((sumLat / ring.length).toFixed(7))],
    verticesCount: ring.length
  };
});

console.log('Sample building centroids:', centroids.slice(0, 10));
