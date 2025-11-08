import type { AuthenticationRepository } from '@/core/repositories/auth/auth.repository';
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
  UpdateUserBody,
  UpdateUserResponse,
  GetUserFileBody,
  GetUserFileResponse,
  GetCSRFTokenResponse,
  SignupResponse,
  VerifyEmailBody,
  SignupBody,
} from '@core/types/auth';
import type { ApiResponse } from '@core/types/response';
import type { User } from '@core/types/user';
import { createServiceLogger } from '@/utils/logger';

export interface AuthService {
  login: (credentials: Credentials) => Promise<ApiResponse<LoginResponse>>;

  signup: (credentials: SignupBody) => Promise<ApiResponse<SignupResponse>>;

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

  updateProfile: (
    profileData: UpdateUserBody,
  ) => Promise<ApiResponse<UpdateUserResponse>>;

  getUserFile: (
    fileData: GetUserFileBody,
  ) => Promise<ApiResponse<GetUserFileResponse>>;

  getCSRFToken: () => Promise<ApiResponse<GetCSRFTokenResponse>>;

  verifyEmail: (body: VerifyEmailBody) => Promise<ApiResponse<BasicResponse>>;

  resendEmailVerification: (
    email: string,
  ) => Promise<ApiResponse<BasicResponse>>;
}

