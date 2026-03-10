<script setup lang="ts">
import { ref } from 'vue';
import PureTableDemo from './PureTableDemo.vue';
import PureDescriptionsDemo from './PureDescriptionsDemo.vue';

defineOptions({
  name: 'PureAdminDemo',
});

const activeTab = ref<'table' | 'descriptions'>('table');
</script>

<template>
  <div class="pure-admin-demo">
    <div class="demo-header">
      <h1>PureAdmin 组件库示例</h1>
      <p>基于 Element Plus 封装的高级表格和描述列表组件</p>
    </div>

    <el-tabs v-model="activeTab" class="demo-tabs">
      <el-tab-pane label="PureTable 表格" name="table">
        <PureTableDemo />
      </el-tab-pane>
      <el-tab-pane label="PureDescriptions 描述列表" name="descriptions">
        <PureDescriptionsDemo />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped lang="scss">
.pure-admin-demo {
  min-height: 100vh;
  background-color: #f5f7fa;

  .demo-header {
    padding: 40px 20px;
    text-align: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    h1 {
      margin: 0 0 10px;
      font-size: 32px;
      font-weight: 700;
    }

    p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }
  }

  .demo-tabs {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
}
</style>
