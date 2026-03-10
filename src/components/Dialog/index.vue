<script setup lang="ts">
import { FullScreen } from '@element-plus/icons-vue';
import { computed, ref, watch } from 'vue';
import type { DialogEmits, DialogExpose, DialogProps } from './types';

defineOptions({ name: 'AppDialog' });

// ---- Props / Emits ----

const props = withDefaults(defineProps<DialogProps>(), {
  title: '',
  theme: 'default',
  width: '50%',
  fullscreen: false,
  fullscreenButton: true,
  draggable: false,
  loading: false,
  confirmLoading: false,
  confirmDisabled: false,
  confirmText: '确认',
  cancelText: '取消',
  showFooter: true,
  showCancelButton: true,
  showConfirmButton: true,
  closeOnClickModal: false,
  destroyOnClose: true,
});

const emit = defineEmits<DialogEmits>();

// ---- 全屏状态管理 ----

/**
 * 内部全屏状态。
 * 初始值来自 props.fullscreen，使全屏切换按钮可以独立控制，
 * 不必回写父组件 prop（非受控模式）。
 * 弹窗关闭时重置回 props.fullscreen，而非写死 false，
 * 以便下次打开时尊重父组件的受控初始值。
 */
const isFullscreen = ref(props.fullscreen);

function toggleFullscreen(): void {
  isFullscreen.value = !isFullscreen.value;
}

// 弹窗关闭后重置全屏状态
watch(
  () => props.modelValue,
  open => {
    if (!open) isFullscreen.value = props.fullscreen;
  },
);

// 父组件动态修改 fullscreen prop 时同步内部状态（受控场景）
watch(
  () => props.fullscreen,
  val => {
    isFullscreen.value = val;
  },
);

// 全屏时宽度无意义，非全屏时使用 props.width
const dialogWidth = computed(() => (isFullscreen.value ? '100%' : props.width));

const fullscreenTooltip = computed(() => (isFullscreen.value ? '退出全屏' : '全屏'));

// ---- 事件处理 ----

function handleClose(): void {
  emit('update:modelValue', false);
}

function handleConfirm(): void {
  emit('confirm');
}

function handleCancel(): void {
  emit('cancel');
  emit('update:modelValue', false);
}

function handleOpened(): void {
  emit('opened');
}

function handleClosed(): void {
  emit('closed');
}

// ---- expose ----

defineExpose<DialogExpose>({ toggleFullscreen, isFullscreen });
</script>

<template>
  <ElDialog
    :model-value="modelValue"
    :fullscreen="isFullscreen"
    :width="dialogWidth"
    :draggable="draggable"
    :close-on-click-modal="closeOnClickModal"
    :destroy-on-close="destroyOnClose"
    :close-on-press-escape="true"
    :class="['app-dialog', `app-dialog--${theme}`]"
    @close="handleClose"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <!--
      header 分两条路径：
      1. 提供了 #header 插槽 → 完全接管，不渲染默认 header
      2. 未提供 #header 插槽 → 渲染默认 header（标题 + actions 区域），
         其中标题部分可通过 #title 插槽单独替换，
         可在全屏按钮前通过 #extra-actions 插槽插入自定义按钮
    -->
    <template v-if="$slots.header" #header="slotProps">
      <slot name="header" v-bind="slotProps" />
    </template>

    <template v-else #header>
      <div class="app-dialog__header">
        <!-- 标题区 -->
        <slot name="title">
          <span class="app-dialog__title">{{ title }}</span>
        </slot>

        <!-- 右侧操作按钮区：#extra-actions 插槽 + 全屏按钮，均与关闭按钮同款样式 -->
        <div v-if="$slots['extra-actions'] || fullscreenButton" class="app-dialog__actions">
          <slot name="extra-actions" />

          <ElTooltip
            v-if="fullscreenButton"
            :content="fullscreenTooltip"
            placement="top"
            :show-after="400"
          >
            <button
              class="app-dialog__action-btn"
              :class="{ 'is-active': isFullscreen }"
              type="button"
              @click="toggleFullscreen"
            >
              <ElIcon>
                <FullScreen />
              </ElIcon>
            </button>
          </ElTooltip>
        </div>
      </div>
    </template>

    <!--
      内容区：用相对定位容器包裹，使 loading 覆盖层可以精确叠加。
    -->
    <div class="app-dialog__body-wrapper">
      <!-- loading 覆盖层：纯 CSS，不依赖 v-loading directive -->
      <Transition name="app-dialog-fade">
        <div v-if="loading" class="app-dialog__loading-overlay">
          <div class="app-dialog__loading-spinner" />
        </div>
      </Transition>

      <slot />
    </div>

    <!--
      footer 分三条路径：
      showFooter=false → 不渲染 footer 插槽（ElDialog 不显示底部）
      提供了 #footer 插槽 → 完全接管底部
      否则 → 渲染默认 footer（prepend-footer + 按钮 + append-footer）
    -->
    <template v-if="showFooter" #footer>
      <slot v-if="$slots.footer" name="footer" />

      <div v-else class="app-dialog__footer">
        <slot name="prepend-footer" />

        <ElButton v-if="showCancelButton" @click="handleCancel">
          {{ cancelText }}
        </ElButton>

        <ElButton
          v-if="showConfirmButton"
          type="primary"
          :loading="confirmLoading"
          :disabled="confirmDisabled"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </ElButton>

        <slot name="append-footer" />
      </div>
    </template>
  </ElDialog>
