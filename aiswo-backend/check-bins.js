const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const projectId = serviceAccount.project_id;
const databaseURL = `https://${projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`;

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL
  });
}

const db = admin.database();

db.ref('bins').once('value', (snapshot) => {
  const bins = snapshot.val();
  console.log('\n📦 Bins in Firebase:\n');
  
  if (!bins) {
    console.log('❌ No bins found!');
  } else {
    console.log('Found', Object.keys(bins).length, 'bins:\n');
    console.log(JSON.stringify(bins, null, 2));
  }
  process.exit(0);
});
