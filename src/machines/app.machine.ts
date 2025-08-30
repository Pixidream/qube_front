import { xstate } from '@core/middlewares/xstate.middleware';
import { defineStore } from 'pinia';
import { createMachine } from 'xstate';

type AppEvent = { type: 'INITIALIZE' } | { type: 'LOADED' };

const appMachine = createMachine({
  id: 'appMachine',
  initial: 'initializing',
  types: {
    events: {} as AppEvent,
  },
  states: {
    initializing: {
      on: {
        LOADED: 'loaded',
      },
    },
    loaded: {
      on: {
        INITIALIZE: 'initializing',
      },
    },
  },
});

export const useAppMachine = defineStore(appMachine.id, xstate(appMachine));
