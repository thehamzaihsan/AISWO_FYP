# Bin Configuration Fix - 10 Inch Dustbin

## Problem
Empty bin showing 46% full

## Root Cause
The BIN_HEIGHT_CM was set to 50cm (19.7 inches) but your actual bin is only 10 inches tall.

## Solution Applied

### 1. Updated BIN_HEIGHT_CM
**Before:** 50cm
**After:** 25.4cm (10 inches)

```cpp
#define BIN_HEIGHT_CM 25.4  // Bin height: 10 inches = 25.4cm
```

### 2. How Fill Percentage is Calculated

The ultrasonic sensor (HC-SR04) measures distance from the top of the bin:

```
Sensor at top
    |
    |<--- Distance measured by sensor
    |
  [Waste]
    |
  [Empty Space]
    |
  Bottom
```

**Formula:**
```cpp
fillLevel = BIN_HEIGHT_CM - distanceCm;
fillPct = (fillLevel / BIN_HEIGHT_CM) * 100;
```

### 3. Example Calculations

#### Empty Bin (10 inches tall):
- Sensor reads: ~25cm (from top to bottom)
- Fill Level: 25.4 - 25 = 0.4cm
- Fill %: (0.4 / 25.4) × 100 = **1.6%** ✅

#### Half Full:
- Sensor reads: ~13cm
- Fill Level: 25.4 - 13 = 12.4cm
- Fill %: (12.4 / 25.4) × 100 = **48.8%** ✅

#### Full Bin:
- Sensor reads: ~2cm (minimum distance)
- Fill Level: 25.4 - 2 = 23.4cm
- Fill %: (23.4 / 25.4) × 100 = **92.1%** ✅

## Next Steps

### Upload Updated Code to ESP32

1. **Open Arduino IDE**

2. **Open the file:**
   `/home/hamzaihsan/Desktop/AISWO_FYP/esp32/esp32.ino`

3. **Verify the change:**
   Look for line 45:
   ```cpp
   #define BIN_HEIGHT_CM 25.4  // Bin height: 10 inches = 25.4cm
   ```

4. **Compile and Upload:**
   ```bash
   arduino-cli compile --fqbn esp32:esp32:esp32 esp32/esp32.ino
   arduino-cli upload -p /dev/ttyUSB0 --fqbn esp32:esp32:esp32 esp32/esp32.ino
   ```

5. **Monitor Serial Output:**
   ```bash
   arduino-cli monitor -p /dev/ttyUSB0
   ```

### Expected Results After Upload

**Empty Bin:**
- Distance: ~25cm
- Fill %: ~2-5%
- Status: Normal

**Your Current Reading (if truly empty):**
- Should now show ~2-5% instead of 46%

## Troubleshooting

### If still showing wrong percentage:

1. **Check actual distance reading:**
   - Look at Serial Monitor
   - Note the "Distance: Xcm" value when empty
   - It should be around 23-25cm

2. **If distance is wrong:**
   - Sensor might be mounted incorrectly
   - Check HC-SR04 wiring
   - Ensure sensor faces downward into bin

3. **Sensor placement:**
   ```
   Correct:          Wrong:
   [Sensor ↓]        [Sensor →]
   |       |         |       |
   | Empty |         | Empty |
   |   Bin |         |   Bin |
   |_______|         |_______|
   ```

4. **If you get weird readings:**
   - Ultrasonic needs clear line of sight
   - Avoid foam or soft materials
   - Keep sensor 2-3cm from top edge

## Advanced Configuration

### If you want to adjust for sensor offset:

The sensor has a minimum detection distance (~2cm). You can add an offset:

```cpp
#define SENSOR_OFFSET_CM 2.0  // Sensor dead zone

float calculateFillPercentage(float weightKg, long distanceCm) {
  float weightPct = (weightKg / BIN_CAPACITY_KG) * 100;
  
  // Adjust for sensor offset
  float adjustedDistance = distanceCm - SENSOR_OFFSET_CM;
  float fillLevel = BIN_HEIGHT_CM - adjustedDistance;
  float distancePct = (fillLevel / BIN_HEIGHT_CM) * 100;
  
  float fillPct = max(weightPct, distancePct);
  return constrain(fillPct, 0, 100);
}
```

## Verification Checklist

After uploading new code:

- [ ] Empty bin shows 0-5% full
- [ ] Half-filled bin shows ~50%
- [ ] Full bin shows 90-100%
- [ ] Weight reading is accurate
- [ ] Firebase updates correctly
- [ ] Dashboard displays correct %

## Your Bin Specs

```
Height: 10 inches (25.4 cm)
Capacity: 3 kg
Sensor: HC-SR04 ultrasonic
Load Cell: HX711 + strain gauge
```

## Quick Reference

| Measurement | Value |
|-------------|-------|
| Bin Height | 10 inches / 25.4 cm |
| Max Weight | 3 kg |
| Sensor Type | HC-SR04 |
| Update Rate | Every 5 seconds |
| Empty Reading | Should be ~2-5% |
| Full Reading | Should be ~90-100% |

---

**After uploading, your empty bin should show ~2-5% instead of 46%!**

