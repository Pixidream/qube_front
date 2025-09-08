import { type RouteMeta } from '@core/types/router';
import auth from './auth';
import account from './account';

export default [
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
  ...auth,
  ...account,
];
