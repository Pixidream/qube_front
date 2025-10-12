import { useRuntimeDevice } from '@composables/device.composable';

/**
 * Utility for refreshing/reloading the application
 * Handles both Tauri and web environments appropriately
 */
export const useAppRefresh = () => {
  const { isTauri, isTauriDesktop } = useRuntimeDevice();

  const refresh = async (): Promise<void> => {
    try {
      console.log('[REFRESHUTIL] Reloading window.');
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
    const refreshLabel = isTauri.value ? 'Restart App' : 'Refresh Page';
    console.debug(`[REFRESHUTIL] getting refresh label: ${refreshLabel}`);
    return refreshLabel;
  };

  return {
    refresh,
    getRefreshLabel,
    isTauri: isTauri.value,
    isTauriDesktop: isTauriDesktop.value,
  };
};
