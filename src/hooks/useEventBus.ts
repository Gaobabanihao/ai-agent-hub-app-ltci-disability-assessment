import type { EventType, Handler } from 'mitt';

import mitt from 'mitt';
import { onUnmounted } from 'vue';

type Events = Record<EventType, unknown>;

const emitter = mitt<Events>();

/**
 * 事件总线 Hook
 *
 * 基于 mitt 实现的事件总线，支持组件间通信
 * 组件卸载时自动清理该组件注册的所有事件监听
 *
 * @example
 * ```ts
 * // 组件 A：发送事件
 * const { emit } = useEventBus();
 * emit('user:login', { userId: 1, username: 'admin' });
 *
 * // 组件 B：监听事件
 * const { on } = useEventBus();
 * on('user:login', (data) => {
 *   console.log('用户登录:', data);
 * });
 *
 * // 取消监听
 * const { on, off } = useEventBus();
 * const handler = (data) => console.log(data);
 * on('event', handler);
 * off('event', handler);
 *
 * // 手动清除当前组件的所有监听
 * const { clear } = useEventBus();
 * clear();
 * ```
 *
 * @example
 * ```ts
 * // 全局使用（不自动清理，需手动管理）
 * import { emitter } from '@/hooks/useEventBus';
 * emitter.emit('global:event', payload);
 * emitter.on('global:event', handler);
 * emitter.off('global:event', handler);
 * ```
 */
export function useEventBus() {
  const handlers: Array<{ type: EventType; handler: Handler<unknown> }> = [];

  function on<T = unknown>(type: EventType, handler: Handler<T>) {
    emitter.on(type, handler as Handler<unknown>);
    handlers.push({ type, handler: handler as Handler<unknown> });
  }

  function off<T = unknown>(type: EventType, handler?: Handler<T>) {
    emitter.off(type, handler as Handler<unknown>);
  }

  function emit<T = unknown>(type: EventType, event?: T) {
    emitter.emit(type, event);
  }

  function clear() {
    handlers.forEach(({ type, handler }) => {
      emitter.off(type, handler);
    });
    handlers.length = 0;
  }

  onUnmounted(() => {
    clear();
  });

  return {
    on,
    off,
    emit,
    clear,
  };
}

export { emitter };
