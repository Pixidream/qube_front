<script setup lang="ts">
import { useColorMode } from '@vueuse/core';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth.stores';
import LoginBackgroundDark from '@assets/images/login_background_dark.png';
import LoginBackgroundLight from '@assets/images/login_background_light.png';
import Logo from '@assets/images/logo.png';
import LanguageDropdown from '@components/molecules/utils/LanguageDropdown.vue';
import ThemeDropdown from '@components/molecules/utils/ThemeDropdown.vue';
import { sendAuthEvent, useAuthMachine } from '@machines/auth.machine';
import { onBeforeMount } from 'vue';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const authMachine = useAuthMachine();

// Initialize router in auth machine context
authMachine.$updateContext((context) => ({
  ...context,
  router,
}));
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

onBeforeMount(() => {
  // Clear any previous auth errors
  useAuthStore().authError = null;

  // Set redirect path if present in query
  if (route.query?.redirect) {
    authMachine.actor.send(
      sendAuthEvent.setRedirect(route.query.redirect as string),
    );
  }
});
</script>
<template>
  <div class="grid safe-min-height lg:grid-cols-2">
    <div class="flex flex-col gap-4 p-6 md:p-10">
      <div class="flex justify-between">
        <div class="flex gap-2 justify-start">
          <RouterLink
            :to="{ name: 'login' }"
            class="flex items-center gap-2 font-medium"
            @click.prevent="
              () => {
                authMachine.$reset();
              }
            "
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
