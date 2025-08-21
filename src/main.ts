import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { autoAnimatePlugin } from '@formkit/auto-animate/vue';

import '@assets/css/index.css';
import App from './App.vue';
import { router } from '@router/index';
import { i18n } from './i18n';
import { createZxcvbn } from '@/plugins/zxcvbn.plugin';
import { createAuthApiRepository } from './core/repositories/auth/auth-api.repository';

createZxcvbn();
const pinia = createPinia();
const authRepository = createAuthApiRepository();

createApp(App)
  .provide('authRepository', authRepository)
  .use(i18n)
  .use(pinia)
  .use(router)
  .use(autoAnimatePlugin)
  .mount('#app');
