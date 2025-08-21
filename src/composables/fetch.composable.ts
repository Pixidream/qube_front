import { createFetch } from '@vueuse/core';
import { useRouter } from 'vue-router';

import { APP_CONFIG } from '@/config';
import { v4 } from 'uuid';
import { setCookieFromHeader } from '@/utils/cookieParser';
import { useCookies } from '@vueuse/integrations/useCookies.mjs';

const router = useRouter();
const cookies = useCookies();

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
    afterFetch({ data, response }) {
      const setCookieHeaders = response.headers.getSetCookie();
      console.log(document.cookie);
      console.log(setCookieHeaders);
      console.log(
        response.headers.forEach((header) => {
          console.log(header);
        }),
      );
      console.log(response.headers.get('Set-Cookie'));

      if (setCookieHeaders) {
        const parsedCookies = setCookieFromHeader(setCookieHeaders);
        console.log(parsedCookies);
      }

      return { data };
    },
    onFetchError({ error, data }) {
      return { error, data };
    },
  },
  fetchOptions: { mode: 'cors', credentials: 'include' },
});

export const usePrivateFetch = createFetch({
  baseUrl: APP_CONFIG.api.baseUrl,
  options: {
    beforeFetch({ options, cancel }) {
      const sessionCookie = cookies.get('id');
      if (!sessionCookie.value) {
        cancel();
        throw new Error('missing session cookie');
      }

      options.headers = {
        'Content-Type': 'application/json',
        'X-REQUEST-ID': v4(),
        Cookie: `id=${sessionCookie}`,
        ...options.headers,
      };
      return { options };
    },
    afterFetch({ data, response }) {
      const setCookieHeaders = response.headers.getSetCookie();

      if (setCookieHeaders) {
        setCookieFromHeader(setCookieHeaders);
      }

      return { data };
    },
    onFetchError({ error, data, response }) {
      if (response?.status === 401) {
        cookies.remove('id');
        router.push('/login');
      }

      console.error('fetch error', error);
      return { error, data };
    },
  },
  fetchOptions: { mode: 'cors', credentials: 'include' },
});
