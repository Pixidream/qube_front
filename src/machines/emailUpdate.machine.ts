import { xstate } from '@core/middlewares/xstate.middleware';
import { defineStore } from 'pinia';
import { createMachine } from 'xstate';
import { logger } from '@/utils/logger';

const emailUpdateMachineLogger = logger.child({
  machine: 'emailUpdateMachine',
});

type EmailUpdateEvent =
  | { type: 'EMAIL_UPDATE' }
  | { type: 'COMPLETE' }
  | { type: 'RESET' }
  | { type: 'LOADING' }
  | { type: 'IDLE' };

export const emailUpdateMachine = createMachine({
  id: 'emailUpdateMachine',
  type: 'parallel',
  types: {
    events: {} as EmailUpdateEvent,
  },

  states: {
    flow: {
      initial: 'password_verify',
      states: {
        password_verify: {
          entry: () => {
            emailUpdateMachineLogger.info(
              'Starting TOTP configuration - password verification',
              {
                action: 'state_entry',
                state: 'password_verify',
                flow: 'totp_configuration',
              },
            );
          },
          on: {
            EMAIL_UPDATE: {
              target: 'email_update',
              actions: () => {
                emailUpdateMachineLogger.info(
                  'Password verified, proceeding to email update',
                  {
                    action: 'transition',
                    from: 'password_verify',
                    to: 'email_update',
                    event: 'EMAIL_UPDATE',
                  },
                );
              },
            },
          },
        },
        email_update: {
          entry: () => {
            emailUpdateMachineLogger.info('Updating email', {
              action: 'state_entry',
              state: 'email_update',
              flow: 'email_update',
            });
          },
          on: {
            COMPLETE: {
              target: 'completed',
              actions: () => {
                emailUpdateMachineLogger.info(
                  'Email update completed successfully',
                  {
                    action: 'transition',
                    from: 'email_update',
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
            emailUpdateMachineLogger.info('Email update flow completed', {
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
            emailUpdateMachineLogger.debug('Update email form in idle state', {
              action: 'state_entry',
              state: 'idle',
              context: 'form',
            });
          },
          on: {
            LOADING: {
              target: 'loading',
              actions: () => {
                emailUpdateMachineLogger.debug('Update email form loading', {
                  action: 'transition',
                  from: 'idle',
                  to: 'loading',
                  event: 'LOADING',
                  context: 'form',
                });
              },
            },
          },
        },
        loading: {
          entry: () => {
            emailUpdateMachineLogger.debug(
              'Update email form in loading state',
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
                emailUpdateMachineLogger.debug(
                  'Update email form load complete',
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
        emailUpdateMachineLogger.info('Update email flow reset', {
          action: 'reset',
          to: 'password_verify',
          event: 'RESET',
        });
      },
    },
  },
});

export const useUpdateEmailMachine = defineStore(
  emailUpdateMachine.id,
  xstate(emailUpdateMachine),
);
