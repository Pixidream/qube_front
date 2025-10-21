import { useAppStore } from '@/stores/app.stores';
import { useAuthStore } from '@/stores/auth.stores';
import { createRouter, createWebHashHistory } from 'vue-router';
import routes from './routes';
import { createServiceLogger } from '@/utils/logger';

const routerLogger = createServiceLogger('Router');

export const router = createRouter({ history: createWebHashHistory(), routes });

routerLogger.info('Router created with hash history', {
  action: 'router_created',
  routeCount: routes.length,
});

router.beforeEach((to, from) => {
  const authStore = useAuthStore();
  const appStore = useAppStore();

  routerLogger.debug('Router navigation attempt', {
    action: 'navigation_start',
    to: to.name,
    from: from.name,
    path: to.path,
    requiresAuth: !!to.meta.requiresAuth,
    isAuthFlow: !!to.meta.isAuthFlow,
    isAuthenticated: authStore.isAuthenticated,
  });

  if (!appStore.isAppInitialized) {
    routerLogger.debug('Navigation blocked - app not initialized', {
      action: 'navigation_blocked',
      reason: 'app_not_initialized',
      to: to.name,
    });
    return;
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    routerLogger.info('Redirecting unauthenticated user to login', {
      action: 'auth_redirect',
      to: to.name,
      redirectTo: 'login',
      originalPath: to.fullPath,
    });
    return {
      name: 'login',
      query: { redirect: to.meta.isAuthFlow ? '/' : to.fullPath },
    };
  }

  if (authStore.isAuthenticated && to.meta.isAuthFlow) {
    routerLogger.info('Redirecting authenticated user from auth flow', {
      action: 'auth_flow_redirect',
      from: to.name,
      redirectTo: 'home',
    });
    return {
      name: 'home',
    };
  }

  routerLogger.debug('Navigation allowed', {
    action: 'navigation_allowed',
    to: to.name,
    path: to.path,
  });
});

router.afterEach((to, from) => {
  routerLogger.info('Navigation completed', {
    action: 'navigation_complete',
    to: to.name,
    from: from.name,
    path: to.path,
  });
});

router.onError((error, to) => {
  routerLogger.error('Router navigation error', error, {
    action: 'navigation_error',
    to: to?.name,
    path: to?.path,
  });
});
