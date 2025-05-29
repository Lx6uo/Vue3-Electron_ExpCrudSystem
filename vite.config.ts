import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 启用Electron相关配置
    electron([
      {
        // Main process
        entry: 'electron/main/index.ts',
        vite: {
          build: {
            outDir: 'dist-electron/main',
            rollupOptions: {
              // 处理better-sqlite3原生模块
              external: ['better-sqlite3'],
            },
          },
        },
      },
      {
        // Preload scripts
        entry: 'electron/preload/index.ts',
        vite: {
          build: {
            outDir: 'dist-electron/preload',
          },
        },
      },
    ]),
    renderer({
      // 允许在渲染进程中使用Node.js API
      nodeIntegration: true,
      // 处理better-sqlite3原生模块
      external: ['better-sqlite3'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})