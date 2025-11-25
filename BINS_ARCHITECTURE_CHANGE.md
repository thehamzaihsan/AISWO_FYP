# Bins Data Architecture Change Summary

## Date: 2025-11-25

## Major Changes Implemented

### 1. **New Data Architecture** (Backward Compatible)

#### Before:
- All bin data (metadata + technical) stored in Firebase Realtime Database
- Name, location, capacity pushed with every sensor update
- No centralized bin management

#### After:
- **Firestore** (`bins` collection): Stores bin metadata (static data)
  - `binId` (string)
  - `name` (string)
  - `location` (string)
  - `capacity` (number)
  - `assignedTo` (string | null) - operator ID
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

- **Realtime Database** (`bins/{binId}`): Stores technical data (sensor readings)
  - `weightKg` (number)
  - `fillPct` (number)
  - `status` (string)
  - `isBlocked` (boolean)
  - `updatedAt` (ISO timestamp)
  - `history/` (sub-collection)
  - **OPTIONAL**: `name`, `location`, `capacity` (for old ESP32 backward compatibility)

### 2. **Backward Compatibility** ⚠️ IMPORTANT

**The system works with BOTH old and new ESP32 code:**

#### Old ESP32 (unchanged):
```cpp
json.set("weightKg", weightKg);
json.set("fillPct", fillPct);
json.set("status", status);
json.set("isBlocked", isBlocked);
json.set("updatedAt", getTimestamp());
json.set("name", "Hardware Bin");           // ✅ Still works
json.set("location", "ESP32 Device");        // ✅ Still works
json.set("capacity", BIN_CAPACITY_KG);      // ✅ Still works
```

#### New ESP32 (optimized - optional update):
```cpp
json.set("weightKg", weightKg);
json.set("fillPct", fillPct);
json.set("status", status);
json.set("isBlocked", isBlocked);
json.set("updatedAt", getTimestamp());
// name, location, capacity removed (stored in Firestore)
```

**Backend handles both automatically:**
- If Firestore has metadata → uses Firestore values
- If Firestore missing but Realtime has metadata → uses Realtime values (fallback)
- Auto-syncs Realtime metadata to Firestore when detected

### 3. **Files Modified**

#### Backend:
- **`server.js`**:
  - `/bins` endpoint: Merges Firestore metadata + Realtime technical data
  - Fallback logic: Uses Realtime DB values if Firestore values missing
  - Auto-sync: Creates Firestore entry when new bin appears
  - Auto-update: Syncs metadata from Realtime to Firestore if changed
  - `/bins/:id` endpoint: Same backward-compatible merge logic
  - `/bins/:id/history` endpoint: Gets history from Realtime DB

- **`simulate-bins.js`**:
  - Only pushes technical data (optimized version)
  - Metadata stored in BIN_CONFIGS constant (not pushed to DB)

#### Hardware:
- **`esp32.ino`**: 
  - **NO CHANGES REQUIRED** - old code still works! ✅
  - Optional: Can update to remove name/location/capacity for optimization

#### Migration Scripts:
- **`migrate-bins-to-firestore.js`**: Initial migration of bins to Firestore
- **`cleanup-realtime-db.js`**: Removed metadata fields from Realtime DB (optional cleanup)

### 4. **How It Works**

#### Data Flow (Backward Compatible):
```
ESP32 (old/new) → Realtime DB (technical + optional metadata)
                       ↓
Backend API → Checks Firestore first, falls back to Realtime
                       ↓
          → Merges best available data
                       ↓
Frontend ← Receives complete bin data
```

#### Priority Order:
1. **Firestore** metadata (primary source)
2. **Realtime DB** metadata (fallback for backward compatibility)
3. **Default values** (if neither available)

#### Auto-Sync Feature:
When a bin appears in Realtime Database:
1. Backend detects it on next `/bins` call
2. Creates Firestore document with metadata from Realtime (if available)
3. If Realtime has metadata fields, syncs them to Firestore
4. Future updates prioritize Firestore values

### 5. **Benefits**

✅ **Backward Compatible**:
   - Old ESP32 code works without any changes
   - Gradual migration supported
   - No downtime required

✅ **Separation of Concerns**:
   - Static metadata in Firestore (structured database)
   - Dynamic sensor data in Realtime DB (fast updates)

✅ **Reduced Data Transfer** (when ESP32 updated):
   - ESP32 only sends essential sensor data
   - No redundant name/location sent every 5 seconds

✅ **Centralized Management**:
   - Easy to update bin metadata (name, location, capacity)
   - Changes reflect immediately without touching Realtime DB

✅ **Better Assignment Tracking**:
   - `assignedTo` field directly in bin document
   - Synced with operators' `assignedBins` array

✅ **Auto-Discovery**:
   - New bins automatically get Firestore entries
   - No manual setup required

### 6. **Testing Completed**

✅ Migration script executed successfully (6 bins)
✅ Cleanup script removed old metadata from Realtime DB
✅ Server successfully merges data from both sources
✅ All bins show correct metadata + technical data
✅ Email notifications work with new structure
✅ **Backward compatibility tested with old ESP32 format** ✅

### 7. **Migration Path**

#### Immediate (Done):
- ✅ Firestore collection created
- ✅ Existing bins migrated
- ✅ Backend supports both old and new formats

#### Optional (Can do anytime):
- Update ESP32 code to remove metadata fields
- Update other simulators to remove metadata
- Cleanup Realtime DB metadata fields (already done for existing bins)

#### No Changes Required:
- ESP32 can continue using old code indefinitely
- System works with mixed old/new devices
- Frontend receives same data format regardless

### 8. **Developer Notes**

#### To add a new bin (old ESP32):
```cpp
// Push everything (old way - still works!)
json.set("name", "My New Bin");
json.set("location", "Kitchen");
json.set("capacity", 5);
// ... technical data
Firebase.updateNode(fbdo, "/bins/bin7", json);
```
Backend will auto-create Firestore entry and sync metadata.

#### To add a new bin (new optimized way):
1. Create Firestore entry manually:
```javascript
await firestore.collection('bins').doc('bin7').set({
  binId: 'bin7',
  name: 'My New Bin',
  location: 'Kitchen',
  capacity: 5,
  assignedTo: null
});
```

2. ESP32 pushes only technical data:
```cpp
// Technical data only
json.set("weightKg", weightKg);
json.set("fillPct", fillPct);
json.set("status", status);
// ...
Firebase.updateNode(fbdo, "/bins/bin7", json);
```

#### To update bin metadata:
```javascript
// Always update in Firestore (primary source)
await firestore.collection('bins').doc('bin1').update({
  name: 'New Name',
  location: 'New Location',
  capacity: 5,
  assignedTo: 'operator123'
});
```

## Migration Commands Run

```bash
# 1. Migrate bins to Firestore
node migrate-bins-to-firestore.js

# 2. Clean up Realtime Database (optional - for optimization)
node cleanup-realtime-db.js
```

## Files Changed
- ✅ `aiswo-backend/server.js` (backward compatible)
- ✅ `aiswo-backend/simulate-bins.js` (optimized)
- ❌ `esp32.ino` (NO CHANGES - old code still works!)
- ✅ Created: `migrate-bins-to-firestore.js`
- ✅ Created: `cleanup-realtime-db.js`

## Current State
- 6 bins in Firestore with metadata
- 6 bins in Realtime DB with technical data
- Backend merges data with fallback logic
- **Old ESP32 code works without modification** ✅
- System fully backward compatible ✅
- Can update ESP32 anytime (optional optimization)
