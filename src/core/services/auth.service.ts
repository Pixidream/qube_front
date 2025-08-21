import { AuthenticationRepository } from '@/core/repositories/auth/auth.repository';
import {
  AuthenticationResponse,
  Credentials,
  LoginResponse,
} from '@/core/types/auth';
import { ShallowRef } from 'vue';
import { SuccessResponse } from '@core/types/response';

export interface AuthService {
  login: (
    credentials: Credentials,
  ) => Promise<{
    data: ShallowRef<SuccessResponse<LoginResponse> | null>;
    error: ShallowRef<any>;
  }>;

  verifyTotp: (
    totp: string,
    token: string,
  ) => Promise<{
    data: ShallowRef<SuccessResponse<AuthenticationResponse> | null>;
    error: ShallowRef<any>;
  }>;
}

export const createAuthService = (
  repository: AuthenticationRepository,
): AuthService => ({
  login: (credentials: Credentials) => repository.login(credentials),
  verifyTotp: (totp: string, token: string) =>
    repository.verifyTotp(totp, token),
});
