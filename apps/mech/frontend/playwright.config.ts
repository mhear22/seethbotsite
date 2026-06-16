import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright "playtest" config for the Mech game.
 *
 * The production build serves the app under the `/mech/` base path (see
 * vite.config.ts), and `vite preview` serves the configured `outDir`
 * (../../../backend/mech-webdist). So the running app lives at
 * http://localhost:4174/mech/ — that is our baseURL.
 *
 * Headless three.js needs a working WebGL implementation. Chromium can fall
 * back to SwiftShader (software GL) with the launch flags below, which lets the
 * 3D canvases actually render without a GPU.
 */
const PREVIEW_PORT = 4174
const BASE_URL = `http://localhost:${PREVIEW_PORT}/mech/`

// Software-GL launch flags so WebGL renders in headless Chromium without a GPU.
const GL_ARGS = [
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
  '--ignore-gpu-blocklist',
  '--enable-webgl',
  '--enable-features=Vulkan',
  '--disable-gpu-sandbox',
]

export default defineConfig({
  testDir: 'e2e',
  // Smoke playtests can legitimately take a while (build + 3D warm-up).
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'e2e/report', open: 'never' }]],
  outputDir: 'e2e/test-results',
  use: {
    baseURL: BASE_URL,
    headless: true,
    viewport: { width: 1280, height: 720 },
    // Capture a screenshot on failure as an artifact.
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'retain-on-failure',
    actionTimeout: 20_000,
    navigationTimeout: 60_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: GL_ARGS,
        },
      },
    },
  ],
  webServer: {
    // Build the production bundle, then serve it via vite preview on 4174.
    command: 'pnpm run build && pnpm run preview',
    url: BASE_URL,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
