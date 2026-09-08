// src/components/doctors/DoctorCard.jsx
import React from 'react';
import { Stethoscope, Mail, Building, Edit, Trash2, Calendar, User, Phone } from 'lucide-react';
import api from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';

const DoctorCard = ({ doctor, onUpdate, onEdit, onDelete }) => {
  const { t } = useLanguage();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete Dr. ${doctor.first_name} ${doctor.last_name}?`)) {
      try {
        await api.delete(`doctors/${doctor.id}/`);
        onUpdate();
      } catch (error) {
        console.error('Error deleting doctor:', error);
        alert('Failed to delete doctor. Please try again.');
      }
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
            {doctor.first_name?.[0] || ''}{doctor.last_name?.[0] || ''}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              Dr. {doctor.first_name} {doctor.last_name}
            </h3>
            <span className="text-xs text-primary-600 font-medium flex items-center gap-1">
              <Stethoscope className="w-3 h-3" />
              {doctor.specialization || 'General'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
            title={t('editUser')}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
            title={t('deleteUser')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Mail className="w-4 h-4 text-purple-500 flex-shrink-0" />
          <span className="truncate">{doctor.email || 'No email'}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Building className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span>{doctor.department_name || 'Department ' + (doctor.department || '')}</span>
        </div>
        {doctor.phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>{doctor.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-500">Member since 2024</span>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;