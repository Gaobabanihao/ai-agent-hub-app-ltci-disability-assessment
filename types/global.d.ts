/** 全局类型定义 */

/** 通用记录类型 */
type Recordable<T = string> = Record<string, T>;

/** Vite 环境变量类型 */
interface ViteEnv {
  VITE_PORT: number;
  VITE_PUBLIC_PATH: string;
  VITE_ROUTER_HISTORY: string;
  VITE_HIDE_HOME: string;
  VITE_COMPRESSION: ViteCompression;
  VITE_ENABLE_PROD_MOCK: boolean;
  [key: string]: unknown;
}

/**
 * 打包压缩格式的类型声明
 */
type ViteCompression =
  | 'both'
  | 'both-clear'
  | 'brotli'
  | 'brotli-clear'
  | 'gzip'
  | 'gzip-clear'
  | 'none';

/** 分页参数 */
interface PaginationParams {
  page: number;
  pageSize: number;
}

/** 分页响应 */
interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** 通用选项 */
interface OptionItem<T = string | number> {
  label: string;
  value: T;
  disabled?: boolean;
  children?: OptionItem<T>[];
}

/** 树形结构 */
interface TreeNode<T = unknown> {
  id: string | number;
  label: string;
  children?: TreeNode<T>[];
  data?: T;
}

/** 表格列配置 */
interface TableColumn {
  prop: string;
  label: string;
  width?: number | string;
  minWidth?: number | string;
  fixed?: boolean | 'left' | 'right';
  sortable?: boolean | 'custom';
  align?: 'left' | 'center' | 'right';
  formatter?: (row: unknown, column: TableColumn, cellValue: unknown, index: number) => unknown;
}

/** 路由 Meta 类型 */
interface RouteMeta {
  title?: string;
  icon?: string;
  requiresAuth?: boolean;
  permissions?: string[];
  roles?: string[];
  keepAlive?: boolean;
  hidden?: boolean;
  order?: number;
}

