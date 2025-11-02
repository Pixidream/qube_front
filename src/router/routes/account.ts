import { type RouteMeta } from '@core/types/router';
import { type RouteRecordRaw } from 'vue-router';

export default [
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
        path: 'settings',
        name: 'settings',
        component: () => import('@components/pages/account/SettingsPage.vue'),
        meta: {
          requiresAuth: true,
          displayName: 'navigation.settings',
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
] as RouteRecordRaw[];
