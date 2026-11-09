// src/components/common/NewsletterForm.jsx
import React, { useId, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

const NewsletterForm = () => {
  const { t } = useLanguage();
  const inputId = useId();
  const feedbackId = useId();

  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | already | error
  const [message, setMessage] = useState('');

  const isSubmitting = status === 'loading';

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const normalized = email.trim().toLowerCase();
    if (!normalized || !EMAIL_PATTERN.test(normalized)) {
      setStatus('error');
      setMessage(t('newsletterInvalid'));
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      await api.post('newsletter/subscribe/', {
        email: normalized,
        source: 'home_footer',
        website: honeypot,
      });
      setStatus('success');
      setMessage(t('newsletterSuccess'));
      setEmail('');
      setHoneypot('');
    } catch (error) {
      const responseStatus = error?.response?.status;
      if (responseStatus === 409) {
        setStatus('already');
        setMessage(t('newsletterAlready'));
        setEmail('');
      } else if (responseStatus === 400) {
        setStatus('error');
        setMessage(t('newsletterInvalid'));
      } else {
        setStatus('error');
        setMessage(t('newsletterError'));
      }
    }
  };

  const feedbackIcon = {
    success: <CheckCircle2 aria-hidden="true" />,
    already: <Info aria-hidden="true" />,
    error: <AlertCircle aria-hidden="true" />,
  }[status];

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="text-gray-400 text-sm mb-3">{t('newsletterHint')}</p>
      <div className="qc-newsletter-field">
        <label htmlFor={inputId} className="sr-only">
          {t('newsletterPlaceholder')}
        </label>
        <input
          id={inputId}
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status !== 'loading' && status !== 'idle') {
              setStatus('idle');
              setMessage('');
            }
          }}
          placeholder={t('newsletterPlaceholder')}
          aria-label={t('newsletterPlaceholder')}
          aria-invalid={status === 'error'}
          aria-describedby={message ? feedbackId : undefined}
          disabled={isSubmitting}
          className={`qc-newsletter-input ${status === 'error' ? 'is-invalid' : ''}`}
        />
        <button type="submit" className="qc-newsletter-button" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="qc-spin w-4 h-4" aria-hidden="true" />
              {t('subscribing')}
            </>
          ) : (
            t('subscribe')
          )}
        </button>
      </div>

      {/* Honeypot: hidden from users and assistive tech, but bots fill it in. */}
      <div className="qc-newsletter-honeypot" aria-hidden="true">
        <label htmlFor={`${inputId}-website`}>{t('website')}</label>
        <input
          id={`${inputId}-website`}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      {message && (
        <p
          id={feedbackId}
          role="status"
          aria-live="polite"
          className={`qc-newsletter-feedback ${
            status === 'success'
              ? 'is-success'
              : status === 'already'
                ? 'is-notice'
                : 'is-error'
          }`}
        >
          {feedbackIcon}
          <span>{message}</span>
        </p>
      )}
    </form>
  );
};

export default NewsletterForm;
