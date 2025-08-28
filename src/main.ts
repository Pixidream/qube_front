import { autoAnimatePlugin } from '@formkit/auto-animate/vue';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import { i18n } from '@/i18n';
import { createZxcvbn } from '@/plugins/zxcvbn.plugin';
import '@assets/css/index.css';
import { useRuntimeDevice } from '@composables/device.composable';
import { createAuthTauriRepository } from '@core/repositories/auth/auth-tauri.repository';
import { createAuthWebRepository } from '@core/repositories/auth/auth-web.repository';
import { router } from '@router/index';
import App from './App.vue';

createZxcvbn();
const pinia = createPinia();
const { isTauri } = useRuntimeDevice();
const authRepository =
  isTauri.value ? createAuthTauriRepository() : createAuthWebRepository();

createApp(App)
  .provide('authRepository', authRepository)
  .use(i18n)
  .use(pinia)
  .use(router)
  .use(autoAnimatePlugin)
  .mount('#app');
