# 🔧 Login Troubleshooting Guide

## Problem: "Invalid credentials" error

### Quick Diagnosis

Run these tools to find the issue:

```bash
cd aiswo-backend

# 1. Check what users exist
node check-admin.js

# 2. Verify your password
node verify-password.js

# 3. Test login
node test-login.js
```

---

## Common Issues

### Issue 1: Wrong Password

**Symptom:** You created an admin but login says "Invalid credentials"

**Solution:**
```bash
# Verify your password
node verify-password.js
# Email: admin@gmail.com
# Password: <the password you think you used>
```

If it says "PASSWORD DOES NOT MATCH", you're using the wrong password.

**Fix:** Create a new admin with a password you'll remember:
```bash
node create-admin.js
# Use a different email or delete the old one first
```

---

### Issue 2: Admin Not Created

**Symptom:** Login fails, no admin in database

**Check:**
```bash
node check-admin.js
```

If it says "No admins found", create one:
```bash
node create-admin.js
```

---

### Issue 3: Firebase Connection Error

**Symptom:** "UNAUTHENTICATED" error when creating admin

**Fix:** Download fresh Firebase key

See: `FIREBASE_REGENERATE_KEY.md`

---

### Issue 4: Operator Has No Password

**Symptom:** Operator login fails with "Account setup incomplete"

**Why:** Old operators created before password feature was added

**Fix:** Update operator to add password:

```bash
cd aiswo-backend
node update-operator-password.js
```

(Create this script if needed)

---

## Step-by-Step: Fix Admin Login

### Step 1: Check Current State

```bash
node check-admin.js
```

Output should show:
```
📧 Email: admin@gmail.com
🔐 Has Password: Yes ✓
```

### Step 2: Verify Password

```bash
node verify-password.js
```

Enter your email and password. It will tell you if they match.

### Step 3: Test Login

#### Option A: Use Test Script
```bash
node test-login.js
# Email: admin@gmail.com
# Password: your_password
```

#### Option B: Use curl
```bash
# Make sure server is running first
npm start

# In another terminal:
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"your_password"}'
```

### Step 4: Expected Response

✅ **Success:**
```json
{
  "email": "admin@gmail.com",
  "name": "Charagh",
  "userId": "admin_gmail_com",
  "role": "admin",
  "isActive": true
}
```

❌ **Failure:**
```json
{
  "error": "Invalid credentials"
}
```

---

## Nuclear Option: Start Fresh

If nothing works, delete and recreate:

### 1. Delete Admin from Firebase Console

1. Go to: https://console.firebase.google.com/
2. Select project: aiswo-simple-697dd
3. Go to Firestore Database
4. Find collection: `admins`
5. Delete document: `admin_gmail_com`

### 2. Create New Admin

```bash
node create-admin.js
# Email: newadmin@gmail.com
# Password: SecurePass123
# Name: Admin
```

### 3. Remember Your Password!

Write it down somewhere safe (NOT in code or Git).

### 4. Test

```bash
node test-login.js
# Email: newadmin@gmail.com
# Password: SecurePass123
```

---

## Debugging Tools Reference

```bash
# Check all users in database
node check-admin.js

# Verify a password hash
node verify-password.js

# Test login endpoint
node test-login.js

# Check Firebase connection
node test-firebase.js

# Create new admin
node create-admin.js
```

---

## Still Not Working?

Check these:

1. **Is server running?**
   ```bash
   ps aux | grep "node server.js"
   ```

2. **Check server logs:**
   ```bash
   npm start
   # Look for errors
   ```

3. **Is Firestore working?**
   ```bash
   node test-firebase.js
   ```

4. **Check browser console** (if using frontend):
   - F12 → Console tab
   - Look for errors

5. **Check network tab**:
   - F12 → Network tab
   - Filter by "login"
   - Check request/response

---

## Contact Info

If you've tried everything and it still doesn't work:

1. Check what `node check-admin.js` shows
2. Run `node verify-password.js` 
3. Share the output (WITHOUT passwords!)

---

**Last Updated:** 2025-11-25  
**Status:** Troubleshooting Tools Available
