<script setup lang="ts">
import { useRouter } from 'vue-router';

defineOptions({
  name: 'NotFoundPage',
});

const router = useRouter();

function goHome() {
  router.push('/');
}
</script>

<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面不存在</p>
    <button @click="goHome">返回首页</button>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.not-found h1 {
  font-size: 6rem;
  margin: 0;
  color: #409eff;
}

.not-found p {
  font-size: 1.5rem;
  color: #666;
}

.not-found button {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
}
</style>
