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
    // Exclude the Playwright suite (its own runner, run via `pnpm playtest`).
    // vitest cannot execute Playwright's test() and crashes collecting them.
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'e2e/**'],
  },
  resolve: {
    alias: {
      // Mirror tsconfig path mapping: '@shared/*' -> 'src/shared/*'.
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
})
