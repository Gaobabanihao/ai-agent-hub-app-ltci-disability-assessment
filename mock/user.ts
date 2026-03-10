import { defineFakeRoute } from 'vite-plugin-fake-server/client';

export default defineFakeRoute([
  {
    url: '/api/auth/login',
    method: 'post',
    response: ({ body }) => {
      const { username, password } = body;
      if (username === 'admin' && password === '123456') {
        return {
          code: 200,
          message: '登录成功',
          data: {
            token: 'mock-token-admin-' + Date.now(),
            refreshToken: 'mock-refresh-token-admin',
          },
        };
      }
      if (username === 'user' && password === '123456') {
        return {
          code: 200,
          message: '登录成功',
          data: {
            token: 'mock-token-user-' + Date.now(),
            refreshToken: 'mock-refresh-token-user',
          },
        };
      }
      return {
        code: 401,
        message: '用户名或密码错误',
        data: null,
      };
    },
  },
  {
    url: '/api/auth/logout',
    method: 'post',
    response: () => ({
      code: 200,
      message: '登出成功',
      data: null,
    }),
  },
  {
    url: '/api/user/info',
    method: 'get',
    response: ({ headers }) => {
      const token = headers.authorization || '';
      if (token.includes('admin')) {
        return {
          code: 200,
          message: 'success',
          data: {
            id: '1',
            username: 'admin',
            nickname: '管理员',
            avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
            roles: ['admin'],
            permissions: ['*'],
          },
        };
      }
      if (token.includes('user')) {
        return {
          code: 200,
          message: 'success',
          data: {
            id: '2',
            username: 'user',
            nickname: '普通用户',
            avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
            roles: ['user'],
            permissions: ['user:view'],
          },
        };
      }
      return {
        code: 401,
        message: '未登录或 token 已过期',
        data: null,
      };
    },
  },
  {
    url: '/api/auth/refresh',
    method: 'post',
    response: () => ({
      code: 200,
      message: 'success',
      data: {
        token: 'mock-token-refreshed-' + Date.now(),
        refreshToken: 'mock-refresh-token-new',
      },
    }),
  },
]);
