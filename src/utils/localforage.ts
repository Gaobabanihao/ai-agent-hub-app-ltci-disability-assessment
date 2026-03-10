import localforage from 'localforage';
import { APP_CONFIG } from '@/config/app';

// 配置 localforage
localforage.config({
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
  name: APP_CONFIG.storage.name,
  storeName: APP_CONFIG.storage.storeName,
  description: APP_CONFIG.storage.description,
});

export const forage = {
  async get<T = unknown>(key: string): Promise<T | null> {
    return localforage.getItem<T>(key);
  },

  async set<T = unknown>(key: string, value: T): Promise<T> {
    return localforage.setItem(key, value);
  },

  async remove(key: string): Promise<void> {
    return localforage.removeItem(key);
  },

  async clear(): Promise<void> {
    return localforage.clear();
  },

  async keys(): Promise<string[]> {
    return localforage.keys();
  },

  async length(): Promise<number> {
    return localforage.length();
  },

  async iterate<T, U>(
    callback: (value: T, key: string, index: number) => U,
  ): Promise<U | undefined> {
    return localforage.iterate(callback);
  },
};

export default localforage;
