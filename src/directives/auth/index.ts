import type { Directive, DirectiveBinding } from 'vue';

import { hasAuth } from '@/router/utils';

/**
 * 路由权限指令
 *
 * 根据用户角色判断元素是否显示，无权限则移除元素
 * 与 v-perms 的区别：v-auth 用于角色/路由级别权限，v-perms 用于按钮/操作级别权限
 *
 * @example
 * ```vue
 * <!-- 单个角色 -->
 * <button v-auth="'admin'">管理员按钮</button>
 *
 * <!-- 多个角色（满足其一即可） -->
 * <button v-auth="['admin', 'editor']">编辑按钮</button>
 *
 * <!-- 在菜单中使用 -->
 * <el-menu-item v-auth="'admin'" index="/system">系统管理</el-menu-item>
 * ```
 */
export const auth: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<Array<string> | string>) {
    const { value } = binding;
    if (value) {
      !hasAuth(value) && el.remove();
    } else {
      throw new Error(
        "[Directive: auth]: need auths! Like v-auth=\"['btn.add','btn.edit']\"",
      );
    }
  },
};
