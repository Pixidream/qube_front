import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { autoAnimatePlugin } from '@formkit/auto-animate/vue';
import { MotionPlugin } from '@vueuse/motion';

import '@assets/css/index.css';
import App from './App.vue';
import { router } from '@router/index';
import { i18n } from './i18n';

const pinia = createPinia();
createApp(App)
  .use(i18n)
  .use(pinia)
  .use(router)
  .use(autoAnimatePlugin)
  .use(MotionPlugin)
  .mount('#app');
