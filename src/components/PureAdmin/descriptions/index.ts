import type { App } from 'vue';

import PureDescriptionsComponent from './PureDescriptions';

import 'element-plus/es/components/descriptions/style/css';
import 'element-plus/es/components/loading/style/css';

export const PureDescriptions = Object.assign(PureDescriptionsComponent, {
  install(app: App) {
    app.component(
      PureDescriptionsComponent.name ?? 'PureDescriptions',
      PureDescriptionsComponent,
    );
  },
});

export default PureDescriptions;
