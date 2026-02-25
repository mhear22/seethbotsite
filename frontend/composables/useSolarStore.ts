import { ref } from 'vue'
import type { Point, SolarResults } from './useSolarCalculator'

// Module-level shared state — singleton across all callers
const solarResults = ref<SolarResults | null>(null)
const roofVertices = ref<Point[]>([])

export function useSolarStore() {
  function setSolarResults(results: SolarResults | null) {
    solarResults.value = results
  }

  function setRoofVertices(vertices: Point[], isClosed = true) {
    roofVertices.value = isClosed ? vertices.map((vertex) => ({ ...vertex })) : []
  }

  function clear() {
    solarResults.value = null
    roofVertices.value = []
  }

  return {
    solarResults,
    roofVertices,
    setSolarResults,
    setRoofVertices,
    clear
  }
}
