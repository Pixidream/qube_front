import { useAuthService } from '@/composables/auth.composable';
import { Credentials } from '@/core/types/auth';
import { type User } from '@/core/types/user';
import { i18n } from '@/i18n';
import { useAuthMachine } from '@/machines/auth.machine';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // ------ Setup ------
  const authMachine = useAuthMachine();
  const authService = useAuthService();
  const { t } = i18n.global;

  // ------ State ------
  const user = ref<User | null>(null);
  const shortTTLToken = ref<string | null>(null);
  const authError = ref<string | null>(null);

  // ------ Getters ------
  const isAuthenticated = computed(() => user.value !== null);

  // ------ Actions ------
  const login = async (credentials: Credentials): Promise<void> => {
    authMachine.send({ type: 'LOADING' });
    authError.value = null;
    authService
      .login(credentials)
      .then((res) => {
        if (res.error.value) {
          authMachine.send({ type: 'LOGIN' });
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

        setTimeout(() => {
          authMachine.send({
            type:
              res.data.value?.status == 'totp_verify' ?
                '2FA_TOTP'
              : 'EMAIL_TOTP',
          });
        }, 750);
      })
      .catch(() => {
        authMachine.send({ type: 'LOGIN' });
        authError.value = t('auth.networkError');
        return;
      });
  };

  const verifyTotp = async (totp: string): Promise<void> => {
    authMachine.send({ type: 'LOADING' });
    authError.value = null;
    authService
      .verifyTotp(totp, shortTTLToken.value || '')
      .then((res) => {
        const _user = res.data.value?.data.user;

        if (_user === undefined) {
          authMachine.send({ type: '2FA_TOTP' });
          authError.value = t('auth.networkError');
          return;
        }

        user.value = _user;

        setTimeout(() => {
          authMachine.send({ type: 'AUTHENTICATED' });
        }, 750);
      })
      .catch(() => {
        authError.value = t('auth.networkError');
        authMachine.send({ type: '2FA_TOTP' });
      });
  };

  return { user, shortTTLToken, authError, isAuthenticated, login, verifyTotp };
});
