# Managing Bin Assignments

## Current Assignments

**Operator:** Hamza Ihsan (ID: 113)  
**Email:** hamzaihsan.spam@gmail.com  
**Assigned Bins:** bin2, bin3, bin4, bin5, bin6

**bin1** is not assigned (reserved for real ESP32 hardware)

## How to Assign Bins to Operators

### Method 1: Using Node.js Script

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();

async function assignBins() {
  const operatorId = '113'; // Operator ID
  const bins = ['bin2', 'bin3', 'bin4']; // Bins to assign
  
  // Update operator
  await firestore.collection('operators').doc(operatorId).update({
    assignedBins: bins
  });
  
  // Update each bin
  for (const binId of bins) {
    await firestore.collection('bins').doc(binId).update({
      assignedTo: operatorId
    });
  }
  
  console.log('✅ Bins assigned!');
}

assignBins();
```

### Method 2: Direct Firestore Update

In Firebase Console:
1. Go to Firestore Database
2. Update `operators/{operatorId}`:
   - Set `assignedBins` array: `["bin2", "bin3", "bin4"]`
3. Update each `bins/{binId}`:
   - Set `assignedTo` string: `"113"`

### Method 3: Using REST API (Future)

Create an admin endpoint in server.js:
```javascript
app.post('/admin/assign-bins', async (req, res) => {
  const { operatorId, binIds } = req.body;
  
  // Update operator
  await firestore.collection('operators').doc(operatorId).update({
    assignedBins: binIds
  });
  
  // Update bins
  for (const binId of binIds) {
    await firestore.collection('bins').doc(binId).update({
      assignedTo: operatorId
    });
  }
  
  res.json({ success: true });
});
```

## How Email Notifications Work

When a bin exceeds 80% capacity:
1. Backend checks `bin.assignedTo` field
2. Looks up operator in Firestore
3. Sends email to operator's email address
4. Email includes bin details and urgent action request

Example email:
```
To: hamzaihsan.spam@gmail.com
Subject: 🚨 URGENT: Bin BIN2 is Full - Immediate Action Required

Dear Hamza Ihsan,

Bin BIN2 (Kitchen Bin) is at 90.5% capacity and needs immediate attention.

Bin Details:
- Location: Kitchen
- Current Weight: 4.52 kg
- Fill Level: 90.5%
- Status: NEEDS_EMPTYING

Please empty this bin as soon as possible to prevent overflow.

Best regards,
Smart Bin Monitoring System
```

## Current Setup

✅ All bins have metadata in Firestore
✅ Operator 113 assigned to bins 2-6
✅ Email notifications configured
✅ Backend merges data correctly
✅ Frontend will show assignments

## To Add More Operators

1. Create operator in Firestore:
```javascript
await firestore.collection('operators').doc('newOperatorId').set({
  name: 'Operator Name',
  email: 'operator@email.com',
  phone: '+1234567890',
  assignedBins: ['bin7', 'bin8'],
  createdAt: admin.firestore.FieldValue.serverTimestamp()
});
```

2. Assign bins to new operator:
```javascript
await firestore.collection('bins').doc('bin7').update({
  assignedTo: 'newOperatorId'
});
```

## Troubleshooting

**Bins not showing assignments in frontend?**
- Check Firestore `bins/{binId}` has `assignedTo` field
- Check `operators/{operatorId}` has `assignedBins` array
- Restart backend server to clear cache

**Operator not receiving emails?**
- Verify operator email in Firestore is correct
- Check bin `fillPct` is > 80%
- Check server logs for email sending errors
- Verify Gmail app password is correct in server.js

**Assignment not syncing?**
- Update both places: operator's `assignedBins` AND bin's `assignedTo`
- They must match for the system to work correctly
