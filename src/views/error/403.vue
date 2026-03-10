<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">403</h1>
      <p class="error-message">抱歉，您没有权限访问此页面</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

defineOptions({ name: 'Error403' });

const router = useRouter();

function goHome() {
  router.push('/');
}
</script>

<style scoped lang="scss">
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f7fa;
}

.error-content {
  text-align: center;
}

.error-code {
  margin: 0;
  font-size: 120px;
  font-weight: 700;
  color: #e6a23c;
  line-height: 1;
}

.error-message {
  margin: 20px 0 30px;
  font-size: 18px;
  color: #606266;
}
</style>
