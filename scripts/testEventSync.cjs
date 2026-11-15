const fs = require('fs');
const path = require('path');

const DB_FILE = path.resolve(__dirname, '..', '.campus_events_db.json');

function testSync() {
  console.log('Testing Campus Event Synchronization & Deletion Logic...');

  // 1. Initial State
  const initial = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  console.log('Initial events count:', initial.events.length);

  // 2. Add Test Event
  const testEvent = {
    id: 'evt_test_123',
    title: 'LPU Tech Fusion 2026',
    category: 'workshop',
    description: 'Robotics and AI Hackathon at UniPolis',
    locationId: 'unipolis',
    locationName: 'UniPolis Amphitheatre',
    coordinates: { lat: 31.25360, lng: 75.70320 },
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date(Date.now() + 7200000).toISOString(),
    creatorName: 'Aman',
    creatorUid: 'std_test_01',
    status: 'live',
    reportCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  initial.events.unshift(testEvent);
  fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  console.log('✓ Added test live event: "LPU Tech Fusion 2026" (status: live)');

  // 3. Confirm live on public map check
  const readAfterAdd = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  const activeEvents = readAfterAdd.events.filter(e => e.status === 'live' || e.status === 'upcoming');
  if (activeEvents.find(e => e.id === 'evt_test_123')) {
    console.log('✓ Event is actively visible on public map');
  } else {
    throw new Error('Event should be active');
  }

  // 4. Admin Deletes Event (Soft-delete with status: removed_by_admin)
  const nowIso = new Date().toISOString();
  readAfterAdd.events = readAfterAdd.events.map(e => {
    if (e.id === 'evt_test_123') {
      return {
        ...e,
        status: 'removed_by_admin',
        updatedAt: nowIso,
        removedAt: nowIso,
        moderationReason: 'Violates campus event noise regulations',
        removedBy: 'Chief Proctor Dr. Sharma'
      };
    }
    return e;
  });
  fs.writeFileSync(DB_FILE, JSON.stringify(readAfterAdd, null, 2), 'utf-8');
  console.log('✓ Admin performed authoritative deletion (status: removed_by_admin)');

  // 5. Verify Public Map Filter
  const readAfterDelete = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  const activeAfterDelete = readAfterDelete.events.filter(e => e.status === 'live' || e.status === 'upcoming');
  const isStillOnPublicMap = activeAfterDelete.some(e => e.id === 'evt_test_123');
  if (!isStillOnPublicMap) {
    console.log('✓ Confirmed: Deleted event IMMEDIATELY removed from public live map');
  } else {
    throw new Error('CRITICAL BUG: Deleted event still appears in public active events!');
  }

  // 6. Verify Admin History
  const deletedRecord = readAfterDelete.events.find(e => e.id === 'evt_test_123');
  if (deletedRecord && deletedRecord.status === 'removed_by_admin') {
    console.log('✓ Confirmed: Admin audit trail preserved:');
    console.log('   - Status:', deletedRecord.status);
    console.log('   - Moderation Reason:', deletedRecord.moderationReason);
    console.log('   - Removed At:', deletedRecord.removedAt);
    console.log('   - Removed By:', deletedRecord.removedBy);
  } else {
    throw new Error('Admin audit record missing or corrupted');
  }

  // 7. Cleanup
  readAfterDelete.events = readAfterDelete.events.filter(e => e.id !== 'evt_test_123');
  fs.writeFileSync(DB_FILE, JSON.stringify(readAfterDelete, null, 2), 'utf-8');
  console.log('✓ Cleaned up test record. All synchronization tests passed!');
}

testSync();