</template>

<style scoped lang="scss">
// 相对定位容器，使 loading 覆盖层的 absolute 定位相对于此容器
.app-dialog__body-wrapper {
  position: relative;
  min-height: 0;
}

// loading 覆盖层
.app-dialog__loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255 / 80%);
  margin: -16px;
  border-radius: 0 0 var(--el-border-radius-base) var(--el-border-radius-base);
}

// loading 旋转指示器
.app-dialog__loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--el-border-color-lighter);
  border-top-color: var(--el-color-primary);
  border-radius: 50%;
  animation: app-dialog-spin 0.8s linear infinite;
}

@keyframes app-dialog-spin {
  to {
    transform: rotate(360deg);
  }
}

// loading 淡入淡出
.app-dialog-fade-enter-active,
.app-dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.app-dialog-fade-enter-from,
.app-dialog-fade-leave-to {
  opacity: 0;
}

// header：标题与 actions 水平排列
.app-dialog__header {
  display: flex;
  align-items: center;
  //justify-content: space-between;
  gap: 8px;
  padding-right: 24px;
}

.app-dialog__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

// actions 容器：flex 排列，每个子按钮与关闭按钮样式一致
.app-dialog__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: auto;
}

// footer 布局：按钮右对齐
.app-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}
</style>

<!-- 非 scoped：覆盖 ElDialog 全局样式 -->
<style lang="scss">
.app-dialog {
  padding: 0;
  --dailog__body-radius: 6px;
  border-radius: var(--dailog__body-radius);

  .el-dialog__header {
    --el-dialog-padding-primary: 14px;
    border-radius: var(--dailog__body-radius) var(--dailog__body-radius) 0 0;
    padding: var(--el-dialog-padding-primary);
  }

  .el-dialog__body {
    padding: 0 var(--el-dialog-padding-primary) var(--el-dialog-padding-primary);
  }

  .el-dialog__footer {
    padding: 0 var(--el-dialog-padding-primary) var(--el-dialog-padding-primary);
  }

  // 关闭按钮：从 48×48 缩小到 24×24，与 actions 内的按钮对齐
  .el-dialog__headerbtn {
    top: 16px;
    right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgb(0 0 0 / 6%);
    }

    .el-dialog__close {
      font-size: var(--el-message-close-size, 16px);
      color: var(--el-color-info);
      transition: color 0.2s;
    }

    &:hover .el-dialog__close {
      color: rgb(0 0 0 / 88%);
    }
  }

  // show-close 时 header 只需为关闭按钮留空（我们的 actions 已在 header flex 流中）
  .el-dialog__header.show-close {
    padding-right: 16px;
  }

  // actions 内的操作按钮：与关闭按钮完全一致的尺寸和交互
  .app-dialog__action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    margin: 0;
    background: transparent;
    border: none;
    outline: none;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s, color 0.2s;

    .el-icon {
      font-size: var(--el-message-close-size, 16px);
      color: var(--el-color-info);
      transition: color 0.2s, transform 0.25s ease;
    }

    &:hover,
    &:focus-visible {
      background-color: rgb(0 0 0 / 6%);

      .el-icon {
        color: rgb(0 0 0 / 88%);
      }
    }

    // 激活态（全屏中）：图标旋转 45° 传达"退出"语义
    &.is-active .el-icon {
      color: var(--el-color-primary);
      transform: rotate(45deg);
    }
  }

  // 全屏模式下内容区撑满剩余高度
  &.is-fullscreen {
    .el-dialog__body {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: auto;
    }

    .app-dialog__body-wrapper {
      flex: 1;
    }
  }
}
</style>

<!-- 主题样式：使用独立文件，避免在 SFC 内部 @use 解析失败 -->
<style lang="scss" src="./styles/themes.scss"></style>
