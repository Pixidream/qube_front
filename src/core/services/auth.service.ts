import type { AuthenticationRepository } from '@/core/repositories/auth/auth.repository';
import type {
  AuthenticationResponse,
  Credentials,
  LoginResponse,
  PasswordResetResponse,
} from '@core/types/auth';
import type { Platform } from '@core/types/platform';
import type { SuccessResponse } from '@core/types/response';
import type { ShallowRef } from 'vue';

export interface AuthService {
  login: (credentials: Credentials) => Promise<{
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

  verifyTotpEmail: (
    totp: string,
    token: string,
  ) => Promise<{
    data: ShallowRef<SuccessResponse<AuthenticationResponse> | null>;
    error: ShallowRef<any>;
  }>;

  sendResetPassword: (
    email: string,
    platform: Platform,
  ) => Promise<{
    data: ShallowRef<SuccessResponse<PasswordResetResponse> | null>;
    error: ShallowRef<any>;
  }>;

  resetPassword: (
    token: string,
    new_password: string,
  ) => Promise<{
    data: ShallowRef<SuccessResponse<PasswordResetResponse> | null>;
    error: ShallowRef<any>;
  }>;
}

export const createAuthService = (
  repository: AuthenticationRepository,
): AuthService => ({
  login: (credentials: Credentials) => repository.login(credentials),
  verifyTotp: (totp: string, token: string) =>
    repository.verifyTotp(totp, token),
  verifyTotpEmail: (totp: string, token: string) =>
    repository.verifyTotpEmail(totp, token),
  sendResetPassword: (email: string, platform: Platform) =>
    repository.sendPasswordReset(email, platform),
  resetPassword: (token: string, new_password: string) =>
    repository.resetPassword(token, new_password),
});
