import type { PropType } from 'vue';

import type {
  AdaptiveConfig,
  Align,
  DefaultLanguage,
  Language,
  LoadingConfig,
  PaginationProps,
  TableColumns,
} from './types';

const createDefaultPagination = (): PaginationProps => ({
  total: 0,
  pageSize: 5,
  currentPage: 1,
  align: 'right',
  size: 'default',
  background: false,
  pageSizes: [5, 10, 15, 20],
  layout: 'total, sizes, prev, pager, next, jumper',
});

const createDefaultAdaptiveConfig = (): AdaptiveConfig => ({
  offsetBottom: 96,
  fixHeader: true,
  timeout: 60,
  zIndex: 3,
});

export default {
  tableKey: {
    type: [String, Number] as PropType<string | number>,
    default: '0',
  },
  columns: {
    type: Array as PropType<TableColumns[]>,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingConfig: {
    type: Object as PropType<LoadingConfig>,
    default: () => ({}),
  },
  alignWhole: {
    type: String as PropType<Align>,
    default: 'left',
  },
  headerAlign: {
    type: String as PropType<Align | ''>,
    default: '',
  },
  showOverflowTooltip: {
    type: Boolean,
    default: false,
  },
  rowHoverBgColor: {
    type: String,
    default: '',
  },
  pagination: {
    type: Object as PropType<PaginationProps>,
    default: createDefaultPagination,
  },
  adaptive: {
    type: Boolean,
    default: false,
  },
  adaptiveConfig: {
    type: Object as PropType<AdaptiveConfig>,
    default: createDefaultAdaptiveConfig,
  },
  locale: {
    type: [String, Object] as PropType<DefaultLanguage | Language | ''>,
    default: '',
  },
} as const;
