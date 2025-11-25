# 🤖 Smart Bin Chatbot - Enhanced Query Support

## Overview
The Mistral chatbot has been significantly enhanced to handle a wide variety of random questions about bins and operators with intelligent pattern matching and contextual responses.

## ✅ Supported Query Types (13+ Categories)

### 1. **Operator Assignment Queries**
- "who is operating bin1"
- "who is assigned to bin2"
- "who manages bin3"
- "who handles bin1"
- "who is responsible for bin2"

**Response Example:** `👤 Main Street Bin is currently assigned to John Doe.`

---

### 2. **Operator's Bins Queries**
- "which bins does John manage"
- "which bins is Jane operating"
- "what bins does John handle"
- "which bins are assigned to Jane"

**Response Example:**
```
👤 Bins assigned to john:

🗑️ Main Street Bin: 85.0% full, NEEDS_EMPTYING
🗑️ Harbor Bin: 15.0% full, OK
```

---

### 3. **Count Queries**
- "how many bins" → Total bin count
- "how many bins are full" → Bins ≥80% full
- "how many bins are empty" → Bins <20% full
- "how many bins have operators" → Assigned vs unassigned

**Response Examples:**
- `There are 4 bins in total in the system.`
- `⚠️ 2 bin(s) are 80% full or more and need emptying.`
- `📊 3 bin(s) are assigned to operators, 1 are unassigned.`

---

### 4. **Location Queries**
- "where is bin1"
- "where is bin2 located"

**Response Example:** `📍 Main Street Bin is located at: Main Street, Downtown`

---

### 5. **Condition Check Queries**
- "is bin1 full"
- "is bin2 empty"
- "is bin3 available"
- "is bin1 blocked"

**Response Examples:**
- `🔴 Yes, Main Street Bin is full (85.0% capacity). It needs emptying.`
- `✅ Yes, Harbor Bin is mostly empty (15.0% full).`

---

### 6. **Operator List Queries**
- "list operators"
- "show all operators"
- "who are the operators"

**Response Example:**
```
👥 Active operators (2):

👤 John Doe: 2 bin(s)
👤 Jane Smith: 1 bin(s)
```

---

### 7. **Extreme Value Queries**
- "which bin is the fullest"
- "what is the emptiest bin"
- "which is the most full bin"

**Response Examples:**
- `🔴 Station Bin is the fullest at 92.0% capacity (9.20 kg).`
- `✅ Harbor Bin is the emptiest at 15.0% capacity (1.50 kg).`

---

### 8. **Attention/Emptying Queries**
- "which bins need emptying"
- "which bins require attention"
- "what bins need collection"

**Response Example:**
```
⚠️ 2 bin(s) need attention:

🗑️ Main Street Bin: 85.0% full
   Operator: John Doe
🗑️ Station Bin: 92.0% full
```

---

### 9. **Weight Queries**
- "what is the weight of bin1"
- "how much does bin2 weigh"

**Response Example:** `⚖️ Main Street Bin currently weighs 8.50 kg (85.0% full)`

---

### 10. **Comparison Queries**
- "is bin1 fuller than bin2"
- "is bin2 emptier than bin3"
- "is bin1 heavier than bin2"
- "is bin2 lighter than bin4"

**Response Examples:**
- `✅ Yes, Main Street Bin (85.0%) is fuller than Park Avenue Bin (45.0%).`
- `✅ Yes, Park Avenue Bin (4.50kg) is lighter than Station Bin (9.20kg).`

---

### 11. **Specific Bin Status Queries**
- "bin1"
- "status of bin2"
- "check bin3"

**Response Example:**
```
🗑️ Status for Main Street Bin:

📊 Fill Level: 85.0%
⚖️ Weight: 8.50 kg
📍 Status: NEEDS_EMPTYING 🔴
📍 Location: Main Street, Downtown
👤 Assigned to: John Doe
```

---

### 12. **General Status Queries**
- "show all bins"
- "list all bins"
- "status"
- "my bins"
- "what bins"

**Response:** Shows complete status for all bins

---

### 13. **Full Bins Alert Queries**
- "show me full bins"
- "display full bins"
- "alert"

**Response:** Lists only bins that are ≥80% full with operator info

---

## 🔧 Technical Implementation

### Query Processing Order (Priority)
1. **Operator assignment** ("who is operating bin1")
2. **Operator's bins** ("which bins does John manage")
3. **Count queries** ("how many bins")
4. **Location queries** ("where is bin2")
5. **Comparison queries** ("is bin1 fuller than bin2") ⭐ High priority
6. **Condition checks** ("is bin1 full")
7. **Operator lists** ("list operators")
8. **Extreme values** ("which bin is fullest")
9. **Needs attention** ("which bins need emptying")
10. **Weight queries** ("how much does bin1 weigh")
11. **Specific bin** ("bin1")
12. **Full bins alert** ("show me full bins")
13. **General status** ("show all bins")

### Key Features
- ✅ **Smart Pattern Matching** - Uses regex to understand natural language variations
- ✅ **Context-Aware** - Understands the difference between similar queries
- ✅ **Priority-Based** - Processes specific queries before general ones
- ✅ **Emoji-Rich** - Uses emojis for better visual feedback
- ✅ **Error Handling** - Graceful fallbacks for edge cases

### Helper Functions Added
1. `findBinsByOperator()` - Find all bins assigned to a specific operator
2. `countFullBins()` - Count bins ≥80% full
3. `countEmptyBins()` - Count bins <20% full
4. `countAssignedBins()` - Count assigned vs unassigned bins
5. `checkBinCondition()` - Check if bin meets a specific condition
6. `listOperators()` - List all active operators with bin counts
7. `findExtremeBin()` - Find fullest or emptiest bin
8. `compareBins()` - Compare two bins (fuller, emptier, heavier, lighter)

## 🚀 Usage Example

```javascript
const chatbot = new SmartBinChatbot(binService);

// Simple queries
await chatbot.chat("who is operating bin1");
// → 👤 Main Street Bin is currently assigned to John Doe.

// Complex queries
await chatbot.chat("is bin1 fuller than bin2");
// → ✅ Yes, Main Street Bin (85.0%) is fuller than Park Avenue Bin (45.0%).

// Natural language variations
await chatbot.chat("which bins does John manage");
// → Lists all bins assigned to John
```

## 📝 Notes
- All queries are case-insensitive
- Supports multiple phrasings of the same question
- Automatically converts bin object data to array format
- Falls back to showing all bins for unrecognized queries
- Works offline for operational queries (doesn't require Mistral API)

---

**Last Updated:** 2025-11-25
**Version:** 2.0 - Enhanced Query Support
