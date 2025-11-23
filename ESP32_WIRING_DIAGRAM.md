# ESP32 Hardware Wiring Diagram

## 🔌 Component Connections

### Components Needed:
1. **ESP32 Development Board**
2. **HX711 Load Cell Amplifier**
3. **Load Cell** (1-5kg capacity)
4. **HC-SR04 Ultrasonic Sensor**
5. **Jumper Wires**
6. **Breadboard** (optional)
7. **USB Cable** (for power and programming)

---

## 📐 Wiring Connections

### 1️⃣ HX711 Load Cell Amplifier

```
HX711 Module          →    ESP32
─────────────────────────────────────
VCC (Power)           →    3.3V or 5V
GND (Ground)          →    GND
DOUT (Data Out)       →    GPIO 4
SCK (Clock)           →    GPIO 5
```

**Load Cell to HX711:**
```
Load Cell Wire        →    HX711
─────────────────────────────────────
Red Wire (E+)         →    E+
Black Wire (E-)       →    E-
White Wire (A-)       →    A-
Green Wire (A+)       →    A+
```

---

### 2️⃣ HC-SR04 Ultrasonic Sensor

```
HC-SR04 Module        →    ESP32
─────────────────────────────────────
VCC (Power)           →    5V
GND (Ground)          →    GND
TRIG (Trigger)        →    GPIO 14
ECHO (Echo)           →    GPIO 27
```

⚠️ **Note:** HC-SR04 ECHO pin outputs 5V, but ESP32 GPIO is 3.3V tolerant. For safety, use a voltage divider:
- 1kΩ resistor between ECHO and GPIO 27
- 2kΩ resistor between GPIO 27 and GND

Or use an HC-SR04+ (3.3V version).

---

## 🎨 Visual Diagram

```
                    ESP32 Development Board
         ┌─────────────────────────────────────────┐
         │                                         │
         │  [USB]                           [ANT]  │
         │                                         │
         │  3.3V ●────────────┐                   │
         │  GND  ●──────┐     │                   │
         │  5V   ●──┐   │     │                   │
         │          │   │     │                   │
         │  GPIO 4  ●──┼───┼──┼────── HX711 DOUT  │
         │  GPIO 5  ●──┼───┼──┼────── HX711 SCK   │
         │          │   │     │                   │
         │  GPIO 14 ●──┼───┼──┼────── HC-SR04 TRIG│
         │  GPIO 27 ●──┼───┼──┼────── HC-SR04 ECHO│
         │          │   │     │                   │
         └──────────┼───┼─────┼────────────────────┘
                    │   │     │
         ┌──────────┘   │     │
         │  ┌───────────┘     │
         │  │  ┌──────────────┘
         ↓  ↓  ↓

    ┌────────────────┐        ┌──────────────────┐
    │   HC-SR04      │        │   HX711 Module   │
    ├────────────────┤        ├──────────────────┤
    │ VCC  → 5V      │        │ VCC  → 3.3V/5V   │
    │ TRIG → GPIO 14 │        │ GND  → GND       │
    │ ECHO → GPIO 27 │        │ DOUT → GPIO 4    │
    │ GND  → GND     │        │ SCK  → GPIO 5    │
    └────────────────┘        └──────────────────┘
                                      ↓
                              ┌──────────────────┐
                              │   Load Cell      │
                              │                  │
                              │  Red   → E+      │
                              │  Black → E-      │
                              │  White → A-      │
                              │  Green → A+      │
                              └──────────────────┘
```

---

## 🔧 Pin Summary Table

| Component | Pin Name | ESP32 GPIO | Wire Color |
|-----------|----------|------------|------------|
| **HX711** | DOUT | GPIO 4 | Yellow/Green |
| **HX711** | SCK | GPIO 5 | Orange/Blue |
| **HX711** | VCC | 3.3V or 5V | Red |
| **HX711** | GND | GND | Black |
| **HC-SR04** | TRIG | GPIO 14 | White |
| **HC-SR04** | ECHO | GPIO 27 | Yellow |
| **HC-SR04** | VCC | 5V | Red |
| **HC-SR04** | GND | GND | Black |

---

## 📋 Assembly Steps

### Step 1: Prepare Load Cell
1. Mount load cell under your bin or on a platform
2. Secure it firmly (one end fixed, other end free to move)
3. Connect load cell wires to HX711 module (E+, E-, A+, A-)

### Step 2: Connect HX711 to ESP32
1. Connect HX711 VCC to ESP32 **5V** (or 3.3V)
2. Connect HX711 GND to ESP32 **GND**
3. Connect HX711 DOUT to ESP32 **GPIO 4**
4. Connect HX711 SCK to ESP32 **GPIO 5**

