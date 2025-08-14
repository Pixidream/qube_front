import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from 'vue-router';

const routes: readonly RouteRecordRaw[] = [
  {
    path: '/auth/login',
    name: 'login',
    component: () => import('@components/pages/authentication/LoginPage.vue'),
    meta: { requiresAuth: false, displayName: 'Login' },
  },
];

export const router = createRouter({ history: createWebHashHistory(), routes });

router.beforeEach((to) => {
  if (to.meta.requireAuth) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
});
