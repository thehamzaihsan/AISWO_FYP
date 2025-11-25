# 🚀 Vercel Deployment - Quick Start

## Answer to Your Question: How to Deploy Without serviceAccountKey.json?

**serviceAccountKey.json is NOT pushed to GitHub** (for security), but Vercel still needs Firebase credentials. Here's how:

---

## ✅ Solution: Environment Variables

### Step 1: Extract Firebase Credentials

Run this command in your terminal:

```bash
cd aiswo-backend
node extract-firebase-env.js
```

This will output all your Firebase environment variables AND save them to `vercel-env-vars.txt`

### Step 2: Add to Vercel

1. Go to https://vercel.com/dashboard
2. Select your project (AISWO_FYP)
3. Click **Settings** → **Environment Variables**
4. Add these 6 variables:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY_ID`
   - `FIREBASE_PRIVATE_KEY` (the long multi-line key)
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_CLIENT_ID`
   - `FIREBASE_DATABASE_URL`

5. Make sure to set for **Production**, **Preview**, AND **Development**

### Step 3: Deploy

Push your code to GitHub - Vercel will automatically deploy!

```bash
git push origin main
```

Or trigger manual deploy in Vercel dashboard.

---

## 📋 Environment Variables Needed

Copy these from the output of `extract-firebase-env.js`:

```env
FIREBASE_PROJECT_ID=aiswo-simple-697dd
FIREBASE_PRIVATE_KEY_ID=572455aa4e0deb4b4661f48c4d87840745686095
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIE...
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-ayvny@aiswo-simple-697dd.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=109838882885395695871
FIREBASE_DATABASE_URL=https://aiswo-simple-697dd-default-rtdb.asia-southeast1.firebasedatabase.app
```

**Also add your other API keys:**

```env
MISTRAL_API_KEY=your_mistral_api_key
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PORT=5000
```

---

## 🔧 How It Works

Your `server.js` is now smart enough to:

1. **Local Development**: Uses `serviceAccountKey.json` file
2. **Vercel Production**: Uses environment variables

Code automatically detects which environment it's running in!

---

## ⚠️ Important: Private Key Formatting

When pasting `FIREBASE_PRIVATE_KEY` into Vercel:

- **Keep it as ONE line** with `\n` as text (not actual line breaks)
- Should look like: `-----BEGIN PRIVATE KEY-----\nMIIEvQIBAD...\n-----END PRIVATE KEY-----\n`
- Don't add quotes around it in Vercel

---

## ✅ Verification

After deploying, check Vercel logs for:

```
✅ Firebase connected successfully
📊 Project: aiswo-simple-697dd
```

If you see `🌐 Using environment variables for Firebase (Vercel mode)` - you're good!

---

## 📞 Troubleshooting

### "Firebase not configured"
- Check all 6 Firebase variables are set in Vercel
- Make sure they're set for the correct environment (Production)

### "Invalid private key"
- Verify `FIREBASE_PRIVATE_KEY` includes BEGIN and END markers
- Make sure `\n` characters are literal `\n` (not newlines)

### Works locally but not on Vercel
- Check Vercel deployment logs
- Verify environment variables are saved
- Try redeploying

---

## 🎯 Quick Checklist

- [ ] Run `node extract-firebase-env.js`
- [ ] Copy all 6 Firebase variables to Vercel
- [ ] Set for Production, Preview, Development
- [ ] Add MISTRAL_API_KEY and other keys
- [ ] Push to GitHub or redeploy on Vercel
- [ ] Check deployment logs for ✅ Firebase connected
- [ ] Test your API endpoints

---

**Need More Details?** See `VERCEL_DEPLOYMENT_GUIDE.md` for complete documentation.

**Last Updated:** 2025-11-25  
**Status:** ✅ Ready for Vercel Deployment
