import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">♻️</div>
              <div>
                <h3>Smart Bin Monitoring</h3>
                <p>Revolutionizing waste management with intelligent monitoring</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/weather">Weather Forecast</Link></li>
              <li><Link to="/admin">Admin Panel</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div className="footer-features">
            <h4>Features</h4>
            <ul>
              <li>Real-time Monitoring</li>
              <li>Weather Integration</li>
              <li>AI Assistant</li>
              <li>Smart Alerts</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-contact">
            <h4>Contact</h4>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <span>m.charaghyousafkhan@gmail.com</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📱</span>
                <span>+92 316-1512718</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>Bahria University, Islamabad</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; {currentYear} Smart Bin Monitoring System. All rights reserved.</p>
            </div>
            <div className="footer-social">
              <button className="social-link" aria-label="Facebook">
                <span>📘</span>
              </button>
              <button className="social-link" aria-label="Twitter">
                <span>🐦</span>
              </button>
              <button className="social-link" aria-label="LinkedIn">
                <span>💼</span>
              </button>
              <button className="social-link" aria-label="Instagram">
                <span>📷</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

