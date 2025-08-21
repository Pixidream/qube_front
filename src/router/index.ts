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
    meta: { requiresAuth: false, displayName: 'Home' },
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
        meta: { requiresAuth: false, displayName: 'Login' },
      },
      {
        path: 'signup',
        name: 'signup',
        component: () =>
          import('@components/pages/authentication/SignupPage.vue'),
        meta: { requiresAuth: false, displayName: 'Signup' },
      },
      {
        path: 'totp',
        name: 'totp',
        component: () =>
          import('@components/pages/authentication/TotpPage.vue'),
        meta: { requiresAuth: false, displayName: 'Totp' },
      },
      {
        path: 'totp-recovery',
        name: 'totp-recovery',
        component: () =>
          import('@components/pages/authentication/TotpRecoveryPage.vue'),
        meta: { requiresAuth: false, displayName: 'Totp Recovery' },
      },
      {
        path: 'verify-email',
        name: 'verify-email',
        component: () =>
          import('@components/pages/authentication/VerifyEmailPage.vue'),
        meta: { requiresAuth: false, displayName: 'Verify Email' },
      },
    ],
  },
];

export const router = createRouter({ history: createWebHashHistory(), routes });

router.beforeEach((to) => {
  if (to.meta.requireAuth) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
});
