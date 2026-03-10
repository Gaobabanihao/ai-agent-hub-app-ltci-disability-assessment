<script setup lang="ts">
defineOptions({
  name: 'MainFrame',
});
</script>

<template>
  <div class="main-frame">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.main-frame {
  min-height: 100%;
  box-sizing: border-box;
  padding: 12px;
}
</style>
