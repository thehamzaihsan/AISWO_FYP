# 🚀 ESP32 Quick Start - TL;DR Version

## ⚡ Fast Setup (5 Minutes)

### 1️⃣ Get Firebase Credentials
```
Firebase Console → Realtime Database → Copy URL
Firebase Console → Settings → Copy API Key
```

### 2️⃣ Update esp32.ino
```cpp
#define WIFI_SSID "your_wifi"
#define WIFI_PASSWORD "your_password"
#define FIREBASE_HOST "your-project.firebasedatabase.app"  // NO https://
#define FIREBASE_AUTH "AIzaSyC..."  // Your API key
```

### 3️⃣ Install Libraries in Arduino IDE
```
Tools → Manage Libraries → Install:
  - HX711 (by Bogdan Necula)
  - Firebase ESP32 Client (by Mobizt)
```

### 4️⃣ Upload to ESP32
```
Tools → Board → ESP32 Dev Module
Tools → Port → Select your COM port
Click Upload (→)
```

### 5️⃣ Done! ✅
Open Serial Monitor (115200 baud) - Should see "✅ Success!"

---

## 📁 Files Overview

| File | Purpose |
|------|---------|
| **esp32.ino** | Main ESP32 code (upload this to your board) |
| **ESP32_FIREBASE_SETUP.md** | Complete step-by-step Firebase setup |
| **ESP32_WIRING_DIAGRAM.md** | Hardware connections guide |

---

## 🔌 Pin Connections (Quick Reference)

```
HX711:        DOUT→GPIO4, SCK→GPIO5, VCC→5V, GND→GND
HC-SR04:      TRIG→GPIO14, ECHO→GPIO27, VCC→5V, GND→GND
```

---

## 🎯 What the Code Does

1. **Connects to WiFi**
2. **Reads sensors every 5 seconds:**
   - Weight from HX711 load cell
   - Distance from HC-SR04 ultrasonic
3. **Calculates:**
   - Fill percentage
   - Blocked status
   - Bin status (Normal/Warning/NEEDS_EMPTYING)
4. **Sends to Firebase:**
   - `/bins/bin1` → Current status
   - `/bins/bin1/history` → Historical data

---

## 📊 Firebase Data Structure

```json
{
  "bins": {
    "bin1": {
      "weightKg": 0.52,
      "fillPct": 17.3,
      "status": "Normal",
      "isBlocked": false,
      "updatedAt": "1234567",
      "name": "Hardware Bin",
      "location": "ESP32 Device",
      "capacity": 3
    }
  }
}
```

---

## 🔧 Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| **WiFi won't connect** | Check SSID/password, use 2.4GHz WiFi |
| **Compile errors** | Install Firebase ESP32 Client library (NOT ESP8266) |
| **Firebase fails** | Remove `https://` from FIREBASE_HOST |
| **No weight reading** | Check HX711 wiring, adjust CALIBRATION_FACTOR |
| **Distance always 0** | Check HC-SR04 wiring, test sensor range |

---

## 📝 Need to Change?

### Update WiFi:
Line 21-22 in esp32.ino

### Update Firebase:
Line 28-29 in esp32.ino

### Update Sensor Pins:
Line 32-38 in esp32.ino

### Update Send Interval:
Line 44: `#define UPDATE_INTERVAL 5000` (milliseconds)

---

## ✅ Success Indicators

Serial Monitor shows:
```
✅ WiFi Connected!
✅ Firebase initialized
✅ Success!
```

Firebase Console shows:
- bin1 data updating every 5 seconds
- Weight and fill percentage changing

Web App shows:
- Hardware Bin with real-time data
- Status updating automatically

---

## 🆘 Get Help

1. Check **ESP32_FIREBASE_SETUP.md** for detailed steps
2. Check **ESP32_WIRING_DIAGRAM.md** for hardware connections
3. Check Serial Monitor for error messages
4. Verify Firebase Database Rules allow write access

---

**That's it! Your ESP32 is now a smart IoT bin! 🎉**
