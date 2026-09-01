// src/components/doctors/DoctorList.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, Stethoscope, Mail, Building, Edit, Trash2, User } from 'lucide-react';
import api from '../../api/axios';
import DoctorCard from './DoctorCard';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('doctors/');
      const doctorData = response.data.results || response.data;
      setDoctors(doctorData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doctor.specialization || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doctor.department_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Doctors</h1>
          <p className="text-gray-500 mt-2">Manage your medical staff</p>
        </div>
        <button className="btn-primary flex items-center gap-2 mt-4 md:mt-0">
          <Plus className="w-5 h-5" />
          Add Doctor
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search doctors by name, specialization, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} onUpdate={fetchDoctors} />
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Stethoscope className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-lg">No doctors found</p>
          <p className="text-sm">Try adjusting your search</p>
        </div>
      )}
    </div>
  );
};

export default DoctorList;