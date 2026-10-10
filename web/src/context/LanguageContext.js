import React, { createContext, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

const SUPPORTED_LANGUAGES = ['en', 'th'];

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

// Thin wrapper around react-i18next's own instance so components consume a
// hook shaped like useTheme() (language/setLanguage/toggleLanguage) instead
// of reaching into i18n.changeLanguage directly. Persistence/detection is
// handled by i18next-browser-languagedetector (see src/i18n/index.js), not
// reimplemented here.
export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const language = SUPPORTED_LANGUAGES.includes(i18n.language) ? i18n.language : 'en';

  const setLanguage = useCallback((lang) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    i18n.changeLanguage(lang);
  }, [i18n]);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'th' : 'en');
  }, [language, setLanguage]);

  const value = { language, setLanguage, toggleLanguage, supportedLanguages: SUPPORTED_LANGUAGES };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
