// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authcontext';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import PatientList from './components/patients/PatientList';
import DoctorList from './components/doctors/DoctorList';
import AppointmentList from './components/appointments/AppointmentList';
import AppointmentForm from './components/appointments/AppointmentForm';
import Navbar from './components/common/Navbar';
import LoadingSpinner from './components/common/LoadingSpinner';
import './styles/index.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <Navbar />
                  <div className="pt-16">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/patients" element={<PatientList />} />
                      <Route path="/doctors" element={<DoctorList />} />
                      <Route path="/appointments" element={<AppointmentList />} />
                      <Route path="/appointments/new" element={<AppointmentForm />} />
                      <Route path="/appointments/edit/:id" element={<AppointmentForm />} />
                    </Routes>
                  </div>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;