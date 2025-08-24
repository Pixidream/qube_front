import { SuccessResponse } from '@/core/types/response';
import {
  AuthenticationResponse,
  Credentials,
  LoginResponse,
} from '@core/types/auth';
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
}
