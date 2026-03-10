<script setup lang="ts">
import MainFrame from '@/components/MainFrame/index.vue';

defineOptions({
  name: 'HomePage',
});
</script>

<template>
  <MainFrame>
    <div class="home-page">
      <h1>首页</h1>
    </div>
  </MainFrame>
</template>

<style scoped>
.home-page {
  min-height: 100%;
}
</style>
