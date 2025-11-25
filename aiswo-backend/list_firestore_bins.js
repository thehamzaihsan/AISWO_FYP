const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();

async function listBins() {
  const snapshot = await firestore.collection('bins').get();
  console.log("Firestore Bins:");
  snapshot.forEach(doc => {
    console.log(`'${doc.id}'`);
  });
}

listBins().catch(console.error);
