import { xstate } from '@core/middlewares/xstate.middleware';
import { defineStore } from 'pinia';
import { createMachine } from 'xstate';
import { logger } from '@/utils/logger';

const appMachineLogger = logger.child({ machine: 'app' });

type AppEvent = { type: 'INITIALIZE' } | { type: 'LOADED' };

const appMachine = createMachine({
  id: 'appMachine',
  initial: 'initializing',
  types: {
    events: {} as AppEvent,
  },
  states: {
    initializing: {
      entry: () => {
        appMachineLogger.info(
          'App machine transitioning to initializing state',
          {
            action: 'state_entry',
            state: 'initializing',
          },
        );
      },
      on: {
        LOADED: {
          target: 'loaded',
          actions: () => {
            appMachineLogger.info('App initialization completed', {
              action: 'transition',
              from: 'initializing',
              to: 'loaded',
              event: 'LOADED',
            });
          },
        },
      },
    },
    loaded: {
      entry: () => {
        appMachineLogger.info('App machine transitioning to loaded state', {
          action: 'state_entry',
          state: 'loaded',
        });
      },
      on: {
        INITIALIZE: {
          target: 'initializing',
          actions: () => {
            appMachineLogger.info('App reinitialization requested', {
              action: 'transition',
              from: 'loaded',
              to: 'initializing',
              event: 'INITIALIZE',
            });
          },
        },
      },
    },
  },
});

export const useAppMachine = defineStore(appMachine.id, xstate(appMachine));
