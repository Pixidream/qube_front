import { useAuthStore } from '@stores/auth.stores';
import { xstate } from '@core/middlewares/xstate.middleware';
import { defineStore } from 'pinia';
import type { Router } from 'vue-router';
import { assign, createMachine } from 'xstate';
import { logger } from '@/utils/logger';

const authMachineLogger = logger.child({ machine: 'auth' });

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
  | { type: 'RESTORE_SESSION' }
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
    entry: () => {
      authMachineLogger.info('Auth machine initialized', {
        action: 'machine_init',
      });
    },

    states: {
      flow: {
        initial: 'login',
        states: {
          login: {
            entry: [
              'resetAuthError',
              'navigateToLogin',
              () => {
                authMachineLogger.info('Entered login state', {
                  action: 'state_enter',
                  state: 'login',
                });
              },
            ],
            on: {
              '2FA_TOTP': {
                target: 'twoFaTotp',
                actions: () => {
                  authMachineLogger.info('Transitioning to 2FA TOTP', {
                    action: 'state_transition',
                    from: 'login',
                    to: 'twoFaTotp',
                    trigger: '2FA_TOTP',
                  });
                },
              },
              EMAIL_TOTP: 'emailTotp',
              SIGNUP: 'signup',
              RESET_PASSWORD: {
                target: 'resetPassword',
                actions: ['assignQuery'],
              },
              RESTORE_SESSION: {
                target: 'authenticated',
              },
            },
          },
          twoFaTotp: {
            entry: ['resetAuthError', 'navigateToTotp'],
            on: {
              RECOVERY_CODE: 'recoveryCode',
              AUTHENTICATED: {
                target: 'authenticated',
                actions: ['assignRedirectPath'],
              },
            },
          },
          recoveryCode: {
            entry: ['resetAuthError', 'navigateToTotpRecovery'],
            on: {
              '2FA_TOTP': 'twoFaTotp',
              AUTHENTICATED: {
                target: 'authenticated',
                actions: ['assignRedirectPath'],
              },
            },
          },
          emailTotp: {
            entry: ['resetAuthError', 'navigateToEmailTotp'],
            on: {
              AUTHENTICATED: {
                target: 'authenticated',
                actions: ['assignRedirectPath'],
              },
            },
          },
          signup: {
            entry: [
              'resetAuthError',
              'navigateToSignup',
              () => {
                authMachineLogger.info('Entered signup state', {
                  action: 'state_enter',
                  state: 'signup',
                });
              },
            ],
            on: {
              LOGIN: {
                target: 'login',
                actions: () => {
                  authMachineLogger.info('Returning to login from signup', {
                    action: 'state_transition',
                    from: 'signup',
                    to: 'login',
                    trigger: 'LOGIN',
                  });
                },
              },
              VERIFY_EMAIL: {
                target: 'verifyEmail',
                actions: () => {
                  authMachineLogger.info('Moving to email verification', {
                    action: 'state_transition',
                    from: 'signup',
                    to: 'verifyEmail',
                    trigger: 'VERIFY_EMAIL',
                  });
                },
              },
            },
          },
          verifyEmail: {
            entry: ['resetAuthError', 'navigateToVerifyEmail'],
            on: {
              AUTHENTICATED: {
                target: 'authenticated',
                actions: ['assignRedirectPath'],
              },
            },
          },
          resetPassword: {
            entry: [
              'resetAuthError',
              'navigateToResetPassword',
              () => {
                authMachineLogger.info('Entered password reset state', {
                  action: 'state_enter',
                  state: 'resetPassword',
                });
              },
            ],
            on: {
              LOGIN: {
                target: 'login',
                actions: () => {
                  authMachineLogger.info(
                    'Returning to login from password reset',
                    {
                      action: 'state_transition',
                      from: 'resetPassword',
                      to: 'login',
                      trigger: 'LOGIN',
                    },
                  );
                },
              },
            },
          },
          authenticated: {
            entry: ['resetAuthError', 'navigateToAuthenticated'],
            on: {
              LOGOUT: { target: 'login', actions: ['logout'] },
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
            entry: () => {
              authMachineLogger.trace('Loading state: idle', {
                action: 'loading_state',
                state: 'idle',
              });
            },
            on: {
              LOADING: {
                target: 'loading',
                actions: () => {
                  authMachineLogger.debug('Starting loading state', {
                    action: 'loading_transition',
                    from: 'idle',
                    to: 'loading',
                  });
                },
              },
            },
          },
          loading: {
            entry: () => {
              authMachineLogger.trace('Loading state: loading', {
                action: 'loading_state',
                state: 'loading',
              });
            },
            on: {
              IDLE: {
                target: 'idle',
                actions: () => {
                  authMachineLogger.debug('Stopping loading state', {
                    action: 'loading_transition',
                    from: 'loading',
                    to: 'idle',
                  });
                },
              },
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

      logout: async () => {
        const authStore = useAuthStore();
        await authStore.logout();
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
