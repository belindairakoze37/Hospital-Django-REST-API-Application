// src/App.jsx
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from 'react-router-dom';
import { Ticket } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Home from './components/home';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import PatientList from './components/patients/PatientList';
import DoctorList from './components/doctors/DoctorList';
import AppointmentList from './components/appointments/AppointmentList';
import AppointmentForm from './components/appointments/AppointmentForm';
import Sidebar from './components/common/Sidebar';
import LoadingSpinner from './components/common/LoadingSpinner';
import DepartmentList from './components/departments/DepartmentList';
import Settings from './components/settings/Settings';
import Notifications from './components/notifications/Notifications';
import QueueDashboard from './components/queue/QueueDashboard';
import MyTicket from './components/queue/MyTicket';
import QueueDisplayBoard from './components/queue/QueueDisplayBoard';
import QueueRegister from './components/queue/QueueRegister';
import PublicAppointmentBook from './components/appointments/PublicAppointmentBook';
import Terms from './components/public/Terms';
import Privacy from './components/public/Privacy';
import Support from './components/public/Support';
import Help from './components/public/Help';
import './styles/index.css';

const PAGE_TITLE_KEYS = {
  '/': 'pageTitleHome',
  '/login': 'pageTitleLogin',
  '/terms': 'pageTitleTerms',
  '/privacy': 'pageTitlePrivacy',
  '/support': 'pageTitleSupport',
  '/help': 'pageTitleHelp',
  '/book-appointment': 'pageTitleBookAppointment',
  '/queue/register': 'pageTitleQueueRegister',
  '/queue/display': 'pageTitleQueueDisplay',
  '/queue-display': 'pageTitleQueueDisplay',
  '/dashboard': 'pageTitleDashboard',
};

// Scrolls to the top (or to the hash target) and sets the page title on navigation.
const RouteEffects = () => {
  const { pathname, hash } = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    if (hash) {
      const scrollToTarget = () => {
        const target = document.querySelector(hash);
        if (!target) return false;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      };

      // On the very first paint the section may not exist (or may still be
      // laying out), so retry once on the next frame before giving up.
      let cancelled = false;
      const frame = window.requestAnimationFrame(() => {
        if (cancelled) return;
        if (!scrollToTarget()) window.setTimeout(scrollToTarget, 150);
      });

      return () => {
        cancelled = true;
        window.cancelAnimationFrame(frame);
      };
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    return undefined;
  }, [pathname, hash]);

  useEffect(() => {
    const key = PAGE_TITLE_KEYS[pathname];
    document.title = key ? t(key) : 'QueueCare';
  }, [pathname, t]);

  return null;
};


// Protected Route - requires authentication
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route - redirects to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Layout with Sidebar
const DashboardLayout = ({ children }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8 lg:pb-28 pt-20 lg:pt-8">
          {children}
        </div>
      </main>

      {/* Quick access to the public walk-in registration kiosk */}
      <Link
        to="/queue/register"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-primary-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/30"
      >
        <Ticket className="w-5 h-5" aria-hidden="true" />
        {t('homeQueueCardCta')}
      </Link>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <div className="min-h-screen">
            <RouteEffects />
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/" 
                element={
                  <PublicRoute>
                    <Home />
                  </PublicRoute>
                } 
              />

              <Route
  path="/departments"
  element={
    <PrivateRoute>
      <DashboardLayout>
        <DepartmentList />
      </DashboardLayout>
    </PrivateRoute>
  }
/>
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />

              {/* Public kiosk routes - no account or sidebar needed */}
              <Route path="/queue/register" element={<QueueRegister />} />
              <Route path="/book-appointment" element={<PublicAppointmentBook />} />
              <Route path="/queue/display" element={<QueueDisplayBoard />} />
              <Route path="/queue-display" element={<Navigate to="/queue/display" replace />} />

              {/* Public information pages - readable with or without an account */}
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/support" element={<Support />} />
              <Route path="/help" element={<Help />} />
              
              {/* Private Routes with Sidebar */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/patients"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <PatientList />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctors"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <DoctorList />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/appointments"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <AppointmentList />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/appointments/new"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <AppointmentForm />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/appointments/edit/:id"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <AppointmentForm />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <Settings />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <Notifications />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/queue"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <QueueDashboard />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/queue/my-ticket"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <MyTicket />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              
              {/* Catch all - redirect to home */}              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;