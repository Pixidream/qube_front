import { useRuntimeDevice } from '@composables/device.composable';
import { logger } from './logger';

const refreshLogger = logger.child({ utility: 'appRefresh' });

/**
 * Utility for refreshing/reloading the application
 * Handles both Tauri and web environments appropriately
 */
export const useAppRefresh = () => {
  const { isTauri, isTauriDesktop } = useRuntimeDevice();

  const refresh = async (): Promise<void> => {
    refreshLogger.info('Initiating application refresh', {
      action: 'refresh_start',
      isTauri: isTauri.value,
      isTauriDesktop: isTauriDesktop.value,
    });

    try {
      refreshLogger.debug('Reloading window', {
        action: 'window_reload',
        method: 'location.reload',
      });
      window.location.reload();
    } catch (error) {
      refreshLogger.error(
        'Failed to refresh application with reload, trying assign',
        error as Error,
        {
          action: 'refresh_fallback',
          method: 'location.assign',
        },
      );
      window.location.assign(window.location.href);
    }
  };

  /**
   * Get the appropriate refresh method description for UI
   */
  const getRefreshLabel = (): string => {
    const refreshLabel = isTauri.value ? 'Restart App' : 'Refresh Page';

    refreshLogger.debug('Getting refresh label', {
      action: 'get_refresh_label',
      label: refreshLabel,
      isTauri: isTauri.value,
    });

    return refreshLabel;
  };

  return {
    refresh,
    getRefreshLabel,
    isTauri: isTauri.value,
    isTauriDesktop: isTauriDesktop.value,
  };
};
