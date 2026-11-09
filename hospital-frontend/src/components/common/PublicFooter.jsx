// src/components/common/PublicFooter.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import NewsletterForm from './NewsletterForm';

export const SUPPORT_CONTACT = {
  phone: '+256761714327',
  email: 'info@queuecare.com',
  address: '123 Healthcare Blvd, Kampala',
};

// Shared landing-page footer. Classes are unchanged from the original
// home page markup; only the links and copy are wired up.
const PublicFooter = () => {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="qc-footer-dark bg-gray-900 text-white py-12">
      <div className="qc-container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">{t('appName')}</span>
                <span className="text-xs text-gray-400 block">{t('appTagline')}</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{t('footerTagline')}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              {t('quickLinks')}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="qc-footer-link text-sm">
                  {t('navHome')}
                </Link>
              </li>
              <li>
                <Link to="/#services" className="qc-footer-link text-sm">
                  {t('navServices')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="qc-footer-link text-sm">
                  {t('navSignIn')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              {t('contactInfo')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-300 text-sm">
                <Phone className="w-4 h-4 text-primary-400" aria-hidden="true" />
                <a href={`tel:${SUPPORT_CONTACT.phone}`} className="qc-footer-link">
                  {SUPPORT_CONTACT.phone}
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-300 text-sm">
                <Mail className="w-4 h-4 text-primary-400" aria-hidden="true" />
                <a href={`mailto:${SUPPORT_CONTACT.email}`} className="qc-footer-link">
                  {SUPPORT_CONTACT.email}
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-300 text-sm">
                <MapPin className="w-4 h-4 text-primary-400" aria-hidden="true" />
                <span>{SUPPORT_CONTACT.address}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              {t('newsletter')}
            </h4>
            <NewsletterForm />
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm text-center sm:text-left">
            {t('footerRights', { year })}
          </p>
          <nav className="flex items-center gap-6" aria-label={t('ariaLegalLinks')}>
            <Link to="/privacy" className="qc-footer-link">
              {t('privacy')}
            </Link>
            <Link to="/terms" className="qc-footer-link">
              {t('terms')}
            </Link>
            <Link to="/support" className="qc-footer-link">
              {t('supportLink')}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
