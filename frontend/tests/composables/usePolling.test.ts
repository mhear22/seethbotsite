/**
 * Tests for usePolling composable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, createApp } from 'vue'
import { usePolling } from '../../composables/usePolling'
import type { PollingOptions, PollingControls } from '../../composables/usePolling'

/**
 * Helper to mount a composable within a proper Vue component context.
 * Required because usePolling uses onUnmounted.
 */
function withSetup<T>(composable: () => T) {
  let result: T
  const app = createApp(
    defineComponent({
      setup() {
        result = composable()
        return () => {}
      },
    })
  )
  const root = document.createElement('div')
  app.mount(root)
  return { result: result!, app, root }
}

/**
 * Flush pending microtasks (resolved promises) without advancing timers.
 */
function flushPromises() {
  return new Promise<void>(resolve => {
    setTimeout(resolve, 0)
    vi.advanceTimersByTime(1)
  })
}

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('auto-starts by default', () => {
    const fetchFn = vi.fn().mockResolvedValue('data')

    const { result, app } = withSetup(() => usePolling(fetchFn))

    expect(result.isPolling.value).toBe(true)
    expect(fetchFn).toHaveBeenCalledTimes(1)

    result.stop()
    app.unmount()
  })

  it('does not auto-start when autoStart is false', () => {
    const fetchFn = vi.fn().mockResolvedValue('data')

    const { result, app } = withSetup(() =>
      usePolling(fetchFn, { autoStart: false })
    )

    expect(result.isPolling.value).toBe(false)
    expect(fetchFn).not.toHaveBeenCalled()

    app.unmount()
  })

  it('poll() fetches data and sets it', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ items: [1, 2, 3] })

    const { result, app } = withSetup(() =>
      usePolling(fetchFn, { autoStart: false })
    )

    await result.poll()

    expect(result.data.value).toEqual({ items: [1, 2, 3] })
    expect(result.error.value).toBeNull()

    app.unmount()
  })

  it('poll() sets error on fetch failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const fetchFn = vi.fn().mockRejectedValue(new Error('fetch failed'))

    const { result, app } = withSetup(() =>
      usePolling(fetchFn, { autoStart: false })
    )

    await result.poll()

    expect(result.error.value).toBeInstanceOf(Error)
    expect(result.error.value!.message).toBe('fetch failed')

    consoleSpy.mockRestore()
    app.unmount()
  })

  it('start() begins polling', async () => {
    const fetchFn = vi.fn().mockResolvedValue('data')

    const { result, app } = withSetup(() =>
      usePolling(fetchFn, { autoStart: false })
    )

    expect(result.isPolling.value).toBe(false)

    result.start()

    expect(result.isPolling.value).toBe(true)
    expect(fetchFn).toHaveBeenCalledTimes(1)

    result.stop()
    app.unmount()
  })

  it('stop() stops polling', async () => {
    const fetchFn = vi.fn().mockResolvedValue('data')

    const { result, app } = withSetup(() =>
      usePolling(fetchFn, { autoStart: false, initialInterval: 5000 })
    )

    result.start()
    expect(result.isPolling.value).toBe(true)

    // Let the initial poll() promise resolve (flush microtasks)
    await flushPromises()

    // fetchFn called once for the initial poll
    expect(fetchFn).toHaveBeenCalledTimes(1)

    result.stop()
    expect(result.isPolling.value).toBe(false)

    // Advance time well past the interval -- no more fetches should occur
    vi.advanceTimersByTime(20000)
    await flushPromises()

    expect(fetchFn).toHaveBeenCalledTimes(1)

    app.unmount()
  })

  it('fixed mode uses constant interval', async () => {
    const fetchFn = vi.fn().mockResolvedValue('data')

    const { result, app } = withSetup(() =>
      usePolling(fetchFn, {
        autoStart: false,
        mode: 'fixed',
        initialInterval: 3000,
      })
    )

    result.start()

    // First poll called immediately
    expect(fetchFn).toHaveBeenCalledTimes(1)

    // Let the initial poll promise resolve so scheduleNext fires
    await vi.advanceTimersByTimeAsync(0)

    // The interval should remain constant in fixed mode
    expect(result.currentInterval.value).toBe(3000)

    // Advance past one interval to trigger the next poll cycle
    // advanceTimersByTimeAsync handles the async setTimeout callback + promise chain
    await vi.advanceTimersByTimeAsync(3000)

    expect(fetchFn).toHaveBeenCalledTimes(2)
    // Interval should still be the same fixed value
    expect(result.currentInterval.value).toBe(3000)

    result.stop()
    app.unmount()
  })

  it('adaptive mode resets interval on data change', async () => {
    let callCount = 0
    const fetchFn = vi.fn().mockImplementation(async () => {
      callCount++
      return { value: callCount } // Different data each time
    })

    const { result, app } = withSetup(() =>
      usePolling(fetchFn, {
        autoStart: false,
        mode: 'adaptive',
        initialInterval: 1000,
        minInterval: 1000,
        maxInterval: 30000,
        backoffMultiplier: 2,
      })
    )

    // First poll - previousData is null, so it sets previousData
    await result.poll()
    // After first poll with no previous data, adaptive resets to minInterval
    expect(result.currentInterval.value).toBe(1000)

    // Second poll with different data - should reset to minInterval
    await result.poll()
    expect(result.currentInterval.value).toBe(1000)

    app.unmount()
  })

  it('adaptive mode increases interval on unchanged data', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ value: 'same' })

    const { result, app } = withSetup(() =>
      usePolling(fetchFn, {
        autoStart: false,
        mode: 'adaptive',
        initialInterval: 1000,
        minInterval: 1000,
        maxInterval: 30000,
        backoffMultiplier: 2,
      })
    )

    // First poll: previousData is null, sets previousData = {value: 'same'}
    await result.poll()
    expect(result.currentInterval.value).toBe(1000)

    // Second poll: same data as previous, should backoff
    await result.poll()
    expect(result.currentInterval.value).toBe(2000)

    // Third poll: still same, should backoff again
    await result.poll()
    expect(result.currentInterval.value).toBe(4000)

    app.unmount()
  })

  it('adaptive interval capped at maxInterval', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ value: 'same' })

    const { result, app } = withSetup(() =>
      usePolling(fetchFn, {
        autoStart: false,
        mode: 'adaptive',
        initialInterval: 1000,
        minInterval: 1000,
        maxInterval: 5000,
        backoffMultiplier: 3,
      })
    )

    // First poll: sets previousData
    await result.poll()
    expect(result.currentInterval.value).toBe(1000)

    // Second poll: same data, 1000 * 3 = 3000
    await result.poll()
    expect(result.currentInterval.value).toBe(3000)

    // Third poll: same data, 3000 * 3 = 9000 but capped at 5000
    await result.poll()
    expect(result.currentInterval.value).toBe(5000)

    app.unmount()
  })

  it('default isUnchanged uses JSON.stringify comparison', async () => {
    const fetchFn = vi.fn().mockImplementation(async () => {
      // Return structurally identical objects (different references)
      return { a: 1, b: 'hello' }
    })

    const { result, app } = withSetup(() =>
      usePolling(fetchFn, {
        autoStart: false,
        mode: 'adaptive',
        initialInterval: 1000,
        minInterval: 1000,
        maxInterval: 30000,
        backoffMultiplier: 2,
      })
    )

    // First poll: previousData is null
    await result.poll()
    expect(result.currentInterval.value).toBe(1000)

    // Second poll: same structure, different reference - should be detected as unchanged
    await result.poll()
    expect(result.currentInterval.value).toBe(2000)

    app.unmount()
  })

  it('cleanup on stop clears timeout', async () => {
    const fetchFn = vi.fn().mockResolvedValue('data')

    const { result, app } = withSetup(() =>
      usePolling(fetchFn, { autoStart: false, initialInterval: 5000 })
    )

    result.start()

    // Let the initial poll() promise resolve so scheduleNext sets a timeout
    await flushPromises()

    // At this point a timeout has been scheduled and isPolling is true
    expect(result.isPolling.value).toBe(true)
    expect(fetchFn).toHaveBeenCalledTimes(1)

    result.stop()

    expect(result.isPolling.value).toBe(false)

    // Verify the timeout was cleared by advancing time past the interval
    // If the timeout was properly cleared, no additional polls should fire
    vi.advanceTimersByTime(10000)
    await flushPromises()

    // fetchFn should still only have been called once (the initial poll)
    expect(fetchFn).toHaveBeenCalledTimes(1)

    app.unmount()
  })
})
