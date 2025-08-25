import type {
  AuthenticationResponse,
  Credentials,
  LoginResponse,
  PasswordResetResponse,
} from '@core/types/auth';
import type { SuccessResponse } from '@core/types/response';
import { ShallowRef } from 'vue';

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

  sendPasswordReset: (email: string) => Promise<{
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
