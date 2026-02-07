import { ref, computed } from 'vue'

export interface BatteryPreset {
  id: string
  name: string
  capacityKWh: number
  powerKW: number
  efficiency: number
  warrantyYears: number
  chemistry: string
}

export interface SelectedBattery {
  battery: BatteryPreset
  quantity: number
}

export interface BatterySettings {
  peakSunHours: number
  dailyUsageKWh: number
  daysOfAutonomy: number
  daylightHours: number
}

export interface BatteryResults {
  dailyGeneration: number
  bestCaseStorage: number
  worstCaseStorage: number
  totalCapacity: number
  totalPower: number
  bestCaseCoverage: number
  worstCaseCoverage: number
  weightedEfficiency: number
}

export interface HourlyDataPoint {
  hour: number
  solarKW: number
  usageKW: number
  batteryKWh: number
}

export const BATTERY_PRESETS: BatteryPreset[] = [
  {
    id: 'powerwall3',
    name: 'Tesla Powerwall 3',
    capacityKWh: 13.5,
    powerKW: 11.5,
    efficiency: 89,
    warrantyYears: 10,
    chemistry: 'LFP'
  },
  {
    id: 'enphase-iq5p',
    name: 'Enphase IQ 5P',
    capacityKWh: 5.0,
    powerKW: 3.84,
    efficiency: 90,
    warrantyYears: 15,
    chemistry: 'LFP'
  },
  {
    id: 'franklinwh-apower2',
    name: 'FranklinWH aPower 2',
    capacityKWh: 15.0,
    powerKW: 10.0,
    efficiency: 90,
    warrantyYears: 12,
    chemistry: 'LFP'
  },
  {
    id: 'sonnen-eco10',
    name: 'Sonnen Eco 10',
    capacityKWh: 10.0,
    powerKW: 3.0,
    efficiency: 90,
    warrantyYears: 10,
    chemistry: 'LFP'
  },
  {
    id: 'byd-premium',
    name: 'BYD Battery-Box Premium',
    capacityKWh: 12.8,
    powerKW: 10.2,
    efficiency: 95,
    warrantyYears: 10,
    chemistry: 'LFP'
  },
  {
    id: 'canadian-epcube',
    name: 'Canadian Solar EP Cube',
    capacityKWh: 19.9,
    powerKW: 7.6,
    efficiency: 90,
    warrantyYears: 10,
    chemistry: 'LFP'
  }
]

// Average hourly power consumption in watts (from real usage data)
// Index = hour of day (UTC), value = average watts during that hour
// Data based on mikas apartment for 2 people
const HOURLY_USAGE_PROFILE = [
  395.7, 446.7, 469.7, 490.9, 470.1, 511.0, 482.9, 465.3,
  502.8, 567.2, 563.6, 538.4, 512.6, 486.3, 440.1, 404.7,
  391.3, 372.2, 358.5, 356.2, 355.5, 352.3, 352.6, 384.4
]

const PROFILE_TOTAL = HOURLY_USAGE_PROFILE.reduce((a, b) => a + b, 0)

