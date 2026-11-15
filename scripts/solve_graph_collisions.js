import fs from 'fs';

const bldData = JSON.parse(fs.readFileSync('./src/data/osm_buildings.geojson.json', 'utf8'));
const buildings = bldData.features.filter(f => f.geometry && f.geometry.type === 'Polygon');
const hwData = JSON.parse(fs.readFileSync('./src/data/osm_highways.geojson.json', 'utf8'));

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

export function testPolyline(coords) {
  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    for (const b of buildings) {
      const ring = b.geometry.coordinates[0];
      const bldName = b.properties?.name || b.properties?.osmId || b.id;

      const mid = { lat: (p1.lat + p2.lat) / 2, lng: (p1.lng + p2.lng) / 2 };
      if (pointInPolygon(mid, ring)) {
        return { collides: true, building: bldName, segment: [p1, p2] };
      }

      for (let j = 0; j < ring.length - 1; j++) {
        const b1 = { lng: ring[j][0], lat: ring[j][1] };
        const b2 = { lng: ring[j + 1][0], lat: ring[j + 1][1] };
        if (lineSegmentsIntersect(p1, p2, b1, b2)) {
          return { collides: true, building: bldName, segment: [p1, p2] };
        }
      }
    }
  }
  return { collides: false };
}

console.log('Collision testing engine ready.');
