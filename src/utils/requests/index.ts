import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import axios from 'axios';

import { getToken } from '../auth';

// 响应数据结构
export interface ResponseData<T = unknown> {
  code: number;
  data: T;
  message: string;
}

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const responseType = response.config.responseType;
    // 文件下载等二进制响应保留完整 AxiosResponse，供调用方读取 headers/data
    if (responseType === 'blob' || responseType === 'arraybuffer') {
      return response;
    }

    const payload = response.data as Partial<ResponseData> | undefined;
    if (payload && typeof payload === 'object' && 'code' in payload) {
      const { code, message, data } = payload as ResponseData;
      // 根据业务状态码处理
      if (code === 0 || code === 200) {
        return data;
      }

      // 业务错误
      ElMessage.error(message || '请求失败');
      return Promise.reject(new Error(message || '请求失败'));
    }

    // 非统一业务包结构时直接透传 data
    return response.data;
  },
  (error: AxiosError<ResponseData>) => {
    const { response } = error;

    if (response) {
      const { status, data } = response;
      let message = data?.message || '请求失败';

      switch (status) {
        case 401:
          message = '登录已过期，请重新登录';
          // 可在此处理登出逻辑
          break;
        case 403:
          message = '没有权限访问';
          break;
        case 404:
          message = '请求资源不存在';
          break;
        case 500:
          message = '服务器错误';
          break;
      }

      ElMessage.error(message);
    } else if (error.message.includes('timeout')) {
      ElMessage.error('请求超时');
    } else if (error.message.includes('Network')) {
      ElMessage.error('网络错误');
    }

    return Promise.reject(error);
  },
);

// 封装请求方法
export function request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  return service(config) as Promise<T>;
}

export function get<T = unknown>(url: string, params?: object, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ ...config, url, method: 'GET', params });
}

export function post<T = unknown>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ ...config, url, method: 'POST', data });
}

// 文件上传统一走 multipart/form-data，避免各业务模块重复设置 headers。
export function postForm<T = unknown>(url: string, data: FormData, config?: AxiosRequestConfig): Promise<T> {
  // Let the browser/axios set the multipart boundary automatically.
  // Setting Content-Type manually can cause missing boundary and lead to 400 errors.
  return request<T>({
    ...config,
    url,
    method: 'POST',
    data,
    headers: {
      ...(config?.headers ?? {
        'Content-Type': 'multipart/form-data',
      }),
    },
  });
}

export function put<T = unknown>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ ...config, url, method: 'PUT', data });
}

export function del<T = unknown>(url: string, params?: object, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ ...config, url, method: 'DELETE', params });
}

export interface DownloadConfig extends AxiosRequestConfig {
  /** 下载的文件名，如果不提供则从响应头中获取 */
  filename?: string;
  /** 是否自动触发浏览器下载，默认为 true */
  autoDownload?: boolean;
}

export async function download(url: string, data?: object, config?: DownloadConfig): Promise<Blob> {
  const { filename, autoDownload = true, ...axiosConfig } = config || {};

  const response = await service.request<Blob>({
    url,
    method: 'POST',
    data,
    responseType: 'blob',
    ...axiosConfig,
  });

  const blob = response.data;

  // 检查响应是否为错误的 JSON 格式
  const contentType = response.headers['content-type'] || '';
  if (contentType.includes('application/json')) {
    const text = await blob.text();
    try {
      const errorData = JSON.parse(text);
      if (errorData.code !== 0 && errorData.code !== 200) {
        const errorMessage = errorData.message || '下载失败';
        ElMessage.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (e) {
      if (e instanceof SyntaxError) {
        // JSON 解析失败，继续正常下载流程
      } else {
        throw e;
      }
    }
  }

  // 自动下载
  if (autoDownload) {
    let downloadFilename = filename;

    // 如果没有提供文件名，尝试从响应头中获取
    if (!downloadFilename) {
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
        if (filenameMatch?.[1]) {
          downloadFilename = decodeURIComponent(filenameMatch[1].replace(/["']/g, ''));
        }
      }
    }

    // 触发浏览器下载
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = downloadFilename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  }

  return blob;
}

export default service;
