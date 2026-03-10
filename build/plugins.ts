import type { PluginOption } from 'vite';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import UnoCSS from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Icons from 'unplugin-icons/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { vitePluginFakeServer } from 'vite-plugin-fake-server';
import { visualizer } from 'rollup-plugin-visualizer';
import removeConsole from 'vite-plugin-remove-console';
import removeNoMatch from 'vite-plugin-router-warn';
import svgLoader from 'vite-svg-loader';

import { configCompressPlugin } from './compress';

export function getPluginsList(
  VITE_COMPRESSION: ViteCompression,
  VITE_ENABLE_PROD_MOCK = false,
): PluginOption[] {
  const lifecycle = process.env.npm_lifecycle_event;
  return [
    UnoCSS(),
    vue(),
    // jsx、tsx语法支持
    vueJsx(),
    /**
     * 开发环境下移除非必要的vue-router动态路由警告No match found for location with path
     * 非必要具体看 https://github.com/vuejs/router/issues/521 和 https://github.com/vuejs/router/issues/359
     * vite-plugin-router-warn只在开发环境下启用，只处理vue-router文件并且只在服务启动或重启时运行一次，性能消耗可忽略不计
     */
    removeNoMatch(),
    // mock支持
    vitePluginFakeServer({
      logger: false,
      include: 'mock',
      infixName: false,
      enableProd: VITE_ENABLE_PROD_MOCK,
    }),
    // svg组件化支持
    svgLoader(),
    // Element Plus 自动按需导入（注意边界）
    /**
     * 1) Components 主要处理 .vue 模板内组件标签，不处理脚本中 JSX/TSX 里把组件当变量使用的场景：
     *    例如 <script setup lang="tsx"> 的 cellRenderer 里用 <ElTag />，仍需显式 import { ElTag } from 'element-plus'。
     * 3) 手动 from 'element-plus' 导入组件/服务 API 时，通常不会自动补齐样式。
     *    方案二选一：
     *    - 全局兜底：在 main.ts 引入 element-plus/dist/index.css；
     *    - 严格按需：按组件手动引入 element-plus/es/components/组件/style/css。
     */
    AutoImport({
      include: [
        /\.[tj]sx?$/,
        /\.vue$/,
        /\.vue\?vue/,
      ],
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
      ],
      resolvers: [ElementPlusResolver()],
      dts: 'types/auto-imports.d.ts',
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      // demo 示例目录禁用自动组件导入，避免影响业务构建
      globsExclude: ['src/**/demo/**', 'src/**/Demo/**'],
      dts: 'types/components.d.ts',
    }),
    // 自动按需加载图标
    Icons({
      compiler: 'vue3',
      scale: 1,
      autoInstall: true,
    }),
    configCompressPlugin(VITE_COMPRESSION),
    // 线上环境删除console
    removeConsole({ external: [] }),
    // 打包分析
    lifecycle === 'report' ? visualizer({ open: true, brotliSize: true, filename: 'report.html' }) : (null as any),
  ];
}
