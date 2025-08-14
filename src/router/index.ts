import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';

const routes: readonly RouteRecordRaw[] = [];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
