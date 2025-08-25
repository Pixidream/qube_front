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
      displayName: 'Home',
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
          displayName: 'Login',
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
          displayName: 'Signup',
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
          displayName: 'Totp',
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
          displayName: 'Totp Recovery',
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
          displayName: 'Verify Email',
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
          displayName: 'Reset Password',
          isAuthFlow: true,
        } satisfies RouteMeta,
      },
    ],
  },
];

export const router = createRouter({ history: createWebHashHistory(), routes });

router.beforeEach((to) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.meta.isAuthFlow ? '/' : to.fullPath },
    };
  }
});
