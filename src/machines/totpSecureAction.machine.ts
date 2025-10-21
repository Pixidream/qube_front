import { xstate } from '@core/middlewares/xstate.middleware';
import { defineStore } from 'pinia';
import { createMachine, assign } from 'xstate';
import { logger } from '@/utils/logger';

const totpSecureActionLogger = logger.child({ machine: 'totpSecureAction' });

export type TotpSecureActionType = 'disable' | 'regenerate';

export interface TotpSecureActionContext {
  actionType: TotpSecureActionType | null;
  error: string | null;
  isLoading: boolean;
}

type TotpSecureActionEvent =
  | { type: 'START_ACTION'; actionType: TotpSecureActionType }
  | { type: 'PASSWORD_VERIFIED' }
  | { type: 'CONFIRM_ACTION' }
  | { type: 'ACTION_SUCCESS' }
  | { type: 'ACTION_ERROR'; error: string }
  | { type: 'SHOW_RESULT' }
  | { type: 'COMPLETE' }
  | { type: 'RESET' }
  | { type: 'LOADING' }
  | { type: 'IDLE' };

export const totpSecureActionMachine = createMachine({
  id: 'totpSecureActionMachine',
  type: 'parallel',
  types: {
    context: {} as TotpSecureActionContext,
    events: {} as TotpSecureActionEvent,
  },
  context: {
    actionType: null,
    error: null,
    isLoading: false,
  },

  states: {
    flow: {
      initial: 'idle',
      states: {
        idle: {
          entry: () => {
            totpSecureActionLogger.debug('TOTP secure action machine idle', {
              action: 'state_entry',
              state: 'idle',
              flow: 'secure_action',
            });
          },
          on: {
            START_ACTION: {
              target: 'password_verify',
              actions: [
                assign({
                  actionType: ({ event }) => event.actionType,
                  error: null,
                }),
                ({ event }) => {
                  totpSecureActionLogger.info(
                    `Starting TOTP secure action: ${event.actionType}`,
                    {
                      action: 'transition',
                      from: 'idle',
                      to: 'password_verify',
                      event: 'START_ACTION',
                      actionType: event.actionType,
                    },
                  );
                },
              ],
            },
          },
        },
        password_verify: {
          entry: ({ context }) => {
            totpSecureActionLogger.info(
              'Verifying password for secure action',
              {
                action: 'state_entry',
                state: 'password_verify',
                flow: 'secure_action',
                actionType: context.actionType,
              },
            );
          },
          on: {
            PASSWORD_VERIFIED: {
              target: 'confirm',
              actions: ({ context }) => {
                totpSecureActionLogger.info(
                  'Password verified for secure action',
                  {
                    action: 'transition',
                    from: 'password_verify',
                    to: 'confirm',
                    event: 'PASSWORD_VERIFIED',
                    actionType: context.actionType,
                  },
                );
              },
            },
          },
        },
        confirm: {
          entry: ({ context }) => {
            totpSecureActionLogger.info('Confirming TOTP secure action', {
              action: 'state_entry',
              state: 'confirm',
              flow: 'secure_action',
              actionType: context.actionType,
            });
          },
          on: {
            CONFIRM_ACTION: {
              target: 'action',
              actions: ({ context }) => {
                totpSecureActionLogger.info(
                  'Secure action confirmed, executing',
                  {
                    action: 'transition',
                    from: 'confirm',
                    to: 'action',
                    event: 'CONFIRM_ACTION',
                    actionType: context.actionType,
                  },
                );
              },
            },
          },
        },
        action: {
          entry: ({ context }) => {
            totpSecureActionLogger.info('Executing TOTP secure action', {
              action: 'state_entry',
              state: 'action',
              flow: 'secure_action',
              actionType: context.actionType,
            });
          },
          on: {
            ACTION_SUCCESS: [
              {
                target: 'result',
                guard: ({ context }) => context.actionType === 'regenerate',
                actions: ({ context }) => {
                  totpSecureActionLogger.info(
                    'TOTP regenerate action successful',
                    {
                      action: 'transition',
                      from: 'action',
                      to: 'result',
                      event: 'ACTION_SUCCESS',
                      actionType: context.actionType,
                    },
                  );
                },
              },
              {
                target: 'completed',
                guard: ({ context }) => context.actionType === 'disable',
                actions: ({ context }) => {
                  totpSecureActionLogger.info(
                    'TOTP disable action successful',
                    {
                      action: 'transition',
                      from: 'action',
                      to: 'completed',
                      event: 'ACTION_SUCCESS',
                      actionType: context.actionType,
                    },
                  );
                },
              },
            ],
            ACTION_ERROR: {
              target: 'error',
              actions: [
                assign({
                  error: ({ event }) => event.error,
                }),
                ({ event, context }) => {
                  totpSecureActionLogger.error(
                    'TOTP secure action failed',
                    undefined,
                    {
                      action: 'transition',
                      from: 'action',
                      to: 'error',
                      event: 'ACTION_ERROR',
                      actionType: context.actionType,
                      error: event.error,
                    },
                  );
                },
              ],
            },
          },
        },
        result: {
          entry: ({ context }) => {
            totpSecureActionLogger.info('Showing TOTP secure action result', {
              action: 'state_entry',
              state: 'result',
              flow: 'secure_action',
              actionType: context.actionType,
            });
          },
          on: {
            COMPLETE: {
              target: 'completed',
              actions: ({ context }) => {
                totpSecureActionLogger.info(
                  'TOTP secure action result acknowledged',
                  {
                    action: 'transition',
                    from: 'result',
                    to: 'completed',
                    event: 'COMPLETE',
                    actionType: context.actionType,
                  },
                );
              },
            },
          },
        },
        completed: {
          type: 'final',
          entry: ({ context }) => {
            totpSecureActionLogger.info(
              'TOTP secure action completed successfully',
              {
                action: 'state_entry',
                state: 'completed',
                flow: 'secure_action',
                actionType: context.actionType,
              },
            );
          },
        },
        error: {
          entry: ({ context }) => {
            totpSecureActionLogger.warn('TOTP secure action in error state', {
              action: 'state_entry',
              state: 'error',
              flow: 'secure_action',
              actionType: context.actionType,
              error: context.error,
            });
          },
          on: {
            RESET: {
              target: 'idle',
              actions: [
                assign({
                  actionType: null,
                  error: null,
                  isLoading: false,
                }),
                () => {
                  totpSecureActionLogger.info(
                    'TOTP secure action reset from error',
                    {
                      action: 'transition',
                      from: 'error',
                      to: 'idle',
                      event: 'RESET',
                    },
                  );
                },
              ],
            },
          },
        },
      },
    },
    form: {
      initial: 'idle',
      states: {
        idle: {
          entry: () => {
            totpSecureActionLogger.debug('TOTP secure action form idle', {
              action: 'state_entry',
              state: 'idle',
              context: 'form',
            });
          },
          on: {
            LOADING: {
              target: 'loading',
              actions: [
                assign({
                  isLoading: true,
                }),
                () => {
                  totpSecureActionLogger.debug(
                    'TOTP secure action form loading',
                    {
                      action: 'transition',
                      from: 'idle',
                      to: 'loading',
                      event: 'LOADING',
                      context: 'form',
                    },
                  );
                },
              ],
            },
          },
        },
        loading: {
          entry: () => {
            totpSecureActionLogger.debug('TOTP secure action form loading', {
              action: 'state_entry',
              state: 'loading',
              context: 'form',
            });
          },
          on: {
            IDLE: {
              target: 'idle',
              actions: [
                assign({
                  isLoading: false,
                }),
                () => {
                  totpSecureActionLogger.debug(
                    'TOTP secure action form load complete',
                    {
                      action: 'transition',
                      from: 'loading',
                      to: 'idle',
                      event: 'IDLE',
                      context: 'form',
                    },
                  );
                },
              ],
            },
          },
        },
      },
    },
  },
  on: {
    RESET: {
      target: '.flow.idle',
      actions: [
        assign({
          actionType: null,
          error: null,
          isLoading: false,
        }),
        () => {
          totpSecureActionLogger.info('TOTP secure action machine reset', {
            action: 'reset',
            to: 'idle',
            event: 'RESET',
          });
        },
      ],
    },
  },
});

export const useTotpSecureActionMachine = defineStore(
  totpSecureActionMachine.id,
  xstate(totpSecureActionMachine),
);
