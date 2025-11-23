import React, { useEffect, useState } from "react";
import { requestFcmToken } from "./fcm";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
import { 
  Home, 
  LayoutDashboard, 
  Cloud, 
  Settings, 
  Trash2, 
  MessageSquare, 
  LogOut, 
  LogIn,
  Recycle,
  Search
} from "lucide-react";

// Pages
import LandingPage from "./LandingPage";
import BinsList from "./BinsList";
import BinDashboard from "./BinDashboard";
import WeatherForecast from "./WeatherForecast";
import AdminDashboard from "./AdminDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import ChatBot from "./ChatBot";
import Chatbot from "./components/Chatbot"; // New Gemini AI Chatbot
import Footer from "./Footer";
import Login from "./Login";

// Navigation Component
import Navbar from "./components/Navbar";

// 404 Page Component
function NotFound() {
  return (
    <div className="container" style={{ paddingTop: "var(--space-2xl)", textAlign: "center" }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: "var(--space-lg)" }}>
        <Search size={64} color="var(--text-secondary)" />
      </div>
      <h1 style={{ 
        fontSize: "var(--font-size-3xl)", 
        fontWeight: "700", 
        marginBottom: "var(--space-md)",
        color: "var(--text-primary)"
      }}>
        Page Not Found
      </h1>
      <p style={{ 
        fontSize: "var(--font-size-lg)", 
        color: "var(--text-secondary)",
        marginBottom: "var(--space-lg)"
      }}>
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="btn btn-primary">
        ← Back to Home
      </Link>
    </div>
  );
}

function App() {
  const [showChatBot, setShowChatBot] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    requestFcmToken();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    // Store in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Check for existing login on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <div className="App">
      <Router>
        <Navbar showChatBot={showChatBot} setShowChatBot={setShowChatBot} user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Dashboard: All bins list */}
            <Route path="/dashboard" element={<BinsList />} />

            {/* Single bin detail */}
            <Route path="/bin/:id" element={<BinDashboard />} />

            {/* Weather Forecast */}
            <Route path="/weather" element={<WeatherForecast />} />

            {/* Login */}
            <Route path="/login" element={<Login onLogin={handleLogin} />} />

            {/* Admin Dashboard - Protected */}
            <Route 
              path="/admin" 
              element={
                user?.role === 'admin' ? (
                  <AdminDashboard />
                ) : user ? (
                  <Navigate to={user.role === 'admin' ? '/admin' : '/my-bins'} replace />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              } 
            />

            {/* Employee / Operator Dashboard */}
            <Route 
              path="/my-bins" 
              element={
                user
                  ? user.role === 'admin'
                    ? <Navigate to="/admin" replace />
                    : <EmployeeDashboard user={user} />
                  : <Login onLogin={handleLogin} />
              }
            />

            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <Footer />
        
        {/* Old ChatBot */}
        <ChatBot isOpen={showChatBot} onClose={() => setShowChatBot(false)} />
        
        {/* New Gemini AI Chatbot - Floating Widget */}
        <Chatbot />
      </Router>
    </div>
  );
}

export default App;
