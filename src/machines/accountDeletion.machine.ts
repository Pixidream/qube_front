import { xstate } from '@core/middlewares/xstate.middleware';
import { defineStore } from 'pinia';
import { createMachine, assign } from 'xstate';
import { logger } from '@/utils/logger';

const accountDeletionLogger = logger.child({ machine: 'accountDeletion' });

export interface AccountDeletionContext {
  error: string | null;
  isLoading: boolean;
}

type AccountDeletionEvent =
  | { type: 'START_DELETION' }
  | { type: 'PASSWORD_VERIFIED' }
  | { type: 'CONFIRM_DELETION' }
  | { type: 'DELETION_SUCCESS' }
  | { type: 'DELETION_ERROR'; error: string }
  | { type: 'COMPLETE' }
  | { type: 'RESET' }
  | { type: 'LOADING' }
  | { type: 'IDLE' };

export const accountDeletionMachine = createMachine({
  id: 'accountDeletionMachine',
  type: 'parallel',
  types: {
    context: {} as AccountDeletionContext,
    events: {} as AccountDeletionEvent,
  },
  context: {
    error: null,
    isLoading: false,
  },

  states: {
    flow: {
      initial: 'idle',
      states: {
        idle: {
          entry: () => {
            accountDeletionLogger.debug('Account deletion machine idle', {
              action: 'state_entry',
              state: 'idle',
              flow: 'account_deletion',
            });
          },
          on: {
            START_DELETION: {
              target: 'password_verify',
              actions: [
                assign({
                  error: null,
                }),
                () => {
                  accountDeletionLogger.info('Starting account deletion flow', {
                    action: 'transition',
                    from: 'idle',
                    to: 'password_verify',
                    event: 'START_DELETION',
                  });
                },
              ],
            },
          },
        },
        password_verify: {
          entry: () => {
            accountDeletionLogger.info(
              'Verifying password for account deletion',
              {
                action: 'state_entry',
                state: 'password_verify',
                flow: 'account_deletion',
              },
            );
          },
          on: {
            PASSWORD_VERIFIED: {
              target: 'confirm',
              actions: () => {
                accountDeletionLogger.info(
                  'Password verified for account deletion',
                  {
                    action: 'transition',
                    from: 'password_verify',
                    to: 'confirm',
                    event: 'PASSWORD_VERIFIED',
                  },
                );
              },
            },
          },
        },
        confirm: {
          entry: () => {
            accountDeletionLogger.info('Confirming account deletion', {
              action: 'state_entry',
              state: 'confirm',
              flow: 'account_deletion',
            });
          },
          on: {
            CONFIRM_DELETION: {
              target: 'action',
              actions: () => {
                accountDeletionLogger.info(
                  'Account deletion confirmed, executing',
                  {
                    action: 'transition',
                    from: 'confirm',
                    to: 'action',
                    event: 'CONFIRM_DELETION',
                  },
                );
              },
            },
          },
        },
        action: {
          entry: () => {
            accountDeletionLogger.info('Executing account deletion', {
              action: 'state_entry',
              state: 'action',
              flow: 'account_deletion',
            });
          },
          on: {
            DELETION_SUCCESS: {
              target: 'completed',
              actions: () => {
                accountDeletionLogger.info('Account deletion successful', {
                  action: 'transition',
                  from: 'action',
                  to: 'completed',
                  event: 'DELETION_SUCCESS',
                });
              },
            },
            DELETION_ERROR: {
              target: 'error',
              actions: [
                assign({
                  error: ({ event }) => event.error,
                }),
                ({ event }) => {
                  accountDeletionLogger.error(
                    'Account deletion failed',
                    undefined,
                    {
                      action: 'transition',
                      from: 'action',
                      to: 'error',
                      event: 'DELETION_ERROR',
                      error: event.error,
                    },
                  );
                },
              ],
            },
          },
        },
        completed: {
          type: 'final',
          entry: () => {
            accountDeletionLogger.info(
              'Account deletion completed successfully',
              {
                action: 'state_entry',
                state: 'completed',
                flow: 'account_deletion',
              },
            );
          },
        },
        error: {
          entry: ({ context }) => {
            accountDeletionLogger.warn('Account deletion in error state', {
              action: 'state_entry',
              state: 'error',
              flow: 'account_deletion',
              error: context.error,
            });
          },
          on: {
            RESET: {
              target: 'idle',
              actions: [
                assign({
                  error: null,
                  isLoading: false,
                }),
                () => {
                  accountDeletionLogger.info(
                    'Account deletion reset from error',
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
            accountDeletionLogger.debug('Account deletion form idle', {
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
                  accountDeletionLogger.debug('Account deletion form loading', {
                    action: 'transition',
                    from: 'idle',
                    to: 'loading',
                    event: 'LOADING',
                    context: 'form',
                  });
                },
              ],
            },
          },
        },
        loading: {
          entry: () => {
            accountDeletionLogger.debug('Account deletion form loading', {
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
                  accountDeletionLogger.debug(
                    'Account deletion form load complete',
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
          error: null,
          isLoading: false,
        }),
        () => {
          accountDeletionLogger.info('Account deletion machine reset', {
            action: 'reset',
            to: 'idle',
            event: 'RESET',
          });
        },
      ],
    },
  },
});

export const useAccountDeletionMachine = defineStore(
  accountDeletionMachine.id,
  xstate(accountDeletionMachine),
);
