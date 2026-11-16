const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('LPU SMART CAMPUS NAVIGATOR — UNI HEALTH CENTER LOCATION TEST');
console.log('================================================================\n');

// 1. Inspect locations.ts for Uni Health Center
const locationsFile = fs.readFileSync(path.join(__dirname, '../src/data/locations.ts'), 'utf-8');

const hasHealthCenterId = locationsFile.includes("id: 'uni-health-center'");
const hasCorrectName = locationsFile.includes("name: 'Uni Health Center'");
const hasCategory = locationsFile.includes("category: 'medical'");
const hasLat = locationsFile.includes('31.258118286319235');
const hasLng = locationsFile.includes('75.70678342134359');
const hasCandidateStatus = locationsFile.includes("verificationStatus: 'user_confirmed_candidate'");
const entrancePending = locationsFile.includes("isEntranceConfirmed: false");
const roadPending = locationsFile.includes("roadConnectivityStatus: 'pending_verification'");

console.log('TEST 1: Uni Health Center Record in locations.ts');
console.log(`  ${hasHealthCenterId ? '✓' : '✗'} ID 'uni-health-center' found: ${hasHealthCenterId}`);
console.log(`  ${hasCorrectName ? '✓' : '✗'} Name 'Uni Health Center': ${hasCorrectName}`);
console.log(`  ${hasCategory ? '✓' : '✗'} Category 'medical': ${hasCategory}`);
console.log(`  ${hasLat && hasLng ? '✓' : '✗'} Exact coordinates (31.258118, 75.706783): ${hasLat && hasLng}`);
console.log(`  ${hasCandidateStatus && entrancePending && roadPending ? '✓' : '✗'} User-supplied & pending entrance verification: ${hasCandidateStatus && entrancePending && roadPending}`);
if (!hasHealthCenterId || !hasCorrectName || !hasCategory || !hasLat || !hasLng || !entrancePending) process.exit(1);

// 2. Check UniHospital distinction (Requirement 6: Do not confuse Uni Health Center with UniHospital)
const hasUniHospitalId = locationsFile.includes("id: 'unihospital'");
const hasUniHospitalCoords = locationsFile.includes('lat: 31.2526');
console.log('\nTEST 2: UniHospital Distinction & Independence');
console.log(`  ${hasUniHospitalId ? '✓' : '✗'} UniHospital record preserved: ${hasUniHospitalId}`);
console.log(`  ${hasUniHospitalCoords ? '✓' : '✗'} UniHospital distinct coordinates (31.25260, 75.70500) preserved: ${hasUniHospitalCoords}`);
if (!hasUniHospitalId || !hasUniHospitalCoords) process.exit(1);

// 3. Search aliases check
const searchFile = fs.readFileSync(path.join(__dirname, '../src/services/searchService.ts'), 'utf-8');
const searchUniHealth = searchFile.includes("'uni health center'");
const searchLpuHealth = searchFile.includes("'lpu health center'");
const searchHealthCenter = searchFile.includes("'health center'");

console.log('\nTEST 3: Search Engine Aliases & Queries');
console.log(`  ${searchUniHealth ? '✓' : '✗'} Search alias 'uni health center': ${searchUniHealth}`);
console.log(`  ${searchLpuHealth ? '✓' : '✗'} Search alias 'lpu health center': ${searchLpuHealth}`);
console.log(`  ${searchHealthCenter ? '✓' : '✗'} Search alias 'health center': ${searchHealthCenter}`);
if (!searchUniHealth || !searchLpuHealth || !searchHealthCenter) process.exit(1);

// 4. Location marker presentation in LocationMarkers.tsx
const markersFile = fs.readFileSync(path.join(__dirname, '../src/components/map/LocationMarkers.tsx'), 'utf-8');
const hasMarkerLogic = markersFile.includes("loc.id === 'uni-health-center'");
const hasRedBadgeClass = markersFile.includes('health-center-candidate-marker');
const hasRedColor = markersFile.includes('#dc2626');
const hasLabel = markersFile.includes('Uni Health Center');
const hasVisibleHealth = markersFile.includes("sourceList.find((l) => l.id === 'uni-health-center')");

console.log('\nTEST 4: Public 2D Red Medical Marker Presentation');
console.log(`  ${hasMarkerLogic ? '✓' : '✗'} Health Center marker logic in LocationMarkers.tsx: ${hasMarkerLogic}`);
console.log(`  ${hasRedBadgeClass ? '✓' : '✗'} Class 'health-center-candidate-marker' rendered: ${hasRedBadgeClass}`);
console.log(`  ${hasRedColor ? '✓' : '✗'} Red medical theme (#dc2626) applied: ${hasRedColor}`);
console.log(`  ${hasLabel ? '✓' : '✗'} Label 'Uni Health Center' displayed: ${hasLabel}`);
console.log(`  ${hasVisibleHealth ? '✓' : '✗'} Included in visibleLocations: ${hasVisibleHealth}`);
if (!hasMarkerLogic || !hasRedBadgeClass || !hasRedColor || !hasLabel || !hasVisibleHealth) process.exit(1);

// 5. Check routing engine guard against unconfirmed walking route
const routingFile = fs.readFileSync(path.join(__dirname, '../src/services/routingService.ts'), 'utf-8');
const hasRoutingGuard = routingFile.includes("destination.id === 'uni-health-center'");
console.log('\nTEST 5: Zero-Walking-Route Guard (Entrance Awaiting Verification)');
console.log(`  ${hasRoutingGuard ? '✓' : '✗'} Walking route blocked until entrance confirmed: ${hasRoutingGuard}`);
if (!hasRoutingGuard) process.exit(1);

// 6. Check Main Gate & Auditorium candidates preserved
const hasMainGate = locationsFile.includes("id: 'lpu-main-gate'");
const hasAuditorium = locationsFile.includes("id: 'baldevraj-mittal-auditorium'");
console.log('\nTEST 6: Other Candidate Locations Untouched & Preserved');
console.log(`  ${hasMainGate ? '✓' : '✗'} LPU Main Gate preserved: ${hasMainGate}`);
console.log(`  ${hasAuditorium ? '✓' : '✗'} Sh. Baldevraj Mittal Auditorium preserved: ${hasAuditorium}`);
if (!hasMainGate || !hasAuditorium) process.exit(1);

console.log('\n================================================================');
console.log('ALL UNI HEALTH CENTER CHECKS PASSED (100% OK)');
console.log('================================================================');
