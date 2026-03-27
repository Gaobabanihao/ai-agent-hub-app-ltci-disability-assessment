import type { ConfigEnv, UserConfigExport } from 'vite';

import { loadEnv } from 'vite';

import { manualChunks } from './build/chunks';
import { exclude, include } from './build/optimize';
import { getPluginsList } from './build/plugins';
import {
  __APP_INFO__,
  alias,
  pathResolve,
  root,
  wrapperEnv,
} from './build/utils';

const vite = ({ mode }: ConfigEnv): UserConfigExport => {
  const env = wrapperEnv(loadEnv(mode, root));
  const { VITE_PORT, VITE_COMPRESSION, VITE_PUBLIC_PATH, VITE_ENABLE_PROD_MOCK } = env;
  return {
    base: VITE_PUBLIC_PATH,
    root,
    resolve: {
      alias,
    },
    // 服务端渲染
    server: {
      // 端口号
      port: VITE_PORT,
      host: '0.0.0.0',
      // 本地跨域代理 https://cn.vitejs.dev/config/server-options.html#server-proxy
      proxy: {
        '/ltci-api': {
          target: 'http://47.116.113.217:7001/api',
          changeOrigin: true,
          // 前端加api，拦截接口到后端服务器
          rewrite: (path) => path.replace(/^\/ltci-api/, ''),
        },
      },
      // 预热文件以提前转换和缓存结果，降低启动期间的初始页面加载时长并防止转换瀑布
      warmup: {
        clientFiles: ['./index.html', './src/{views,components}/*'],
      },
    },
    plugins: getPluginsList(VITE_COMPRESSION, VITE_ENABLE_PROD_MOCK),
    // https://cn.vitejs.dev/config/dep-optimization-options.html#dep-optimization-options
    optimizeDeps: {
      include,
      exclude,
    },
    build: {
      // https://cn.vitejs.dev/guide/build.html#browser-compatibility
      target: 'es2015',
      sourcemap: false,
      // 消除打包大小超过500kb警告
      // chunkSizeWarningLimit: 4000,
      rollupOptions: {
        input: {
          index: pathResolve('./index.html', import.meta.url),
        },
        // 静态资源分类打包
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          // 手动分包，确保单文件不超过 500kb
          manualChunks,
        },
      },
    },
    define: {
      __INTLIFY_PROD_DEVTOOLS__: false,
      __APP_INFO__: JSON.stringify(__APP_INFO__),
    },
  };
};

export default vite;
