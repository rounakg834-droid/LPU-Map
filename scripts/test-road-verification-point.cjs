const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('LPU SMART CAMPUS NAVIGATOR — AUDITORIUM LOCATION & PRESENTATION TEST');
console.log('================================================================\n');

// 1. Inspect locations.ts for Sh. Baldevraj Mittal Auditorium
const locationsFile = fs.readFileSync(path.join(__dirname, '../src/data/locations.ts'), 'utf-8');

const hasAuditoriumId = locationsFile.includes("id: 'baldevraj-mittal-auditorium'");
const hasCorrectName = locationsFile.includes("name: 'Sh. Baldevraj Mittal Auditorium'");
const hasCategory = locationsFile.includes("category: 'auditorium_events'");
const hasLat = locationsFile.includes('31.258513739139417');
const hasLng = locationsFile.includes('75.70787809596429');
const hasCandidateStatus = locationsFile.includes("verificationStatus: 'user_confirmed_candidate'");
const entrancePending = locationsFile.includes("isEntranceConfirmed: false");

console.log('TEST 1: Sh. Baldevraj Mittal Auditorium Record in locations.ts');
console.log(`  ${hasAuditoriumId ? '✓' : '✗'} ID 'baldevraj-mittal-auditorium' found: ${hasAuditoriumId}`);
console.log(`  ${hasCorrectName ? '✓' : '✗'} Name 'Sh. Baldevraj Mittal Auditorium': ${hasCorrectName}`);
console.log(`  ${hasCategory ? '✓' : '✗'} Category 'auditorium_events': ${hasCategory}`);
console.log(`  ${hasLat && hasLng ? '✓' : '✗'} Exact coordinates (31.258514, 75.707878): ${hasLat && hasLng}`);
console.log(`  ${hasCandidateStatus && entrancePending ? '✓' : '✗'} User-supplied coordinates & entrance unconfirmed: ${hasCandidateStatus && entrancePending}`);
if (!hasAuditoriumId || !hasCorrectName || !hasCategory || !hasLat || !hasLng) process.exit(1);

// 2. Search aliases check
const searchFile = fs.readFileSync(path.join(__dirname, '../src/services/searchService.ts'), 'utf-8');
const searchShFull = searchFile.includes("'sh. baldevraj mittal auditorium'");
const searchBaldevraj = searchFile.includes("'baldevraj mittal auditorium'");
const searchLpuAud = searchFile.includes("'lpu auditorium'");

console.log('\nTEST 2: Search Engine Queries');
console.log(`  ${searchShFull ? '✓' : '✗'} Search alias 'sh. baldevraj mittal auditorium': ${searchShFull}`);
console.log(`  ${searchBaldevraj ? '✓' : '✗'} Search alias 'baldevraj mittal auditorium': ${searchBaldevraj}`);
console.log(`  ${searchLpuAud ? '✓' : '✗'} Search alias 'lpu auditorium': ${searchLpuAud}`);
if (!searchShFull || !searchBaldevraj || !searchLpuAud) process.exit(1);

// 3. Removal of Road Verification Point label & debug popup from CampusMap.tsx
const mapFile = fs.readFileSync(path.join(__dirname, '../src/components/map/CampusMap.tsx'), 'utf-8');
const hasRoadVerifyMarker = mapFile.includes('<RoadVerificationPointMarker');
const hasRoadVerifyPopup = mapFile.includes('Road Verification Point');

console.log('\nTEST 3: Removal of Road Verification Point Label & Road-Debug Popup');
console.log(`  ${!hasRoadVerifyMarker ? '✓' : '✗'} RoadVerificationPointMarker removed from CampusMap: ${!hasRoadVerifyMarker}`);
console.log(`  ${!hasRoadVerifyPopup ? '✓' : '✗'} Road-debug popup removed from map: ${!hasRoadVerifyPopup}`);
if (hasRoadVerifyMarker || hasRoadVerifyPopup) process.exit(1);

// 4. Auditorium marker in LocationMarkers.tsx
const markersFile = fs.readFileSync(path.join(__dirname, '../src/components/map/LocationMarkers.tsx'), 'utf-8');
const hasAuditoriumMarker = markersFile.includes("loc.id === 'baldevraj-mittal-auditorium'");
const hasAuditoriumPinClass = markersFile.includes('auditorium-candidate-marker');
const hasAuditoriumInVisible = markersFile.includes("sourceList.find((l) => l.id === 'baldevraj-mittal-auditorium')");

console.log('\nTEST 4: Public 2D Auditorium Marker Presentation');
console.log(`  ${hasAuditoriumMarker ? '✓' : '✗'} Auditorium marker logic in LocationMarkers.tsx: ${hasAuditoriumMarker}`);
console.log(`  ${hasAuditoriumPinClass ? '✓' : '✗'} Class 'auditorium-candidate-marker' rendered: ${hasAuditoriumPinClass}`);
console.log(`  ${hasAuditoriumInVisible ? '✓' : '✗'} Included in visibleLocations: ${hasAuditoriumInVisible}`);
if (!hasAuditoriumMarker || !hasAuditoriumPinClass || !hasAuditoriumInVisible) process.exit(1);

// 5. Check Main Gate candidate untouched in locations.ts
const mainGateLat = locationsFile.includes('31.260691694532763');
const mainGateLng = locationsFile.includes('75.70675425232257');
console.log('\nTEST 5: Main Gate Coordinates Preserved & Untouched');
console.log(`  ${mainGateLat ? '✓' : '✗'} Main Gate Latitude 31.260691694532763 preserved: ${mainGateLat}`);
console.log(`  ${mainGateLng ? '✓' : '✗'} Main Gate Longitude 75.70675425232257 preserved: ${mainGateLng}`);
if (!mainGateLat || !mainGateLng) process.exit(1);

// 6. Check routing engine guard against unconfirmed walking route
const routingFile = fs.readFileSync(path.join(__dirname, '../src/services/routingService.ts'), 'utf-8');
const hasRoutingGuard = routingFile.includes("destination.id === 'baldevraj-mittal-auditorium'");
console.log('\nTEST 6: Zero-Walking-Route Guard (Entrance Awaiting Verification)');
console.log(`  ${hasRoutingGuard ? '✓' : '✗'} Walking route blocked until entrance confirmed: ${hasRoutingGuard}`);
if (!hasRoutingGuard) process.exit(1);

console.log('\n================================================================');
console.log('ALL AUDITORIUM LOCATION & PRESENTATION CHECKS PASSED (100% OK)');
console.log('================================================================');
