import { type RouteRecordRaw } from 'vue-router';
import { type RouteMeta } from '@core/types/router';

export default [
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
] as readonly RouteRecordRaw[];
