# 🚀 Vercel Deployment Guide - Firebase Credentials

## The Problem
`serviceAccountKey.json` is NOT in your Git repository (for security), but Vercel needs it to connect to Firebase.

---

## ✅ Solution: Two Methods

### **Method 1: Environment Variables (RECOMMENDED)**

Instead of uploading the entire JSON file, convert it to environment variables.

#### Step 1: Convert serviceAccountKey.json to Environment Variables

```bash
# From your serviceAccountKey.json, extract these values:
FIREBASE_PROJECT_ID="aiswo-simple-697dd"
FIREBASE_PRIVATE_KEY_ID="572455aa4e0deb4b4661f48c4d87840745686095"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgk..."
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-ayvny@aiswo-simple-697dd.iam.gserviceaccount.com"
FIREBASE_CLIENT_ID="109838882885395695871"
FIREBASE_DATABASE_URL="https://aiswo-simple-697dd-default-rtdb.asia-southeast1.firebasedatabase.app"
```

#### Step 2: Add to Vercel Environment Variables

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click on your project (AISWO_FYP)
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY_ID`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_CLIENT_ID`
   - `FIREBASE_DATABASE_URL`

#### Step 3: Update `server.js` to Use Environment Variables

```javascript
// aiswo-backend/server.js

let db = null;
let firestore = null;

try {
  // Option A: If serviceAccountKey.json exists locally (development)
  if (fs.existsSync('./serviceAccountKey.json')) {
    const serviceAccount = require("./serviceAccountKey.json");
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  } 
  // Option B: Use environment variables (production/Vercel)
  else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  }
  
  db = admin.database();
  firestore = admin.firestore();
  console.log("✅ Firebase connected successfully");
} catch (error) {
  console.log("⚠️ Firebase not configured - running in demo mode");
  console.log("Error:", error.message);
}
```

---

### **Method 2: Base64 Encoding (Alternative)**

This method stores the entire JSON file as a single environment variable.

#### Step 1: Encode serviceAccountKey.json to Base64

```bash
# On Linux/Mac
base64 -w 0 aiswo-backend/serviceAccountKey.json > firebase_key_base64.txt

# Copy the output and add to Vercel as FIREBASE_SERVICE_ACCOUNT_KEY_BASE64
```

#### Step 2: Add to Vercel

1. Go to Vercel → Settings → Environment Variables
2. Add variable:
   - Name: `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64`
   - Value: (paste the base64 string)

#### Step 3: Update server.js

```javascript
// aiswo-backend/server.js
const fs = require('fs');

let db = null;
let firestore = null;

try {
  let serviceAccount;
  
  // Development: Use local file
  if (fs.existsSync('./serviceAccountKey.json')) {
    serviceAccount = require("./serviceAccountKey.json");
  } 
  // Production: Decode from environment variable
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64) {
    const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
    const decodedKey = Buffer.from(base64Key, 'base64').toString('utf-8');
    serviceAccount = JSON.parse(decodedKey);
  }
  
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    
    db = admin.database();
    firestore = admin.firestore();
    console.log("✅ Firebase connected successfully");
  }
} catch (error) {
  console.log("⚠️ Firebase not configured");
  console.log("Error:", error.message);
}
```

---

## 🎯 Recommended Approach

**Use Method 1 (Individual Environment Variables)**

**Pros:**
- ✅ More secure (no full JSON file anywhere)
- ✅ Easier to manage individual values
- ✅ Better for debugging
- ✅ Industry best practice

**Cons:**
- More setup initially

---

## 📋 Step-by-Step: Setting Up Vercel

### 1. Add Environment Variables to Vercel