export function useBatteryCalculator() {
  const settings = ref<BatterySettings>({
    peakSunHours: 5,
    dailyUsageKWh: 30,
    daysOfAutonomy: 1,
    daylightHours: 12
  })

  const selectedBatteries = ref<SelectedBattery[]>([])

  const customBattery = ref({
    name: '',
    capacityKWh: 10,
    powerKW: 5,
    efficiency: 90
  })

  function addPreset(preset: BatteryPreset) {
    const existing = selectedBatteries.value.find(s => s.battery.id === preset.id)
    if (existing) {
      existing.quantity++
    } else {
      selectedBatteries.value.push({ battery: preset, quantity: 1 })
    }
  }

  function addCustom() {
    if (!customBattery.value.name.trim()) return
    const id = 'custom-' + Date.now()
    const battery: BatteryPreset = {
      id,
      name: customBattery.value.name.trim(),
      capacityKWh: customBattery.value.capacityKWh,
      powerKW: customBattery.value.powerKW,
      efficiency: customBattery.value.efficiency,
      warrantyYears: 0,
      chemistry: 'Custom'
    }
    selectedBatteries.value.push({ battery, quantity: 1 })
    customBattery.value.name = ''
  }

  function incrementQuantity(id: string) {
    const entry = selectedBatteries.value.find(s => s.battery.id === id)
    if (entry) entry.quantity++
  }

  function decrementQuantity(id: string) {
    const entry = selectedBatteries.value.find(s => s.battery.id === id)
    if (!entry) return
    entry.quantity--
    if (entry.quantity <= 0) {
      selectedBatteries.value = selectedBatteries.value.filter(s => s.battery.id !== id)
    }
  }

  function removeEntry(id: string) {
    selectedBatteries.value = selectedBatteries.value.filter(s => s.battery.id !== id)
  }

  function clearAll() {
    selectedBatteries.value = []
  }

  const totalCapacity = computed(() =>
    selectedBatteries.value.reduce((sum, s) => sum + s.battery.capacityKWh * s.quantity, 0)
  )

  const totalPower = computed(() =>
    selectedBatteries.value.reduce((sum, s) => sum + s.battery.powerKW * s.quantity, 0)
  )

  const weightedEfficiency = computed(() => {
    if (totalCapacity.value === 0) return 90
    const weightedSum = selectedBatteries.value.reduce(
      (sum, s) => sum + s.battery.efficiency * s.battery.capacityKWh * s.quantity, 0
    )
    return weightedSum / totalCapacity.value
  })

  function calculateResults(estimatedKW: number): BatteryResults {
    const eff = weightedEfficiency.value / 100
    const dailyGeneration = estimatedKW * settings.value.peakSunHours
    const bestCaseStorage = Math.max(0, settings.value.dailyUsageKWh - dailyGeneration) / eff
    const worstCaseStorage = (settings.value.dailyUsageKWh * settings.value.daysOfAutonomy) / eff

    const cap = totalCapacity.value
    const bestCaseCoverage = bestCaseStorage > 0 ? Math.min(100, (cap / bestCaseStorage) * 100) : (cap > 0 ? 100 : 0)
    const worstCaseCoverage = worstCaseStorage > 0 ? Math.min(100, (cap / worstCaseStorage) * 100) : 0

    return {
      dailyGeneration,
      bestCaseStorage,
      worstCaseStorage,
      totalCapacity: cap,
      totalPower: totalPower.value,
      bestCaseCoverage,
      worstCaseCoverage,
      weightedEfficiency: weightedEfficiency.value
    }
  }

  // Half-cosine solar irradiance model (matches real-world measurements)
  // Integral of peak * cos(π(t-12)/D) from sunrise to sunset = peak * 2D/π
  // So peak = dailyGen * π / (2D) to preserve total energy
  function solarKWAtTime(t: number, estimatedKW: number): number {
    const D = settings.value.daylightHours
    const sunrise = 12 - D / 2
    const sunset = 12 + D / 2
    const dailyGen = estimatedKW * settings.value.peakSunHours
    if (dailyGen <= 0 || t <= sunrise || t >= sunset) return 0
    const peak = dailyGen * Math.PI / (2 * D)
    return Math.max(0, peak * Math.cos(Math.PI * (t - 12) / D))
  }

  function usageKWAtHour(h: number): number {
    const hour = Math.floor(h) % 24
    // Scale the profile so the total matches dailyUsageKWh
    // Profile is in watts, convert to kW and scale
    return (HOURLY_USAGE_PROFILE[hour] / PROFILE_TOTAL) * settings.value.dailyUsageKWh
  }

  function generateHourlyData(estimatedKW: number): HourlyDataPoint[] {
    const eff = weightedEfficiency.value / 100
    const cap = totalCapacity.value
    const points: HourlyDataPoint[] = []
    let batt = cap

    for (let h = 0; h <= 24; h++) {
      const usage = usageKWAtHour(h)
      points.push({
        hour: h,
        solarKW: solarKWAtTime(h, estimatedKW),
        usageKW: usage,
        batteryKWh: batt
      })
      if (h < 24) {
        const avgSolar = (solarKWAtTime(h, estimatedKW) + solarKWAtTime(h + 1, estimatedKW)) / 2
        const net = avgSolar - usage
        if (net > 0) {
          batt = Math.min(cap, batt + net * eff)
        } else {
          batt = Math.max(0, batt + net)
        }
      }
    }

    return points
  }

  return {
    settings,
    selectedBatteries,
    customBattery,
    totalCapacity,
    totalPower,
    weightedEfficiency,
    addPreset,
    addCustom,
    incrementQuantity,
    decrementQuantity,
    removeEntry,
    clearAll,
    calculateResults,
    solarKWAtTime,
    usageKWAtHour,
    generateHourlyData
  }
}
