// src/components/doctors/DoctorForm.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Stethoscope } from 'lucide-react';
import api from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';

const DoctorForm = ({ doctor, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    first_name: doctor?.first_name || '',
    last_name: doctor?.last_name || '',
    specialization: doctor?.specialization || '',
    department: doctor?.department || '',
    email: doctor?.email || '',
    phone: doctor?.phone || '',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('departments/');
      const deptData = response.data.results || response.data;
      setDepartments(deptData);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (doctor) {
        await api.put(`doctors/${doctor.id}/`, formData);
      } else {
        await api.post('doctors/', formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving doctor:', error);
      setError(error.response?.data?.message || 'Failed to save doctor');
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
      <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold gradient-text">
              {doctor ? t('editDoctor') : t('addDoctor')}
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
              {t('specialization')} *
            </label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="input-field"
              placeholder={t('specializationPlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('department')} *
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">{t('selectDepartment')}</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.dept_name} - {t('floor')} {dept.floor_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('email')} *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="doctor@hospital.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('phoneNumber')}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
              placeholder={t('phonePlaceholder')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {doctor ? t('updateDoctor') : t('createDoctor')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorForm;