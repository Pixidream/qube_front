import { useAppStore } from '@/stores/app.stores';
import { useAuthStore } from '@/stores/auth.stores';
import { type RouteMeta } from '@core/types/router';
import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from 'vue-router';

const routes: readonly RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@components/pages/HomePage.vue'),
    meta: {
      requiresAuth: true,
      displayName: 'navigation.home',
      isAuthFlow: false,
    } satisfies RouteMeta,
  },
  {
    path: '/auth',
    component: () => import('@components/templates/AuthTemplate.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () =>
          import('@components/pages/authentication/LoginPage.vue'),
        meta: {
          requiresAuth: false,
          displayName: 'navigation.login',
          isAuthFlow: true,
        } satisfies RouteMeta,
      },
      {
        path: 'signup',
        name: 'signup',
        component: () =>
          import('@components/pages/authentication/SignupPage.vue'),
        meta: {
          requiresAuth: false,
          displayName: 'navigation.signup',
          isAuthFlow: true,
        } satisfies RouteMeta,
      },
      {
        path: 'totp',
        name: 'totp',
        component: () =>
          import('@components/pages/authentication/TotpPage.vue'),
        meta: {
          requiresAuth: false,
          displayName: 'naviation.totp',
          isAuthFlow: true,
        } satisfies RouteMeta,
      },
      {
        path: 'totp-recovery',
        name: 'totp-recovery',
        component: () =>
          import('@components/pages/authentication/TotpRecoveryPage.vue'),
        meta: {
          requiresAuth: false,
          displayName: 'navigation.totpRecovery',
          isAuthFlow: true,
        } satisfies RouteMeta,
      },
      {
        path: 'verify-email',
        name: 'verify-email',
        component: () =>
          import('@components/pages/authentication/VerifyEmailPage.vue'),
        meta: {
          requiresAuth: false,
          displayName: 'navigation.verifyEmail',
          isAuthFlow: true,
        } satisfies RouteMeta,
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: () =>
          import('@components/pages/authentication/ResetPasswordPage.vue'),
        meta: {
          requiresAuth: false,
          displayName: 'navigation.resetPassword',
          isAuthFlow: true,
        } satisfies RouteMeta,
      },
    ],
  },
  {
    path: '/account',
    component: () => import('@components/templates/AccountTemplate.vue'),
    redirect: { name: 'profile' },
    name: 'account',
    children: [
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@components/pages/account/ProfilePage.vue'),
        meta: {
          requiresAuth: true,
          displayName: 'navigation.profile',
          isAuthFlow: false,
        } satisfies RouteMeta,
      },
      {
        path: 'security',
        name: 'security',
        component: () => import('@components/pages/account/SecurityPage.vue'),
        meta: {
          requiresAuth: true,
          displayName: 'navigation.security',
          isAuthFlow: false,
        } satisfies RouteMeta,
      },
    ],
  },
];

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
