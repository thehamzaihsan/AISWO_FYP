#!/usr/bin/env node

const admin = require("firebase-admin");
const bcrypt = require("bcrypt");
const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function verifyPassword() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║          🔐 Password Verification Tool                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  try {
    // Initialize Firebase
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

    const email = await question('📧 Email to check: ');
    const testPassword = await question('🔒 Password to test: ');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Checking database...\n');

    // Check admin
    const adminId = email.toLowerCase().replace(/[@.]/g, '_');
    const adminDoc = await firestore.collection('admins').doc(adminId).get();

    if (adminDoc.exists) {
      const adminData = adminDoc.data();
      console.log('✅ Found in ADMINS collection');
      console.log(`📧 Email: ${adminData.email}`);
      console.log(`👤 Name:  ${adminData.name}`);
      console.log(`🔐 Stored password hash: ${adminData.password.substring(0, 30)}...`);
      
      const passwordMatch = await bcrypt.compare(testPassword, adminData.password);
      
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      if (passwordMatch) {
        console.log('✅ PASSWORD MATCHES! Login should work.');
      } else {
        console.log('❌ PASSWORD DOES NOT MATCH!');
        console.log('\n💡 The password you entered is wrong, OR');
        console.log('   The password was not set correctly when creating the admin.');
        console.log('\n🔧 FIX: Delete and recreate the admin:');
        console.log(`   1. Delete from Firebase Console: admins/${adminId}`);
        console.log('   2. Run: node create-admin.js');
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
    } else {
      console.log('❌ Email not found in admins collection');
      console.log('\n💡 Create admin with: node create-admin.js\n');
    }

    rl.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

verifyPassword();
