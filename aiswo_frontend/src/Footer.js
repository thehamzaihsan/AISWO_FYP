import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Recycle, 
  Mail, 
  Phone, 
  MapPin, 
  LayoutDashboard, 
  Cloud, 
  Settings,
  Facebook,
  Twitter,
  Linkedin,
  Instagram
} from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Recycle className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-white font-bold text-lg">Smart Bin Monitoring</h3>
                <p className="text-sm text-slate-400">Intelligent Waste Management</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Revolutionizing waste management with real-time monitoring and AI-powered insights
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-sm hover:text-green-500 transition-colors flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/weather" className="text-sm hover:text-green-500 transition-colors flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  Weather Forecast
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-sm hover:text-green-500 transition-colors flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Real-time Monitoring
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Weather Integration
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                AI Assistant
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Smart Alerts
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <Mail className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span className="break-all">m.charaghyousafkhan@gmail.com</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Phone className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>+92 316-1512718</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Bahria University, Islamabad</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            &copy; {currentYear} Smart Bin Monitoring System. All rights reserved.
          </p>
          <div className="flex gap-4">
            <button className="text-slate-400 hover:text-green-500 transition-colors" aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </button>
            <button className="text-slate-400 hover:text-green-500 transition-colors" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </button>
            <button className="text-slate-400 hover:text-green-500 transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </button>
            <button className="text-slate-400 hover:text-green-500 transition-colors" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

