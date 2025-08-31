<script setup lang="ts">
import { Button } from '@components/atoms/button';
import { Icon } from '@iconify/vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { type SupportedLocale, localeNames, icons } from '@i18n/index';

const { locale } = useI18n<{ locale: SupportedLocale }>();

const getIconName = computed<string>(
  () => icons[locale.value as SupportedLocale],
);

const toggleLanguage = () => {
  if (locale.value === 'en') {
    locale.value = 'fr';
  } else {
    locale.value = 'en';
  }
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
