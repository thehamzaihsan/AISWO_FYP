# Quick ESP32 Connection Guide

## 📦 What's in This Folder

- `smart_bin_esp32.ino` - Main Arduino code for ESP32
- `README.md` - Detailed setup instructions
- `wiring_diagram.txt` - Hardware connection guide

## ⚡ Quick Start (5 Minutes)

### 1. Install Software
```
1. Download Arduino IDE: https://www.arduino.cc/en/software
2. Add ESP32 boards: File → Preferences → Add this URL:
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
3. Install library: Sketch → Include Library → Manage Libraries
   Search: "Firebase ESP32 Client" by Mobizt → Install
```

### 2. Get Your Firebase Database Secret

**Option A: Simple Way (Using Database Rules)**
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select: aiswo-simple-697dd
3. Realtime Database → Rules tab
4. Use this for testing (allows all access):
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
5. You can use empty string `""` for FIREBASE_AUTH in testing mode

**Option B: Secure Way (Using Database Secret)**
1. Firebase Console → Project Settings
2. Service Accounts → Database secrets
3. Copy the secret key

### 3. Configure ESP32 Code
Open `smart_bin_esp32.ino` and change these 3 lines:
```cpp
#define WIFI_SSID "YourWiFiName"
#define WIFI_PASSWORD "YourWiFiPassword"
#define FIREBASE_AUTH "YourDatabaseSecret"  // Or "" for testing
```

### 4. Wire Your Sensors (Optional - Can Test Without)

**Ultrasonic Sensor:**
- VCC → 3.3V
- GND → GND
- TRIG → GPIO 5
- ECHO → GPIO 18

**Weight Sensor (Optional):**
- Connect to GPIO 34

**OR use simulated data** - Code has built-in test data!

### 5. Upload to ESP32
1. Connect ESP32 via USB
2. Tools → Board → ESP32 Dev Module
3. Tools → Port → (Select your port)
4. Click Upload button (→)
5. Open Serial Monitor (115200 baud)

### 6. Verify Data
- Check Serial Monitor for "✅ Data sent to Firebase"
- Check Firebase Console → Realtime Database → bins/bin1
- Check your web dashboard at http://localhost:3000

## 🎯 Expected Result

Serial Monitor output:
```
✅ WiFi Connected!
✅ Firebase initialized
Weight: 12.34 kg
Fill Level: 45.6 %
Status: Normal
✅ Data sent to Firebase
```

Firebase Database structure:
```
bins/
  bin1/
    weightKg: 12.34
    fillPct: 45.6
    status: "Normal"
    updatedAt: "timestamp"
```

## 🚨 Common Issues

**Problem:** WiFi won't connect
- Check SSID/password spelling
- ESP32 only works with 2.4GHz WiFi

**Problem:** Firebase error
- Make sure database rules allow read/write
- Check FIREBASE_HOST matches your project

**Problem:** Can't upload code
- Install CH340 driver for ESP32
- Try different USB cable
- Press BOOT button while uploading

## 📝 Testing Without Hardware

Want to test without sensors? Uncomment these lines in the code:

```cpp
// In readWeight() function (line ~125):
return random(0, BIN_CAPACITY_KG * 100) / 100.0;

// In readFillLevel() function (line ~150):
return random(0, 100);
```

This will send random test data to Firebase!

---

**Need help?** Check the detailed README.md or ask for assistance!
