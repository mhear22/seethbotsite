import { test, expect } from '@playwright/test'
import { watchConsole, waitForCanvasRender, canvasRenderInfo } from './helpers'

/**
 * Smoke playtest for Story Mode (single-player, client-only).
 *
 * Flow:
 *  1. Navigate directly to the /story route.
 *  2. Start a New Run.
 *  3. Wait for the 3D story canvas to appear and actually RENDER (non-blank).
 *  4. Drive movement (hold 'w' ~1s) and capture before/after screenshots.
 *  5. Assert no severe console errors during play.
 */
test('story mode starts a run and renders the 3D world', async ({ page }, testInfo) => {
  const watcher = watchConsole(page)

  // Use a relative path so it resolves against the `/mech/` baseURL (the prod
  // build serves under `/mech/`; a leading-slash path would 404).
  await page.goto('story', { waitUntil: 'domcontentloaded' })

  // Intro screen.
  await expect(page.getByRole('heading', { name: 'Story Mode' })).toBeVisible({ timeout: 30_000 })

  const newRunBtn = page.getByRole('button', { name: /new run/i })
  await expect(newRunBtn).toBeVisible()
  await newRunBtn.click()

  // The story canvas appears once roaming begins.
  const canvas = page.locator('canvas.story-canvas')
  await expect(canvas).toBeVisible({ timeout: 30_000 })

  // Wait for three.js to render a non-blank frame.
  const info = await waitForCanvasRender(page, 'canvas.story-canvas', {
    timeout: 40_000,
    minDistinctColors: 3,
  })

  // Always capture the "before" screenshot for artifacts, even on failure paths.
  await page.screenshot({ path: 'e2e/screenshots/story-before.png' })
  await page.screenshot({ path: testInfo.outputPath('story-before.png') })

  expect(
    info.found && info.width > 0,
    `story canvas missing or unsized: ${JSON.stringify(info)}`,
  ).toBeTruthy()

  // The core render assertion: canvas is not a single flat color.
  expect(
    info.distinctColors,
    `story canvas appears blank/uniform (distinctColors=${info.distinctColors}). ` +
      `This indicates headless WebGL did not render. Full info: ${JSON.stringify(info)}`,
  ).toBeGreaterThanOrEqual(3)

  // Focus the canvas/world and drive forward movement (W) for ~1s.
  await canvas.click({ position: { x: 640, y: 360 } }).catch(() => {})
  await page.keyboard.down('KeyW')
  await page.waitForTimeout(1100)
  await page.keyboard.up('KeyW')

  // Let a few more frames render after movement.
  await page.waitForTimeout(600)
  const after = await canvasRenderInfo(page, 'canvas.story-canvas')

  await page.screenshot({ path: 'e2e/screenshots/story-after.png' })
  await page.screenshot({ path: testInfo.outputPath('story-after.png') })

  expect(
    after.distinctColors,
    `story canvas blank after movement: ${JSON.stringify(after)}`,
  ).toBeGreaterThanOrEqual(3)

  expect(watcher.crashes, `page crashes/exceptions:\n${watcher.crashes.join('\n')}`).toEqual([])
  expect(watcher.errors, `severe console errors during play:\n${watcher.errors.join('\n')}`).toEqual([])
})
