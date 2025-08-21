import { createMachine } from 'xstate';
import { defineStore } from 'pinia';
import { xstate } from 'pinia-xstate';

export const authMachine = createMachine({
  id: 'authMachine',
  initial: 'login',
  states: {
    login: { on: { LOADING: 'loading' } },
    '2fa_totp': { on: { LOADING: 'loading' } },
    recovery_code: { on: { LOADING: 'loading' } },
    email_totp: { on: { LOADING: 'loading' } },
    signup: { on: { LOADING: 'loading' } },
    verify_email: { on: { LOADING: 'loading' } },
    authenticated: { type: 'final' },
    loading: {
      on: {
        '2FA_TOTP': '2fa_totp',
        EMAIL_TOTP: 'email_totp',
        SIGNUP: 'signup',
        RECOVERY_CODE: 'recovery_code',
        AUTHENTICATED: 'authenticated',
        LOGIN: 'login',
        VERIFY_EMAIL: 'verify_email',
      },
    },
  },
});

export const useAuthMachine = defineStore(authMachine.id, xstate(authMachine));
