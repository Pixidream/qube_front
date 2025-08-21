import { ref } from 'vue';
import { defineStore } from 'pinia';
import { type User } from '@/core/types/user';
import { useAuthService } from '@/composables/auth.composable';
import { Credentials } from '@/core/types/auth';
import { useAuthMachine } from '@/machines/auth.machine';

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const user = ref<User | null>(null);
  const authMachine = useAuthMachine();
  const authService = useAuthService();

  const login = async (credentials: Credentials): Promise<boolean | string> => {
    authMachine.send({ type: 'LOADING' });
    return authService
      .login(credentials)
      .then((res) => {
        if (res.error.value) {
          authMachine.send({ type: 'LOGIN' });
          return res.error.value;
        }
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

  return { isAuthenticated, user, login };
});
