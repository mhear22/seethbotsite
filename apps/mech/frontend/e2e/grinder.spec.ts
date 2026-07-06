import { test, expect } from '@playwright/test'
import {
  watchConsole,
  waitForCanvasRender,
  canvasScreenshotBytes,
  NON_BLANK_PNG_BYTES,
} from './helpers'

/**
 * GRINDER end-to-end smokes (design §2–§5) in a real headless-Chromium browser.
 *
 * These exercise the campaign's signature loops against the production build,
 * asserting DOM/HUD state and a non-blank composited canvas (never pixel maths,
 * so they tolerate software-GL variance). Each is kept well under the 120s config
 * timeout. Screenshots are written to e2e/screenshots/ as review artifacts.
 *
 * Determinism notes:
 *  - The overworld is a seeded, pure-function layout (townSpawnPosition), so town
 *    and anchor positions are fixed run to run.
 *  - Driving 600u across the map on foot is too fragile for a headless smoke, so
 *    the dismount/warden flow uses the §4 persistence seam (patch the save to spawn
 *    the pilot on foot beside the parked Frame AT the warden anchor), exactly like
 *    the existing story-mode dismount spec.
 */

// town-0 (Warden's Rest) centre is townSpawnPosition(0) = [330,0,0]. Its warden
// anchor is at town-relative (-14,-12) (Town.ANCHOR_LAYOUT.warden), i.e. world
// [316,0,-12]. Parking the Frame there spawns the pilot inside the 6u warden
// ANCHOR_INTERACT_RADIUS so the "warden's office" prompt is live on arrival.
const WARDEN_PARK: [number, number, number] = [316, 0, -12]

/**
 * (a) Home → New Campaign → arrival comms → the 3D world renders.
 */
test('grinder: new campaign shows Vaun arrival comms and renders the world', async ({
  page,
}, testInfo) => {
  const watcher = watchConsole(page)

  // Home menu → the campaign entry routes to Story Mode.
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /campaign/i }).first().click()

  // Story intro, then a fresh deployment.
  await expect(page.getByRole('heading', { name: /talus reach/i })).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: /new run/i }).click()

  // Act I arrival hail (§2.5): assert BEFORE the long canvas warm-up because the
  // comms toast auto-drains after a few seconds.
  const comms = page.locator('.comms')
  await expect(comms).toBeVisible({ timeout: 15_000 })
  await expect(comms.locator('.comms-callsign')).toContainText(/VAUN/i)
  await page.screenshot({ path: 'e2e/screenshots/grinder-arrival.png' })
  await page.screenshot({ path: testInfo.outputPath('grinder-arrival.png') })

  // The persistent overworld renders a non-blank frame.
  const canvas = page.locator('canvas.story-canvas')
  await expect(canvas).toBeVisible({ timeout: 30_000 })
  const info = await waitForCanvasRender(page, 'canvas.story-canvas', {
    timeout: 40_000,
    minDistinctColors: 3,
  })
  expect(info.nonBlank, `story canvas appears blank: ${JSON.stringify(info)}`).toBeTruthy()

  // The top HUD reports the campaign phase (Act I = Deployment).
  await expect(page.locator('.hud-phase')).toContainText(/held/i)

  await page.screenshot({ path: 'e2e/screenshots/grinder-world.png' })
  await page.screenshot({ path: testInfo.outputPath('grinder-world.png') })

  expect(watcher.crashes, `page crashes/exceptions:\n${watcher.crashes.join('\n')}`).toEqual([])
  expect(watcher.errors, `severe console errors:\n${watcher.errors.join('\n')}`).toEqual([])
})

/**
 * (b) Dismount → DECAY HELD chip → walk → warden dialogue opens → accept a quest.
 */
