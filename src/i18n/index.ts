import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// PT-BR translations
import commonPtBR from './locales/pt-BR/common.json';
import legalPtBR from './locales/pt-BR/legal.json';
import settingsPtBR from './locales/pt-BR/settings.json';

// EN-US translations
import commonEnUS from './locales/en-US/common.json';
import legalEnUS from './locales/en-US/legal.json';
import settingsEnUS from './locales/en-US/settings.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': {
        common: commonPtBR,
        legal: legalPtBR,
        settings: settingsPtBR,
      },
      'en-US': {
        common: commonEnUS,
        legal: legalEnUS,
        settings: settingsEnUS,
      },
    },
    fallbackLng: 'pt-BR',
    supportedLngs: ['pt-BR', 'en-US'],
    defaultNS: 'common',
    ns: ['common', 'legal', 'settings'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'ethra-locale',
      caches: ['localStorage'],
    },
  });

export default i18n;
