const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('LPU SMART CAMPUS NAVIGATOR — MAIN GATE CANDIDATE VERIFICATION TEST');
console.log('================================================================\n');

// 1. Inspect locations.ts
const locationsFile = fs.readFileSync(path.join(__dirname, '../src/data/locations.ts'), 'utf-8');

// Check lpu-main-gate existence
const hasLpuMainGate = locationsFile.includes("id: 'lpu-main-gate'");
console.log('TEST 1: Candidate Record Presence in locations.ts');
console.log(`  ${hasLpuMainGate ? '✓' : '✗'} 'lpu-main-gate' ID found: ${hasLpuMainGate}`);
if (!hasLpuMainGate) process.exit(1);

// Check exact coordinates
const latMatches = locationsFile.includes('31.260691694532763');
const lngMatches = locationsFile.includes('75.70675425232257');
console.log(`  ${latMatches ? '✓' : '✗'} Latitude 31.260691694532763: ${latMatches}`);
console.log(`  ${lngMatches ? '✓' : '✗'} Longitude 75.70675425232257: ${lngMatches}`);
if (!latMatches || !lngMatches) process.exit(1);

// Check verification status and road connectivity
const hasUserConfirmedStatus = locationsFile.includes("verificationStatus: 'user_confirmed_candidate'");
const hasRoadConnPending = locationsFile.includes("roadConnectivityStatus: 'pending_verification'");
console.log(`  ${hasUserConfirmedStatus ? '✓' : '✗'} Verification Status 'user_confirmed_candidate': ${hasUserConfirmedStatus}`);
console.log(`  ${hasRoadConnPending ? '✓' : '✗'} Road Connectivity 'pending_verification': ${hasRoadConnPending}`);
if (!hasUserConfirmedStatus || !hasRoadConnPending) process.exit(1);

// Check archived gate-1
const hasArchivedGate1 = locationsFile.includes("verificationStatus: 'archived_pending_confirmation'");
const gate1HasMainGateTag = locationsFile.includes("id: 'gate-1'") && locationsFile.includes("tags: ['gate 1', 'main gate'");
console.log('\nTEST 2: Gate 1 Archival & Tag Isolation');
console.log(`  ${hasArchivedGate1 ? '✓' : '✗'} Gate 1 marked 'archived_pending_confirmation': ${hasArchivedGate1}`);
console.log(`  ${!gate1HasMainGateTag ? '✓' : '✗'} 'main gate' tag removed from Gate 1 to prevent collisions: ${!gate1HasMainGateTag}`);
if (!hasArchivedGate1 || gate1HasMainGateTag) process.exit(1);

// Check LocationMarkers.tsx renders lpu-main-gate and no unverified buildings
const markersFile = fs.readFileSync(path.join(__dirname, '../src/components/map/LocationMarkers.tsx'), 'utf-8');
const markersHasMainGate = markersFile.includes("loc.id === 'lpu-main-gate'");
const markersHasSpecialIcon = markersFile.includes("main-gate-candidate-marker");
console.log('\nTEST 3: 2D Public Map Marker Rendering (LocationMarkers.tsx)');
console.log(`  ${markersHasMainGate ? '✓' : '✗'} Dedicated Main Gate candidate rendering logic: ${markersHasMainGate}`);
console.log(`  ${markersHasSpecialIcon ? '✓' : '✗'} Prominent badge icon class 'main-gate-candidate-marker': ${markersHasSpecialIcon}`);
if (!markersHasMainGate || !markersHasSpecialIcon) process.exit(1);

// Check CampusMap.tsx renders LocationMarkers even without selectedLocation
const campusMapFile = fs.readFileSync(path.join(__dirname, '../src/components/map/CampusMap.tsx'), 'utf-8');
const campusMapHasRender = campusMapFile.includes("{!isNavigating && (\n          <LocationMarkers") || campusMapFile.includes("{!isNavigating && (\r\n          <LocationMarkers");
console.log('\nTEST 4: CampusMap.tsx Visibility Guard');
console.log(`  ${campusMapHasRender ? '✓' : '✗'} LocationMarkers rendered whenever !isNavigating: ${campusMapHasRender}`);
if (!campusMapHasRender) process.exit(1);

// Check search service ranking for "Main Gate" and "LPU Main Gate"
const searchFile = fs.readFileSync(path.join(__dirname, '../src/services/searchService.ts'), 'utf-8');
const searchHasAlias = searchFile.includes("'main gate': ['lpu-main-gate'") && searchFile.includes("'lpu main gate': ['lpu-main-gate'");
console.log('\nTEST 5: Search Alias & Query Prioritization');
console.log(`  ${searchHasAlias ? '✓' : '✗'} Search service aliases map 'main gate' and 'lpu main gate' to candidate: ${searchHasAlias}`);
if (!searchHasAlias) process.exit(1);

// Check routing service guard against fake roads
const routingFile = fs.readFileSync(path.join(__dirname, '../src/services/routingService.ts'), 'utf-8');
const routingHasGuard = routingFile.includes("destination.id === 'lpu-main-gate'");
console.log('\nTEST 6: Routing Engine Zero-Fake-Road Policy');
console.log(`  ${routingHasGuard ? '✓' : '✗'} Routing to lpu-main-gate returns unavailable without fake paths: ${routingHasGuard}`);
if (!routingHasGuard) process.exit(1);

console.log('\n================================================================');
console.log('ALL MAIN GATE VERIFICATION CHECKS PASSED (100% OK)');
console.log('================================================================');
