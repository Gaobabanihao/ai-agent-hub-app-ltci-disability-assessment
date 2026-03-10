import type { App } from 'vue';

import PureTableComponent from './PureTable';
import type { PureTableInstallOptions } from './types';

import 'element-plus/theme-chalk/dark/css-vars.css';
import 'element-plus/es/components/loading/style/css';
import 'element-plus/es/components/pagination/style/css';
import 'element-plus/es/components/table/style/css';

const defaultInstallOptions = {
  locale: null,
  i18n: null,
  ssr: false,
} satisfies Required<PureTableInstallOptions>;

export const PureTable = Object.assign(PureTableComponent, {
  install: (app: App, options?: PureTableInstallOptions) => {
    app.component(PureTableComponent.name ?? 'PureTable', PureTableComponent);
    app.provide('locale', { ...defaultInstallOptions, ...options });
  },
});

export default PureTable;
