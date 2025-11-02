<script setup lang="ts">
import { Toaster } from '@components/atoms/sonner';
import SplashScreen from '@components/pages/SplashScreen.vue';
import { handleDeeplink } from '@utils/deeplink';
import { useColorMode } from '@vueuse/core';
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import 'vue-sonner/style.css';
import { useAppMachine } from './machines/app.machine';
import { useAuthStore } from './stores/auth.stores';
import AppTemplate from './components/templates/AppTemplate.vue';
import { useRuntimeDevice } from './composables/device.composable';
import { createComponentLogger } from './utils/logger';

// Create component-specific logger
const appLogger = createComponentLogger('App');

appLogger.debug('Initializing app components and composables');
const appMachine = useAppMachine();
const authStore = useAuthStore();
const router = useRouter();
const { isTauri } = useRuntimeDevice();

appLogger.debug('Configuring color mode');
useColorMode();

appLogger.debug('Setting up user state watcher');
watch(
  () => authStore.user,
  (newUser, oldUser) => {
    appLogger.debug('User state changed', {
      action: 'user_state_change',
      hasNewUser: !!newUser,
      hadOldUser: !!oldUser,
      appState: appMachine.state.value,
    });

    if (!newUser && oldUser && appMachine.state.matches('loaded')) {
      appLogger.info('User logged out - redirecting to login page', {
        action: 'logout_redirect',
        fromRoute: router.currentRoute.value.name,
      });
      router.push({ name: 'login' });
    }
  },
);

const setupDeeplinks = async () => {
  appLogger.info('Initializing deeplinks system', {
    action: 'deeplinks_init',
    isTauri: isTauri.value,
  });

  if (!isTauri.value) {
    appLogger.info('Skipping deeplinks - not in Tauri environment');
    return;
  }

  try {
    const { getCurrent, onOpenUrl } = await import(
      '@tauri-apps/plugin-deep-link'
    );

    const startUrls = await getCurrent();
    if (startUrls) {
      appLogger.info('Processing startup deeplink URLs', {
        action: 'startup_deeplinks',
        urlCount: startUrls.length,
      });
      handleDeeplink(startUrls);
    }

    await onOpenUrl((urls) => {
      appLogger.info('Processing runtime deeplink URLs', {
        action: 'runtime_deeplinks',
        urlCount: urls.length,
      });
      handleDeeplink(urls);
    });

    appLogger.info('Deeplinks system initialized successfully');
  } catch (error) {
    appLogger.error('Failed to setup deeplinks system', error as Error, {
      action: 'deeplinks_error',
    });
  }
};

onMounted(setupDeeplinks);
</script>

<template>
  <Toaster />
  <div>
    <SplashScreen v-if="appMachine.state.matches('initializing')" />
    <AppTemplate
      v-else-if="
        appMachine.state.matches('loaded')
        && !router.currentRoute.value.meta.isAuthFlow
      "
    />
    <RouterView
      v-else
      class="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
    />
  </div>
</template>

<style scoped></style>
