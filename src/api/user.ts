import { get, post } from '@/utils/requests';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  refreshToken?: string;
}

export interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  roles: string[];
  permissions?: string[];
}

// 登录
export function login(data: LoginParams) {
  return post<LoginResult>('/auth/login', data);
}

// 登出
export function logout() {
  return post('/auth/logout');
}

// 获取用户信息
export function getUserInfo() {
  return get<UserInfo>('/user/info');
}

// 刷新 token
export function refreshToken(token: string) {
  return post<LoginResult>('/auth/refresh', { refreshToken: token });
}
