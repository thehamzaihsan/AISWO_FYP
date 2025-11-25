# 🤖 Mistral AI Chatbot Setup Guide

## ✅ Migration Complete: Gemini → Mistral AI

Your chatbot now uses **Mistral AI** instead of Gemini for environmental queries!

---

## 🎯 How It Works

### Two-Tier Response System

1. **Operational Queries** (Instant, <100ms)
   - Handled locally, no AI call
   - Queries about bin status, operators, assignments
   - Examples: "Show all bins", "Which bins are full?", "Who handles bin2?"

2. **Environmental Queries** (AI-powered, 1-3s)
   - Uses Mistral AI (`mistral-small-latest` model)
   - Recycling tips, waste management advice, environmental questions
   - Examples: "Benefits of recycling?", "How to reduce waste?", "Composting tips?"

---

## 🔧 Setup Instructions

### Step 1: Get Mistral API Key

1. Go to: https://console.mistral.ai/
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create new key**
5. Copy your API key

### Step 2: Add API Key to Backend

Edit `aiswo-backend/.env`:

```bash
# Mistral AI API Key
MISTRAL_API_KEY=your_actual_mistral_api_key_here
```

### Step 3: Restart Backend

```bash
cd aiswo-backend
npm start
```

You should see:
```
✅ Firebase connected successfully
✅ Mistral AI initialized
🚀 Backend running on http://localhost:5000
```

---

## 🧪 Testing

### Test Operational Query (No AI)

```bash
curl -X POST http://localhost:5000/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Show all bin status"}'
```

**Expected Response:**
```
📊 Current status for all bins:

🗑️ Hardware Bin:
   Fill: 0.5% | Weight: 0.01kg
   Status: Normal ✅

🗑️ Main Street Bin:
   Fill: 92.0% | Weight: 9.20kg
   Status: NEEDS_EMPTYING 🔴
```

### Test Environmental Query (Mistral AI)

```bash
curl -X POST http://localhost:5000/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the benefits of recycling?"}'
```

**Expected Response:**
```json
{
  "response": "Recycling offers numerous environmental benefits:\n\n1. **Resource Conservation**: Reduces the need for extracting raw materials\n2. **Energy Savings**: Uses less energy than producing new products\n3. **Landfill Reduction**: Decreases waste sent to landfills\n4. **Pollution Prevention**: Reduces air and water pollution\n5. **Climate Impact**: Lowers greenhouse gas emissions\n\nBy recycling, you're contributing to a more sustainable future! ♻️",
  "timestamp": "2025-11-23T21:50:00.000Z"
}
```

---

## 📊 Mistral AI Features

### Models Available

- **mistral-small-latest** ✅ (Currently used)
  - Fast, affordable
  - Perfect for chatbots
  - $0.20 per 1M tokens

- **mistral-medium-latest**
  - More powerful
  - Better reasoning
  - $2.70 per 1M tokens

- **mistral-large-latest**
  - Most capable
  - Complex queries
  - $8.00 per 1M tokens

### Current Configuration

```javascript
model: 'mistral-small-latest',
temperature: 0.7,
maxTokens: 500
```

---

## 💰 Pricing

### Free Tier
- ✅ $5 free credits on signup
- ✅ No credit card required
- ✅ ~25,000 chatbot queries

### Paid Tier (mistral-small-latest)
- 💰 $0.20 per 1M input tokens
- 💰 $0.60 per 1M output tokens
- 💰 Average: ~$0.0004 per conversation
- 💰 Very affordable for production!

**Example Cost:**
- 1,000 queries/day = $0.40/day = $12/month
- Much cheaper than Gemini Pro!

---

## 🔥 Supported Queries

### Operational (Instant) ⚡

| Query | Response |
|-------|----------|
| "Show all bins" | Lists all bins with status |
| "Which bins are full?" | Shows bins ≥80% full |
| "What's bin1 status?" | Single bin details |
| "Who handles bin2?" | Assigned operator |
| "Report issue with bin3" | Issue reporting guidance |

