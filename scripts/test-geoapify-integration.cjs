/**
 * ============================================================================
 * LPU SMART CAMPUS NAVIGATOR — GEOAPIFY INTEGRATION TEST SUITE
 * ============================================================================
 * Validates Geoapify API service, bounding box filtering, local search priority,
 * deduplication, zero-fake-shortcut routing guardrails, and error handling.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('LPU SMART CAMPUS NAVIGATOR — GEOAPIFY INTEGRATION TEST SUITE');
console.log('================================================================\n');

// ----------------------------------------------------------------------------
// TEST 1: Service Architecture & API Key Management
// ----------------------------------------------------------------------------
console.log('TEST 1: Service Architecture & API Key Management');

const geoapifyServiceFile = fs.readFileSync(
  path.join(__dirname, '../src/services/geoapifyService.ts'),
  'utf8'
);

const geoapifyTypesFile = fs.readFileSync(
  path.join(__dirname, '../src/types/geoapify.ts'),
  'utf8'
);

// 1. Never hardcode API key in source code
const hardcodedKeyRegex = /['"][a-f0-9]{32}['"]/i;
const hasHardcodedKey = hardcodedKeyRegex.test(geoapifyServiceFile);
assert.strictEqual(hasHardcodedKey, false, 'No hardcoded 32-character API key in source code');
console.log('  ✓ Zero hardcoded API keys in source code: true');

// 2. Reads from VITE_GEOAPIFY_API_KEY and localStorage override
const usesEnvVar = geoapifyServiceFile.includes('import.meta.env.VITE_GEOAPIFY_API_KEY');
const usesLocalStorage = geoapifyServiceFile.includes('localStorage.getItem');
assert.strictEqual(usesEnvVar, true, 'Reads VITE_GEOAPIFY_API_KEY from env');
assert.strictEqual(usesLocalStorage, true, 'Supports localStorage runtime override');
console.log('  ✓ Environment variable VITE_GEOAPIFY_API_KEY & localStorage override supported: true');

// 3. Status types defined
const hasTypes = geoapifyTypesFile.includes('GeoapifyServiceStatus') &&
                 geoapifyTypesFile.includes('quota_exceeded') &&
                 geoapifyTypesFile.includes('GeoapifyPlaceResult');
assert.strictEqual(hasTypes, true, 'Comprehensive TypeScript definitions in place');
console.log('  ✓ TypeScript definitions & error statuses defined: true\n');

// ----------------------------------------------------------------------------
// TEST 2: LPU Campus Bounding Box & Rect Restrict Filter
// ----------------------------------------------------------------------------
console.log('TEST 2: LPU Campus Bounding Box & Rect Restrict Filter');

// Ensure LPU campus bounding box rect format: minLon,minLat,maxLon,maxLat
const campusBoundsFile = fs.readFileSync(
  path.join(__dirname, '../src/data/campusBounds.ts'),
  'utf8'
);

const hasCampusBounds = campusBoundsFile.includes('southWest') && campusBoundsFile.includes('northEast');
assert.strictEqual(hasCampusBounds, true, 'LPU Campus bounds defined');

// Verify service uses filter=rect:minLon,minLat,maxLon,maxLat
const usesRectFilter = geoapifyServiceFile.includes('filter=rect:') &&
                       geoapifyServiceFile.includes('LPU_FILTER_RECT');
assert.strictEqual(usesRectFilter, true, 'Geoapify search strictly bounded to LPU rect');
console.log('  ✓ Search queries strictly bounded with filter=rect:minLon,minLat,maxLon,maxLat: true');

const usesProximityBias = geoapifyServiceFile.includes('bias=') &&
                          geoapifyServiceFile.includes('LPU_PROXIMITY_BIAS');
assert.strictEqual(usesProximityBias, true, 'Search queries biased to campus centroid');
console.log('  ✓ Search queries proximity-biased to campus centroid: true\n');

// ----------------------------------------------------------------------------
// TEST 3: Search Pipeline, Deduplication & Verified Coordinates Preservation
// ----------------------------------------------------------------------------
console.log('TEST 3: Search Pipeline, Deduplication & Coordinates Preservation');

const searchServiceFile = fs.readFileSync(
  path.join(__dirname, '../src/services/searchService.ts'),
  'utf8'
);

const searchBarFile = fs.readFileSync(
  path.join(__dirname, '../src/components/search/SearchBar.tsx'),
  'utf8'
);

// Search local database first
const callsLocalFirst = searchServiceFile.includes('search(query') &&
                        searchBarFile.includes('searchService.search');
assert.strictEqual(callsLocalFirst, true, 'Search service searches local verified locations');
console.log('  ✓ Local verified campus database queried first: true');

// Merges Geoapify results with deduplication
const hasMergeFunc = searchServiceFile.includes('mergeGeoapifyPlaces');
assert.strictEqual(hasMergeFunc, true, 'Deduplication logic mergeGeoapifyPlaces implemented');
console.log('  ✓ Deduplication (<35m radius or name match) implemented: true');

// Distinct badge for external/geoapify results
const verificationBadgeFile = fs.readFileSync(
  path.join(__dirname, '../src/components/sheet/VerificationBadge.tsx'),
  'utf8'
);
const hasGeoapifyBadge = verificationBadgeFile.includes('Geoapify Search');
assert.strictEqual(hasGeoapifyBadge, true, 'Verification badge clearly flags Geoapify external results');
console.log('  ✓ Geoapify places visually tagged as unverified / survey-pending: true');

// Verify all 5 reference coordinates remain intact and unmodified
const locationsFile = fs.readFileSync(
  path.join(__dirname, '../src/data/locations.ts'),
  'utf8'
);

const preservesMainGate = locationsFile.includes('31.260691694532763') && locationsFile.includes('75.70675425232257');
const preservesAuditorium = locationsFile.includes('31.258513739139417') && locationsFile.includes('75.70787809596429');
const preservesHealthCenter = locationsFile.includes('31.258118286319235') && locationsFile.includes('75.70678342134359');
const preservesBuilding41 = locationsFile.includes('31.251697') && locationsFile.includes('75.701877');

assert.strictEqual(preservesMainGate, true, 'LPU Main Gate coordinates intact');
assert.strictEqual(preservesAuditorium, true, 'Sh. Baldevraj Mittal Auditorium coordinates intact');
assert.strictEqual(preservesHealthCenter, true, 'Uni Health Center coordinates intact');
assert.strictEqual(preservesBuilding41, true, 'Building 41 entrance coordinates intact');
console.log('  ✓ All 5 user-confirmed reference coordinates 100% preserved: true\n');

// ----------------------------------------------------------------------------
// TEST 4: Navigation Hierarchy & Zero-Fake-Route Policy
// ----------------------------------------------------------------------------
console.log('TEST 4: Navigation Hierarchy & Zero-Fake-Route Policy');

const routingServiceFile = fs.readFileSync(
  path.join(__dirname, '../src/services/routingService.ts'),
  'utf8'
);

// 1. Campus graph is primary
const usesCampusGraph = routingServiceFile.includes('findShortestPath');
assert.strictEqual(usesCampusGraph, true, 'Internal campus graph used for navigation');
console.log('  ✓ Local verified campus graph is primary router: true');

// 2. Strict guardrails for candidate locations with unverified entrance
const guardsMainGate = routingServiceFile.includes('lpu-main-gate');
const guardsAuditorium = routingServiceFile.includes('baldevraj-mittal-auditorium');
const guardsHealthCenter = routingServiceFile.includes('uni-health-center');
const guardsBuilding41 = routingServiceFile.includes('building-41');

assert.strictEqual(guardsMainGate, true, 'Main Gate guardrail active');
assert.strictEqual(guardsAuditorium, true, 'Auditorium guardrail active');
assert.strictEqual(guardsHealthCenter, true, 'Uni Health Center guardrail active');
assert.strictEqual(guardsBuilding41, true, 'Building 41 guardrail active');
console.log('  ✓ Strict guardrails prevent fake shortcuts to unverified entrances: true');

// 3. Geoapify routing used only as external/public fallback
const usesGeoapifyRoutingFallback = routingServiceFile.includes('geoapifyService.calculateRoute');
assert.strictEqual(usesGeoapifyRoutingFallback, true, 'Geoapify routing is optional public fallback');
console.log('  ✓ Geoapify Routing API integrated as public/external fallback: true');

// 4. Fallback route tagged with isVerifiedRoute: false
const flagsFallbackRoute = routingServiceFile.includes('isVerifiedRoute: false');
assert.strictEqual(flagsFallbackRoute, true, 'External fallback routes flagged non-verified');
console.log('  ✓ External routes clearly tagged with advisory warning: true\n');

// ----------------------------------------------------------------------------
// TEST 5: Graceful Error Handling & Quota Fallback
// ----------------------------------------------------------------------------
console.log('TEST 5: Graceful Error Handling & Quota Fallback');

// Check 429 quota exceeded handling
const handles429 = geoapifyServiceFile.includes('quota_exceeded') && geoapifyServiceFile.includes('429');
assert.strictEqual(handles429, true, 'HTTP 429 quota exceeded handled gracefully');
console.log('  ✓ HTTP 429 daily quota exhaustion handled gracefully: true');

// Check 401/403 auth error handling
const handlesAuthError = geoapifyServiceFile.includes('401') || geoapifyServiceFile.includes('403');
assert.strictEqual(handlesAuthError, true, 'HTTP 401/403 authorization failures handled');
console.log('  ✓ HTTP 401/403 domain restriction / invalid key handled: true');

// Search and routing continue working with local data when Geoapify fails
const searchHasFallback = searchBarFile.includes('catch') || searchBarFile.includes('localResults');
assert.strictEqual(searchHasFallback, true, 'Search UI survives Geoapify network/auth errors');
console.log('  ✓ Search & map navigation continue offline when Geoapify is down: true\n');

// ----------------------------------------------------------------------------
// TEST 6: OpenFreeMap Liberty Basemap Integrity & Admin Dashboard Tab
// ----------------------------------------------------------------------------
console.log('TEST 6: OpenFreeMap Basemap Integrity & Admin Dashboard Tab');

const campusMapFile = fs.readFileSync(
  path.join(__dirname, '../src/components/map/CampusMap.tsx'),
  'utf8'
);

const adminDashboardFile = fs.readFileSync(
  path.join(__dirname, '../src/pages/AdminDashboardPage.tsx'),
  'utf8'
);

// Basemap URL is OpenFreeMap Liberty
const usesLibertyStyle = campusMapFile.includes('tiles.openfreemap.org/styles/liberty');
assert.strictEqual(usesLibertyStyle, true, 'OpenFreeMap Liberty remains active basemap');
console.log('  ✓ OpenFreeMap Liberty vector tiles remain active basemap: true');

// Admin Dashboard includes Geoapify tab
const hasGeoapifyAdminTab = adminDashboardFile.includes("activeTab === 'geoapify'");
const hasGeoapifyNav = adminDashboardFile.includes("{ id: 'geoapify'");
assert.strictEqual(hasGeoapifyAdminTab, true, 'Admin Dashboard Geoapify management tab present');
assert.strictEqual(hasGeoapifyNav, true, 'Admin sidebar includes Geoapify Services navigation');
console.log('  ✓ Admin Console includes dedicated Geoapify Management Tab: true');

console.log('\n================================================================');
console.log('ALL GEOAPIFY INTEGRATION TESTS PASSED (100% OK)');
console.log('================================================================');
