// Clean up metadata fields from Realtime Database and sync assignedTo
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (admin.apps.length === 0) {
  const projectId = serviceAccount.project_id;
  const databaseURL = `https://${projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`;
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL
  });
}

const db = admin.database();
const firestore = admin.firestore();

async function cleanupAndSync() {
  try {
    console.log('🧹 Cleaning up Realtime Database and syncing assignments...\n');
    
    // Get operators
    const operatorsSnapshot = await firestore.collection('operators').get();
    const operators = {};
    operatorsSnapshot.forEach(doc => {
      operators[doc.id] = doc.data();
    });
    
    console.log(`📋 Found ${Object.keys(operators).length} operators\n`);
    
    // Get all bins from Realtime DB
    const snapshot = await db.ref('bins').once('value');
    const bins = snapshot.val();
    
    if (!bins) {
      console.log('⚠️  No bins found');
      return;
    }
    
    console.log(`🗑️  Processing ${Object.keys(bins).length} bins...\n`);
    
    for (const [binId, binData] of Object.entries(bins)) {
      console.log(`Processing ${binId}...`);
      
      // Remove name, location, capacity from Realtime DB (keep only technical data)
      const updates = {};
      if (binData.name !== undefined) {
        updates[`bins/${binId}/name`] = null;
        console.log(`  ✂️  Removed 'name' field`);
      }
      if (binData.location !== undefined) {
        updates[`bins/${binId}/location`] = null;
        console.log(`  ✂️  Removed 'location' field`);
      }
      if (binData.capacity !== undefined) {
        updates[`bins/${binId}/capacity`] = null;
        console.log(`  ✂️  Removed 'capacity' field`);
      }
      
      if (Object.keys(updates).length > 0) {
        await db.ref().update(updates);
      }
      
      // Update assignedTo in Firestore
      let assignedTo = null;
      for (const [opId, operator] of Object.entries(operators)) {
        if (operator.assignedBins && operator.assignedBins.includes(binId)) {
          assignedTo = opId;
          break;
        }
      }
      
      await firestore.collection('bins').doc(binId).update({
        assignedTo: assignedTo,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`  ✅ Updated Firestore assignedTo: ${assignedTo || 'None'}`);
      console.log('');
    }
    
    console.log('✅ Cleanup and sync complete!\n');
    console.log('Summary:');
    console.log('  - Removed name, location, capacity from Realtime DB');
    console.log('  - Updated assignedTo field in Firestore');
    console.log('  - Metadata now only in Firestore');
    console.log('  - Technical data only in Realtime DB');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanupAndSync();
