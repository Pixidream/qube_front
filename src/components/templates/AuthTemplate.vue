<script setup lang="ts">
import { useColorMode } from '@vueuse/core';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import LoginBackgroundDark from '@assets/images/login_background_dark.png';
import LoginBackgroundLight from '@assets/images/login_background_light.png';
import Logo from '@assets/images/logo.png';
import LanguageDropdown from '@components/molecules/utils/LanguageDropdown.vue';
import ThemeDropdown from '@components/molecules/utils/ThemeDropdown.vue';
import { useAuthMachine } from '@machines/auth.machine';
import { onBeforeMount } from 'vue';

const router = useRouter();
const route = useRoute();
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

const goTo = (pathName: string) => router.push({ name: pathName });

useAuthMachine().actor.subscribe((snapshot) => {
  // @ts-expect-error value is an object, but reported as string by xstate
  switch (snapshot.value.flow) {
    case 'login':
      goTo('login');
      break;
    case 'signup':
      goTo('signup');
      break;
    case '2fa_totp':
      goTo('totp');
      break;
    case 'recovery_code':
      goTo('totp-recovery');
      break;
    case 'email_totp':
      goTo('totp');
      break;
    case 'verify_email':
      goTo('verify-email');
      break;
    case 'reset_password':
      goTo('reset-password');
      break;
    case 'authenticated':
      (() =>
        route.query?.redirect ?
          router.push(route.query.redirect as string)
        : goTo('home'))();
      break;
    case 'loading':
      break;
    default:
      goTo('login');
      break;
  }
});

onBeforeMount(() => {
  if (useAuthMachine().state.matches('flow.login') && route.name !== 'login') {
    goTo('login');
  }
});
</script>
<template>
  <div class="grid safe-height lg:grid-cols-2">
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
