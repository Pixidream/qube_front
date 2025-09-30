import { useRuntimeDevice } from '@composables/device.composable';

/**
 * Utility for refreshing/reloading the application
 * Handles both Tauri and web environments appropriately
 */
export const useAppRefresh = () => {
  const { isTauri, isTauriDesktop } = useRuntimeDevice();

  const refresh = async (): Promise<void> => {
    try {
      window.location.reload();
    } catch (error) {
      console.error('Failed to refresh application:', error);
      window.location.assign(window.location.href);
    }
  };

  /**
   * Get the appropriate refresh method description for UI
   */
  const getRefreshLabel = (): string => {
    return isTauri.value ? 'Restart App' : 'Refresh Page';
  };

  return {
    refresh,
    getRefreshLabel,
    isTauri: isTauri.value,
    isTauriDesktop: isTauriDesktop.value,
  };
};
