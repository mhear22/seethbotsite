import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    base: isProd ? '/mech/' : '/',
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, './src/shared')
      }
    },
    plugins: [vue()],
    server: {
      host: true,
      port: 3002,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true
        },
        '/ws': {
          target: 'http://localhost:3001',
          ws: true,
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: path.resolve(__dirname, '../../../backend/mech-webdist'),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          // Split the three.js vendor code into its own long-lived chunk.
          // Without this, three (~600 kB) is folded into whichever app chunk
          // imports it first (the MechParts chunk), tripping the 500 kB
          // chunk-size advisory and busting that chunk's cache on every app edit.
          manualChunks(id) {
            if (id.includes('node_modules/three')) {
              return 'three-vendor'
            }
          }
        }
      }
    }
  }
})
