// src/components/appointments/PublicAppointmentBook.jsx
// Public kiosk page: book an appointment without an account.
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  Heart,
  Loader2,
  Mail,
  Stethoscope,
} from 'lucide-react';
import api from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';
import { apiErrorKey } from '../../i18n/apiErrors';

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  doctor: '',
  date: '',
  time: '',
  notes: '',
};

// Returns a translation key so the message follows the active language.
const getErrorKey = (error) => {
  const data = error.response?.data;
  if (!data) return 'bookConnectionError';
  return apiErrorKey(data.code) || 'bookFailed';
};

const PublicAppointmentBook = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState(EMPTY_FORM);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('doctors/');
        setDoctors(response.data.results || response.data);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('bookLoadDoctorsError');
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const firstName = form.first_name.trim();
    const lastName = form.last_name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();

    if (!firstName || !lastName) {
      setError('bookValidationName');
      return;
    }
    if (!phone) {
      setError('bookValidationPhone');
      return;
    }
    if (!email) {
      setError('bookValidationEmail');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('bookValidationEmailInvalid');
      return;
    }
    if (!form.doctor) {
      setError('bookValidationDoctor');
      return;
    }
    if (!form.date || !form.time) {
      setError('bookValidationDateTime');
      return;
    }

    setSubmitting(true);
    try {
      // Send an absolute instant so the kiosk's local time survives the
      // server-side timezone conversion.
      const localDateTime = new Date(`${form.date}T${form.time}`);
      const response = await api.post('appointments/public_book/', {
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
        doctor: Number(form.doctor),
        appointment_date: localDateTime.toISOString(),
        notes: form.notes.trim(),
      });
      setAppointment(response.data);
    } catch (err) {
      console.error('Public booking failed:', err);
      setError(getErrorKey(err));
    } finally {
      setSubmitting(false);
    }
  };

  const bookAnother = () => {
    setAppointment(null);
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
              <span className="block truncate text-xs text-gray-500">{t('bookKioskLabel')}</span>
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
          {appointment ? (
            <BookingConfirmation appointment={appointment} onBookAnother={bookAnother} />
          ) : (
            <div className="w-full max-w-2xl">
              <div className="mb-6 text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-600 ring-1 ring-primary-100">
                  <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('noAccountNeeded')}
                </span>
                <h1 className="mt-3 text-3xl font-black leading-tight gradient-text sm:text-4xl">
                  {t('bookTitle')}
                </h1>
                <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 sm:text-base">
                  {t('bookSubtitle')}
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
                      <label htmlFor="first_name" className="mb-1.5 block text-sm font-medium text-gray-700">
                        {t('bookFirstName')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        autoComplete="given-name"
                        value={form.first_name}
                        onChange={handleChange}
                        placeholder={t('bookFirstNamePlaceholder')}
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="last_name" className="mb-1.5 block text-sm font-medium text-gray-700">
                        {t('bookLastName')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        autoComplete="family-name"
                        value={form.last_name}
                        onChange={handleChange}
                        placeholder={t('bookLastNamePlaceholder')}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700">
                      {t('phoneNumber')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder={t('kioskPhonePlaceholder')}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                      {t('bookEmailAddress')} <span className="text-red-500">*</span>
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
                      required
                    />
                    <p className="mt-1.5 text-xs text-gray-500">{t('bookEmailHint')}</p>
                  </div>

                  <div>
                    <label htmlFor="doctor" className="mb-1.5 block text-sm font-medium text-gray-700">
                      {t('doctor')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="doctor"
                      name="doctor"
                      value={form.doctor}
                      onChange={handleChange}
                      className="input-field"
                      disabled={loadingDoctors}
                      required
                    >
                      <option value="">
                        {loadingDoctors ? t('bookLoadingDoctors') : t('selectDoctor')}
                      </option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {t('dr')} {doctor.first_name} {doctor.last_name}
                          {doctor.specialization ? ` — ${doctor.specialization}` : ''}
                          {doctor.department_name ? ` (${doctor.department_name})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="date" className="mb-1.5 block text-sm font-medium text-gray-700">
                        {t('date')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="date"
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={handleChange}
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="time" className="mb-1.5 block text-sm font-medium text-gray-700">
                        {t('time')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="time"
                        name="time"
                        type="time"
                        value={form.time}
                        onChange={handleChange}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-gray-700">
                      {t('reasonForVisit')}{' '}
                      <span className="text-gray-400">{t('kioskOptional')}</span>
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={form.notes}
                      onChange={handleChange}
                      placeholder={t('bookNotesPlaceholder')}
                      className="input-field resize-none"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                        {t('bookSubmitting')}
                      </>
                    ) : (
                      <>
                        <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                        {t('bookSubmit')}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const BookingConfirmation = ({ appointment, onBookAnother }) => {
  const { t, formatDate, formatTime } = useLanguage();
  const date = formatDate(appointment.appointment_date, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const time = formatTime(appointment.appointment_date, { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="w-full max-w-xl">
      <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-2xl shadow-primary-900/10 sm:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-primary-500 to-accent-500"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-primary-200/40 blur-3xl"
        />

        <div className="relative text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30">
            <CheckCircle2 className="h-9 w-9 text-white" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-gray-800 sm:text-3xl">{t('bookSuccessTitle')}</h2>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">{t('bookSuccessHint')}</p>
        </div>

        <dl className="relative mt-8 space-y-4">
          <div className="flex items-start gap-3 rounded-2xl bg-primary-50/70 px-4 py-3">
            <CalendarCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wider text-primary-600">{t('date')}</dt>
              <dd className="truncate text-base font-bold text-gray-800">{date}</dd>
              {time && <dd className="text-sm text-gray-600">{t('bookAt')} {time}</dd>}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-accent-50/70 px-4 py-3">
            <Stethoscope className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wider text-accent-600">{t('doctor')}</dt>
              <dd className="truncate text-base font-bold text-gray-800">{appointment.doctor_name}</dd>
              {appointment.doctor_specialization && (
                <dd className="text-sm text-gray-600">{appointment.doctor_specialization}</dd>
              )}
              {appointment.department_name && (
                <dd className="text-xs text-gray-500">{appointment.department_name}</dd>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-gray-50 px-4 py-3">
            <Heart className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('patient')}</dt>
              <dd className="truncate text-base font-bold text-gray-800">{appointment.patient_name}</dd>
              {appointment.patient_phone && (
                <dd className="text-sm text-gray-600">{appointment.patient_phone}</dd>
              )}
              {appointment.patient_email && (
                <dd className="text-sm text-gray-600">{appointment.patient_email}</dd>
              )}
            </div>
          </div>
        </dl>

        {appointment.patient_email ? (
          <p className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary-50 px-4 py-3 text-xs font-medium text-primary-700">
            <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t('bookEmailSent', { email: appointment.patient_email })}
          </p>
        ) : null}

        <div className="relative mt-8 space-y-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-primary w-full"
          >
            <CalendarPlus className="h-5 w-5" aria-hidden="true" />
            {t('bookPrint')}
          </button>
          <button
            type="button"
            onClick={onBookAnother}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-primary-600 ring-1 ring-primary-200 transition hover:bg-primary-50"
          >
            {t('bookAnother')}
          </button>
          <Link
            to="/"
            className="block text-center text-sm font-medium text-gray-500 transition hover:text-primary-600"
          >
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicAppointmentBook;
