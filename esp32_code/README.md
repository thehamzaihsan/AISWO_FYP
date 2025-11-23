# ESP32 Setup Guide for AISWO Smart Bin

## 📋 What You Need

### Hardware
- ✅ ESP32 Development Board
- 📏 HC-SR04 Ultrasonic Sensor (for fill level)
- ⚖️ Load Cell + HX711 Amplifier (for weight) OR Force-Sensitive Resistor
- 🔌 Jumper wires
- 🔋 Power supply (USB or battery)

### Software
- Arduino IDE (https://www.arduino.cc/en/software)
- ESP32 Board Package
- Firebase ESP32 Library

## 🔧 Step 1: Install Arduino IDE & Libraries

### Install Arduino IDE
1. Download from: https://www.arduino.cc/en/software
2. Install on your system

### Add ESP32 Board Support
1. Open Arduino IDE
2. Go to **File → Preferences**
3. Add this URL to "Additional Board Manager URLs":
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Go to **Tools → Board → Boards Manager**
5. Search for "ESP32"
6. Install "esp32 by Espressif Systems"

### Install Required Libraries
1. Go to **Sketch → Include Library → Manage Libraries**
2. Install these libraries:
   - **Firebase ESP32 Client** by Mobizt
   - **HX711** (if using load cell)

## 🔑 Step 2: Get Firebase Database Secret

### Method 1: Create Database Secret (Recommended for Development)
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: **aiswo-simple-697dd**
3. Go to **Project Settings** (gear icon)
4. Click **Service accounts** tab
5. Click **Database secrets** tab
6. Click **Add secret** (or use existing one)
7. Copy the secret key

### Method 2: Using Legacy Database Authentication
The code uses legacy token authentication which is simpler for ESP32.

## ⚙️ Step 3: Configure the Code

Open `smart_bin_esp32.ino` and update these lines:

```cpp
// WiFi Credentials
#define WIFI_SSID "YOUR_WIFI_SSID"          // Your WiFi name
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"  // Your WiFi password

// Firebase Configuration
#define FIREBASE_HOST "aiswo-simple-697dd-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "YOUR_FIREBASE_DATABASE_SECRET"  // From Step 2
```

## 🔌 Step 4: Hardware Connections

### Ultrasonic Sensor (HC-SR04)
```
HC-SR04          ESP32
---------        -------
VCC      →       5V or 3.3V
GND      →       GND
TRIG     →       GPIO 5
ECHO     →       GPIO 18
```

### Load Cell Option 1: HX711 + Load Cell (Accurate)
```
HX711            ESP32
---------        -------
VCC      →       3.3V
GND      →       GND
DT       →       GPIO 34
SCK      →       GPIO 35
```

### Load Cell Option 2: Force Sensitive Resistor (Simple)
```
FSR              ESP32
---------        -------
One leg  →       GPIO 34
Other leg →      GND (with 10kΩ pull-down resistor)
VCC (3.3V) → Via resistor to GPIO 34
```

## 📤 Step 5: Upload Code to ESP32

1. **Connect ESP32** to your computer via USB
2. **Select Board**: Tools → Board → ESP32 Dev Module
3. **Select Port**: Tools → Port → (Select your ESP32 port)
4. **Upload**: Click the Upload button (→)
5. **Open Serial Monitor**: Tools → Serial Monitor (115200 baud)

## 🧪 Step 6: Test the Connection

### What You Should See in Serial Monitor:
```
=== AISWO Smart Bin Starting ===
Connecting to WiFi.....
✅ WiFi Connected!
📍 IP Address: 192.168.1.100
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

### Verify in Firebase Console:
1. Go to Firebase Console → Realtime Database
2. You should see data under `/bins/bin1/`:
   ```json
   {
     "weightKg": 12.34,
     "fillPct": 45.6,
     "status": "Normal",
     "updatedAt": "timestamp"
   }
   ```

## 🎯 Step 7: Check Web Dashboard

1. Open your web dashboard: http://localhost:3000
2. Go to "Bin Dashboard"
3. You should see **bin1** with real-time data from ESP32
4. Other bins (bin2, bin3, etc.) will show weighted simulation data

## 🔧 Troubleshooting

### ESP32 Won't Connect to WiFi
- Double-check SSID and password
- Make sure WiFi is 2.4GHz (ESP32 doesn't support 5GHz)
- Try moving ESP32 closer to router

### Firebase Connection Failed
- Verify Firebase Host URL is correct
- Check Database Secret key
- Make sure Firebase Realtime Database rules allow read/write

### Sensor Readings are Wrong
- Check wiring connections
- Calibrate sensors
- Adjust `BIN_HEIGHT_CM` and `BIN_CAPACITY_KG` values

### No Data in Dashboard
- Check Serial Monitor for errors
- Verify Firebase rules are set to allow read/write
- Make sure backend server is running

## 📊 Customization

### Adjust Update Frequency
```cpp
#define UPDATE_INTERVAL 5000  // Change to 10000 for 10 seconds, etc.
```

### Change Bin Capacity
```cpp
#define BIN_HEIGHT_CM 100    // Your bin height
#define BIN_CAPACITY_KG 50   // Your bin max weight
```

### Use Simulated Data for Testing
Uncomment the simulated data lines in the code:
```cpp
// In readWeight() function:
return random(0, BIN_CAPACITY_KG * 100) / 100.0;

// In readFillLevel() function:
return random(0, 100);
```

## 🚀 Next Steps

1. **Test with real sensors** - Replace simulated data with actual sensor readings
2. **Calibrate load cell** - Adjust calibration factor for accurate weight
3. **Test alerts** - Fill bin above 80% to trigger email alerts
4. **Add multiple bins** - Deploy more ESP32 units with different bin IDs

## 📞 Support

If you encounter issues:
- Check Serial Monitor output for error messages
- Verify Firebase Console shows data
- Check backend server logs
- Ensure all Firebase rules are configured correctly

---

**Your ESP32 is now connected to the AISWO Smart Bin System! 🎉**
