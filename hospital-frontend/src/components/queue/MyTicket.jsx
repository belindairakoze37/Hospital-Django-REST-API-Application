// src/components/queue/MyTicket.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Clock, MapPin, Users, RefreshCw, XCircle, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';

const STAGES = ['registration', 'triage', 'consultation', 'pharmacy', 'payment', 'completed'];

const statusStyles = {
  waiting: 'bg-amber-100 text-amber-700',
  called: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
};

const MyTicket = () => {
  const { t, tStatus, tApiError } = useLanguage();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTicket = useCallback(async () => {
    try {
      const response = await api.get('queue/my_ticket/');
      setTicket(response.data || null);
      setError('');
    } catch (err) {
      console.error('Error fetching ticket:', err);
      setError(t('queueLoadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchTicket();
    const interval = setInterval(fetchTicket, 10000);
    return () => clearInterval(interval);
  }, [fetchTicket]);

  const cancelTicket = async () => {
    if (!ticket || !window.confirm(t('cancelTicketConfirm'))) return;
    try {
      await api.post(`queue/${ticket.id}/cancel/`);
      setTicket(null);
    } catch (err) {
      const data = err.response?.data;
      setError(tApiError(data?.code, data?.detail) || t('queueActionFailed'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const currentStageIndex = ticket ? STAGES.indexOf(ticket.current_stage) : -1;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{t('myTicket')}</h1>
          <p className="text-gray-500 mt-2">{t('myTicketSubtitle')}</p>
        </div>
        <button onClick={fetchTicket} className="btn-secondary text-sm flex items-center gap-2 self-start md:self-auto">
          <RefreshCw className="w-4 h-4" />
          {t('refresh')}
        </button>
      </div>

      {error && <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

      {!ticket ? (
        <div className="glass-card rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
            <Ticket className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('noActiveTicket')}</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">{t('noActiveTicketHint')}</p>
          <Link to="/queue/register" className="btn-primary text-sm inline-flex mt-6">
            {t('registerNow')}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 sm:p-8 text-center">
            <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">{t('yourTicket')}</p>
            <p className="text-5xl sm:text-6xl font-black gradient-text mb-3">{ticket.queue_number}</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[ticket.status] || 'bg-gray-100 text-gray-700'}`}>
              {tStatus(ticket.status)}
            </span>
            <p className="text-gray-600 mt-4">{ticket.patient_name}</p>
            <p className="text-sm text-gray-500">
              {ticket.department_name}
              {ticket.doctor_name ? ` · ${ticket.doctor_name}` : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card rounded-2xl p-5 sm:p-6 text-center">
              <Users className="w-6 h-6 text-primary-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">
                {ticket.status === 'waiting' ? ticket.position_in_queue : '—'}
              </p>
              <p className="text-xs text-gray-500">{t('positionInQueue')}</p>
            </div>
            <div className="glass-card rounded-2xl p-5 sm:p-6 text-center">
              <Clock className="w-6 h-6 text-accent-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">
                {ticket.estimated_wait_minutes} {t('minutesShort')}
              </p>
              <p className="text-xs text-gray-500">{t('estimatedWait')}</p>
            </div>
            <div className="glass-card rounded-2xl p-5 sm:p-6 text-center">
              <MapPin className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{ticket.room_number || '—'}</p>
              <p className="text-xs text-gray-500">{t('room')}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 sm:p-6">
            <h2 className="font-semibold text-gray-800 mb-4">{t('patientJourney')}</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              {STAGES.map((stage, index) => {
                const isDone = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;
                return (
                  <div
                    key={stage}
                    className={`flex-1 rounded-xl px-3 py-3 text-center text-xs font-medium border ${
                      isDone
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : isCurrent
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500 border-transparent text-white'
                        : 'bg-white/60 border-gray-200 text-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {isDone && <CheckCircle className="w-3.5 h-3.5" />}
                      {tStatus(stage)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {['waiting', 'called'].includes(ticket.status) && (
            <div className="flex justify-end">
              <button
                onClick={cancelTicket}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50"
              >
                <XCircle className="w-4 h-4" />
                {t('cancelTicket')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyTicket;