const admin = require("firebase-admin");
const bcrypt = require("bcrypt");
const fs = require("fs");

async function testPassword() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║          Testing Password: "admin1"                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  try {
    let serviceAccount = require("./serviceAccountKey.json");
    const projectId = serviceAccount.project_id;
    const databaseURL = `https://${projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`;

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL
      });
    }
    
    const firestore = admin.firestore();
    
    const adminDoc = await firestore.collection('admins').doc('admin_gmail_com').get();
    const adminData = adminDoc.data();
    
    console.log('Testing password "admin1" against stored hash...\n');
    
    const match = await bcrypt.compare('admin1', adminData.password);
    
    if (match) {
      console.log('✅✅✅ PASSWORD MATCHES! ✅✅✅\n');
      console.log('Your login should work with:');
      console.log('  Email: admin@gmail.com');
      console.log('  Password: admin1\n');
    } else {
      console.log('❌ Password "admin1" does NOT match\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testPassword();
