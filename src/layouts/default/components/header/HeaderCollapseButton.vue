<script setup lang="ts">
import { Expand, Fold } from '@element-plus/icons-vue';

defineOptions({
  name: 'HeaderCollapseButton',
});

const props = defineProps<{
  collapsed: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();

function handleToggle() {
  emit('toggle');
}
</script>

<template>
  <button class="collapse-btn" type="button" @click="handleToggle">
    <el-icon :size="16">
      <Fold v-if="!props.collapsed" />
      <Expand v-else />
    </el-icon>
  </button>
</template>

<style lang="scss" scoped>
.collapse-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #5f6b7a;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: #ecf2ff;
    color: #3f74cf;
  }
}
</style>

