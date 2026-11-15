import fs from 'fs';
import { testPolyline } from './solve_graph_collisions.js';

// Load campusRouteGraph
const graphSrc = fs.readFileSync('./src/data/campusRouteGraph.ts', 'utf8');

// Parse nodes from graphSrc
const nodesMatch = graphSrc.match(/export const CAMPUS_GRAPH_NODES: CampusGraphNode\[\] = (\[[\s\S]*?\]);/);
const nodes = JSON.parse(nodesMatch[1]);
const nodeMap = {};
for (const n of nodes) nodeMap[n.id] = n;

// Parse edges from graphSrc
const edgeRegex = /createBiEdge\(\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"],\s*\[([^\]]+)\],\s*['"]([^'"]+)['"],\s*(true|false),\s*\[([\s\S]*?)\]\s*,/g;

let match;
const edges = [];

while ((match = edgeRegex.exec(graphSrc)) !== null) {
  const edgeId = match[1];
  const from = match[2];
  const to = match[3];
  const modes = match[4].replace(/['"\s]/g, '').split(',');
  const pathName = match[5];
  const isWheelchair = match[6] === 'true';
  const geomRaw = match[7];

  const coordRegex = /["']?lat["']?:\s*([0-9.]+),\s*["']?lng["']?:\s*([0-9.]+)/g;
  let cMatch;
  const coords = [];
  while ((cMatch = coordRegex.exec(geomRaw)) !== null) {
    coords.push({ lat: parseFloat(cMatch[1]), lng: parseFloat(cMatch[2]) });
  }

  // Bidirectional
  edges.push({
    id: `${edgeId}_fwd`,
    from,
    to,
    modes,
    pathName,
    isWheelchair,
    geometry: coords
  });
  edges.push({
    id: `${edgeId}_rev`,
    from: to,
    to: from,
    modes,
    pathName,
    isWheelchair,
    geometry: [...coords].reverse()
  });
}

console.log(`Loaded ${nodes.length} nodes and ${edges.length} bidirectional edges.`);

// Dijkstra implementation
function findPath(startId, endId, mode) {
  const distances = {};
  const prev = {};
  const unvisited = new Set();

  for (const n of nodes) {
    distances[n.id] = Infinity;
    prev[n.id] = null;
    unvisited.add(n.id);
  }
  distances[startId] = 0;

  while (unvisited.size > 0) {
    let curr = null;
    let minD = Infinity;
    for (const id of unvisited) {
      if (distances[id] < minD) {
        minD = distances[id];
        curr = id;
      }
    }
    if (!curr || minD === Infinity) break;
    if (curr === endId) break;
    unvisited.delete(curr);

    const out = edges.filter(e => e.from === curr && e.modes.includes(mode) && (mode !== 'wheelchair' || e.isWheelchair));
    for (const e of out) {
      if (!unvisited.has(e.to)) continue;
      const d = distances[curr] + e.geometry.length; // hops / distance
      if (d < distances[e.to]) {
        distances[e.to] = d;
        prev[e.to] = { from: curr, edge: e };
      }
    }
  }

  if (distances[endId] === Infinity) return null;

  const path = [];
  let curr = endId;
  while (curr && curr !== startId) {
    const entry = prev[curr];
    if (!entry) break;
    path.unshift(entry.edge);
    curr = entry.from;
  }
  return path;
}

// Test cases
const tests = [
  { name: 'Gate 1 to Central Library', start: 'n_gate1', end: 'n_library', mode: 'walking' },
  { name: 'Gate 1 to Block 34 (CSE)', start: 'n_gate1', end: 'n_block34', mode: 'walking' },
  { name: 'Gate 1 to Building 41 (Boys Apartment)', start: 'n_gate1', end: 'n_b41_entrance', mode: 'walking' },
  { name: 'Gate 1 to BH-1 (Boys Hostel 1)', start: 'n_gate1', end: 'n_bh1', mode: 'walking' },
  { name: 'UniMall to UniHospital', start: 'n_unimall', end: 'n_unihospital', mode: 'walking' },
  { name: 'Unipolis to GH-1', start: 'n_unipolis_concourse', end: 'n_gh1', mode: 'walking' },
  { name: 'Gate 1 to Central Library (Wheelchair Step-Free)', start: 'n_gate1', end: 'n_library', mode: 'wheelchair' },
  { name: 'Gate 1 to Parking (Car)', start: 'n_gate1', end: 'n_gate1_parking', mode: 'car' },
];

console.log('\n--- TESTING ROUTE ACCURACY & ZERO COLLISIONS ---');
for (const tc of tests) {
  const path = findPath(tc.start, tc.end, tc.mode);
  if (!path) {
    console.error(`FAIL: No path found for ${tc.name}`);
    continue;
  }

  // Compile full polyline
  const fullPoly = [];
  for (const e of path) {
    for (const pt of e.geometry) {
      fullPoly.push(pt);
    }
  }

  const audit = testPolyline(fullPoly);
  console.log(`✓ ${tc.name}:`);
  console.log(`    Edges in route: ${path.length}, Points in route: ${fullPoly.length}`);
  console.log(`    Building collision check: ${audit.collides ? 'COLLISION WITH ' + audit.building : '0 COLLISIONS (PASS)'}`);
}
