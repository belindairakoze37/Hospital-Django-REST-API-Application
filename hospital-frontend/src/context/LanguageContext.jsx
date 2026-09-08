// src/context/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTranslation, getAvailableLanguages } from '../i18n/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('English');
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [isLanguageChanging, setIsLanguageChanging] = useState(false);

  useEffect(() => {
    setAvailableLanguages(getAvailableLanguages());
    
    const savedSettings = localStorage.getItem('medicare_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.language && getAvailableLanguages().includes(parsed.language)) {
          setLanguage(parsed.language);
        }
      } catch (e) {
        console.error('Error loading language:', e);
      }
    }
  }, []);

  const t = useCallback((key) => {
    return getTranslation(language, key);
  }, [language]);

  const changeLanguage = useCallback((newLanguage) => {
    if (getAvailableLanguages().includes(newLanguage)) {
      setIsLanguageChanging(true);
      setLanguage(newLanguage);
      
      // Save to localStorage immediately
      const savedSettings = localStorage.getItem('medicare_settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          parsed.language = newLanguage;
          localStorage.setItem('medicare_settings', JSON.stringify(parsed));
        } catch (e) {
          console.error('Error saving language:', e);
        }
      }
      
      // Dispatch event to notify all components
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: newLanguage } }));
      
      // Force a re-render of all components
      setTimeout(() => {
        setIsLanguageChanging(false);
      }, 100);
    }
  }, []);

  // This function is called when the user clicks "Save" in Settings
  const saveLanguage = useCallback((newLanguage) => {
    if (getAvailableLanguages().includes(newLanguage)) {
      setLanguage(newLanguage);
      
      // Save to localStorage
      const savedSettings = localStorage.getItem('medicare_settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          parsed.language = newLanguage;
          localStorage.setItem('medicare_settings', JSON.stringify(parsed));
        } catch (e) {
          console.error('Error saving language:', e);
        }
      }
      
      // Dispatch event to notify all components
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: newLanguage } }));
      
      return true;
    }
    return false;
  }, []);

  const value = {
    language,
    changeLanguage,
    saveLanguage,
    t,
    availableLanguages,
    isLanguageChanging
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};