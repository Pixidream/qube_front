import { ref } from 'vue';
import { defineStore } from 'pinia';
import { type User } from '@/core/types/user';
import { useAuthService } from '@/composables/auth.composable';
import { Credentials } from '@/core/types/auth';
import { useAuthMachine } from '@/machines/auth.machine';

export const useAuthStore = defineStore('auth', () => {
  // ------ Setup ------
  const authMachine = useAuthMachine();
  const authService = useAuthService();

  // ------ State ------
  const isAuthenticated = ref(false);
  const user = ref<User | null>(null);
  const shortTTLToken = ref<string | null>(null);

  // ------ Actions ------
  const login = async (credentials: Credentials): Promise<boolean | string> => {
    authMachine.send({ type: 'LOADING' });
    return authService
      .login(credentials)
      .then((res) => {
        if (res.error.value) {
          authMachine.send({ type: 'LOGIN' });
          return res.error.value;
        }

        shortTTLToken.value = res.data.value?.data.token ?? null;

        setTimeout(() => {
          authMachine.send({
            type:
              res.data.value?.status == 'totp_verify' ?
                '2FA_TOTP'
              : 'EMAIL_TOTP',
          });
        }, 1000);
        return true;
      })
      .catch(() => {
        authMachine.send({ type: 'LOGIN' });
        return false;
      });
  };

  const verifyTotp = async (totp: string): Promise<void> => {
    await authService.verifyTotp(totp, shortTTLToken.value || '');
  };

  return { isAuthenticated, user, shortTTLToken, login, verifyTotp };
});
