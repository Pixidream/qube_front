import type {
  AuthenticationResponse,
  Credentials,
  LoginResponse,
  PasswordResetResponse,
} from '@core/types/auth';
import type { Platform } from '@core/types/platform';
import type { SuccessResponse } from '@core/types/response';
import type { ShallowRef } from 'vue';

export interface AuthenticationRepository {
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

  sendPasswordReset: (
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
