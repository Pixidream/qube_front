import { createPinia } from "pinia"
import { createApp } from "vue";

import '@assets/css/index.css';
import App from "./App.vue";
import { router } from '@router/index';

const pinia = createPinia()
createApp(App).use(pinia).use(router).mount("#app");
