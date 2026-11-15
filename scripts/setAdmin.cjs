/**
 * LPU Smart Campus Navigator - First Administrator Provisioning Script
 * 
 * Usage:
 *   node scripts/setAdmin.cjs <user_email_or_uid>
 * 
 * Prerequisites:
 *   1. Download your Firebase Service Account Private Key from Firebase Console:
 *      Project Settings -> Service Accounts -> "Generate new private key"
 *   2. Save the file as "serviceAccountKey.json" in this project directory (or set GOOGLE_APPLICATION_CREDENTIALS)
 *   3. Run: node scripts/setAdmin.cjs your-admin-email@lpu.co.in
 */

const fs = require('fs');
const path = require('path');

const targetUser = process.argv[2];

if (!targetUser) {
  console.error('\x1b[31mError: Target user email or UID is required.\x1b[0m');
  console.log('Usage: node scripts/setAdmin.cjs <user_email_or_uid>');
  process.exit(1);
}

const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (!fs.existsSync(keyPath) && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('\x1b[33mWarning: serviceAccountKey.json not found in project root.\x1b[0m');
  console.log(`
To assign an official administrator:
1. Visit https://console.firebase.google.com -> Project Settings -> Service accounts
2. Click "Generate new private key" and save as "serviceAccountKey.json" in this folder.
3. Run: node scripts/setAdmin.cjs ${targetUser}

Alternatively, you can manually add the user UID to the 'admin_users' collection in Firestore Console:
  Collection: admin_users
  Document ID: <User UID>
  Fields:
    email: "${targetUser}"
    role: "administrator"
    grantedAt: "${new Date().toISOString()}"
`);
  process.exit(0);
}

try {
  const admin = require('firebase-admin');
  const serviceAccount = require(keyPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  async function grantAdmin() {
    let userRecord;
    if (targetUser.includes('@')) {
      userRecord = await admin.auth().getUserByEmail(targetUser);
    } else {
      userRecord = await admin.auth().getUser(targetUser);
    }

    // 1. Assign Firebase Auth Custom User Claim
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    console.log(`\x1b[32m✓ Granted custom claim { admin: true } to user: ${userRecord.email || userRecord.uid}\x1b[0m`);

    // 2. Insert into Firestore admin_users collection
    await admin.firestore().collection('admin_users').doc(userRecord.uid).set({
      email: userRecord.email || '',
      uid: userRecord.uid,
      role: 'administrator',
      grantedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`\x1b[32m✓ Recorded in Firestore /admin_users/${userRecord.uid}\x1b[0m`);

    console.log('\x1b[36mAdministrator successfully activated! The user can now log in at /admin.\x1b[0m');
  }

  grantAdmin().catch((err) => {
    console.error('\x1b[31mFailed to grant admin privileges:\x1b[0m', err.message);
  });
} catch (e) {
  console.error('firebase-admin could not be loaded:', e.message);
}
