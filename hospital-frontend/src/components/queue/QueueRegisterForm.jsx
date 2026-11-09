// src/components/queue/QueueRegisterForm.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import api from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';
import { apiErrorKey } from '../../i18n/apiErrors';

const QueueRegisterForm = ({ departments = [], onClose, onRegistered, inline = false }) => {
  const { t, formatDateTime, localizeDepartment } = useLanguage();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({
    patient: '',
    department: '',
    appointment: '',
    priority: '0',
    reason_for_visit: '',
    room_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState('');

  const fetchPatients = async () => {
    try {
      const response = await api.get('patients/');
      const data = response.data.results || response.data;
      setPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!form.patient) {
        setAppointments([]);
        return;
      }
      try {
        const response = await api.get(`appointments/?patient=${form.patient}`);
        const data = response.data.results || response.data;
        setAppointments(data.filter((appointment) => appointment.status === 'scheduled'));
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setAppointments([]);
      }
    };
    loadAppointments();
  }, [form.patient]);

  const selectedDepartment = useMemo(
    () => departments.find((department) => String(department.id) === String(form.department)),
    [departments, form.department]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorKey('');

    if (!form.patient || !form.department) {
      setErrorKey('selectPatientAndDepartment');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        patient: Number(form.patient),
        department: Number(form.department),
        priority: Number(form.priority),
        is_emergency: form.priority === '2',
        reason_for_visit: form.reason_for_visit,
        room_number: form.room_number,
      };
      if (form.appointment) {
        payload.appointment = Number(form.appointment);
      }
      const response = await api.post('queue/register/', payload);
      onRegistered(response.data);
    } catch (err) {
      setErrorKey(apiErrorKey(err.response?.data?.code) || 'queueRegistrationFailed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={
        inline
          ? 'w-full'
          : 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
      }
    >
      <div
        className={
          inline
            ? 'glass-card w-full rounded-2xl p-5 sm:p-6'
            : 'glass-card w-full max-w-lg rounded-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto'
        }
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary-500" />
            {t('newQueueTicket')}
          </h2>
          {onClose && (
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {errorKey && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{t(errorKey)}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient')}</label>
            <select name="patient" value={form.patient} onChange={handleChange} className="input-field">
              <option value="">{t('selectPatient')}</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name} — {patient.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('department')}</label>
            <select name="department" value={form.department} onChange={handleChange} className="input-field">
              <option value="">{t('selectDepartment')}</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {localizeDepartment(department)}
                </option>
              ))}
            </select>
          </div>

          {appointments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('appointmentOptional')}
              </label>
              <select name="appointment" value={form.appointment} onChange={handleChange} className="input-field">
                <option value="">{t('none')}</option>
                {appointments.map((appointment) => (
                  <option key={appointment.id} value={appointment.id}>
                    {formatDateTime(appointment.appointment_date)} — {appointment.doctor_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('priority')}</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="input-field">
                <option value="0">{t('normal')}</option>
                <option value="1">{t('urgent')}</option>
                <option value="2">{t('emergency')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('roomNumber')}</label>
              <input
                type="text"
                name="room_number"
                value={form.room_number}
                onChange={handleChange}
                placeholder={
                  selectedDepartment ? localizeDepartment(selectedDepartment) : t('roomNumberPlaceholder')
                }
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('reasonForVisit')}
            </label>
            <textarea
              name="reason_for_visit"
              value={form.reason_for_visit}
              onChange={handleChange}
              rows={3}
              className="input-field"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {onClose && (
              <button type="button" onClick={onClose} className="btn-secondary text-sm">
                {t('cancel')}
              </button>
            )}
            <button type="submit" disabled={loading} className="btn-primary text-sm disabled:opacity-60">
              {loading ? t('saving') : t('registerToQueue')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QueueRegisterForm;
