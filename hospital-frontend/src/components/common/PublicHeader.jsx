// src/components/common/PublicHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

// Shared landing-page header. Classes come straight from the original
// home page markup so the public pages look identical.
const PublicHeader = () => {
  const { t } = useLanguage();

  return (
    <header className="qc-header sticky top-0 z-50 bg-white">
      <div className="qc-container h-full flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 min-w-0" aria-label={t('ariaHomeLink')}>
          <span className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" aria-hidden="true" />
          </span>
          <span className="leading-tight min-w-0">
            <span className="block text-xl font-bold text-primary-600">{t('appName')}</span>
            <span className="block text-xs text-gray-500 truncate hidden sm:block">
              {t('appTagline')}
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <LanguageSwitcher className="qc-topbar-link" />
          <Link to="/help" className="qc-topbar-link" aria-label={t('navHelp')}>
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t('navHelp')}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
