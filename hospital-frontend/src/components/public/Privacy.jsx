// src/components/public/Privacy.jsx
import React from 'react';
import PublicPage from './PublicPage';
import { useLanguage } from '../../context/LanguageContext';

const SECTIONS = [
  { title: 'privacyS1Title', body: 'privacyS1Body' },
  { title: 'privacyS2Title', body: 'privacyS2Body' },
  { title: 'privacyS3Title', body: 'privacyS3Body' },
  { title: 'privacyS4Title', body: 'privacyS4Body' },
];

const Privacy = () => {
  const { t } = useLanguage();

  return (
    <PublicPage title={t('privacyTitle')} subtitle={t('privacySubtitle')}>
      <div className="qc-public-card">
        <p className="qc-section-text">{t('privacyIntro')}</p>
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

export default Privacy;
