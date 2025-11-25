import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Recycle, Home, LayoutDashboard, Cloud, Settings, Trash2, MessageSquare, LogOut, LogIn } from "lucide-react";
import { Button } from "./ui/button";

function Navbar({ showChatBot, setShowChatBot, user, onLogout }) {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (isLanding) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/dashboard" className="mr-6 flex items-center space-x-2">
            <Recycle className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Smart Bins</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link to="/" className="text-foreground/60 transition-colors hover:text-foreground/80">
              <Home className="h-4 w-4" />
            </Link>
            <Link to="/dashboard" className="text-foreground/60 transition-colors hover:text-foreground/80">
              <LayoutDashboard className="h-4 w-4" />
            </Link>
            <Link to="/weather" className="text-foreground/60 transition-colors hover:text-foreground/80">
              <Cloud className="h-4 w-4" />
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-foreground/60 transition-colors hover:text-foreground/80">
                <Settings className="h-4 w-4" />
              </Link>
            )}
            {user && user.role !== 'admin' && (
              <Link to="/my-bins" className="text-foreground/60 transition-colors hover:text-foreground/80">
                <Trash2 className="h-4 w-4" />
              </Link>
            )}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {user && (
            <span className="text-sm font-medium">{user.role === 'admin' ? 'Admin' : 'Field Operator'}</span>
          )}

          {user ? (
            <Button variant="ghost" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <Button asChild>
              <Link to="/login"><LogIn className="h-4 w-4 mr-2" />Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
