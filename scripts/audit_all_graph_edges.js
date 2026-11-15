import fs from 'fs';

// Read osm_buildings
const bldData = JSON.parse(fs.readFileSync('./src/data/osm_buildings.geojson.json', 'utf8'));
const buildings = bldData.features.filter(f => f.geometry && f.geometry.type === 'Polygon');

// Line intersection algorithm
function ccw(p1, p2, p3) {
  return (p2.lng - p1.lng) * (p3.lat - p1.lat) - (p2.lat - p1.lat) * (p3.lng - p1.lng);
}

function lineSegmentsIntersect(a1, a2, b1, b2) {
  const ccw1 = ccw(a1, a2, b1);
  const ccw2 = ccw(a1, a2, b2);
  const ccw3 = ccw(b1, b2, a1);
  const ccw4 = ccw(b1, b2, a2);

  return (
    ((ccw1 > 0 && ccw2 < 0) || (ccw1 < 0 && ccw2 > 0)) &&
    ((ccw3 > 0 && ccw4 < 0) || (ccw3 < 0 && ccw4 > 0))
  );
}

function pointInPolygon(pt, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect =
      yi > pt.lat !== yj > pt.lat &&
      pt.lng < ((xj - xi) * (pt.lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function checkSegment(p1, p2) {
  for (const b of buildings) {
    const ring = b.geometry.coordinates[0];
    const bldName = b.properties?.name || b.properties?.osmId || b.id;

    // Check if endpoints are strictly inside polygon
    // Note: Building entrance endpoints can be on perimeter, so only flag if deep inside (>0.00002 deg from edge)
    const mid = { lat: (p1.lat + p2.lat) / 2, lng: (p1.lng + p2.lng) / 2 };
    if (pointInPolygon(mid, ring)) {
      return { collides: true, buildingName: bldName };
    }

    // Check edge crossings
    for (let j = 0; j < ring.length - 1; j++) {
      const b1 = { lng: ring[j][0], lat: ring[j][1] };
      const b2 = { lng: ring[j + 1][0], lat: ring[j + 1][1] };
      if (lineSegmentsIntersect(p1, p2, b1, b2)) {
        return { collides: true, buildingName: bldName };
      }
    }
  }
  return { collides: false };
}

// Parse campusRouteGraph.ts to extract nodes and edges
const graphSrc = fs.readFileSync('./src/data/campusRouteGraph.ts', 'utf8');

// Extract all createBiEdge calls
const edgeRegex = /createBiEdge\(\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"],\s*\[([^\]]+)\],\s*['"]([^'"]+)['"],\s*(true|false),\s*\[([\s\S]*?)\]\s*,/g;

let match;
let totalEdgesChecked = 0;
let collidingEdges = [];

while ((match = edgeRegex.exec(graphSrc)) !== null) {
  const edgeId = match[1];
  const from = match[2];
  const to = match[3];
  const pathName = match[5];
  const geomRaw = match[7];

  const coordRegex = /\{\s*lat:\s*([0-9.]+),\s*lng:\s*([0-9.]+)\s*\}/g;
  let cMatch;
  const coords = [];
  while ((cMatch = coordRegex.exec(geomRaw)) !== null) {
    coords.push({ lat: parseFloat(cMatch[1]), lng: parseFloat(cMatch[2]) });
  }

  totalEdgesChecked++;
  for (let i = 0; i < coords.length - 1; i++) {
    const col = checkSegment(coords[i], coords[i + 1]);
    if (col.collides) {
      collidingEdges.push({
        edgeId,
        from,
        to,
        pathName,
        segmentIndex: i,
        p1: coords[i],
        p2: coords[i + 1],
        building: col.buildingName
      });
      break;
    }
  }
}

console.log(`Audited ${totalEdgesChecked} edge definitions.`);
console.log(`Found ${collidingEdges.length} colliding edges:`);
for (const col of collidingEdges) {
  console.log(`- ${col.edgeId} (${col.from} -> ${col.to}, "${col.pathName}") collides with: ${col.building}`);
}
