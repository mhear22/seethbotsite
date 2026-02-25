import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    base: isProd ? '/datacenter/' : '/',
    plugins: [vue()],
    server: {
      host: true,
      port: 3004,
      fs: {
        allow: [path.resolve(__dirname, '../../../..')]
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: path.resolve(__dirname, '../../../backend/datacenter-webdist'),
      emptyOutDir: true
    }
  }
})
