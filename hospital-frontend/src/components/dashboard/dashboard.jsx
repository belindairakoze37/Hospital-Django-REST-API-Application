// src/components/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Stethoscope, CalendarCheck, Clock, TrendingUp, Activity, ListOrdered, ArrowRight } from 'lucide-react';
import api from '../../api/axios';
import StatsCard from './StatsCard';
import AppointmentList from '../appointments/AppointmentList';
import { useLanguage } from '../../context/LanguageContext';

const Dashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    todayAppointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [queueBoard, setQueueBoard] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchQueueBoard();
    const queueInterval = setInterval(fetchQueueBoard, 30000);
    return () => clearInterval(queueInterval);
  }, []);

  const fetchQueueBoard = async () => {
    try {
      const response = await api.get('queue/status_board/');
      setQueueBoard(response.data || []);
    } catch (error) {
      console.error('Error fetching queue summary:', error);
    }
  };

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
      title: t('totalPatients'),
      value: stats.totalPatients,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: t('totalDoctors'),
      value: stats.totalDoctors,
      icon: Stethoscope,
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: t('totalAppointments'),
      value: stats.totalAppointments,
      icon: CalendarCheck,
      color: 'from-green-500 to-green-600',
      bg: 'bg-green-50',
    },
    {
      title: t('todayAppointments'),
      value: stats.todayAppointments,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  const totalQueueWaiting = queueBoard.reduce(
    (sum, entry) => sum + (entry.waiting_count || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{t('dashboardTitle')}</h1>
        <p className="text-gray-500 mt-2">{t('dashboardWelcome')} {t('dashboardSubtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">{t('recentAppointments')}</h2>
            <span 
              className="text-sm text-primary-500 cursor-pointer hover:underline"
              onClick={() => navigate('/appointments')}
            >
              {t('viewAll')}
            </span>
          </div>
          <AppointmentList limit={5} />
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">{t('quickActions')}</h2>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/appointments/new')}
                className="w-full btn-primary text-sm flex items-center justify-center gap-2"
              >
                <CalendarCheck className="w-4 h-4" />
                {t('newAppointment')}
              </button>
              <button 
                onClick={() => navigate('/patients')}
                className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                {t('registerPatient')}
              </button>
              <button 
                onClick={() => navigate('/doctors')}
                className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
              >
                <Stethoscope className="w-4 h-4" />
                {t('addDoctor')}
              </button>
            </div>
          </div>

          {/* Queue Summary */}
          <div className="glass-card rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-primary-500" />
                {t('queueSummary')}
              </h2>
              <span className="text-sm font-medium text-gray-500">
                {totalQueueWaiting} {t('waiting')}
              </span>
            </div>

            {queueBoard.length === 0 ? (
              <p className="text-sm text-gray-500">{t('noDepartments')}</p>
            ) : (
              <div className="space-y-2">
                {queueBoard.map((entry) => (
                  <div
                    key={entry.department_id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-gray-600 truncate">{entry.department}</span>
                    <span className="font-semibold text-gray-800 shrink-0">
                      {entry.now_serving || '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate('/queue')}
              className="w-full mt-4 btn-secondary text-sm flex items-center justify-center gap-2"
            >
              {t('viewQueue')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;