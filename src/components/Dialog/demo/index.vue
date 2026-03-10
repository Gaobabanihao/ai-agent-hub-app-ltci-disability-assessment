<script setup lang="ts">
import { ref } from 'vue';
import BasicDemo from './BasicDemo.vue';
import SlotDemo from './SlotDemo.vue';
import ComposableDemo from './ComposableDemo.vue';
import AdvancedDemo from './AdvancedDemo.vue';

defineOptions({ name: 'DialogDemo' });

const activeTab = ref<'basic' | 'slot' | 'composable' | 'advanced'>('basic');
</script>

<template>
  <div class="dialog-demo">
    <div class="demo-header">
      <h1>AppDialog 弹窗组件示例</h1>
      <p>基于 Element Plus ElDialog 封装，支持全屏、拖拽、loading、灵活插槽</p>
    </div>

    <div class="demo-body">
      <ElTabs v-model="activeTab">
        <ElTabPane label="基础用法" name="basic">
          <BasicDemo />
        </ElTabPane>
        <ElTabPane label="插槽定制" name="slot">
          <SlotDemo />
        </ElTabPane>
        <ElTabPane label="useDialog" name="composable">
          <ComposableDemo />
        </ElTabPane>
        <ElTabPane label="高级特性" name="advanced">
          <AdvancedDemo />
        </ElTabPane>
      </ElTabs>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dialog-demo {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.demo-header {
  padding: 36px 24px;
  text-align: center;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;

  h1 {
    margin: 0 0 8px;
    font-size: 28px;
    font-weight: 700;
  }

  p {
    margin: 0;
    font-size: 14px;
    opacity: 0.85;
  }
}

.demo-body {
  max-width: 960px;
  margin: 24px auto;
  padding: 0 24px 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgb(0 0 0 / 8%);
}
</style>
