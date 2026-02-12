import { ref, computed, type Ref } from 'vue'

export interface HourlyDataPoint {
  hour: number
  solarKW: number
  usageKW: number
  batteryKWh: number
}

export function useBatteryChart(
  hourlyData: Ref<HourlyDataPoint[]>,
  solarKWAtTime: (time: number, estimatedKW: number) => number,
  estimatedKW: Ref<number>
) {
  // Chart layout constants
  const CL = 55  // Chart Left
  const CR = 745 // Chart Right
  const CT = 15  // Chart Top
  const CB = 275 // Chart Bottom
  const CW = CR - CL // Chart Width
  const CH = CB - CT // Chart Height

  // Hover state
  const hoverHour = ref<number | null>(null)

  // Hour labels for x-axis
  const chartHourLabels = [0, 3, 6, 9, 12, 15, 18, 21, 24]

  // Coordinate transformations
  function hourToX(h: number): number {
    return CL + (h / 24) * CW
  }

  // Max values for scaling
  const maxKW = computed(() => {
    const m = Math.max(...hourlyData.value.map(p => Math.max(p.solarKW, p.usageKW)))
    return Math.max(m * 1.15, 0.5)
  })

  const maxKWh = computed(() => {
    const m = Math.max(...hourlyData.value.map(p => p.batteryKWh))
    return Math.max(m * 1.15, 0.5)
  })

  function kwToY(v: number): number {
    return CB - (v / maxKW.value) * CH
  }

  function kwhToY(v: number): number {
    return CB - (v / maxKWh.value) * CH
  }

  // SVG path for solar area
  const solarAreaPath = computed(() => {
    let d = `M ${CL} ${CB}`
    for (let t = 0; t <= 24; t += 0.25) {
      const solar = solarKWAtTime(t, estimatedKW.value)
      d += ` L ${hourToX(t).toFixed(1)} ${kwToY(solar).toFixed(1)}`
    }
    d += ` L ${CR} ${CB} Z`
    return d
  })

  // Polyline points for battery level
  const batteryLinePoints = computed(() => {
    return hourlyData.value
      .map(p => `${hourToX(p.hour).toFixed(1)},${kwhToY(p.batteryKWh).toFixed(1)}`)
      .join(' ')
  })

  // Polyline points for usage
  const usageLinePoints = computed(() => {
    return hourlyData.value
      .map(p => `${hourToX(p.hour).toFixed(1)},${kwToY(p.usageKW).toFixed(1)}`)
      .join(' ')
  })

  // Hover data
  const hoverData = computed(() => {
    if (hoverHour.value === null) return null
    return hourlyData.value[hoverHour.value] ?? null
  })

  // Tooltip position
  const tooltipX = computed(() => {
    if (hoverHour.value === null) return 0
    const x = hourToX(hoverHour.value)
    return x > CR - 175 ? x - 170 : x + 12
  })

  // Handle chart hover
  function onChartHover(event: MouseEvent) {
    const svg = event.currentTarget as SVGSVGElement
    const rect = svg.getBoundingClientRect()
    const x = event.clientX - rect.left
    const svgX = (x / rect.width) * 800
    const hour = Math.round(((svgX - CL) / CW) * 24)
    hoverHour.value = (hour >= 0 && hour <= 24) ? hour : null
  }

  // Format hour for display
  function formatHour(h: number): string {
    if (h === 0 || h === 24) return '12am'
    if (h === 12) return '12pm'
    return h < 12 ? h + 'am' : (h - 12) + 'pm'
  }

  return {
    // Constants
    CL,
    CR,
    CT,
    CB,
    CW,
    CH,

    // State
    hoverHour,
    chartHourLabels,

    // Computed
    maxKW,
    maxKWh,
    solarAreaPath,
    batteryLinePoints,
    usageLinePoints,
    hoverData,
    tooltipX,

    // Methods
    hourToX,
    kwToY,
    kwhToY,
    onChartHover,
    formatHour
  }
}
