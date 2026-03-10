<script setup lang="ts">
import GlobalLoading from '@/components/GlobalLoading/index.vue';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

defineOptions({
  name: 'App',
});

const { visible, text } = useGlobalLoading();
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <router-view />
    <GlobalLoading :visible="visible" :text="text" />
  </ElConfigProvider>
</template>

<style>
#app {
  width: 100%;
  height: 100%;
}
</style>
