import { autoAnimatePlugin } from '@formkit/auto-animate/vue';
import { createPinia } from 'pinia';
import { createApp, Plugin } from 'vue';

import { i18n } from '@/i18n';
import { createZxcvbn } from '@/plugins/zxcvbn.plugin';
import '@assets/css/index.css';
import { useRuntimeDevice } from '@composables/device.composable';
import { createAuthTauriRepository } from '@core/repositories/auth/auth-tauri.repository';
import { createAuthWebRepository } from '@core/repositories/auth/auth-web.repository';
import App from './App.vue';

createZxcvbn();
const pinia = createPinia();
const { isTauri } = useRuntimeDevice();
const authRepository =
  isTauri.value ? createAuthTauriRepository() : createAuthWebRepository();
const app = createApp(App);

app
  .provide('authRepository', authRepository)
  .use(i18n)
  .use(pinia)
  .use(autoAnimatePlugin)
  .mount('#app');

export const patchApp = (plugin: Plugin<any>): void => {
  app.use(plugin);
};