test('grinder: dismount hub shows DECAY HELD, warden dialogue opens, quest accepts (§4)', async ({
  page,
}, testInfo) => {
  const watcher = watchConsole(page)

  // Fresh run writes a valid save.
  await page.goto('story', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: /talus reach/i })).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: /new run/i }).click()
  await expect(page.locator('canvas.story-canvas')).toBeVisible({ timeout: 30_000 })
  await waitForCanvasRender(page, 'canvas.story-canvas', { timeout: 40_000, minDistinctColors: 3 })

  // Reload to the intro (no world loop → safe to patch the save without racing an
  // autosave), then place the pilot on foot beside the Frame parked at the warden.
  await page.goto('story', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: /talus reach/i })).toBeVisible({ timeout: 30_000 })
  const patched = await page.evaluate((park) => {
    const KEY = 'mech-story-v1'
    const raw = localStorage.getItem(KEY)
    if (!raw) return false
    const run = JSON.parse(raw)
    run.pilotMode = 'onFoot'
    run.onFootTownId = 'town-0'
    run.mechPark = park
    localStorage.setItem(KEY, JSON.stringify(run))
    return true
  }, WARDEN_PARK)
  expect(patched, 'New Run did not persist a save to patch').toBe(true)

  await page.getByRole('button', { name: /continue run/i }).click()
  const canvas = page.locator('canvas.story-canvas')
  await expect(canvas).toBeVisible({ timeout: 30_000 })
  await waitForCanvasRender(page, 'canvas.story-canvas', { timeout: 40_000, minDistinctColors: 3 })

  // §4.2 keystone made legible: on foot, decay is paused → the DECAY HELD chip.
  await expect(page.locator('.hub-chip.decay-held')).toContainText(/DECAY HELD/i, { timeout: 15_000 })

  // Walk a beat (out and back) so the pilot stays inside the warden anchor radius.
  // Drive by keyboard only — StoryModePage/InputManager listen on `window`, so we
  // avoid clicking the canvas (which would engage pointer-lock and could capture a
  // later HUD click).
  await page.keyboard.down('KeyW')
  await page.waitForTimeout(350)
  await page.keyboard.up('KeyW')
  await page.keyboard.down('KeyS')
  await page.waitForTimeout(400)
  await page.keyboard.up('KeyS')
  await page.waitForTimeout(300)

  await page.screenshot({ path: 'e2e/screenshots/grinder-onfoot-decayheld.png' })
  await page.screenshot({ path: testInfo.outputPath('grinder-onfoot-decayheld.png') })

  // The on-foot anchor prompt (§4.5): stand next to the warden's office and enter.
  const anchorPrompt = page.locator('.hub-prompt.anchor')
  await expect(anchorPrompt).toBeVisible({ timeout: 15_000 })
  // Interact via the E key (the anchor kind routes warden → openDialog).
  await page.keyboard.press('KeyE')

  // Warden dialogue (QuestDialog, first-visit briefing → the branching tree).
  const questDialog = page.locator('.quest-dialog')
  await expect(questDialog).toBeVisible({ timeout: 15_000 })
  await page.screenshot({ path: 'e2e/screenshots/grinder-warden.png' })
  await page.screenshot({ path: testInfo.outputPath('grinder-warden.png') })

  // Traverse Sgt. Iolo Track's tree to the accept choice (deterministic copy from
  // dialogueTrees.wardensRestTree): greet → "What's the job" → "I'm in. Mounting up."
  await questDialog.getByText(/what's the job/i).click()
  await questDialog.getByText(/mounting up/i).click()

  // Accepting closes the dialogue and confirms via a toast (Order/Recovery accepted).
  await expect(questDialog).toBeHidden({ timeout: 15_000 })
  await expect(page.locator('.story-toast')).toBeVisible({ timeout: 15_000 })

  await page.screenshot({ path: 'e2e/screenshots/grinder-quest-accepted.png' })
  await page.screenshot({ path: testInfo.outputPath('grinder-quest-accepted.png') })

  expect(watcher.crashes, `page crashes/exceptions:\n${watcher.crashes.join('\n')}`).toEqual([])
  expect(watcher.errors, `severe console errors:\n${watcher.errors.join('\n')}`).toEqual([])
})

/**
 * (c) Builder → Practice-vs-AI battle renders, drive combat + fire, take no
 *     console errors while under fire (player-vs-squad, §3.6).
 */
