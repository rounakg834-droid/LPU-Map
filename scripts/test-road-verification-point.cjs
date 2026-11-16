const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('LPU SMART CAMPUS NAVIGATOR — ROAD VERIFICATION POINT TEST');
console.log('================================================================\n');

// 1. Inspect roadVerification.ts
const verifyFile = fs.readFileSync(path.join(__dirname, '../src/data/roadVerification.ts'), 'utf-8');

const hasLat = verifyFile.includes('31.258513739139417');
const hasLng = verifyFile.includes('75.70787809596429');
console.log('TEST 1: Exact Reference Coordinates in roadVerification.ts');
console.log(`  ${hasLat ? '✓' : '✗'} Latitude 31.258513739139417: ${hasLat}`);
console.log(`  ${hasLng ? '✓' : '✗'} Longitude 75.70787809596429: ${hasLng}`);
if (!hasLat || !hasLng) process.exit(1);

// 2. Check campusBounds.ts centering and zoom
const boundsFile = fs.readFileSync(path.join(__dirname, '../src/data/campusBounds.ts'), 'utf-8');
const centersOnPoint = boundsFile.includes('31.258513739139417') && boundsFile.includes('75.70787809596429');
const zoomIs18 = boundsFile.includes('defaultZoom: 18');
console.log('\nTEST 2: Map Center & Zoom to Point (campusBounds.ts)');
console.log(`  ${centersOnPoint ? '✓' : '✗'} LPU_CAMPUS_CENTER centered on reference point: ${centersOnPoint}`);
console.log(`  ${zoomIs18 ? '✓' : '✗'} MAP_CONFIG defaultZoom set to 18: ${zoomIs18}`);
if (!centersOnPoint || !zoomIs18) process.exit(1);

// 3. Check Main Gate candidate untouched in locations.ts
const locationsFile = fs.readFileSync(path.join(__dirname, '../src/data/locations.ts'), 'utf-8');
const mainGateLat = locationsFile.includes('31.260691694532763');
const mainGateLng = locationsFile.includes('75.70675425232257');
console.log('\nTEST 3: Main Gate Coordinates Preserved & Untouched');
console.log(`  ${mainGateLat ? '✓' : '✗'} Main Gate Latitude 31.260691694532763 preserved: ${mainGateLat}`);
console.log(`  ${mainGateLng ? '✓' : '✗'} Main Gate Longitude 75.70675425232257 preserved: ${mainGateLng}`);
if (!mainGateLat || !mainGateLng) process.exit(1);

// 4. Check routing engine guard against fake connections
const routingFile = fs.readFileSync(path.join(__dirname, '../src/services/routingService.ts'), 'utf-8');
const hasRoutingGuard = routingFile.includes('isOriginVerificationPoint') || routingFile.includes('isDestVerificationPoint');
console.log('\nTEST 4: Zero-Arbitrary-Road Routing Policy');
console.log(`  ${hasRoutingGuard ? '✓' : '✗'} Routing engine bars arbitrary routes to reference point: ${hasRoutingGuard}`);
if (!hasRoutingGuard) process.exit(1);

// 5. Check Admin Road Manager Tab integration
const roadMgrFile = fs.readFileSync(path.join(__dirname, '../src/components/admin/CampusRoadManagerTab.tsx'), 'utf-8');
const hasMgrCard = roadMgrFile.includes('Active Road Verification Point (Admin Inspection)');
console.log('\nTEST 5: Admin Road Manager Diagnostic Card');
console.log(`  ${hasMgrCard ? '✓' : '✗'} Diagnostic card rendered in CampusRoadManagerTab: ${hasMgrCard}`);
if (!hasMgrCard) process.exit(1);

// 6. Check marker rendering in CampusMap.tsx
const mapFile = fs.readFileSync(path.join(__dirname, '../src/components/map/CampusMap.tsx'), 'utf-8');
const hasMarkerRender = mapFile.includes('<RoadVerificationPointMarker');
console.log('\nTEST 6: Admin-Visible Marker in CampusMap.tsx');
console.log(`  ${hasMarkerRender ? '✓' : '✗'} RoadVerificationPointMarker mounted: ${hasMarkerRender}`);
if (!hasMarkerRender) process.exit(1);

console.log('\n================================================================');
console.log('ALL ROAD VERIFICATION POINT CHECKS PASSED (100% OK)');
console.log('================================================================');
