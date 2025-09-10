import { createI18n } from 'vue-i18n';
import { useLocalStorage } from '@vueuse/core';
import dayjs from '@/plugins/dayjs.plugin';
import dayjsFr from 'dayjs/locale/fr';
import dayjsEn from 'dayjs/locale/en';
import fr from './fr';
import en from './en';

type messageSchemaFR = typeof fr;
export type SupportedLocale = 'en' | 'fr';
export const icons: Record<SupportedLocale, string> = {
  en: 'circle-flags:us',
  fr: 'circle-flags:fr',
};
export const localeNames: Record<SupportedLocale, string> = {
  en: 'English',
  fr: 'Français',
};

const supportedLocales: SupportedLocale[] = ['en', 'fr'];

const getInitialLocale = (): SupportedLocale => {
  // Try to get from localStorage first
  const stored = localStorage.getItem('locale');
  if (stored && supportedLocales.includes(stored as SupportedLocale)) {
    return stored as SupportedLocale;
  }

  // Fallback to navigator language if supported
  const navigatorLang = navigator.language.split('-')[0] as SupportedLocale;
  if (supportedLocales.includes(navigatorLang)) {
    return navigatorLang;
  }

  // Default to 'fr'
  return 'fr';
};

export const locale = useLocalStorage<SupportedLocale>(
  'locale',
  getInitialLocale(),
);

dayjs.locale(locale.value === 'fr' ? dayjsFr : dayjsEn);

export const i18n = createI18n<[messageSchemaFR], 'fr' | 'en'>({
  legacy: false,
  locale: locale.value,
  fallbackLocale: 'fr',
  messages: { fr, en },
});
