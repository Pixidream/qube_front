import { useAuthStore } from '@/stores/auth.stores';
import { xstate } from '@core/middlewares/xstate.middleware';
import { defineStore } from 'pinia';
import type { Router } from 'vue-router';
import { assign, createMachine } from 'xstate';

interface AuthContext {
  query: Record<string, any>;
  redirectPath: string | null;
  router: Router | null;
}

type AuthEvent =
  | { type: '2FA_TOTP' }
  | { type: 'EMAIL_TOTP' }
  | { type: 'SIGNUP' }
  | { type: 'RESET_PASSWORD'; query?: Record<string, any> }
  | { type: 'RECOVERY_CODE' }
  | { type: 'AUTHENTICATED'; redirectPath?: string }
  | { type: 'VERIFY_EMAIL' }
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'LOADING' }
  | { type: 'IDLE' }
  | { type: 'SET_QUERY'; query: Record<string, any> }
  | { type: 'SET_REDIRECT'; redirectPath: string };

export const authMachine = createMachine(
  {
    id: 'authMachine',
    type: 'parallel',
    context: {
      query: {},
      redirectPath: null,
      router: null,
    } satisfies AuthContext,
    types: {
      context: {} as AuthContext,
      events: {} as AuthEvent,
    },

    states: {
      flow: {
        initial: 'login',
        states: {
          login: {
            entry: ['resetAuthError', 'navigateToLogin'],
            on: {
              '2FA_TOTP': '2fa_totp',
              EMAIL_TOTP: 'email_totp',
              SIGNUP: 'signup',
              RESET_PASSWORD: {
                target: 'reset_password',
                actions: ['assignQuery'],
              },
            },
          },
          '2fa_totp': {
            entry: ['resetAuthError', 'navigateToTotp'],
            on: {
              RECOVERY_CODE: 'recovery_code',
              AUTHENTICATED: {
                target: 'authenticated',
                actions: ['assignRedirectPath'],
              },
            },
          },
          recovery_code: {
            entry: ['resetAuthError', 'navigateToTotpRecovery'],
            on: {
              '2FA_TOTP': '2fa_totp',
              AUTHENTICATED: {
                target: 'authenticated',
                actions: ['assignRedirectPath'],
              },
            },
          },
          email_totp: {
            entry: ['resetAuthError', 'navigateToEmailTotp'],
            on: {
              AUTHENTICATED: {
                target: 'authenticated',
                actions: ['assignRedirectPath'],
              },
            },
          },
          signup: {
            entry: ['resetAuthError', 'navigateToSignup'],
            on: {
              LOGIN: 'login',
              VERIFY_EMAIL: 'verify_email',
            },
          },
          verify_email: {
            entry: ['resetAuthError', 'navigateToVerifyEmail'],
            on: {
              AUTHENTICATED: {
                target: 'authenticated',
                actions: ['assignRedirectPath'],
              },
            },
          },
          reset_password: {
            entry: ['resetAuthError', 'navigateToResetPassword'],
            on: {
              LOGIN: 'login',
            },
          },
          authenticated: {
            entry: ['resetAuthError', 'navigateToAuthenticated'],
            on: {
              LOGOUT: 'login',
            },
          },
        },
        on: {
          SET_QUERY: {
            actions: ['assignQuery'],
          },
          SET_REDIRECT: {
            actions: ['assignRedirectPath'],
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
  },
  {
    actions: {
      assignQuery: assign({
        query: ({ event }) => {
          if (event.type === 'RESET_PASSWORD' && event.query) {
            return event.query;
          }
          if (event.type === 'SET_QUERY') {
            return event.query;
          }
          return {};
        },
      }),

      assignRedirectPath: assign({
        redirectPath: ({ event }) => {
          if (event.type === 'AUTHENTICATED' && event.redirectPath) {
            return event.redirectPath;
          }
          if (event.type === 'SET_REDIRECT') {
            return event.redirectPath;
          }
          return null;
        },
      }),

      resetAuthError: () => {
        useAuthStore().authError = null;
      },

      navigateToLogin: ({ context }) => {
        if (!context.router) return;
        context.router.push({ name: 'login' });
      },

      navigateToSignup: ({ context }) => {
        if (!context.router) return;
        context.router.push({ name: 'signup' });
      },

      navigateToTotp: ({ context }) => {
        if (!context.router) return;
        context.router.push({ name: 'totp' });
      },

      navigateToTotpRecovery: ({ context }) => {
        if (!context.router) return;
        context.router.push({ name: 'totp-recovery' });
      },

      navigateToEmailTotp: ({ context }) => {
        if (!context.router) return;
        context.router.push({ name: 'totp' });
      },

      navigateToVerifyEmail: ({ context }) => {
        if (!context.router) return;
        context.router.push({ name: 'verify-email' });
      },

      navigateToResetPassword: ({ context }) => {
        if (!context.router) return;
        const query =
          Object.keys(context.query).length > 0 ? context.query : undefined;
        context.router.push({
          name: 'reset-password',
          query,
        });
      },

      navigateToAuthenticated: ({ context }) => {
        if (!context.router) return;

        if (context.redirectPath) {
          context.router.push(context.redirectPath);
        } else {
          context.router.push({ name: 'home' });
        }
      },
    },
  },
);

export const useAuthMachine = defineStore(authMachine.id, xstate(authMachine));

/**
 * Helper functions for creating auth machine events with typed data
 * These ensure type safety and consistency when sending events to the auth machine
 */
export const sendAuthEvent = {
  /** Create RESET_PASSWORD event with optional query parameters */
  resetPassword: (query?: Record<string, any>) => ({
    type: 'RESET_PASSWORD' as const,
    query,
  }),

  /** Create AUTHENTICATED event with optional redirect path */
  authenticated: (redirectPath?: string) => ({
    type: 'AUTHENTICATED' as const,
    redirectPath,
  }),

  /** Create SET_QUERY event with query parameters */
  setQuery: (query: Record<string, any>) => ({
    type: 'SET_QUERY' as const,
    query,
  }),

  /** Create SET_REDIRECT event with redirect path */
  setRedirect: (redirectPath: string) => ({
    type: 'SET_REDIRECT' as const,
    redirectPath,
  }),
};
