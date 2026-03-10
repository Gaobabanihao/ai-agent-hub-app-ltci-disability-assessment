import type { RouteRecordRaw } from 'vue-router';

// const Layout = () => import('@/layouts/default/index.vue');

/**
 * 主要业务路由
 * 需要登录才能访问，使用默认布局
 *
 * 路由结构说明：
 * - 使用 Layout 作为父组件，子路由会渲染在 Layout 的 <router-view /> 中
 * - meta.icon: 菜单图标（Element Plus Icons 名称）
 * - meta.keepAlive: 是否缓存页面
 * - meta.hidden: 是否在菜单中隐藏
 * - meta.order: 菜单排序（数字越小越靠前）
 */
export const mainRoutes: RouteRecordRaw[] = [
  /* {
    path: '/',
    name: 'Root',
    component: Layout,
    redirect: '/home',
    meta: {
      title: '',
      requiresAuth: true,
    },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
      },
    ],
  }, */
  {
    path: '/',
    name: 'Root',
    redirect: '/ltci-assessment',
  },
  {
    path: '/ltci-assessment',
    name: 'LtciAssessment',
    component: () => import('@/views/ltci-assessment/index.vue'),
    meta: {
      title: '失能等级评估',
      icon: 'Medal',
      keepAlive: true,
      requiresAuth: true,
    },
  },
  {
    path: '/ltci-assessment/history',
    name: 'LtciAssessmentHistory',
    component: () => import('@/views/ltci-assessment/history/index.vue'),
    meta: {
      title: '历史评估记录',
      icon: 'Tickets',
      keepAlive: false,
      requiresAuth: true,
    },
  },
];
