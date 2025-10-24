import { useFetch } from '@vueuse/core';
import {
  AskForTotpResponse,
  ChangePasswordBody,
  DisableTotpResponse,
  GetCSRFTokenResponse,
  GetUserFileBody,
  GetUserFileResponse,
  RegenerateRecoveryCodesResponse,
  SetupTotpBody,
  SetupTotpResponse,
  SignupResponse,
  UpdateUserBody,
  UpdateUserResponse,
  VerifyRecoveryCodeBody,
  VerifyRecoveryCodeResponse,
  type AuthenticationResponse,
  type BasicResponse,
  type Credentials,
  type LoginResponse,
  type PasswordResetBody,
  type SendPasswordResetBody,
  type VerifyPasswordBody,
  type VerifyPasswordResponse,
  type VerifyTotpBody,
  type VerifyTotpEmailBody,
} from '@core/types/auth';
import type { Platform } from '@core/types/platform';
import type { ApiResponse, SuccessResponse } from '@core/types/response';
import type { User } from '@core/types/user';
import { APP_CONFIG } from '@/config';
import { v4 } from 'uuid';
import type { AuthenticationRepository } from './auth.repository';
import { AllowedContentType } from '@/core/types/request';
import { toFormData } from '@/utils/formData';
import { createServiceLogger } from '@/utils/logger';
import { useAuthStore } from '@/stores/auth.stores';

const webRepoLogger = createServiceLogger('WebAuthRepository');

const _postRequest = async <T, Y>(
  path: string,
  body: Y,
  contentType: AllowedContentType = 'application/json',
): Promise<ApiResponse<T>> => {
  const requestId = v4();
  const url = `${APP_CONFIG.api.baseUrl}${path}`;
  const authStore = useAuthStore();

  webRepoLogger.debug('Initiating POST request', {
    action: 'http_request',
    method: 'POST',
    path,
    requestId,
    contentType,
  });

  const fetchOptions: RequestInit = {
    method: 'POST',
    headers: {
      ...(contentType === 'application/json' ?
        { 'Content-Type': 'application/json' }
      : {}),
      'X-REQUEST-ID': requestId,
      'X-CSRF-TOKEN': authStore.csrfToken ?? '',
    },
    body:
      contentType === 'application/json' ?
        JSON.stringify(body)
      : toFormData(body as Record<any, unknown>),
    credentials: 'include',
  };

  const { execute, data, error, response } = useFetch(url, fetchOptions, {
    immediate: false,
  }).json<SuccessResponse<T>>();

  const start = performance.now();
  await execute();
  const duration = Math.round(performance.now() - start);

  if (error.value) {
    webRepoLogger.error('POST request failed', error.value as Error, {
      action: 'http_request_error',
      method: 'POST',
      path,
      requestId,
      duration,
      status: response.value?.status,
    });
  } else {
    webRepoLogger.debug('POST request completed', {
      action: 'http_request_success',
      method: 'POST',
      path,
      requestId,
      duration,
      status: response.value?.status,
    });
  }

  return { data, error, response };
};

const _patchRequest = async <T, Y>(
  path: string,
  body: Y,
  contentType: AllowedContentType = 'application/json',
): Promise<ApiResponse<T>> => {
  const requestId = v4();
  const url = `${APP_CONFIG.api.baseUrl}${path}`;
  const authStore = useAuthStore();

  webRepoLogger.debug('Initiating PATCH request', {
    action: 'http_request',
    method: 'PATCH',
    path,
    requestId,
    contentType,
  });

  const fetchOptions: RequestInit = {
    method: 'PATCH',
    headers: {
      ...(contentType === 'application/json' ?
        { 'Content-Type': 'application/json' }
      : {}),
      'X-REQUEST-ID': requestId,
      'X-CSRF-TOKEN': authStore.csrfToken ?? '',
    },
    body:
      contentType === 'application/json' ?
        JSON.stringify(body)
      : toFormData(body as Record<any, unknown>),
    credentials: 'include',
  };

  const { execute, data, error, response } = useFetch(url, fetchOptions, {
    immediate: false,
  }).json<SuccessResponse<T>>();

  const start = performance.now();
  await execute();
  const duration = Math.round(performance.now() - start);

  if (error.value) {
    webRepoLogger.error('PATCH request failed', error.value as Error, {
      action: 'http_request_error',
      method: 'PATCH',
      path,
      requestId,
      duration,
      status: response.value?.status,
    });
  } else {
    webRepoLogger.debug('PATCH request completed', {
      action: 'http_request_success',
      method: 'PATCH',
      path,
      requestId,
      duration,
      status: response.value?.status,
    });
  }

  return { data, error, response };
};

