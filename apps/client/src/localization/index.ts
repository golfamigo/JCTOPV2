import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import zhTW from './locales/zh-TW.json';

// Language resources
const resources = {
  'zh-TW': {
    translation: zhTW,
  },
};

i18n
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    lng: 'zh-TW', // Default language
    fallbackLng: 'zh-TW', // Fallback language
    debug: __DEV__, // Enable debug in development

    interpolation: {
      escapeValue: false, // React already escapes by default
    },

    // Key separator
    keySeparator: '.',
    
    // Namespace separator
    nsSeparator: ':',

    // React options
    react: {
      useSuspense: false, // Set to false for React Native
    },

    // Default namespace
    defaultNS: 'translation',
    
    // Missing key handler
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (__DEV__) {
        console.warn(`Missing translation key: ${key}`);
      }
    },
  });

export default i18n;

// Export useTranslation hook for convenience
export { useTranslation } from 'react-i18next';

// Type-safe translation keys (optional, for better TypeScript support)
export type TranslationKey = 
  | 'common.welcome'
  | 'common.login'
  | 'common.register'
  | 'auth.email'
  | 'auth.password'
  | 'events.events'
  | 'organizer.dashboard'
  | 'profile.profile'
  | 'tickets.ticket'
  | 'payment.payment'
  | 'validation.required'
  | 'messages.registrationSuccessful'
  // Add more keys as needed
  | string;