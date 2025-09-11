import { xstate } from '@core/middlewares/xstate.middleware';
import { defineStore } from 'pinia';
import { createMachine, assign } from 'xstate';

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
          on: {
            START_ACTION: {
              target: 'password_verify',
              actions: assign({
                actionType: ({ event }) => event.actionType,
                error: null,
              }),
            },
          },
        },
        password_verify: {
          on: {
            PASSWORD_VERIFIED: {
              target: 'confirm',
            },
          },
        },
        confirm: {
          on: {
            CONFIRM_ACTION: {
              target: 'action',
            },
          },
        },
        action: {
          on: {
            ACTION_SUCCESS: [
              {
                target: 'result',
                guard: ({ context }) => context.actionType === 'regenerate',
              },
              {
                target: 'completed',
                guard: ({ context }) => context.actionType === 'disable',
              },
            ],
            ACTION_ERROR: {
              target: 'error',
              actions: assign({
                error: ({ event }) => event.error,
              }),
            },
          },
        },
        result: {
          on: {
            COMPLETE: {
              target: 'completed',
            },
          },
        },
        completed: {
          type: 'final',
        },
        error: {
          on: {
            RESET: {
              target: 'idle',
              actions: assign({
                actionType: null,
                error: null,
                isLoading: false,
              }),
            },
          },
        },
      },
    },
    form: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            LOADING: {
              target: 'loading',
              actions: assign({
                isLoading: true,
              }),
            },
          },
        },
        loading: {
          on: {
            IDLE: {
              target: 'idle',
              actions: assign({
                isLoading: false,
              }),
            },
          },
        },
      },
    },
  },
  on: {
    RESET: {
      target: '.flow.idle',
      actions: assign({
        actionType: null,
        error: null,
        isLoading: false,
      }),
    },
  },
});

export const useTotpSecureActionMachine = defineStore(
  totpSecureActionMachine.id,
  xstate(totpSecureActionMachine),
);
