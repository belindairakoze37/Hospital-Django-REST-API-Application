// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Home from './components/Home';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import PatientList from './components/patients/PatientList';
import DoctorList from './components/doctors/DoctorList';
import AppointmentList from './components/appointments/AppointmentList';
import AppointmentForm from './components/appointments/AppointmentForm';
import Sidebar from './components/common/Sidebar';
import LoadingSpinner from './components/common/LoadingSpinner';
import Settings from './components/settings/Settings';
import Notifications from './components/notifications/Notifications';
import './styles/index.css';

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
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
};

// ONLY ONE App function - remove any duplicate
function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <div className="min-h-screen">
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
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              
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
              
              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;