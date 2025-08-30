import { MIN_EXEC_TIME_MS } from '@/core/constants/auth.constants';
import { defineStore } from 'pinia';
import { useAuthStore } from './auth.stores';

export const useAppStore = defineStore('appState', () => {
  // ------ Setup ------
  // ------ Helpers ------
  const _verifyAuth = async (): Promise<boolean> => {
    const authStore = useAuthStore();
    authStore.me();

    return true;
  };
  // ------ State ------
  // ------ Getters ------
  // ------ Actions ------
  const initApp = async () => {
    // 1. verify authentication
    await _verifyAuth();

    // end. min exec time
    await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));
  };

  return {
    initApp,
  };
});
