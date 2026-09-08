// src/components/departments/DepartmentList.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Building, Edit, Trash2, Search, X, Save } from 'lucide-react';
import api from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';

const DepartmentList = () => {
  const { t } = useLanguage();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    dept_name: '',
    floor_number: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await api.get('departments/');
      const data = response.data.results || response.data || [];
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const submitData = {
        dept_name: formData.dept_name,
        floor_number: parseInt(formData.floor_number)
      };

      if (editingDepartment) {
        await api.put(`departments/${editingDepartment.id}/`, submitData);
        setSuccessMessage(t('departmentUpdated') || 'Department updated successfully!');
      } else {
        await api.post('departments/', submitData);
        setSuccessMessage(t('departmentCreated') || 'Department created successfully!');
      }
      
      await fetchDepartments();
      resetForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving department:', error);
      setError(error.response?.data?.message || 'Failed to save department');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('confirmDelete') || 'Are you sure you want to delete this department?')) {
      try {
        await api.delete(`departments/${id}/`);
        setSuccessMessage(t('departmentDeleted') || 'Department deleted successfully!');
        await fetchDepartments();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting department:', error);
        setError('Failed to delete department. It may have associated doctors.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      dept_name: department.dept_name,
      floor_number: department.floor_number.toString()
    });
    setShowForm(true);
    setError('');
  };

  const resetForm = () => {
    setFormData({
      dept_name: '',
      floor_number: ''
    });
    setEditingDepartment(null);
    setShowForm(false);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredDepartments = departments.filter(dept =>
    dept.dept_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.floor_number.toString().includes(searchTerm)
  );

  if (loading && departments.length === 0) {
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
          <h1 className="text-3xl font-bold gradient-text">{t('departmentManagement') || 'Department Management'}</h1>
          <p className="text-gray-500 mt-2">{t('manageDepartments') || 'Manage hospital departments'}</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2 mt-4 md:mt-0"
        >
          <Plus className="w-5 h-5" />
          {t('addDepartment') || 'Add Department'}
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t('searchDepartments') || 'Search departments by name or floor...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((department) => (
          <div 
            key={department.id} 
            className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{department.dept_name}</h3>
                  <span className="text-sm text-gray-500">
                    {t('floor') || 'Floor'}: {department.floor_number}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(department)}
                  className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                  title={t('edit') || 'Edit'}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(department.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                  title={t('delete') || 'Delete'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="px-2 py-1 bg-primary-50 text-primary-600 rounded-full text-xs">
                {t('totalDoctors')}: {department.doctors?.length || 0}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Building className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-lg">{t('noDepartments') || 'No departments found'}</p>
          <p className="text-sm">{t('addFirstDepartment') || 'Add your first department'}</p>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="btn-primary mt-4 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('addDepartment') || 'Add Department'}
          </button>
        </div>
      )}

      {/* Department Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold gradient-text">
                  {editingDepartment ? (t('editDepartment') || 'Edit Department') : (t('addDepartment') || 'Add Department')}
                </h2>
              </div>
              <button
                onClick={resetForm}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('departmentName') || 'Department Name'} *
                </label>
                <input
                  type="text"
                  name="dept_name"
                  value={formData.dept_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder={t('departmentNamePlaceholder') || 'e.g., Cardiology'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('floorNumber') || 'Floor Number'} *
                </label>
                <input
                  type="number"
                  name="floor_number"
                  value={formData.floor_number}
                  onChange={handleChange}
                  className="input-field"
                  placeholder={t('floorNumberPlaceholder') || 'e.g., 3'}
                  required
                  min="1"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingDepartment ? (t('update') || 'Update') : (t('create') || 'Create')}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  {t('cancel') || 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentList;