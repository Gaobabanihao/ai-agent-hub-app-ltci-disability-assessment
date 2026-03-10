<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue';
import type { MenuItem } from './types';

defineOptions({ name: 'AppContextMenu' });

const props = defineProps<{
  visible: boolean;
  /** 鼠标 clientX */
  x: number;
  /** 鼠标 clientY */
  y: number;
  items: MenuItem[];
}>();

const emit = defineEmits<{
  close: [];
}>();

// ---- 位置计算 ----

const menuRef = ref<HTMLElement>();
const menuX = ref(0);
const menuY = ref(0);

/**
 * 边界检测：将菜单限制在可视区域内。
 * 若右侧空间不足则向左翻转，若下方空间不足则向上翻转。
 */
function adjustPosition(): void {
  const el = menuRef.value;
  if (!el) return;

  const GAP = 6;
  const { offsetWidth: w, offsetHeight: h } = el;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // 默认从光标右下方展开
  let left = props.x;
  let top = props.y;

  // 右侧溢出 → 向左翻转
  if (left + w + GAP > vw) left = props.x - w;
  // 下方溢出 → 向上翻转
  if (top + h + GAP > vh) top = props.y - h;

  // 最终钳位，确保不超出视口
  menuX.value = Math.max(GAP, Math.min(left, vw - w - GAP));
  menuY.value = Math.max(GAP, Math.min(top, vh - h - GAP));
}

watch(
  () => props.visible,
  async (val) => {
    if (val) {
      // 先设置初始位置，等 DOM 渲染后再精确调整
      menuX.value = props.x;
      menuY.value = props.y;
      await nextTick();
      adjustPosition();
      addListeners();
    } else {
      removeListeners();
    }
  },
);

// ---- 关闭逻辑 ----

function handleItemClick(item: MenuItem): void {
  if (item.disabled) return;
  item.onClick?.();
  emit('close');
}

function onDocumentMousedown(e: MouseEvent): void {
  if (!menuRef.value?.contains(e.target as Node)) {
    emit('close');
  }
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') emit('close');
}

function onScroll(): void {
  emit('close');
}

function addListeners(): void {
  // capture=true：在事件捕获阶段拦截，确保菜单外点击能被捕获
  document.addEventListener('mousedown', onDocumentMousedown, true);
  document.addEventListener('keydown', onKeydown);
  window.addEventListener('scroll', onScroll, true);
}

function removeListeners(): void {
  document.removeEventListener('mousedown', onDocumentMousedown, true);
  document.removeEventListener('keydown', onKeydown);
  window.removeEventListener('scroll', onScroll, true);
}

onUnmounted(removeListeners);
</script>

<template>
  <Teleport to="body">
    <Transition name="ctx-menu">
      <div
        v-if="visible"
        ref="menuRef"
        class="app-context-menu"
        :style="{ left: menuX + 'px', top: menuY + 'px' }"
        @contextmenu.prevent
      >
        <template v-for="item in items" :key="item.key">
          <div v-if="item.divided" class="app-context-menu__divider" />
          <div
            class="app-context-menu__item"
            :class="{ 'is-disabled': item.disabled }"
            @click="handleItemClick(item)"
          >
            <ElIcon v-if="item.icon" class="app-context-menu__item-icon">
              <component :is="item.icon" />
            </ElIcon>
            <span class="app-context-menu__item-label">{{ item.label }}</span>
          </div>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss">
.app-context-menu {
  position: fixed;
  z-index: 9000;
  min-width: 160px;
  padding: 4px 0;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--el-border-radius-base);
  box-shadow: var(--el-box-shadow-light);
  outline: none;
  user-select: none;

  &__divider {
    height: 1px;
    margin: 4px 0;
    background-color: var(--el-border-color-lighter);
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 16px;
    font-size: 13px;
    line-height: 1;
    color: var(--el-text-color-regular);
    cursor: pointer;
    transition:
      background-color 0.12s,
      color 0.12s;

    &:hover:not(.is-disabled) {
      background-color: var(--el-fill-color-light);
      color: var(--el-text-color-primary);
    }

    &.is-disabled {
      color: var(--el-text-color-disabled);
      cursor: not-allowed;

      .app-context-menu__item-icon {
        opacity: 0.5;
      }
    }
  }

  &__item-icon {
    font-size: 14px;
    flex-shrink: 0;
    color: inherit;
  }

  &__item-label {
    flex: 1;
  }
}

// 进入：从光标位置轻微向下淡入；退出：直接淡出（快速感知更好）
.ctx-menu-enter-active {
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}

.ctx-menu-leave-active {
  transition: opacity 0.08s ease;
}

.ctx-menu-enter-from {
  opacity: 0;
  transform: translateY(-6px) scale(0.96);
}

.ctx-menu-leave-to {
  opacity: 0;
}
</style>
