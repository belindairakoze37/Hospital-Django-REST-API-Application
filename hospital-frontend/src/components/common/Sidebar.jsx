// src/components/common/Sidebar.jsx - Complete updated version
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Calendar, 
  Settings, 
  Bell, 
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
    { path: '/patients', icon: Users, labelKey: 'patients' },
    { path: '/doctors', icon: Stethoscope, labelKey: 'doctors' },
    { path: '/appointments', icon: Calendar, labelKey: 'appointments' },
    { path: '/departments', icon: Building, labelKey: 'departments' },
    { path: '/notifications', icon: Bell, labelKey: 'notifications' },
    { path: '/settings', icon: Settings, labelKey: 'settings' },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg hover:bg-gray-50 transition-colors"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-white shadow-2xl z-50 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo Section */}
        <div className={`flex items-center gap-3 p-4 border-b border-gray-100 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-xl font-bold gradient-text">{t('appName')}</span>
              <span className="text-xs text-gray-500 block">{t('tagline')}</span>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all duration-300 hidden lg:block"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Close Mobile Button */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary-600'
                }`} />
                {!isCollapsed && (
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : ''}`}>
                    {t(item.labelKey)}
                  </span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {t(item.labelKey)}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section - Logout */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-red-50 text-red-600 hover:text-red-700 w-full ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-medium">{t('logout')}</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {t('logout')}
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Spacer */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'} ml-0`} />
    </>
  );
};

export default Sidebar;