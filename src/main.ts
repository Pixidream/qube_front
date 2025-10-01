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
import { createLogger } from './utils/logger';

createLogger();

console.info('Welcome to Qube !');

console.log('Loading zxcvbn ...');
createZxcvbn();

console.log('creating pinia ...');
const pinia = createPinia();

const { isTauri } = useRuntimeDevice();
console.log(
  `creating repository. loading: ${isTauri.value ? 'tauri repository' : 'web repository'}`,
);
const authRepository =
  isTauri.value ? createAuthTauriRepository() : createAuthWebRepository();

console.log('creating app ...');
const app = createApp(App);

console.log('providing repo and loading plugins before mounting...');
app
  .provide('authRepository', authRepository)
  .use(i18n)
  .use(pinia)
  .use(router)
  .use(autoAnimatePlugin)
  .mount('#app');
