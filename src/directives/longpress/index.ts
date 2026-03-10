import type { Directive, DirectiveBinding } from 'vue';

import { isFunction } from 'lodash-es';
import { useEventListener } from '@vueuse/core';

/**
 * 长按指令
 *
 * 长按元素触发回调函数，支持自定义延迟时间和连续触发
 *
 * @example
 * ```vue
 * <!-- 基础用法：长按 500ms 后触发（默认） -->
 * <button v-longpress="handleLongPress">长按我</button>
 *
 * <!-- 自定义延迟时间：长按 1000ms 后触发 -->
 * <button v-longpress:1000="handleLongPress">长按1秒</button>
 *
 * <!-- 连续触发：长按 500ms 后触发，之后每 100ms 触发一次 -->
 * <button v-longpress:500:100="handleLongPress">长按连续触发</button>
 *
 * <!-- 用于数字加减 -->
 * <button v-longpress:300:50="() => count++">+</button>
 * ```
 */
export const longpress: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<() => void>) {
    const cb = binding.value;
    if (cb && isFunction(cb)) {
      let timer: null | ReturnType<typeof setTimeout> = null;
      let interTimer: null | ReturnType<typeof setInterval> = null;
      let num = 500;
      let interNum: null | number = null;
      const isInter = binding?.arg?.includes(':') ?? false;

      if (isInter) {
        const parts = binding.arg!.split(':');
        num = Number(parts[0]);
        interNum = Number(parts[1]);
      } else if (binding.arg) {
        num = Number(binding.arg);
      }

      const clear = () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        if (interTimer) {
          clearInterval(interTimer);
          interTimer = null;
        }
      };

      const onDownInter = (ev: PointerEvent) => {
        ev.preventDefault();
        if (interTimer === null && interNum !== null) {
          interTimer = setInterval(() => cb(), interNum);
        }
      };

      const onDown = (ev: PointerEvent) => {
        clear();
        ev.preventDefault();
        if (timer === null) {
          timer = isInter
            ? setTimeout(() => {
                cb();
                onDownInter(ev);
              }, num)
            : setTimeout(() => cb(), num);
        }
      };

      // Register using addEventListener on mounted, and removeEventListener automatically on unmounted
      useEventListener(el, 'pointerdown', onDown);
      useEventListener(el, 'pointerup', clear);
      useEventListener(el, 'pointerleave', clear);
    } else {
      throw new Error(
        '[Directive: longpress]: need callback and callback must be a function! Like v-longpress="callback"',
      );
    }
  },
};
