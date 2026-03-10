import type { App } from 'vue';

import { setupElementPlus } from './element-plus';

export function setupPlugins(app: App) {
  setupElementPlus(app);
}
