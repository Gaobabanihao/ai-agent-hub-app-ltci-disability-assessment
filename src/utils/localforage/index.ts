import type { ExpiresData, LocalForage, ProxyStorage } from './types.d';

import forage from 'localforage';

class StorageProxy implements ProxyStorage {
  protected storage: LocalForage;

  constructor(storageModel: LocalForage) {
    this.storage = storageModel;
    this.storage.config({
      // 首选IndexedDB作为第一驱动，不支持IndexedDB会自动降级到localStorage（WebSQL被弃用，详情看https://developer.chrome.com/blog/deprecating-web-sql）
      driver: [this.storage.INDEXEDDB, this.storage.LOCALSTORAGE],
      name: 'agents-admin',
    });
  }

  /**
   * @description 从离线仓库中删除所有的键名，重置数据库
   */
  public async clear() {
    return new Promise<void>((resolve, reject) => {
      this.storage
        .clear()
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * @description 从离线仓库中获取对应键名的值
   * @param k 键名
   */
  public async getItem<T>(k: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.storage
        .getItem<ExpiresData<T>>(k)
        .then((value) => {
          value && (value.expires > Date.now() || value.expires === 0)
            ? resolve(value.data)
            : resolve(null as T);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * @description 获取数据仓库中所有的key
   */
  public async keys() {
    return new Promise<string[]>((resolve, reject) => {
      this.storage
        .keys()
        .then((keys) => {
          resolve(keys);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * @description 从离线仓库中删除对应键名的值
   * @param k 键名
   */
  public async removeItem(k: string) {
    return new Promise<void>((resolve, reject) => {
      this.storage
        .removeItem(k)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * @description 将对应键名的数据保存到离线仓库
   * @param k 键名
   * @param v 键值
   * @param m 缓存时间（单位`分`，默认`0`分钟，永久缓存）
   */
  public async setItem<T>(k: string, v: T, m = 0): Promise<T> {
    return new Promise((resolve, reject) => {
      this.storage
        .setItem(k, {
          data: v,
          expires: m ? Date.now() + m * 60 * 1000 : 0,
        })
        .then((value) => {
          resolve(value.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}

/**
 * 二次封装 [localforage](https://localforage.docschina.org/) 支持设置过期时间，提供完整的类型提示
 */
export const localForage = () => new StorageProxy(forage);
