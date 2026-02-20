import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// PT-BR translations
import commonPtBR from './locales/pt-BR/common.json';
import legalPtBR from './locales/pt-BR/legal.json';
import settingsPtBR from './locales/pt-BR/settings.json';
import dashboardPtBR from './locales/pt-BR/dashboard.json';
import authPtBR from './locales/pt-BR/auth.json';

// EN-US translations
import commonEnUS from './locales/en-US/common.json';
import legalEnUS from './locales/en-US/legal.json';
import settingsEnUS from './locales/en-US/settings.json';
import dashboardEnUS from './locales/en-US/dashboard.json';
import authEnUS from './locales/en-US/auth.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': {
        common: commonPtBR,
        legal: legalPtBR,
        settings: settingsPtBR,
        dashboard: dashboardPtBR,
        auth: authPtBR,
      },
      'en-US': {
        common: commonEnUS,
        legal: legalEnUS,
        settings: settingsEnUS,
        dashboard: dashboardEnUS,
        auth: authEnUS,
      },
    },
    fallbackLng: 'pt-BR',
    supportedLngs: ['pt-BR', 'en-US'],
    defaultNS: 'common',
    ns: ['common', 'legal', 'settings', 'dashboard', 'auth'],
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
