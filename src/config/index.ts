import { logger } from '@/utils/logger';

const configLogger = logger.child({ utility: 'appConfig' });

export const appConfig = {
  development: {
    api: { baseUrl: 'https://192.168.1.47:3000/api/v1' },
    initialization: {
      maxRetries: 3,
      retryDelayMs: 10,
    },
  },
  production: {
    api: { baseUrl: 'https://192.168.1.47:3000/api/v1' },
    initialization: {
      maxRetries: 2,
      retryDelayMs: 2000,
    },
  },
};

const environment = import.meta.env.DEV ? 'development' : 'production';

configLogger.info('Loading application configuration', {
  action: 'config_load',
  environment,
  isDev: import.meta.env.DEV,
  apiBaseUrl: appConfig[environment].api.baseUrl,
  maxRetries: appConfig[environment].initialization.maxRetries,
  retryDelayMs: appConfig[environment].initialization.retryDelayMs,
});

export const APP_CONFIG = appConfig[environment];
