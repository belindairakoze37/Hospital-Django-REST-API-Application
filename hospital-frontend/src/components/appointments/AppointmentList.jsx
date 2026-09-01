// src/components/appointments/AppointmentList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Stethoscope, X, Check, MoreVertical, Plus, Filter, Search } from 'lucide-react';
import api from '../../api/axios';

const AppointmentList = ({ limit }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('appointments/');
      let data = response.data.results || response.data;
      if (limit) {
        data = data.slice(0, limit);
      }
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: 'badge-scheduled',
      completed: 'badge-completed',
      cancelled: 'badge-cancelled',
    };
    return badges[status] || 'badge-scheduled';
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.patch(`appointments/${id}/cancel/`);
        fetchAppointments();
      } catch (error) {
        console.error('Error cancelling appointment:', error);
      }
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.patch(`appointments/${id}/complete/`);
      fetchAppointments();
    } catch (error) {
      console.error('Error completing appointment:', error);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    const matchesStatus = filter === 'all' || app.status === filter;
    const matchesSearch = 
      (app.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.doctor_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filter - Only show if not limited */}
      {!limit && (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field w-40"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={() => navigate('/appointments/new')}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredAppointments.map((appointment) => (
          <div
            key={appointment.id}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(appointment.status)}`}>
                    {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || 'Unknown'}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString() : 'N/A'}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4 text-primary-500" />
                    <span className="font-medium">{appointment.patient_name || 'Unknown Patient'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Stethoscope className="w-4 h-4 text-accent-500" />
                    <span>{appointment.doctor_name || 'Unknown Doctor'}</span>
                  </div>
                </div>

                {appointment.notes && (
                  <p className="text-sm text-gray-500">{appointment.notes}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {appointment.status === 'scheduled' && (
                  <>
                    <button
                      onClick={() => handleComplete(appointment.id)}
                      className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                      title="Mark as completed"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                      title="Cancel appointment"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => navigate(`/appointments/edit/${appointment.id}`)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-lg">No appointments found</p>
          <p className="text-sm">Schedule your first appointment</p>
        </div>
      )}
    </div>
  );
};

export default AppointmentList;