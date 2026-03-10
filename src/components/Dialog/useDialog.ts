import { inject, provide, ref } from 'vue';
import type { Ref } from 'vue';
import { DIALOG_CONTEXT_KEY } from './types';
import type { DialogContext } from './types';

/**
 * useDialog — 弹窗状态管理 composable
 *
 * 职责：
 *   1. 管理弹窗显隐（v-model 的 visible 状态）
 *   2. 在父组件和弹窗内部子组件之间共享业务数据
 *   3. 通过 provide 建立通信通道，子组件用 useDialogInject 消费
 *
 * 基础用法：
 * ```ts
 * // 父组件
 * const dialog = useDialog<DailyRecord>();
 * dialog.open(row);          // 打开弹窗并传入数据
 * dialog.close();            // 关闭弹窗
 *
 * // 模板：<AppDialog v-model="dialog.visible.value" />
 * ```
 *
 * 弹窗内子组件读取数据：
 * ```ts
 * const ctx = useDialogInject<DailyRecord>();
 * const record = ctx?.data; // Ref<DailyRecord | undefined>
 * ```
 */
export function useDialog<T = unknown>(): DialogContext<T> {
  const visible: Ref<boolean> = ref(false);
  // shallowRef 避免深层响应式对泛型 T 类型推断的干扰
  const data = ref<T | undefined>(undefined) as Ref<T | undefined>;

  function open(payload?: T): void {
    data.value = payload;
    visible.value = true;
  }

  // 关闭时不清空 data，避免关闭动画期间数据消失导致内容闪烁
  function close(): void {
    visible.value = false;
  }

  const context: DialogContext<T> = { visible, open, close, data };

  // 向子孙组件 provide 上下文，必须在 setup() 同步阶段调用
  provide(DIALOG_CONTEXT_KEY, context as DialogContext<unknown>);

  return context;
}

/**
 * useDialogInject — 在弹窗内部子组件中注入父组件的弹窗上下文
 *
 * 返回 undefined 表示组件不在 useDialog 管理的弹窗树内，
 * 调用方应做降级处理。
 */
export function useDialogInject<T = unknown>(): DialogContext<T> | undefined {
  // inject 单参数重载：未找到时返回 undefined（不传默认值）
  return inject<DialogContext<T>>(DIALOG_CONTEXT_KEY as symbol);
}
