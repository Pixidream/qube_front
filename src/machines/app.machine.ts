import { xstate } from '@core/middlewares/xstate.middleware';
import { defineStore } from 'pinia';
import { createMachine } from 'xstate';

const appMachine = createMachine({
  id: 'appMachine',
  initial: 'initializing',
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
