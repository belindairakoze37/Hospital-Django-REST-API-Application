// src/components/patients/PatientForm.jsx
import React, { useState } from 'react';
import { X, Save, User } from 'lucide-react';
import api from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';

const PatientForm = ({ patient, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    first_name: patient?.first_name || '',
    last_name: patient?.last_name || '',
    date_of_birth: patient?.date_of_birth || '',
    gender: patient?.gender || 'm',
    phone: patient?.phone || '',
    emergency_contact: patient?.emergency_contact || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (patient) {
        await api.put(`patients/${patient.id}/`, formData);
      } else {
        await api.post('patients/', formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving patient:', error);
      setError(error.response?.data?.message || t('errorSavePatient'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-accent-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold gradient-text">
              {patient ? t('editPatient') : t('addPatient')}
            </h2>
          </div>
          <button
            onClick={onClose}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('firstName')} *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('lastName')} *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('dateOfBirth')} *
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('gender')} *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="m">{t('male')}</option>
              <option value="f">{t('female')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('phoneNumber')} *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
              placeholder={t('phonePlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('emergencyContact')}
            </label>
            <input
              type="tel"
              name="emergency_contact"
              value={formData.emergency_contact}
              onChange={handleChange}
              className="input-field"
              placeholder={t('emergencyPlaceholder')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-accent-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {patient ? t('updatePatient') : t('createPatient')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;