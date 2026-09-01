// src/components/appointments/AppointmentForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, User, Stethoscope, FileText, X } from 'lucide-react';
import api from '../../api/axios';

const AppointmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    appointment_date: '',
    appointment_time: '',
    status: 'scheduled',
    notes: '',
  });

  useEffect(() => {
    fetchData();
    if (id) {
      fetchAppointment();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        api.get('patients/'),
        api.get('doctors/'),
      ]);
      setPatients(patientsRes.data.results || patientsRes.data);
      setDoctors(doctorsRes.data.results || doctorsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchAppointment = async () => {
    try {
      const response = await api.get(`appointments/${id}/`);
      const data = response.data;
      setFormData({
        ...data,
        appointment_date: data.appointment_date?.split('T')[0] || '',
        appointment_time: data.appointment_date?.split('T')[1]?.slice(0, 5) || '',
      });
    } catch (error) {
      console.error('Error fetching appointment:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const submitData = {
      ...formData,
      appointment_date: `${formData.appointment_date}T${formData.appointment_time}:00`,
    };

    try {
      if (id) {
        await api.put(`appointments/${id}/`, submitData);
      } else {
        await api.post('appointments/', submitData);
      }
      navigate('/appointments');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save appointment');
      console.error('Error saving appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="glass-card rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold gradient-text">
            {id ? 'Edit Appointment' : 'Schedule Appointment'}
          </h1>
          <button
            onClick={() => navigate('/appointments')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" /> Patient
            </label>
            <select
              name="patient"
              value={formData.patient}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Stethoscope className="w-4 h-4 inline mr-1" /> Doctor
            </label>
            <select
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" /> Date
              </label>
              <input
                type="date"
                name="appointment_date"
                value={formData.appointment_date}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" /> Time
              </label>
              <input
                type="time"
                name="appointment_time"
                value={formData.appointment_time}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="w-4 h-4 inline mr-1" /> Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input-field"
              rows="4"
              placeholder="Additional notes or special requirements..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                {id ? 'Update Appointment' : 'Schedule Appointment'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;