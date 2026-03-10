<script setup lang="ts">
import {
  Bell,
  RefreshRight,
} from '@element-plus/icons-vue';
import HeaderActionButton from './HeaderActionButton.vue';

defineOptions({
  name: 'HeaderActions',
});

const emit = defineEmits<{
  refresh: [];
  upload: [];
  notice: [];
  settings: [];
}>();
</script>

<template>
  <div class="header-actions">
    <HeaderActionButton
      :icon="RefreshRight"
      label="刷新"
      @click="emit('refresh')"
    />
    <HeaderActionButton
      :icon="Bell"
      label="通知"
      :dot="true"
      @click="emit('notice')"
    />
  </div>
</template>

<style lang="scss" scoped>
.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>

