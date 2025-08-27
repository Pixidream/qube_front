import { i18n } from '@/i18n';
import { useAuthService } from '@composables/auth.composable';
import { MIN_EXEC_TIME_MS } from '@core/constants/auth.constants';
import type { AuthenticationResponse } from '@core/types/auth';
import { Credentials } from '@core/types/auth';
import type { SuccessResponse } from '@core/types/response';
import { type User } from '@core/types/user';
import { useAuthMachine } from '@machines/auth.machine';
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
    const _user = res.data.value?.data.user;

    if (_user === undefined) {
      authError.value = t('auth.networkError');
      return;
    }

    user.value = _user;

    authMachine.actor.send({ type: 'AUTHENTICATED' });
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
    authMachine.actor.send({ type: 'LOADING' });
    await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));
    authError.value = null;
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
    authMachine.actor.send({ type: 'LOADING' });
    await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));
    authError.value = null;

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

  return { user, shortTTLToken, authError, isAuthenticated, login, verifyTotp };
});
