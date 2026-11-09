// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ChevronRight,
  Ticket,
  Calendar,
  ListOrdered,
  Clock,
} from 'lucide-react';
import PublicHeader from './common/PublicHeader';
import PublicFooter from './common/PublicFooter';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
  const { t } = useLanguage();

  const features = [
    { label: t('homeFeatureTicket'), Icon: Ticket },
    { label: t('homeFeatureQueue'), Icon: ListOrdered },
    { label: t('homeFeatureWait'), Icon: Clock },
  ];

  const stats = [
    { number: '10K+', label: t('homeStatPatients') },
    { number: '500+', label: t('homeStatDoctors') },
    { number: '50K+', label: t('homeStatAppointments') },
    { number: '98%', label: t('homeStatSatisfaction') },
  ];

  return (
    <div className="qc-landing min-h-screen bg-white">
      <PublicHeader />

      <main>
        {/* Hero Section with Background Image */}
        <section className="qc-hero relative overflow-hidden">
          {/* Background photo (blurred so the signage does not distract) */}
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
            <div
              className="qc-hero-photo absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80")',
              }}
            />
            <div className="qc-hero-overlay absolute inset-0" />
          </div>

          {/* Decorative Elements */}
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-accent-500/10 rounded-full filter blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl" />
          </div>

          <div className="qc-container relative w-full py-8 lg:py-12">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-6">
                <h1 className="qc-hero-title qc-fade-up text-white">
                  {t('homeHeroTitle1')}
                  <br />
                  {t('homeHeroTitle2')}
                </h1>

                <p className="qc-hero-sub qc-fade-up text-gray-200 max-w-[520px]" style={{ '--qc-delay': '80ms' }}>
                  {t('homeHeroSubtitle')}
                </p>

                <div className="qc-fade-up flex flex-wrap items-center gap-2" style={{ '--qc-delay': '140ms' }}>
                  <span className="qc-badge">
                    <span className="qc-dot animate-pulse" aria-hidden="true" />
                    {t('homeBadgeHospital')}
                  </span>
                  <span className="qc-badge">{t('homeBadgeEmergency')}</span>
                </div>

                <ul
                  className="qc-fade-up flex flex-wrap gap-x-6 gap-y-2 pt-2"
                  style={{ '--qc-delay': '200ms' }}
                  aria-label={t('homeAriaKeyFeatures')}
                >
                  {features.map(({ label, Icon }) => (
                    <li key={label} className="flex items-center gap-2 text-sm font-medium text-white/90">
                      <Icon className="w-4 h-4 text-white/80" aria-hidden="true" />
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Content - Welcome Card */}
              <div className="qc-fade-up w-full" style={{ '--qc-delay': '120ms' }}>
                <div className="qc-card mx-auto lg:ml-auto lg:mr-0">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-white" aria-hidden="true" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800">{t('homeWelcomeTitle')}</h2>
                    <p className="text-gray-500 mt-2 leading-relaxed text-[15px]">
                      {t('homeWelcomeText')}
                    </p>
                  </div>

                  <Link to="/login" className="qc-signin" aria-label={t('homeSignInAria')}>
                    {t('navSignIn')}
                    <ChevronRight className="w-5 h-5" aria-hidden="true" />
                  </Link>

                  <p className="mt-6 text-center qc-legal-link leading-relaxed">
                    {t('homeLegalPrefix')}{' '}
                    <Link to="/terms" className="qc-legal-link underline-offset-2 hover:underline">
                      {t('termsTitle')}
                    </Link>{' '}
                    {t('homeLegalAnd')}{' '}
                    <Link to="/privacy" className="qc-legal-link underline-offset-2 hover:underline">
                      {t('privacyTitle')}
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Patient Services - both flows work without an account */}
        <section id="services" className="qc-cta-section bg-white">
          <div className="qc-container">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-700">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-500" aria-hidden="true" />
                {t('homeServicesBadge')}
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold gradient-text">
                {t('homeServicesTitle')}
              </h2>
              <p className="mt-3 text-gray-600 text-base sm:text-lg">
                {t('homeServicesSubtitle')}
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:gap-8 lg:grid-cols-2">
              {/* Get a Queue Number */}
              <Link
                to="/queue/register"
                className="group relative flex flex-col overflow-hidden rounded-3xl glass-card p-7 sm:p-9 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/30"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary-500 to-accent-500"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-16 -right-14 h-56 w-56 rounded-full bg-gradient-to-br from-primary-200/50 to-accent-200/40 blur-3xl"
                />

                <div className="relative flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30">
                    <Ticket className="h-7 w-7 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{t('homeQueueCardTitle')}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
                      {t('homeQueueCardText')}
                    </p>
                  </div>
                </div>

                <div className="relative mt-7 flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 px-6 py-3 text-sm sm:text-base font-bold text-white shadow-lg shadow-primary-500/30">
                    {t('homeQueueCardCta')}
                    <ChevronRight
                      className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="hidden sm:block text-xs font-medium text-gray-400">
                    {t('homeQueueCardNote')}
                  </span>
                </div>
              </Link>

              {/* Book an Appointment */}
              <Link
                to="/book-appointment"
                className="group relative flex flex-col overflow-hidden rounded-3xl glass-card p-7 sm:p-9 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-accent-500/30"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-accent-500 to-primary-500"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-16 -right-14 h-56 w-56 rounded-full bg-gradient-to-br from-accent-200/50 to-primary-200/40 blur-3xl"
                />

                <div className="relative flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-primary-500 shadow-lg shadow-accent-500/30">
                    <Calendar className="h-7 w-7 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{t('homeBookCardTitle')}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
                      {t('homeBookCardText')}
                    </p>
                  </div>
                </div>

                <div className="relative mt-7 flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-accent-500 to-primary-500 px-6 py-3 text-sm sm:text-base font-bold text-white shadow-lg shadow-accent-500/30">
                    {t('homeBookCardCta')}
                    <ChevronRight
                      className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="hidden sm:block text-xs font-medium text-gray-400">
                    {t('homeServicesBadge')}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Home;