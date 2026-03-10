import type { App } from 'vue';

import * as ElementPlusIconsVue from '@element-plus/icons-vue';
// 有 ElementPlusResolver 自动引入，一般情况下不需要引入全量 css
import 'element-plus/dist/index.css';

export function setupElementPlus(app: App) {
  // 注册所有图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }
}
