// src/components/public/PublicPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PublicHeader from '../common/PublicHeader';
import PublicFooter from '../common/PublicFooter';
import { useLanguage } from '../../context/LanguageContext';

// Shell shared by every standalone public page (Terms, Privacy, Support, Help).
const PublicPage = ({ title, subtitle, children }) => {
  const { t } = useLanguage();

  return (
    <div className="qc-public-page">
      <PublicHeader />
      <main className="qc-public-page-main">
        <Link to="/" className="qc-back-link">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>{t('backToHome')}</span>
        </Link>
        <h1 className="qc-public-page-title">{title}</h1>
        {subtitle && <p className="qc-public-page-subtitle">{subtitle}</p>}
        {children}
      </main>
      <PublicFooter />
    </div>
  );
};

export default PublicPage;
