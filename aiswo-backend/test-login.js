#!/usr/bin/env node

/**
 * Test Login Functionality
 * Tests the login endpoint with admin credentials
 */

const bcrypt = require("bcrypt");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function testLogin() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║          🔐 Login Test Tool                                 ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const email = await question('📧 Email: ');
  const password = await question('🔒 Password: ');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Testing login...\n');

  try {
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ LOGIN SUCCESSFUL!\n');
      console.log('User Data:');
      console.log(JSON.stringify(data, null, 2));
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Role: ${data.role}`);
      if (data.role === 'admin') {
        console.log('🎯 Redirect to: /admin-dashboard');
      } else {
        console.log('🎯 Redirect to: /operator-dashboard');
      }
    } else {
      console.log('❌ LOGIN FAILED!\n');
      console.log(`Status: ${response.status}`);
      console.log(`Error: ${data.error}`);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('💡 Possible issues:');
      console.log('  1. Wrong email or password');
      console.log('  2. User not created yet');
      console.log('  3. Server not running (run: npm start)');
      console.log('\nCheck users with: node check-admin.js');
    }

  } catch (error) {
    console.log('❌ CONNECTION FAILED!\n');
    console.log(`Error: ${error.message}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 Make sure the server is running:');
    console.log('   npm start\n');
  }

  rl.close();
}

testLogin();
