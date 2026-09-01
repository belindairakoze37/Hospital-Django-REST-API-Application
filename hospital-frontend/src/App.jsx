// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authcontext';
import Home from './components/home';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import PatientList from './components/patients/PatientList';
import DoctorList from './components/doctors/DoctorList';
import AppointmentList from './components/appointments/AppointmentList';
import AppointmentForm from './components/appointments/AppointmentForm';
import Navbar from './components/common/Navbar';
import LoadingSpinner from './components/common/LoadingSpinner';
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

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen">
          <Routes>
            {/* Public Routes - accessible when NOT logged in */}
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
            
            {/* Private Routes - require authentication */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Navbar />
                  <div className="pt-16">
                    <Dashboard />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/patients"
              element={
                <PrivateRoute>
                  <Navbar />
                  <div className="pt-16">
                    <PatientList />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/doctors"
              element={
                <PrivateRoute>
                  <Navbar />
                  <div className="pt-16">
                    <DoctorList />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <PrivateRoute>
                  <Navbar />
                  <div className="pt-16">
                    <AppointmentList />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/appointments/new"
              element={
                <PrivateRoute>
                  <Navbar />
                  <div className="pt-16">
                    <AppointmentForm />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/appointments/edit/:id"
              element={
                <PrivateRoute>
                  <Navbar />
                  <div className="pt-16">
                    <AppointmentForm />
                  </div>
                </PrivateRoute>
              }
            />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;