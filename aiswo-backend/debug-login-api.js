#!/usr/bin/env node

/**
 * Debug Login API - Tests the actual login logic step by step
 */

const admin = require("firebase-admin");
const bcrypt = require("bcrypt");
const fs = require("fs");

async function debugLogin() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║          🐛 Login API Debug Tool                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const testEmail = "admin@gmail.com";
  const testPassword = "admin"; // Try common passwords

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
    console.log('✅ Firebase connected\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Testing Login Logic with:', testEmail);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 1: Check admins collection (exactly as server.js does)
    console.log('Step 1: Checking admins collection...');
    const adminId = testEmail.toLowerCase().replace(/[@.]/g, '_');
    console.log(`  Admin ID: ${adminId}`);
    
    const adminDoc = await firestore.collection('admins').doc(adminId).get();
    console.log(`  Document exists: ${adminDoc.exists}`);

    if (adminDoc.exists) {
      const adminData = adminDoc.data();
      console.log(`  ✅ Admin found!`);
      console.log(`  Email: ${adminData.email}`);
      console.log(`  Name: ${adminData.name}`);
      console.log(`  Has password field: ${!!adminData.password}`);
      
      if (adminData.password) {
        console.log(`  Password hash (first 30 chars): ${adminData.password.substring(0, 30)}...`);
        
        // Test multiple common passwords
        const passwordsToTest = ['admin', 'admin123', 'password', '123456', 'charagh'];
        
        console.log('\n  Testing common passwords:');
        for (const pwd of passwordsToTest) {
          const match = await bcrypt.compare(pwd, adminData.password);
          console.log(`    "${pwd}": ${match ? '✅ MATCH!' : '❌ no match'}`);
          if (match) {
            console.log(`\n  🎉 PASSWORD FOUND: "${pwd}"`);
            break;
          }
        }
        
        console.log('\n  Now testing YOUR login flow exactly as server does:');
        console.log('  ────────────────────────────────────────────────────────\n');
        
        // Simulate exact server logic
        if (!adminData.password) {
          console.log('  ❌ Would return: "Account setup incomplete"');
        } else {
          const passwordMatch = await bcrypt.compare('admin', adminData.password);
          
          if (!passwordMatch) {
            console.log('  ❌ Would return: "Invalid credentials"');
            console.log('  \n  This is where your login is failing!');
            console.log('  The password "admin" does NOT match the stored hash.');
          } else {
            console.log('  ✅ Would return: User data (success)');
            const { password: _, ...adminProfile } = adminData;
            console.log('  Response would be:', JSON.stringify({
              ...adminProfile,
              userId: adminDoc.id,
              role: 'admin'
            }, null, 2));
          }
        }
      }
    } else {
      console.log('  ❌ Admin NOT found');
      console.log('  Would check operators next...\n');
      
      // Step 2: Check operators
      console.log('Step 2: Checking operators collection...');
      const operatorsRef = firestore.collection('operators');
      const snapshot = await operatorsRef.where('email', '==', testEmail).get();
      console.log(`  Found ${snapshot.size} operator(s) with this email`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 FINDINGS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('If none of the common passwords matched, you need to:');
    console.log('1. Delete the admin from Firebase Console');
    console.log('2. Create a new admin with: node create-admin.js');
    console.log('3. Use a password you will REMEMBER!\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

debugLogin();
