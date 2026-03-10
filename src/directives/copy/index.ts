import type { Directive, DirectiveBinding } from 'vue';

import { useEventListener } from '@vueuse/core';

export interface CopyEl extends HTMLElement {
  copyValue: string;
}

/**
 * 文本复制指令（默认双击复制）
 *
 * @example
 * ```vue
 * <!-- 双击复制（默认） -->
 * <span v-copy="text">双击复制我</span>
 *
 * <!-- 单击复制 -->
 * <span v-copy:click="text">点击复制我</span>
 * ```
 */
export const copy: Directive = {
  mounted(el: CopyEl, binding: DirectiveBinding<string>) {
    const { value } = binding;
    if (value) {
      el.copyValue = value;
      const arg = binding.arg ?? 'dblclick';

      useEventListener(el, arg, async () => {
        try {
          await navigator.clipboard.writeText(el.copyValue);
          ElMessage.success('复制成功');
        } catch {
          // 降级方案
          const textarea = document.createElement('textarea');
          textarea.value = el.copyValue;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          const success = document.execCommand('copy');
          document.body.removeChild(textarea);

          if (success) {
            ElMessage.success('复制成功');
          } else {
            ElMessage.error('复制失败');
          }
        }
      });
    } else {
      throw new Error(
        '[Directive: copy]: need value! Like v-copy="modelValue"',
      );
    }
  },
  updated(el: CopyEl, binding: DirectiveBinding<string>) {
    el.copyValue = binding.value;
  },
};
