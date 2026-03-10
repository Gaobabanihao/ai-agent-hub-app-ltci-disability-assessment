
export function manualChunks(id: string): string | undefined {
  const moduleId = id.replaceAll('\\', '/');
  if (!moduleId.includes('node_modules')) {
    return undefined;
  }

  // Vue 核心
  if (
    moduleId.includes('/node_modules/vue/')
    || moduleId.includes('/node_modules/vue-router/')
    || moduleId.includes('/node_modules/pinia/')
  ) {
    return 'framework-core';
  }

  // Element Plus 图标独立
  if (moduleId.includes('/node_modules/@element-plus/icons-vue/')) {
    return 'element-icons';
  }

  // Element Plus 相对低频且体积较大的组件合并到一个独立 chunk
  const elementPlusRarePaths = [
    '/node_modules/element-plus/es/components/tree-v2/',
    '/node_modules/element-plus/es/components/transfer/',
    '/node_modules/element-plus/es/components/tour/',
    '/node_modules/element-plus/es/components/mention/',
    '/node_modules/element-plus/es/components/color-picker/',
    '/node_modules/element-plus/es/components/carousel/',
    '/node_modules/element-plus/es/components/cascader/',
    '/node_modules/element-plus/es/components/cascader-panel/',
    '/node_modules/element-plus/es/components/slider/',
    '/node_modules/element-plus/es/components/input-tag/',
    '/node_modules/element-plus/es/components/splitter/',
    '/node_modules/element-plus/es/components/tree-select/',
    '/node_modules/element-plus/es/components/time-select/',
    '/node_modules/element-plus/es/components/anchor/',
    '/node_modules/element-plus/es/components/affix/',
    '/node_modules/element-plus/es/components/timeline/',
    '/node_modules/element-plus/es/components/backtop/',
    '/node_modules/element-plus/es/components/statistic/',
    '/node_modules/element-plus/es/components/countdown/',
    '/node_modules/element-plus/es/components/result/',
    '/node_modules/element-plus/es/components/skeleton/',
    '/node_modules/element-plus/es/components/watermark/',
  ];

  // Element Plus 按包拆分（避免强制拆分导致的循环 chunk 依赖）
  if (moduleId.includes('/node_modules/element-plus/')) {
    // Element Plus 入口桥接层单独拆包，避免与细分组件 chunk 形成回环
    if (
      moduleId.endsWith('/node_modules/element-plus/es/index.mjs')
      || moduleId.endsWith('/node_modules/element-plus/es/component.mjs')
    ) {
      return 'element-plus-entry';
    }

    // table 相关生态统一拆到 table chunk
    const elementPlusTablePaths = [
      '/node_modules/element-plus/es/components/table/',
      '/node_modules/element-plus/es/components/table-v2/',
      '/node_modules/element-plus/es/components/virtual-list/',
      '/node_modules/element-plus/es/components/select/',
      '/node_modules/element-plus/es/components/select-v2/',
      '/node_modules/element-plus/es/components/pagination/',
      '/node_modules/element-plus/es/components/tabs/',
      '/node_modules/element-plus/es/components/calendar/',
    ];
    for (const matchPath of elementPlusTablePaths) {
      if (moduleId.includes(matchPath)) {
        return 'element-plus-table';
      }
    }

    for (const matchPath of elementPlusRarePaths) {
      if (moduleId.includes(matchPath)) {
        return 'element-plus-rare';
      }
    }
    return 'element-plus';
  }

  // 富文本相关单独拆包
  if (moduleId.includes('@wangeditor-next')) {
    return 'wangeditor';
  }

  // Markdown 相关能力单独拆分
  if (moduleId.includes('marked') || moduleId.includes('dompurify')) {
    return 'markdown';
  }

  // 其余三方依赖统一兜底
  return 'vendor';
}
