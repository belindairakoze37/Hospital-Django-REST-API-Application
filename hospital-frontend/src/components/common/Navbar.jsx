// src/components/common/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, LogOut, User, Menu, X, Bell, Settings } from 'lucide-react';
import { useAuth } from '../../context/authcontext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show navbar on home page or login page
  if (location.pathname === '/' || location.pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/patients', label: 'Patients' },
    { path: '/doctors', label: 'Doctors' },
    { path: '/appointments', label: 'Appointments' },
  ];

  return (
    <nav className="glass-card fixed top-0 left-0 right-0 z-50 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-primary-500" />
          <span className="text-2xl font-bold gradient-text">MediCare</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-gray-600 hover:text-primary-500 transition-colors duration-300 font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="hidden md:flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-200 space-y-3 animate-slide-in">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="block px-4 py-2 rounded-lg hover:bg-primary-50 text-gray-600 hover:text-primary-500 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;