const _getRequest = async <T>(path: string): Promise<ApiResponse<T>> => {
  const requestId = v4();
  const url = `${APP_CONFIG.api.baseUrl}${path}`;

  webRepoLogger.debug('Initiating GET request', {
    action: 'http_request',
    method: 'GET',
    path,
    requestId,
  });

  const fetchOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-REQUEST-ID': requestId,
    },
    credentials: 'include',
  };

  const { execute, data, error, response } = useFetch(url, fetchOptions, {
    immediate: false,
  }).json<SuccessResponse<T>>();

  const start = performance.now();
  await execute();
  const duration = Math.round(performance.now() - start);

  if (error.value) {
    webRepoLogger.error('GET request failed', error.value as Error, {
      action: 'http_request_error',
      method: 'GET',
      path,
      requestId,
      duration,
      status: response.value?.status,
    });
  } else {
    webRepoLogger.debug('GET request completed', {
      action: 'http_request_success',
      method: 'GET',
      path,
      requestId,
      duration,
      status: response.value?.status,
    });
  }

  return { data, error, response };
};

export const createAuthWebRepository = (): AuthenticationRepository => {
  webRepoLogger.info('Creating web authentication repository', {
    action: 'repository_creation',
    type: 'web',
  });

  return {
    login: async (credentials: Credentials) => {
      webRepoLogger.info('Attempting user login', {
        action: 'login',
        email: credentials.email,
      });

      const result = await _postRequest<LoginResponse, Credentials>(
        '/auth/login',
        credentials,
      );

      if (result.error.value) {
        webRepoLogger.warn('Login attempt failed', {
          action: 'login_failed',
          email: credentials.email,
        });
      } else {
        webRepoLogger.info('Login successful', {
          action: 'login_success',
          email: credentials.email,
        });
      }

      return result;
    },

    signup: async (credentials: Credentials) => {
      webRepoLogger.info('Attempting user signup', {
        action: 'signup',
        email: credentials.email,
      });

      const result = await _postRequest<SignupResponse, Credentials>(
        '/auth/signup',
        credentials,
      );

      if (result.error.value) {
        webRepoLogger.warn('Signup attempt failed', {
          action: 'signup_failed',
          email: credentials.email,
        });
      } else {
        webRepoLogger.info('Signup successful', {
          action: 'signup_success',
          email: credentials.email,
        });
      }

      return result;
    },

    verifyTotp: async (totp: string, token: string) => {
      webRepoLogger.info('Verifying TOTP code', {
        action: 'verify_totp',
        hasToken: !!token,
      });

      const result = await _postRequest<AuthenticationResponse, VerifyTotpBody>(
        '/auth/verify-totp',
        { totp, token, timestamp: new Date().toISOString() },
      );

      if (result.error.value) {
        webRepoLogger.warn('TOTP verification failed', {
          action: 'verify_totp_failed',
        });
      } else {
        webRepoLogger.info('TOTP verification successful', {
          action: 'verify_totp_success',
        });
      }

      return result;
    },

    verifyTotpEmail: async (totp: string, token: string) => {
      webRepoLogger.info('Verifying TOTP email code', {
        action: 'verify_totp_email',
        hasToken: !!token,
      });

      const result = await _postRequest<
        AuthenticationResponse,
        VerifyTotpEmailBody
      >('/auth/verify-totp-email', { totp, token });

      if (result.error.value) {
        webRepoLogger.warn('TOTP email verification failed', {
          action: 'verify_totp_email_failed',
        });
      } else {
        webRepoLogger.info('TOTP email verification successful', {
          action: 'verify_totp_email_success',
        });
      }

      return result;
    },

    sendPasswordReset: async (email: string) => {
      // Pour la version web, on utilise 'web' comme plateforme
      const _platform: Platform = 'web';

      webRepoLogger.info('Sending password reset email', {
        action: 'send_password_reset',
        email,
        platform: _platform,
      });

      const result = await _postRequest<BasicResponse, SendPasswordResetBody>(
        '/auth/send-password-reset-email',
        { email, platform: _platform },
      );

      if (result.error.value) {
        webRepoLogger.warn('Password reset email send failed', {
          action: 'send_password_reset_failed',
          email,
        });
      } else {
        webRepoLogger.info('Password reset email sent successfully', {
          action: 'send_password_reset_success',
          email,
        });
      }

      return result;
    },

    resetPassword: async (token: string, new_password: string) => {
      webRepoLogger.info('Resetting user password', {
        action: 'reset_password',
        hasToken: !!token,
      });

      const result = await _postRequest<BasicResponse, PasswordResetBody>(
        '/auth/reset-password',
        { token, new_password },
      );

      if (result.error.value) {
        webRepoLogger.warn('Password reset failed', {
          action: 'reset_password_failed',
        });
      } else {
        webRepoLogger.info('Password reset successful', {
          action: 'reset_password_success',
        });
      }

      return result;
    },

    me: async () => {
      webRepoLogger.debug('Fetching current user profile', {
        action: 'get_user_profile',
      });

      const result = await _getRequest<User>('/users/me');

      if (result.error.value) {
        webRepoLogger.warn('Failed to fetch user profile', {
          action: 'get_user_profile_failed',
        });
      } else {
        webRepoLogger.debug('User profile fetched successfully', {
          action: 'get_user_profile_success',
          userId: result.data.value?.data?.id,
        });
      }

      return result;
    },

    logout: async () => {
      webRepoLogger.info('Logging out user', {
        action: 'logout',
      });

      const result = await _postRequest<BasicResponse, null>(
        '/auth/logout',
        null,
      );

      if (result.error.value) {
        webRepoLogger.warn('Logout failed', {
          action: 'logout_failed',
        });
      } else {
        webRepoLogger.info('Logout successful', {
          action: 'logout_success',
        });
      }

      return result;
    },

    verifyPassword: async (password: string) => {
      webRepoLogger.info('Verifying user password', {
        action: 'verify_password',
      });

      const result = await _postRequest<
        VerifyPasswordResponse,
        VerifyPasswordBody
      >('/auth/verify-password', { password });

      if (result.error.value) {
        webRepoLogger.warn('Password verification failed', {
          action: 'verify_password_failed',
        });
      } else {
        webRepoLogger.info('Password verification successful', {
          action: 'verify_password_success',
        });
      }

      return result;
    },

    askForTotp: async () => {
      webRepoLogger.info('Requesting TOTP setup data', {
        action: 'ask_for_totp',
      });

      const result =
        await _getRequest<AskForTotpResponse>('/auth/ask-for-totp');

      if (result.error.value) {
        webRepoLogger.warn('Failed to get TOTP setup data', {
          action: 'ask_for_totp_failed',
        });
      } else {
        webRepoLogger.info('TOTP setup data retrieved successfully', {
          action: 'ask_for_totp_success',
        });
      }

      return result;
    },

    setupTotp: async (totp: string) => {
      webRepoLogger.info('Setting up TOTP authenticator', {
        action: 'setup_totp',
      });

      const result = await _postRequest<SetupTotpResponse, SetupTotpBody>(
        '/auth/setup-totp',
        { totp, timestamp: new Date().toISOString() },
      );

      if (result.error.value) {
        webRepoLogger.warn('TOTP setup failed', {
          action: 'setup_totp_failed',
        });
      } else {
        webRepoLogger.info('TOTP setup successful', {
          action: 'setup_totp_success',
        });
      }

      return result;
    },

    verifyRecoveryCode: async (recoveryCode: string, token: string) => {
      webRepoLogger.info('Verifying TOTP recovery code', {
        action: 'verify_recovery_code',
        hasToken: !!token,
      });

      const result = await _postRequest<
        VerifyRecoveryCodeResponse,
        VerifyRecoveryCodeBody
      >('/auth/verify-recovery-codes', { code: recoveryCode, token });

      if (result.error.value) {
        webRepoLogger.warn('Recovery code verification failed', {
          action: 'verify_recovery_code_failed',
        });
      } else {
        webRepoLogger.info('Recovery code verification successful', {
          action: 'verify_recovery_code_success',
        });
      }

      return result;
    },

    regenerateRecoveryCodes: async () => {
      webRepoLogger.info('Regenerating TOTP recovery codes', {
        action: 'regenerate_recovery_codes',
      });

      const result = await _postRequest<RegenerateRecoveryCodesResponse, null>(
        '/auth/regenerate-recovery-codes',
        null,
      );

      if (result.error.value) {
        webRepoLogger.warn('Recovery codes regeneration failed', {
          action: 'regenerate_recovery_codes_failed',
        });
      } else {
        webRepoLogger.info('Recovery codes regenerated successfully', {
          action: 'regenerate_recovery_codes_success',
        });
      }

      return result;
    },

    disableTotp: async () => {
      webRepoLogger.info('Disabling TOTP authenticator', {
        action: 'disable_totp',
      });

      const result = await _postRequest<DisableTotpResponse, null>(
        '/auth/disable-totp',
        null,
      );

      if (result.error.value) {
        webRepoLogger.warn('TOTP disable failed', {
          action: 'disable_totp_failed',
        });
      } else {
        webRepoLogger.info('TOTP disabled successfully', {
          action: 'disable_totp_success',
        });
      }

      return result;
    },

    changePassword: async (changePasswordData: ChangePasswordBody) => {
      webRepoLogger.info('Changing user password', {
        action: 'change_password',
      });

      const result = await _postRequest<BasicResponse, ChangePasswordBody>(
        '/auth/change-password',
        changePasswordData,
      );

      if (result.error.value) {
        webRepoLogger.warn('Password change failed', {
          action: 'change_password_failed',
        });
      } else {
        webRepoLogger.info('Password changed successfully', {
          action: 'change_password_success',
        });
      }

      return result;
    },

    updateProfile: async (profileData: UpdateUserBody) => {
      webRepoLogger.info('Updating user profile', {
        action: 'update_profile',
        hasAvatarFile: !!profileData.profile_picture,
      });

      const result = await _patchRequest<UpdateUserResponse, UpdateUserBody>(
        '/users',
        profileData,
        'multipart/form-data',
      );

      if (result.error.value) {
        webRepoLogger.warn('Profile update failed', {
          action: 'update_profile_failed',
        });
      } else {
        webRepoLogger.info('Profile updated successfully', {
          action: 'update_profile_success',
        });
      }

      return result;
    },

    getUserFile: async (fileData: GetUserFileBody) => {
      webRepoLogger.debug('Fetching user file', {
        action: 'get_user_file',
        filename: fileData.filename,
      });

      const result = await _postRequest<GetUserFileResponse, GetUserFileBody>(
        '/users/file',
        fileData,
      );

      if (result.error.value) {
        webRepoLogger.warn('User file fetch failed', {
          action: 'get_user_file_failed',
          filename: fileData.filename,
        });
      } else {
        webRepoLogger.debug('User file fetched successfully', {
          action: 'get_user_file_success',
          filename: fileData.filename,
        });
      }

      return result;
    },

    getCSRFToken: async () => {
      webRepoLogger.debug('Fetching CSRF token', {
        action: 'get_csrf_token',
      });

      const result = await _getRequest<GetCSRFTokenResponse>('/auth/csrf');

      if (result.error.value) {
        webRepoLogger.warn('CSRF token fetch failed', {
          action: 'get_csrf_token',
        });
      } else {
        webRepoLogger.debug('CSRF token fetched successfully', {
          action: 'get_csrf_token',
        });
      }

      return result;
    },
  };
};
