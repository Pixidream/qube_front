import { xstate } from '@core/middlewares/xstate.middleware';
import { defineStore } from 'pinia';
import { createMachine } from 'xstate';

type TotpConfigurationEvent =
  | { type: 'TOTP_CONFIG' }
  | { type: 'LOADING' }
  | { type: 'IDLE' };

export const totpConfigurationMachine = createMachine({
  id: 'totpConfigurationMachine',
  type: 'parallel',
  types: {
    events: {} as TotpConfigurationEvent,
  },

  states: {
    flow: {
      initial: 'password_verify',
      states: {
        password_verify: {
          on: {
            TOTP_CONFIG: {
              target: 'totp_config',
            },
          },
        },
        totp_config: {
          type: 'final',
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

export const useTotpConfigurationMachine = defineStore(
  totpConfigurationMachine.id,
  xstate(totpConfigurationMachine),
);
