<script setup lang="ts">
import { Toaster } from '@components/atoms/sonner';
import { getCurrent, onOpenUrl } from '@tauri-apps/plugin-deep-link';
import { handleDeeplink } from '@utils/deeplink';
import { useColorMode } from '@vueuse/core';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import 'vue-sonner/style.css';
const router = useRouter();
const setupDeeplinks = async () => {
  const startUrls = await getCurrent();
  if (startUrls) {
    handleDeeplink(startUrls, router);
  }

  await onOpenUrl((urls) => {
    handleDeeplink(urls, router);
  });
};

useColorMode();

onMounted(setupDeeplinks);
</script>

<template>
  <Toaster />
  <div class="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
    <RouterView />
  </div>
</template>

<style scoped></style>
