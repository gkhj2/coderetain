import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform, NativeModules } from 'react-native';
import en from './locales/en.json';
import zh from './locales/zh.json';

// Detect device language
const getDeviceLanguage = (): string => {
  let locale = 'en';
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    locale = navigator.language || (navigator as any).userLanguage || 'en';
  } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
    locale =
      NativeModules?.SettingsManager?.settings?.AppleLocale ||
      NativeModules?.I18nManager?.localeIdentifier ||
      'en';
  }
  return locale.startsWith('zh') ? 'zh' : 'en';
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
