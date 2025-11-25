// Script to migrate bins metadata to Firestore
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

async function migrateBinsToFirestore() {
  try {
    console.log('🔄 Starting bins migration to Firestore...\n');
    
    // Get all bins from Realtime Database
    const snapshot = await db.ref('bins').once('value');
    const bins = snapshot.val();
    
    if (!bins) {
      console.log('⚠️  No bins found in Realtime Database');
      return;
    }
    
    console.log(`📦 Found ${Object.keys(bins).length} bins in Realtime Database\n`);
    
    // Get operators to check assignments
    const operatorsSnapshot = await firestore.collection('operators').get();
    const operators = {};
    operatorsSnapshot.forEach(doc => {
      operators[doc.id] = doc.data();
    });
    
    // Migrate each bin
    const batch = firestore.batch();
    let count = 0;
    
    for (const [binId, binData] of Object.entries(bins)) {
      // Find assigned operator
      let assignedTo = null;
      for (const [opId, operator] of Object.entries(operators)) {
        if (operator.assignedBins && operator.assignedBins.includes(binId)) {
          assignedTo = opId;
          break;
        }
      }
      
      // Create Firestore document with metadata only
      const binMetadata = {
        binId: binId,
        name: binData.name || `Bin ${binId.replace('bin', '')}`,
        location: binData.location || 'Unknown Location',
        capacity: binData.capacity || 3,
        assignedTo: assignedTo,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const docRef = firestore.collection('bins').doc(binId);
      batch.set(docRef, binMetadata, { merge: true });
      
      console.log(`✅ ${binId}: ${binMetadata.name} (${binMetadata.location}) - Assigned: ${assignedTo || 'None'}`);
      count++;
    }
    
    // Commit batch
    await batch.commit();
    
    console.log(`\n✅ Successfully migrated ${count} bins to Firestore!`);
    console.log('\nFirestore collection structure:');
    console.log('  bins/{binId}');
    console.log('    ├── binId (string)');
    console.log('    ├── name (string)');
    console.log('    ├── location (string)');
    console.log('    ├── capacity (number)');
    console.log('    ├── assignedTo (string | null)');
    console.log('    ├── createdAt (timestamp)');
    console.log('    └── updatedAt (timestamp)');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrateBinsToFirestore();
