import { fetch } from '@tauri-apps/plugin-http';
import { ref, type ShallowRef } from 'vue';

import { APP_CONFIG } from '@/config';
import { v4 } from 'uuid';
import { AllowedContentType } from '@/core/types/request';
import { toFormData } from '@/utils/formData';
import { logger } from '@/utils/logger';
import { useAuthStore } from '@/stores/auth.stores';

const DANGER_CONFIG = {
  // TODO: DANGER !! REMOVE true before production
  acceptInvalidCerts: import.meta.env.DEV || true,
  // acceptInvalidCerts: import.meta.env.DEV,
  acceptInvalidHostnames: import.meta.env.DEV || true,
};

export const useFetchTauri = (endpoint: string) => {
  const data = ref(null);
  const error = ref<any | null>(null);
  const response = ref<Response | null>(null);

  const fetchLogger = logger.child({
    service: 'fetch-tauri',
    endpoint,
  });

  const get = () => ({
    json: <T>() => {
      const execute = async () => {
        const requestId = v4();
        const url = `${APP_CONFIG.api.baseUrl}${endpoint}`;

        fetchLogger.debug('Starting GET request', {
          action: 'request_start',
          method: 'GET',
          url,
          requestId,
        });

        try {
          const startTime = performance.now();

          response.value = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-REQUEST-ID': requestId,
            },
            danger: DANGER_CONFIG,
          });

          const duration = performance.now() - startTime;

          fetchLogger.debug('GET request completed', {
            action: 'request_complete',
            method: 'GET',
            requestId,
            status: response.value.status,
            statusText: response.value.statusText,
            duration: Math.round(duration),
          });

          if (response.value.status === 401) {
            fetchLogger.warn('GET request unauthorized', {
              action: 'request_unauthorized',
              method: 'GET',
              requestId,
              status: 401,
            });
            throw new Error('Unauthorized');
          }

          if (!response.value.ok) {
            fetchLogger.error('GET request failed with HTTP error', undefined, {
              action: 'request_http_error',
              method: 'GET',
              requestId,
              status: response.value.status,
              statusText: response.value.statusText,
            });
            throw new Error(`HTTP error! status: ${response.value.status}`);
          }

          const result = await response.value.json();
          data.value = result;

          fetchLogger.info('GET request successful', {
            action: 'request_success',
            method: 'GET',
            requestId,
            responseType: 'json',
            hasData: !!result,
          });
        } catch (err: any) {
          error.value = err;
          fetchLogger.error('GET request failed', err, {
            action: 'request_error',
            method: 'GET',
            requestId,
            errorType: err.constructor.name,
          });
        }
      };

      return { execute, data: data as ShallowRef<T | null>, error, response };
    },
  });

  const post = (
    payload: any,
    contentType: AllowedContentType = 'application/json',
  ) => ({
    json: <T>() => {
      const execute = async () => {
        const requestId = v4();
        const url = `${APP_CONFIG.api.baseUrl}${endpoint}`;
        const authStore = useAuthStore();

        fetchLogger.debug('Starting POST request', {
          action: 'request_start',
          method: 'POST',
          url,
          requestId,
          contentType,
          hasPayload: !!payload,
          payloadSize: payload ? JSON.stringify(payload).length : 0,
        });

        try {
          const startTime = performance.now();

          response.value = await fetch(url, {
            method: 'POST',
            headers: {
              ...(contentType === 'application/json' ?
                { 'Content-Type': 'application/json' }
              : {}),
              'X-REQUEST-ID': requestId,
              'X-CSRF-TOKEN': authStore.csrfToken ?? '',
            },
            body:
              contentType === 'application/json' ?
                JSON.stringify(payload)
              : toFormData(payload),
            danger: DANGER_CONFIG,
          });

          const duration = performance.now() - startTime;

          fetchLogger.debug('POST request completed', {
            action: 'request_complete',
            method: 'POST',
            requestId,
            status: response.value.status,
            statusText: response.value.statusText,
            duration: Math.round(duration),
          });

          if (response.value.status === 401) {
            fetchLogger.warn('POST request unauthorized', {
              action: 'request_unauthorized',
              method: 'POST',
              requestId,
              status: 401,
            });
            throw new Error('Unauthorized');
          }

          if (!response.value.ok) {
            fetchLogger.error(
              'POST request failed with HTTP error',
              undefined,
              {
                action: 'request_http_error',
                method: 'POST',
                requestId,
                status: response.value.status,
                statusText: response.value.statusText,
              },
            );
            throw new Error(`HTTP error! status: ${response.value.status}`);
          }

          const result = await response.value.json();
          data.value = result;

          fetchLogger.info('POST request successful', {
            action: 'request_success',
            method: 'POST',
            requestId,
            responseType: 'json',
            hasData: !!result,
          });
        } catch (err) {
          error.value = err;
          fetchLogger.error('POST request failed', err as Error, {
            action: 'request_error',
            method: 'POST',
            requestId,
            errorType: (err as Error).constructor.name,
          });
        }
      };

      return { execute, data: data as ShallowRef<T | null>, error, response };
    },
  });

  const patch = (
    payload: any,
    contentType: AllowedContentType = 'application/json',
  ) => ({
    json: <T>() => {
      const execute = async () => {
        const requestId = v4();
        const url = `${APP_CONFIG.api.baseUrl}${endpoint}`;
        const authStore = useAuthStore();

        fetchLogger.debug('Starting PATCH request', {
          action: 'request_start',
          method: 'PATCH',
          url,
          requestId,
          contentType,
          hasPayload: !!payload,
          payloadSize: payload ? JSON.stringify(payload).length : 0,
        });

        try {
          const startTime = performance.now();

          response.value = await fetch(url, {
            method: 'PATCH',
            headers: {
              ...(contentType === 'application/json' ?
                { 'Content-Type': 'application/json' }
              : {}),
              'X-REQUEST-ID': requestId,
              'X-CSRF-TOKEN': authStore.csrfToken ?? '',
            },
            body:
              contentType === 'application/json' ?
                JSON.stringify(payload)
              : toFormData(payload),
            danger: DANGER_CONFIG,
          });

          const duration = performance.now() - startTime;

          fetchLogger.debug('PATCH request completed', {
            action: 'request_complete',
            method: 'PATCH',
            requestId,
            status: response.value.status,
            statusText: response.value.statusText,
            duration: Math.round(duration),
          });

          if (response.value.status === 401) {
            fetchLogger.warn('PATCH request unauthorized', {
              action: 'request_unauthorized',
              method: 'PATCH',
              requestId,
              status: 401,
            });
            throw new Error('Unauthorized');
          }

          if (!response.value.ok) {
            fetchLogger.error(
              'PATCH request failed with HTTP error',
              undefined,
              {
                action: 'request_http_error',
                method: 'PATCH',
                requestId,
                status: response.value.status,
                statusText: response.value.statusText,
              },
            );
            throw new Error(`HTTP error! status: ${response.value.status}`);
          }

          const result = await response.value.json();
          data.value = result;

          fetchLogger.info('PATCH request successful', {
            action: 'request_success',
            method: 'PATCH',
            requestId,
            responseType: 'json',
            hasData: !!result,
          });
        } catch (err) {
          error.value = err;
          fetchLogger.error('PATCH request failed', err as Error, {
            action: 'request_error',
            method: 'PATCH',
            requestId,
            errorType: (err as Error).constructor.name,
          });
        }
      };

      return { execute, data: data as ShallowRef<T | null>, error, response };
    },
  });

  return { post, get, patch };
};
