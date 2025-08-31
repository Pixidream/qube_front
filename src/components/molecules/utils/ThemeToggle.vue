<script setup lang="ts">
import { Button } from '@components/atoms/button';
import { Icon } from '@iconify/vue';
import { computed } from 'vue';
import { useColorMode } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

const mode = useColorMode({ disableTransition: false });
const { t } = useI18n();
const icons = {
  light: 'radix-icons:sun',
  dark: 'radix-icons:moon',
  auto: 'radix-icons:laptop',
};
const themeNames = {
  light: t('utils.themeDropdown.light'),
  dark: t('utils.themeDropdown.dark'),
  auto: t('utils.themeDropdown.system'),
};

const getIconName = computed<string>(() => icons[mode.store.value]);
const getThemeName = computed<string>(() => themeNames[mode.store.value]);

const toggleTheme = () => {
  if (mode.store.value === 'light') {
    mode.value = 'dark';
  } else if (mode.store.value === 'dark') {
    mode.value = 'auto';
  } else {
    mode.value = 'light';
  }
};
</script>
<template>
  <Button
    variant="ghost"
    class="w-full flex justify-start items-center !pl-0"
    @click.prevent="toggleTheme"
  >
    <Icon class="h-5 w-5" :icon="getIconName" />
    {{ getThemeName }}
  </Button>
</template>
