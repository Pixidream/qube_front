import { autoAnimatePlugin } from '@formkit/auto-animate/vue';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import { createZxcvbn } from '@/plugins/zxcvbn.plugin';
import '@assets/css/index.css';
import { router } from '@router/index';
import App from './App.vue';
import { createAuthApiRepository } from './core/repositories/auth/auth-api.repository';
import { i18n } from './i18n';

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
