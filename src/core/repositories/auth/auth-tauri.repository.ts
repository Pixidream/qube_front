import { useFetchTauri } from '@/composables/fetch-tauri.composable';
import {
  AskForTotpResponse,
  ChangePasswordBody,
  DisableTotpResponse,
  RegenerateRecoveryCodesResponse,
  SetupTotpBody,
  SetupTotpResponse,
  VerifyPasswordBody,
  VerifyPasswordResponse,
  VerifyRecoveryCodeBody,
  VerifyRecoveryCodeResponse,
  type AuthenticationResponse,
  type BasicResponse,
  type Credentials,
  type LoginResponse,
  type PasswordResetBody,
  type SendPasswordResetBody,
  type VerifyTotpBody,
  type VerifyTotpEmailBody,
} from '@core/types/auth';
import type { Platform } from '@core/types/platform';
import type { ApiResponse, SuccessResponse } from '@core/types/response';
import type { User } from '@core/types/user';
import { platform } from '@tauri-apps/plugin-os';
import type { AuthenticationRepository } from './auth.repository';

const _postRequest = async <T, Y>(
  path: string,
  body: Y,
): Promise<ApiResponse<T>> => {
  const { execute, data, error, response } = useFetchTauri(path)
    .post(body)
    .json<SuccessResponse<T>>();

  await execute();

  return { data, error, response };
};

const _getRequest = async <T>(path: string): Promise<ApiResponse<T>> => {
  const { execute, data, error, response } = useFetchTauri(path)
    .get()
    .json<SuccessResponse<T>>();

  await execute();

  return { data, error, response };
};

export const createAuthTauriRepository = (): AuthenticationRepository => ({
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
    const _platform: Platform = platform();

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

  verifyPassword: async (password: string) => {
    return await _postRequest<VerifyPasswordResponse, VerifyPasswordBody>(
      '/auth/verify-password',
      { password },
    );
  },

  askForTotp: async () => {
    return await _getRequest<AskForTotpResponse>('/auth/ask-for-totp');
  },

  setupTotp: async (totp: string) => {
    return await _postRequest<SetupTotpResponse, SetupTotpBody>(
      '/auth/setup-totp',
      { totp, timestamp: new Date().toISOString() },
    );
  },

  verifyRecoveryCode: async (recoveryCode: string, token: string) => {
    return await _postRequest<
      VerifyRecoveryCodeResponse,
      VerifyRecoveryCodeBody
    >('/auth/verify-recovery-codes', { code: recoveryCode, token });
  },

  regenerateRecoveryCodes: async () => {
    return await _postRequest<RegenerateRecoveryCodesResponse, null>(
      '/auth/regenerate-recovery-codes',
      null,
    );
  },

  disableTotp: async () => {
    return await _postRequest<DisableTotpResponse, null>(
      '/auth/disable-totp',
      null,
    );
  },

  changePassword: async (changePasswordData: ChangePasswordBody) => {
    return await _postRequest<BasicResponse, ChangePasswordBody>(
      '/auth/change-password',
      changePasswordData,
    );
  },
});
