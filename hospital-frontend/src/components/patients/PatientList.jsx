// src/components/patients/PatientList.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, User, Phone, Calendar, Edit, Trash2, Mail } from 'lucide-react';
import api from '../../api/axios';
import PatientForm from './PatientForm';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('patients/');
      // Handle both paginated and non-paginated responses
      const patientData = response.data.results || response.data;
      setPatients(patientData);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await api.delete(`patients/${id}/`);
        setPatients(patients.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Failed to delete patient. Please try again.');
      }
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
          <h1 className="text-3xl font-bold gradient-text">Patients</h1>
          <p className="text-gray-500 mt-2">Manage your patient records</p>
        </div>
        <button
          onClick={() => {
            setEditingPatient(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2 mt-4 md:mt-0"
        >
          <Plus className="w-5 h-5" />
          Add Patient
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search patients by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {/* Patient Grid */}
      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
                    {patient.first_name?.[0] || ''}{patient.last_name?.[0] || ''}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {patient.first_name} {patient.last_name}
                    </h3>
                    <span className="text-xs text-gray-500 capitalize">
                      {patient.gender === 'm' ? 'Male' : patient.gender === 'f' ? 'Female' : 'Other'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingPatient(patient);
                      setShowForm(true);
                    }}
                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                    title="Edit patient"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(patient.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    title="Delete patient"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span className="truncate">{patient.phone || 'N/A'}</span>
                </div>
                {patient.emergency_contact && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="truncate">Emergency: {patient.emergency_contact}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-accent-500 flex-shrink-0" />
                  <span>DOB: {formatDate(patient.date_of_birth)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-500">
                    Registered: {formatDate(patient.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-lg">No patients found</p>
          <p className="text-sm">Try adjusting your search or add a new patient</p>
          <button
            onClick={() => {
              setEditingPatient(null);
              setShowForm(true);
            }}
            className="btn-primary mt-4 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Your First Patient
          </button>
        </div>
      )}

      {/* Patient Form Modal */}
      {showForm && (
        <PatientForm
          patient={editingPatient}
          onClose={() => {
            setShowForm(false);
            setEditingPatient(null);
          }}
          onSuccess={() => {
            fetchPatients();
            setShowForm(false);
            setEditingPatient(null);
          }}
        />
      )}
    </div>
  );
};

export default PatientList;