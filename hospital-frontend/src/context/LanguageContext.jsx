// src/context/LanguageContext.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import {
  getAvailableLanguages,
  getLanguageMetadata,
  getTranslation,
  isSupportedLanguage,
  languageMetadata,
  resolveBrowserLanguage,
} from '../i18n/translations';

const LanguageContext = createContext();

// The explicit choice made from the header dropdown. Kept separate from
// `medicare_settings` so a deliberate pick can be told apart from an inherited
// value, which is what decides whether the profile or the guest choice wins.
const LANGUAGE_STORAGE_KEY = 'queuecare_language';
const SETTINGS_STORAGE_KEY = 'medicare_settings';

// BCP 47 locale for each supported language, used by Intl formatters and by
// Intl.PluralRules when picking a plural variant.
export const LANGUAGE_LOCALES = {
  English: 'en',
  Kiswahili: 'sw',
  Spanish: 'es',
  French: 'fr',
  German: 'de',
  Portuguese: 'pt',
  Italian: 'it',
};

export const getLanguageLocale = (language) => LANGUAGE_LOCALES[language] || 'en';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const readStoredLanguage = () => {
  try {
    const explicit = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (explicit && isSupportedLanguage(explicit)) {
      return { language: explicit, explicit: true };
    }

    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed.language && isSupportedLanguage(parsed.language)) {
        return { language: parsed.language, explicit: false };
      }
    }
  } catch (error) {
    console.error('Error loading language:', error);
  }
  return null;
};

// First visit: saved choice, then the browser language, then English.
const readInitialLanguage = () => {
  const stored = readStoredLanguage();
  if (stored) return stored.language;
  return resolveBrowserLanguage() || 'English';
};

const persistLanguage = (newLanguage, { explicit = false } = {}) => {
  try {
    if (explicit) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
    }

    let parsed = {};
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      parsed = JSON.parse(savedSettings) || {};
    }
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ ...parsed, language: newLanguage })
    );
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

const applyDocumentLanguage = (newLanguage) => {
  if (typeof document === 'undefined') return;
  const { code, dir } = getLanguageMetadata(newLanguage);
  document.documentElement.lang = String(code || 'EN').toLowerCase();
  document.documentElement.dir = dir || 'ltr';
};

// Locale-aware formatting that never throws on bad input.
function formatWithIntl(kind, value, options, language) {
  if (value === null || value === undefined || value === '') return '';
  const date = kind === 'DateTimeFormat' ? new Date(value) : value;
  if (kind === 'DateTimeFormat' && Number.isNaN(date.getTime())) return '';
  const numeric = kind === 'NumberFormat' ? Number(value) : null;
  if (kind === 'NumberFormat' && Number.isNaN(numeric)) return '';
  try {
    const formatter = new Intl[kind](getLanguageLocale(language), options);
    return formatter.format(kind === 'NumberFormat' ? numeric : date);
  } catch {
    return String(value);
  }
}

