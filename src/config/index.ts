import { logger } from '@/utils/logger';

const configLogger = logger.child({ utility: 'appConfig' });

export const appConfig = {
  api: { baseUrl: import.meta.env.VITE_API_BASE_URL },
  initialization: {
    maxRetries: import.meta.env.VITE_INIT_MAX_RETRIES,
    retryDelayMs: import.meta.env.VITE_INIT_RETRY_DELAY_MS,
  },
};

const environment = import.meta.env.DEV ? 'development' : 'production';

configLogger.info('Loading application configuration', {
  action: 'config_load',
  environment,
  isDev: import.meta.env.DEV,
  apiBaseUrl: appConfig.api.baseUrl,
  maxRetries: appConfig.initialization.maxRetries,
  retryDelayMs: appConfig.initialization.retryDelayMs,
});

export const APP_CONFIG = appConfig;
