import { createFetch, useSessionStorage } from '@vueuse/core';
import { useRouter } from 'vue-router';

import { APP_CONFIG } from '@/config';
import { v4 } from 'uuid';

const sessionCookie = useSessionStorage<string | null>('session', null);
const router = useRouter();

export const usePublicFetch = createFetch({
  baseUrl: APP_CONFIG.api.baseUrl,
  options: {
    beforeFetch({ options }) {
      options.headers = {
        'Content-Type': 'application/json',
        'X-REQUEST-ID': v4(),
        ...options.headers,
      };
      return { options };
    },
    onFetchError({ error, data }) {
      return { error, data };
    },
  },
  fetchOptions: { mode: 'cors' },
});

export const usePrivateFetch = createFetch({
  baseUrl: APP_CONFIG.api.baseUrl,
  options: {
    beforeFetch({ options, cancel }) {
      if (!sessionCookie.value) {
        cancel();
        throw new Error('missing session cookie');
      }

      options.headers = {
        'Content-Type': 'application/json',
        'X-REQUEST-ID': v4(),
        Cookie: sessionCookie.value,
        ...options.headers,
      };
      return { options };
    },
    onFetchError({ error, data, response }) {
      if (response?.status === 401) {
        sessionCookie.value = null;
        router.push('/login');
      }

      console.error('fetch error', error);
      return { error, data };
    },
  },
  fetchOptions: { mode: 'cors', credentials: 'include' },
});
