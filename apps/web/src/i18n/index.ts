import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import he from './locales/he.json';

const resources = {
  en: { translation: en },
  he: { translation: he },
};

// Function to update document direction based on language
const updateDocumentDirection = (language: string) => {
  const isRTL = language === 'he';
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  })
  .then(() => {
    // Set direction on initial load
    updateDocumentDirection(i18n.language);
  });

// Listen for language changes and update direction
i18n.on('languageChanged', (language) => {
  updateDocumentDirection(language);
});

export default i18n;

// Helper to check if current language is RTL
export const isRTL = () => {
  return i18n.language === 'he';
};

// Helper to get document direction
export const getDirection = () => {
  return isRTL() ? 'rtl' : 'ltr';
};
