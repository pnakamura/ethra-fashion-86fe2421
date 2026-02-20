import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// PT-BR translations
import commonPtBR from './locales/pt-BR/common.json';
import legalPtBR from './locales/pt-BR/legal.json';
import settingsPtBR from './locales/pt-BR/settings.json';
import dashboardPtBR from './locales/pt-BR/dashboard.json';
import authPtBR from './locales/pt-BR/auth.json';
import wardrobePtBR from './locales/pt-BR/wardrobe.json';
import recommendationsPtBR from './locales/pt-BR/recommendations.json';
import chromaticPtBR from './locales/pt-BR/chromatic.json';
import tryOnPtBR from './locales/pt-BR/tryOn.json';
import eventsPtBR from './locales/pt-BR/events.json';
import voyagerPtBR from './locales/pt-BR/voyager.json';
import landingPtBR from './locales/pt-BR/landing.json';

// EN-US translations
import commonEnUS from './locales/en-US/common.json';
import legalEnUS from './locales/en-US/legal.json';
import settingsEnUS from './locales/en-US/settings.json';
import dashboardEnUS from './locales/en-US/dashboard.json';
import authEnUS from './locales/en-US/auth.json';
import wardrobeEnUS from './locales/en-US/wardrobe.json';
import recommendationsEnUS from './locales/en-US/recommendations.json';
import chromaticEnUS from './locales/en-US/chromatic.json';
import tryOnEnUS from './locales/en-US/tryOn.json';
import eventsEnUS from './locales/en-US/events.json';
import voyagerEnUS from './locales/en-US/voyager.json';
import landingEnUS from './locales/en-US/landing.json';

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
        wardrobe: wardrobePtBR,
        recommendations: recommendationsPtBR,
        chromatic: chromaticPtBR,
        tryOn: tryOnPtBR,
        events: eventsPtBR,
        voyager: voyagerPtBR,
        landing: landingPtBR,
      },
      'en-US': {
        common: commonEnUS,
        legal: legalEnUS,
        settings: settingsEnUS,
        dashboard: dashboardEnUS,
        auth: authEnUS,
        wardrobe: wardrobeEnUS,
        recommendations: recommendationsEnUS,
        chromatic: chromaticEnUS,
        tryOn: tryOnEnUS,
        events: eventsEnUS,
        voyager: voyagerEnUS,
        landing: landingEnUS,
      },
    },
    fallbackLng: 'pt-BR',
    supportedLngs: ['pt-BR', 'en-US'],
    defaultNS: 'common',
    ns: ['common', 'legal', 'settings', 'dashboard', 'auth', 'wardrobe', 'recommendations', 'chromatic', 'tryOn', 'events', 'voyager', 'landing'],
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
