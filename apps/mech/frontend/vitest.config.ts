import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    // Pure-logic + three.js math runs fine in node. No DOM/WebGL needed.
    environment: 'node',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
  },
  resolve: {
    alias: {
      // Mirror tsconfig path mapping: '@shared/*' -> 'src/shared/*'.
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
})
