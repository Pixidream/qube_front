import type { AuthenticationRepository } from '@/core/repositories/auth/auth.repository';
import type {
  AuthenticationResponse,
  BasicResponse,
  Credentials,
  LoginResponse,
} from '@core/types/auth';
import type { ApiResponse } from '@core/types/response';
import type { User } from '@core/types/user';

export interface AuthService {
  login: (credentials: Credentials) => Promise<ApiResponse<LoginResponse>>;

  verifyTotp: (
    totp: string,
    token: string,
  ) => Promise<ApiResponse<AuthenticationResponse>>;

  verifyTotpEmail: (
    totp: string,
    token: string,
  ) => Promise<ApiResponse<AuthenticationResponse>>;

  sendResetPassword: (email: string) => Promise<ApiResponse<BasicResponse>>;

  resetPassword: (
    token: string,
    new_password: string,
  ) => Promise<ApiResponse<BasicResponse>>;

  me: () => Promise<ApiResponse<User>>;

  logout: () => Promise<ApiResponse<BasicResponse>>;
}

export const createAuthService = (
  repository: AuthenticationRepository,
): AuthService => ({
  login: (credentials: Credentials) => repository.login(credentials),
  verifyTotp: (totp: string, token: string) =>
    repository.verifyTotp(totp, token),
  verifyTotpEmail: (totp: string, token: string) =>
    repository.verifyTotpEmail(totp, token),
  sendResetPassword: (email: string) => repository.sendPasswordReset(email),
  resetPassword: (token: string, new_password: string) =>
    repository.resetPassword(token, new_password),
  me: () => repository.me(),
  logout: () => repository.logout(),
});
