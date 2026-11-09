// src/components/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Heart, Stethoscope, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const errorMessage = error
    ? `${t(error.key)}${error.detail ? ` ${error.detail}` : ''}`
    : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await login(username, password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError({ key: result.errorKey || 'authLoginFailed', detail: result.detail });
      }
    } catch (err) {
      setError({ key: 'authUnexpectedError', detail: null });
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ql-page">
      <div aria-hidden="true" className="ql-page-photo" />
      <div aria-hidden="true" className="ql-page-overlay" />

      <div className="ql-shell">
        <div className="ql-card">
          <div className="text-center mb-6">
            <span className="ql-logo">
              <Heart className="w-8 h-8 text-white" aria-hidden="true" />
            </span>
            <h1 className="ql-title">{t('appName')}</h1>
            <p className="ql-tagline">{t('tagline')}</p>
          </div>

          <div role="alert" aria-live="polite">
            {errorMessage && (
              <div className="ql-error">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="ql-field">
              <label className="ql-label" htmlFor="username">
                {t('username')}
              </label>
              <div className="ql-control">
                <User className="ql-control-icon" aria-hidden="true" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="ql-input"
                  placeholder={t('authUsernamePlaceholder')}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck="false"
                  aria-invalid={error ? 'true' : 'false'}
                  required
                />
              </div>
            </div>

            <div className="ql-field">
              <label className="ql-label" htmlFor="password">
                {t('password')}
              </label>
              <div className="ql-control">
                <Lock className="ql-control-icon" aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ql-input ql-input--password"
                  placeholder={t('authPasswordPlaceholder')}
                  autoComplete="current-password"
                  aria-invalid={error ? 'true' : 'false'}
                  required
                />
                <button
                  type="button"
                  className="ql-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t('authHidePassword') : t('authShowPassword')}
                  aria-pressed={showPassword}
                  aria-controls="password"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Eye className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              <div className="ql-forgot-row">
                <a
                  className="ql-link"
                  href="mailto:info@queuecare.com?subject=Password%20reset"
                  aria-label={t('authForgotPasswordAria')}
                >
                  {t('authForgotPassword')}
                </a>
              </div>
            </div>

            <button type="submit" disabled={loading} className="ql-submit" aria-busy={loading}>
              {loading ? (
                <>
                  <span className="ql-spinner" aria-hidden="true" />
                  <span>{t('authSigningIn')}</span>
                </>
              ) : (
                <>
                  <Stethoscope className="w-5 h-5" aria-hidden="true" />
                  <span>{t('navSignIn')}</span>
                </>
              )}
            </button>
          </form>
        </div>

        <footer className="ql-footer">
          <p>{t('authFooterCopyright', { year: new Date().getFullYear() })}</p>
          <nav className="ql-footer-links" aria-label={t('authLegalLinksAria')}>
            <Link to="/privacy" className="ql-footer-link">
              {t('privacy')}
            </Link>
            <Link to="/terms" className="ql-footer-link">
              {t('terms')}
            </Link>
            <Link to="/support" className="ql-footer-link">
              {t('support')}
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  );
};

export default Login;