import { test, expect } from '@playwright/test'
import { watchConsole, waitForCanvasRender } from './helpers'

/**
 * Best-effort smoke playtest for a single-player battle vs AI.
 *
 * This is reachable WITHOUT a game server: the builder produces a loadout, then
 * "Practice vs AI" runs a local battle. Flow:
 *   1. Builder: apply a starter preset (a complete, valid loadout).
 *   2. Launch into the Battle screen.
 *   3. Choose "Practice vs AI" -> pick a map -> Start.
 *   4. From the pre-battle "ready" screen, Launch Battle.
 *   5. Wait for the battle canvas to render and screenshot the HUD.
 *
 * It is tolerant: if a step's UI isn't reachable it fails with a clear message,
 * but it never depends on networking/matchmaking.
 */
test('single-player battle vs AI renders and shows HUD', async ({ page }, testInfo) => {
  const watcher = watchConsole(page)

  // --- Builder: get a complete loadout via a starter preset. ---
  // Relative path so it resolves under the `/mech/` baseURL.
  await page.goto('builder', { waitUntil: 'domcontentloaded' })

  const presetChip = page.locator('.starter-presets .preset-chip').first()
  await expect(presetChip).toBeVisible({ timeout: 30_000 })
  await presetChip.click()

  // Launch button(s) labelled "Battle". Enabled once the loadout is complete.
  const launchBattle = page.getByRole('button', { name: /battle/i }).first()
  await expect(launchBattle).toBeEnabled({ timeout: 15_000 })
  await launchBattle.click()

  // --- Battle: mode select. ---
  await expect(page.getByRole('heading', { name: /select battle mode/i })).toBeVisible({
    timeout: 30_000,
  })
  await page.getByRole('button', { name: /practice vs ai/i }).click()

  // --- Map select. ---
  await expect(page.getByRole('heading', { name: /select arena/i })).toBeVisible({ timeout: 20_000 })
  // Pick the first available map, then confirm.
  await page.locator('.map-btn').first().click()
  // The map-select confirm control is labelled "Continue".
  const continueBtn = page.getByRole('button', { name: /^continue$/i }).first()
  await expect(continueBtn).toBeVisible({ timeout: 15_000 })
  await continueBtn.click()

  // --- Pre-battle ready screen -> Launch Battle. ---
  const launch = page.getByRole('button', { name: /launch battle/i })
  await expect(launch).toBeVisible({ timeout: 30_000 })
  await launch.click()

  // --- Active battle: canvas + HUD. ---
  const canvas = page.locator('canvas.battle-canvas')
  await expect(canvas).toBeVisible({ timeout: 30_000 })

  const info = await waitForCanvasRender(page, 'canvas.battle-canvas', {
    timeout: 40_000,
    minDistinctColors: 3,
  })

  await page.screenshot({ path: 'e2e/screenshots/battle-hud.png' })
  await page.screenshot({ path: testInfo.outputPath('battle-hud.png') })

  expect(
    info.nonBlank,
    `battle canvas appears blank/uniform: ${JSON.stringify(info)}`,
  ).toBeTruthy()

  expect(watcher.crashes, `page crashes/exceptions:\n${watcher.crashes.join('\n')}`).toEqual([])
  expect(watcher.errors, `severe console errors during battle:\n${watcher.errors.join('\n')}`).toEqual([])
})
