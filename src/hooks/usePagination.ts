import { reactive, computed } from 'vue';

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  pageSizes?: number[];
}

/**
 * 分页逻辑 Hook
 *
 * @example
 * ```ts
 * const { pagination, setPage, setPageSize, reset } = usePagination();
 *
 * // 获取分页参数
 * const params = { ...pagination };
 *
 * // 翻页
 * setPage(2);
 *
 * // 修改每页条数
 * setPageSize(20);
 *
 * // 重置
 * reset();
 * ```
 */
export function usePagination(options: PaginationOptions = {}) {
  const {
    page = 1,
    pageSize = 10,
    pageSizes = [10, 20, 50, 100],
  } = options;

  const pagination = reactive({
    page,
    pageSize,
    total: 0,
    pageSizes,
  });

  /** 总页数 */
  const totalPages = computed(() =>
    Math.ceil(pagination.total / pagination.pageSize) || 1
  );

  /** 是否有下一页 */
  const hasNextPage = computed(() => pagination.page < totalPages.value);

  /** 是否有上一页 */
  const hasPrevPage = computed(() => pagination.page > 1);

  function setPage(val: number) {
    pagination.page = val;
  }

  function setPageSize(val: number) {
    pagination.pageSize = val;
    pagination.page = 1;
  }

  function setTotal(val: number) {
    pagination.total = val;
  }

  function reset() {
    pagination.page = page;
    pagination.pageSize = pageSize;
    pagination.total = 0;
  }

  function nextPage() {
    if (hasNextPage.value) {
      pagination.page++;
    }
  }

  function prevPage() {
    if (hasPrevPage.value) {
      pagination.page--;
    }
  }

  return {
    pagination,
    totalPages,
    hasNextPage,
    hasPrevPage,
    setPage,
    setPageSize,
    setTotal,
    reset,
    nextPage,
    prevPage,
  };
}
