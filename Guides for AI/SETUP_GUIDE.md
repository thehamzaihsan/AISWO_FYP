# AISWO Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase project
- Gmail account with app password
- OpenWeather API key (free tier available)
- Gemini AI API key (free tier available)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/aiswo-fyp.git
cd aiswo-fyp
```

### 2. Backend Setup
```bash
cd aiswo-backend
npm install
```

### 3. Frontend Setup
```bash
cd ../aiswo_frontend
npm install
```

### 4. Firebase Configuration
1. Create Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Realtime Database and Firestore
3. Generate service account key
4. Place `serviceAccountKey.json` in `aiswo-backend` folder

### 5. Environment Variables
Create `.env` file in `aiswo-backend`:
```env
# OpenWeather API Key for weather data and alerts
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Gemini AI API Key for chatbot functionality
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Getting API Keys:

**OpenWeather API Key:**
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to "API keys" section
4. Copy your API key
5. Add it to the `.env` file

**Gemini AI API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the generated key
5. Add it to the `.env` file

**Important Notes:**
- Never commit the `.env` file to version control
- The `.env` file is already included in `.gitignore`
- Keep your API keys secure and don't share them publicly
- Free tier limits apply to both services

**What happens without API keys:**
- **OpenWeather API**: Weather alerts and forecasts will be disabled
- **Gemini API**: Chatbot functionality will be unavailable
- **Core functionality**: Bin monitoring and email alerts will still work

### 6. Start Services
```bash
# Terminal 1 - Backend
cd aiswo-backend
npm start

# Terminal 2 - Frontend
cd aiswo_frontend
npm start
```

### 7. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔧 Detailed Configuration

### Firebase Setup

#### Step 1: Create Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `aiswo-simple`
4. Enable Google Analytics (optional)
5. Click "Create project"

#### Step 2: Enable Realtime Database
1. In Firebase Console, go to "Realtime Database"
2. Click "Create Database"
3. Choose "Start in test mode"
4. Select location: **Asia-Southeast1**
5. Copy the database URL

#### Step 3: Enable Firestore
1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode"
4. Select same location as Realtime Database

#### Step 4: Generate Service Account Key
1. Go to Project Settings (gear icon)
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Rename to `serviceAccountKey.json`
6. Place in `aiswo-backend` folder

### Email Configuration

#### Gmail App Password Setup
1. Enable 2-factor authentication on Gmail
2. Go to Google Account settings
3. Security → App passwords
4. Generate app password for "Mail"
5. Use this password in the configuration

#### Update Email Settings
In `aiswo-backend/server.js`, update:
```javascript
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com",
    pass: "your-app-password"
  }
});
```

### API Keys Setup

#### OpenWeather API
1. Go to [OpenWeather](https://openweathermap.org/api)
2. Sign up for free account
3. Get API key
4. Add to `.env` file

#### Gemini API (Optional)
1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Get API key
3. Add to `.env` file

## 🧪 Testing

### Manual Testing Checklist

#### Backend Testing
- [ ] Server starts without errors
- [ ] Health endpoint responds
- [ ] Bins endpoint returns data
- [ ] Operators endpoint works
- [ ] Email service configured

#### Frontend Testing
- [ ] Application loads
- [ ] Dashboard displays bins
- [ ] Admin dashboard accessible
- [ ] Can add/edit operators
- [ ] Can add/edit bins
- [ ] Weather forecast displays

#### Integration Testing
- [ ] Firebase connection established
- [ ] Data persists between restarts
- [ ] Email alerts sent correctly
- [ ] Weather alerts working
- [ ] Weighted data generation

### API Testing Commands
```bash
# Health check
curl http://localhost:5000/health

# Get all bins
curl http://localhost:5000/bins

# Get all operators
curl http://localhost:5000/operators

# Get statistics
curl http://localhost:5000/stats
```

## 🚨 Troubleshooting

### Common Issues

#### Server Won't Start
- Check if port 5000 is available
- Verify all dependencies installed
- Check for syntax errors in server.js

#### Firebase Connection Failed
- Verify serviceAccountKey.json exists
- Check Firebase project configuration
- Ensure database rules allow read/write

#### Email Not Sending
- Verify Gmail app password
- Check email configuration
- Test with simple email first

#### Frontend Not Loading
- Check if backend is running
- Verify API endpoints accessible
- Check browser console for errors

### Debug Mode
Enable debug logging by adding to server.js:
```javascript
console.log("Debug mode enabled");
```

## 📊 Monitoring

### Log Monitoring
Monitor server logs for:
- Firebase connection status
- Email delivery confirmations
- API request/response times
- Error messages

### Performance Metrics
- Response times
- Memory usage
- Database query performance
- Email delivery rates

## 🔒 Security Considerations

### Development Security
- Use test mode for Firebase
- Don't commit API keys
- Use environment variables
- Enable CORS properly

### Production Security
- Update Firebase security rules
- Use HTTPS
- Implement authentication
- Monitor for suspicious activity
- Regular security updates

## 📈 Scaling Considerations

### Performance Optimization
- Implement caching
- Optimize database queries
- Use CDN for static assets
- Monitor resource usage

### High Availability
- Set up load balancing
- Implement failover mechanisms
- Regular backups
- Monitoring and alerting

## 🆘 Support

### Getting Help
1. Check this documentation
2. Review error logs
3. Test individual components
4. Create GitHub issue
5. Contact development team

### Useful Resources
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://reactjs.org/docs)
- [Node.js Documentation](https://nodejs.org/docs)
- [Express.js Guide](https://expressjs.com/guide)

---

**Happy Coding!** 🚀