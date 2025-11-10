# 🔥 Fix Firebase Connection - Quick Guide

You have a Firebase account. Let's connect it to your project in **5 minutes**!

---

## Step 1: Get Service Account Key (Backend)

### A. Go to Firebase Console
1. Open: https://console.firebase.google.com/
2. Select your project (or create one if needed)

### B. Download Service Account Key
1. Click the **⚙️ gear icon** (top left) → **Project settings**
2. Click the **"Service accounts"** tab
3. Click **"Generate new private key"** button
4. Click **"Generate key"** in the popup
5. A JSON file will download (e.g., `aiswo-xxxxx-firebase-adminsdk-xxxxx.json`)

### C. Save the File
1. **Rename** the downloaded file to exactly: `serviceAccountKey.json`
2. **Move** it to: `C:\Users\M Charagh Khan\Desktop\FYP_COMPLEATE\AISWO_FYP\aiswo-backend\`

**Important:** The file MUST be named `serviceAccountKey.json` and placed in the `aiswo-backend` folder.

---

## Step 2: Get Firebase Web Config (Frontend)

### A. Get Configuration
1. Still in Firebase Console, go to **Project Settings** → **General** tab
2. Scroll down to **"Your apps"** section
3. If you see a web app (</> icon), click it to see config
4. If no web app exists:
   - Click **"Add app"** → Choose **"Web"** (</>)
   - Give it a nickname: "AISWO Web"
   - Click **"Register app"**

### B. Copy the Configuration
You'll see something like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### C. Create Frontend .env File
1. Open PowerShell/Terminal
2. Run these commands one by one:

```powershell
cd "C:\Users\M Charagh Khan\Desktop\FYP_COMPLEATE\AISWO_FYP\aiswo_frontend"

@"
REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY_HERE
REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://YOUR_PROJECT.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
REACT_APP_FIREBASE_APP_ID=YOUR_APP_ID
"@ | Out-File -FilePath ".env" -Encoding utf8
```

3. Open `.env` file and **replace** the placeholder values with your actual Firebase config values

---

## Step 3: Enable Firebase Services

### A. Enable Realtime Database
1. In Firebase Console, go to **"Realtime Database"**
2. Click **"Create Database"**
3. Choose location: **Asia-Southeast1** (or closest to you)
4. Start in **"Test mode"** (for now)
5. Click **"Enable"**

### B. Enable Firestore
1. Go to **"Firestore Database"**
2. Click **"Create database"**
3. Choose the **same location** as Realtime Database
4. Start in **"Test mode"**
5. Click **"Enable"**

---

## Step 4: Restart Backend Server

### A. Stop Current Backend
1. Find the terminal/PowerShell window with the backend running
2. Press **Ctrl+C** to stop it

### B. Start Backend Again
```powershell
cd "C:\Users\M Charagh Khan\Desktop\FYP_COMPLEATE\AISWO_FYP\aiswo-backend"
node server.js
```

### C. Check for Success
You should see:
```
✅ Firebase connected successfully
🚀 Backend running on http://localhost:5000
```

**No more Firebase errors!** ✅

---

## Step 5: Restart Frontend (if needed)

If you made changes to frontend `.env`:

1. Press **Ctrl+C** in frontend terminal
2. Restart:
```powershell
cd "C:\Users\M Charagh Khan\Desktop\FYP_COMPLEATE\AISWO_FYP\aiswo_frontend"
npm start
```

---

## ✅ Verification

After restarting, check:

### Backend Terminal Should Show:
```
✅ Firebase connected successfully
🚀 Backend running on http://localhost:5000
```

### No More Errors Like:
```
❌ Error fetching bins: FirebaseAppError: The default Firebase app does not exist
```

### Instead You'll See:
```
🔍 Fetching bins...
✅ Retrieved bins from Firestore
✅ Returning X bins
```

---

## 🚨 Troubleshooting

### Error: "Cannot find module './serviceAccountKey.json'"
**Solution:** Make sure the file is:
- Named exactly: `serviceAccountKey.json`
- Located in: `aiswo-backend` folder
- Is a valid JSON file (open it, should start with `{`)

### Error: "Firebase app named '[DEFAULT]' already exists"
**Solution:** Restart the backend server (Ctrl+C, then run again)

### Frontend still has errors?
**Solution:** 
1. Make sure `.env` file is in `aiswo_frontend` folder
2. All values should start with `REACT_APP_`
3. No quotes around values
4. Restart frontend server

---

## 📁 Final File Structure

```
AISWO_FYP/
├── aiswo-backend/
│   ├── serviceAccountKey.json  ← NEW FILE (from Firebase)
│   ├── server.js
│   └── package.json
└── aiswo_frontend/
    ├── .env  ← NEW FILE (you create this)
    ├── src/
    └── package.json
```

---

## 🎉 Done!

After completing these steps:
- ✅ All Firebase errors will be gone
- ✅ Data will save to real Firestore database
- ✅ Real-time updates will work
- ✅ Push notifications will be enabled
- ✅ System fully functional

---

**Need help?** Look at your terminal output and tell me what error you see!
