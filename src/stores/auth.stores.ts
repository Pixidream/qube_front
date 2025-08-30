import { i18n } from '@/i18n';
import { useAuthService } from '@composables/auth.composable';
import { MIN_EXEC_TIME_MS } from '@core/constants/auth.constants';
import type { AuthenticationResponse } from '@core/types/auth';
import { Credentials } from '@core/types/auth';
import type { SuccessResponse } from '@core/types/response';
import { type User } from '@core/types/user';
import { sendAuthEvent, useAuthMachine } from '@machines/auth.machine';
import { defineStore } from 'pinia';
import { computed, ref, type ShallowRef } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // ------ Setup ------
  const authMachine = useAuthMachine();
  const authService = useAuthService();
  const { t } = i18n.global;

  // ------ Helpers ------
  const handleAuthenticationResponse = (res: {
    data: ShallowRef<SuccessResponse<AuthenticationResponse> | null>;
    error: ShallowRef<any>;
  }) => {
    if (res.error.value) {
      authError.value = t('auth.networkError');
      return;
    }

    const _user = res.data.value?.data.user;

    if (_user === undefined) {
      authError.value = t('auth.networkError');
      return;
    }

    user.value = _user;

    authMachine.actor.send(sendAuthEvent.authenticated());
  };

  // ------ State ------
  const user = ref<User | null>(null);
  const shortTTLToken = ref<string | null>(null);
  const authError = ref<string | null>(null);
  const totpType = ref<'email' | 'totp' | null>(null);

  // ------ Getters ------
  const isAuthenticated = computed(() => user.value !== null);

  // ------ Actions ------
  const login = async (credentials: Credentials): Promise<void> => {
    authError.value = null;
    authMachine.actor.send({ type: 'LOADING' });
    await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));
    authService
      .login(credentials)
      .then((res) => {
        if (res.error.value) {
          if (
            res.error.value.toString().toLowerCase().includes('401')
            || res.error.value.toString().toLowerCase().includes('unauthorized')
          ) {
            authError.value = t('auth.login.form.validation.invalidCreds');
          } else {
            authError.value = t('auth.networkError');
          }
          return;
        }

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

    authService
      .me()
      .then((res) => {
        if (res.error.value) {
          user.value = null;
          return;
        }

        user.value = res.data.value?.data ?? null;
      })
      .catch(() => {
        authError.value = t('auth.networkError');
        user.value = null;
      })
      .finally(() => authMachine.actor.send({ type: 'IDLE' }));
  };

  return {
    // ------ state ------
    user,
    shortTTLToken,
    authError,
    totpType,
    // ------ getters ------
    isAuthenticated,
    // ------ actions ------
    login,
    verifyTotp,
    sendResetPassword,
    resetPassword,
    me,
  };
});