test('grinder: builder → battle renders and survives a firefight without errors', async ({
  page,
}, testInfo) => {
  const watcher = watchConsole(page)

  await page.goto('builder', { waitUntil: 'domcontentloaded' })
  const presetChip = page.locator('.starter-presets .preset-chip').first()
  await expect(presetChip).toBeVisible({ timeout: 30_000 })
  await presetChip.click()

  await page.getByRole('button', { name: /battle/i }).first().click()

  await expect(page.getByRole('heading', { name: /select battle mode/i })).toBeVisible({
    timeout: 30_000,
  })
  await page.getByRole('button', { name: /practice vs ai/i }).click()

  await expect(page.getByRole('heading', { name: /select arena/i })).toBeVisible({ timeout: 20_000 })
  await page.locator('.map-btn').first().click()
  await page.getByRole('button', { name: /^continue$/i }).first().click()

  await page.getByRole('button', { name: /launch battle/i }).click()

  const canvas = page.locator('canvas.battle-canvas')
  await expect(canvas).toBeVisible({ timeout: 30_000 })
  const info = await waitForCanvasRender(page, 'canvas.battle-canvas', {
    timeout: 40_000,
    minDistinctColors: 3,
  })
  expect(info.nonBlank, `battle canvas appears blank: ${JSON.stringify(info)}`).toBeTruthy()

  // Drive a short firefight: focus the canvas, move + hold both fire buttons so the
  // AI engages and the projectile/damage pipeline runs. No pixel/HP asserts — the
  // goal is that active combat produces no uncaught errors or crashes.
  await canvas.click({ position: { x: 640, y: 360 } }).catch(() => {})
  await page.keyboard.down('KeyW')
  await page.mouse.down({ button: 'left' })
  await page.mouse.down({ button: 'right' })
  await page.waitForTimeout(2500)
  await page.mouse.up({ button: 'left' })
  await page.mouse.up({ button: 'right' })
  await page.keyboard.up('KeyW')
  await page.waitForTimeout(400)

  // Still rendering after combat.
  const afterBytes = await canvasScreenshotBytes(page, 'canvas.battle-canvas')
  expect(afterBytes, `battle canvas blank after firefight: ${afterBytes} bytes`).toBeGreaterThanOrEqual(
    NON_BLANK_PNG_BYTES,
  )

  await page.screenshot({ path: 'e2e/screenshots/grinder-firefight.png' })
  await page.screenshot({ path: testInfo.outputPath('grinder-firefight.png') })

  expect(watcher.crashes, `page crashes/exceptions:\n${watcher.crashes.join('\n')}`).toEqual([])
  expect(watcher.errors, `severe console errors during firefight:\n${watcher.errors.join('\n')}`).toEqual([])
})

/**
 * (d) Save/load: a mid-run reload restores the run via Continue.
 */
test('grinder: reload mid-run resumes via Continue (save/load)', async ({ page }, testInfo) => {
  const watcher = watchConsole(page)

  await page.goto('story', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: /talus reach/i })).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: /new run/i }).click()

  // Roam so the run is live and persisted.
  const canvas = page.locator('canvas.story-canvas')
  await expect(canvas).toBeVisible({ timeout: 30_000 })
  await waitForCanvasRender(page, 'canvas.story-canvas', { timeout: 40_000, minDistinctColors: 3 })
  await expect(page.locator('.hud-phase')).toContainText(/held/i)

  // A save exists in localStorage.
  const hasSave = await page.evaluate(() => localStorage.getItem('mech-story-v1') !== null)
  expect(hasSave, 'expected a persisted save after starting a run').toBe(true)

  // Reload to the intro; the saved run offers Continue.
  await page.goto('story', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: /talus reach/i })).toBeVisible({ timeout: 30_000 })
  const continueBtn = page.getByRole('button', { name: /continue run/i })
  await expect(continueBtn).toBeVisible({ timeout: 15_000 })
  await continueBtn.click()

  // The restored run roams again with a rendering world and a live HUD.
  await expect(canvas).toBeVisible({ timeout: 30_000 })
  const info = await waitForCanvasRender(page, 'canvas.story-canvas', {
    timeout: 40_000,
    minDistinctColors: 3,
  })
  expect(info.nonBlank, `resumed story canvas appears blank: ${JSON.stringify(info)}`).toBeTruthy()
  await expect(page.locator('.hud-phase')).toContainText(/held/i)

  await page.screenshot({ path: 'e2e/screenshots/grinder-continue.png' })
  await page.screenshot({ path: testInfo.outputPath('grinder-continue.png') })

  expect(watcher.crashes, `page crashes/exceptions:\n${watcher.crashes.join('\n')}`).toEqual([])
  expect(watcher.errors, `severe console errors:\n${watcher.errors.join('\n')}`).toEqual([])
})
