/**
 * localStorage 封装
 */
export const storage = {
  get<T = unknown>(key: string): T | null {
    const value = localStorage.getItem(key);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  },

  set(key: string, value: unknown): void {
    if (typeof value === 'string') {
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    localStorage.clear();
  },
};

/**
 * sessionStorage 封装
 */
export const sessionStorage = {
  get<T = unknown>(key: string): T | null {
    const value = window.sessionStorage.getItem(key);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  },

  set(key: string, value: unknown): void {
    if (typeof value === 'string') {
      window.sessionStorage.setItem(key, value);
    } else {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    }
  },

  remove(key: string): void {
    window.sessionStorage.removeItem(key);
  },

  clear(): void {
    window.sessionStorage.clear();
  },
};
