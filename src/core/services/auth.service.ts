import { AuthenticationRepository } from '@/core/repositories/auth/auth.repository';
import { Credentials, LoginResponse } from '@/core/types/auth';
import { ShallowRef } from 'vue';
import { ErrorResponse, SuccessResponse } from '@core/types/response';

export interface AuthService {
  login: (
    credentials: Credentials,
  ) => Promise<{
    data: ShallowRef<SuccessResponse<LoginResponse> | ErrorResponse | null>;
    error: ShallowRef<any>;
  }>;
}

export const createAuthService = (
  repository: AuthenticationRepository,
): AuthService => ({
  login: (credentials: Credentials) => repository.login(credentials),
});
