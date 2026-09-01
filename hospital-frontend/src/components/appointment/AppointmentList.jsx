// src/components/appointments/AppointmentList.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, UserMd, X, Check, MoreVertical } from 'lucide-react';
import api from '../../api/axios';

const AppointmentList = ({ limit }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('appointments/');
      const data = limit ? response.data.slice(0, limit) : response.data;
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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p>No appointments scheduled</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(appointment.status)}`}>
                  {appointment.status}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(appointment.appointment_date).toLocaleDateString()}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(appointment.appointment_date).toLocaleTimeString()}
                </span>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4 text-primary-500" />
                  <span className="font-medium">{appointment.patient_name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <UserMd className="w-4 h-4 text-accent-500" />
                  <span>{appointment.doctor_name}</span>
                </div>
              </div>

              {appointment.notes && (
                <p className="text-sm text-gray-500 line-clamp-2">{appointment.notes}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {appointment.status === 'scheduled' && (
                <>
                  <button className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppointmentList;