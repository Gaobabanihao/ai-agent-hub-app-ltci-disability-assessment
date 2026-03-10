import type { RouteRecordRaw } from 'vue-router';

/**
 * 错误页面路由
 */
export const errorRoutes: RouteRecordRaw[] = [
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: {
      title: '403 - 无权限',
      requiresAuth: false,
    },
  },
  {
    path: '/500',
    name: 'ServerError',
    component: () => import('@/views/error/500.vue'),
    meta: {
      title: '500 - 服务器错误',
      requiresAuth: false,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '404 - 页面不存在',
      requiresAuth: false,
    },
  },
];
