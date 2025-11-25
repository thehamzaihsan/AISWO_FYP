#!/usr/bin/env node

/**
 * Reset Admin Password
 * Updates the password for an existing admin
 */

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

async function resetPassword() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║          🔑 Admin Password Reset Tool                       ║');
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
    console.log('✅ Connected to Firebase\n');

    const email = await question('📧 Admin email to reset: ');
    const newPassword = await question('🔒 New password (min 6 chars): ');

    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Resetting password...\n');

    const adminId = email.toLowerCase().replace(/[@.]/g, '_');
    const adminDoc = await firestore.collection('admins').doc(adminId).get();

    if (!adminDoc.exists) {
      throw new Error(`Admin with email ${email} not found`);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await firestore.collection('admins').doc(adminId).update({
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    });

    console.log('✅ Password updated successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 You can now login with:');
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${newPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 Test login with: node test-login.js\n');

    rl.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

resetPassword();
