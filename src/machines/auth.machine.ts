import { defineStore } from 'pinia';
import { xstate } from 'pinia-xstate';
import { createMachine } from 'xstate';

export const authMachine = createMachine({
  id: 'authMachine',
  type: 'parallel',

  states: {
    flow: {
      initial: 'login',
      states: {
        login: {
          on: {
            '2FA_TOTP': '2fa_totp',
            EMAIL_TOTP: 'email_totp',
            SIGNUP: 'signup',
          },
        },
        '2fa_totp': {
          on: {
            RECOVERY_CODE: 'recovery_code',
            AUTHENTICATED: 'authenticated',
          },
        },
        recovery_code: {
          on: {
            '2FA_TOTP': '2fa_totp',
            AUTHENTICATED: 'authenticated',
          },
        },
        email_totp: {
          on: {
            AUTHENTICATED: 'authenticated',
          },
        },
        signup: {
          on: {
            LOGIN: 'login',
            VERIFY_EMAIL: 'verify_email',
          },
        },
        verify_email: {
          on: {
            AUTHENTICATED: 'authenticated',
          },
        },
        authenticated: {
          on: {
            LOGOUT: 'login',
          },
        },
      },
    },
    form: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            LOADING: 'loading',
          },
        },
        loading: {
          on: {
            IDLE: 'idle',
          },
        },
      },
    },
  },
});

export const useAuthMachine = defineStore(authMachine.id, xstate(authMachine));
