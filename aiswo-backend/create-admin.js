#!/usr/bin/env node

/**
 * Create Admin User in Firestore
 * This script creates an admin user in the Firestore database
 * Run once to set up your admin account
 */

const admin = require("firebase-admin");
const bcrypt = require("bcrypt");
const readline = require("readline");
const fs = require("fs");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask questions
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Main function
async function createAdmin() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║          🔐 AISWO Admin User Creator                        ║');
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
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
        universe_domain: "googleapis.com"
      };
      databaseURL = process.env.FIREBASE_DATABASE_URL || 
                    `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.asia-southeast1.firebasedatabase.app`;
      console.log('🌐 Using environment variables');
    } else {
      throw new Error('No Firebase credentials found');
    }

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL
      });
    }
    
    const firestore = admin.firestore();
    console.log('✅ Connected to Firebase\n');

    // Get admin details from user
    console.log('Please enter admin details:\n');
    
    const email = await question('📧 Email: ');
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address');
    }

    const password = await question('🔒 Password (min 6 characters): ');
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const name = await question('👤 Name (default: Admin): ') || 'Admin';

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Creating admin user...\n');

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin document
    const adminData = {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name.trim(),
      role: 'admin',
      createdAt: new Date().toISOString(),
      isActive: true
    };

    // Use email as document ID (replace @ and . with _)
    const adminId = email.toLowerCase().replace(/[@.]/g, '_');

    // Save to Firestore
    await firestore.collection('admins').doc(adminId).set(adminData);

    console.log('✅ Admin user created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Admin Details:');
    console.log(`   Email:    ${email}`);
    console.log(`   Name:     ${name}`);
    console.log(`   ID:       ${adminId}`);
    console.log(`   Role:     admin`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 You can now login with these credentials!\n');

    rl.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Run the script
createAdmin();
