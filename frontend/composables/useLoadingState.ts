import { ref, type Ref } from 'vue'

export interface LoadingStateOptions {
  onError?: (error: Error) => void
  onSuccess?: () => void
}

export function useLoadingState(options: LoadingStateOptions = {}) {
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  /**
   * Execute an async function with automatic loading state management
   * @param fn - The async function to execute
   * @returns The result of the function or null if an error occurred
   */
  const execute = async <T>(fn: () => Promise<T>): Promise<T | null> => {
    loading.value = true
    error.value = null

    try {
      const result = await fn()

      if (options.onSuccess) {
        options.onSuccess()
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      error.value = errorMessage

      if (options.onError && err instanceof Error) {
        options.onError(err)
      }

      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Execute an async function without returning a value
   * Useful for fire-and-forget operations
   */
  const executeVoid = async (fn: () => Promise<void>): Promise<boolean> => {
    const result = await execute(fn)
    return result !== null
  }

  /**
   * Reset the error state
   */
  const reset = () => {
    error.value = null
  }

  /**
   * Clear both loading and error states
   */
  const clear = () => {
    loading.value = false
    error.value = null
  }

  /**
   * Manually set loading state
   */
  const setLoading = (value: boolean) => {
    loading.value = value
  }

  /**
   * Manually set error state
   */
  const setError = (message: string | null) => {
    error.value = message
  }

  return {
    loading,
    error,
    execute,
    executeVoid,
    reset,
    clear,
    setLoading,
    setError
  }
}
