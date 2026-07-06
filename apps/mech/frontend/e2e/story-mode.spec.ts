import { test, expect } from '@playwright/test'
import { watchConsole, waitForCanvasRender, canvasScreenshotBytes, NON_BLANK_PNG_BYTES } from './helpers'

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
  await expect(page.getByRole('heading', { name: /talus reach/i })).toBeVisible({ timeout: 30_000 })

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

  // The core render assertion: the canvas presented a non-blank frame (composited
  // screenshot fallback covers WebGL-without-preserveDrawingBuffer readback).
  expect(
    info.nonBlank,
    `story canvas appears blank/uniform: ${JSON.stringify(info)}`,
  ).toBeTruthy()

  // Focus the canvas/world and drive forward movement (W) for ~1s.
  await canvas.click({ position: { x: 640, y: 360 } }).catch(() => {})
  await page.keyboard.down('KeyW')
  await page.waitForTimeout(1100)
  await page.keyboard.up('KeyW')

  // Let a few more frames render after movement.
  await page.waitForTimeout(600)
  const afterBytes = await canvasScreenshotBytes(page, 'canvas.story-canvas')

  await page.screenshot({ path: 'e2e/screenshots/story-after.png' })
  await page.screenshot({ path: testInfo.outputPath('story-after.png') })

  expect(
    afterBytes,
    `story canvas blank after movement: composited PNG ${afterBytes} bytes`,
  ).toBeGreaterThanOrEqual(NON_BLANK_PNG_BYTES)

  expect(watcher.crashes, `page crashes/exceptions:\n${watcher.crashes.join('\n')}`).toEqual([])
  expect(watcher.errors, `severe console errors during play:\n${watcher.errors.join('\n')}`).toEqual([])
})

/**
 * Phase 4 dismount loop smoke (design §4). Reaching a town on foot by dead-
 * reckoning across the 600u overworld is too fragile for a headless smoke, so we
 * exercise the on-foot ↔ Frame transition through the §4 persistence seam: a fresh
 * New Run writes a valid save, we patch its additive on-foot fields to place the
 * pilot dismounted beside the parked Frame at town-0, Continue restores the hub,
 * then we walk and remount. This drives the real HUD swap, on-foot locomotion and
 * mount() in the browser.
 *
 * Flow:
 *  1. New Run (persists a valid v3 save).
 *  2. Reload to the intro (no world loop -> safe to patch localStorage).
 *  3. Patch the save: pilotMode='onFoot', at town-0, Frame parked at its centre.
 *  4. Continue Run -> world restores the pilot on foot at the parked Frame.
 *  5. Assert the on-foot controls hint, walk ~2s (out and back), remount with F.
 *  6. Assert the hint flips back to the in-Frame verbs; no severe console errors.
 */
test('story mode: dismount hub restores, walks, and remounts the Frame (§4)', async ({ page }, testInfo) => {
  const watcher = watchConsole(page)

  // 1. Fresh New Run -> a valid save lands in localStorage.
  await page.goto('story', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: /talus reach/i })).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: /new run/i }).click()
  await expect(page.locator('canvas.story-canvas')).toBeVisible({ timeout: 30_000 })
  await waitForCanvasRender(page, 'canvas.story-canvas', { timeout: 40_000, minDistinctColors: 3 })

  // 2. Reload to the intro screen: with no StoryWorld loop running, patching the
  //    save cannot race a decay/teardown autosave.
  await page.goto('story', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: /talus reach/i })).toBeVisible({ timeout: 30_000 })

  // 3. Patch the additive on-foot fields (§4 persistence). town-0's centre is
  //    townSpawnPosition(0) = [330, 0, 0]; parking the Frame there spawns the pilot
  //    beside it so the F-remount affordance is live immediately.
  const patched = await page.evaluate(() => {
    const KEY = 'mech-story-v1'
    const raw = localStorage.getItem(KEY)
    if (!raw) return false
    const run = JSON.parse(raw)
    run.pilotMode = 'onFoot'
    run.onFootTownId = 'town-0'
    run.mechPark = [330, 0, 0]
    localStorage.setItem(KEY, JSON.stringify(run))
    return true
  })
  expect(patched, 'New Run did not persist a save to patch').toBe(true)

  // 4. Continue Run -> restoreOnFoot places the pilot on foot at the parked Frame.
  const continueBtn = page.getByRole('button', { name: /continue run/i })
  await expect(continueBtn).toBeVisible({ timeout: 30_000 })
  await continueBtn.click()

  const canvas = page.locator('canvas.story-canvas')
  await expect(canvas).toBeVisible({ timeout: 30_000 })
  await waitForCanvasRender(page, 'canvas.story-canvas', { timeout: 40_000, minDistinctColors: 3 })

  // On foot: the controls hint switches to the pedestrian verbs (§4.1).
  const hint = page.locator('.story-controls-hint')
  await expect(hint).toContainText('F mount up', { timeout: 15_000 })

  await page.screenshot({ path: 'e2e/screenshots/story-onfoot.png' })
  await page.screenshot({ path: testInfo.outputPath('story-onfoot.png') })

  // 5. Walk the decay-free hub (§4.2): out for ~1s, then back so the pilot returns
  //    within the parked-Frame remount radius (~8u).
  await canvas.click({ position: { x: 640, y: 360 } }).catch(() => {})
  await page.keyboard.down('KeyW')
  await page.waitForTimeout(1000)
  await page.keyboard.up('KeyW')
  await page.keyboard.down('KeyS')
  await page.waitForTimeout(1100)
  await page.keyboard.up('KeyS')
  await page.waitForTimeout(400)

  // 6. Remount the parked Frame (F) -> back in the cockpit; the hint flips from the
  //    pedestrian verbs back to the in-Frame verbs (P4 copy: "Shift dash …" is
  //    mech-only, so its presence proves the mount() swap took effect).
  await page.keyboard.press('KeyF')
  await expect(hint).toContainText('Shift dash', { timeout: 15_000 })

  await page.screenshot({ path: 'e2e/screenshots/story-remount.png' })
  await page.screenshot({ path: testInfo.outputPath('story-remount.png') })

  expect(watcher.crashes, `page crashes/exceptions:\n${watcher.crashes.join('\n')}`).toEqual([])
  expect(watcher.errors, `severe console errors during play:\n${watcher.errors.join('\n')}`).toEqual([])
})
