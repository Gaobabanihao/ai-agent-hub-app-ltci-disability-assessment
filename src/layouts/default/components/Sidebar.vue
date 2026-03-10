<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { APP_CONFIG } from '@/config/app';
import { mainRoutes } from '@/router/modules';

defineOptions({
  name: 'LayoutSidebar',
});

const props = defineProps<{
  collapsed: boolean;
}>();

const route = useRoute();
const router = useRouter();

const activeMenu = computed(() => route.path);
const logoShortTitle = computed(() => APP_CONFIG.shortTitle);

interface SidebarMenuItem {
  path: string;
  title: string;
  icon: string;
  order: number;
}

const menuList = computed<SidebarMenuItem[]>(() => {
  const rootRoute = mainRoutes.find((item) => item.path === '/');
  const children = (rootRoute?.children || []) as RouteRecordRaw[];

  return children
    .filter((item) => !item.meta?.hidden && Boolean(item.meta?.title))
    .map((item) => ({
      path: resolveMenuPath(item.path),
      title: item.meta?.title as string,
      icon: (item.meta?.icon as string) || 'Menu',
      order: Number(item.meta?.order || 999),
    }))
    .sort((a, b) => a.order - b.order);
});

function resolveMenuPath(path: string) {
  return path.startsWith('/') ? path : `/${ path }`;
}

function handleMenuSelect(path: string) {
  if (path !== route.path) {
    router.push(path);
  }
}
</script>

<template>
  <el-aside :width="props.collapsed ? '64px' : '220px'" class="layout-sidebar">
    <div class="logo">
      <span v-if="!props.collapsed" class="logo-text">{{ APP_CONFIG.title }}</span>
      <span v-else class="logo-icon">{{ logoShortTitle }}</span>
    </div>

    <el-menu
      :default-active="activeMenu"
      :collapse="props.collapsed"
      :collapse-transition="false"
      class="sidebar-menu"
      @select="handleMenuSelect"
    >
      <el-menu-item v-for="item in menuList" :key="item.path" :index="item.path">
        <el-icon>
          <component :is="item.icon" />
        </el-icon>
        <template #title>{{ item.title }}</template>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<style lang="scss" scoped>
.layout-sidebar {
  height: 100vh;
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 14px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  background-color: #263445;
}

.logo-text {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.logo-icon {
  width: 100%;
  text-align: center;
  font-size: 16px;
}

.sidebar-menu {
  border-right: none;
  background-color: transparent;
  --el-menu-item-height: 40px;
  --el-menu-base-level-padding: 12px;
  --el-menu-level-padding: 12px;
  padding: 2px 4px 6px;

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    color: #bfcbd9;
    height: var(--el-menu-item-height);
    line-height: var(--el-menu-item-height);
    margin: 1px 4px;
    border-radius: 6px;

    &:hover {
      background-color: #2c3d52;
    }

    &.is-active {
      color: #409eff;
      background-color: #1f2f43;
    }
  }

  :deep(.el-menu-item .el-icon),
  :deep(.el-sub-menu__title .el-icon) {
    margin-right: 6px;
  }

  &.el-menu--collapse :deep(.el-menu-item),
  &.el-menu--collapse :deep(.el-sub-menu__title) {
    width: 48px;
    min-width: 48px;
  }

  &.el-menu--collapse :deep(.el-menu-item .el-icon),
  &.el-menu--collapse :deep(.el-sub-menu__title .el-icon) {
    margin-right: 0;
  }
}
</style>
