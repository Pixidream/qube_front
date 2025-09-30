import { APP_CONFIG } from '@/config';
import { MIN_EXEC_TIME_MS } from '@/core/constants/auth.constants';
import { i18n } from '@/i18n';
import { useAuthMachine } from '@/machines/auth.machine';
import { useAppRefresh } from '@/utils/refresh.util';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';
import { useAuthStore } from './auth.stores';
import { check } from '@tauri-apps/plugin-updater';
import { UpdateSteps } from '@core/types/app';
import { relaunch } from '@tauri-apps/plugin-process';

export const useAppStore = defineStore('appState', () => {
  // ------ Setup ------
  const { t } = i18n.global;
  const { refresh, isTauriDesktop, isTauri } = useAppRefresh();

  // ------ Helpers ------
  const _resetUpdater = () => {
    isAppInitialized.value = false;
    checkingUpdate.value = false;
    downloadingUpdate.value = false;
    downloadUpdateData.value = { contentLength: 0, downloaded: 0 };
    installingUpdate.value = false;
  };

  const _runInitUpdater = async (): Promise<boolean> => {
    // if (import.meta.env.DEV) return true;
    if (!isTauriDesktop) return true; // don't need to check for updated on web

    try {
      checkingUpdate.value = true;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const update = await check();
      checkingUpdate.value = false;

      if (!update) {
        return true;
      }

      downloadingUpdate.value = true;

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            downloadUpdateData.value.contentLength =
              event.data.contentLength ?? 0;
            break;
          case 'Progress':
            downloadUpdateData.value.downloaded += event.data.chunkLength;
            break;
          case 'Finished':
            downloadingUpdate.value = false;
            installingUpdate.value = true;
        }
      });

      installingUpdate.value = false;
      await relaunch();
      return true;
    } catch {
      return false;
    } finally {
      _resetUpdater();
    }
  };

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
  const checkingUpdate = ref(false);
  const downloadingUpdate = ref(false);
  const downloadUpdateData = ref({ contentLength: 0, downloaded: 0 });
  const installingUpdate = ref(false);

  // ------ Getters ------
  const getContentLength = computed(
    () => downloadUpdateData.value.contentLength,
  );
  const getDownloadedSize = computed(() => downloadUpdateData.value.downloaded);
  const getUpdateDownloadProgress = computed(() => {
    const { downloaded, contentLength } = downloadUpdateData.value;

    if (!contentLength) return 0;

    const percent = (downloaded / contentLength) * 100;
    return Math.min(100, Math.max(0, percent));
  });
  const getUpdating = computed(
    () =>
      checkingUpdate.value || downloadingUpdate.value || installingUpdate.value,
  );
  const getUpdatingStep = computed<UpdateSteps>(() => {
    if (checkingUpdate.value) return 'checking';
    if (downloadingUpdate.value) return 'downloading';
    if (installingUpdate.value) return 'installing';

    return 'checking';
  });

  // ------ Actions ------
  const initApp = async (): Promise<boolean> => {
    isAppInitialized.value = false;

    try {
      // Execute all initialization steps (in declared order) with retry logic
      const success = await executeInitSteps(_runInitUpdater, _verifyAuth);

      if (success) {
        if (useAuthStore().user) {
          useAuthMachine().actor.send({ type: 'RESTORE_SESSION' });
        }
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
    // ------ state ------
    isAppInitialized,
    checkingUpdate,
    downloadingUpdate,
    installingUpdate,

    // ------ getters ------
    getContentLength,
    getDownloadedSize,
    getUpdateDownloadProgress,
    getUpdating,
    getUpdatingStep,

    // ------ actions ------
    initApp,
  };
});
