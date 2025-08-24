export const appConfig = {
  development: { api: { baseUrl: 'https://127.0.0.1:3000/api/v1' } },
  production: { api: { baseUrl: '' } },
};

export const APP_CONFIG =
  appConfig[import.meta.env.DEV ? 'development' : 'production'];
