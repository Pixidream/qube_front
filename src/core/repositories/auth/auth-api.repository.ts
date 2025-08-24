import { useFetch } from '@/composables/fetch.composable';
import {
  AuthenticationResponse,
  Credentials,
  type LoginResponse,
} from '@/core/types/auth';
import { type SuccessResponse } from '@/core/types/response';
import { AuthenticationRepository } from './auth.repository';

export const createAuthApiRepository = (): AuthenticationRepository => ({
  login: async (credentials: Credentials) => {
    const { execute, data, error } = useFetch('/auth/login')
      .post(credentials)
      .json<SuccessResponse<LoginResponse>>();

    await execute();
    return { data, error };
  },

  verifyTotp: async (totp: string, token: string) => {
    const { execute, data, error } = useFetch('/auth/verify-totp')
      .post({ totp, token, timestamp: new Date().toISOString() })
      .json<SuccessResponse<AuthenticationResponse>>();

    await execute();

    return { data, error };
  },
});
