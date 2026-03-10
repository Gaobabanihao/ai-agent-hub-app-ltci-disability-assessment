export const APP_CONFIG = {
  title: import.meta.env.VITE_APP_TITLE || '长期护理保险失能等级评估系统',
  shortTitle: '长护评估',
  storage: {
    name: 'app-ltci-disability-assessment',
    storeName: 'app_store',
    description: '长期护理保险失能等级评估系统 本地存储',
  },
} as const;
