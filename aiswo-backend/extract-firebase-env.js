#!/usr/bin/env node

/**
 * Extract Firebase Environment Variables
 * This script reads serviceAccountKey.json and outputs environment variables
 * that you can copy to Vercel
 */

const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(keyPath)) {
  console.error('❌ Error: serviceAccountKey.json not found!');
  console.error('Make sure you have the file in aiswo-backend/');
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  
  console.log('');
  console.log('=' .repeat(70));
  console.log('📋 FIREBASE ENVIRONMENT VARIABLES FOR VERCEL');
  console.log('=' .repeat(70));
  console.log('');
  console.log('Copy and paste these into Vercel → Settings → Environment Variables:');
  console.log('');
  console.log('─'.repeat(70));
  console.log('');
  
  const envVars = {
    FIREBASE_PROJECT_ID: serviceAccount.project_id,
    FIREBASE_PRIVATE_KEY_ID: serviceAccount.private_key_id,
    FIREBASE_PRIVATE_KEY: serviceAccount.private_key,
    FIREBASE_CLIENT_EMAIL: serviceAccount.client_email,
    FIREBASE_CLIENT_ID: serviceAccount.client_id,
    FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL || 
                          `https://${serviceAccount.project_id}-default-rtdb.asia-southeast1.firebasedatabase.app`
  };
  
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
    console.log('');
  });
  
  console.log('─'.repeat(70));
  console.log('');
  console.log('⚠️  IMPORTANT NOTES:');
  console.log('');
  console.log('1. Keep the \\n characters as literal \\n (not actual newlines)');
  console.log('2. Set these for Production, Preview, and Development');
  console.log('3. Never commit these values to Git');
  console.log('4. After adding, redeploy your Vercel project');
  console.log('');
  console.log('=' .repeat(70));
  console.log('');
  
  // Also save to a file for easy copying
  const outputFile = 'vercel-env-vars.txt';
  const output = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync(outputFile, output);
  console.log(`✅ Environment variables also saved to: ${outputFile}`);
  console.log('   (This file is gitignored - safe to delete after use)');
  console.log('');
  
} catch (error) {
  console.error('❌ Error reading serviceAccountKey.json:', error.message);
  process.exit(1);
}
