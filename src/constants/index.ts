// HTTP 状态码
export const HTTP_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

// 业务状态码
export const BUSINESS_CODE = {
  SUCCESS: 0,
  ERROR: -1,
  TOKEN_EXPIRED: 401,
  NO_PERMISSION: 403,
} as const;

// 存储 key
export const STORAGE_KEYS = {
  TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// 分页默认配置
export const PAGINATION = {
  PAGE: 1,
  PAGE_SIZE: 10,
  PAGE_SIZES: [10, 20, 50, 100],
} as const;

// 主题
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;
