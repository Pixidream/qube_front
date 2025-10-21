import { autoAnimatePlugin } from '@formkit/auto-animate/vue';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import { i18n } from '@/i18n';
import { createZxcvbn } from '@/plugins/zxcvbn.plugin';
import '@assets/css/index.css';
import { useRuntimeDevice } from '@composables/device.composable';
import { createAuthTauriRepository } from '@core/repositories/auth/auth-tauri.repository';
import { createAuthWebRepository } from '@core/repositories/auth/auth-web.repository';
import App from './App.vue';
import { router } from './router';
import { createLogger, logger } from './utils/logger';

// Initialize logging system
createLogger();

// Create main app logger
const mainLogger = logger.child({ component: 'main' });

mainLogger.info('Application starting - Welcome to Qube!');

mainLogger.debug('Loading zxcvbn password strength library');
createZxcvbn();

mainLogger.debug('Creating Pinia state management store');
const pinia = createPinia();

const { isTauri } = useRuntimeDevice();
const repositoryType = isTauri.value ? 'tauri' : 'web';
mainLogger.info('Initializing authentication repository', {
  repositoryType,
  runtime: isTauri.value ? 'desktop' : 'browser',
});

const authRepository =
  isTauri.value ? createAuthTauriRepository() : createAuthWebRepository();

mainLogger.debug('Creating Vue application instance');
const app = createApp(App);

mainLogger.debug('Configuring application plugins and providers');
app
  .provide('authRepository', authRepository)
  .use(i18n)
  .use(pinia)
  .use(router)
  .use(autoAnimatePlugin);

mainLogger.info('Application configuration complete - mounting to DOM');
app.mount('#app');