```
FIREBASE_PROJECT_ID=aiswo-simple-697dd
FIREBASE_PRIVATE_KEY_ID=572455aa4e0deb4b4661f48c4d87840745686095
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDC6Y+mdq5yZOX2\nqb/Gt9+J9uLzAwi2GiYRWaLyq7otqMrxoxaPiFKggJs1E5rZM4vAKQy4kFHk0u3a\nwQr6eCYBoFf3QV/bxPMwF5l1kaJUHBT5EQ4XMx+gamG3Y0U4+YPwloGrXc03mKg8\n3ZS2Y2h842PM8j8OwxkGYWS9nysSSYN+v5mx0f3AO/9spVdJ72qTzE1wdUzHCmj+\ngwe7Hm26SU6sCwBT5p76BQX51HKPsoSloz+28OAUDdOqxNvGSQv6q+bD22kqfHKy\n6PwlCBqd73NsvA4xS51ijYtmI/mdvVlD+eO0+AxI56LUuxEjrLJ6Crg2kv9oDIJm\nS1np95tfAgMBAAECggEAIZjBvpdJdYVn0C8tU9MA8JaCQxIcT8tNEYOKX1rzcghc\nxu7uJhqA55KTbkAtWlAUwDAzNaMGwrMK9cB9pHPOVUxurTtzCv41Tu5acNYEDYxz\nnwTuEViqFGwR4Nr3JR15PSCsRD4cb/9bzHYDOrcC3TgSzVJaRTCi4SMrirXjZjjB\nnTFfjQJTkKHywyjZA4WZJFTQ+zrR1O0HqNu8wOyU+loNLDP/GjNGPE5cO9yRT0zy\nUXyYrFDvwh0DB7RXs0wq98ousPmzgaFS2cyhqNmV99ThOY8+nhJe95Fm1c3gut6V\nXjhlLi1c0nygxouHPVs9zoE4t5KqWYp9NjujiRR+hQKBgQDqc6duid8vp113sMdb\nTGGm3aIz8DhP/d3n9MD27NebzRA+FxMmWc6ha4V0BmyD2eW6TakyMGb6ARt/u/Zl\n0Lb4//h49RvYqYc58IwbpgQ4MFRhoOJUx1Xl1ybTIFezBZkttO8iS/ylKxxFAzrj\nTFKB2ekw/O9ZWn1cjR34r7E2JQKBgQDU05iCNt/EdJfLI6InLPW7yBF7UeYw5xFo\n6sUwwV/aMDvCz9cE0JR2Wp+C2luW1JGpsHwVRyO51j2Yl+x3nynvzxt7PhatWyxN\nRtsdrB47qURAJCc5Ul57Y9NC2G1Gv1EL8ERRpr78eRPeA0Jiji1wuvwTDbwI2qck\nHBQbD7zqMwKBgFAv9FEjSLmUxawdQ2IfkrquzT50Z948Fvyxwpnx0aCRF4AVBlC0\noK6nBsLzO4QxL5hz3W20DlRtsokSsaiLJTmu2r4MH1UQTpbrhhAizQimxwWJMEAM\n2X0+BCJrynMJdCWk37FcSfH397hG7Yo2XXXaIR7HM9nc0EmqXljjRnodAoGAW1V3\nRKKCA1A5+E6Rfxh3WJ/yiKbMD76KJSljeJn0JbG/Y8pIL2PH4sbfX4uP9LnCzTzU\n81i1R0Je6saAD5H5sFWEKK6rkrfm2j8HN8OusdHhXVlmj93+eBuOBUjWFJ90C5iP\n6S6TFcxsL0Hc0mjLrW5BUXf6cx5Kzl9SbY6idysCgYEAgcM+wK83w+iIRo26OK2v\nQqsrVLOZjRQkGfQy79HIpT62kV2m72R3WgjjMyhq6EAoWZdulZC/3NKVhHs0NCCL\nPQW9YXWy4CqP7K0ku37QK4Yh30RpYzm9obQiztXugIgSw5M9WsIQHzPfaEcxckQp\nkx1XPFotC7trYDPwAo1z7QQ=\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-ayvny@aiswo-simple-697dd.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=109838882885395695871
FIREBASE_DATABASE_URL=https://aiswo-simple-697dd-default-rtdb.asia-southeast1.firebasedatabase.app

# Also add your other environment variables
MISTRAL_API_KEY=your_mistral_api_key
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PORT=5000
```

### 2. Important: Private Key Formatting

When adding `FIREBASE_PRIVATE_KEY` to Vercel:
- Keep the `\n` characters as literal `\n` (not actual newlines)
- The value should be ONE LINE with `\n` as text
- Example: `-----BEGIN PRIVATE KEY-----\nMIIEvQIBAD...\n-----END PRIVATE KEY-----\n`

### 3. Set Environment for All Environments

Make sure to set for:
- ✅ Production
- ✅ Preview
- ✅ Development

---

## 🔧 Implementation Code

Create this file: `aiswo-backend/config/firebase.js`

```javascript
const admin = require("firebase-admin");
const fs = require('fs');

let db = null;
let firestore = null;

function initializeFirebase() {
  try {
    let serviceAccount;
    
    // Development: Use local serviceAccountKey.json
    if (fs.existsSync('./serviceAccountKey.json')) {
      serviceAccount = require("../serviceAccountKey.json");
      console.log('📝 Using local serviceAccountKey.json');
    } 
    // Production: Use environment variables
    else if (process.env.FIREBASE_PROJECT_ID) {
      serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
        universe_domain: "googleapis.com"
      };
      console.log('🌐 Using environment variables for Firebase');
    } else {
      throw new Error('No Firebase credentials found');
    }
    
    const databaseURL = process.env.FIREBASE_DATABASE_URL || 
                       `https://${serviceAccount.project_id}-default-rtdb.asia-southeast1.firebasedatabase.app`;
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: databaseURL
    });
    
    db = admin.database();
    firestore = admin.firestore();
    
    console.log("✅ Firebase connected successfully");
    console.log(`📊 Project: ${serviceAccount.project_id}`);
    console.log(`🔗 Database: ${databaseURL}`);
    
  } catch (error) {
    console.log("⚠️ Firebase not configured - running in demo mode");
    console.log("Error:", error.message);
  }
  
  return { db, firestore };
}

module.exports = { initializeFirebase, db, firestore };
```

Then in `server.js`:

```javascript
const { initializeFirebase } = require('./config/firebase');

// Initialize Firebase
const { db, firestore } = initializeFirebase();

// Rest of your server code...
```

---

## ✅ Checklist for Vercel Deployment

- [ ] Add all Firebase environment variables to Vercel
- [ ] Update server.js to use environment variables
- [ ] Test locally with environment variables
- [ ] Deploy to Vercel
- [ ] Check Vercel logs for "✅ Firebase connected successfully"
- [ ] Test API endpoints

---

## 🧪 Testing Locally with Environment Variables

Before deploying to Vercel, test locally:

```bash
# Create .env.production file
cp .env .env.production

# Add the Firebase environment variables to .env.production
# Then test:
NODE_ENV=production node server.js
```

---

## 📞 Troubleshooting

### Error: "Firebase not configured"
- ✅ Check all environment variables are set in Vercel
- ✅ Verify `FIREBASE_PRIVATE_KEY` has `\n` as literal text
- ✅ Check Vercel deployment logs

### Error: "Invalid private key"
- ✅ Make sure private key includes `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- ✅ Verify the `\n` characters are escaped properly
- ✅ Try the Base64 method instead

### Connection works locally but not on Vercel
- ✅ Verify environment variables are set for Production environment
- ✅ Check Vercel function logs for specific error
- ✅ Ensure Firebase allows requests from Vercel's IP ranges

---

**Last Updated:** 2025-11-25  
**Status:** Ready for Vercel Deployment  
**Method:** Environment Variables (Recommended)
