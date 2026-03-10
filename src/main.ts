import { createApp } from 'vue';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import App from './App.vue';
import { APP_CONFIG } from './config/app';
import { setupDirectives } from './directives';
import { setupPlugins } from './plugins';
import { setupRouter } from './router';
import { setupStore } from './store';

import 'virtual:uno.css';
// 引入重置样式
import './style/reset.scss';
// 导入公共样式
import './style/index.scss';

dayjs.locale('zh-cn');

document.title = APP_CONFIG.title;

const app = createApp(App);

setupStore(app);
setupPlugins(app);
setupDirectives(app);
setupRouter(app);

app.mount('#app');
