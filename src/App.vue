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

console.log('[APP] loading appMachine, authStore, router, isTauri.');
const appMachine = useAppMachine();
const authStore = useAuthStore();
const router = useRouter();
const { isTauri } = useRuntimeDevice();

console.log('[APP] Loading color mode.');
useColorMode();

console.log('[APP] adding watchter on authStore.user');
watch(
  () => authStore.user,
  (newUser, oldUser) => {
    console.log(
      `[APP] authStore.user changed. new: ${newUser} /// old: ${oldUser}`,
    );
    if (!newUser && oldUser && appMachine.state.matches('loaded')) {
      console.log(
        '[APP] new user is null and a user was present. Redirecting to Login page.',
      );
      router.push({ name: 'login' });
    }
  },
);

const setupDeeplinks = async () => {
  console.log('[APP] Setting up deeplinks');
  if (!isTauri.value) {
    console.log('[APP] Not a tauri env, skipping deeplinks');
    return;
  }

  try {
    const { getCurrent, onOpenUrl } = await import(
      '@tauri-apps/plugin-deep-link'
    );
    const startUrls = await getCurrent();
    if (startUrls) {
      console.log('[APP] Found startup URLs.');
      handleDeeplink(startUrls);
    }

    await onOpenUrl((urls) => {
      console.log('[APP] Received deeplink URLs at runtime.');
      handleDeeplink(urls);
    });
  } catch (error) {
    console.error('[APP] Failed to setup deeplinks:', error);
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
