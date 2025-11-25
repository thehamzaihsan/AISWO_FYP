# 👨‍💼 Admin User Setup Guide

## Quick Start

### Step 1: Create Admin User

Run the admin creator script:

```bash
cd aiswo-backend
node create-admin.js
```

### Step 2: Enter Admin Details

The script will ask you for:

```
📧 Email: admin@aiswo.com
🔒 Password: (min 6 characters)
👤 Name: (default: Admin)
```

### Step 3: Done!

You'll see:

```
✅ Admin user created successfully!

📋 Admin Details:
   Email:    admin@aiswo.com
   Name:     Admin
   ID:       admin_aiswo_com
   Role:     admin

🎉 You can now login with these credentials!
```

---

## How It Works

### 1. **Admin Storage**

Admins are stored in Firestore:

```
Collection: admins
Document ID: email with @ and . replaced by _
Data:
  - email: string
  - password: bcrypt hashed
  - name: string
  - role: 'admin'
  - createdAt: timestamp
  - isActive: boolean
```

### 2. **Login Endpoint**

The `/login` endpoint now checks **both**:

1. **First** checks `admins` collection
2. **Then** checks `operators` collection

**Request:**
```json
POST /login
{
  "email": "admin@aiswo.com",
  "password": "your_password"
}
```

**Response for Admin:**
```json
{
  "email": "admin@aiswo.com",
  "name": "Admin",
  "userId": "admin_aiswo_com",
  "role": "admin",
  "isActive": true,
  "createdAt": "2025-11-25T22:11:30.482Z"
}
```

**Response for Operator:**
```json
{
  "email": "operator@example.com",
  "name": "John Doe",
  "userId": "operator123",
  "operatorId": "operator123",
  "role": "operator",
  "assignedBins": ["bin1", "bin2"]
}
```

### 3. **Frontend Integration**

In your login component, check the `role` field:

```javascript
const response = await fetch('http://localhost:5000/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const user = await response.json();

if (user.role === 'admin') {
  // Redirect to Admin Dashboard
  navigate('/admin-dashboard');
} else if (user.role === 'operator') {
  // Redirect to Operator Dashboard
  navigate('/operator-dashboard');
}
```

---

## Multiple Admins

You can create multiple admin users:

```bash
# Create first admin
node create-admin.js
# Email: admin@aiswo.com

# Create second admin
node create-admin.js
# Email: superadmin@aiswo.com

# Create third admin
node create-admin.js
# Email: manager@aiswo.com
```

Each admin is stored separately in Firestore.

---

## Security Features

✅ **Password Hashing**: Uses bcrypt with 10 salt rounds  
✅ **Email Validation**: Checks for valid email format  
✅ **Password Strength**: Minimum 6 characters required  
✅ **Role-Based**: Admin role is hardcoded in script  
✅ **Timestamp**: Creation time tracked  

---

## Troubleshooting

### "No Firebase credentials found"

**Solution:** Make sure `serviceAccountKey.json` exists or environment variables are set.

```bash
# Check if file exists
ls -la serviceAccountKey.json

# If missing, regenerate from Firebase Console
# See FIREBASE_REGENERATE_KEY.md
```

### "Error creating admin: UNAUTHENTICATED"

**Solution:** Your Firebase key is invalid. Download fresh key from Firebase Console.

See: `FIREBASE_REGENERATE_KEY.md` for instructions.

### "Collection 'admins' not found"

This is normal! Firestore creates collections automatically when you add the first document.

---

## Testing

### 1. Create Test Admin

```bash
node create-admin.js
# Email: test@admin.com
# Password: test123
# Name: Test Admin
```

### 2. Test Login via API

```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@admin.com","password":"test123"}'
```

Should return:
```json
{
  "email": "test@admin.com",
  "name": "Test Admin",
  "userId": "test_admin_com",
  "role": "admin",
  ...
}
```

---

## Production Deployment

### Local Development

Admins created locally will be in your Firebase project's Firestore.

### Vercel/Production

The same Firestore database is used, so admins created locally are available in production automatically!

No additional setup needed for Vercel.

---

## File Structure

```
aiswo-backend/
├── create-admin.js          ← Admin creator script
├── server.js                ← Updated with admin login
└── serviceAccountKey.json   ← Firebase credentials
```

---

## Commands Reference

```bash
# Create admin user
node create-admin.js

# Test Firebase connection
node test-firebase.js

# Start server
npm start

# Test login
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aiswo.com","password":"yourpassword"}'
```

---

**Last Updated:** 2025-11-25  
**Status:** ✅ Ready to Use  
**Prerequisites:** Valid serviceAccountKey.json
