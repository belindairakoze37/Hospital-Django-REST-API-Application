// src/components/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Users, Stethoscope, CalendarCheck, Clock, TrendingUp, Activity } from 'lucide-react';
import api from '../../api/axios';
import StatsCard from './StatsCard';
import AppointmentList from '../appointments/AppointmentList';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    todayAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [patients, doctors, appointments] = await Promise.all([
        api.get('patients/'),
        api.get('doctors/'),
        api.get('appointments/'),
      ]);
      
      const patientsData = patients.data.results || patients.data;
      const doctorsData = doctors.data.results || doctors.data;
      const appointmentsData = appointments.data.results || appointments.data;
      
      const today = new Date().toDateString();
      const todayAppointments = appointmentsData.filter(
        app => app.appointment_date && new Date(app.appointment_date).toDateString() === today
      );

      setStats({
        totalPatients: patientsData.length || 0,
        totalDoctors: doctorsData.length || 0,
        totalAppointments: appointmentsData.length || 0,
        todayAppointments: todayAppointments.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Total Doctors',
      value: stats.totalDoctors,
      icon: Stethoscope,
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: CalendarCheck,
      color: 'from-green-500 to-green-600',
      bg: 'bg-green-50',
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome back! Here's what's happening with your hospital today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Recent Appointments</h2>
            <span className="text-sm text-primary-500 cursor-pointer hover:underline">View All</span>
          </div>
          <AppointmentList limit={5} />
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <button className="w-full btn-primary text-sm flex items-center justify-center gap-2">
              <CalendarCheck className="w-4 h-4" />
              New Appointment
            </button>
            <button className="w-full btn-secondary text-sm flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              Register Patient
            </button>
            <button className="w-full btn-secondary text-sm flex items-center justify-center gap-2">
              <Stethoscope className="w-4 h-4" />
              Add Doctor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;