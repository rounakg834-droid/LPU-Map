import fs from 'fs';

console.log('Reading src/data/lpu_osm_raw.xml...');
const xml = fs.readFileSync('src/data/lpu_osm_raw.xml', 'utf8');

// Parse nodes with proper regex matching attributes in any order
const nodes = new Map();
const nodeTagRegex = /<node\s+([^>]+)>/g;
let nodeTagMatch;

while ((nodeTagMatch = nodeTagRegex.exec(xml)) !== null) {
  const attrs = nodeTagMatch[1];
  const idM = attrs.match(/id="(\d+)"/);
  const latM = attrs.match(/lat="([\d.-]+)"/);
  const lonM = attrs.match(/lon="([\d.-]+)"/);

  if (idM && latM && lonM) {
    nodes.set(idM[1], {
      lat: parseFloat(latM[1]),
      lng: parseFloat(lonM[1])
    });
  }
}
console.log(`Parsed ${nodes.size} geographic nodes from OSM.`);

// Parse ways
const ways = [];
const wayRegex = /<way\s+id="(\d+)"[^>]*>([\s\S]*?)<\/way>/g;
let match;

while ((match = wayRegex.exec(xml)) !== null) {
  const wayId = match[1];
  const wayBody = match[2];

  // Extract node references
  const ndRefs = [];
  const ndRegex = /<nd\s+ref="(\d+)"\/>/g;
  let ndMatch;
  while ((ndMatch = ndRegex.exec(wayBody)) !== null) {
    ndRefs.push(ndMatch[1]);
  }

  // Extract tags
  const tags = {};
  const tagRegex = /<tag\s+k="([^"]+)"\s+v="([^"]+)"\/>/g;
  let tagMatch;
  while ((tagMatch = tagRegex.exec(wayBody)) !== null) {
    tags[tagMatch[1]] = tagMatch[2];
  }

  // Build coordinate geometry
  const coords = [];
  for (const ref of ndRefs) {
    const node = nodes.get(ref);
    if (node) {
      coords.push(node);
    }
  }

  ways.push({
    id: wayId,
    ndRefs,
    coords,
    tags
  });
}

console.log(`Parsed ${ways.length} total ways.`);

// Filter highways (roads, footpaths, cycleways)
const highways = ways.filter(w => w.tags.highway && w.coords.length >= 2);
console.log(`Found ${highways.length} highway/pathways in LPU.`);

// Filter buildings
const buildings = ways.filter(w => w.tags.building && w.coords.length >= 3);
console.log(`Found ${buildings.length} real building footprints in LPU.`);

// Summary of highway types
const highwayTypes = {};
for (const h of highways) {
  const type = h.tags.highway;
  highwayTypes[type] = (highwayTypes[type] || 0) + 1;
}
console.log('Highway types:', highwayTypes);

// Output named highways
const namedHighways = highways.filter(h => h.tags.name).map(h => ({
  id: h.id,
  type: h.tags.highway,
  name: h.tags.name,
  coordsCount: h.coords.length,
  start: h.coords[0],
  end: h.coords[h.coords.length - 1]
}));
console.log(`Found ${namedHighways.length} named pathways. Samples:`, namedHighways.slice(0, 20));

// Save processed GeoJSON datasets
const highwayFeatures = highways.map(h => ({
  type: 'Feature',
  id: `osm_way_${h.id}`,
  properties: {
    osmId: h.id,
    highway: h.tags.highway,
    name: h.tags.name || `${h.tags.highway.replace('_', ' ')}`,
    surface: h.tags.surface || 'paved',
    access: h.tags.access || 'yes',
    bicycle: h.tags.bicycle || (h.tags.highway === 'footway' ? 'no' : 'yes'),
    foot: h.tags.foot || 'yes',
    wheelchair: h.tags.wheelchair || (h.tags.highway === 'footway' ? 'yes' : 'yes'),
    isVerifiedOsm: true
  },
  geometry: {
    type: 'LineString',
    coordinates: h.coords.map(c => [c.lng, c.lat])
  }
}));

const buildingFeatures = buildings.map(b => ({
  type: 'Feature',
  id: `osm_bld_${b.id}`,
  properties: {
    osmId: b.id,
    name: b.tags.name || b.tags['addr:housename'] || `Building ${b.id}`,
    buildingType: b.tags.building,
    isRealFootprint: true,
    geometrySource: 'verified_osm'
  },
  geometry: {
    type: 'Polygon',
    coordinates: [b.coords.map(c => [c.lng, c.lat])]
  }
}));

fs.writeFileSync('src/data/osm_highways.geojson.json', JSON.stringify({
  type: 'FeatureCollection',
  features: highwayFeatures
}, null, 2));

fs.writeFileSync('src/data/osm_buildings.geojson.json', JSON.stringify({
  type: 'FeatureCollection',
  features: buildingFeatures
}, null, 2));

console.log('Successfully wrote osm_highways.geojson.json and osm_buildings.geojson.json!');
