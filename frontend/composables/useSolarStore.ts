import { ref } from 'vue'
import type { SolarResults } from './useSolarCalculator'

// Module-level shared state — singleton across all callers
const solarResults = ref<SolarResults | null>(null)

export function useSolarStore() {
  function setSolarResults(results: SolarResults | null) {
    solarResults.value = results
  }

  function clear() {
    solarResults.value = null
  }

  return {
    solarResults,
    setSolarResults,
    clear
  }
}
