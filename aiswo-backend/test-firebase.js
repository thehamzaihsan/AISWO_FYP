const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

const projectId = serviceAccount.project_id;
const databaseURL = `https://${projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`;

console.log('Initializing Firebase Admin...');
console.log('Project:', projectId);
console.log('Database URL:', databaseURL);

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL
  });
  
  const db = admin.database();
  const firestore = admin.firestore();
  
  console.log('✅ Firebase initialized');
  console.log('Firestore instance:', typeof firestore);
  console.log('Database instance:', typeof db);
  
  // Test Firestore connection
  console.log('\nTesting Firestore connection...');
  firestore.collection('operators').get()
    .then(snapshot => {
      console.log(`✅ Successfully connected to Firestore`);
      console.log(`Found ${snapshot.size} operators`);
      
      snapshot.forEach(doc => {
        console.log(`  - ${doc.id}:`, doc.data());
      });
      
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Firestore connection error:');
      console.error(error);
      process.exit(1);
    });
    
} catch (error) {
  console.error('❌ Firebase initialization error:');
  console.error(error);
  process.exit(1);
}
