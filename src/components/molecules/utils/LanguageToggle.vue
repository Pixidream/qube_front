<script setup lang="ts">
import { Button } from '@components/atoms/button';
import { Icon } from '@iconify/vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { type SupportedLocale, localeNames, icons, locale } from '@i18n/index';
import dayjs from '@/plugins/dayjs.plugin';
import fr from 'dayjs/locale/fr';
import en from 'dayjs/locale/en';
import { createComponentLogger } from '@/utils/logger';

// Create component-specific logger
const languageToggleLogger = createComponentLogger('LanguageToggle');

const { locale: i18nLocale } = useI18n<{ locale: SupportedLocale }>();

const getIconName = computed<string>(
  () => icons[locale.value as SupportedLocale],
);

const toggleLanguage = () => {
  const previousLocale = locale.value;

  if (locale.value === 'en') {
    locale.value = 'fr';
    i18nLocale.value = 'fr';
    dayjs.locale(fr);
  } else {
    locale.value = 'en';
    i18nLocale.value = 'en';
    dayjs.locale(en);
  }

  languageToggleLogger.info('Language changed by user', {
    action: 'language_toggle',
    from: previousLocale,
    to: locale.value,
    source: 'language_toggle_component',
  });
};
</script>
<template>
  <Button
    variant="ghost"
    class="w-full flex justify-start items-center !pl-0"
    @click.prevent="toggleLanguage"
  >
    <Icon class="h-5 w-5" :icon="getIconName" />
    {{ localeNames[locale as SupportedLocale] }}
  </Button>
</template>
