<script setup lang="ts">
import type { Component } from 'vue';

defineOptions({
  name: 'HeaderActionButton',
});

const props = withDefaults(
  defineProps<{
    icon: Component;
    label: string;
    dot?: boolean;
  }>(),
  {
    dot: false,
  },
);

const emit = defineEmits<{
  click: [];
}>();

function handleClick() {
  emit('click');
}
</script>

<template>
  <el-tooltip :content="props.label" placement="bottom">
    <button class="action-btn" type="button" @click="handleClick">
      <el-badge :is-dot="props.dot">
        <el-icon :size="15">
          <component :is="props.icon" />
        </el-icon>
      </el-badge>
    </button>
  </el-tooltip>
</template>

<style lang="scss" scoped>
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #7d8795;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: #edf1f7;
    color: #3f74cf;
  }
}
</style>

