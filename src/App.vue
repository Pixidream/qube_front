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

const appMachine = useAppMachine();
const authStore = useAuthStore();
const router = useRouter();
const { isTauri } = useRuntimeDevice();

watch(
  () => authStore.user,
  (newUser, oldUser) => {
    if (!newUser && oldUser && appMachine.state.matches('loaded')) {
      router.push({ name: 'login' });
    }
  },
);

const setupDeeplinks = async () => {
  if (!isTauri.value) return;

  try {
    const { getCurrent, onOpenUrl } = await import(
      '@tauri-apps/plugin-deep-link'
    );
    const startUrls = await getCurrent();
    if (startUrls) {
      handleDeeplink(startUrls);
    }

    await onOpenUrl((urls) => {
      handleDeeplink(urls);
    });
  } catch (error) {
    console.error('Failed to setup deeplinks:', error);
  }
};

useColorMode();

onMounted(setupDeeplinks);
</script>

<template>
  <Toaster />
  <div class="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
    <SplashScreen v-if="appMachine.state.matches('initializing')" />
    <AppTemplate
      v-else-if="
        appMachine.state.matches('loaded')
        && !router.currentRoute.value.meta.isAuthFlow
      "
    />
    <RouterView v-else />
  </div>
</template>

<style scoped></style>
