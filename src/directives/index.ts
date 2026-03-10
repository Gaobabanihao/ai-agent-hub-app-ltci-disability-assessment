import type { App } from 'vue';

import { auth } from './auth';
import { copy } from './copy';
import { longpress } from './longpress';
import { optimize } from './optimize';
import { perms } from './perms';
import { Ripple } from './ripple';

export function setupDirectives(app: App) {
  // v-auth: 路由权限控制（基于角色）
  app.directive('auth', auth);
  // v-perms: 按钮权限控制（基于权限标识）
  app.directive('perms', perms);
  // v-copy: 文本复制（默认双击，可用 v-copy:click 改为单击）
  app.directive('copy', copy);
  // v-longpress: 长按事件（v-longpress:500 设置延迟，v-longpress:500:100 设置连续触发）
  app.directive('longpress', longpress);
  // v-optimize: 防抖/节流（v-optimize:debounce 或 v-optimize:throttle）
  app.directive('optimize', optimize);
  // v-ripple: 水波纹效果
  app.directive('ripple', Ripple);
}

export { auth, copy, longpress, optimize, perms, Ripple };