export const LanguageProvider = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguage] = useState(readInitialLanguage);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [isLanguageChanging, setIsLanguageChanging] = useState(false);

  const languageRef = useRef(language);
  useEffect(() => {
    languageRef.current = language;
  }, [language]);
  const syncedUserRef = useRef(null);

  useEffect(() => {
    setAvailableLanguages(getAvailableLanguages());
  }, []);

  useEffect(() => {
    applyDocumentLanguage(language);
  }, [language]);

  const t = useCallback(
    (key, params) => {
      let value = getTranslation(language, key);

      if (params && params.count !== undefined) {
        // Plural variant: `key_zero` / `key_one` / `key_other`, resolved with
        // Intl.PluralRules for the active language.
        const locale = getLanguageLocale(language);
        let category;
        try {
          category = new Intl.PluralRules(locale).select(Number(params.count));
        } catch {
          category = Number(params.count) === 1 ? 'one' : 'other';
        }
        const candidate = getTranslation(language, `${key}_${category}`);
        if (candidate !== `${key}_${category}`) {
          value = candidate;
        } else {
          const other = getTranslation(language, `${key}_other`);
          if (other !== `${key}_other`) value = other;
        }
      }

      if (!params || typeof value !== 'string') return value;
      return value.replace(/\{(\w+)\}/g, (match, name) =>
        params[name] !== undefined ? String(params[name]) : match
      );
    },
    [language]
  );

  // Backend values arrive as snake_case codes ("in_progress"); the message keys
  // are camelCase ("inProgress"). Falls back to the raw code when no key exists.
  const tStatus = useCallback(
    (code) => {
      if (!code) return '';
      const key = String(code).replace(/_([a-z])/g, (_, char) => char.toUpperCase());
      return t(key);
    },
    [t]
  );

  // Maps a stable backend error code ("no_waiting_patients") onto an apiError*
  // key, falling back to the server's own message when the code is unknown.
  const tApiError = useCallback(
    (code, fallback = '', params) => {
      if (!code) return fallback || t('apiErrorGeneric');
      const key = `apiError${String(code)
        .split(/[_\s]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')}`;
      const message = t(key, params);
      if (!message || message === key) return fallback || t('apiErrorGeneric');
      return message;
    },
    [t]
  );

  const formatDate = useCallback(
    (value, options = { dateStyle: 'medium' }) =>
      formatWithIntl('DateTimeFormat', value, options, language),
    [language]
  );

  const formatTime = useCallback(
    (value, options = { timeStyle: 'short' }) =>
      formatWithIntl('DateTimeFormat', value, options, language),
    [language]
  );

  const formatDateTime = useCallback(
    (value, options = { dateStyle: 'medium', timeStyle: 'short' }) =>
      formatWithIntl('DateTimeFormat', value, options, language),
    [language]
  );

  const formatNumber = useCallback(
    (value, options = {}) => formatWithIntl('NumberFormat', value, options, language),
    [language]
  );

  // "2 hours ago" in the active language, via Intl.RelativeTimeFormat.
  const formatRelativeTime = useCallback(
    (value) => {
      if (!value) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      const seconds = Math.round((date.getTime() - Date.now()) / 1000);
      const units = [
        ['year', 31536000],
        ['month', 2592000],
        ['week', 604800],
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
      ];
      try {
        const formatter = new Intl.RelativeTimeFormat(getLanguageLocale(language), {
          numeric: 'auto',
        });
        for (const [unit, size] of units) {
          if (Math.abs(seconds) >= size) {
            return formatter.format(Math.round(seconds / size), unit);
          }
        }
        return formatter.format(0, 'second');
      } catch {
        return date.toLocaleString();
      }
    },
    [language]
  );

  const pushLanguageToProfile = useCallback(
    (newLanguage) => {
      if (!user) return;
      api.patch('users/me/', { language: newLanguage }).catch((error) => {
        // A failed preference save must never block the UI language change.
        console.error('Error saving language preference:', error);
      });
    },
    [user]
  );

  const applyLanguage = useCallback((newLanguage, { explicit = false } = {}) => {
    if (!isSupportedLanguage(newLanguage)) return false;
    setLanguage(newLanguage);
    persistLanguage(newLanguage, { explicit });
    window.dispatchEvent(
      new CustomEvent('languageChanged', { detail: { language: newLanguage } })
    );
    return true;
  }, []);

  const changeLanguage = useCallback(
    (newLanguage) => {
      if (!isSupportedLanguage(newLanguage)) return false;
      setIsLanguageChanging(true);
      const applied = applyLanguage(newLanguage, { explicit: true });
      pushLanguageToProfile(newLanguage);
      setTimeout(() => setIsLanguageChanging(false), 100);
      return applied;
    },
    [applyLanguage, pushLanguageToProfile]
  );

  // Called by the "Save" button on the Settings page.
  const saveLanguage = useCallback(
    (newLanguage) => {
      if (!isSupportedLanguage(newLanguage)) return false;
      const applied = applyLanguage(newLanguage, { explicit: true });
      pushLanguageToProfile(newLanguage);
      return applied;
    },
    [applyLanguage, pushLanguageToProfile]
  );

  // After a login, reconcile the profile preference with the local choice.
  useEffect(() => {
    if (!user) {
      syncedUserRef.current = null;
      return undefined;
    }
    if (syncedUserRef.current === user.id) return undefined;
    syncedUserRef.current = user.id;

    let cancelled = false;

    const syncWithProfile = async () => {
      try {
        const { data } = await api.get('users/me/');
        if (cancelled) return;

        const profileLanguage = data?.language;
        const stored = readStoredLanguage();

        if (stored?.explicit) {
          // A guest pick always wins and is written back to the profile.
          if (profileLanguage !== stored.language) {
            pushLanguageToProfile(stored.language);
          }
          return;
        }

        if (isSupportedLanguage(profileLanguage)) {
          applyLanguage(profileLanguage, { explicit: false });
          return;
        }

        // No preference yet: seed the profile with the current language.
        pushLanguageToProfile(languageRef.current);
      } catch (error) {
        console.error('Error syncing language with profile:', error);
      }
    };

    syncWithProfile();

    return () => {
      cancelled = true;
    };
  }, [user, applyLanguage, pushLanguageToProfile]);

  const languages = useMemo(
    () =>
      (availableLanguages.length ? availableLanguages : getAvailableLanguages()).map(
        (name) => ({ name, ...getLanguageMetadata(name) })
      ),
    [availableLanguages]
  );

  // Department names come from the database; admins can add per-language
  // overrides in `name_translations`, otherwise the stored name is used.
  const localizeDepartment = useCallback(
    (department) => {
      if (!department) return '';
      const overrides = department.name_translations;
      return (overrides && overrides[language]) || department.dept_name || '';
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      languageCode: getLanguageLocale(language),
      changeLanguage,
      saveLanguage,
      t,
      tStatus,
      tApiError,
      formatDate,
      formatTime,
      formatDateTime,
      formatNumber,
      formatRelativeTime,
      localizeDepartment,
      availableLanguages,
      languages,
      languageMetadata,
      getLanguageMetadata,
      isLanguageChanging,
    }),
    [
      language,
      changeLanguage,
      saveLanguage,
      t,
      tStatus,
      tApiError,
      formatDate,
      formatTime,
      formatDateTime,
      formatNumber,
      formatRelativeTime,
      localizeDepartment,
      availableLanguages,
      languages,
      isLanguageChanging,
    ]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export default LanguageContext;
