// src/components/queue/QueueDisplayBoard.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Users } from 'lucide-react';
import api from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';

const QueueDisplayBoard = () => {
  const { t, formatDate, formatTime } = useLanguage();
  const [board, setBoard] = useState([]);
  const [now, setNow] = useState(new Date());

  const fetchBoard = useCallback(async () => {
    try {
      const response = await api.get('queue/status_board/');
      setBoard(response.data);
    } catch (error) {
      console.error('Error fetching display board:', error);
    }
  }, []);

  useEffect(() => {
    fetchBoard();
    const boardInterval = setInterval(fetchBoard, 5000);
    const clockInterval = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearInterval(boardInterval);
      clearInterval(clockInterval);
    };
  }, [fetchBoard]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/queue"
            className="flex items-center gap-2 text-slate-300 hover:text-white text-sm bg-white/5 hover:bg-white/10 px-3 sm:px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('backToQueue')}</span>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">QueueCare</h1>
            <p className="text-xs sm:text-sm text-slate-400">{t('liveQueueStatus')}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl sm:text-4xl font-mono font-bold">
            {formatTime(now)}
          </p>
          <p className="text-sm text-slate-400">{formatDate(now)}</p>
        </div>
      </div>

      {board.length === 0 ? (
        <div className="text-center text-slate-400 py-32 text-xl">{t('noDepartments')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {board.map((entry) => (
            <div
              key={entry.department_id}
              className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-200">{entry.department}</h2>
                {entry.now_serving_room && (
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-slate-300">
                    {t('room')} {entry.now_serving_room}
                  </span>
                )}
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 p-4 sm:p-6 text-center mb-4">
                <p className="text-xs uppercase tracking-widest text-white/80 mb-1">{t('nowServing')}</p>
                <p className="text-5xl sm:text-6xl font-black leading-none">
                  {entry.now_serving || '—'}
                </p>
                {entry.now_serving_patient && (
                  <p className="text-sm text-white/80 mt-2">{entry.now_serving_patient}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-slate-300 mb-3">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {t('waiting')}: {entry.waiting_count}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  ~{entry.estimated_wait_minutes} {t('minutesShort')}
                </span>
              </div>

              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">{t('upcoming')}</p>
              <div className="flex flex-wrap gap-2">
                {entry.upcoming.length > 0 ? (
                  entry.upcoming.map((number) => (
                    <span key={number} className="px-3 py-1.5 rounded-lg bg-white/10 font-semibold">
                      {number}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">{t('noTickets')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-slate-500 text-sm mt-10">{t('displayFooter')}</p>
    </div>
  );
};

export default QueueDisplayBoard;
