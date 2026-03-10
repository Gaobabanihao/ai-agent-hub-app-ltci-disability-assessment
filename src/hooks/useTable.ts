import { ref, reactive, computed } from 'vue';
import type { Ref } from 'vue';

export interface UseTableOptions<T, P extends Record<string, unknown> = Record<string, unknown>> {
  /** 请求接口函数 */
  api: (params: P & { page: number; pageSize: number }) => Promise<{ list: T[]; total: number }>;
  /** 默认分页参数 */
  defaultParams?: Partial<P>;
  /** 默认页码 */
  defaultPage?: number;
  /** 默认每页条数 */
  defaultPageSize?: number;
  /** 是否立即加载 */
  immediate?: boolean;
  /** 数据转换函数 */
  transform?: (data: T[]) => T[];
}

/**
 * 表格数据管理 Hook
 *
 * 封装表格常用逻辑：加载、分页、搜索、刷新
 *
 * @example
 * ```ts
 * const { data, loading, pagination, search, refresh, reset } = useTable({
 *   api: getUserList,
 *   defaultParams: { status: 1 },
 *   immediate: true,
 * });
 *
 * // 搜索
 * search({ keyword: 'test' });
 *
 * // 刷新当前页
 * refresh();
 *
 * // 重置并刷新
 * reset();
 * ```
 */
export function useTable<T, P extends Record<string, unknown> = Record<string, unknown>>(
  options: UseTableOptions<T, P>
) {
  const {
    api,
    defaultParams = {} as Partial<P>,
    defaultPage = 1,
    defaultPageSize = 10,
    immediate = true,
    transform,
  } = options;

  const data: Ref<T[]> = ref([]);
  const loading = ref(false);
  const pagination = reactive({
    page: defaultPage,
    pageSize: defaultPageSize,
    total: 0,
    pageSizes: [10, 20, 50, 100],
  });

  const searchParams = ref<Partial<P>>({ ...defaultParams });

  /** 总页数 */
  const totalPages = computed(() =>
    Math.ceil(pagination.total / pagination.pageSize) || 1
  );

  /** 加载数据 */
  async function loadData() {
    loading.value = true;
    try {
      const params = {
        ...searchParams.value,
        page: pagination.page,
        pageSize: pagination.pageSize,
      } as P & { page: number; pageSize: number };

      const result = await api(params);
      data.value = transform ? transform(result.list) : result.list;
      pagination.total = result.total;
    } catch (error) {
      console.error('[useTable] loadData error:', error);
      data.value = [];
      pagination.total = 0;
    } finally {
      loading.value = false;
    }
  }

  /** 搜索（重置到第一页） */
  function search(params?: Partial<P>) {
    if (params) {
      searchParams.value = { ...searchParams.value, ...params };
    }
    pagination.page = 1;
    loadData();
  }

  /** 刷新当前页 */
  function refresh() {
    loadData();
  }

  /** 重置搜索条件并刷新 */
  function reset() {
    searchParams.value = { ...defaultParams };
    pagination.page = defaultPage;
    pagination.pageSize = defaultPageSize;
    loadData();
  }

  /** 切换页码 */
  function handlePageChange(page: number) {
    pagination.page = page;
    loadData();
  }

  /** 切换每页条数 */
  function handleSizeChange(size: number) {
    pagination.pageSize = size;
    pagination.page = 1;
    loadData();
  }

  /** 设置搜索参数（不触发请求） */
  function setSearchParams(params: Partial<P>) {
    searchParams.value = { ...searchParams.value, ...params };
  }

  // 立即加载
  if (immediate) {
    loadData();
  }

  return {
    /** 表格数据 */
    data,
    /** 加载状态 */
    loading,
    /** 分页信息 */
    pagination,
    /** 总页数 */
    totalPages,
    /** 搜索参数 */
    searchParams,
    /** 加载数据 */
    loadData,
    /** 搜索（重置到第一页） */
    search,
    /** 刷新当前页 */
    refresh,
    /** 重置并刷新 */
    reset,
    /** 切换页码 */
    handlePageChange,
    /** 切换每页条数 */
    handleSizeChange,
    /** 设置搜索参数 */
    setSearchParams,
  };
}
