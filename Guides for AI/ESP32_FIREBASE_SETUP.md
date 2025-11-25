# ESP32 Firebase Setup Guide

## 📋 Complete Step-by-Step Instructions

---

## PART 1: Firebase Project Setup

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select existing project
3. Enter project name: **AISWO** (or use existing: aiswo-simple-697dd)
4. Click **Continue** → **Continue** → **Create project**

### Step 2: Enable Realtime Database
1. In Firebase Console, click **"Realtime Database"** from left menu
2. Click **"Create Database"**
3. Choose location: **asia-southeast1** (Singapore)
4. Start in **Test mode** (we'll secure it later)
5. Click **Enable**

### Step 3: Get Database URL
- After creating database, you'll see the URL at top:
  ```
  https://aiswo-simple-697dd-default-rtdb.asia-southeast1.firebasedatabase.app
  ```
- **Copy this URL** (you'll need it for ESP32)

### Step 4: Get Database Secret/Auth Token

**Option A: Using Database Secret (Legacy - Easier for ESP32)**
1. Click **⚙️ Settings** (gear icon) → **Project settings**
2. Click **"Service accounts"** tab
3. Click **"Database secrets"**
4. Copy the secret key (long alphanumeric string)

**Option B: Using Web API Key (Recommended)**
1. Go to **⚙️ Settings** → **Project settings**
2. Under **"Your apps"** section, click **Web app** icon (</>)
3. Register app name: **ESP32**
4. Copy the **API Key** from the config (starts with `AIza...`)

### Step 5: Set Database Rules (Important!)
1. In **Realtime Database**, click **"Rules"** tab
2. Replace with these rules:

```json
{
  "rules": {
    "bins": {
      ".read": true,
      ".write": true,
      "$binId": {
        ".validate": "newData.hasChildren(['weightKg', 'fillPct', 'status'])"
      }
    },
    "users": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

3. Click **Publish**

---

## PART 2: Arduino IDE Setup

### Step 1: Install Arduino IDE
- Download from: https://www.arduino.cc/en/software
- Install version 2.x or higher

### Step 2: Install ESP32 Board
1. Open Arduino IDE
2. Go to **File** → **Preferences**
3. In **"Additional Board Manager URLs"**, add:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Click **OK**
5. Go to **Tools** → **Board** → **Boards Manager**
6. Search for **"ESP32"**
7. Install **"esp32 by Espressif Systems"** (version 2.0.0 or higher)

### Step 3: Install Required Libraries
1. Go to **Sketch** → **Include Library** → **Manage Libraries**
2. Install these libraries:

   **a) HX711 Library**
   - Search: `HX711`
   - Install: **"HX711 Arduino Library" by Bogdan Necula**

   **b) Firebase ESP32 Library**
   - Search: `Firebase ESP32`
   - Install: **"Firebase Arduino Client Library for ESP8266 and ESP32" by Mobizt**
   - Version: **4.4.14** or higher

---

## PART 3: Configure ESP32 Code

### Step 1: Open esp32.ino File
1. Open the `esp32.ino` file in Arduino IDE
2. Locate the configuration section at the top

### Step 2: Update WiFi Credentials
```cpp
#define WIFI_SSID "your_wifi_name"        // Replace with your WiFi name
#define WIFI_PASSWORD "your_wifi_password" // Replace with your WiFi password
```

### Step 3: Update Firebase Configuration
```cpp
#define FIREBASE_HOST "your-project-default-rtdb.region.firebasedatabase.app"
#define FIREBASE_AUTH "your_database_secret_or_api_key"
```

**Example:**
```cpp
#define FIREBASE_HOST "aiswo-simple-697dd-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "AIzaSyC7xxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### Step 4: Verify Pin Connections
Make sure your hardware pins match the code:
```cpp
#define LOADCELL_DOUT_PIN 4   // HX711 DOUT → ESP32 GPIO 4
#define LOADCELL_SCK_PIN  5   // HX711 SCK  → ESP32 GPIO 5
#define TRIG_PIN 14           // HC-SR04 TRIG → ESP32 GPIO 14
#define ECHO_PIN 27           // HC-SR04 ECHO → ESP32 GPIO 27
```

---

## PART 4: Upload to ESP32

### Step 1: Connect ESP32
1. Connect ESP32 to computer via USB cable
2. Wait for drivers to install (Windows may require CH340 driver)

### Step 2: Select Board
1. Go to **Tools** → **Board** → **ESP32 Arduino**
2. Select your ESP32 board:
   - **ESP32 Dev Module** (most common)
   - Or your specific board model

### Step 3: Select Port
1. Go to **Tools** → **Port**
2. Select the COM port (Windows) or /dev/ttyUSB0 (Linux)
   - Example: **COM3** or **/dev/ttyUSB0**

### Step 4: Configure Upload Settings
- **Upload Speed:** 921600
- **Flash Frequency:** 80MHz
- **Flash Mode:** QIO
- **Flash Size:** 4MB
- **Partition Scheme:** Default 4MB with spiffs

### Step 5: Upload Code
1. Click **Verify** (✓) button to compile
2. If no errors, click **Upload** (→) button
3. Wait for upload to complete (30-60 seconds)
4. You should see: **"Hard resetting via RTS pin..."**

---

## PART 5: Testing & Verification

### Step 1: Open Serial Monitor
1. Click **Tools** → **Serial Monitor**
2. Set baud rate to **115200**
3. You should see output like:

```
=== AISWO Smart Bin - Firebase Edition ===
Initializing load cell...
✅ Load cell ready
Connecting to WiFi....
✅ WiFi Connected!
📍 IP Address: 192.168.1.100
Configuring Firebase...
✅ Firebase initialized
📡 Starting data transmission...

==========================================
Weight: 0.52 kg
Distance: 35 cm
Fill Level: 17.3 %
Blocked: NO
Status: Normal
📤 Sending to Firebase... ✅ Success!
📊 History updated
==========================================
```

### Step 2: Verify Firebase Data
1. Go to Firebase Console → **Realtime Database**
2. You should see data structure:

```
aiswo-simple-697dd-default-rtdb
└── bins
    └── bin1
        ├── weightKg: 0.52
        ├── fillPct: 17.3
        ├── status: "Normal"
        ├── isBlocked: false
        ├── updatedAt: "123456789"
        ├── name: "Hardware Bin"
        ├── location: "ESP32 Device"
        ├── capacity: 3
        └── history
            ├── -Nxxx...
            │   ├── weightKg: 0.52
            │   ├── fillPct: 17.3
            │   └── timestamp: "123456789"
            └── ...
```

### Step 3: Test Your Web App
1. Open your React app (http://localhost:5173)
2. You should see **bin1** with real-time data from ESP32
3. Data should update every 5 seconds

---

## PART 6: Backend Configuration

### Update Backend to Read Firebase Data

Your backend (`aiswo-backend/server.js`) is already configured! It reads from:
- `bin1` - Your ESP32 hardware bin (real data)
- `bin2, bin3` - Dummy bins for testing

No changes needed if you're using the existing backend.

---

## 🔧 Troubleshooting

### Problem: "WiFi not connecting"
**Solution:**
- Double-check WiFi SSID and password (case-sensitive)
- Make sure WiFi is 2.4GHz (ESP32 doesn't support 5GHz)
- Try moving ESP32 closer to router

### Problem: "Firebase connection failed"
**Solution:**
- Verify `FIREBASE_HOST` is correct (no https://, no trailing slash)
- Check `FIREBASE_AUTH` token is valid
- Ensure Database Rules allow write access
- Check Serial Monitor for specific error messages

### Problem: "Compilation errors"
**Solution:**
- Make sure you installed **Firebase ESP32 Client** library (not ESP8266 version)
- Update library to latest version
- Restart Arduino IDE

### Problem: "Data not updating in Firebase"
**Solution:**
- Check Serial Monitor - does it say "✅ Success!"?
- Verify internet connection
- Check Firebase Database Rules
- Try refreshing Firebase Console

### Problem: "Negative weight readings"
**Solution:**
- Recalibrate load cell
- Press the tare button (code does `scale.tare()` on startup)
- Adjust `CALIBRATION_FACTOR` value
- Check HX711 wiring

### Problem: "Distance always 0"
**Solution:**
- Check HC-SR04 wiring (TRIG and ECHO pins)
- Ensure 5V power to sensor
- Test sensor range (works 2cm - 400cm)

---

## 📊 Data Flow

```
ESP32 Hardware
     ↓
  Sensors (HX711 + HC-SR04)
     ↓
  WiFi Network
     ↓
Firebase Realtime Database
     ↓
Backend Server (Node.js)
     ↓
React Frontend
```

---

## 🎯 Next Steps

1. **Calibrate Load Cell**: Adjust `CALIBRATION_FACTOR` for accurate weight
2. **Test Fill Detection**: Cover ultrasonic sensor to trigger "NEEDS_EMPTYING"
3. **Monitor Data**: Watch Firebase console for real-time updates
4. **Deploy Backend**: Make backend accessible for ESP32
5. **Add Email Alerts**: Backend will send alerts when bin is full

---

## 📝 Important Notes

- ESP32 sends data every **5 seconds** (configurable via `UPDATE_INTERVAL`)
- Data is stored in `/bins/bin1` path
- History is saved in `/bins/bin1/history` for analytics
- Status values: `"Normal"`, `"Warning"`, `"NEEDS_EMPTYING"`
- Keep ESP32 powered on for continuous monitoring

---

## 🔐 Security Recommendations (Production)

1. **Update Database Rules** to require authentication:
```json
{
  "rules": {
    "bins": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

2. **Use Firebase Authentication** with ESP32
3. **Rotate API keys** regularly
4. **Monitor Firebase usage** to prevent quota overages

---

## ✅ Checklist

- [ ] Firebase project created
- [ ] Realtime Database enabled
- [ ] Database URL copied
- [ ] Auth token/API key obtained
- [ ] Database rules configured
- [ ] Arduino IDE installed
- [ ] ESP32 board support added
- [ ] HX711 library installed
- [ ] Firebase ESP32 library installed
- [ ] esp32.ino configured (WiFi + Firebase)
- [ ] ESP32 connected to computer
- [ ] Code uploaded successfully
- [ ] Serial Monitor showing "✅ Success!"
- [ ] Data visible in Firebase Console
- [ ] Web app showing real-time data

---

**You're all set! 🎉**

Your ESP32 is now sending real-time bin data to Firebase, and your web app can display it!
