import { defineStore } from 'pinia';
import { ref } from 'vue';

import { login as loginApi, getUserInfo as getUserInfoApi, type LoginParams, type UserInfo } from '@/api/user';
import { setToken as saveToken, clearAuth } from '@/utils/auth';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('');
  const userInfo = ref<UserInfo | null>(null);

  function setToken(value: string) {
    token.value = value;
    saveToken(value);
  }

  function setUserInfo(info: UserInfo | null) {
    userInfo.value = info;
  }

  function resetState() {
    token.value = '';
    userInfo.value = null;
    clearAuth();
  }

  /** 登录 */
  async function login(params: LoginParams) {
    const data = await loginApi(params);
    setToken(data.token);
    return data;
  }

  /** 获取用户信息 */
  async function fetchUserInfo() {
    const data = await getUserInfoApi();
    setUserInfo(data);
    return data;
  }

  /** 登出 */
  function logout() {
    resetState();
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    resetState,
    login,
    fetchUserInfo,
    logout,
  };
});
