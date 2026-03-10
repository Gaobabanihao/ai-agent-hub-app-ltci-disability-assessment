import { nextTick, ref } from 'vue';
import type { Ref } from 'vue';

export interface ContextMenuState<T = unknown> {
  visible: Ref<boolean>;
  x: Ref<number>;
  y: Ref<number>;
  /** 当前右键行数据，用于在 items 里做动态渲染 */
  row: Ref<T | undefined>;
  /**
   * 直接绑定到 ElTable 的 @row-contextmenu 事件：
   *   <PureTable @row-contextmenu="ctxMenu.show" />
   */
  show: (row: T, _column: unknown, event: MouseEvent) => void;
  close: () => void;
}

export function useContextMenu<T = unknown>(): ContextMenuState<T> {
  const visible = ref(false);
  const x = ref(0);
  const y = ref(0);
  const row = ref<T | undefined>(undefined) as Ref<T | undefined>;

  function show(r: T, _column: unknown, event: MouseEvent): void {
    event.preventDefault();

    // 若菜单已打开（右键了另一行），先关闭再在下一帧重新定位，避免位置残留
    if (visible.value) {
      visible.value = false;
      nextTick(() => {
        row.value = r;
        x.value = event.clientX;
        y.value = event.clientY;
        visible.value = true;
      });
    } else {
      row.value = r;
      x.value = event.clientX;
      y.value = event.clientY;
      visible.value = true;
    }
  }

  function close(): void {
    visible.value = false;
  }

  return { visible, x, y, row, show, close };
}
