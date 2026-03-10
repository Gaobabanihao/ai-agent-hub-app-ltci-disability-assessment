import { useUserStore } from '@/store/modules/user';

import { storage } from './storage';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export function getToken(): string | null {
  return storage.get<string>(TOKEN_KEY);
}

export function setToken(token: string): void {
  storage.set(TOKEN_KEY, token);
}

export function removeToken(): void {
  storage.remove(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return storage.get<string>(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  storage.set(REFRESH_TOKEN_KEY, token);
}

export function removeRefreshToken(): void {
  storage.remove(REFRESH_TOKEN_KEY);
}

export function clearAuth(): void {
  removeToken();
  removeRefreshToken();
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * 检查是否拥有按钮/操作权限
 *
 * @param value 权限值，可以是单个字符串或字符串数组
 * @returns 是否拥有权限
 *
 * @example
 * ```ts
 * hasPerms('user:add') // 检查是否有添加用户权限
 * hasPerms(['user:add', 'user:edit']) // 检查是否有添加或编辑用户权限
 * ```
 */
export function hasPerms(value: string | string[]): boolean {
  const userStore = useUserStore();
  const permissions = (userStore.userInfo as { permissions?: string[] })?.permissions || [];

  const requiredPerms = Array.isArray(value) ? value : [value];
  return requiredPerms.some((perm) => permissions.includes(perm));
}
