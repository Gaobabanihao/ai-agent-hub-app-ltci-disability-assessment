import type { App } from 'vue';

import { createRouter, createWebHashHistory } from 'vue-router';
import { APP_CONFIG } from '@/config/app';

// import { isAuthenticated } from '@/utils/auth';
import NProgress from '@/utils/progress';

import { staticRoutes } from './modules';

/** 白名单路由（无需登录） */
const WHITE_LIST = ['/login', '/register', '/404', '/403', '/500', '/demo'];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: staticRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

/**
 * 路由守卫
 * 1. 设置页面标题
 * 2. 登录验证
 * 3. 权限校验（可扩展）
 */
router.beforeEach((to, _from, next) => {
  NProgress.start();

  // 设置页面标题
  const title = to.meta?.title as string;
  const appTitle = APP_CONFIG.title;
  document.title = title ? `${ title } - ${ appTitle }` : appTitle;

  // 白名单路由直接放行（支持前缀匹配）
  if (WHITE_LIST.some((path) => to.path === path || to.path.startsWith(path + '/'))) {
    next();
    return;
  }

  // 需要登录验证
  // if (to.meta?.requiresAuth !== false) {
  //   if (!isAuthenticated()) {
  //     // 未登录，跳转到登录页
  //     next({
  //       path: '/login',
  //       query: { redirect: to.fullPath },
  //     });
  //     return;
  //   }
  // }

  // TODO: 权限校验可在此扩展
  // if (to.meta?.permissions) {
  //   if (!hasPermission(to.meta.permissions)) {
  //     next('/403');
  //     return;
  //   }
  // }

  next();
});

router.afterEach(() => {
  NProgress.done();
});

export function setupRouter(app: App) {
  app.use(router);
}

export default router;
