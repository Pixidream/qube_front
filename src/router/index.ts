import { useAppStore } from '@/stores/app.stores';
import { useAuthStore } from '@/stores/auth.stores';
import { createRouter, createWebHashHistory } from 'vue-router';
import routes from './routes';

export const router = createRouter({ history: createWebHashHistory(), routes });

router.beforeEach((to) => {
  const authStore = useAuthStore();
  const appStore = useAppStore();

  if (!appStore.isAppInitialized) {
    return;
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.meta.isAuthFlow ? '/' : to.fullPath },
    };
  }

  if (authStore.isAuthenticated && to.meta.isAuthFlow) {
    return {
      name: 'home',
    };
  }
});
