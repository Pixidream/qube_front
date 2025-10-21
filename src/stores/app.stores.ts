import { APP_CONFIG } from '@/config';
import { MIN_EXEC_TIME_MS } from '@/core/constants/auth.constants';
import { i18n } from '@/i18n';
import { useAuthMachine } from '@/machines/auth.machine';
import { useAppRefresh } from '@/utils/refresh.util';
import { createStoreLogger } from '@/utils/logger';
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
  const appLogger = createStoreLogger('AppStore');

  // ------ Helpers ------
  const _resetUpdater = () => {
    appLogger.debug('Resetting updater state', {
      action: 'reset_updater',
    });
    isAppInitialized.value = false;
    checkingUpdate.value = false;
    downloadingUpdate.value = false;
    downloadUpdateData.value = { contentLength: 0, downloaded: 0 };
    installingUpdate.value = false;
  };

  const _runInitUpdater = async (): Promise<boolean> => {
    // if (import.meta.env.DEV) return true;
    if (!isTauriDesktop) {
      appLogger.debug('Skipping updater - not a Tauri desktop environment', {
        action: 'skip_updater',
        environment: 'web',
      });
      return true;
    }

    try {
      appLogger.info('Starting application update check', {
        action: 'update_check_start',
      });
      checkingUpdate.value = true;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const update = await check();
      checkingUpdate.value = false;

      if (!update) {
        appLogger.info('No updates available', {
          action: 'update_check_complete',
          hasUpdate: false,
        });
        return true;
      }

      appLogger.info('Update found - starting download', {
        action: 'update_download_start',
        hasUpdate: true,
      });
      downloadingUpdate.value = true;

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            downloadUpdateData.value.contentLength =
              event.data.contentLength ?? 0;
            appLogger.debug('Update download started', {
              action: 'update_download_started',
              contentLength: event.data.contentLength,
            });
            break;
          case 'Progress': {
            downloadUpdateData.value.downloaded += event.data.chunkLength;
            const progress =
              (downloadUpdateData.value.downloaded
                / downloadUpdateData.value.contentLength)
              * 100;
            appLogger.trace('Update download progress', {
              action: 'update_download_progress',
              downloaded: downloadUpdateData.value.downloaded,
              total: downloadUpdateData.value.contentLength,
              progress: Math.round(progress),
            });
            break;
          }
          case 'Finished':
            downloadingUpdate.value = false;
            installingUpdate.value = true;
            appLogger.info('Update download finished - starting installation', {
              action: 'update_install_start',
            });
        }
      });

      installingUpdate.value = false;
      appLogger.info('Update installation complete - relaunching application', {
        action: 'update_relaunch',
      });
      await relaunch();
      return true;
    } catch (error) {
      appLogger.error('Update process failed', error as Error, {
        action: 'update_error',
      });
      return false;
    } finally {
      _resetUpdater();
    }
  };

  const _verifyAuth = async (): Promise<boolean> => {
    appLogger.debug('Starting authentication verification', {
      action: 'auth_verify_start',
    });

    try {
      const authStore = useAuthStore();
      await authStore.me();
      appLogger.info('Authentication verification successful', {
        action: 'auth_verify_success',
        hasUser: !!authStore.user,
      });
      return true;
    } catch (error) {
      appLogger.warn('Authentication verification failed', {
        action: 'auth_verify_failed',
        error: (error as Error).message,
      });
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

    appLogger.info('Starting initialization steps execution', {
      action: 'init_steps_start',
      stepCount: steps.length,
      maxRetries,
    });

    for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
      const step = steps[stepIndex];
      let attempts = 0;
      let success = false;

      appLogger.debug(`Executing initialization step ${stepIndex + 1}`, {
        action: 'init_step_start',
        stepIndex: stepIndex + 1,
        totalSteps: steps.length,
      });

      while (attempts <= maxRetries && !success) {
        if (attempts > 0) {
          appLogger.warn(`Retrying initialization step ${stepIndex + 1}`, {
            action: 'init_step_retry',
            stepIndex: stepIndex + 1,
            attempt: attempts,
            maxRetries,
          });

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

          if (success) {
            appLogger.info(
              `Initialization step ${stepIndex + 1} completed successfully`,
              {
                action: 'init_step_success',
                stepIndex: stepIndex + 1,
                attempts,
              },
            );
          }
        } catch (error) {
          appLogger.error(
            `Initialization step ${stepIndex + 1} failed`,
            error as Error,
            {
              action: 'init_step_failed',
              stepIndex: stepIndex + 1,
              attempt: attempts + 1,
              maxRetries,
            },
          );
          attempts++;
          success = false;
        }
      }

      if (!success) {
        appLogger.error(
          `Initialization step ${stepIndex + 1} failed after maximum retries`,
          undefined,
          {
            action: 'init_step_max_retries_exceeded',
            stepIndex: stepIndex + 1,
            maxRetries,
            attempts,
          },
        );

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

    appLogger.info('All initialization steps completed successfully', {
      action: 'init_steps_complete',
      stepCount: steps.length,
    });
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
    appLogger.info('Starting application initialization', {
      action: 'app_init_start',
      environment: isTauri ? 'tauri' : 'web',
    });

    isAppInitialized.value = false;

    try {
      // Execute all initialization steps (in declared order) with retry logic
      const success = await appLogger.measure(
        'App initialization',
        async () => executeInitSteps(_runInitUpdater, _verifyAuth),
        { action: 'app_init_execution' },
      );

      if (success) {
        const authStore = useAuthStore();
        if (authStore.user) {
          appLogger.info('Restoring user session', {
            action: 'session_restore',
            userId: authStore.user.id,
          });
          useAuthMachine().actor.send({ type: 'RESTORE_SESSION' });
        }

        // Ensure minimum execution time for UX
        appLogger.debug('Applying minimum execution time for UX', {
          action: 'min_exec_time',
          duration: MIN_EXEC_TIME_MS,
        });
        await _delay(MIN_EXEC_TIME_MS);

        isAppInitialized.value = true;
        appLogger.info('Application initialization completed successfully', {
          action: 'app_init_success',
          hasUser: !!authStore.user,
        });
      }

      return success;
    } catch (error) {
      appLogger.error(
        'Application initialization failed catastrophically',
        error as Error,
        {
          action: 'app_init_catastrophic_failure',
        },
      );

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
