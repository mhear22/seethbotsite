import { test, expect } from '@playwright/test'
import { watchConsole } from './helpers'

/**
 * Smoke playtest: the app boots at '/', renders the initial menu/UI, and does
 * not throw real console errors or crash.
 *
 * The root route lands on the GRINDER home menu (HomePage.vue) — not the builder.
 * We assert the two primary menu entries are visible (real, sized, on-screen
 * elements) rather than the `#app` container, which is a zero-height wrapper for
 * full-viewport positioned content and so reads as "hidden" to Playwright.
 */
test('app loads without severe errors', async ({ page }, testInfo) => {
  const watcher = watchConsole(page)

  await page.goto('/', { waitUntil: 'domcontentloaded' })

  // The home menu's two primary entries route into the campaign and the arena.
  const campaignEntry = page.getByRole('button', { name: /campaign/i }).first()
  await expect(campaignEntry).toBeVisible({ timeout: 30_000 })

  const battleControl = page.getByRole('button', { name: /build\s*&?\s*battle/i }).first()
  await expect(battleControl).toBeVisible({ timeout: 30_000 })

  // Give the app a moment to settle so late errors are captured.
  await page.waitForTimeout(1500)

  const shot = testInfo.outputPath('app-loads.png')
  await page.screenshot({ path: shot, fullPage: false })
  await page.screenshot({ path: 'e2e/screenshots/app-loads.png', fullPage: false })

  expect(watcher.crashes, `page crashes/exceptions:\n${watcher.crashes.join('\n')}`).toEqual([])
  expect(watcher.errors, `severe console errors:\n${watcher.errors.join('\n')}`).toEqual([])
})
