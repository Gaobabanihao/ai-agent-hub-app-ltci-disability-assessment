import type { RouteRecordRaw } from 'vue-router';

import { baseRoutes } from './base';
import { demoRoutes } from './demo';
import { errorRoutes } from './error';
import { mainRoutes } from './main';

/**
 * 静态路由
 * 按顺序合并：基础路由 -> 主要路由 -> 示例路由 -> 错误路由（404 放最后）
 */
export const staticRoutes: RouteRecordRaw[] = [
  ...baseRoutes,
  ...mainRoutes,
  ...demoRoutes,
  ...errorRoutes,
];

export { baseRoutes, demoRoutes, errorRoutes, mainRoutes };
