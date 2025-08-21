import { usePublicFetch } from '@/composables/fetch.composable';
import { AuthenticationRepository } from './auth.repository';
import { AuthenticationResponse, Credentials } from '@/core/types/auth';
import { type LoginResponse } from '@/core/types/auth';
import { type SuccessResponse } from '@/core/types/response';
import { createCookies } from '@vueuse/integrations/useCookies';

export const createAuthApiRepository = (): AuthenticationRepository => ({
  login: async (credentials: Credentials) => {
    const { execute, data, error } = usePublicFetch('/auth/login', {
      immediate: false,
    })
      .post(credentials)
      .json<SuccessResponse<LoginResponse>>();

    await execute();
    return { data, error };
  },

  verifyTotp: async (totp: string, token: string) => {
    const { execute, data, error } = usePublicFetch('/auth/verify-totp', {
      immediate: true,
    })
      .post({ totp, token, timestamp: new Date().toISOString() })
      .json<SuccessResponse<AuthenticationResponse>>();

    await execute();

    return { data, error };
  },
});
