import { xstate } from '@core/middlewares/xstate.middleware';
import { defineStore } from 'pinia';
import { createMachine } from 'xstate';
import { logger } from '@/utils/logger';

const totpConfigMachineLogger = logger.child({ machine: 'totpConfiguration' });

type TotpConfigurationEvent =
  | { type: 'TOTP_CONFIG' }
  | { type: 'SHOW_RECOVERY_CODES' }
  | { type: 'COMPLETE' }
  | { type: 'RESET' }
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
          entry: () => {
            totpConfigMachineLogger.info(
              'Starting TOTP configuration - password verification',
              {
                action: 'state_entry',
                state: 'password_verify',
                flow: 'totp_configuration',
              },
            );
          },
          on: {
            TOTP_CONFIG: {
              target: 'totp_config',
              actions: () => {
                totpConfigMachineLogger.info(
                  'Password verified, proceeding to TOTP configuration',
                  {
                    action: 'transition',
                    from: 'password_verify',
                    to: 'totp_config',
                    event: 'TOTP_CONFIG',
                  },
                );
              },
            },
          },
        },
        totp_config: {
          entry: () => {
            totpConfigMachineLogger.info('Configuring TOTP authenticator', {
              action: 'state_entry',
              state: 'totp_config',
              flow: 'totp_configuration',
            });
          },
          on: {
            SHOW_RECOVERY_CODES: {
              target: 'recovery_codes',
              actions: () => {
                totpConfigMachineLogger.info(
                  'TOTP configured, showing recovery codes',
                  {
                    action: 'transition',
                    from: 'totp_config',
                    to: 'recovery_codes',
                    event: 'SHOW_RECOVERY_CODES',
                  },
                );
              },
            },
          },
        },
        recovery_codes: {
          entry: () => {
            totpConfigMachineLogger.info('Displaying TOTP recovery codes', {
              action: 'state_entry',
              state: 'recovery_codes',
              flow: 'totp_configuration',
            });
          },
          on: {
            COMPLETE: {
              target: 'completed',
              actions: () => {
                totpConfigMachineLogger.info(
                  'TOTP configuration completed successfully',
                  {
                    action: 'transition',
                    from: 'recovery_codes',
                    to: 'completed',
                    event: 'COMPLETE',
                  },
                );
              },
            },
          },
        },
        completed: {
          type: 'final',
          entry: () => {
            totpConfigMachineLogger.info('TOTP configuration flow completed', {
              action: 'state_entry',
              state: 'completed',
              flow: 'totp_configuration',
            });
          },
        },
      },
    },
    form: {
      initial: 'idle',
      states: {
        idle: {
          entry: () => {
            totpConfigMachineLogger.debug(
              'TOTP configuration form in idle state',
              {
                action: 'state_entry',
                state: 'idle',
                context: 'form',
              },
            );
          },
          on: {
            LOADING: {
              target: 'loading',
              actions: () => {
                totpConfigMachineLogger.debug(
                  'TOTP configuration form loading',
                  {
                    action: 'transition',
                    from: 'idle',
                    to: 'loading',
                    event: 'LOADING',
                    context: 'form',
                  },
                );
              },
            },
          },
        },
        loading: {
          entry: () => {
            totpConfigMachineLogger.debug(
              'TOTP configuration form in loading state',
              {
                action: 'state_entry',
                state: 'loading',
                context: 'form',
              },
            );
          },
          on: {
            IDLE: {
              target: 'idle',
              actions: () => {
                totpConfigMachineLogger.debug(
                  'TOTP configuration form load complete',
                  {
                    action: 'transition',
                    from: 'loading',
                    to: 'idle',
                    event: 'IDLE',
                    context: 'form',
                  },
                );
              },
            },
          },
        },
      },
    },
  },
  on: {
    RESET: {
      target: '.flow.password_verify',
      actions: () => {
        totpConfigMachineLogger.info('TOTP configuration flow reset', {
          action: 'reset',
          to: 'password_verify',
          event: 'RESET',
        });
      },
    },
  },
});

export const useTotpConfigurationMachine = defineStore(
  totpConfigurationMachine.id,
  xstate(totpConfigurationMachine),
);
