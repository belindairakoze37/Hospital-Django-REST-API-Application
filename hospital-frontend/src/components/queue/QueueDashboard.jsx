// src/components/queue/QueueDashboard.jsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  Megaphone,
  Play,
  CheckCircle,
  XCircle,
  RefreshCw,
  UserPlus,
  Clock,
  Users,
  Monitor,
} from 'lucide-react';
import api from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';
import { apiErrorParams } from '../../i18n/apiErrors';
import QueueRegisterForm from './QueueRegisterForm';

const statusStyles = {
  waiting: 'bg-amber-100 text-amber-700',
  called: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-gray-200 text-gray-600',
};

const stageStyles = {
  registration: 'bg-slate-100 text-slate-700',
  triage: 'bg-cyan-100 text-cyan-700',
  consultation: 'bg-indigo-100 text-indigo-700',
  pharmacy: 'bg-teal-100 text-teal-700',
  payment: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
};

const priorityStyles = {
  0: 'text-gray-500',
  1: 'text-orange-600 font-semibold',
  2: 'text-red-600 font-bold',
};

const QueueDashboard = () => {
  const { t, tStatus, tApiError, localizeDepartment } = useLanguage();
  const [tickets, setTickets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ department: '', status: '' });
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await api.get('departments/');
      setDepartments(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  }, []);

  const fetchBoard = useCallback(async () => {
    try {
      const response = await api.get('queue/status_board/');
      setBoard(response.data);
    } catch (error) {
      console.error('Error fetching queue board:', error);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    const params = {};
    if (filters.department) params.department = filters.department;
    if (filters.status) params.status = filters.status;
    try {
      const response = await api.get('queue/', { params });
      const data = response.data.results || response.data;
      setTickets(data);
    } catch (error) {
      console.error('Error fetching queue tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.department, filters.status]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    fetchBoard();
    const interval = setInterval(() => {
      fetchBoard();
      fetchTickets();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchBoard, fetchTickets]);

  const notify = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const runAction = async (id, request, successMessage) => {
    setBusyId(id);
    try {
      await request();
      notify(successMessage);
      await Promise.all([fetchTickets(), fetchBoard()]);
    } catch (error) {
      const data = error.response?.data;
      notify(tApiError(data?.code, data?.detail, apiErrorParams(data)) || t('queueActionFailed'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const callNextInDepartment = (departmentId) =>
    runAction(
      `department-${departmentId}`,
      () => api.post('queue/call_next/', { department: departmentId }),
      t('patientCalledEmailSent')
    );

  const handleRegistered = () => {
    setShowForm(false);
    notify(t('queueTicketCreated'));
    fetchTickets();
    fetchBoard();
  };

  const waitingCount = tickets.filter((ticket) => ticket.status === 'waiting').length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{t('queueManagement')}</h1>
          <p className="text-gray-500 mt-2">{t('queueSubtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              fetchTickets();
              fetchBoard();
            }}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t('refresh')}
          </button>
          <button
            onClick={() => window.open('/queue/display', '_blank', 'noopener')}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <Monitor className="w-4 h-4" />
            {t('displayBoard')}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {t('registerToQueue')}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm ${
            message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Department boards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {board.map((entry) => (
          <div key={entry.department_id} className="glass-card rounded-2xl p-5 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">{entry.department}</h3>
                <p className="text-xs text-gray-500">
                  {t('waiting')}: {entry.waiting_count} · {t('estimatedWait')}:{' '}
                  {entry.estimated_wait_minutes} {t('minutesShort')}
                </p>
              </div>
              <button
                onClick={() => callNextInDepartment(entry.department_id)}
                disabled={busyId === `department-${entry.department_id}` || entry.waiting_count === 0}
                className="btn-primary text-xs flex items-center gap-1.5 disabled:opacity-40"
              >
                <Megaphone className="w-4 h-4" />
                {t('callNext')}
              </button>
            </div>

            <div className="rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white p-4">
              <p className="text-xs uppercase tracking-wider opacity-80">{t('nowServing')}</p>
              <p className="text-3xl font-bold">
                {entry.now_serving || '—'}
                {entry.now_serving_room ? (
                  <span className="text-sm font-medium ml-2 opacity-90">
                    {t('room')} {entry.now_serving_room}
                  </span>
                ) : null}
              </p>
              {entry.now_serving_patient && (
                <p className="text-xs opacity-80 mt-1">{entry.now_serving_patient}</p>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-4 h-4" />
              {t('upcoming')}:
              {entry.upcoming.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {entry.upcoming.map((number) => (
                    <span key={number} className="px-2 py-0.5 rounded-md bg-white/70 font-semibold">
                      {number}
                    </span>
                  ))}
                </div>
              ) : (
                <span>{t('noTickets')}</span>
              )}
            </div>
          </div>
        ))}
        {board.length === 0 && !loading && (
          <div className="glass-card rounded-2xl p-5 sm:p-6 text-sm text-gray-500">{t('noDepartments')}</div>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3 sm:items-center">
        <select
          value={filters.department}
          onChange={(event) => setFilters((prev) => ({ ...prev, department: event.target.value }))}
          className="input-field sm:max-w-xs"
        >
          <option value="">{t('allDepartments')}</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {localizeDepartment(department)}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          className="input-field sm:max-w-xs"
        >
          <option value="">{t('allStatuses')}</option>
          <option value="waiting">{t('waiting')}</option>
          <option value="called">{t('called')}</option>
          <option value="in_progress">{t('inProgress')}</option>
          <option value="completed">{t('completed')}</option>
          <option value="cancelled">{t('cancelled')}</option>
        </select>
        <div className="flex items-center gap-2 text-sm text-gray-500 sm:ml-auto">
          <Users className="w-4 h-4" />
          {t('totalWaiting')}: <span className="font-semibold text-gray-800">{waitingCount}</span>
        </div>
      </div>

      {/* Ticket table */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-gray-500">{t('noTickets')}</div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">{t('ticketNumber')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('patient')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('source')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('department')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('stage')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('status')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('priority')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('estimatedWait')}</th>
                  <th className="text-right px-4 py-3 font-medium">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-800">{ticket.queue_number}</span>
                      {ticket.is_emergency && (
                        <span className="ml-2 text-[10px] uppercase bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                          {t('emergency')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800">{ticket.patient_name || '—'}</span>
                      {ticket.phone_number ? (
                        <span className="block text-xs text-gray-400">{ticket.phone_number}</span>
                      ) : !ticket.patient ? (
                        <span className="block text-xs text-amber-600">{t('sourceWalkInNoAccount')}</span>
                      ) : null}
                      {ticket.email ? (
                        <span className="block text-xs text-gray-400">{ticket.email}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {ticket.patient ? (
                        <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-700 ring-1 ring-primary-100">
                          {t('sourceRegisteredPatient')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
                          {t('sourceWalkIn')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{ticket.department_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${stageStyles[ticket.current_stage] || ''}`}>
                        {tStatus(ticket.current_stage)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusStyles[ticket.status] || ''}`}>
                        {tStatus(ticket.status)}
                      </span>
                    </td>
                    <td className={`px-4 py-3 ${priorityStyles[ticket.priority] || ''}`}>
                      {ticket.priority === 0 ? t('normal') : ticket.priority === 1 ? t('urgent') : t('emergency')}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {ticket.status === 'waiting'
                        ? `${ticket.estimated_wait_minutes} ${t('minutesShort')}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {ticket.status === 'waiting' && (
                          <button
                            title={t('callNext')}
                            disabled={busyId === ticket.id}
                            onClick={() =>
                              runAction(
                                ticket.id,
                                () => api.post(`queue/${ticket.id}/call_next/`),
                                t('patientCalledEmailSent')
                              )
                            }
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 disabled:opacity-40"
                          >
                            <Megaphone className="w-4 h-4" />
                          </button>
                        )}
                        {(ticket.status === 'waiting' || ticket.status === 'called') && (
                          <button
                            title={t('startService')}
                            disabled={busyId === ticket.id}
                            onClick={() =>
                              runAction(
                                ticket.id,
                                () => api.post(`queue/${ticket.id}/start_service/`, { current_stage: 'consultation' }),
                                t('serviceStarted')
                              )
                            }
                            className="p-2 rounded-lg text-purple-600 hover:bg-purple-50 disabled:opacity-40"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {['waiting', 'called', 'in_progress'].includes(ticket.status) && (
                          <button
                            title={t('completeService')}
                            disabled={busyId === ticket.id}
                            onClick={() =>
                              runAction(
                                ticket.id,
                                () => api.post(`queue/${ticket.id}/complete/`),
                                t('serviceCompleted')
                              )
                            }
                            className="p-2 rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-40"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {['waiting', 'called', 'in_progress'].includes(ticket.status) && (
                          <button
                            title={t('cancelTicket')}
                            disabled={busyId === ticket.id}
                            onClick={() =>
                              runAction(
                                ticket.id,
                                () => api.post(`queue/${ticket.id}/cancel/`),
                                t('ticketCancelled')
                              )
                            }
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-40"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <QueueRegisterForm
          departments={departments}
          onClose={() => setShowForm(false)}
          onRegistered={handleRegistered}
        />
      )}
    </div>
  );
};

export default QueueDashboard;
