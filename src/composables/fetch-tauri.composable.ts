import { fetch } from '@tauri-apps/plugin-http';
import { ref, type ShallowRef } from 'vue';

import { APP_CONFIG } from '@/config';
import { v4 } from 'uuid';

const DANGER_CONFIG = {
  // TODO: DANGER !! REMOVE true before production
  acceptInvalidCerts: true,
  // acceptInvalidCerts: import.meta.env.DEV,
  acceptInvalidHostnames: false,
};

export const useFetchTauri = (endpoint: string) => {
  const data = ref(null);
  const error = ref<any | null>(null);
  const response = ref<Response | null>(null);

  const get = () => ({
    json: <T>() => {
      const execute = async () => {
        try {
          response.value = await fetch(`${APP_CONFIG.api.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-REQUEST-ID': v4(),
            },
            danger: DANGER_CONFIG,
          });

          if (response.value.status === 401) {
            throw new Error('Unauthorized');
          }

          if (!response.value.ok) {
            throw new Error(`HTTP error! status: ${response.value.status}`);
          }

          const result = await response.value.json();
          data.value = result;
        } catch (err: any) {
          error.value = err;
          console.error('Fetch error:', err);
        }
      };

      return { execute, data: data as ShallowRef<T | null>, error, response };
    },
  });

  const post = (payload: any) => ({
    json: <T>() => {
      const execute = async () => {
        try {
          response.value = await fetch(`${APP_CONFIG.api.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-REQUEST-ID': v4(),
            },
            body: JSON.stringify(payload),
            danger: DANGER_CONFIG,
          });

          if (response.value.status === 401) {
            throw new Error('Unauthorized');
          }

          if (!response.value.ok) {
            throw new Error(`HTTP error! status: ${response.value.status}`);
          }

          const result = await response.value.json();
          data.value = result;
        } catch (err) {
          error.value = err;
          console.error('Fetch error:', err);
        }
      };

      return { execute, data: data as ShallowRef<T | null>, error, response };
    },
  });

  return { post, get };
};
