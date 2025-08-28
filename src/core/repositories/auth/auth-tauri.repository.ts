import { useFetchTauri } from '@/composables/fetch-tauri.composable';
import type {
  AuthenticationResponse,
  Credentials,
  LoginResponse,
  PasswordResetResponse,
} from '@core/types/auth';
import type { Platform } from '@core/types/platform';
import type { SuccessResponse } from '@core/types/response';
import { platform } from '@tauri-apps/plugin-os';
import type { AuthenticationRepository } from './auth.repository';

export const createAuthTauriRepository = (): AuthenticationRepository => ({
  login: async (credentials: Credentials) => {
    const { execute, data, error } = useFetchTauri('/auth/login')
      .post(credentials)
      .json<SuccessResponse<LoginResponse>>();

    await execute();
    return { data, error };
  },

  verifyTotp: async (totp: string, token: string) => {
    const { execute, data, error } = useFetchTauri('/auth/verify-totp')
      .post({ totp, token, timestamp: new Date().toISOString() })
      .json<SuccessResponse<AuthenticationResponse>>();

    await execute();

    return { data, error };
  },

  verifyTotpEmail: async (totp: string, token: string) => {
    const { execute, data, error } = useFetchTauri('/auth/verify-totp-email')
      .post({ totp, token })
      .json<SuccessResponse<AuthenticationResponse>>();

    await execute();

    return { data, error };
  },

  sendPasswordReset: async (email: string) => {
    const _platform: Platform = platform();
    const { execute, data, error } = useFetchTauri(
      '/auth/send-password-reset-email',
    )
      .post({ email, platform: _platform })
      .json<SuccessResponse<PasswordResetResponse>>();

    await execute();

    return { data, error };
  },

  resetPassword: async (token: string, new_password: string) => {
    const { execute, data, error } = useFetchTauri('/auth/reset-password')
      .post({ token, new_password })
      .json<SuccessResponse<PasswordResetResponse>>();

    await execute();

    return { data, error };
  },
});
