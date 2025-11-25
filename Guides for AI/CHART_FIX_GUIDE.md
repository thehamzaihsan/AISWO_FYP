# 📊 Fill Data Chart Fix Guide

## Issue
Chart on `/bins/bin1` page is not showing historical data.

## Root Cause
The history data format changed:
- **Old format:** `{ ts: "...", weightKg: ..., fillPct: ... }`
- **New format:** `{ timestamp: "...", weightKg: ..., fillPct: ... }`

ESP32 now sends ISO timestamps like `"2025-11-23T14:12:21Z"` instead of `ts`.

## ✅ Fix Applied

### Changes Made to `BinDashboard.js`:

1. **Added timestamp formatter:**
```javascript
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  if (timestamp.includes('T')) {
    // ISO format
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else {
    // Millis format
    const mins = Math.floor(parseInt(timestamp) / 60000);
    return `${mins}m ago`;
  }
};
```

2. **Updated chart labels:**
```javascript
// OLD:
labels: history.slice(-20).map(h => h.ts)

// NEW:
labels: history.slice(-20).map(h => formatTimestamp(h.timestamp || h.ts))
```

3. **Added fallback for missing data:**
```javascript
// OLD:
data: history.slice(-20).map(h => h.weightKg)

// NEW:
data: history.slice(-20).map(h => h.weightKg || 0)
```

4. **Added debug logging:**
```javascript
console.log('History data:', data);
console.log('History array length:', historyArray.length);
console.log('Sample history item:', historyArray[0]);
```

5. **Added "No Data" message:**
```javascript
{history.length > 0 ? (
  <Line data={chartData} options={chartOptions} />
) : (
  <div>No historical data available yet...</div>
)}
```

---

## 🔍 Debugging Steps

### 1. Check Browser Console
Open DevTools (F12) and go to Console tab. You should see:
```
History data: {...}
History type: object
History array length: 50
Sample history item: {fillPct: 0, timestamp: "2025-11-23T14:12:21Z", weightKg: 0, distance: 172}
```

### 2. Verify History Endpoint
```bash
curl http://localhost:5000/bins/bin1/history | python3 -m json.tool | head -30
```

Expected format:
```json
{
  "-Oelxxx...": {
    "fillPct": 0,
    "timestamp": "2025-11-23T14:12:21Z",
    "weightKg": 0,
    "distance": 172
  },
  ...
}
```

### 3. Check if Data Exists
```bash
curl -s http://localhost:5000/bins/bin1/history | python3 -c "
import json, sys
data = json.load(sys.stdin)
print(f'Total history entries: {len(data)}')
print(f'Sample entry: {list(data.values())[0] if data else \"No data\"}')
"
```

### 4. Test Chart Data Locally
Open browser console on `/bins/bin1` page and run:
```javascript
// Check if history is loaded
console.log('History state:', history);
console.log('Chart data:', chartData);
```

---

## 🎯 Expected Result

After the fix, you should see:

1. **Chart displays with:**
   - X-axis: Time labels (e.g., "02:15 PM", "02:16 PM")
   - Y-axis: Values (weight in kg, fill in %)
   - Two lines: Green for weight, lighter green for fill %

2. **Console shows:**
   - History array with 50+ items
   - Each item has `timestamp`, `weightKg`, `fillPct`, `distance`

3. **If no data:**
   - Message: "No historical data available yet"
   - Explanation: "ESP32 sends data every 5 seconds"

---

## 📊 Sample Working Data

Your ESP32 should be creating entries like:
```json
{
  "fillPct": 0,
  "timestamp": "2025-11-23T14:20:00Z",
  "weightKg": 0.00026,
  "distance": 172
}
```

Chart will show:
- Time: "02:20 PM"
- Weight: 0.00026 kg
- Fill: 0%

---

## 🔧 If Chart Still Not Showing

### Problem 1: No History Data
**Check:** Is ESP32 running and sending data?
```bash
# Monitor ESP32
arduino-cli monitor -p /dev/ttyUSB0 -c baudrate=115200

# Should see:
📤 Sending to Firebase... ✅ Success!
📊 History updated
```

**Solution:** Make sure ESP32 is powered on and connected.

### Problem 2: History Empty in Firebase
**Check:** Firebase Console → Realtime Database → /bins/bin1/history

**Solution:** Wait 5-10 seconds for data to accumulate.

### Problem 3: Frontend Not Updating
**Check:** Is React app running?
```bash
lsof -ti:3000
```

**Solution:** 
```bash
cd aiswo_frontend
npm start
```
Refresh browser (Ctrl+R).

### Problem 4: CORS Error
**Check:** Browser console for CORS errors

**Solution:** Backend should already have CORS enabled:
```javascript
app.use(cors());
```

---

## 🧪 Quick Test

1. **Visit:** http://localhost:3000/bins/bin1
2. **Open DevTools:** Press F12
3. **Check Console:** Look for "History array length: X"
4. **Wait:** If length is 0, wait 10 seconds and refresh
5. **Verify:** Chart should appear with data points

---

## 📝 Manual Verification

### Check History Exists:
```bash
curl http://localhost:5000/bins/bin1/history | python3 -c "
import json, sys
data = json.load(sys.stdin)
count = len(data)
print(f'✅ History entries: {count}')
if count > 0:
    sample = list(data.values())[0]
    print(f'✅ Sample: timestamp={sample.get(\"timestamp\")}, fillPct={sample.get(\"fillPct\")}')
else:
    print('⚠️ No history data yet - wait for ESP32 to send data')
"
```

### Check Current Data:
```bash
curl http://localhost:5000/bins/bin1 | python3 -c "
import json, sys
data = json.load(sys.stdin)
print(f'Name: {data.get(\"name\")}')
print(f'Distance: {data.get(\"distance\")} cm')
print(f'Updated: {data.get(\"updatedAt\")}')
"
```

---

## ✅ Success Indicators

- [ ] Browser console shows: "History array length: 50+" 
- [ ] Chart displays with green lines
- [ ] X-axis shows time labels
- [ ] Y-axis shows values
- [ ] Hovering over chart shows data points
- [ ] Recent History table shows entries

---

## 🔄 If You Need to Clear Old Data

If you want to start fresh:

```bash
# This will clear old history (optional)
# Go to Firebase Console → Realtime Database
# Delete /bins/bin1/history node
# ESP32 will start creating new entries
```

---

## 📞 Need More Help?

1. Check browser console for errors
2. Verify history endpoint returns data
3. Make sure ESP32 is running
4. Try hard refresh (Ctrl+Shift+R)
5. Check Network tab for API calls

Your chart should now be working! 📊✨
