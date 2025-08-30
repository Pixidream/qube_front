import { MIN_EXEC_TIME_MS } from '@/core/constants/auth.constants';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './auth.stores';

export const useAppStore = defineStore('appState', () => {
  // ------ Setup ------
  // ------ Helpers ------
  const _verifyAuth = async (): Promise<boolean> => {
    const authStore = useAuthStore();
    await authStore.me();

    return true;
  };

  const _executeInitSteps = async (
    ...steps: (() => Promise<boolean>)[]
  ): Promise<boolean> => {
    for (const step of steps) {
      const result = await step();
      if (!result) return false;
    }

    return true;
  };
  // ------ State ------
  const isAppInitialized = ref(false);
  // ------ Getters ------
  // ------ Actions ------
  const initApp = async () => {
    isAppInitialized.value = false;

    // verification steps. put in the order you want them executed. method short-circuit.
    const success = await _executeInitSteps(_verifyAuth);

    // end. min exec time
    await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));

    isAppInitialized.value = success;
  };

  return {
    isAppInitialized,

    initApp,
  };
});
