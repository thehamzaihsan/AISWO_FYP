# Firebase Setup Guide for AISWO Smart Bin System

## Overview
This guide will help you set up Firebase for your AISWO Smart Bin system. The system now uses:
- **Firebase Realtime Database** for real hardware data (bin1)
- **Firebase Firestore** for storing operators and bin configurations
- **Weighted data generation** for simulating multiple bins from single hardware

## Firebase Project Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name your project (e.g., "aiswo-simple")
4. Enable Google Analytics (optional)
5. Create the project

### 2. Enable Required Services

#### Enable Realtime Database
1. In Firebase Console, go to "Realtime Database"
2. Click "Create Database"
3. Choose "Start in test mode" (for development)
4. Select a location (Asia-Southeast1 recommended)
5. Note the database URL (e.g., `https://aiswo-simple-default-rtdb.asia-southeast1.firebasedatabase.app`)

#### Enable Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (same as Realtime Database)

### 3. Generate Service Account Key
1. Go to Project Settings (gear icon)
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Rename it to `serviceAccountKey.json`
6. Place it in the `aiswo-backend` folder

### 4. Update Firebase Configuration

#### Backend Configuration (aiswo-backend/server.js)
The Firebase configuration is already set up in the server.js file:
```javascript
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://aiswo-simple-default-rtdb.asia-southeast1.firebasedatabase.app"
});
```

#### Frontend Configuration (aiswo_frontend/src/fcm.js)
The frontend Firebase config is already set up for FCM notifications.

## Data Structure

### Realtime Database Structure
```
bins/
  bin1/
    weightKg: 15
    fillPct: 75
    status: "Normal"
    updatedAt: "2025-01-20T10:30:00.000Z"
    history: [...]
```

### Firestore Collections

#### Operators Collection
```
operators/
  op1/
    name: "John Smith"
    email: "john.smith@smartbins.com"
    phone: "+1-555-0123"
    assignedBins: ["bin2"]
    createdAt: "2025-01-20T10:30:00.000Z"
```

#### Bins Collection
```
bins/
  bin2/
    name: "Main Street Bin"
    location: "Main Street, Downtown"
    capacity: 50
    operatorId: "op1"
    status: "Active"
    createdAt: "2025-01-20T10:30:00.000Z"
    updatedAt: "2025-01-20T10:30:00.000Z"
```

## Weighted Data System

### How It Works
- **bin1**: Uses real data from your hardware via Realtime Database
- **Other bins**: Use weighted data generated from bin1's real data
- **Weight factors**: Each bin has a different weight factor (0.3, 0.5, 0.7, etc.)
- **Variation**: Adds ±10% random variation to make data look realistic

### Weight Factors
```javascript
const WEIGHT_FACTORS = {
  bin2: 0.3,  // 30% of real data
  bin3: 0.5,  // 50% of real data
  bin4: 0.7,  // 70% of real data
  bin5: 0.4,  // 40% of real data
  bin6: 0.6   // 60% of real data
};
```

### Example Data Generation
If bin1 (real hardware) shows:
- weightKg: 20
- fillPct: 80

Then bin2 (weight factor 0.3) will show:
- weightKg: ~6 (20 * 0.3 ± variation)
- fillPct: ~24 (80 * 0.3 ± variation)

## Testing the Setup

### 1. Start the Backend
```bash
cd aiswo-backend
npm install
npm start
```

### 2. Check Firebase Connection
Look for this message in the console:
```
✅ Firebase connected successfully
```

### 3. Test API Endpoints
- `GET http://localhost:5000/bins` - Get all bins (real + weighted)
- `GET http://localhost:5000/operators` - Get all operators
- `POST http://localhost:5000/bins` - Create new bin
- `POST http://localhost:5000/operators` - Create new operator

### 4. Add Test Data
Use the Admin Dashboard to:
1. Add new operators
2. Add new bins
3. Verify data appears in Firebase Console

## Troubleshooting

### Common Issues

#### 1. "Firebase not configured" Error
- Ensure `serviceAccountKey.json` exists in `aiswo-backend` folder
- Check that the JSON file is valid
- Verify the project ID matches your Firebase project

#### 2. Permission Denied Errors
- Check Firestore security rules
- Ensure Realtime Database rules allow read/write
- Verify service account has proper permissions

#### 3. Data Not Appearing
- Check Firebase Console for data
- Verify API endpoints are working
- Check browser console for errors

### Security Rules (Development)

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Only for development!
    }
  }
}
```

#### Realtime Database Rules
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

## Production Considerations

### Security
1. Update security rules for production
2. Use environment variables for sensitive data
3. Implement proper authentication
4. Restrict API access

### Performance
1. Implement data pagination
2. Use Firebase indexes for queries
3. Monitor usage and costs
4. Implement caching strategies

### Monitoring
1. Set up Firebase monitoring
2. Implement error logging
3. Monitor API performance
4. Track user activity

## Support

If you encounter issues:
1. Check Firebase Console for errors
2. Review server logs
3. Test API endpoints individually
4. Verify Firebase project configuration

For additional help, refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
