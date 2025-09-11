import type {
  AskForTotpResponse,
  AuthenticationResponse,
  BasicResponse,
  ChangePasswordBody,
  Credentials,
  DisableTotpResponse,
  LoginResponse,
  RegenerateRecoveryCodesResponse,
  SetupTotpResponse,
  VerifyPasswordResponse,
  VerifyRecoveryCodeResponse,
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

  sendPasswordReset: (email: string) => Promise<ApiResponse<BasicResponse>>;

  resetPassword: (
    token: string,
    new_password: string,
  ) => Promise<ApiResponse<BasicResponse>>;

  me: () => Promise<ApiResponse<User>>;

  logout: () => Promise<ApiResponse<BasicResponse>>;

  verifyPassword: (
    password: string,
  ) => Promise<ApiResponse<VerifyPasswordResponse>>;

  askForTotp: () => Promise<ApiResponse<AskForTotpResponse>>;

  setupTotp: (totp: string) => Promise<ApiResponse<SetupTotpResponse>>;

  verifyRecoveryCode: (
    recoveryCode: string,
    token: string,
  ) => Promise<ApiResponse<VerifyRecoveryCodeResponse>>;

  regenerateRecoveryCodes: () => Promise<
    ApiResponse<RegenerateRecoveryCodesResponse>
  >;

  disableTotp: () => Promise<ApiResponse<DisableTotpResponse>>;

  changePassword: (
    changePasswordData: ChangePasswordBody,
  ) => Promise<ApiResponse<BasicResponse>>;
}
