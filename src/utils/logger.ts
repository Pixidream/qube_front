import { isTauri } from '@tauri-apps/api/core';
import { warn, debug, trace, info, error } from '@tauri-apps/plugin-log';

function forwardConsole(
  fnName: 'log' | 'debug' | 'info' | 'warn' | 'error',
  logger: (message: string) => Promise<void>,
) {
  const original = import.meta.env.DEV ? console[fnName] : () => {};
  console[fnName] = (message) => {
    original(message);
    logger(message);
  };
}

export const createLogger = () => {
  if (isTauri()) {
    if (import.meta.env.DEV) {
      forwardConsole('log', trace);
      forwardConsole('debug', debug);
    }
    forwardConsole('info', info);
    forwardConsole('warn', warn);
    forwardConsole('error', error);
  }
};
