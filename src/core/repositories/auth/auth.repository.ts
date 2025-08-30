import type {
  AuthenticationResponse,
  Credentials,
  LoginResponse,
  PasswordResetResponse,
} from '@core/types/auth';
import type { ApiResponse } from '@core/types/response';
import type { User } from '@core/types/user';

export interface AuthenticationRepository {
  login: (credentials: Credentials) => Promise<ApiResponse<LoginResponse>>;

  verifyTotp: (
    totp: string,
    token: string,
  ) => Promise<ApiResponse<AuthenticationResponse>>;

  verifyTotpEmail: (
    totp: string,
    token: string,
  ) => Promise<ApiResponse<AuthenticationResponse>>;

  sendPasswordReset: (
    email: string,
  ) => Promise<ApiResponse<PasswordResetResponse>>;

  resetPassword: (
    token: string,
    new_password: string,
  ) => Promise<ApiResponse<PasswordResetResponse>>;

  me: () => Promise<ApiResponse<User>>;
}
