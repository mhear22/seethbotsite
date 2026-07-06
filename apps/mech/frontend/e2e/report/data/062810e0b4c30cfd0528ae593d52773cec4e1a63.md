# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: story-mode.spec.ts >> story mode starts a run and renders the 3D world
- Location: e2e/story-mode.spec.ts:14:1

# Error details

```
Error: story canvas appears blank/uniform (distinctColors=1). This indicates headless WebGL did not render. Full info: {"found":true,"width":1280,"height":720,"uniform":true,"distinctColors":1}

expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 3
Received:    1
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]: ◈ 0
    - generic [ref=e5]: Deployment · 0/3 held
  - generic [ref=e6]:
    - generic [ref=e7]:
      - generic [ref=e8]: Warden's Rest
      - generic [ref=e9]: Cold
    - generic [ref=e10]:
      - generic "Command reputation (global)" [ref=e11]:
        - generic [ref=e12]: CMD
        - text: "50"
      - generic "Town standing (this settlement)" [ref=e13]:
        - generic [ref=e14]: TOWN
        - text: "0"
    - generic [ref=e15]:
      - generic [ref=e16]: Condition
      - generic [ref=e19]: 100%
    - generic [ref=e20]:
      - generic [ref=e21]: Standing
      - generic [ref=e23]: 0 / 100
    - generic [ref=e24]: 330m to settlement
  - generic [ref=e25]: WASD move · Mouse look · Shift dash · Space jump · LMB/RMB fire · E dismount
  - button "Exit to Menu" [ref=e26] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | import { watchConsole, waitForCanvasRender, canvasRenderInfo } from './helpers'
  3   | 
  4   | /**
  5   |  * Smoke playtest for Story Mode (single-player, client-only).
  6   |  *
  7   |  * Flow:
  8   |  *  1. Navigate directly to the /story route.
  9   |  *  2. Start a New Run.
  10  |  *  3. Wait for the 3D story canvas to appear and actually RENDER (non-blank).
  11  |  *  4. Drive movement (hold 'w' ~1s) and capture before/after screenshots.
  12  |  *  5. Assert no severe console errors during play.
  13  |  */
  14  | test('story mode starts a run and renders the 3D world', async ({ page }, testInfo) => {
  15  |   const watcher = watchConsole(page)
  16  | 
  17  |   // Use a relative path so it resolves against the `/mech/` baseURL (the prod
  18  |   // build serves under `/mech/`; a leading-slash path would 404).
  19  |   await page.goto('story', { waitUntil: 'domcontentloaded' })
  20  | 
  21  |   // Intro screen.
  22  |   await expect(page.getByRole('heading', { name: /talus reach/i })).toBeVisible({ timeout: 30_000 })
  23  | 
  24  |   const newRunBtn = page.getByRole('button', { name: /new run/i })
  25  |   await expect(newRunBtn).toBeVisible()
  26  |   await newRunBtn.click()
  27  | 
  28  |   // The story canvas appears once roaming begins.
  29  |   const canvas = page.locator('canvas.story-canvas')
  30  |   await expect(canvas).toBeVisible({ timeout: 30_000 })
  31  | 
  32  |   // Wait for three.js to render a non-blank frame.
  33  |   const info = await waitForCanvasRender(page, 'canvas.story-canvas', {
  34  |     timeout: 40_000,
  35  |     minDistinctColors: 3,
  36  |   })
  37  | 
  38  |   // Always capture the "before" screenshot for artifacts, even on failure paths.
  39  |   await page.screenshot({ path: 'e2e/screenshots/story-before.png' })
  40  |   await page.screenshot({ path: testInfo.outputPath('story-before.png') })
  41  | 
  42  |   expect(
  43  |     info.found && info.width > 0,
  44  |     `story canvas missing or unsized: ${JSON.stringify(info)}`,
  45  |   ).toBeTruthy()
  46  | 
  47  |   // The core render assertion: canvas is not a single flat color.
  48  |   expect(
  49  |     info.distinctColors,
  50  |     `story canvas appears blank/uniform (distinctColors=${info.distinctColors}). ` +
  51  |       `This indicates headless WebGL did not render. Full info: ${JSON.stringify(info)}`,
> 52  |   ).toBeGreaterThanOrEqual(3)
      |     ^ Error: story canvas appears blank/uniform (distinctColors=1). This indicates headless WebGL did not render. Full info: {"found":true,"width":1280,"height":720,"uniform":true,"distinctColors":1}
  53  | 
  54  |   // Focus the canvas/world and drive forward movement (W) for ~1s.
  55  |   await canvas.click({ position: { x: 640, y: 360 } }).catch(() => {})
  56  |   await page.keyboard.down('KeyW')
  57  |   await page.waitForTimeout(1100)
  58  |   await page.keyboard.up('KeyW')
  59  | 
  60  |   // Let a few more frames render after movement.
  61  |   await page.waitForTimeout(600)
  62  |   const after = await canvasRenderInfo(page, 'canvas.story-canvas')
  63  | 
  64  |   await page.screenshot({ path: 'e2e/screenshots/story-after.png' })
  65  |   await page.screenshot({ path: testInfo.outputPath('story-after.png') })
  66  | 
  67  |   expect(
  68  |     after.distinctColors,
  69  |     `story canvas blank after movement: ${JSON.stringify(after)}`,
  70  |   ).toBeGreaterThanOrEqual(3)
  71  | 
  72  |   expect(watcher.crashes, `page crashes/exceptions:\n${watcher.crashes.join('\n')}`).toEqual([])
  73  |   expect(watcher.errors, `severe console errors during play:\n${watcher.errors.join('\n')}`).toEqual([])
  74  | })
  75  | 
  76  | /**
  77  |  * Phase 4 dismount loop smoke (design §4). Reaching a town on foot by dead-
  78  |  * reckoning across the 600u overworld is too fragile for a headless smoke, so we
  79  |  * exercise the on-foot ↔ Frame transition through the §4 persistence seam: a fresh
  80  |  * New Run writes a valid save, we patch its additive on-foot fields to place the
  81  |  * pilot dismounted beside the parked Frame at town-0, Continue restores the hub,
  82  |  * then we walk and remount. This drives the real HUD swap, on-foot locomotion and
  83  |  * mount() in the browser.
  84  |  *
  85  |  * Flow:
  86  |  *  1. New Run (persists a valid v3 save).
  87  |  *  2. Reload to the intro (no world loop -> safe to patch localStorage).
  88  |  *  3. Patch the save: pilotMode='onFoot', at town-0, Frame parked at its centre.
  89  |  *  4. Continue Run -> world restores the pilot on foot at the parked Frame.
  90  |  *  5. Assert the on-foot controls hint, walk ~2s (out and back), remount with F.
  91  |  *  6. Assert the hint flips back to the in-Frame verbs; no severe console errors.
  92  |  */
  93  | test('story mode: dismount hub restores, walks, and remounts the Frame (§4)', async ({ page }, testInfo) => {
  94  |   const watcher = watchConsole(page)
  95  | 
  96  |   // 1. Fresh New Run -> a valid save lands in localStorage.
  97  |   await page.goto('story', { waitUntil: 'domcontentloaded' })
  98  |   await expect(page.getByRole('heading', { name: /talus reach/i })).toBeVisible({ timeout: 30_000 })
  99  |   await page.getByRole('button', { name: /new run/i }).click()
  100 |   await expect(page.locator('canvas.story-canvas')).toBeVisible({ timeout: 30_000 })
  101 |   await waitForCanvasRender(page, 'canvas.story-canvas', { timeout: 40_000, minDistinctColors: 3 })
  102 | 
  103 |   // 2. Reload to the intro screen: with no StoryWorld loop running, patching the
  104 |   //    save cannot race a decay/teardown autosave.
  105 |   await page.goto('story', { waitUntil: 'domcontentloaded' })
  106 |   await expect(page.getByRole('heading', { name: /talus reach/i })).toBeVisible({ timeout: 30_000 })
  107 | 
  108 |   // 3. Patch the additive on-foot fields (§4 persistence). town-0's centre is
  109 |   //    townSpawnPosition(0) = [330, 0, 0]; parking the Frame there spawns the pilot
  110 |   //    beside it so the F-remount affordance is live immediately.
  111 |   const patched = await page.evaluate(() => {
  112 |     const KEY = 'mech-story-v1'
  113 |     const raw = localStorage.getItem(KEY)
  114 |     if (!raw) return false
  115 |     const run = JSON.parse(raw)
  116 |     run.pilotMode = 'onFoot'
  117 |     run.onFootTownId = 'town-0'
  118 |     run.mechPark = [330, 0, 0]
  119 |     localStorage.setItem(KEY, JSON.stringify(run))
  120 |     return true
  121 |   })
  122 |   expect(patched, 'New Run did not persist a save to patch').toBe(true)
  123 | 
  124 |   // 4. Continue Run -> restoreOnFoot places the pilot on foot at the parked Frame.
  125 |   const continueBtn = page.getByRole('button', { name: /continue run/i })
  126 |   await expect(continueBtn).toBeVisible({ timeout: 30_000 })
  127 |   await continueBtn.click()
  128 | 
  129 |   const canvas = page.locator('canvas.story-canvas')
  130 |   await expect(canvas).toBeVisible({ timeout: 30_000 })
  131 |   await waitForCanvasRender(page, 'canvas.story-canvas', { timeout: 40_000, minDistinctColors: 3 })
  132 | 
  133 |   // On foot: the controls hint switches to the pedestrian verbs (§4.1).
  134 |   const hint = page.locator('.story-controls-hint')
  135 |   await expect(hint).toContainText('F mount up', { timeout: 15_000 })
  136 | 
  137 |   await page.screenshot({ path: 'e2e/screenshots/story-onfoot.png' })
  138 |   await page.screenshot({ path: testInfo.outputPath('story-onfoot.png') })
  139 | 
  140 |   // 5. Walk the decay-free hub (§4.2): out for ~1s, then back so the pilot returns
  141 |   //    within the parked-Frame remount radius (~8u).
  142 |   await canvas.click({ position: { x: 640, y: 360 } }).catch(() => {})
  143 |   await page.keyboard.down('KeyW')
  144 |   await page.waitForTimeout(1000)
  145 |   await page.keyboard.up('KeyW')
  146 |   await page.keyboard.down('KeyS')
  147 |   await page.waitForTimeout(1100)
  148 |   await page.keyboard.up('KeyS')
  149 |   await page.waitForTimeout(400)
  150 | 
  151 |   // 6. Remount the parked Frame (F) -> back in the cockpit; the hint flips back.
  152 |   await page.keyboard.press('KeyF')
```