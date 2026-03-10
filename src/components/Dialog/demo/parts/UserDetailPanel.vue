<script setup lang="ts">
/**
 * 用户详情面板 — 通过 useDialogInject 读取父组件传入的 UserInfo 数据
 */
import { useDialogInject } from '@/components/Dialog';

defineOptions({ name: 'UserDetailPanel' });

interface UserInfo {
  id: number;
  name: string;
  department: string;
  role: string;
}

const ctx = useDialogInject<UserInfo>();
const user = ctx?.data;
</script>

<template>
  <div v-if="user" class="user-detail">
    <div class="user-avatar">
      <ElAvatar :size="64" style="background: var(--el-color-primary); font-size: 24px;">
        {{ user.name[0] }}
      </ElAvatar>
      <div class="user-name">{{ user.name }}</div>
    </div>
    <ElDescriptions :column="1" border>
      <ElDescriptionsItem label="员工编号">EMP-{{ String(user.id).padStart(4, '0') }}</ElDescriptionsItem>
      <ElDescriptionsItem label="所属部门">{{ user.department }}</ElDescriptionsItem>
      <ElDescriptionsItem label="岗位职责">{{ user.role }}</ElDescriptionsItem>
    </ElDescriptions>
  </div>
  <ElEmpty v-else description="暂无数据" />
</template>

<style scoped lang="scss">
.user-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
</style>
