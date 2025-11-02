import { Platform } from '@core/types/platform';
import { User } from '@core/types/user';

export interface Credentials {
  email: string;
  password: string;
}

export interface VerifyTotpBody {
  totp: string;
  token: string;
  timestamp: string;
}

export interface VerifyTotpEmailBody {
  totp: string;
  token: string;
}

export interface SendPasswordResetBody {
  email: string;
  platform: Platform;
}

export interface PasswordResetBody {
  token: string;
  new_password: string;
}

export interface ChangePasswordBody {
  current_password: string;
  new_password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}

export interface SignupBody extends Credentials {
  platform: Platform;
}

export interface SignupResponse {
  message: string;
}

export interface AuthenticationResponse {
  user: User;
  message: string;
}

export interface BasicResponse {
  message: string;
}

export interface VerifyPasswordBody {
  password: string;
}

export interface VerifyPasswordResponse {
  message: string;
  success: boolean;
}

export interface AskForTotpResponse {
  qr_code: string;
  url: string;
}

export interface SetupTotpBody {
  totp: string;
  timestamp: string;
}

export interface SetupTotpResponse {
  message: string;
  totp_recovery_codes: string[];
}

export interface VerifyRecoveryCodeBody {
  code: string;
  token: string;
}

export interface VerifyRecoveryCodeResponse {
  user: User;
  message: string;
}

export interface RegenerateRecoveryCodesResponse {
  message: string;
  totp_recovery_codes: string[];
}

export interface DisableTotpResponse {
  message: string;
}

export interface UpdateUserBody extends Partial<User> {
  profile_picture?: Blob | File;
  platform: Platform;
}

export type UpdateUserResponse = User;

export interface GetUserFileBody {
  filename: string;
}

export interface GetUserFileResponse {
  url: string;
}

export interface GetCSRFTokenResponse {
  token: string;
}

export interface VerifyEmailBody {
  token: string;
}
