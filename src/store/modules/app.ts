import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false);
  const loading = ref(false);

  /** 缓存的视图名称列表（用于 KeepAlive） */
  const cachedViews = ref<string[]>([]);

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function setLoading(value: boolean) {
    loading.value = value;
  }

  /** 添加缓存视图 */
  function addCachedView(name: string) {
    if (!cachedViews.value.includes(name)) {
      cachedViews.value.push(name);
    }
  }

  /** 移除缓存视图 */
  function removeCachedView(name: string) {
    const index = cachedViews.value.indexOf(name);
    if (index > -1) {
      cachedViews.value.splice(index, 1);
    }
  }

  /** 清空缓存视图 */
  function clearCachedViews() {
    cachedViews.value = [];
  }

  return {
    sidebarCollapsed,
    loading,
    cachedViews,
    toggleSidebar,
    setLoading,
    addCachedView,
    removeCachedView,
    clearCachedViews,
  };
});
