<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { APP_CONFIG } from '@/config/app';
import { useUserStore } from '@/store';

import HeaderActions from './header/HeaderActions.vue';
import HeaderCollapseButton from './header/HeaderCollapseButton.vue';
import HeaderTitle from './header/HeaderTitle.vue';
import HeaderUserDropdown from './header/HeaderUserDropdown.vue';

defineOptions({
  name: 'LayoutHeader',
});

const props = defineProps<{
  collapsed: boolean;
}>();

const emit = defineEmits<{
  toggleCollapse: [];
}>();

const route = useRoute();
const userStore = useUserStore();

interface HeaderBreadcrumbItem {
  key: string;
  title: string;
}

const headerBreadcrumbs = computed<HeaderBreadcrumbItem[]>(() => {
  const items = route.matched
    .filter((record) => Boolean(record.meta?.title))
    .map((record) => ({
      key: String(record.name || record.path),
      title: String(record.meta?.title),
    }))
    .filter((item, index, list) => index === 0 || item.title !== list[index - 1]?.title);

  if (items.length) {
    return items;
  }

  const currentTitle = route.meta?.title as string | undefined;
  if (currentTitle) {
    return [{ key: String(route.name || route.path), title: currentTitle }];
  }

  return [{ key: 'app-title', title: APP_CONFIG.title }];
});

const username = computed(
  () => userStore.userInfo?.nickname || userStore.userInfo?.username || '张继国',
);
const roleLabel = '高级测试工程师';
const avatar = computed(() => userStore.userInfo?.avatar || '');

function handleToggle() {
  emit('toggleCollapse');
}

function handleAction(name: string) {
  ElMessage.info(`${ name }功能开发中`);
}

function handleProfile() {
  ElMessage.info('个人中心功能开发中');
}

function handleLogout() {
  userStore.logout();
  ElMessage.success('已退出登录');
}
</script>

<template>
  <el-header class="layout-header">
    <div class="header-left">
      <HeaderCollapseButton :collapsed="props.collapsed" @toggle="handleToggle" />
      <HeaderTitle :items="headerBreadcrumbs" />
    </div>

    <div class="header-right">
      <HeaderActions
        @refresh="handleAction('刷新')"
        @notice="handleAction('通知')"
      />

      <span class="header-divider" />

      <HeaderUserDropdown
        :username="username"
        :avatar="avatar"
        :role-label="roleLabel"
        @profile="handleProfile"
        @logout="handleLogout"
      />
    </div>
  </el-header>
</template>

<style lang="scss" scoped>
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 50px;
  padding: 0 16px 0 8px;
  background-color: #f7f8fa;
  border-bottom: 1px solid #dde1e8;
}

.header-left {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 10px;
  min-width: 0;
  overflow: hidden;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  min-width: 0;
}

.header-divider {
  width: 1.5px;
  height: 30px;
  background-color: #d9dde5;
}

@media (max-width: 992px) {
  .layout-header {
    padding: 0 12px;
  }

  .header-divider {
    display: none;
  }
}
</style>
