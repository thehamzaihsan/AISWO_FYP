#!/usr/bin/env node

/**
 * Check Admin Users in Firestore
 * This script shows all admins and operators in the database
 */

const admin = require("firebase-admin");
const fs = require("fs");

async function checkUsers() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║          🔍 AISWO User Database Checker                     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  try {
    // Initialize Firebase
    let serviceAccount;
    let databaseURL;
    
    if (fs.existsSync('./serviceAccountKey.json')) {
      serviceAccount = require("./serviceAccountKey.json");
      const projectId = serviceAccount.project_id;
      databaseURL = process.env.FIREBASE_DATABASE_URL || 
                    `https://${projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`;
      console.log('📝 Using local serviceAccountKey.json');
    } else {
      throw new Error('serviceAccountKey.json not found');
    }

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL
      });
    }
    
    const firestore = admin.firestore();
    console.log('✅ Connected to Firebase\n');

    // Check admins collection
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 ADMINS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const adminsSnapshot = await firestore.collection('admins').get();
    
    if (adminsSnapshot.empty) {
      console.log('❌ No admins found in database!');
      console.log('\n💡 Create an admin with: node create-admin.js\n');
    } else {
      console.log(`Found ${adminsSnapshot.size} admin(s):\n`);
      adminsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`📧 Email: ${data.email}`);
        console.log(`👤 Name:  ${data.name}`);
        console.log(`🆔 ID:    ${doc.id}`);
        console.log(`📅 Created: ${data.createdAt}`);
        console.log(`🔐 Has Password: ${data.password ? 'Yes ✓' : 'No ✗'}`);
        console.log('─'.repeat(62));
      });
    }

    // Check operators collection
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👷 OPERATORS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const operatorsSnapshot = await firestore.collection('operators').get();
    
    if (operatorsSnapshot.empty) {
      console.log('❌ No operators found in database!\n');
    } else {
      console.log(`Found ${operatorsSnapshot.size} operator(s):\n`);
      operatorsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`📧 Email: ${data.email || 'Not set'}`);
        console.log(`👤 Name:  ${data.name}`);
        console.log(`🆔 ID:    ${doc.id}`);
        console.log(`🔐 Has Password: ${data.password ? 'Yes ✓' : 'No ✗'}`);
        console.log('─'.repeat(62));
      });
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 TIPS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('To create admin:    node create-admin.js');
    console.log('To test login:      node test-login.js');
    console.log('To check Firebase:  node test-firebase.js\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('UNAUTHENTICATED')) {
      console.error('\n⚠️  Your Firebase credentials are invalid!');
      console.error('See: FIREBASE_REGENERATE_KEY.md\n');
    }
    
    process.exit(1);
  }
}

checkUsers();
