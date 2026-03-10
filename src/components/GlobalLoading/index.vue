<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="global-loading">
        <div class="global-loading__content">
          <el-icon class="global-loading__icon" :size="40">
            <Loading />
          </el-icon>
          <p v-if="text" class="global-loading__text">{{ text }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue';

defineOptions({ name: 'GlobalLoading' });

withDefaults(defineProps<{
  visible: boolean;
  text?: string;
}>(), {
  text: '加载中...',
});
</script>

<style scoped lang="scss">
.global-loading {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255 / 80%);

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  &__icon {
    color: var(--el-color-primary);
    animation: rotate 1s linear infinite;
  }

  &__text {
    margin: 0;
    font-size: 14px;
    color: #606266;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
