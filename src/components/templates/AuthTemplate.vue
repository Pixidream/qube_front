<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Logo from '@assets/images/logo.png';
import LoginBackgroundLight from '@assets/images/login_background_light.png';
import LoginBackgroundDark from '@assets/images/login_background_dark.png';
import ThemeDropdown from '@components/molecules/utils/ThemeDropdown.vue';
import { useColorMode } from '@vueuse/core';
import LanguageDropdown from '@components/molecules/utils/LanguageDropdown.vue';

const { t } = useI18n();
const mode = useColorMode();
const loginBackgroundImage = computed(() => {
  const newMode: 'dark' | 'light' =
    mode.value === 'auto' ?
      (
        window.matchMedia
        && window.matchMedia('(prefers-color-scheme: dark)').matches
      ) ?
        'dark'
      : 'light'
    : mode.value;

  return newMode == 'dark' ? LoginBackgroundDark : LoginBackgroundLight;
});
</script>
<template>
  <div class="grid min-h-svh lg:grid-cols-2">
    <div class="flex flex-col gap-4 p-6 md:p-10">
      <div class="flex justify-between">
        <div class="flex gap-2 justify-start">
          <RouterLink
            :to="{ name: 'login' }"
            class="flex items-center gap-2 font-medium"
          >
            <img :src="Logo" alt="application logo" class="size-4" />
            {{ t('app.name') }}
          </RouterLink>
        </div>
        <div class="flex items-center gap-4">
          <ThemeDropdown />
          <LanguageDropdown />
        </div>
      </div>
      <div class="flex flex-1 items-center justify-center">
        <div class="w-full max-w-xs">
          <RouterView />
        </div>
      </div>
    </div>
    <div class="bg-muted relative hidden lg:block">
      <img
        :src="loginBackgroundImage"
        alt="authentication screen image"
        class="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  </div>
</template>
