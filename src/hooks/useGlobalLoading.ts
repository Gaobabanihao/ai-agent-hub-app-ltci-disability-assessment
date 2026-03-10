import { ref } from 'vue';

const visible = ref(false);
const text = ref('加载中...');

/**
 * 全局 Loading Hook
 *
 * 控制全局加载状态，需配合 GlobalLoading 组件使用
 *
 * @example
 * ```ts
 * const { show, hide, isVisible } = useGlobalLoading();
 *
 * // 显示 loading
 * show('正在加载...');
 *
 * // 隐藏 loading
 * hide();
 *
 * // 包装异步操作
 * await withLoading(async () => {
 *   await fetchData();
 * }, '正在获取数据...');
 * ```
 */
export function useGlobalLoading() {
  /** 显示 loading */
  function show(message?: string) {
    if (message) {
      text.value = message;
    }
    visible.value = true;
  }

  /** 隐藏 loading */
  function hide() {
    visible.value = false;
    text.value = '加载中...';
  }

  /** 包装异步操作 */
  async function withLoading<T>(fn: () => Promise<T>, message?: string): Promise<T> {
    show(message);
    try {
      return await fn();
    } finally {
      hide();
    }
  }

  return {
    /** loading 是否可见 */
    visible,
    /** loading 文本 */
    text,
    /** 显示 loading */
    show,
    /** 隐藏 loading */
    hide,
    /** 包装异步操作 */
    withLoading,
  };
}
