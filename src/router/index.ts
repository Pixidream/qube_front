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
    ],
  },
];

export const router = createRouter({ history: createWebHashHistory(), routes });

router.beforeEach((to) => {
  if (to.meta.requireAuth) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
});