export const createAuthService = (
  repository: AuthenticationRepository,
): AuthService => {
  const authServiceLogger = createServiceLogger('AuthService');

  authServiceLogger.debug('Creating auth service instance', {
    action: 'service_creation',
    repositoryType: repository.constructor.name,
  });

  return {
    login: async (credentials: Credentials) => {
      authServiceLogger.info('Login attempt started', {
        action: 'login_start',
        email: credentials.email,
        hasPassword: !!credentials.password,
      });

      try {
        const result = await repository.login(credentials);
        authServiceLogger.info('Login attempt completed', {
          action: 'login_complete',
          email: credentials.email,
          success: !result.error.value,
          status: result.response.value?.status,
        });
        return result;
      } catch (error) {
        authServiceLogger.error('Login attempt failed', error as Error, {
          action: 'login_error',
          email: credentials.email,
        });
        throw error;
      }
    },

    signup: async (credentials: SignupBody) => {
      authServiceLogger.info('Signup attempt started', {
        action: 'signup_start',
        email: credentials.email,
        username: credentials.username,
        hasPassword: !!credentials.password,
      });

      try {
        const result = await repository.signup(credentials);
        authServiceLogger.info('Signup attempt completed', {
          action: 'signup_complete',
          email: credentials.email,
          success: !result.error.value,
          status: result.response.value?.status,
        });

        return result;
      } catch (error) {
        authServiceLogger.error('Signup attempt failed', error as Error, {
          action: 'signup_error',
          email: credentials.email,
        });
        throw error;
      }
    },

    verifyTotp: async (totp: string, token: string) => {
      authServiceLogger.info('TOTP verification started', {
        action: 'verify_totp_start',
        hasTotp: !!totp,
        hasToken: !!token,
      });

      try {
        const result = await repository.verifyTotp(totp, token);
        authServiceLogger.info('TOTP verification completed', {
          action: 'verify_totp_complete',
          success: !result.error.value,
          status: result.response.value?.status,
        });
        return result;
      } catch (error) {
        authServiceLogger.error('TOTP verification failed', error as Error, {
          action: 'verify_totp_error',
        });
        throw error;
      }
    },

    verifyTotpEmail: async (totp: string, token: string) => {
      authServiceLogger.info('Email TOTP verification started', {
        action: 'verify_totp_email_start',
        hasTotp: !!totp,
        hasToken: !!token,
      });

      try {
        const result = await repository.verifyTotpEmail(totp, token);
        authServiceLogger.info('Email TOTP verification completed', {
          action: 'verify_totp_email_complete',
          success: !result.error.value,
          status: result.response.value?.status,
        });
        return result;
      } catch (error) {
        authServiceLogger.error(
          'Email TOTP verification failed',
          error as Error,
          {
            action: 'verify_totp_email_error',
          },
        );
        throw error;
      }
    },

    sendResetPassword: async (email: string) => {
      authServiceLogger.info('Password reset request started', {
        action: 'send_reset_password_start',
        email,
      });

      try {
        const result = await repository.sendPasswordReset(email);
        authServiceLogger.info('Password reset request completed', {
          action: 'send_reset_password_complete',
          email,
          success: !result.error.value,
          status: result.response.value?.status,
        });
        return result;
      } catch (error) {
        authServiceLogger.error(
          'Password reset request failed',
          error as Error,
          {
            action: 'send_reset_password_error',
            email,
          },
        );
        throw error;
      }
    },

    resetPassword: async (token: string, new_password: string) => {
      authServiceLogger.info('Password reset started', {
        action: 'reset_password_start',
        hasToken: !!token,
        hasNewPassword: !!new_password,
      });

      try {
        const result = await repository.resetPassword(token, new_password);
        authServiceLogger.info('Password reset completed', {
          action: 'reset_password_complete',
          success: !result.error.value,
          status: result.response.value?.status,
        });
        return result;
      } catch (error) {
        authServiceLogger.error('Password reset failed', error as Error, {
          action: 'reset_password_error',
        });
        throw error;
      }
    },

    me: async () => {
      authServiceLogger.debug('User profile fetch started', {
        action: 'me_start',
      });

      try {
        const result = await repository.me();
        authServiceLogger.debug('User profile fetch completed', {
          action: 'me_complete',
          success: !result.error.value,
          status: result.response.value?.status,
          hasUser: !!result.data.value,
        });
        return result;
      } catch (error) {
        authServiceLogger.error('User profile fetch failed', error as Error, {
          action: 'me_error',
        });
        throw error;
      }
    },

    logout: async () => {
      authServiceLogger.info('Logout started', {
        action: 'logout_start',
      });

      try {
        const result = await repository.logout();
        authServiceLogger.info('Logout completed', {
          action: 'logout_complete',
          success: !result.error.value,
          status: result.response.value?.status,
        });
        return result;
      } catch (error) {
        authServiceLogger.error('Logout failed', error as Error, {
          action: 'logout_error',
        });
        throw error;
      }
    },

    verifyPassword: async (password: string) => {
      authServiceLogger.debug('Password verification started', {
        action: 'verify_password_start',
        hasPassword: !!password,
      });

      try {
        const result = await repository.verifyPassword(password);
        authServiceLogger.debug('Password verification completed', {
          action: 'verify_password_complete',
          success: !result.error.value,
          status: result.response.value?.status,
        });
        return result;
      } catch (error) {
        authServiceLogger.error(
          'Password verification failed',
          error as Error,
          {
            action: 'verify_password_error',
          },
        );
        throw error;
      }
    },

    askForTotp: async () => {
      authServiceLogger.info('TOTP setup request started', {
        action: 'ask_for_totp_start',
      });

      try {
        const result = await repository.askForTotp();
        authServiceLogger.info('TOTP setup request completed', {
          action: 'ask_for_totp_complete',
          success: !result.error.value,
          status: result.response.value?.status,
        });
        return result;
      } catch (error) {
        authServiceLogger.error('TOTP setup request failed', error as Error, {
          action: 'ask_for_totp_error',
        });
        throw error;
      }
    },

    setupTotp: async (totp: string) => {
      authServiceLogger.info('TOTP setup started', {
        action: 'setup_totp_start',
        hasTotp: !!totp,
      });

      try {
        const result = await repository.setupTotp(totp);
        authServiceLogger.info('TOTP setup completed', {
          action: 'setup_totp_complete',
          success: !result.error.value,
          status: result.response.value?.status,
        });
        return result;
      } catch (error) {
        authServiceLogger.error('TOTP setup failed', error as Error, {
          action: 'setup_totp_error',
        });
        throw error;
      }
    },

    verifyRecoveryCode: async (recoveryCode: string, token: string) => {
      authServiceLogger.info('Recovery code verification started', {
        action: 'verify_recovery_code_start',
        hasRecoveryCode: !!recoveryCode,
        hasToken: !!token,
      });

      try {
        const result = await repository.verifyRecoveryCode(recoveryCode, token);
        authServiceLogger.info('Recovery code verification completed', {
          action: 'verify_recovery_code_complete',
          success: !result.error.value,
          status: result.response.value?.status,
        });
        return result;
      } catch (error) {
        authServiceLogger.error(
          'Recovery code verification failed',
          error as Error,
          {
            action: 'verify_recovery_code_error',
          },
        );
        throw error;
      }
    },

    regenerateRecoveryCodes: async () => {
      authServiceLogger.info('Recovery codes regeneration started', {
        action: 'regenerate_recovery_codes_start',
      });

      try {
        const result = await repository.regenerateRecoveryCodes();
        authServiceLogger.info('Recovery codes regeneration completed', {
          action: 'regenerate_recovery_codes_complete',
          success: !result.error.value,
          status: result.response.value?.status,
        });
        return result;
      } catch (error) {
        authServiceLogger.error(
          'Recovery codes regeneration failed',
          error as Error,
          {
            action: 'regenerate_recovery_codes_error',
          },
        );
        throw error;
      }
    },

    disableTotp: async () => {
      authServiceLogger.info('TOTP disable started', {
        action: 'disable_totp_start',
      });

      try {
        const result = await repository.disableTotp();
        authServiceLogger.info('TOTP disable completed', {
          action: 'disable_totp_complete',
          success: !result.error.value,
          status: result.response.value?.status,
        });
        return result;
      } catch (error) {
        authServiceLogger.error('TOTP disable failed', error as Error, {
          action: 'disable_totp_error',
        });
        throw error;
      }
    },

    changePassword: async (changePasswordData: ChangePasswordBody) => {
      authServiceLogger.info('Password change started', {
        action: 'change_password_start',
        hasCurrentPassword: !!changePasswordData.current_password,
        hasNewPassword: !!changePasswordData.new_password,
      });

      try {
        const result = await repository.changePassword(changePasswordData);
        authServiceLogger.info('Password change completed', {
          action: 'change_password_complete',
          success: !result.error.value,
          status: result.response.value?.status,
        });
        return result;
      } catch (error) {
        authServiceLogger.error('Password change failed', error as Error, {
          action: 'change_password_error',
        });
        throw error;
      }
    },

    updateProfile: async (profileData: UpdateUserBody) => {
      authServiceLogger.info('Profile update started', {
        action: 'update_profile_start',
        hasFirstName: !!profileData.first_name,
        hasLastName: !!profileData.last_name,
        hasUsername: !!profileData.username,
      });

      try {
        const result = await repository.updateProfile(profileData);
        authServiceLogger.info('Profile update completed', {
          action: 'update_profile_complete',
          success: !result.error.value,
          status: result.response.value?.status,
        });
        return result;
      } catch (error) {
        authServiceLogger.error('Profile update failed', error as Error, {
          action: 'update_profile_error',
        });
        throw error;
      }
    },

    getUserFile: async (fileData: GetUserFileBody) => {
      authServiceLogger.debug('User file fetch started', {
        action: 'get_user_file_start',
        filename: fileData.filename,
      });

      try {
        const result = await repository.getUserFile(fileData);
        authServiceLogger.debug('User file fetch completed', {
          action: 'get_user_file_complete',
          filename: fileData.filename,
          success: !result.error.value,
          status: result.response.value?.status,
        });
        return result;
      } catch (error) {
        authServiceLogger.error('User file fetch failed', error as Error, {
          action: 'get_user_file_error',
          filename: fileData.filename,
        });
        throw error;
      }
    },

    getCSRFToken: async () => {
      authServiceLogger.debug('CSRF token fetch started', {
        action: 'get_csrf_token',
      });

      try {
        const result = await repository.getCSRFToken();

        authServiceLogger.debug('CSRF token fetch completed', {
          action: 'get_csrf_token',
        });

        return result;
      } catch (err) {
        authServiceLogger.error('Failed to fetch CSRF Token', err as Error, {
          action: 'get_csrf_token',
        });
        throw err;
      }
    },

    verifyEmail: async (body: VerifyEmailBody) => {
      authServiceLogger.debug('Email verification started', {
        action: 'verify_email',
      });

      try {
        const result = await repository.verifyEmail(body);

        authServiceLogger.debug('Email verification completed', {
          action: 'verify_email',
        });

        return result;
      } catch (error) {
        authServiceLogger.error('Failed to verify email', error as Error, {
          action: 'verify_email',
        });
        throw error;
      }
    },

    resendEmailVerification: async (email: string) => {
      authServiceLogger.debug('Resend verification email started', {
        action: 'resend_email_verification',
      });

      try {
        const result = await repository.resendEmailVerification(email);

        authServiceLogger.debug('Email verification completed', {
          action: 'resend_email_verification',
        });

        return result;
      } catch (error) {
        authServiceLogger.error(
          'Failed to resend a verification email',
          error as Error,
          {
            action: 'resend_email_verification',
          },
        );
        throw error;
      }
    },
  };
};
