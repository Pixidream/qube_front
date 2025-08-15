import { createI18n } from 'vue-i18n';
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

export const i18n = createI18n<[messageSchemaFR], 'fr' | 'en'>({
  legacy: false,
  locale: navigator.language.split('-')[0] ?? 'fr',
  fallbackLocale: 'fr',
  messages: { fr, en },
});
