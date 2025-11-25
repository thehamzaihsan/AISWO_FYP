const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const bcrypt = require("bcrypt");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

let firestore = null;

// Initialize Firebase
(async () => {
  try {
    let serviceAccount = require("./serviceAccountKey.json");
    const projectId = serviceAccount.project_id;
    const databaseURL = `https://${projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`;

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL
      });
    }
    
    firestore = admin.firestore();
    console.log('✅ Firestore initialized');
  } catch (error) {
    console.error('❌ Firebase init error:', error.message);
  }
})();

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(`\n[LOGIN REQUEST] Email: ${email}`);
  console.log(`[LOGIN REQUEST] Password length: ${password?.length}`);
  console.log(`[LOGIN REQUEST] Firestore ready: ${!!firestore}`);

  try {
    if (!firestore) {
      console.log('[LOGIN] Firestore not ready!');
      return res.status(503).json({ error: "Firestore not initialized" });
    }

    const adminId = email.toLowerCase().replace(/[@.]/g, '_');
    console.log(`[LOGIN] Looking for admin ID: ${adminId}`);
    
    const adminDoc = await firestore.collection('admins').doc(adminId).get();
    console.log(`[LOGIN] Admin exists: ${adminDoc.exists}`);

    if (adminDoc.exists) {
      const adminData = adminDoc.data();
      console.log(`[LOGIN] Admin email from DB: ${adminData.email}`);
      console.log(`[LOGIN] Has password: ${!!adminData.password}`);
      
      if (adminData.password) {
        const match = await bcrypt.compare(password, adminData.password);
        console.log(`[LOGIN] Password match result: ${match}`);
        
        if (match) {
          console.log('[LOGIN] ✅ SUCCESS!');
          const { password: _, ...adminProfile } = adminData;
          return res.json({
            ...adminProfile,
            userId: adminDoc.id,
            role: 'admin'
          });
        } else {
          console.log('[LOGIN] ❌ Password mismatch');
          return res.status(401).json({ error: "Invalid credentials" });
        }
      }
    }
    
    console.log('[LOGIN] ❌ Admin not found');
    return res.status(401).json({ error: "Invalid credentials" });

  } catch (error) {
    console.error('[LOGIN] Error:', error);
    return res.status(500).json({ error: "Login failed" });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`\n🔍 Debug server running on port ${PORT}`);
  console.log(`Test with: curl -X POST http://localhost:${PORT}/login -H "Content-Type: application/json" -d '{"email":"admin@gmail.com","password":"admin1"}'\n`);
});
