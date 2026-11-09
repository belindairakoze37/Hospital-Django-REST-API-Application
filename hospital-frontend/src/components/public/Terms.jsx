// src/components/public/Terms.jsx
import React from 'react';
import PublicPage from './PublicPage';
import { useLanguage } from '../../context/LanguageContext';

const SECTIONS = [
  { title: 'termsS1Title', body: 'termsS1Body' },
  { title: 'termsS2Title', body: 'termsS2Body' },
  { title: 'termsS3Title', body: 'termsS3Body' },
  { title: 'termsS4Title', body: 'termsS4Body' },
];

const Terms = () => {
  const { t } = useLanguage();

  return (
    <PublicPage title={t('termsTitle')} subtitle={t('termsSubtitle')}>
      <div className="qc-public-card">
        <p className="qc-section-text">{t('termsIntro')}</p>
        <p className="text-xs uppercase tracking-wide text-gray-400">{t('lastUpdated')}</p>
      </div>

      {SECTIONS.map(({ title, body }) => (
        <section key={title} className="qc-public-card">
          <h2 className="qc-section-title">{t(title)}</h2>
          <p className="qc-section-text">{t(body)}</p>
        </section>
      ))}
    </PublicPage>
  );
};

export default Terms;
