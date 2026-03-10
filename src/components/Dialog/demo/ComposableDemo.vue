<script setup lang="ts">
/**
 * useDialog Composable Demo
 * 演示：useDialog<T>() 在父组件中管理状态 + useDialogInject<T>() 在子组件中读取数据
 */
import { ref } from 'vue';
import { AppDialog, useDialog } from '@/components/Dialog';
import UserDetailPanel from './parts/UserDetailPanel.vue';
import RecordEditPanel from './parts/RecordEditPanel.vue';

defineOptions({ name: 'DialogComposableDemo' });

// ---- 1. 基础：useDialog 打开携带数据 ----
interface UserInfo {
  id: number;
  name: string;
  department: string;
  role: string;
}

const userDialog = useDialog<UserInfo>();

const users: UserInfo[] = [
  { id: 1, name: '张三', department: '技术部', role: '前端工程师' },
  { id: 2, name: '李四', department: '产品部', role: '产品经理' },
  { id: 3, name: '王五', department: '设计部', role: 'UI 设计师' },
];

// ---- 2. 携带数据 + 确认回调 ----
interface DailyRecord {
  date: string;
  content: string;
  status: '草稿' | '已提交';
}

const recordDialog = useDialog<DailyRecord>();
const saveLoading = ref(false);

async function handleSaveRecord() {
  saveLoading.value = true;
  await new Promise((r) => setTimeout(r, 1200));
  saveLoading.value = false;
  ElMessage.success('保存成功');
  recordDialog.close();
}
</script>

<template>
  <div class="demo-section">
    <!-- ---- 1. useDialog 打开携带数据 ---- -->
    <h3 class="section-title">useDialog&lt;T&gt;() 传入数据</h3>
    <p class="section-desc">
      通过 <code>useDialog&lt;T&gt;()</code> 管理弹窗状态，调用 <code>open(data)</code>
      打开并传入业务数据。弹窗内子组件通过 <code>useDialogInject&lt;T&gt;()</code> 读取。
    </p>
    <div class="user-list">
      <div v-for="user in users" :key="user.id" class="user-item">
        <ElAvatar :size="36" style="background: var(--el-color-primary);">
          {{ user.name[0] }}
        </ElAvatar>
        <div class="user-info">
          <span class="user-name">{{ user.name }}</span>
          <span class="user-meta">{{ user.department }} · {{ user.role }}</span>
        </div>
        <ElButton size="small" @click="userDialog.open(user)">查看详情</ElButton>
      </div>
    </div>

    <!-- 用户详情弹窗：子组件通过 inject 读取 data -->
    <AppDialog
      v-model="userDialog.visible.value"
      title="用户详情"
      width="460px"
      :show-confirm-button="false"
      cancel-text="关闭"
      @cancel="userDialog.close()"
    >
      <UserDetailPanel />
    </AppDialog>

    <ElDivider />

    <!-- ---- 2. 携带数据 + 确认回调 ---- -->
    <h3 class="section-title">open(data) + 确认保存</h3>
    <p class="section-desc">
      打开弹窗时传入初始数据，弹窗内子组件通过 inject 读取并编辑，
      父组件在 <code>@confirm</code> 中执行异步保存逻辑。
    </p>
    <div class="record-list">
      <ElButton
        type="primary"
        @click="recordDialog.open({ date: '2026-03-04', content: '完成了首页改版需求评审', status: '草稿' })"
      >
        编辑日报（草稿）
      </ElButton>
      <ElButton
        @click="recordDialog.open({ date: '2026-03-03', content: '修复了登录页面的 Bug', status: '已提交' })"
      >
        查看日报（已提交）
      </ElButton>
    </div>

    <AppDialog
      v-model="recordDialog.visible.value"
      title="编辑日报"
      width="520px"
      :confirm-loading="saveLoading"
      @confirm="handleSaveRecord"
      @cancel="recordDialog.close()"
    >
      <RecordEditPanel />
    </AppDialog>
  </div>
</template>

<style scoped lang="scss">
.demo-section {
  padding: 16px 0;
}

.section-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.section-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;

  code {
    padding: 1px 5px;
    background: var(--el-fill-color);
    border-radius: 3px;
    font-family: monospace;
    font-size: 12px;
    color: var(--el-color-primary);
  }
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 4px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.user-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.record-list {
  display: flex;
  gap: 10px;
}
</style>
