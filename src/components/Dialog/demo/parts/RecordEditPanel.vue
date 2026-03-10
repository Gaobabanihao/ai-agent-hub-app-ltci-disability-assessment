<script setup lang="ts">
/**
 * 日报编辑面板 — 通过 useDialogInject 读取并展示初始数据
 */
import { computed, ref, watch } from 'vue';
import { useDialogInject } from '@/components/Dialog';

defineOptions({ name: 'RecordEditPanel' });

interface DailyRecord {
  date: string;
  content: string;
  status: '草稿' | '已提交';
}

const ctx = useDialogInject<DailyRecord>();

const content = ref('');

// 弹窗打开时（data 变化）同步初始值
watch(
  () => ctx?.data.value,
  (val) => {
    content.value = val?.content ?? '';
  },
  { immediate: true },
);

const isReadonly = computed(() => ctx?.data.value?.status === '已提交');
</script>

<template>
  <div class="record-edit">
    <ElDescriptions :column="2" size="small" style="margin-bottom: 14px;">
      <ElDescriptionsItem label="日期">{{ ctx?.data.value?.date ?? '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="状态">
        <ElTag :type="ctx?.data.value?.status === '已提交' ? 'success' : 'warning'" size="small">
          {{ ctx?.data.value?.status }}
        </ElTag>
      </ElDescriptionsItem>
    </ElDescriptions>

    <ElInput
      v-model="content"
      type="textarea"
      :rows="5"
      placeholder="请输入今日工作内容"
      :readonly="isReadonly"
    />

    <p
      v-if="isReadonly"
      style="margin: 8px 0 0; font-size: 12px; color: var(--el-color-warning);"
    >
      已提交的日报为只读，不可修改。
    </p>
  </div>
</template>

<style scoped lang="scss">
.record-edit {
  display: flex;
  flex-direction: column;
}
</style>
