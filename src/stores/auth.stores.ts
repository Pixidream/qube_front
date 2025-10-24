import { i18n } from '@/i18n';
import { useAuthService } from '@composables/auth.composable';
import { MIN_EXEC_TIME_MS } from '@core/constants/auth.constants';
import type {
  AskForTotpResponse,
  AuthenticationResponse,
  ChangePasswordBody,
  UpdateUserBody,
} from '@core/types/auth';
import { Credentials } from '@core/types/auth';
import type { SuccessResponse } from '@core/types/response';
import { type User } from '@core/types/user';
import { sendAuthEvent, useAuthMachine } from '@machines/auth.machine';
import { defineStore } from 'pinia';
import { computed, ref, type ShallowRef } from 'vue';
import { createAvatar } from '@dicebear/core';
import { glass } from '@dicebear/collection';
import { useTotpConfigurationMachine } from '@/machines/totpConfiguration.machine';
import { toast } from 'vue-sonner';
import { platform } from '@tauri-apps/plugin-os';
import { isTauri } from '@tauri-apps/api/core';
import { createStoreLogger } from '@/utils/logger';

export const useAuthStore = defineStore('auth', () => {
  // ------ Setup ------
  const authMachine = useAuthMachine();
  const totpConfigurationMachine = useTotpConfigurationMachine();
  const authService = useAuthService();
  const { t } = i18n.global;
  const authLogger = createStoreLogger('AuthStore');

  // ------ Helpers ------
  const handleAuthenticationResponse = async (res: {
    data: ShallowRef<SuccessResponse<AuthenticationResponse> | null>;
    error: ShallowRef<any>;
  }) => {
    authLogger.debug('Processing authentication response', {
      action: 'auth_response_process',
      hasError: !!res.error.value,
      hasData: !!res.data.value,
    });

    if (res.error.value) {
      authLogger.error(
        'Authentication response contains error',
        res.error.value,
        {
          action: 'auth_response_error',
        },
      );
      authError.value = t('auth.networkError');
      return;
    }

    const _user = res.data.value?.data.user;

    if (_user === undefined) {
      authLogger.warn('Authentication response missing user data', {
        action: 'auth_response_missing_user',
        hasData: !!res.data.value,
      });
      authError.value = t('auth.networkError');
      return;
    }

    try {
      await getCSRFToken();
    } catch (err) {
      authLogger.error('Failed to set CSRF token', err as Error, {
        action: 'get_csrf_token',
      });
      user.value = null;
      authError.value = t('auth.networkError');
      return;
    }

    if (_user.profile_picture) {
      authLogger.debug('Loading user profile picture', {
        action: 'profile_picture_load',
        userId: _user.id,
        filename: _user.profile_picture,
      });
      try {
        _user.profile_picture = await getUserFile(_user.profile_picture);
        authLogger.debug('Profile picture loaded successfully', {
          action: 'profile_picture_loaded',
          userId: _user.id,
        });
      } catch (err) {
        authLogger.error('Failed to load profile picture', err as Error, {
          action: 'profile_picture_error',
          userId: _user.id,
        });
      }
    }

    user.value = _user;
    authLogger.info('User authenticated successfully', {
      action: 'user_authenticated',
      userId: _user.id,
      email: _user.email,
      hasProfilePicture: !!_user.profile_picture,
      isEmailVerified: _user.email_verified,
    });

    // Clear shortTTLToken after successful authentication
    shortTTLToken.value = null;

    authMachine.actor.send(sendAuthEvent.authenticated());
  };

  // ------ State ------
  const user = ref<User | null>(null);
  const shortTTLToken = ref<string | null>(null);
  const authError = ref<string | null>(null);
  const totpType = ref<'email' | 'totp' | null>(null);
  const totpRecoveryCodes = ref<string[]>([]);
  const shouldCloseTotpDialog = ref<boolean>(false);
  const updatingProfile = ref<boolean>(false);
  const csrfToken = ref<string | null>(null);

  // ------ Getters ------
  const isAuthenticated = computed(
    () => user.value !== null && user.value.id && user.value.email_verified,
  );
  const getAvatar = computed<string>(
    () =>
      user.value?.profile_picture
      ?? createAvatar(glass, { seed: user.value?.email }).toDataUri(),
  );
  const getAvatarFallback = computed<string>(() => {
    const displayName = getDisplayName.value;

    if (!displayName) return '?';

    if (displayName.includes('@')) {
      const emailPrefix = displayName.split('@')[0];
      return emailPrefix.substring(0, 2).toUpperCase();
    }

    const nameParts = displayName.trim().split(/\s+/);
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }

    return displayName.substring(0, 2).toUpperCase();
  });

  const getDisplayName = computed<string>(
    () =>
      user.value?.username
      || [user.value?.first_name, user.value?.last_name].join(' ').trim()
      || user.value?.email
      || '',
  );

  // ------ Actions ------
  const getCSRFToken = async () => {
    authLogger.debug('Fetching CSRF token', {
      action: 'get_csrf_token',
    });

    authError.value = null;

    return authService.getCSRFToken().then((res) => {
      if (res.response.value?.status === 401) {
        authLogger.warn(
          'User csrf request unauthorized - clearing user session',
          {
            action: 'get_csrf_token',
          },
        );

        user.value = null;
        return;
      }

      if (res.error.value) {
        authError.value = t('auth.networkError');
        return;
      }

      csrfToken.value = res.data.value?.data.token ?? null;
    });
  };

  const getUserFile = async (filename: string): Promise<string> => {
    authLogger.debug('Fetching user file', {
      action: 'get_user_file',
      filename,
    });
    authError.value = null;

    return authService
      .getUserFile({ filename })
      .then((res) => {
        if (res.response.value?.status === 401) {
          authLogger.warn(
            'User file request unauthorized - clearing user session',
            {
              action: 'get_user_file_unauthorized',
              filename,
            },
          );
          user.value = null;
          return filename;
        }

        if (res.error.value) {
          authError.value = t('auth.networkError');
          return filename;
        }

        return res.data.value?.data.url ?? filename;
      })
      .catch((err) => {
        console.error(err);
        return filename;
      });
  };

  const login = async (credentials: Credentials): Promise<void> => {
    authError.value = null;

    authLogger.info('Starting user login', {
      action: 'login_start',
      email: credentials.email,
      hasPassword: !!credentials.password,
    });

    authMachine.actor.send({ type: 'LOADING' });
    await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));

    authService
      .login(credentials)
      .then((res) => {
        if (res.error.value) {
          if (res.response.value?.status === 401) {
            authLogger.warn('Login failed - invalid credentials', {
              action: 'login_invalid_credentials',
              email: credentials.email,
              status: 401,
            });
            authError.value = t('auth.login.form.validation.invalidCreds');
          } else {
            authLogger.error('Login failed - network error', res.error.value, {
              action: 'login_network_error',
              email: credentials.email,
              status: res.response.value?.status,
            });
            authError.value = t('auth.networkError');
          }
          return;
        }

        authLogger.debug('Login response received - processing token', {
          action: 'login_token_received',
          email: credentials.email,
          hasToken: !!res.data.value?.data.token,
        });

        shortTTLToken.value = res.data.value?.data.token ?? null;

        totpType.value =
          res.data.value?.status == 'totp_verify' ? 'totp' : 'email';

        authMachine.actor.send({ type: '2FA_TOTP' });
      })
      .catch(() => {
        authError.value = t('auth.networkError');
        return;
      })
      .finally(() => {
        authMachine.actor.send({ type: 'IDLE' });
      });
  };

  const signUp = async (credentials: Credentials): Promise<void> => {
    authError.value = null;

    authLogger.info('Starting user signup', {
      action: 'signup_start',
      email: credentials.email,
      hasPassword: !!credentials.password,
    });

    authMachine.actor.send({ type: 'LOADING' });
    await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));

    authService
      .signup(credentials)
      .then((res) => {
        if (res.error.value) {
          if (res.response.value?.status === 409) {
            authLogger.warn('Signup failed - conflicting credentials', {
              action: 'signup_conflicting_credentials',
              email: credentials.email,
              status: 409,
            });
            authError.value = t('auth.signup.form.validation.conflictingCreds');
          } else {
            authLogger.error('Signup failed - network error', res.error.value, {
              action: 'signup_network_error',
              email: credentials.email,
              status: res.response.value?.status,
            });
            authError.value = t('auth.networkError');
          }
          return;
        }

        authLogger.debug('Signup response received', {
          action: 'signup_response_received',
          email: credentials.email,
        });

        authMachine.actor.send({ type: 'VERIFY_EMAIL' });
      })
      .catch(() => {
        authError.value = t('auth.networkError');
        return;
      })
      .finally(() => {
        authMachine.actor.send({ type: 'IDLE' });
      });
  };

  const verifyTotp = async (totp: string): Promise<void> => {
    authError.value = null;
    authMachine.actor.send({ type: 'LOADING' });
    await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));

    const request =
      totpType.value === 'totp' ?
        authService.verifyTotp(totp, shortTTLToken.value || '')
      : authService.verifyTotpEmail(totp, shortTTLToken.value || '');

    request
      .then(handleAuthenticationResponse)
      .catch(() => {
        authError.value = t('auth.networkError');
      })
      .finally(() => {
        authMachine.actor.send({ type: 'IDLE' });
      });
  };

  const verifyRecoveryCode = async (recoveryCode: string): Promise<void> => {
    authError.value = null;
    authMachine.actor.send({ type: 'LOADING' });
    await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));

    authService
      .verifyRecoveryCode(recoveryCode, shortTTLToken.value || '')
      .then(async (res) => {
        if (res.error.value) {
          authError.value = t('auth.networkError');
          return;
        }

        const _user = res.data.value?.data.user;
        const remainingCodes = res.data.value?.data.message;

        if (_user === undefined) {
          authError.value = t('auth.networkError');
          return;
        }

        // Show toast with remaining recovery codes count
        if (remainingCodes) {
          const count = parseInt(remainingCodes, 10);
          if (!isNaN(count)) {
            if (count === 0) {
              toast.warning(t('auth.recoveryCode.noCodesRemaining'), {
                duration: 8000,
              });
            } else if (count === 1) {
              toast.warning(t('auth.recoveryCode.lastCodeRemaining'), {
                duration: 6000,
              });
            } else if (count <= 3) {
              toast.warning(
                t('auth.recoveryCode.fewCodesRemaining', { count }),
                {
                  duration: 5000,
                },
              );
            } else {
              toast.info(t('auth.recoveryCode.remainingCodes', { count }), {
                duration: 4000,
              });
            }
          }
        }

        try {
          await getCSRFToken();
        } catch (err) {
          authLogger.error('Failed to set CSRF token', err as Error, {
            action: 'get_csrf_token',
          });
          user.value = null;
          authError.value = t('auth.networkError');
          return;
        }

        if (_user.profile_picture) {
          try {
            _user.profile_picture = await getUserFile(_user.profile_picture);
          } catch (err) {
            console.error(err);
          }
        }

        user.value = _user;
        shortTTLToken.value = null;

        authMachine.actor.send(sendAuthEvent.authenticated());
      })
      .catch(() => {
        authError.value = t('auth.networkError');
      })
      .finally(() => {
        authMachine.actor.send({ type: 'IDLE' });
      });
  };

  const sendResetPassword = async (email: string): Promise<boolean> => {
    authError.value = null;
    authMachine.actor.send({ type: 'LOADING' });
    await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));

    return authService
      .sendResetPassword(email)
      .then((res) => {
        if (res.error.value) {
          authError.value = t('auth.networkError');
          return false;
        }

        authMachine.actor.send({ type: 'LOGIN' });

        return true;
      })
      .catch(() => {
        authError.value = t('auth.networkError');
        return false;
      })
      .finally(() => {
        authMachine.actor.send({ type: 'IDLE' });
      });
  };

  const resetPassword = async (
    token: string,
    new_password: string,
  ): Promise<boolean> => {
    authError.value = null;
    authMachine.actor.send({ type: 'LOADING' });
    await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));

    return authService
      .resetPassword(token, new_password)
      .then((res) => {
        if (res.error.value) {
          authError.value = t('auth.networkError');
          return false;
        }

        authMachine.actor.send({ type: 'LOGIN' });

        return true;
      })
      .catch(() => {
        authError.value = t('auth.networkError');
        return false;
      })
      .finally(() => {
        authMachine.actor.send({ type: 'IDLE' });
      });
  };

  const me = async (): Promise<void> => {
    authError.value = null;
    authMachine.actor.send({ type: 'LOADING' });
    await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));

    try {
      const res = await authService.me();

      if (res.error.value) {
        if (res.response.value?.status === 401) {
          user.value = null;
          return;
        }

        throw new Error(res.error.value.toString());
      }

      const _user = res.data.value?.data ?? null;

      if (!_user) {
        user.value = null;
        return;
      }

      try {
        await getCSRFToken();
      } catch (err) {
        authLogger.error('Failed to set CSRF token', err as Error, {
          action: 'get_csrf_token',
        });
        user.value = null;
        authError.value = t('auth.networkError');
        return;
      }

      if (_user.profile_picture) {
        try {
          _user.profile_picture = await getUserFile(_user.profile_picture);
        } catch (err) {
          console.error(err);
        }
      }

      user.value = _user;
    } catch (error) {
      authError.value = t('auth.networkError');
      user.value = null;
      throw error;
    } finally {
      authMachine.actor.send({ type: 'IDLE' });
    }
  };

  const logout = async (): Promise<void> => {
    authError.value = null;
    authMachine.actor.send({ type: 'LOADING' });
    await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));

    authService
      .logout()
      .then(() => {
        csrfToken.value = null;
        user.value = null;
      })
      .catch(() => {
        user.value = null;
      })
      .finally(() => {
        authMachine.actor.send({ type: 'IDLE' });
      });
  };

  const verifyPassword = async (password: string): Promise<boolean> => {
    authError.value = null;
    totpConfigurationMachine.actor.send({ type: 'LOADING' });
    await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));

    return authService
      .verifyPassword(password)
      .then((res) => {
        if (res.response.value?.status === 401) {
          user.value = null;
          return false;
        }

        if (res.error.value) {
          authError.value = t('auth.networkError');
          return false;
        }

        if (!res.data.value?.data.success) {
          authError.value = t(
            'account.security.passwordVerifyForm.validation.passwordError',
          );
        }

        return res.data.value?.data.success ?? false;
      })
      .catch(() => {
        authError.value = t('auth.networkError');
        return false;
      })
      .finally(() => {
        totpConfigurationMachine.actor.send({ type: 'IDLE' });
      });
  };

  const askForTotp = async (): Promise<AskForTotpResponse | null> => {
    authError.value = null;
    totpConfigurationMachine.actor.send({ type: 'LOADING' });
    await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));

    return authService
      .askForTotp()
      .then((res) => {
        if (res.response.value?.status === 401) {
          user.value = null;
          return null;
        }

        if (res.error.value) {
          authError.value = t('auth.networkError');
          return null;
        }

        return res.data.value?.data ?? null;
      })
      .catch(() => {
        authError.value = t('auth.networkError');
        return null;
      })
      .finally(() => {
        totpConfigurationMachine.actor.send({ type: 'IDLE' });
      });
  };

  const setupTotp = async (totp: string): Promise<boolean> => {
    authError.value = null;
    totpConfigurationMachine.actor.send({ type: 'LOADING' });
    await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));

    return authService
      .setupTotp(totp)
      .then((res) => {
        if (res.response.value?.status === 401) {
          user.value = null;
          return false;
        }

        if (res.error.value) {
          authError.value = t('auth.networkError');
          return false;
        }

        const setupData = res.data.value?.data;
        if (setupData) {
          totpRecoveryCodes.value = setupData.totp_recovery_codes;
          return true;
        }

        return false;
      })
      .catch(() => {
        authError.value = t('auth.networkError');
        return false;
      })
      .finally(() => {
        totpConfigurationMachine.actor.send({ type: 'IDLE' });
      });
  };

  const clearTotpRecoveryCodes = () => {
    totpRecoveryCodes.value = [];
  };

  const closeTotpDialog = () => {
    shouldCloseTotpDialog.value = true;
  };

  const resetTotpDialogState = () => {
    shouldCloseTotpDialog.value = false;
  };

  const regenerateRecoveryCodes = async (): Promise<boolean> => {
    authError.value = null;
    await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));

    return authService
      .regenerateRecoveryCodes()
      .then((res) => {
        if (res.response.value?.status === 401) {
          user.value = null;
          return false;
        }

        if (res.error.value) {
          authError.value = t('auth.networkError');
          return false;
        }

        const recoveryData = res.data.value?.data;
        if (recoveryData) {
          totpRecoveryCodes.value = recoveryData.totp_recovery_codes;
          return true;
        }

        return false;
      })
      .catch(() => {
        authError.value = t('auth.networkError');
        return false;
      });
  };

  const disableTotp = async (): Promise<boolean> => {
    authError.value = null;
    await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));

    return authService
      .disableTotp()
      .then((res) => {
        if (res.response.value?.status === 401) {
          user.value = null;
          return false;
        }

        if (res.error.value) {
          authError.value = t('auth.networkError');
          return false;
        }

        // Refresh user data to reflect TOTP disabled
        return me()
          .then(() => true)
          .catch(() => false);
      })
      .catch(() => {
        authError.value = t('auth.networkError');
        return false;
      });
  };

  const changePassword = async (
    changePasswordData: ChangePasswordBody,
  ): Promise<boolean> => {
    authError.value = null;
    await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));

    return authService
      .changePassword(changePasswordData)
      .then((res) => {
        if (res.response.value?.status === 401) {
          user.value = null;
          return false;
        }

        if (res.error.value) {
          authError.value = t('auth.networkError');
          return false;
        }

        return true;
      })
      .catch(() => {
        authError.value = t('auth.networkError');
        return false;
      });
  };

  const updateProfile = async (updateProfileData: UpdateUserBody) => {
    updatingProfile.value = true;
    authError.value = null;
    await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));

    updateProfileData.platform = isTauri() ? platform() : 'web';

    authService
      .updateProfile(updateProfileData)
      .then(async (res) => {
        console.info(
          'DEBUG TO DELETE',
          res.response.value,
          res.data.value,
          res.error.value,
        );
        if (res.response.value?.status === 401) {
          user.value = null;
          return;
        }

        if (res.error.value) {
          authError.value = t('auth.networkError');
          return;
        }

        const _user = res.data.value?.data ?? null;

        if (_user === null || !_user.profile_picture) {
          user.value = _user;
          return;
        }

        try {
          _user.profile_picture = await getUserFile(_user.profile_picture);
        } catch (err) {
          console.error(err);
          updatingProfile.value = false;
          return;
        }

        user.value = _user;
      })
      .catch((err) => console.error(err))
      .finally(() => {
        updatingProfile.value = false;
      });
  };

  return {
    // ------ state ------
    user,
    shortTTLToken,
    authError,
    totpType,
    totpRecoveryCodes,
    shouldCloseTotpDialog,
    updatingProfile,
    csrfToken,
    // ------ getters ------
    isAuthenticated,
    getAvatar,
    getDisplayName,
    getAvatarFallback,
    // ------ actions ------
    login,
    signUp,
    verifyTotp,
    verifyRecoveryCode,
    sendResetPassword,
    resetPassword,
    me,
    logout,
    verifyPassword,
    askForTotp,
    setupTotp,
    clearTotpRecoveryCodes,
    closeTotpDialog,
    resetTotpDialogState,
    regenerateRecoveryCodes,
    disableTotp,
    changePassword,
    updateProfile,
    getUserFile,
    getCSRFToken,
  };
});
