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
        path: 'personal',
        name: 'personal',
        component: () => import('@components/pages/account/PersonalPage.vue'),
        meta: {
          requiresAuth: true,
          displayName: 'navigation.personal',
          isAuthFlow: false,
        } satisfies RouteMeta,
      },
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
] as RouteRecordRaw[];
