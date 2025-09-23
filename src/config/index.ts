export const appConfig = {
  development: {
    api: { baseUrl: 'https://192.168.1.31:3000/api/v1' },
    initialization: {
      maxRetries: 3,
      retryDelayMs: 1000,
    },
  },
  production: {
    api: { baseUrl: 'https://192.168.1.31:3000/api/v1' },
    initialization: {
      maxRetries: 2,
      retryDelayMs: 2000,
    },
  },
};

export const APP_CONFIG =
  appConfig[import.meta.env.DEV ? 'development' : 'production'];
