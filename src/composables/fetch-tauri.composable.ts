import { fetch } from '@tauri-apps/plugin-http';
import { ref, type ShallowRef } from 'vue';

import { APP_CONFIG } from '@/config';
import { v4 } from 'uuid';

export const useFetchTauri = (endpoint: string) => {
  const data = ref(null);
  const error = ref<any | null>(null);

  const get = () => ({
    json: <T>() => {
      const execute = async () => {
        try {
          const response = await fetch(`${APP_CONFIG.api.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-REQUEST-ID': v4(),
            },
            danger: {
              acceptInvalidCerts: import.meta.env.DEV,
              acceptInvalidHostnames: false,
            },
          });

          if (response.status === 401) {
            throw new Error('Unauthorized');
          }

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          data.value = result;
        } catch (err: any) {
          error.value = err;
          console.error('Fetch error:', err);
        }
      };

      return { execute, data: data as ShallowRef<T | null>, error };
    },
  });

  const post = (payload: any) => ({
    json: <T>() => {
      const execute = async () => {
        try {
          const response = await fetch(`${APP_CONFIG.api.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-REQUEST-ID': v4(),
            },
            body: JSON.stringify(payload),
            danger: {
              acceptInvalidCerts: import.meta.env.DEV,
              acceptInvalidHostnames: false,
            },
          });

          if (response.status === 401) {
            throw new Error('Unauthorized');
          }

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          data.value = result;
        } catch (err) {
          error.value = err;
          console.error('Public fetch error:', err);
        }
      };

      return { execute, data: data as ShallowRef<T | null>, error };
    },
  });

  return { post, get };
};
