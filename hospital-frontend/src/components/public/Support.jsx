// src/components/public/Support.jsx
import React, { useState } from 'react';
import { CheckCircle2, Loader2, Mail, MapPin, Phone } from 'lucide-react';
import PublicPage from './PublicPage';
import { SUPPORT_CONTACT } from '../common/PublicFooter';
import api from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

const Support = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [feedback, setFeedback] = useState('');

  const isSubmitting = status === 'loading';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
    if (status === 'error') {
      setStatus('idle');
      setFeedback('');
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      nextErrors.form = t('supportRequired');
    }
    if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) {
      nextErrors.email = t('supportInvalidEmail');
    }
    if (form.message.trim() && form.message.trim().length < 10) {
      nextErrors.message = t('supportMessageTooShort');
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setStatus('idle');
      setFeedback('');
      return;
    }

    setErrors({});
    setStatus('loading');
    setFeedback('');

    try {
      await api.post('support/messages/', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        message: form.message.trim(),
      });
      setStatus('success');
      setFeedback(t('supportSuccess'));
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
      setFeedback(t('supportError'));
    }
  };

  return (
    <PublicPage title={t('supportTitle')} subtitle={t('supportSubtitle')}>
      <section className="qc-public-card">
        <h2 className="qc-section-title">{t('contactInfo')}</h2>
        <ul className="qc-contact-list">
          <li className="qc-contact-item">
            <Phone aria-hidden="true" />
            <span>
              <span className="sr-only">{t('supportPhoneLabel')}: </span>
              <a href={`tel:${SUPPORT_CONTACT.phone}`}>{SUPPORT_CONTACT.phone}</a>
            </span>
          </li>
          <li className="qc-contact-item">
            <Mail aria-hidden="true" />
            <span>
              <span className="sr-only">{t('supportEmailLabel')}: </span>
              <a href={`mailto:${SUPPORT_CONTACT.email}`}>{SUPPORT_CONTACT.email}</a>
            </span>
          </li>
          <li className="qc-contact-item">
            <MapPin aria-hidden="true" />
            <span>
              <span className="sr-only">{t('supportAddressLabel')}: </span>
              {SUPPORT_CONTACT.address}
            </span>
          </li>
        </ul>
      </section>

      <section className="qc-public-card">
        <h2 className="qc-section-title">{t('supportFormTitle')}</h2>
        <p className="qc-section-text">{t('supportFormHint')}</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="support-name" className="block text-sm font-medium text-gray-700 mb-1">
              {t('supportName')}
            </label>
            <input
              id="support-name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              className="input-field"
              aria-invalid={Boolean(errors.form)}
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="support-email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('supportEmail')}
            </label>
            <input
              id="support-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className="input-field"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'support-email-error' : undefined}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p id="support-email-error" className="text-sm text-red-600 mt-1" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="support-message" className="block text-sm font-medium text-gray-700 mb-1">
              {t('supportMessage')}
            </label>
            <textarea
              id="support-message"
              name="message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              className="input-field"
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? 'support-message-error' : undefined}
              disabled={isSubmitting}
            />
            {errors.message && (
              <p id="support-message-error" className="text-sm text-red-600 mt-1" role="alert">
                {errors.message}
              </p>
            )}
          </div>

          {errors.form && (
            <p className="text-sm text-red-600 mb-3" role="alert">
              {errors.form}
            </p>
          )}

          <button type="submit" className="btn-primary inline-flex items-center gap-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="qc-spin w-4 h-4" aria-hidden="true" />
                {t('supportSending')}
              </>
            ) : (
              t('supportSend')
            )}
          </button>

          {feedback && (
            <p
              role="status"
              aria-live="polite"
              className={`mt-3 inline-flex items-start gap-2 text-sm ${
                status === 'success' ? 'text-green-700' : 'text-red-600'
              }`}
            >
              {status === 'success' && <CheckCircle2 className="w-4 h-4 mt-0.5" aria-hidden="true" />}
              <span>{feedback}</span>
            </p>
          )}
        </form>
      </section>
    </PublicPage>
  );
};

export default Support;
