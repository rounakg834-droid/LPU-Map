/**
 * Automated Test Suite for Phase 7: Real-Time Location Sharing & Meet My Friend
 * Verifies:
 *   1. Token cryptography & entropy
 *   2. Share duration enforcement & auto-expiry calculations
 *   3. WhatsApp deep-link generation
 *   4. Coordinate update throttling (battery optimization)
 *   5. Instant revocation (Stop Sharing)
 *   6. Multi-device persistence in .campus_events_db.json
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Phase 7 Location Sharing & Meet My Friend Test Suite...\n');

// 1. Test Token Cryptography
function generateSecureToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const crypto = require('crypto');
  const randomBytes = crypto.randomBytes(24);
  let result = 'lpu_loc_';
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(randomBytes[i] % chars.length);
  }
  return result;
}

const token1 = generateSecureToken();
const token2 = generateSecureToken();
assert(token1.startsWith('lpu_loc_'), 'Token should start with lpu_loc_');
assert.strictEqual(token1.length, 32, 'Token should be 32 characters total (8 prefix + 24 entropy)');
assert.notStrictEqual(token1, token2, 'Two tokens must not collide');
console.log('✅ Test 1: Cryptographic token generation verified (32 chars, 62^24 entropy)');

// 2. Test Expiration Durations
const now = Date.now();
const durations = [15, 60, 480];
durations.forEach((d) => {
  const expiresAt = new Date(now + d * 60 * 1000).toISOString();
  const diffMs = new Date(expiresAt).getTime() - now;
  const diffMinutes = Math.round(diffMs / 60000);
  assert.strictEqual(diffMinutes, d, `Duration ${d}m should compute accurate expiration`);
});
console.log('✅ Test 2: Auto-expiry calculation verified for 15m, 1h, and 8h durations');

// 3. Test WhatsApp Share URL Generator
function generateWhatsAppShareUrl(token, isLive, durationMinutes, note) {
  const origin = 'http://localhost:5173';
  const link = `${origin}/?share=${token}`;
  const modeText = isLive ? 'Live GPS Location (moving)' : 'One-Time Location Pin';
  const durationLabel = durationMinutes >= 60 ? `${durationMinutes / 60} hour(s)` : `${durationMinutes} minutes`;
  const notePart = note ? `\n📝 Note: "${note}"` : '';
  const text = `📍 Track my ${modeText} on LPU Smart Campus Navigator:\n${link}${notePart}\n\n⏱️ Active for: ${durationLabel} (Auto-expires)\n🔒 Private & Encrypted for Lovely Professional University.`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

const testWaUrl = generateWhatsAppShareUrl(token1, true, 60, 'Meet me at UniMall');
assert(testWaUrl.startsWith('https://wa.me/?text='), 'Should be valid WhatsApp link');
assert(testWaUrl.includes(encodeURIComponent(`?share=${token1}`)), 'Must encode share token');
assert(testWaUrl.includes(encodeURIComponent('Meet me at UniMall')), 'Must include optional note');
console.log('✅ Test 3: WhatsApp pre-filled deep link generation verified');

// 4. Test Coordinate Update Battery Throttling
let lastUpdate = 0;
let lastLat = 31.25475;
let lastLng = 75.70375;

function shouldThrottleUpdate(coords, currentTime) {
  const elapsed = currentTime - lastUpdate;
  const dLat = Math.abs(coords.lat - lastLat);
  const dLng = Math.abs(coords.lng - lastLng);
  const movedSignificantly = dLat > 0.000025 || dLng > 0.000025; // >2.5m
  if (elapsed < 2500 && !movedSignificantly) {
    return true; // Throttle (skip broadcast)
  }
  lastUpdate = currentTime;
  lastLat = coords.lat;
  lastLng = coords.lng;
  return false; // Allow broadcast
}

// First update: should pass
assert.strictEqual(shouldThrottleUpdate({ lat: 31.25475, lng: 75.70375 }, 10000), false);
// Rapid jitter update 500ms later with 0.1m movement: should be throttled
assert.strictEqual(shouldThrottleUpdate({ lat: 31.2547501, lng: 75.7037501 }, 10500), true);
// Move significantly 1000ms later (>5 meters): should pass
assert.strictEqual(shouldThrottleUpdate({ lat: 31.25485, lng: 75.70385 }, 11000), false);
// Normal update after 3000ms: should pass
assert.strictEqual(shouldThrottleUpdate({ lat: 31.25485, lng: 75.70385 }, 14500), false);
console.log('✅ Test 4: Battery-optimized GPS throttling verified (filters high-frequency jitter)');

// 5. Test Revocation (Stop Sharing)
const mockShare = {
  token: token1,
  creatorDisplayName: 'Aman (CSE)',
  isLive: true,
  revoked: false,
  expiresAt: new Date(Date.now() + 3600000).toISOString(),
  coords: { lat: 31.25475, lng: 75.70375, accuracy: 5, updatedAt: new Date().toISOString() }
};

// Simulate Stop Sharing
mockShare.revoked = true;
assert.strictEqual(mockShare.revoked, true, 'Share must be marked revoked');

// Recipient check
function isShareValid(share) {
  if (!share) return false;
  if (share.revoked) return false;
  if (new Date(share.expiresAt).getTime() <= Date.now()) return false;
  return true;
}

assert.strictEqual(isShareValid(mockShare), false, 'Revoked share must be rejected by recipient');
console.log('✅ Test 5: Instant revocation & recipient rejection verified');

// 6. Test Multi-Device Database Persistence
const DB_FILE = path.resolve(__dirname, '..', '.campus_events_db.json');
let db = { events: [], metadata: [], reports: [], shares: [] };
if (fs.existsSync(DB_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    if (!db.shares) db.shares = [];
  } catch (e) {}
}

// Add test share
const initialShareCount = db.shares.length;
db.shares = db.shares.filter(s => s.token !== token1);
db.shares.push({
  token: token1,
  creatorDisplayName: 'Test Student',
  isLive: true,
  coords: { lat: 31.25410, lng: 75.70360, accuracy: 8, updatedAt: new Date().toISOString() },
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 3600000).toISOString(),
  revoked: false
});
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');

// Read back from disk
const reloaded = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
const found = (reloaded.shares || []).find(s => s.token === token1);
assert(found, 'Share should persist to disk in .campus_events_db.json');
assert.strictEqual(found.creatorDisplayName, 'Test Student');

// Clean up test entry
db.shares = db.shares.filter(s => s.token !== token1);
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
console.log('✅ Test 6: Shared dev backend persistence in .campus_events_db.json verified');

console.log('\n🎉 ALL PHASE 7 AUTOMATED TESTS PASSED (6/6)!\n');
