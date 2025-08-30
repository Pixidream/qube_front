import { APP_CONFIG } from '@/config';
import { MIN_EXEC_TIME_MS } from '@/core/constants/auth.constants';
import { i18n } from '@/i18n';
import { useAppRefresh } from '@/utils/refresh.util';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { toast } from 'vue-sonner';
import { useAuthStore } from './auth.stores';

export const useAppStore = defineStore('appState', () => {
  // ------ Setup ------
  const { t } = i18n.global;
  const { refresh, isTauri } = useAppRefresh();

  // ------ Helpers ------
  const _verifyAuth = async (): Promise<boolean> => {
    try {
      const authStore = useAuthStore();
      await authStore.me();
      return true;
    } catch (error) {
      console.error('Auth verification failed:', error);
      return false;
    }
  };

  const _delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const executeInitSteps = async (
    ...steps: (() => Promise<boolean>)[]
  ): Promise<boolean> => {
    const { maxRetries, retryDelayMs } = APP_CONFIG.initialization;

    for (const step of steps) {
      let attempts = 0;
      let success = false;

      while (attempts <= maxRetries && !success) {
        if (attempts > 0) {
          toast.info(
            t('app.initialization.retryMessage', {
              count: attempts,
              max: maxRetries,
            }),
          );

          await _delay(retryDelayMs);
        }

        try {
          success = await step();
          attempts++;
        } catch (error) {
          console.error(`Init step failed (attempt ${attempts + 1}):`, error);
          attempts++;
          success = false;
        }
      }

      // If step failed after all retries
      if (!success) {
        const refreshLabel =
          isTauri ?
            t('app.initialization.restartButton')
          : t('app.initialization.refreshButton');

        toast.error(
          t('app.initialization.maxRetriesExceeded', {
            max: maxRetries,
          }),
          {
            action: {
              label: refreshLabel,
              onClick: refresh,
            },
            duration: Infinity,
          },
        );
        return false;
      }
    }

    return true;
  };

  // ------ State ------
  const isAppInitialized = ref(false);

  // ------ Getters ------
  // ------ Actions ------
  const initApp = async (): Promise<boolean> => {
    isAppInitialized.value = false;

    try {
      // Execute all initialization steps with retry logic
      const success = await executeInitSteps(_verifyAuth);

      if (success) {
        // Ensure minimum execution time for UX
        await _delay(MIN_EXEC_TIME_MS);
        isAppInitialized.value = true;
      }

      return success;
    } catch (error) {
      console.error('App initialization failed:', error);
      const refreshLabel =
        isTauri ?
          t('app.initialization.restartButton')
        : t('app.initialization.refreshButton');

      toast.error(
        t('app.initialization.maxRetriesExceeded', {
          max: APP_CONFIG.initialization.maxRetries,
        }),
        {
          action: {
            label: refreshLabel,
            onClick: refresh,
          },
          duration: Infinity,
        },
      );
      return false;
    }
  };

  return {
    isAppInitialized,
    initApp,
  };
});
