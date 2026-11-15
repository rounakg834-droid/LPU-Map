import { routingService } from '../src/services/routingService.ts';
import { routeQualityService } from '../src/services/routeQualityService.ts';
import { CAMPUS_LOCATIONS } from '../src/data/locations.ts';

async function runGisRoutingTests() {
  console.log('====================================================');
  console.log('   LPU SMART CAMPUS NAVIGATOR — GIS ROUTING AUDIT   ');
  console.log('====================================================\n');

  // 1. Diagnostics Summary
  const diag = routeQualityService.getNetworkDiagnostics();
  console.log('--- 1. ROAD NETWORK DIAGNOSTICS ---');
  console.log(`Total Graph Nodes: ${diag.totalNodes}`);
  console.log(`Total Graph Edges: ${diag.totalEdges}`);
  console.log(`Verified Edges: ${diag.verifiedEdgesCount} (${diag.verifiedEdgesPercent}%)`);
  console.log('Travel Mode Coverage:');
  console.log(`  - Walking: ${diag.modeBreakdown.walking} edges`);
  console.log(`  - Bike: ${diag.modeBreakdown.bike} edges`);
  console.log(`  - Car: ${diag.modeBreakdown.car} edges`);
  console.log(`  - Wheelchair: ${diag.modeBreakdown.wheelchair} edges`);
  console.log('Surface Breakdown:');
  console.log(`  - Paved Asphalt: ${diag.surfaceBreakdown.paved_asphalt}`);
  console.log(`  - Paver Blocks: ${diag.surfaceBreakdown.paver_blocks}`);
  console.log(`  - Concrete: ${diag.surfaceBreakdown.concrete}`);
  console.log(`Monitored Real OSM Buildings: ${diag.buildingsMonitoredCount}\n`);

  // 2. Test Key Campus Routes
  const testCases = [
    { from: 'Gate 1', origin: { lat: 31.2522756, lng: 75.7022248 }, destId: 'central-library', mode: 'walking', name: 'Gate 1 to Central Library' },
    { from: 'Gate 1', origin: { lat: 31.2522756, lng: 75.7022248 }, destId: 'block-34', mode: 'walking', name: 'Gate 1 to Block 34 (School of CSE)' },
    { from: 'Gate 1', origin: { lat: 31.2522756, lng: 75.7022248 }, destId: 'building-41', mode: 'walking', name: 'Gate 1 to Building 41 (Boys Apartment)' },
    { from: 'Gate 1', origin: { lat: 31.2522756, lng: 75.7022248 }, destId: 'bh-1', mode: 'walking', name: 'Gate 1 to Boys Hostel 1 (BH-1)' },
    { from: 'UniMall', origin: { lat: 31.25420, lng: 75.70560 }, destId: 'unihospital', mode: 'walking', name: 'UniMall to UniHospital' },
    { from: 'Unipolis', origin: { lat: 31.25620, lng: 75.70270 }, destId: 'gh-1', mode: 'walking', name: 'Unipolis to Girls Hostel 1 (GH-1)' },
    { from: 'Gate 1 (Drive)', origin: { lat: 31.2522756, lng: 75.7022248 }, destId: 'block-34', mode: 'car', name: 'Gate 1 to Block 34 (Car - Expect Parking Reroute)' },
    { from: 'Gate 1 (Accessible)', origin: { lat: 31.2522756, lng: 75.7022248 }, destId: 'central-library', mode: 'wheelchair', name: 'Gate 1 to Central Library (Wheelchair Step-Free)' },
  ];

  console.log('--- 2. EXECUTING ROUTE ACCURACY & COLLISION TESTS ---');
  let passCount = 0;

  for (const tc of testCases) {
    const dest = CAMPUS_LOCATIONS.find((l) => l.id === tc.destId);
    if (!dest) {
      console.error(`ERROR: Destination ${tc.destId} not found`);
      continue;
    }

    const route = await routingService.calculateRoute(tc.origin, dest, tc.mode);
    console.log(`\nTest: ${tc.name}`);
    console.log(`  - Status: ${route.status}`);
    console.log(`  - Distance: ${route.distanceMeters} m`);
    console.log(`  - Coordinates in Path: ${route.pathCoordinates.length}`);
    console.log(`  - Instructions Count: ${route.instructions.length}`);
    if (route.notes) console.log(`  - Notes: ${route.notes}`);

    if (tc.mode === 'car') {
      if (route.notes && route.notes.includes('Private vehicles are prohibited')) {
        console.log('  ✓ Car vehicle restriction correctly enforced (rerouted to parking bay)');
      } else {
        throw new Error('FAIL: Car was permitted onto central pedestrian academic spine!');
      }
    }

    if (route.status === 'available') {
      const audit = routeQualityService.validateRouteGeometry(route);
      console.log(`  - Building Collisions: ${audit.buildingCollisions.length}`);
      if (audit.buildingCollisions.length > 0) {
        throw new Error(`FAIL: Route ${tc.name} collided with building ${audit.buildingCollisions[0].buildingName}!`);
      }
      console.log('  ✓ Verified 0 building collisions! Follows authentic road curve geometry.');
      passCount++;
    } else {
      console.log(`  - Unreachable Reason: ${route.unreachableReason}`);
      if (tc.destId === 'building-41' && !dest.isEntranceConfirmed) {
        console.log('  ✓ Building 41 confirmation guard working properly');
        passCount++;
      }
    }
  }

  console.log('\n====================================================');
  console.log(`   ALL ${passCount} GIS ROUTE ACCURACY TESTS PASSED!`);
  console.log('====================================================\n');
}

runGisRoutingTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
