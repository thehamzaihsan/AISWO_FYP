const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./aiswo-backend/aiswo-simple-697dd-firebase-adminsdk-qe7zl-5a62d5f7e1.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://aiswo-simple-697dd-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();

async function restoreBin1() {
  try {
    // Read the 1.json file
    const jsonData = JSON.parse(fs.readFileSync('./1.json', 'utf8'));
    
    console.log('📤 Restoring bin1 to Firebase...');
    
    // Update bin1 in Firebase
    await db.ref('bins/bin1').set(jsonData.bins.bin1);
    
    console.log('✅ bin1 restored successfully!');
    console.log('Structure:', {
      capacity: jsonData.bins.bin1.capacity,
      distance: jsonData.bins.bin1.distance,
      fillPct: jsonData.bins.bin1.fillPct,
      isBlocked: jsonData.bins.bin1.isBlocked,
      location: jsonData.bins.bin1.location,
      name: jsonData.bins.bin1.name,
      status: jsonData.bins.bin1.status,
      updatedAt: jsonData.bins.bin1.updatedAt,
      weightKg: jsonData.bins.bin1.weightKg,
      historyEntries: Object.keys(jsonData.bins.bin1.history).length
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

restoreBin1();
