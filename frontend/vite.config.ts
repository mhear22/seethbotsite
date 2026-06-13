import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@shared': path.resolve(__dirname, './shared')
    }
  },
  plugins: [
    vue()
  ],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/avatars': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api-docs': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:3001',
        ws: true,
        changeOrigin: true,
      },
      '/presence': {
        target: 'http://localhost:3001',
        ws: true,
        changeOrigin: true,
      },
      '/mech': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
  esbuild: {
    pure: mode === 'production' ? ['console.log', 'console.debug', 'console.info'] : []
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'three': ['three'],
          'leaflet': ['leaflet'],
          'api': ['openapi-fetch']
        }
      }
    }
  }
}))
