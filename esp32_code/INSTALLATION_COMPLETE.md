# ✅ ESP32 Setup - Installation Complete!

## What Has Been Installed

### ✅ Arduino CLI
- **Version**: 1.3.1
- **Location**: /usr/local/bin/arduino-cli
- **Status**: ✅ Installed and configured

### ✅ Firebase ESP32 Client Library
- **Version**: 4.4.17
- **By**: Mobizt
- **Status**: ✅ Installed successfully

### ⚠️ ESP32 Board Support
- **Status**: ❌ Needs manual installation via Arduino IDE GUI
- **Reason**: Arduino CLI has network timeout issues

## 🚀 Quick Start Guide

### Option 1: Use Arduino IDE GUI (Recommended - Easier)

#### Step 1: Install Arduino IDE 2.0
Download and install from: https://www.arduino.cc/en/software

**For Fedora:**
```bash
# Download the AppImage
cd ~/Downloads
wget https://downloads.arduino.cc/arduino-ide/arduino-ide_2.3.2_Linux_64bit.AppImage
chmod +x arduino-ide_2.3.2_Linux_64bit.AppImage
./arduino-ide_2.3.2_Linux_64bit.AppImage
```

#### Step 2: Add ESP32 Board Support
1. Open Arduino IDE
2. Go to **File → Preferences**
3. In "Additional Board Manager URLs", add:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Click OK
5. Go to **Tools → Board → Boards Manager**
6. Search for "ESP32"
7. Install "**esp32 by Espressif Systems**" (latest version)

#### Step 3: Install Firebase Library
1. Go to **Sketch → Include Library → Manage Libraries**
2. Search for "**Firebase ESP32 Client**"
3. Install "**Firebase ESP32 Client by Mobizt**"

#### Step 4: Open Your Code
1. Open: `/home/hamzaihsan/Desktop/AISWO_FYP/esp32_code/smart_bin_esp32.ino`
2. Update these lines:
   ```cpp
   #define WIFI_SSID "YourWiFiName"
   #define WIFI_PASSWORD "YourWiFiPassword"
   #define FIREBASE_AUTH ""  // Leave empty if using open rules
   ```

#### Step 5: Upload to ESP32
1. Connect ESP32 via USB
2. Go to **Tools → Board → esp32 → ESP32 Dev Module**
3. Go to **Tools → Port** → Select your ESP32 port (usually /dev/ttyUSB0)
4. Click the **Upload** button (→)
5. Open **Serial Monitor** (magnifying glass icon) at 115200 baud

### Option 2: Use Command Line (Advanced)

If you prefer command line, you need to manually install ESP32 core:

```bash
# Navigate to Arduino packages directory
mkdir -p ~/.arduino15/packages/esp32
cd ~/.arduino15/packages/esp32

# Download ESP32 package manually
wget https://github.com/espressif/arduino-esp32/releases/download/3.3.4/esp32-3.3.4.zip
unzip esp32-3.3.4.zip

# Then use arduino-cli to compile
arduino-cli compile --fqbn esp32:esp32:esp32 ~/Desktop/AISWO_FYP/esp32_code/smart_bin_esp32
```

## 📋 What You Need to Configure

### 1. WiFi Credentials
Edit `smart_bin_esp32.ino`:
```cpp
#define WIFI_SSID "YOUR_WIFI_NAME"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
```

### 2. Firebase Configuration (Already Set)
The Firebase host is already configured:
```cpp
#define FIREBASE_HOST "aiswo-simple-697dd-default-rtdb.asia-southeast1.firebasedatabase.app"
```

### 3. Firebase Database Secret (Optional)
For testing with open rules, you can leave this empty:
```cpp
#define FIREBASE_AUTH ""
```

**To get database secret (for production):**
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select: **aiswo-simple-697dd**
3. Project Settings → Service Accounts → Database Secrets
4. Copy the secret and paste it

## 🔌 Hardware Connections

### Ultrasonic Sensor (HC-SR04)
```
HC-SR04     →     ESP32
------------------------
VCC         →     3.3V or 5V
GND         →     GND
TRIG        →     GPIO 5
ECHO        →     GPIO 18
```

### Weight Sensor (Optional - Can test without)
```
Sensor      →     ESP32
------------------------
Signal      →     GPIO 34
VCC         →     3.3V
GND         →     GND
```

## 🧪 Testing Without Sensors

You can test the system without physical sensors! The code has built-in test data.

**To enable test mode**, uncomment these lines in the code:

```cpp
// In readWeight() function (around line 119):
return random(0, BIN_CAPACITY_KG * 100) / 100.0;

// In readFillLevel() function (around line 143):
return random(0, 100);
```

This will send random data to Firebase for testing!

## ✅ Verification Checklist

After uploading, you should see:

### In Serial Monitor (115200 baud):
```
=== AISWO Smart Bin Starting ===
Connecting to WiFi.....
✅ WiFi Connected!
📍 IP Address: 192.168.1.xxx
✅ Firebase initialized
📡 Starting data transmission...

==========================================
Weight: 12.34 kg
Fill Level: 45.6 %
Status: Normal
WiFi: Connected
==========================================
✅ Data sent to Firebase
```

### In Firebase Console:
1. Go to: https://console.firebase.google.com/
2. Select: aiswo-simple-697dd
3. Go to: Realtime Database
4. You should see data under `/bins/bin1/`

### In Your Web Dashboard:
1. Open: http://localhost:3000
2. Go to "Bin Dashboard"
3. You should see bin1 with real ESP32 data!

## 🔧 Troubleshooting

### ESP32 not detected
- Install CH340 driver for your ESP32
- Try a different USB cable (must support data, not just charging)
- Press BOOT button on ESP32 while uploading

### WiFi connection failed
- Double-check SSID and password (case-sensitive!)
- ESP32 only supports 2.4GHz WiFi (not 5GHz)
- Move ESP32 closer to your router

### Firebase error
- Make sure Firebase Realtime Database rules allow read/write
- Verify FIREBASE_HOST is correct
- Check your internet connection

### Compilation errors
- Make sure ESP32 board support is installed
- Make sure Firebase library is installed
- Restart Arduino IDE and try again

## 📞 Get Help

If you encounter issues:
1. Check the Serial Monitor for error messages
2. Verify all connections are correct
3. Make sure Firebase rules are set to allow access
4. Check that both backend and frontend are running

## 🎯 Next Steps

Once your ESP32 is sending data:

1. **View real-time data** on your dashboard
2. **Test alerts** by filling the bin above 80%
3. **Add more bins** by deploying additional ESP32 units
4. **Calibrate sensors** for accurate measurements
5. **Deploy in production** with proper sensor hardware

---

**Everything is ready! Just install Arduino IDE and you're good to go! 🚀**
