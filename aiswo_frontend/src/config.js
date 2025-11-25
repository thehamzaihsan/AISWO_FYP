// API Configuration
// Replace these with your actual API keys

export const API_CONFIG = {
  // Gemini AI API Key for chatbot
  GEMINI_API_KEY: process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyBfQtDjaMbZ-idzA1CEhZe7UczdkJLRcZg',
  
  // OpenWeather API Key for weather forecast
  OPENWEATHER_API_KEY: process.env.REACT_APP_OPENWEATHER_API_KEY || 'f4c33dca360f8875d88a28fbd7cf34e3',
  
  // Backend API URL
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'
};

// Instructions for setting up API keys:
// 1. Create a .env file in the frontend directory
// 2. Add your API keys:
//    REACT_APP_GEMINI_API_KEY=your_actual_gemini_key
//    REACT_APP_OPENWEATHER_API_KEY=your_actual_openweather_key
// 3. Restart the development server

export default API_CONFIG;
