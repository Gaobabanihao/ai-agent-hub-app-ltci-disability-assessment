import type {
  CellCls,
  CellStyle,
  ColumnCls,
  ColumnStyle,
  Sort,
  SummaryMethod,
  TableColumnCtx,
  TreeNode,
} from 'element-plus';
import type { CSSProperties, VNodeChild } from 'vue';

export type Size = 'large' | 'default' | 'small';
export type Align = 'left' | 'center' | 'right';
export type Effect = 'dark' | 'light';
export type Layout = 'fixed' | 'auto';

export type TranslatePair = {
  [key: string]: string | string[] | TranslatePair;
};

export type DefaultLanguage = 'en' | 'zhCn' | 'zhTw';

export type Language = {
  name: string;
  el: TranslatePair;
};

type I18nLocaleValue = string | { value: string };
type I18nMessageDict = Record<string, unknown>;
type I18nMessageGetter = (locale: string) => I18nMessageDict | undefined;

export type I18nLike = {
  global?: {
    locale?: I18nLocaleValue;
    getLocaleMessage?: I18nMessageGetter;
  };
  locale?: I18nLocaleValue;
  getLocaleMessage?: I18nMessageGetter;
};

export type LoadingConfig = {
  text?: string;
  spinner?: string;
  svg?: string;
  viewBox?: string;
  background?: string;
};

export type PaginationProps = {
  size?: Size;
  background?: boolean;
  pageSize: number;
  defaultPageSize?: number;
  total: number;
  pageCount?: number;
  pagerCount?: number;
  currentPage: number;
  defaultCurrentPage?: number;
  layout?: string;
  pageSizes?: number[];
  popperClass?: string;
  prevText?: string;
  nextText?: string;
  disabled?: boolean;
  hideOnSinglePage?: boolean;
  align?: Align;
  style?: CSSProperties;
  class?: string;
};

export type TableColumnSortOrders = 'ascending' | 'descending' | null;
export type TableColumnType = 'selection' | 'index' | 'expand';
export type TableColumnSortable = false | true | 'custom';
export type TableColumnFixed = true | 'left' | 'right';
export type TableColumnFilterPlacement =
  | 'top-start'
  | 'top-end'
  | 'top'
  | 'bottom-start'
  | 'bottom-end'
  | 'bottom'
  | 'left-start'
  | 'left-end'
  | 'left'
  | 'right-start'
  | 'right-end'
  | 'right';

type FilterMethods = (
  value: unknown,
  row: unknown,
  column: TableColumnCtx<any>,
) => void;

type RH = { column: TableColumnCtx<any>; $index: number };

export interface TableColumnScope {
  row?: unknown;
  column: TableColumn;
  $index: number;
}

export interface TableColumnRenderer extends TableColumnScope {
  index: number;
  props: Record<string, unknown>;
  attrs: Record<string, unknown>;
}

export type TableColumn = {
  label?: string;
  prop?: string | ((index: number) => string);
  type?: TableColumnType;
  index?: number | ((index: number) => number);
  columnKey?: string;
  width?: string | number;
  minWidth?: string | number;
  fixed?: TableColumnFixed;
  renderHeader?: (data: RH) => VNodeChild;
  sortable?: TableColumnSortable;
  sortMethod?: (a: unknown, b: unknown) => number;
  sortBy?:
    | string
    | ((row: unknown, index: number) => string)
    | string[];
  sortOrders?: Array<TableColumnSortOrders>;
  resizable?: boolean;
  formatter?: (
    row: unknown,
    column: TableColumnCtx<any>,
    cellValue: unknown,
    index: number,
  ) => VNodeChild;
  showOverflowTooltip?: boolean;
  align?: Align;
  headerAlign?: Align;
  className?: string;
  labelClassName?: string;
  selectable?: (row: unknown, index: number) => boolean;
  reserveSelection?: boolean;
  filters?: Array<{ text: string; value: string }>;
  filterPlacement?: TableColumnFilterPlacement;
  filterClassName?: string;
  filterMultiple?: boolean;
  filterMethod?: FilterMethods;
  filteredValue?: Array<unknown>;
  tooltipFormatter?: (data: {
    row: unknown;
    column: unknown;
    cellValue: unknown;
  }) => VNodeChild;
};

export interface TableColumns extends TableColumn {
  hide?: boolean | ((attrs: Record<string, unknown>) => boolean);
  slot?: string;
  headerSlot?: string;
  filterIconSlot?: string;
  expandSlot?: string;
  children?: Array<TableColumns>;
  cellRenderer?: (data: TableColumnRenderer) => VNodeChild;
  headerRenderer?: (data: TableColumnRenderer) => VNodeChild;
}

export type AdaptiveConfig = {
  offsetBottom?: number;
  fixHeader?: boolean;
  timeout?: number;
  zIndex?: number;
};

export type TableProps = {
  data?: Array<unknown>;
  height?: string | number;
  maxHeight?: string | number;
  stripe?: boolean;
  border?: boolean;
  size?: Size;
  fit?: boolean;
  showHeader?: boolean;
  highlightCurrentRow?: boolean;
  currentRowKey?: string | number;
  rowClassName?: ColumnCls<any>;
  rowStyle?: ColumnStyle<any>;
  cellClassName?: CellCls<any>;
  cellStyle?: CellStyle<any>;
  headerRowClassName?: ColumnCls<any>;
  headerRowStyle?: ColumnStyle<any>;
  headerCellClassName?: CellCls<any>;
  headerCellStyle?: CellStyle<any>;
  rowKey?: string | ((row: unknown) => string);
  emptyText?: string;
  defaultExpandAll?: boolean;
  expandRowKeys?: unknown[];
  defaultSort?: Sort;
  tooltipEffect?: Effect;
  tooltipOptions?: Record<string, unknown>;
  appendFilterPanelTo?: string;
  showSummary?: boolean;
  sumText?: string;
  summaryMethod?: SummaryMethod<any>;
  spanMethod?: (data: {
    row: unknown;
    rowIndex: number;
    column: TableColumnCtx<any>;
    columnIndex: number;
  }) =>
    | number[]
    | {
        rowspan: number;
        colspan: number;
      }
    | undefined;
  selectOnIndeterminate?: boolean;
  indent?: number;
  lazy?: boolean;
  load?: (
    row: unknown,
    treeNode: TreeNode,
    resolve: (data: unknown[]) => void,
  ) => void;
  treeProps?: {
    hasChildren?: string;
    children?: string;
  };
  tableLayout?: Layout;
  scrollbarAlwaysOn?: boolean;
  flexible?: boolean;
  scrollbarTabindex?: string | number;
  allowDragLastColumn?: boolean;
  tooltipFormatter?: (data: {
    row: unknown;
    column: unknown;
    cellValue: unknown;
  }) => VNodeChild;
  preserveExpandedContent?: boolean;
};

export interface PureTableProps extends TableProps {
  tableKey?: string | number;
  columns: Array<TableColumns>;
  loading?: boolean;
  loadingConfig?: LoadingConfig;
  alignWhole?: Align;
  headerAlign?: Align | '';
  showOverflowTooltip?: boolean;
  rowHoverBgColor?: string;
  pagination?: PaginationProps;
  adaptive?: boolean;
  adaptiveConfig?: AdaptiveConfig;
  locale?: DefaultLanguage | Language | '';
}

export type PureTableInstallOptions = {
  locale?: DefaultLanguage | Language | null;
  i18n?: I18nLike | null;
  ssr?: boolean;
};