### Environmental (AI-Powered) 🤖

| Query | Topic |
|-------|-------|
| "Benefits of recycling?" | Recycling advantages |
| "How to reduce waste?" | Waste reduction tips |
| "Tell me about composting" | Composting guide |
| "Environmental tips?" | Green living advice |
| "What can be recycled?" | Recyclable materials |

---

## 📁 Files Changed

### New Files
✅ `aiswo-backend/chatbot/mistral.js` - Mistral AI integration

### Modified Files
✅ `aiswo-backend/.env` - Added MISTRAL_API_KEY
✅ `aiswo-backend/server.js` - Switched from Gemini to Mistral
✅ `aiswo-backend/package.json` - Added @mistralai/mistralai

### Old Files (Can be deleted)
❌ `aiswo-backend/chatbot/gemini.js` - No longer used

---

## 🚀 Production Deployment

### Environment Variables

```bash
# Production .env
MISTRAL_API_KEY=your_production_api_key
OPENWEATHER_API_KEY=your_openweather_key
FIREBASE_DATABASE_URL=your_firebase_url
```

### Rate Limiting (Optional)

Add rate limiting to prevent API abuse:

```javascript
const rateLimit = require('express-rate-limit');

const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: 'Too many requests, please try again later.'
});

app.post('/chatbot/message', chatbotLimiter, async (req, res) => {
  // ... existing code
});
```

---

## 🐛 Troubleshooting

### Issue: "No bins found in the system"

**Solution:** Make sure to fetch bins first:
```bash
curl http://localhost:5000/bins
```
Then try chatbot query again.

### Issue: "Mistral API error"

**Check:**
1. ✅ API key is valid
2. ✅ API key has credits
3. ✅ Internet connection works
4. ✅ No typos in .env file

### Issue: "MISTRAL_API_KEY not set"

**Solution:**
```bash
# Edit .env file
nano aiswo-backend/.env

# Add your key
MISTRAL_API_KEY=your_actual_key_here

# Restart backend
cd aiswo-backend
npm start
```

---

## 📚 API Documentation

### Mistral AI Docs
- Website: https://mistral.ai/
- API Docs: https://docs.mistral.ai/
- Console: https://console.mistral.ai/
- Pricing: https://mistral.ai/pricing/

### Our Chatbot Endpoint

**POST** `/chatbot/message`

**Request:**
```json
{
  "message": "Your question here"
}
```

**Response:**
```json
{
  "response": "Chatbot answer",
  "timestamp": "2025-11-23T21:50:00.000Z"
}
```

---

## ✅ What's Working

✅ Mistral AI integration complete
✅ Operational queries (instant)
✅ Environmental queries (AI-powered)
✅ Bin status monitoring
✅ Operator assignments
✅ Error handling
✅ Conversation context
✅ Cost-effective pricing

---

## 🎯 Next Steps

1. **Get Mistral API key** from https://console.mistral.ai/
2. **Add to .env** file
3. **Test both query types** (operational + environmental)
4. **Monitor usage** in Mistral Console
5. **Adjust rate limits** if needed

---

## 📞 Support

### Mistral AI Support
- Email: support@mistral.ai
- Docs: https://docs.mistral.ai/

### Our System
- Check backend logs: `tail -f /tmp/backend.log`
- Test endpoint: `curl http://localhost:5000/chatbot/message`

---

## 🎉 Success Checklist

- [ ] Mistral AI account created
- [ ] API key obtained
- [ ] API key added to .env
- [ ] Backend restarted
- [ ] Operational queries working
- [ ] Environmental queries working (requires API key)
- [ ] Frontend chatbot widget working

---

**Your chatbot is now powered by Mistral AI! 🚀**

Get your API key from https://console.mistral.ai/ and add it to `.env` to enable environmental queries!
