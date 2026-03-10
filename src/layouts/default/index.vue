<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppStore } from '@/store/modules/app';

import LayoutHeader from './components/Header.vue';
import LayoutSidebar from './components/Sidebar.vue';

defineOptions({
  name: 'DefaultLayout',
});

const appStore = useAppStore();
const isCollapsed = ref(false);

/** 缓存的视图列表 */
const cachedViews = computed(() => appStore.cachedViews);

function handleCollapse(collapsed: boolean) {
  isCollapsed.value = collapsed;
}
</script>

<template>
  <el-container class="layout-container">
    <LayoutSidebar :collapsed="isCollapsed" />
    <el-container class="main-container">
      <LayoutHeader :collapsed="isCollapsed" @toggle-collapse="handleCollapse(!isCollapsed)" />
      <el-main class="main-content">
        <router-view v-slot="{ Component, route }">
          <KeepAlive :include="cachedViews">
            <component :is="Component" :key="route.fullPath" />
          </KeepAlive>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.layout-container {
  width: 100%;
  height: 100vh;
}

.main-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow: auto;
  --el-main-padding: 0;
  background-color: #f5f7fa;
}
</style>
