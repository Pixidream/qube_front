import { useFetch } from '@vueuse/core';
import type {
  AuthenticationResponse,
  BasicResponse,
  Credentials,
  LoginResponse,
  PasswordResetBody,
  SendPasswordResetBody,
  VerifyTotpBody,
  VerifyTotpEmailBody,
} from '@core/types/auth';
import type { Platform } from '@core/types/platform';
import type { ApiResponse, SuccessResponse } from '@core/types/response';
import type { User } from '@core/types/user';
import { APP_CONFIG } from '@/config';
import { v4 } from 'uuid';
import type { AuthenticationRepository } from './auth.repository';

const _postRequest = async <T, Y>(
  path: string,
  body: Y,
): Promise<ApiResponse<T>> => {
  const url = `${APP_CONFIG.api.baseUrl}${path}`;

  const fetchOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-REQUEST-ID': v4(),
    },
    body: JSON.stringify(body),
    credentials: 'include',
  };

  const { execute, data, error, response } = useFetch(url, fetchOptions, {
    immediate: false,
  }).json<SuccessResponse<T>>();

  await execute();

  return { data, error, response };
};

const _getRequest = async <T>(path: string): Promise<ApiResponse<T>> => {
  const url = `${APP_CONFIG.api.baseUrl}${path}`;

  const fetchOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-REQUEST-ID': v4(),
    },
    credentials: 'include',
  };

  const { execute, data, error, response } = useFetch(url, fetchOptions, {
    immediate: false,
  }).json<SuccessResponse<T>>();

  await execute();

  return { data, error, response };
};

export const createAuthWebRepository = (): AuthenticationRepository => {
  return {
    login: async (credentials: Credentials) => {
      return await _postRequest<LoginResponse, Credentials>(
        '/auth/login',
        credentials,
      );
    },

    verifyTotp: async (totp: string, token: string) => {
      return await _postRequest<AuthenticationResponse, VerifyTotpBody>(
        '/auth/verify-totp',
        { totp, token, timestamp: new Date().toISOString() },
      );
    },

    verifyTotpEmail: async (totp: string, token: string) => {
      return await _postRequest<AuthenticationResponse, VerifyTotpEmailBody>(
        '/auth/verify-totp-email',
        { totp, token },
      );
    },

    sendPasswordReset: async (email: string) => {
      // Pour la version web, on utilise 'web' comme plateforme
      const _platform: Platform = 'web';

      return await _postRequest<BasicResponse, SendPasswordResetBody>(
        '/auth/send-password-reset-email',
        { email, platform: _platform },
      );
    },

    resetPassword: async (token: string, new_password: string) => {
      return await _postRequest<BasicResponse, PasswordResetBody>(
        '/auth/reset-password',
        { token, new_password },
      );
    },

    me: async () => {
      return await _getRequest<User>('/users/me');
    },

    logout: async () => {
      return await _postRequest<BasicResponse, null>('/auth/logout', null);
    },
  };
};
