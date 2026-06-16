import type { Page, ConsoleMessage } from '@playwright/test'

/**
 * Console-error collector for playtests.
 *
 * The app emits plenty of benign `console.log`/`console.warn` noise (battle
 * lifecycle logs, three.js info, etc). We only want to fail on genuine problems:
 * real `console.error` output, uncaught page exceptions, and page crashes — and
 * even then we filter out a small set of known-benign messages.
 */

// Substrings that mark a console.error as benign in this environment.
const BENIGN_ERROR_PATTERNS: RegExp[] = [
  // Headless software-GL chatter from three.js / Chromium.
  /WebGL.*deprecated/i,
  /Automatic fallback to software WebGL/i,
  /SwiftShader/i,
  /GroupMarkerNotSet/i,
  /Failed to create WebGL/i, // tolerated; the render-check assertions catch real blank canvases
  /THREE\.WebGLRenderer: Context Lost/i,
  // Network calls to the (absent) game backend — Story Mode is client-only but
  // some shared modules may probe /api or /ws; those are not playtest failures.
  /Failed to load resource.*\/(api|ws)\b/i,
  /net::ERR_CONNECTION_REFUSED/i,
  /the server responded with a status of 50\d/i,
  /WebSocket connection to .* failed/i,
  // Vue Router hydration/no-match warnings are warnings, not errors, but guard anyway.
  /\[Vue Router warn\]/i,
  // Favicon etc.
  /favicon\.ico/i,
]

export interface ConsoleWatcher {
  /** Real, non-benign errors collected so far. */
  errors: string[]
  /** Page crashes / uncaught exceptions. */
  crashes: string[]
}

export function watchConsole(page: Page): ConsoleWatcher {
  const watcher: ConsoleWatcher = { errors: [], crashes: [] }

  const isBenign = (text: string) =>
    BENIGN_ERROR_PATTERNS.some((re) => re.test(text))

  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() !== 'error') return
    const text = msg.text()
    if (isBenign(text)) return
    watcher.errors.push(text)
  })

  page.on('pageerror', (err: Error) => {
    const text = `${err.name}: ${err.message}`
    if (isBenign(text)) return
    watcher.crashes.push(text)
  })

  page.on('crash', () => {
    watcher.crashes.push('PAGE CRASHED')
  })

  return watcher
}

/**
 * Reads back the pixels of a canvas and reports whether the rendered image is
 * effectively blank/uniform. Works for both WebGL and 2D canvases:
 *  - For WebGL we use `preserveDrawingBuffer`-independent readback via drawing
 *    the canvas onto a 2D scratch canvas (toDataURL of the live canvas), then
 *    sampling pixels.
 *  - We compute the number of *distinct-ish* colors among sampled pixels.
 */
export async function canvasRenderInfo(
  page: Page,
  selector: string,
): Promise<{ found: boolean; width: number; height: number; uniform: boolean; distinctColors: number }> {
  return page.evaluate((sel) => {
    const canvas = document.querySelector(sel) as HTMLCanvasElement | null
    if (!canvas) return { found: false, width: 0, height: 0, uniform: true, distinctColors: 0 }

    const w = canvas.width
    const h = canvas.height
    if (w === 0 || h === 0) return { found: true, width: w, height: h, uniform: true, distinctColors: 0 }

    // Draw the live canvas (WebGL or 2D) onto a scratch 2D canvas so we can read pixels.
    const scratch = document.createElement('canvas')
    scratch.width = w
    scratch.height = h
    const ctx = scratch.getContext('2d')
    if (!ctx) return { found: true, width: w, height: h, uniform: true, distinctColors: 0 }

    try {
      ctx.drawImage(canvas, 0, 0)
    } catch {
      return { found: true, width: w, height: h, uniform: true, distinctColors: 0 }
    }

    let data: Uint8ClampedArray
    try {
      data = ctx.getImageData(0, 0, w, h).data
    } catch {
      return { found: true, width: w, height: h, uniform: true, distinctColors: 0 }
    }

    // Sample on a grid and count quantized distinct colors.
    const seen = new Set<string>()
    const stepX = Math.max(1, Math.floor(w / 40))
    const stepY = Math.max(1, Math.floor(h / 40))
    for (let y = 0; y < h; y += stepY) {
      for (let x = 0; x < w; x += stepX) {
        const i = (y * w + x) * 4
        // Quantize to reduce noise from gradients/anti-aliasing.
        const r = data[i] >> 4
        const g = data[i + 1] >> 4
        const b = data[i + 2] >> 4
        seen.add(`${r},${g},${b}`)
      }
    }

    return {
      found: true,
      width: w,
      height: h,
      uniform: seen.size <= 1,
      distinctColors: seen.size,
    }
  }, selector)
}

/**
 * Waits until a canvas matching `selector` exists, is sized, and is rendering
 * more than a single flat color (i.e. three.js has drawn a frame). Returns the
 * final render info. Throws via the caller's assertion if it never renders.
 */
export async function waitForCanvasRender(
  page: Page,
  selector: string,
  opts: { timeout?: number; minDistinctColors?: number } = {},
): Promise<{ found: boolean; width: number; height: number; uniform: boolean; distinctColors: number }> {
  const timeout = opts.timeout ?? 30_000
  const minDistinct = opts.minDistinctColors ?? 2
  const deadline = Date.now() + timeout
  let last = { found: false, width: 0, height: 0, uniform: true, distinctColors: 0 }

  while (Date.now() < deadline) {
    last = await canvasRenderInfo(page, selector)
    if (last.found && last.width > 0 && last.distinctColors >= minDistinct) {
      return last
    }
    await page.waitForTimeout(500)
  }
  return last
}
