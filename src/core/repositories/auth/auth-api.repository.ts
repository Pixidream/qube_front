import { usePublicFetch } from '@/composables/fetch.composable';
import { AuthenticationRepository } from './auth.repository';
import { Credentials } from '@/core/types/auth';
import { type LoginResponse } from '@/core/types/auth';
import { ErrorResponse, type SuccessResponse } from '@/core/types/response';

export const createAuthApiRepository = (): AuthenticationRepository => ({
  login: async (credentials: Credentials) => {
    const { execute, data, error } = usePublicFetch('/auth/login', {
      immediate: false,
    })
      .post(credentials)
      .json<SuccessResponse<LoginResponse> | ErrorResponse>();

    await execute();
    return { data, error };
  },
});
