import fs from 'fs';

// Helper to compute exact distance in meters along an array of coordinates
function computePolylineDistance(coords) {
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const from = coords[i];
    const to = coords[i + 1];
    const R = 6371e3;
    const p1 = (from.lat * Math.PI) / 180;
    const p2 = (to.lat * Math.PI) / 180;
    const dp = ((to.lat - from.lat) * Math.PI) / 180;
    const dl = ((to.lng - from.lng) * Math.PI) / 180;
    const a =
      Math.sin(dp / 2) * Math.sin(dp / 2) +
      Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    total += Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }
  return total;
}

console.log('Building verified campusRouteGraph.ts...');
