import type { InjectionKey, Ref } from 'vue';

/** Dialog 主题类型 */
export type DialogTheme = 'default' | 'mist' | 'mist-center';

/** Dialog 组件 Props */
export interface DialogProps {
  /** v-model 控制弹窗显隐 */
  modelValue: boolean;
  /** 弹窗标题（使用 #title 插槽时此 prop 失效） */
  title?: string;
  /** 主题风格，默认 'default' */
  theme?: DialogTheme;
  /** 弹窗宽度，默认 '50%' */
  width?: string | number;
  /**
   * 是否全屏（受控初始值）。
   * 不传时默认 false，可由内部全屏按钮自由切换。
   * 关闭弹窗后内部状态重置回此值。
   */
  fullscreen?: boolean;
  /** 是否显示全屏切换按钮，默认 true */
  fullscreenButton?: boolean;
  /** 是否开启拖拽（ElDialog 原生），默认 false */
  draggable?: boolean;
  /** 内容区 loading 覆盖层，默认 false */
  loading?: boolean;
  /** 确认按钮 loading 状态，默认 false */
  confirmLoading?: boolean;
  /** 确认按钮是否禁用，默认 false */
  confirmDisabled?: boolean;
  /** 确认按钮文字，默认 '确认' */
  confirmText?: string;
  /** 取消按钮文字，默认 '取消' */
  cancelText?: string;
  /** 是否显示底部操作区，默认 true */
  showFooter?: boolean;
  /** 是否显示取消按钮，默认 true */
  showCancelButton?: boolean;
  /** 是否显示确认按钮，默认 true */
  showConfirmButton?: boolean;
  /** 点击遮罩是否关闭弹窗，默认 false */
  closeOnClickModal?: boolean;
  /** 关闭时是否销毁内部内容，默认 true */
  destroyOnClose?: boolean;
}

/** Dialog 组件 Emits */
export interface DialogEmits {
  (e: 'update:modelValue', val: boolean): void;

  /** 点击确认按钮 */
  (e: 'confirm'): void;

  /** 点击取消按钮 */
  (e: 'cancel'): void;

  /** 弹窗完全打开（过渡动画结束） */
  (e: 'opened'): void;

  /** 弹窗完全关闭（过渡动画结束） */
  (e: 'closed'): void;
}

/** Dialog expose 暴露的实例方法/属性 */
export interface DialogExpose {
  toggleFullscreen: () => void;
  isFullscreen: Ref<boolean>;
}

/**
 * useDialog composable 返回的上下文。
 * 通过 provide/inject 在父组件和弹窗内部子组件之间共享。
 */
export interface DialogContext<T = unknown> {
  /** 弹窗显隐状态（直接绑定到 v-model） */
  visible: Ref<boolean>;
  /** 打开弹窗，可同时传入业务数据 */
  open: (data?: T) => void;
  /** 关闭弹窗 */
  close: () => void;
  /** 业务数据（调用 open 时传入的参数） */
  data: Ref<T | undefined>;
}

/** provide/inject 注入 key */
export const DIALOG_CONTEXT_KEY: InjectionKey<DialogContext> = Symbol('DialogContext');
