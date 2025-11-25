# 🔑 Add Your Gemini API Key - Quick Guide

## Step 1: Get Your Gemini API Key

### Option A: Use Existing Key
If you already have a Gemini API key, skip to Step 2.

### Option B: Get New Key (Free!)
1. Go to: **https://makersuite.google.com/app/apikey**
2. Click **"Create API Key"**
3. Copy the key (starts with `AIza...`)

---

## Step 2: Create `.env` File

### For Windows (Your System):

1. **Open PowerShell in `aiswo-backend` folder:**
   ```powershell
   cd "C:\Users\M Charagh Khan\Desktop\FYP_COMPLEATE\AISWO_FYP\aiswo-backend"
   ```

2. **Create `.env` file with your key:**
   ```powershell
   @"
GEMINI_API_KEY=YOUR_ACTUAL_KEY_HERE
"@ | Out-File -FilePath ".env" -Encoding ASCII
   ```

3. **Replace `YOUR_ACTUAL_KEY_HERE` with your real key!**

---

## Step 3: Verify the File

```powershell
# Check if file exists
Test-Path .env

# View content (make sure key is there)
Get-Content .env
```

---

## Step 4: Restart Backend

```powershell
node server.js
```

You should see:
```
✅ Firebase connected successfully
📊 Project: aiswo-simple
🚀 Backend running on http://localhost:5000
```

---

## Step 5: Test Chatbot!

1. **Go to:** http://localhost:3000
2. **Click the purple chat button** (💬) in bottom-right
3. **Ask:** "Which bins are almost full?"

---

## 🎯 Quick Copy-Paste Method:

### 1. Get API Key from Google AI Studio
### 2. Run this (replace `YOUR_KEY`):

```powershell
cd "C:\Users\M Charagh Khan\Desktop\FYP_COMPLEATE\AISWO_FYP\aiswo-backend"

"GEMINI_API_KEY=YOUR_KEY_HERE" | Out-File -FilePath ".env" -Encoding ASCII

node server.js
```

---

## ✅ Success Indicators:

When it works, you'll see:
- ✅ No errors about "GEMINI_API_KEY"
- ✅ Chat responses from AI
- ✅ Backend logs show successful requests

---

## ❌ Troubleshooting:

### "Invalid API key"
- Double-check you copied the entire key
- Make sure no extra spaces

### "API key not found"
- Verify `.env` file is in `aiswo-backend/` folder
- Check filename is exactly `.env` (no `.txt`)

### Still not working?
- Restart backend completely
- Clear browser cache
- Check backend console for errors

---

## 📝 Example `.env` File:

```env
GEMINI_API_KEY=AIzaSyBXLe7Eq1EEW_example_key_here_xyz123
```

That's it! 🎉

---

**Ready? Let's add your key!** 🚀



