# 🤖 Chatbot Setup Guide

## ✅ Backend Integration Complete!

I've successfully integrated the Gemini AI chatbot into your backend! Here's what's been added:

### Files Created:
1. ✅ `aiswo-backend/chatbot/gemini.js` - Chatbot brain with AI logic
2. ✅ `aiswo-backend/server.js` - Added 5 new chatbot endpoints

### API Endpoints Added:
```
POST   /chatbot/message       - Send message to chatbot
GET    /chatbot/history/:userId  - Get conversation history
DELETE /chatbot/history/:userId  - Clear history
GET    /chatbot/stats          - Get chatbot statistics
POST   /chatbot/report         - Report issues via chatbot
```

---

## 🔧 **IMPORTANT: Add Your Gemini API Key!**

### Step 1: Get Your Gemini API Key

You mentioned you already have a Gemini API key. If you need a new one:
1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)

### Step 2: Create `.env` File

Create a file named `.env` in the `aiswo-backend` folder with this content:

```env
# Weather API Key  
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Gemini AI API Key for Chatbot
GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_KEY_HERE

# Firebase Database URL (optional - auto-detected)
# FIREBASE_DATABASE_URL=https://aiswo-simple-default-rtdb.asia-southeast1.firebasedatabase.app
```

**Replace `YOUR_ACTUAL_GEMINI_KEY_HERE` with your real Gemini API key!**

### Step 3: Restart Backend

After adding the key:
```powershell
# Stop the backend (Ctrl+C in the backend terminal)
# Then restart:
cd aiswo-backend
node server.js
```

---

## 🧪 **Test the Chatbot API**

Once your API key is added, test it:

```powershell
# Test chatbot
$body = @{
    userId = "test-user"
    message = "Which bins are almost full?"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/chatbot/message" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

**Expected Response:**
```json
{
  "response": "⚠️ bin2 is almost full at 92% capacity and needs attention. bin1 and bin3 are below 80% and doing well! ✅",
  "timestamp": "2025-10-09T...",
  "userId": "test-user"
}
```

---

## 🎯 **What the Chatbot Can Do:**

### 1. **Bin Status Queries**
```
User: "Which bins are full?"
Bot: "⚠️ bin2 is at 92% capacity (NEEDS_EMPTYING). bin1 and bin3 are OK."

User: "What's the status of bin1?"
Bot: "🗑️ bin1 is currently empty (0kg, 0%)."

User: "Show me bin2 details"
Bot: "bin2: 9.2kg, 92% full, Status: NEEDS_EMPTYING, Location: Main Street"
```

### 2. **Operator Information**
```
User: "Who is assigned to bin2?"
Bot: "John Smith is assigned to bin2."

User: "List all operators"
Bot: "We have 2 operators: John Smith (bin2) and Sarah Johnson (bin3)."
```

### 3. **Issue Reporting**
```
User: "Report issue with bin1"
Bot: "I can help you report an issue! What problem are you experiencing with bin1?"

User: "The bin is damaged"
Bot: "I've noted that bin1 is damaged. I'll create a support ticket for this."
```

### 4. **General Help**
```
User: "How do I empty a bin?"
Bot: "To empty a bin: 1) Check the bin status, 2) Ensure it needs emptying (>80%), 3) Collect waste, 4) Update status."

User: "What does NEEDS_EMPTYING mean?"
Bot: "NEEDS_EMPTYING means the bin is over 80% full and should be collected soon to prevent overflow."
```

---

## 📊 **Chatbot Features:**

✅ **Context-Aware** - Knows current bin status, weather, operators  
✅ **Conversation Memory** - Remembers previous messages per user  
✅ **Natural Language** - Understands questions in plain English  
✅ **Friendly Responses** - Uses emojis and concise answers  
✅ **Error Handling** - Falls back gracefully if API fails  

---

## 🚀 **Next Steps:**

1. ✅ **Backend chatbot** - DONE!
2. ⏳ **Frontend UI** - Coming next!
3. ⏳ **Test with users** - After UI is ready

---

## 📝 **Frontend UI Preview (What I'll Build Next):**

```
┌─────────────────────────────────────┐
│  Dashboard              [💬]        │  ← Floating chat button
│                                     │
│  Clicking opens:                    │
│  ┌────────────────────────┐        │
│  │ 🤖 Smart Bin Assistant │        │
│  │ ─────────────────────  │        │
│  │                        │        │
│  │ User: Which bins are   │        │
│  │       full?            │        │
│  │                        │        │
│  │ Bot: bin2 is at 92%    │        │
│  │      and needs         │        │
│  │      emptying! ⚠️      │        │
│  │                        │        │
│  │ [Type message...]      │        │
│  └────────────────────────┘        │
└─────────────────────────────────────┘
```

---

## ❓ **Troubleshooting:**

### Backend won't start?
- Check if `.env` file exists in `aiswo-backend/`
- Make sure `GEMINI_API_KEY` is set

### Chatbot returns errors?
- Verify API key is valid
- Check internet connection
- View backend logs for details

### Can't find .env file?
- Create it manually in `aiswo-backend/` folder
- Make sure it's named exactly `.env` (no .txt extension)

---

**Ready for the frontend UI? Let me know when your API key is added and working!** 🚀


