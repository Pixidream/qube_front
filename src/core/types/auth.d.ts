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

export interface LoginResponse {
  message: string;
  token: string;
}

export interface AuthenticationResponse {
  user: User;
  message: string;
}

export interface BasicResponse {
  message: string;
}
