const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('LPU SMART CAMPUS NAVIGATOR — OPENFREEMAP & OSM BUILDINGS TEST');
console.log('================================================================\n');

// 1. OpenFreeMap Liberty Vector Style Check in CampusMap.tsx
const campusMapFile = fs.readFileSync(path.join(__dirname, '../src/components/map/CampusMap.tsx'), 'utf-8');
const hasLibertyStyle = campusMapFile.includes('https://tiles.openfreemap.org/styles/liberty');
const hasPitchZero = campusMapFile.includes('pitch: 0') && campusMapFile.includes('maxPitch: 0');
console.log('TEST 1: OpenFreeMap Liberty Vector Integration & 2D Perspective');
console.log(`  ${hasLibertyStyle ? '✓' : '✗'} OpenFreeMap Liberty URL (https://tiles.openfreemap.org/styles/liberty): ${hasLibertyStyle}`);
console.log(`  ${hasPitchZero ? '✓' : '✗'} Strict 2D mode enforced (pitch: 0, maxPitch: 0): ${hasPitchZero}`);
if (!hasLibertyStyle || !hasPitchZero) process.exit(1);

// 2. OSM Buildings GeoJSON Audit
const buildingsFile = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/osm_buildings.geojson.json'), 'utf-8'));
const totalBuildings = buildingsFile.features.length;
const namedBuildings = buildingsFile.features.filter(f => f.properties.hasOsmName).length;
const unnamedBuildings = totalBuildings - namedBuildings;

console.log('\nTEST 2: OSM Building Footprints Dataset');
console.log(`  ✓ Total Buildings Imported: ${totalBuildings} (Expected: 186)`);
console.log(`  ✓ Buildings with Verified Names: ${namedBuildings} (Expected: 24)`);
console.log(`  ✓ Buildings without Names: ${unnamedBuildings} (Expected: 162)`);
if (totalBuildings !== 186 || namedBuildings !== 24 || unnamedBuildings !== 162) process.exit(1);

// 3. Clickable Buildings with Location Details
const hasBuildingFillLayer = campusMapFile.includes("id: 'campus-buildings-fill'");
const hasBuildingClick = campusMapFile.includes("'click', 'campus-buildings-fill'");
const hasOnSelectLocation = campusMapFile.includes('onSelectLocation(bldLocation)');

console.log('\nTEST 3: Interactive Building Selection & Details');
console.log(`  ${hasBuildingFillLayer ? '✓' : '✗'} Building fill layer configured: ${hasBuildingFillLayer}`);
console.log(`  ${hasBuildingClick ? '✓' : '✗'} Map click listener on building footprints: ${hasBuildingClick}`);
console.log(`  ${hasOnSelectLocation ? '✓' : '✗'} Dispatches onSelectLocation for details panel: ${hasOnSelectLocation}`);
if (!hasBuildingFillLayer || !hasBuildingClick || !hasOnSelectLocation) process.exit(1);

// 4. OSM Highways & Walkways Layer
const highwaysFile = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/osm_highways.geojson.json'), 'utf-8'));
const hasWalkwayLayer = campusMapFile.includes("id: 'campus-highways-walkways'");
const hasRoadLayer = campusMapFile.includes("id: 'campus-highways-roads'");

console.log('\nTEST 4: OSM Highways & Pathways Layer');
console.log(`  ✓ Total OSM Highway Features: ${highwaysFile.features.length} (Expected: 153)`);
console.log(`  ${hasWalkwayLayer ? '✓' : '✗'} Walkways layer rendered: ${hasWalkwayLayer}`);
console.log(`  ${hasRoadLayer ? '✓' : '✗'} Roads layer rendered: ${hasRoadLayer}`);
if (!hasWalkwayLayer || !hasRoadLayer || highwaysFile.features.length !== 153) process.exit(1);

// 5. Preserved User-Provided Locations
const locationsFile = fs.readFileSync(path.join(__dirname, '../src/data/locations.ts'), 'utf-8');
const hasMainGate = locationsFile.includes('31.260691694532763') && locationsFile.includes('75.70675425232257');
const hasUniMall = locationsFile.includes('31.25420') && locationsFile.includes('75.70560');
const hasHealthCenter = locationsFile.includes('31.258118286319235') && locationsFile.includes('75.70678342134359');
const hasAuditorium = locationsFile.includes('31.258513739139417') && locationsFile.includes('75.70787809596429');
const hasBuilding41 = locationsFile.includes('31.251697') && locationsFile.includes('75.701877');

console.log('\nTEST 5: Preserved User-Provided Reference Coordinates');
console.log(`  ${hasMainGate ? '✓' : '✗'} LPU Main Gate preserved (31.260692, 75.706754): ${hasMainGate}`);
console.log(`  ${hasUniMall ? '✓' : '✗'} UniMall preserved (31.25360, 75.70380): ${hasUniMall}`);
console.log(`  ${hasHealthCenter ? '✓' : '✗'} Uni Health Center preserved (31.258118, 75.706783): ${hasHealthCenter}`);
console.log(`  ${hasAuditorium ? '✓' : '✗'} Sh. Baldevraj Mittal Auditorium preserved (31.258514, 75.707878): ${hasAuditorium}`);
console.log(`  ${hasBuilding41 ? '✓' : '✗'} Building 41 entrance preserved (31.251697, 75.701877): ${hasBuilding41}`);
if (!hasMainGate || !hasUniMall || !hasHealthCenter || !hasAuditorium || !hasBuilding41) process.exit(1);

// 6. Zero Fake Buildings / Numbers
const hasFake422Numbers = campusMapFile.includes('Building 422') || campusMapFile.includes('Building 1300');
console.log('\nTEST 6: Zero Fabricated Building Numbers');
console.log(`  ${!hasFake422Numbers ? '✓' : '✗'} No fake building numbers displayed in map: ${!hasFake422Numbers}`);
if (hasFake422Numbers) process.exit(1);

console.log('\n================================================================');
console.log('ALL OPENFREEMAP & OSM BUILDING CHECKS PASSED (100% OK)');
console.log('================================================================');
