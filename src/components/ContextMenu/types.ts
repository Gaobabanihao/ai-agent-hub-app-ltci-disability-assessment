import type { Component } from 'vue';

export interface MenuItem {
  /** 唯一标识 */
  key: string;
  /** 菜单项文字 */
  label: string;
  /** 图标组件（El+ icons 或任意 Vue 组件） */
  icon?: Component;
  /** 是否禁用 */
  disabled?: boolean;
  /** 在此项之前插入分割线 */
  divided?: boolean;
  /** 点击回调（菜单会在回调执行后自动关闭） */
  onClick?: () => void;
}
