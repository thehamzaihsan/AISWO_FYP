// Test operator email notification when bin is full
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const firestore = admin.firestore();

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "m.charaghyousafkhan@gmail.com",
    pass: "vskvkbyqrfqjdail"
  }
});

async function testOperatorNotification() {
  try {
    console.log('🔍 Testing operator email notification...\n');
    
    // Get operators
    const operatorsSnapshot = await firestore.collection('operators').get();
    const operators = {};
    operatorsSnapshot.forEach(doc => {
      operators[doc.id] = doc.data();
    });
    
    console.log('📋 Found operators:', Object.keys(operators).length);
    
    // Simulate a full bin (bin2)
    const testBin = {
      id: 'bin2',
      name: 'Kitchen Bin',
      location: 'Kitchen',
      weightKg: 4.5,
      fillPct: 90,
      status: 'NEEDS_EMPTYING',
      updatedAt: new Date().toISOString()
    };
    
    console.log(`\n🗑️  Simulating full bin: ${testBin.id}`);
    console.log(`   - Fill Level: ${testBin.fillPct}%`);
    console.log(`   - Weight: ${testBin.weightKg}kg`);
    
    // Find operator assigned to this bin
    let assignedOperator = null;
    for (const [opId, operator] of Object.entries(operators)) {
      if (operator.assignedBins && operator.assignedBins.includes(testBin.id)) {
        assignedOperator = {
          id: opId,
          name: operator.name,
          email: operator.email
        };
        break;
      }
    }
    
    if (assignedOperator) {
      console.log(`\n👤 Assigned Operator Found:`);
      console.log(`   - Name: ${assignedOperator.name}`);
      console.log(`   - Email: ${assignedOperator.email}`);
      
      // Send email (exactly as server.js does)
      const operatorAlertEmail = {
        from: 'm.charaghyousafkhan@gmail.com',
        to: assignedOperator.email,
        subject: `🚨 URGENT: Bin ${testBin.id.toUpperCase()} is Full - Immediate Action Required`,
        text: `Dear ${assignedOperator.name},

Bin ${testBin.id.toUpperCase()} (${testBin.name || testBin.id}) is at ${testBin.fillPct.toFixed(1)}% capacity and needs immediate attention.

Bin Details:
- Location: ${testBin.location || 'Not specified'}
- Current Weight: ${testBin.weightKg.toFixed(2)} kg
- Fill Level: ${testBin.fillPct.toFixed(1)}%
- Status: ${testBin.status}

Please empty this bin as soon as possible to prevent overflow.

Best regards,
Smart Bin Monitoring System

[TEST EMAIL - This is to verify the notification system works]`
      };
      
      console.log(`\n📧 Sending email to: ${assignedOperator.email}`);
      
      const info = await transporter.sendMail(operatorAlertEmail);
      
      console.log('✅ Email sent successfully!');
      console.log('Response:', info.response);
      console.log(`\n✨ Check ${assignedOperator.email} inbox for the alert!`);
      
    } else {
      console.log('\n⚠️  No operator assigned to this bin');
      console.log('Email would be sent to admin instead');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testOperatorNotification();
