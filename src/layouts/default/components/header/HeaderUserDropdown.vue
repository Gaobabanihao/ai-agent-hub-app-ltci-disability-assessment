<script setup lang="ts">
import { computed } from 'vue';

defineOptions({
  name: 'HeaderUserDropdown',
});

const props = withDefaults(
  defineProps<{
    username: string;
    roleLabel?: string;
    avatar?: string;
  }>(),
  {
    roleLabel: '',
    avatar: '',
  },
);

const emit = defineEmits<{
  profile: [];
  logout: [];
}>();

const avatarText = computed(() => props.username?.trim().charAt(0) || '');

function handleCommand(command: string | number | object) {
  if (command === 'profile') {
    emit('profile');
    return;
  }

  if (command === 'logout') {
    emit('logout');
  }
}
</script>

<template>
  <el-dropdown class="user-dropdown" trigger="click" @command="handleCommand">
    <span class="user-trigger">
      <span class="user-meta">
        <span class="user-role">{{ props.roleLabel }}</span>
        <span class="user-name">{{ props.username }}</span>
      </span>

      <el-avatar :size="30" :src="props.avatar">
        {{ avatarText }}
      </el-avatar>
    </span>

    <!-- <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="profile">个人中心</el-dropdown-item>
        <el-dropdown-item command="logout" divided>
          退出登录
        </el-dropdown-item>
      </el-dropdown-menu>
    </template> -->
  </el-dropdown>
</template>

<style lang="scss" scoped>
.user-dropdown {
  cursor: pointer;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.3;
  min-width: 0;
  max-width: 128px;
}

.user-role {
  color: #97a0ad;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-name {
  color: #313a4a;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 992px) {
  .user-meta {
    max-width: 86px;
  }
}

@media (max-width: 768px) {
  .user-role {
    display: none;
  }

  .user-meta {
    max-width: 72px;
  }
}
</style>
