import type { App } from 'vue';

import { createPinia } from 'pinia';

const pinia = createPinia();

export function setupStore(app: App) {
  app.use(pinia);
}

// 导出 Store 模块
export { useAppStore } from './modules/app';
export { useUserStore } from './modules/user';

export default pinia;
