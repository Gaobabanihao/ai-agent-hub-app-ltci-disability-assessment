import type { Directive, DirectiveBinding } from 'vue';

import { hasPerms } from '@/utils/auth';

/**
 * 按钮权限指令
 *
 * 根据用户权限标识判断元素是否显示，无权限则移除元素
 * 与 v-auth 的区别：v-auth 用于角色/路由级别权限，v-perms 用于按钮/操作级别权限
 *
 * @example
 * ```vue
 * <!-- 单个权限 -->
 * <button v-perms="'user:add'">添加用户</button>
 *
 * <!-- 多个权限（满足其一即可） -->
 * <button v-perms="['user:add', 'user:edit']">操作按钮</button>
 *
 * <!-- 在表格操作列中使用 -->
 * <el-button v-perms="'user:delete'" type="danger">删除</el-button>
 * ```
 */
export const perms: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<Array<string> | string>) {
    const { value } = binding;
    if (value) {
      !hasPerms(value) && el.remove();
    } else {
      throw new Error(
        "[Directive: perms]: need perms! Like v-perms=\"['btn.add','btn.edit']\"",
      );
    }
  },
};
