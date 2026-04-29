/**
 * usePolling Composable
 *
 * Reusable polling logic with support for fixed intervals and adaptive backoff.
 * Automatically handles cleanup on component unmount.
 * Includes visibility-based pausing to save resources when tab is not active.
 */

import { ref, onUnmounted, onMounted } from 'vue'
import type { Ref } from 'vue';

export interface PollingOptions {
  /**
   * Polling mode
   * - 'fixed': Poll at a constant interval
   * - 'adaptive': Use exponential backoff when data doesn't change
   */
  mode?: 'fixed' | 'adaptive';

  /**
   * Initial interval in milliseconds (default: 5000ms for fixed, 1000ms for adaptive)
   */
  initialInterval?: number;

  /**
   * Maximum interval in milliseconds for adaptive mode (default: 30000ms)
   */
  maxInterval?: number;

  /**
   * Minimum interval in milliseconds for adaptive mode (default: 1000ms)
   */
  minInterval?: number;

  /**
   * Multiplier for adaptive backoff (default: 2)
   */
  backoffMultiplier?: number;

  /**
   * Compare function to detect if data has changed (for adaptive mode)
   * Returns true if data is unchanged
   */
  isUnchanged?: (prev: any, next: any) => boolean;

  /**
   * Whether to start polling immediately (default: true)
   */
  autoStart?: boolean;

  /**
   * Whether to pause polling when tab is not visible (default: true)
   */
  pauseOnHidden?: boolean;
}

export interface PollingControls<T> {
  /**
   * Current data from the polling function
   */
  data: Ref<T | null>;

  /**
   * Whether polling is currently active
   */
  isPolling: Ref<boolean>;

  /**
   * Any error that occurred during polling
   */
  error: Ref<Error | null>;

  /**
   * Current polling interval (useful for debugging adaptive mode)
   */
  currentInterval: Ref<number>;

  /**
   * Start polling
   */
  start: () => void;

  /**
   * Stop polling
   */
  stop: () => void;

  /**
   * Manually trigger a poll
   */
  poll: () => Promise<void>;
}

/**
 * Create a polling mechanism for a data fetching function
 *
 * @param fetchFn - Async function that fetches data
 * @param options - Polling configuration options
 * @returns Controls for the polling mechanism
 */
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  options: PollingOptions = {}
): PollingControls<T> {
  const {
    mode = 'fixed',
    initialInterval = mode === 'adaptive' ? 1000 : 5000,
    maxInterval = 30000,
    minInterval = 1000,
    backoffMultiplier = 2,
    isUnchanged = (prev, next) => {
      // Fast path for primitives and null
      if (prev === next) return true;
      if (prev == null || next == null) return prev === next;
      if (typeof prev !== 'object' || typeof next !== 'object') return prev === next;

      // For objects/arrays, use JSON.stringify as fallback
      // (Deep comparison would be slower for most real-world cases)
      try {
        return JSON.stringify(prev) === JSON.stringify(next);
      } catch {
        return false;
      }
    },
    autoStart = true,
    pauseOnHidden = true
  } = options;

  const data = ref<T | null>(null) as Ref<T | null>;
  const isPolling = ref(false);
  const error = ref<Error | null>(null);
  const currentInterval = ref(initialInterval);

  let timeoutId: number | null = null;
  let previousData: T | null = null;
  let wasPollingBeforeHidden = false;

  /**
   * Execute the fetch function and handle the result
   */
  const poll = async (): Promise<void> => {
    try {
      error.value = null;
      const result = await fetchFn();
      data.value = result;

      // Adaptive interval adjustment
      if (mode === 'adaptive') {
        if (previousData !== null && isUnchanged(previousData, result)) {
          // Data unchanged - increase interval (backoff)
          currentInterval.value = Math.min(
            currentInterval.value * backoffMultiplier,
            maxInterval
          );
        } else {
          // Data changed - reset to minimum interval
          currentInterval.value = minInterval;
        }
        previousData = result;
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Polling error');
      console.error('Polling error:', err);
    }
  };

  /**
   * Schedule the next poll
   */
  const scheduleNext = (): void => {
    if (isPolling.value) {
      timeoutId = window.setTimeout(async () => {
        await poll();
        scheduleNext();
      }, currentInterval.value);
    }
  };

  /**
   * Start polling
   */
  const start = (): void => {
    if (!isPolling.value) {
      isPolling.value = true;
      poll().then(scheduleNext);
    }
  };

  /**
   * Stop polling
   */
  const stop = (): void => {
    isPolling.value = false;
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  /**
   * Handle visibility change
   */
  const handleVisibilityChange = (): void => {
    if (!pauseOnHidden) return;

    if (document.hidden) {
      // Tab is hidden - pause polling
      wasPollingBeforeHidden = isPolling.value;
      if (isPolling.value) {
        stop();
      }
    } else {
      // Tab is visible again - resume polling if it was active before
      if (wasPollingBeforeHidden) {
        start();
      }
    }
  };

  // Setup visibility listener
  onMounted(() => {
    if (pauseOnHidden) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
  });

  // Auto-start if enabled
  if (autoStart) {
    start();
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stop();
    if (pauseOnHidden) {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  });

  return {
    data,
    isPolling,
    error,
    currentInterval,
    start,
    stop,
    poll
  };
}
