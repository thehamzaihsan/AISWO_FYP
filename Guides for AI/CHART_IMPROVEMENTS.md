# Chart Improvements - Fixed Scale & Percentages

## Changes Applied to BinDashboard.js

### 1. Y-Axis Fixed Scale (0-100%)
**Before:** Dynamic scale based on data values
**After:** Fixed scale from 0% to 100%

```javascript
y: {
  min: 0,
  max: 100,
  // ... rest of config
}
```

### 2. Weight Converted to Percentage
**Before:** Weight displayed in kg (0-3kg range)
**After:** Weight displayed as percentage of max capacity (3kg)

```javascript
const weightToPercentage = (weightKg) => {
  const maxWeight = 3; // 3kg max capacity
  return Math.min((weightKg / maxWeight) * 100, 100);
};
```

**Example:**
- 0.28kg → 9.33% (0.28 / 3 * 100)
- 1.5kg → 50%
- 3kg → 100%

### 3. Chart Dataset Updated
**Before:**
- Label: "Weight (kg)"
- Data: Raw weight values

**After:**
- Label: "Weight (%)"
- Data: Converted to percentage

Both lines now show 0-100% scale for easy comparison.

### 4. Tooltip Shows Percentages
Added custom tooltip callback:
```javascript
callbacks: {
  label: function(context) {
    return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + '%';
  }
}
```

### 5. Y-Axis Ticks Show %
```javascript
ticks: {
  callback: function(value) {
    return value + '%';
  }
}
```

### 6. Table Updated
**Table Header:**
- Changed: "Weight (kg)" → "Weight (% of 3kg)"

**Table Body:**
- Shows weight as percentage
- Shows fill level as percentage
- Both with 2 decimal places
- Formatted timestamps

## Visual Result

### Chart Y-Axis:
```
100% ┤─────────────────
 80% ┤─────────────────
 60% ┤─────────────────
 40% ┤─────────────────
 20% ┤─────────────────
  0% ┤─────────────────
```

### Example Data Display:

| Timestamp | Weight (% of 3kg) | Fill Level (%) |
|-----------|-------------------|----------------|
| 02:30 PM  | 9.33%            | 9.38%          |
| 02:29 PM  | 8.50%            | 8.75%          |
| 02:28 PM  | 7.20%            | 7.50%          |

### Chart Lines:
- **Green Line (Weight %)**: Shows weight as percentage of 3kg max
- **Light Green Line (Fill Level %)**: Shows fill percentage from ultrasonic sensor

Both lines on same 0-100% scale for easy comparison!

## Benefits

1. ✅ **Consistent Scale**: Both metrics on 0-100% scale
2. ✅ **Easy Comparison**: Can directly compare weight vs fill level
3. ✅ **Fixed Y-Axis**: Always shows full 0-100% range
4. ✅ **Clear Labels**: Everything marked with % symbol
5. ✅ **Better UX**: Users know max capacity at a glance

## Technical Details

### Weight Capacity Reference:
- **Max Weight**: 3kg
- **Calculation**: (currentWeight / 3kg) × 100
- **Range**: 0% to 100%
- **Capped**: Values > 100% are capped at 100%

### Fill Level Reference:
- **Source**: HC-SR04 ultrasonic sensor
- **Calculation**: Done by ESP32 based on bin depth
- **Range**: 0% to 100%
- **Display**: Direct percentage from sensor

## Example Scenarios

### Scenario 1: Nearly Empty Bin
- Weight: 0.15kg → **5%**
- Fill Level: 3% → **3%**
- Chart shows both near bottom of 0-100% scale

### Scenario 2: Half Full Bin
- Weight: 1.5kg → **50%**
- Fill Level: 48% → **48%**
- Chart shows both around middle of scale

### Scenario 3: Almost Full Bin
- Weight: 2.7kg → **90%**
- Fill Level: 92% → **92%**
- Chart shows both near top (warning zone)

### Scenario 4: Overfilled Bin
- Weight: 3.2kg → **100%** (capped)
- Fill Level: 98% → **98%**
- Chart shows weight at max

## Code Location

File: `/home/hamzaihsan/Desktop/AISWO_FYP/aiswo_frontend/src/BinDashboard.js`

Key functions:
- `weightToPercentage()` - Converts kg to %
- `chartData` - Dataset configuration
- `chartOptions.scales.y` - Y-axis 0-100% scale
- `chartOptions.plugins.tooltip` - Percentage display

## Testing

Visit: http://localhost:3000/bin/bin1

You should see:
- Chart with Y-axis labeled 0% to 100%
- Both lines showing percentages
- Tooltips showing "X.XX%"
- Table showing weight and fill as percentages

**The chart now provides a consistent, easy-to-read view of bin capacity!**

