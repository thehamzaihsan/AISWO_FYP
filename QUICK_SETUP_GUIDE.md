# 🚀 AISWO Quick Setup Guide

## ✅ Current Status

Your project is **partially running**:
- ✅ **Backend Server**: Running on `http://localhost:5000` (demo mode)
- ✅ **Frontend Server**: Running on `http://localhost:3000`
- ✅ **Email Alerts**: Working (Gmail configured)
- ⚠️ **Firebase**: Not configured (using dummy data)
- ⚠️ **Weather Alerts**: API key needed
- ⚠️ **Chatbot**: API key needed
- ⚠️ **Push Notifications**: Requires Firebase setup

---

## 🔧 What You Need to Do

### Option 1: Quick Demo (5 minutes)
**Just want to see it work?** You're already there! 
- Open `http://localhost:3000` in your browser
- The system works with dummy data
- Email alerts are functional
- No additional setup needed for basic demo

### Option 2: Full Setup (30-45 minutes)
**Want all features working?** Follow the steps below:

---

## 📋 Step-by-Step Full Setup

### 1️⃣ Firebase Setup (15-20 minutes)

#### A. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** or **"Add project"**
3. Enter project name: `aiswo-simple` (or any name you prefer)
4. Enable Google Analytics (optional)
5. Click **"Create project"**

#### B. Enable Required Services

**Realtime Database:**
1. In Firebase Console, go to **"Realtime Database"**
2. Click **"Create Database"**
3. Choose **"Start in test mode"** (for development)
4. Select location: **Asia-Southeast1** (or closest to you)
5. Click **"Enable"**
6. Note the database URL (looks like: `https://your-project.firebaseio.com`)

**Firestore Database:**
1. Go to **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"**
4. Select the **same location** as Realtime Database
5. Click **"Enable"**

**Cloud Messaging (for Push Notifications):**
1. Go to **"Project Settings"** (gear icon) → **"Cloud Messaging"** tab
2. Note your **Sender ID** and **Server Key**

#### C. Get Service Account Key (Backend)
1. Go to **"Project Settings"** → **"Service accounts"** tab
2. Click **"Generate new private key"**
3. Click **"Generate key"** (downloads a JSON file)
4. Rename the file to `serviceAccountKey.json`
5. Move it to the `aiswo-backend` folder

#### D. Get Web App Configuration (Frontend)
1. Go to **"Project Settings"** → **"General"** tab
2. Scroll down to **"Your apps"** section
3. If you don't have a web app, click the **"</>"** (web) icon to add one
4. Register the app with a nickname (e.g., "AISWO Web")
5. Copy the configuration object (looks like this):
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     databaseURL: "https://your-project.firebaseio.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

#### E. Configure Frontend .env
1. In the `aiswo_frontend` folder, copy `.env.example` to `.env`:
   ```powershell
   copy .env.example .env
   ```
2. Open `.env` and fill in the values from your Firebase config:
   ```env
   REACT_APP_FIREBASE_API_KEY=AIzaSy...
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```
3. Save the file

---

### 2️⃣ API Keys Setup (10-15 minutes)

#### A. OpenWeather API Key (Weather Alerts)
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a **free account**
3. Navigate to **"API keys"** section
4. Copy your API key (looks like: `f4c33dca360f8875d88a28fbd7cf34e3`)
5. Note: It may take 10-30 minutes to activate

#### B. Gemini AI API Key (Chatbot)
1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Sign in with your Google account
3. Click **"Create API key"**
4. Copy the generated key (looks like: `AIzaSyD...`)

#### C. Configure Backend .env
1. In the `aiswo-backend` folder, copy `.env.example` to `.env`:
   ```powershell
   copy .env.example .env
   ```
2. Open `.env` and add your API keys:
   ```env
   OPENWEATHER_API_KEY=your_actual_openweather_key
   GEMINI_API_KEY=your_actual_gemini_key
   ```
3. Save the file

---

### 3️⃣ Restart Servers (2 minutes)

After configuration, restart both servers:

1. **Stop both servers** (Press `Ctrl+C` in both terminal windows)

2. **Start Backend:**
   ```powershell
   cd C:\Users\M Charagh Khan\Desktop\FYP_COMPLEATE\AISWO_FYP\aiswo-backend
   node server.js
   ```
   You should see:
   ```
   ✅ Firebase connected successfully
   🚀 Backend running on http://localhost:5000
   ```

3. **Start Frontend** (in a new terminal):
   ```powershell
   cd C:\Users\M Charagh Khan\Desktop\FYP_COMPLEATE\AISWO_FYP\aiswo_frontend
   npm start
   ```

4. Open `http://localhost:3000` in your browser

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Backend shows "✅ Firebase connected successfully"
- [ ] No Firebase errors in backend console
- [ ] Frontend opens without errors
- [ ] Can view bins in dashboard
- [ ] Can add/edit bins in admin panel
- [ ] Can add/edit operators
- [ ] Email alerts sent when bins > 80%
- [ ] Weather forecast displays (if API key added)
- [ ] Chatbot responds (if API key added)
- [ ] Push notifications work (if Firebase FCM configured)

---

## 🆘 Troubleshooting

### Backend shows Firebase errors?
- Check `serviceAccountKey.json` is in `aiswo-backend` folder
- Verify the file is valid JSON
- Make sure Firebase project is active

### Frontend not connecting to Firebase?
- Check `.env` file exists in `aiswo_frontend`
- Verify all `REACT_APP_*` variables are filled
- Restart frontend server after .env changes

### Weather alerts not working?
- Verify `OPENWEATHER_API_KEY` in backend `.env`
- Wait 10-30 minutes after creating the key (activation time)
- Check API key is valid at OpenWeather dashboard

### Chatbot not responding?
- Verify `GEMINI_API_KEY` in backend `.env`
- Check API key is valid at Google AI Studio
- Ensure you haven't exceeded free tier limits

### Email alerts not working?
- Currently configured with hardcoded Gmail credentials
- Check `server.js` lines 120-150 for email configuration
- You may need to update the Gmail credentials

---

## 📚 Additional Resources

- **Firebase Setup**: See `FIREBASE_SETUP_GUIDE.md`
- **API Documentation**: See `README.md` → API Documentation section
- **Project Architecture**: See `DIAGRAMS.md`
- **Full README**: See `README.md`

---

## 🎯 What Each Feature Requires

| Feature | Requires | Status |
|---------|----------|--------|
| Basic Dashboard | Nothing (Demo mode) | ✅ Working |
| Email Alerts | Nothing (Already configured) | ✅ Working |
| Real-time Data Storage | Firebase Setup (Step 1) | ⚠️ Needs Setup |
| Push Notifications | Firebase Setup (Step 1) | ⚠️ Needs Setup |
| Weather Alerts | OpenWeather API (Step 2A) | ⚠️ Needs Setup |
| Chatbot | Gemini AI API (Step 2B) | ⚠️ Needs Setup |
| Admin Dashboard | Firebase Setup (Step 1) | ⚠️ Partial |

---

## 💡 Quick Tips

1. **Start with Demo**: The app works now! Check it out first.
2. **Firebase First**: Set up Firebase for full functionality.
3. **APIs are Optional**: Weather and chatbot are nice-to-have features.
4. **Free Tier**: All services offer free tiers sufficient for development.
5. **Security**: Never commit `.env` files or `serviceAccountKey.json` to git.

---

**Need Help?** Check the console output for specific error messages, or refer to the detailed documentation in the project files.