### Step 3: Connect HC-SR04 to ESP32
1. Connect HC-SR04 VCC to ESP32 **5V**
2. Connect HC-SR04 GND to ESP32 **GND**
3. Connect HC-SR04 TRIG to ESP32 **GPIO 14**
4. Connect HC-SR04 ECHO to ESP32 **GPIO 27** (with voltage divider if needed)

### Step 4: Mount Ultrasonic Sensor
1. Place HC-SR04 at the **top** of your bin, facing down
2. Sensor should point straight down to measure distance to trash
3. Secure with hot glue or mounting bracket
4. Keep sensor at least 2cm away from nearest object

### Step 5: Power Up
1. Connect ESP32 to computer via USB cable
2. Upload the code
3. Open Serial Monitor to verify readings
4. Calibrate load cell if needed

---

## ⚙️ Calibration Steps

### Load Cell Calibration:

1. **Tare (Zero) the Scale:**
   - Remove all weight from load cell
   - Code automatically calls `scale.tare()` on startup
   - Or press ESP32 reset button

2. **Find Calibration Factor:**
   ```cpp
   // In code, temporarily add this to loop():
   Serial.println(scale.get_units(10));
   ```
   - Place known weight (e.g., 1kg)
   - Note the reading
   - Calculate: `CALIBRATION_FACTOR = reading / actual_weight`
   - Update value in code

3. **Verify Accuracy:**
   - Test with multiple known weights
   - Adjust `CALIBRATION_FACTOR` if needed

### Ultrasonic Sensor Calibration:

1. **Measure Bin Height:**
   - Measure your bin from top to bottom in cm
   - Update `BIN_HEIGHT_CM` in code

2. **Test Detection:**
   - Empty bin: Distance should be ~BIN_HEIGHT_CM
   - Full bin: Distance should be small (< 10cm)
   - Adjust `BLOCK_DISTANCE_CM` threshold as needed

---

## 🔍 Testing Checklist

- [ ] All wires securely connected
- [ ] No loose connections
- [ ] ESP32 powered via USB
- [ ] Serial Monitor shows WiFi connected
- [ ] Weight readings appear (even if 0.00 kg)
- [ ] Distance readings appear (in cm)
- [ ] Firebase shows "✅ Success!" message
- [ ] Place object on load cell → weight increases
- [ ] Place hand over ultrasonic → distance decreases
- [ ] Data updates in Firebase Console

---

## ⚠️ Safety Tips

1. **Voltage Levels:** ESP32 is 3.3V logic, but most pins are 5V tolerant
2. **Power Supply:** Use quality USB cable and power supply (5V, 1A minimum)
3. **Load Cell:** Don't exceed maximum capacity (check load cell rating)
4. **Sensor Placement:** Keep HC-SR04 away from water/moisture
5. **Wire Management:** Use cable ties to keep wires organized and safe

---

## 🛠️ Troubleshooting Hardware

### Load Cell Not Reading:
- Check all 4 wire connections (E+, E-, A+, A-)
- Verify HX711 has power (LED should be on)
- Try swapping A+ and A- if readings are inverted
- Ensure load cell is properly mounted (one end fixed, one free)

### Ultrasonic Sensor Not Working:
- Verify 5V power connection
- Check TRIG and ECHO pin connections
- Test sensor range (works 2-400cm)
- Ensure nothing is blocking sensor view
- Try different GPIO pins if needed

### ESP32 Not Powering On:
- Check USB cable (try different cable)
- Try different USB port
- Check if LED on ESP32 lights up
- Press EN/RST button to reset

### Erratic Readings:
- Add decoupling capacitors (0.1µF) near power pins
- Keep sensor wires away from power cables
- Use shielded cable for load cell if available
- Ground all components to same GND point

---

## 📸 Photos Reference

**Load Cell Installation:**
```
    ┌─────────┐
    │  Bin    │
    │         │
    └────┬────┘
         │ (trash weight pushes down)
         ↓
    ╔════════╗  ← Load Cell
    ║▓▓▓▓▓▓▓▓║
    ╚════════╝
         │
    ─────┴─────  ← Fixed Platform
```

**Ultrasonic Mounting:**
```
    ┌─────────────┐
    │ [HC-SR04]   │ ← Sensor facing down
    ├─────────────┤
    │             │
    │   Bin Top   │
    │             │
    │    ↓ ↓ ↓    │ ← Ultrasonic waves
    │             │
    │   Trash     │
    │   Level     │
    │             │
    └─────────────┘
```

---

**Your hardware is ready! Proceed to ESP32_FIREBASE_SETUP.md for software configuration. 🚀**
