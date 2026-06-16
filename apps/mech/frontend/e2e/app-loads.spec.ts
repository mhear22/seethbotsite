import { test, expect } from '@playwright/test'
import { watchConsole } from './helpers'

/**
 * Smoke playtest: the app boots at '/', renders the initial menu/UI, and does
 * not throw real console errors or crash.
 *
 * The root route redirects to the Mech Builder. We assert the builder UI is
 * present (the "Battle" launch control) rather than depending on WebGL here, so
 * this test passes even if headless GL is unavailable.
 */
test('app loads without severe errors', async ({ page }, testInfo) => {
  const watcher = watchConsole(page)

  await page.goto('/', { waitUntil: 'domcontentloaded' })

  // Vue app root mounts.
  const appRoot = page.locator('#app')
  await expect(appRoot).toBeVisible({ timeout: 30_000 })

  // The builder (default landing) shows a Battle launch button. Be lenient on
  // the exact label, matching the "Battle" text used in the builder header/footer.
  const battleControl = page.getByRole('button', { name: /battle/i }).first()
  await expect(battleControl).toBeVisible({ timeout: 30_000 })

  // Give the app a moment to settle so late errors are captured.
  await page.waitForTimeout(1500)

  const shot = testInfo.outputPath('app-loads.png')
  await page.screenshot({ path: shot, fullPage: false })
  await page.screenshot({ path: 'e2e/screenshots/app-loads.png', fullPage: false })

  expect(watcher.crashes, `page crashes/exceptions:\n${watcher.crashes.join('\n')}`).toEqual([])
  expect(watcher.errors, `severe console errors:\n${watcher.errors.join('\n')}`).toEqual([])
})
