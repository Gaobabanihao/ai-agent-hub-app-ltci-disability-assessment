import { useUserStore } from '@/store/modules/user';

/**
 * 检查是否拥有路由权限（基于角色）
 *
 * @param value 权限值，可以是单个字符串或字符串数组
 * @returns 是否拥有权限
 *
 * @example
 * ```ts
 * hasAuth('admin') // 检查是否有 admin 角色
 * hasAuth(['admin', 'editor']) // 检查是否有 admin 或 editor 角色
 * ```
 */
export function hasAuth(value: string | string[]): boolean {
  const userStore = useUserStore();
  const roles = (userStore.userInfo as { roles?: string[] })?.roles || [];

  const requiredAuths = Array.isArray(value) ? value : [value];
  return requiredAuths.some((auth) => roles.includes(auth));
}
