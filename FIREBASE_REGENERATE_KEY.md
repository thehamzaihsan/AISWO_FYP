# 🔥 Firebase Service Account Key - URGENT FIX NEEDED

## Problem
Your `serviceAccountKey.json` is **INVALID** or **CORRUPT**. 

Error: `UNAUTHENTICATED: Request had invalid authentication credentials`

This means Firebase doesn't recognize the credentials in the file.

---

## ✅ Solution: Download Fresh Service Account Key

### Step 1: Go to Firebase Console

1. Visit: https://console.firebase.google.com/
2. Select your project: **aiswo-simple-697dd**

### Step 2: Navigate to Service Accounts

1. Click the **⚙️ Settings** icon (top left)
2. Select **Project settings**
3. Go to the **Service accounts** tab

### Step 3: Generate New Private Key

1. Scroll down to **Firebase Admin SDK**
2. Click **Generate new private key**
3. Click **Generate key** in the confirmation dialog
4. A JSON file will download (e.g., `aiswo-simple-697dd-firebase-adminsdk-xxxxx.json`)

### Step 4: Replace serviceAccountKey.json

```bash
cd ~/Desktop/AISWO_FYP/aiswo-backend

# Backup the old (corrupt) key
mv serviceAccountKey.json serviceAccountKey.json.backup

# Copy the downloaded file
cp ~/Downloads/aiswo-simple-697dd-firebase-adminsdk-*.json serviceAccountKey.json

# Verify it's valid JSON
cat serviceAccountKey.json | jq .project_id
```

Should output: `"aiswo-simple-697dd"`

### Step 5: Test the Connection

```bash
# Test Firebase connection
node test-firebase.js
```

You should see:
```
✅ Successfully connected to Firestore
Found X operators
```

### Step 6: Restart Your Server

```bash
npm start
# or
node server.js
```

---

## ⚠️ Important Notes

1. **Never commit** the new `serviceAccountKey.json` to Git (it's already in `.gitignore`)
2. **Delete the downloaded file** from Downloads folder after copying
3. **Regenerate Firebase environment variables** for Vercel:
   ```bash
   node extract-firebase-env.js
   ```
4. **Update Vercel** with the new environment variables

---

## 🔍 Why This Happened

When we removed `serviceAccountKey.json` from Git history, we had to recreate it from memory. However, the Firebase private key we used might have been:
- Incomplete
- Corrupted during the process
- Outdated/revoked

---

## �� Security Notice

If you suspect the old key was compromised:

1. Go to Firebase Console → Service accounts
2. Delete the old service account key
3. Generate a completely new one
4. Update everywhere (local + Vercel)

---

## Quick Commands

```bash
# After downloading new key from Firebase Console:
cd ~/Desktop/AISWO_FYP/aiswo-backend
mv serviceAccountKey.json serviceAccountKey.json.old
cp ~/Downloads/aiswo-simple-*.json serviceAccountKey.json

# Test
node test-firebase.js

# If successful, update Vercel variables
node extract-firebase-env.js
```

---

**Next Steps:**
1. Download new key from Firebase Console (takes 2 minutes)
2. Replace serviceAccountKey.json
3. Test with `node test-firebase.js`
4. Restart your server

**Status:** ⚠️ NEEDS IMMEDIATE ACTION
**Priority:** 🔴 HIGH - Backend won't work until fixed
