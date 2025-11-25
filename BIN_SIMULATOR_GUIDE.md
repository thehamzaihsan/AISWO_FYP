# 🗑️ ESP32 Bin Data Simulator

Simulates ESP32 devices sending real-time bin data to Firebase, just like the actual hardware does.

---

## 🚀 Quick Start

```bash
cd aiswo-backend
node simulate-bins.js
```

---

## 📊 What It Does

The simulator:

1. **Connects to Firebase Realtime Database**
2. **Simulates 6 bins** (bin1 - bin6) by default
3. **Pushes data every 5 seconds** (configurable)
4. **Generates realistic sensor data:**
   - Fill percentage (0-100%)
   - Temperature (15-35°C)
   - Humidity (30-80%)
   - Methane levels (0-500 PPM)
   - Battery level (60-100%)
   - Distance sensor readings
   - GPS coordinates (Lahore area)

---

## 🎛️ Features

### Realistic Sensor Behavior

- **Gradual fill levels** - Bins fill up slowly over time
- **Temperature fluctuations** - Natural environmental changes
- **Methane spikes** - Simulates decomposition gases
- **Battery drain** - Slowly decreases over time
- **Distance correlation** - Decreases as bin fills

### Real-time Updates

```
🟢 bin1: 45% | Temp: 24.3°C | Methane: 120 PPM | Battery: 87%
🟡 bin2: 67% | Temp: 28.1°C | Methane: 280 PPM | Battery: 92%
🔴 bin3: 89% | Temp: 31.5°C | Methane: 450 PPM | Battery: 78%
```

Status indicators:
- 🟢 Normal (0-60%)
- 🟡 Warning (60-80%)
- 🔴 Critical (80-100%)

---

## ⚙️ Configuration

Edit `simulate-bins.js` to customize:

```javascript
// Number and IDs of bins
const BIN_IDS = ["bin1", "bin2", "bin3", "bin4", "bin5", "bin6"];

// How often to update (milliseconds)
const UPDATE_INTERVAL = 5000; // 5 seconds

// Sensor value ranges
const RANGES = {
  fillPct: { min: 0, max: 100 },
  temperature: { min: 15, max: 35 },
  humidity: { min: 30, max: 80 },
  methane: { min: 0, max: 500 },
  battery: { min: 60, max: 100 },
  distance: { min: 10, max: 400 }
};
```

---

## 📡 Data Format

Each bin sends data in this format (matching ESP32 .ino):

```json
{
  "binId": "bin1",
  "fillPct": 45,
  "temperature": 24.3,
  "humidity": 62.1,
  "methane": 120,
  "battery": 87,
  "distance": 220,
  "timestamp": "2025-11-25T22:40:15.123Z",
  "deviceId": "ESP32_BIN1",
  "latitude": 31.5204,
  "longitude": 74.3587,
  "status": "normal"
}
```

---

## 🎯 Use Cases

### 1. Testing Frontend Dashboard
- View real-time bin status updates
- Test alert thresholds
- Verify map markers

### 2. Development Without Hardware
- No need for physical ESP32 devices
- Test all bin states (normal, warning, critical)
- Rapid iteration

### 3. Demo/Presentation
- Show live data updates
- Demonstrate system capabilities
- Simulate various scenarios

---

## 🛠️ Commands

### Start Simulator
```bash
node simulate-bins.js
```

### Stop Simulator
Press `Ctrl+C` in the terminal

### Run in Background
```bash
node simulate-bins.js &
# Note the PID to stop later
```

### Stop Background Process
```bash
# If you know the PID
kill <PID>

# Or kill all node processes (careful!)
pkill -f "simulate-bins"
```

---

## 📋 Example Output

```
🚀 Starting ESP32 Bin Simulator...

✅ Connected to Firebase Realtime Database
🔗 Database URL: https://aiswo-simple-697dd-default-rtdb.asia-southeast1.firebasedatabase.app

╔══════════════════════════════════════════════════════════════════════╗
║              🗑️  ESP32 Bin Data Simulator Started                   ║
╚══════════════════════════════════════════════════════════════════════╝

📡 Simulating 6 bins: bin1, bin2, bin3, bin4, bin5, bin6
⏱️  Update interval: 5 seconds
�� Database: Firebase Realtime Database

Press Ctrl+C to stop

────────────────────────────────────────────────────────────────────────
🟢 bin1: 23% | Temp: 22.1°C | Methane: 45 PPM | Battery: 95%
🟢 bin2: 41% | Temp: 24.8°C | Methane: 89 PPM | Battery: 88%
🟡 bin3: 68% | Temp: 27.3°C | Methane: 234 PPM | Battery: 82%
🟢 bin4: 35% | Temp: 21.9°C | Methane: 67 PPM | Battery: 91%
🔴 bin5: 87% | Temp: 30.2°C | Methane: 412 PPM | Battery: 76%
🟡 bin6: 72% | Temp: 26.5°C | Methane: 198 PPM | Battery: 84%
────────────────────────────────────────────────────────────────────────
```

---

## 🔄 Integration with Your App

### Frontend Automatically Shows Data

Your dashboard will automatically display the simulated bins because it reads from Firebase Realtime Database.

**No code changes needed!**

Just:
1. Start the simulator: `node simulate-bins.js`
2. Open your dashboard: `http://localhost:3000`
3. Watch bins update in real-time! ✨

---

## 🐛 Troubleshooting

### "serviceAccountKey.json not found"
**Solution:** Make sure you're in the `aiswo-backend` directory:
```bash
cd aiswo-backend
node simulate-bins.js
```

### "Firebase initialization error"
**Solution:** 
1. Check that `serviceAccountKey.json` exists
2. Verify Firebase credentials are valid
3. See `FIREBASE_REGENERATE_KEY.md` if needed

### No data showing in dashboard
**Solution:**
1. Make sure simulator is running
2. Check Firebase console to see if data is being written
3. Verify frontend is reading from correct Firebase database

---

## 🎨 Customization Examples

### Simulate 10 Bins
```javascript
const BIN_IDS = [
  "bin1", "bin2", "bin3", "bin4", "bin5",
  "bin6", "bin7", "bin8", "bin9", "bin10"
];
```

### Update Every 10 Seconds
```javascript
const UPDATE_INTERVAL = 10000; // 10 seconds
```

### Higher Fill Levels for Testing
```javascript
const RANGES = {
  fillPct: { min: 50, max: 100 }, // Start bins more full
  // ... other ranges
};
```

---

## 🔗 Related Files

- **ESP32 Hardware Code:** `esp32/esp32.ino`
- **Backend Server:** `aiswo-backend/server.js`
- **Frontend Dashboard:** `aiswo_frontend/src/BinDashboard.js`
- **Firebase Setup:** `FIREBASE_REGENERATE_KEY.md`

---

## 💡 Tips

1. **Run alongside backend:**
   ```bash
   # Terminal 1
   cd aiswo-backend && npm start
   
   # Terminal 2
   cd aiswo-backend && node simulate-bins.js
   
   # Terminal 3
   cd aiswo_frontend && npm start
   ```

2. **Test specific scenarios:**
   - Set all bins to 90% to test critical alerts
   - Set methane high to test gas warnings
   - Set battery low to test power alerts

3. **Stop and restart** to reset all bin values to random states

---

**Created:** 2025-11-25  
**Version:** 1.0  
**Simulates:** ESP32 devices sending bin data to Firebase
