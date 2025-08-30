<script setup lang="ts">
import { useAppMachine } from '@/machines/app.machine';
import { useAppStore } from '@/stores/app.stores';
import { useAuthStore } from '@/stores/auth.stores';
import AppLogo from '@assets/images/logo.png';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const appStore = useAppStore();
const appMachine = useAppMachine();
const authStore = useAuthStore();
const router = useRouter();

appMachine.actor.subscribe((snapshot) => {
  if (!authStore.isAuthenticated && snapshot.matches('loaded')) {
    router.push({ name: 'login' });
  }
});

const initApp = async () => {
  const success = await appStore.initApp();
  if (success) {
    appMachine.actor.send({ type: 'LOADED' });
  }
};

onMounted(() => {
  initApp();
});
</script>
<template>
  <div
    class="safe-height w-dvw flex flex-col justify-center items-center bg-background"
  >
    <div class="flex flex-col items-center space-y-6">
      <div class="animate-fade-in">
        <img
          :src="AppLogo"
          alt="application logo"
          class="w-20 h-20 object-contain"
        />
      </div>
      <div class="text-center animate-fade-in">
        <h1 class="text-2xl font-semibold text-foreground tracking-tight">
          {{ t('app.name') }}
        </h1>
      </div>
      <div class="flex space-x-1">
        <div
          class="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"
        ></div>
        <div
          class="w-2 h-2 bg-muted-foreground rounded-full animate-pulse animation-delay-200"
        ></div>
        <div
          class="w-2 h-2 bg-muted-foreground rounded-full animate-pulse animation-delay-400"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 1.2s ease-out forwards;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-300 {
  animation-delay: 0.3s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}
</style>
