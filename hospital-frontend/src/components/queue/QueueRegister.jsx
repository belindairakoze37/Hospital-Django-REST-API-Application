// src/components/queue/QueueRegister.jsx
// Public kiosk page: anyone can take a queue number without an account.
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Heart,
  Loader2,
  Mail,
  Printer,
  Ticket,
  UserPlus,
} from 'lucide-react';
import api from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';
import { apiErrorKey } from '../../i18n/apiErrors';

const EMPTY_FORM = {
  patient_name: '',
  phone_number: '',
  email: '',
  department: '',
  priority: '0',
  room_number: '',
  reason_for_visit: '',
};

// Returns a translation key so the message follows the active language.
const getErrorKey = (error) => {
  const data = error.response?.data;
  if (!data) return 'kioskConnectionError';
  const translatedKey = apiErrorKey(data.code);
  if (translatedKey) return translatedKey;
  return 'kioskRegisterFailed';
};

const QueueRegister = () => {
  const { t, localizeDepartment } = useLanguage();
  const priorities = [
    { value: '0', label: t('normal'), hint: t('kioskPriorityNormalHint') },
    { value: '1', label: t('urgent'), hint: t('kioskPriorityUrgentHint') },
    { value: '2', label: t('emergency'), hint: t('kioskPriorityEmergencyHint') },
  ];
  const [form, setForm] = useState(EMPTY_FORM);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('departments/');
        setDepartments(response.data.results || response.data);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('kioskLoadDepartmentsError');
      } finally {
        setLoadingDepartments(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const name = form.patient_name.trim();
    const phone = form.phone_number.trim();
    const email = form.email.trim();

    if (!name) {
      setError('kioskValidationName');
      return;
    }
    if (!phone) {
      setError('kioskValidationPhone');
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('kioskValidationEmail');
      return;
    }
    if (!form.department) {
      setError('kioskValidationDepartment');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('queue/register/', {
        patient_name: name,
        phone_number: phone,
        email,
        department: Number(form.department),
        priority: Number(form.priority),
        room_number: form.room_number.trim(),
        reason_for_visit: form.reason_for_visit.trim(),
      });
      setTicket(response.data);
    } catch (err) {
      console.error('Queue registration failed:', err);
      setError(getErrorKey(err));
    } finally {
      setSubmitting(false);
    }
  };

  const registerAnother = () => {
    setTicket(null);
    setError('');
    setForm(EMPTY_FORM);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 overflow-hidden">
      {/* Soft decorative background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-primary-300/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-accent-300/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-6 sm:px-6 sm:py-10">
        {/* Kiosk header */}
        <header className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3 min-w-0" aria-label={t('homeAria')}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 shadow-lg shadow-primary-500/25">
              <Heart className="h-6 w-6 text-white" aria-hidden="true" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block text-lg font-bold text-primary-600">{t('appName')}</span>
              <span className="block truncate text-xs text-gray-500">{t('kioskWalkInRegistration')}</span>
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white/80 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 backdrop-blur transition hover:bg-white hover:text-primary-600"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('backToHome')}
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center py-8 sm:py-12">
          {ticket ? (
            <TicketCard ticket={ticket} onRegisterAnother={registerAnother} />
          ) : (
            <div className="w-full max-w-2xl">
              <div className="mb-6 text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-600 ring-1 ring-primary-100">
                  <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('noAccountNeeded')}
                </span>
                <h1 className="mt-3 text-3xl font-black leading-tight gradient-text sm:text-4xl">
                  {t('kioskQueueTitle')}
                </h1>
                <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 sm:text-base">
                  {t('kioskQueueSubtitle')}
                </p>
              </div>

              <div className="glass-card rounded-3xl p-5 shadow-xl shadow-primary-900/5 sm:p-8">
                {error && (
                  <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{t(error)}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="patient_name" className="mb-1.5 block text-sm font-medium text-gray-700">
                        {t('kioskFullName')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="patient_name"
                        name="patient_name"
                        type="text"
                        autoComplete="name"
                        value={form.patient_name}
                        onChange={handleChange}
                        placeholder={t('kioskNamePlaceholder')}
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="phone_number" className="mb-1.5 block text-sm font-medium text-gray-700">
                        {t('phoneNumber')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="phone_number"
                        name="phone_number"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={form.phone_number}
                        onChange={handleChange}
                        placeholder={t('kioskPhonePlaceholder')}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                      {t('kioskEmailAddress')}{' '}
                      <span className="text-gray-400 font-normal">{t('kioskOptional')}</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder={t('kioskEmailPlaceholder')}
                      className="input-field"
                    />
                    <p className="mt-1.5 text-xs text-gray-500">{t('kioskEmailHint')}</p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="department" className="mb-1.5 block text-sm font-medium text-gray-700">
                        {t('department')} <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="department"
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        className="input-field"
                        disabled={loadingDepartments}
                        required
                      >
                        <option value="">
                          {loadingDepartments ? t('kioskLoadingDepartments') : t('selectDepartment')}
                        </option>
                        {departments.map((department) => (
                          <option key={department.id} value={department.id}>
                            {localizeDepartment(department)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="priority" className="mb-1.5 block text-sm font-medium text-gray-700">
                        {t('priority')}
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={form.priority}
                        onChange={handleChange}
                        className="input-field"
                      >
                        {priorities.map((priority) => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label} — {priority.hint}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="room_number" className="mb-1.5 block text-sm font-medium text-gray-700">
                      {t('roomNumber')}{' '}
                      <span className="text-xs font-normal text-gray-400">{t('kioskOptional')}</span>
                    </label>
                    <input
                      id="room_number"
                      name="room_number"
                      type="text"
                      value={form.room_number}
                      onChange={handleChange}
                      placeholder={t('kioskRoomPlaceholder')}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label htmlFor="reason_for_visit" className="mb-1.5 block text-sm font-medium text-gray-700">
                      {t('reasonForVisit')}{' '}
                      <span className="text-xs font-normal text-gray-400">{t('kioskOptional')}</span>
                    </label>
                    <textarea
                      id="reason_for_visit"
                      name="reason_for_visit"
                      value={form.reason_for_visit}
                      onChange={handleChange}
                      rows={3}
                      placeholder={t('kioskReasonPlaceholder')}
                      className="input-field resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                        {t('kioskSubmitting')}
                      </>
                    ) : (
                      <>
                        <Ticket className="h-5 w-5" aria-hidden="true" />
                        {t('kioskSubmit')}
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-500">{t('kioskPrivacyNote')}</p>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Loading overlay while submitting */}
      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 p-4 backdrop-blur-sm">
          <div className="glass-card flex flex-col items-center gap-4 rounded-3xl px-10 py-8 text-center shadow-2xl">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-accent-500">
              <Loader2 className="h-8 w-8 animate-spin text-white" aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-semibold text-gray-800">{t('kioskCreatingTitle')}</p>
              <p className="mt-1 text-sm text-gray-500">{t('kioskCreatingHint')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TicketCard = ({ ticket, onRegisterAnother }) => {
  const { t } = useLanguage();
  const priority = ticket.priority ?? 0;
  const priorityLabels = [t('normal'), t('urgent'), t('emergency')];
  const priorityLabel = priorityLabels[priority] || t('normal');

  return (
    <div className="w-full max-w-xl">
      <div className="glass-card overflow-hidden rounded-3xl shadow-2xl shadow-primary-900/10">
        {/* Ticket header */}
        <div className="relative bg-gradient-to-r from-primary-500 to-accent-500 px-6 py-5 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm font-semibold uppercase tracking-wider">
                {t('kioskTicketBadge')}
              </span>
            </div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              {priorityLabel}
            </span>
          </div>
          <p className="mt-3 text-sm text-white/85">{ticket.department_name}</p>
        </div>

        {/* Perforation */}
        <div className="relative border-b-2 border-dashed border-gray-200">
          <span className="absolute -left-3 -bottom-3 h-6 w-6 rounded-full bg-primary-50" aria-hidden="true" />
          <span className="absolute -right-3 -bottom-3 h-6 w-6 rounded-full bg-accent-50" aria-hidden="true" />
        </div>

        <div className="px-6 py-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-7 w-7 text-green-600" aria-hidden="true" />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            {t('kioskQueueNumberLabel')}
          </p>
          <p className="my-2 text-7xl font-black leading-none gradient-text sm:text-8xl">
            {ticket.queue_number}
          </p>
          <p className="text-sm text-gray-500">{t('kioskTicketHint')}</p>

          <div className="mt-7 grid grid-cols-3 gap-3 text-left">
            <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-gray-100">
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                {t('nowServing')}
              </p>
              <p className="mt-1 text-xl font-bold text-gray-800">
                {ticket.now_serving || '—'}
              </p>
            </div>
            <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-gray-100">
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                {t('kioskYourPosition')}
              </p>
              <p className="mt-1 text-xl font-bold text-gray-800">
                {ticket.position_in_queue ?? '—'}
              </p>
            </div>
            <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-gray-100">
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                {t('kioskEstWait')}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xl font-bold text-gray-800">
                <Clock className="h-4 w-4 text-primary-500" aria-hidden="true" />
                {ticket.estimated_wait_minutes ?? 0}
                <span className="text-xs font-medium text-gray-400">{t('minutesShort')}</span>
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-gray-50 px-4 py-3 text-left text-sm text-gray-600">
            <p>
              <span className="font-semibold text-gray-800">{ticket.patient_name}</span>
              {ticket.phone_number ? <span className="text-gray-400"> · {ticket.phone_number}</span> : null}
            </p>
            {ticket.email ? (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-primary-600">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                {t('kioskEmailWillNotify', { email: ticket.email })}
              </p>
            ) : null}
            {ticket.now_serving_room ? (
              <p className="mt-1 text-xs text-gray-500">
                {t('kioskNowServingRoom', { room: ticket.now_serving_room })}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-5 sm:flex-row">
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-secondary flex flex-1 items-center justify-center gap-2 text-sm"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            {t('kioskPrintTicket')}
          </button>
          <button
            type="button"
            onClick={onRegisterAnother}
            className="btn-primary flex flex-1 items-center justify-center gap-2 text-sm"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            {t('kioskRegisterAnother')}
          </button>
        </div>
      </div>

      <div className="mt-5 text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-600">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('backToHome')}
        </Link>
      </div>
    </div>
  );
};

export default QueueRegister;
