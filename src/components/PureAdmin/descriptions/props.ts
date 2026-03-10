import type { PropType } from 'vue';

import type {
  DescriptionsAlign,
  DescriptionsColumn,
  DescriptionsLoading,
} from './types';

export default {
  data: {
    type: Array as PropType<Array<Record<string, unknown>>>,
    default: () => [],
  },
  columns: {
    type: Array as PropType<DescriptionsColumn[]>,
    default: () => [],
  },
  loading: {
    type: Object as PropType<DescriptionsLoading>,
    default: () => ({
      load: false,
      text: 'Loading...',
      svg: '',
      spinner: '',
      svgViewBox: '',
      background: '',
    }),
  },
  align: {
    type: String as PropType<DescriptionsAlign>,
    default: 'left',
  },
  labelAlign: {
    type: String as PropType<DescriptionsAlign | ''>,
    default: '',
  },
  ...ElDescriptions.props,
} as const;
