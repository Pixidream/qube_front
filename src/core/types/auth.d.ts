import { User } from './user';

export interface Credentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}

export interface AuthenticationResponse {
  user: User;
  message: string;
}

export interface PasswordResetResponse {
  message: string;
}
