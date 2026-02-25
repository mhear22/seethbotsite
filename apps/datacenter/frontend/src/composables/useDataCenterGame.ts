import { computed, onUnmounted, reactive, ref } from 'vue'
import {
  LOCATION_BY_ID,
  OFFER_BY_ID,
  SUPPLIER_BY_ID,
  SUPPLIERS,
  getOfferClientInterestRequired,
  getOfferGroups
} from '../data/suppliers'
import {
  createRun,
  deleteRun,
  getStoredToken,
  listRuns,
  loadRun,
  saveRun,
  validateSessionToken
} from '../services/datacenterApi'
import type {
  DataCenterRunRecord,
  DataCenterRunSnapshot,
  DaySummary,
  LocationId,
  PlacedRack,
  RunPersistenceStatus,
  SupplierId
} from '../types/game'

const DAY_DURATION_SECONDS = 60
const TICK_MS = 1000
const GRID_START = 5
const GRID_MAX = 10
const HEAT_SPREAD_RATIO = 0.44
const LEGACY_UTILITY_OFFER_ID_ALIASES: Record<string, string> = {
  'zoogle-cooling-tower': 'gridlink-cooling-tower',
  'asw-cooling-tower': 'gridlink-cooling-tower',
  'macrohard-cooling-tower': 'gridlink-cooling-tower',
  'zoogle-data-uplink': 'gridlink-data-uplink',
  'asw-data-uplink': 'gridlink-data-uplink',
  'macrohard-data-uplink': 'gridlink-data-uplink'
}

type Phase = 'setup' | 'running' | 'won' | 'lost'
type AutosaveState = 'idle' | 'saving' | 'error'

interface GameState {
  runId: number | null
  runName: string
  phase: Phase
  lossReason: string | null
  locationId: LocationId | null
  day: number
  secondsIntoDay: number
  rows: number
  cols: number
  cash: number
  clients: number
  clientInterestProgress: number
  zeroClientDays: number
  totalWorkload: number
  pressure: number
  expansionLockDays: number
  legalStrikes: number
  rapidExpansionDebt: number
  paused: boolean
  heatMap: number[][]
  placedRacks: PlacedRack[]
  supplierRep: Record<SupplierId, number>
  lastDaySummary: DaySummary | null
}

const defaultSupplierRep = (): Record<SupplierId, number> =>
  SUPPLIERS.reduce(
    (acc, supplier) => {
      acc[supplier.id] = 0
      return acc
    },
    {} as Record<SupplierId, number>
  )

const createHeatMap = (rows: number, cols: number): number[][] =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0))

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

const parseSnapshot = (input: string | DataCenterRunSnapshot): DataCenterRunSnapshot | null => {
  try {
    const parsed = typeof input === 'string' ? JSON.parse(input) : input
    if (!parsed || typeof parsed !== 'object') return null
    return parsed as DataCenterRunSnapshot
  } catch {
    return null
  }
}

const generateRackId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `rack-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
}

const toPersistenceStatus = (phase: Phase): RunPersistenceStatus => {
  if (phase === 'won') return 'won'
  if (phase === 'lost') return 'lost'
  return 'active'
}

const formatLocationName = (locationId: LocationId): string => LOCATION_BY_ID[locationId].label
const resolveOfferId = (offerId: string): string => LEGACY_UTILITY_OFFER_ID_ALIASES[offerId] ?? offerId

export function useDataCenterGame() {
  const state = reactive<GameState>({
    runId: null,
    runName: 'New Run',
    phase: 'setup',
    lossReason: null,
    locationId: null,
    day: 1,
    secondsIntoDay: 0,
    rows: GRID_START,
    cols: GRID_START,
    cash: 0,
    clients: 4,
    clientInterestProgress: 0,
    zeroClientDays: 0,
    totalWorkload: 0,
    pressure: 0,
    expansionLockDays: 0,
    legalStrikes: 0,
    rapidExpansionDebt: 0,
    paused: false,
    heatMap: createHeatMap(GRID_START, GRID_START),
    placedRacks: [],
    supplierRep: defaultSupplierRep(),
    lastDaySummary: null
  })

  const auth = reactive({
    token: null as string | null,
    isAuthenticated: false,
    loading: true,
    lastError: null as string | null
  })

  const runSlots = ref<DataCenterRunRecord[]>([])
  const movingRackId = ref<string | null>(null)
  const autosaveState = ref<AutosaveState>('idle')

  let tickHandle: number | null = null
  let saveInFlight = false

  const location = computed(() => {
    if (!state.locationId) return null
    return LOCATION_BY_ID[state.locationId]
  })

  const occupiedTiles = computed(() => state.placedRacks.length)
  const occupancyRatio = computed(() => {
    const totalTiles = state.rows * state.cols
    return totalTiles === 0 ? 0 : state.placedRacks.length / totalTiles
  })

  const averageHeat = computed(() => {
    const values = state.heatMap.flat()
    if (values.length === 0) return 0
    const total = values.reduce((sum, value) => sum + value, 0)
    return total / values.length
  })

  const maxHeat = computed(() => {
    const values = state.heatMap.flat()
    if (values.length === 0) return 0
    return Math.max(...values)
  })

  const dayProgress = computed(() => state.secondsIntoDay / DAY_DURATION_SECONDS)
  const workloadProgress = computed(() => clamp(state.totalWorkload / 250, 0, 1))

  const rowExpansionCost = computed(() =>
    Math.round(520 + (state.rows - GRID_START) * 220 + state.cols * 70)
  )

  const colExpansionCost = computed(() =>
    Math.round(520 + (state.cols - GRID_START) * 220 + state.rows * 70)
  )

  const mitigationCost = computed(() => Math.round(180 + state.pressure * 8))

  const canExpandRows = computed(
    () =>
      state.phase === 'running' &&
      state.rows < GRID_MAX &&
      state.expansionLockDays === 0 &&
      state.cash >= rowExpansionCost.value
  )

  const canExpandCols = computed(
    () =>
      state.phase === 'running' &&
      state.cols < GRID_MAX &&
      state.expansionLockDays === 0 &&
      state.cash >= colExpansionCost.value
  )

  const canMitigateBacklash = computed(
    () => state.phase === 'running' && state.cash >= mitigationCost.value && state.pressure > 0
  )

  const offersBySupplier = computed(() => getOfferGroups(state.clients))

  const isAuthenticated = computed(() => auth.isAuthenticated)

  const rackAt = (x: number, y: number): PlacedRack | null =>
    state.placedRacks.find((rack) => rack.x === x && rack.y === y) ?? null

  const findAdjacentRacks = (rack: Pick<PlacedRack, 'id' | 'x' | 'y'>): PlacedRack[] =>
    state.placedRacks.filter((candidate) => {
      if (candidate.id === rack.id) return false
      const distance = Math.abs(candidate.x - rack.x) + Math.abs(candidate.y - rack.y)
      return distance === 1
    })

  const getSupplierIncomeMultiplier = (supplierId: SupplierId): number => {
    const multiplier = SUPPLIER_BY_ID[supplierId]?.incomeMultiplier ?? 1
    return multiplier > 0 ? multiplier : 1
  }

  const getSupplierHeatMultiplier = (supplierId: SupplierId): number => {
    const multiplier = SUPPLIER_BY_ID[supplierId]?.heatMultiplier ?? 1
    return multiplier > 0 ? multiplier : 1
  }

  const getRackHeatContribution = (rack: PlacedRack): number => {
    const supplierHeatMultiplier = getSupplierHeatMultiplier(rack.supplierId)
    if (rack.heat >= 0) {
      return rack.heat * supplierHeatMultiplier
    }
    return rack.heat / supplierHeatMultiplier
  }

  const computeRackIncomeMultiplier = (rack: PlacedRack): number => {
    if (rack.dailyCash <= 0) return 1

    const adjacentBoost = findAdjacentRacks(rack).reduce((boost, neighbor) => {
      if (neighbor.utilityType !== 'data_uplink' || neighbor.movedToday) return boost
      return boost + (neighbor.adjacentIncomeBoost || 0)
    }, 0)

    return 1 + adjacentBoost
  }

  const getRackDailyIncome = (rack: PlacedRack): number => {
    if (rack.movedToday || rack.dailyCash <= 0) return 0
    return (
      rack.dailyCash *
      computeRackIncomeMultiplier(rack) *
      getSupplierIncomeMultiplier(rack.supplierId)
    )
  }

  const potentialDayIncome = computed(() => {
    let baseIncome = 0
    for (const rack of state.placedRacks) {
      baseIncome += getRackDailyIncome(rack)
    }
    return Math.round(baseIncome)
  })

  const isTileInside = (x: number, y: number): boolean =>
    x >= 0 && y >= 0 && x < state.cols && y < state.rows

  const resetStateForSetup = () => {
    stopTicking()
    state.runId = null
    state.runName = 'New Run'
    state.phase = 'setup'
    state.lossReason = null
    state.locationId = null
    state.day = 1
    state.secondsIntoDay = 0
    state.rows = GRID_START
    state.cols = GRID_START
    state.cash = 0
    state.clients = 4
    state.clientInterestProgress = 0
    state.zeroClientDays = 0
    state.totalWorkload = 0
    state.pressure = 0
    state.expansionLockDays = 0
    state.legalStrikes = 0
    state.rapidExpansionDebt = 0
    state.paused = false
    state.heatMap = createHeatMap(GRID_START, GRID_START)
    state.placedRacks = []
    state.supplierRep = defaultSupplierRep()
    state.lastDaySummary = null
    movingRackId.value = null
    autosaveState.value = 'idle'
  }

  const applyFreshRun = (locationId: LocationId, runName: string) => {
    const locationInfo = LOCATION_BY_ID[locationId]

    state.runId = null
    state.runName = runName
    state.phase = 'running'
    state.lossReason = null
    state.locationId = locationId
    state.day = 1
    state.secondsIntoDay = 0
    state.rows = GRID_START
    state.cols = GRID_START
    state.cash = locationInfo.startingCash
    state.clients = 4
    state.clientInterestProgress = 0
    state.zeroClientDays = 0
    state.totalWorkload = 0
    state.pressure = 0
    state.expansionLockDays = 0
    state.legalStrikes = 0
    state.rapidExpansionDebt = 0
    state.paused = false
    state.heatMap = createHeatMap(GRID_START, GRID_START)
    state.placedRacks = []
    state.supplierRep = defaultSupplierRep()
    state.lastDaySummary = null
    movingRackId.value = null
    autosaveState.value = 'idle'
  }

  const ensureHeatMapShape = () => {
    const next = createHeatMap(state.rows, state.cols)
    for (let y = 0; y < state.rows; y += 1) {
      for (let x = 0; x < state.cols; x += 1) {
        next[y][x] = state.heatMap[y]?.[x] ?? 0
      }
    }
    state.heatMap = next
  }

  const hydrateFromSnapshot = (snapshot: DataCenterRunSnapshot, runRecord?: DataCenterRunRecord) => {
    const safeLocation = snapshot.locationId in LOCATION_BY_ID ? snapshot.locationId : 'suburbia'

    state.runId = runRecord?.id ?? state.runId
    state.runName = runRecord?.name || snapshot.runName || `${formatLocationName(safeLocation)} Run`
    state.phase = snapshot.phase === 'won' || snapshot.phase === 'lost' ? snapshot.phase : 'running'
    state.lossReason = snapshot.lossReason ?? null
    state.locationId = safeLocation
    state.day = Math.max(1, Math.floor(snapshot.day || 1))
    state.secondsIntoDay = clamp(Math.floor(snapshot.secondsIntoDay || 0), 0, DAY_DURATION_SECONDS)
    state.rows = clamp(Math.floor(snapshot.rows || GRID_START), GRID_START, GRID_MAX)
    state.cols = clamp(Math.floor(snapshot.cols || GRID_START), GRID_START, GRID_MAX)
    state.cash = Math.round(snapshot.cash || 0)
    state.clients = Math.max(0, Math.floor(snapshot.clients || 0))
    state.clientInterestProgress = clamp(snapshot.clientInterestProgress || 0, 0, 100)
    state.zeroClientDays = Math.max(0, Math.floor(snapshot.zeroClientDays || 0))
    state.totalWorkload = Math.max(0, snapshot.totalWorkload || 0)
    state.pressure = clamp(snapshot.pressure || 0, 0, 120)
    state.expansionLockDays = Math.max(0, Math.floor(snapshot.expansionLockDays || 0))
    state.legalStrikes = Math.max(0, Math.floor(snapshot.legalStrikes || 0))
    state.rapidExpansionDebt = Math.max(0, snapshot.rapidExpansionDebt || 0)
    state.paused = false
    state.supplierRep = SUPPLIERS.reduce(
      (acc, supplier) => {
        acc[supplier.id] = Math.max(0, snapshot.supplierRep?.[supplier.id] || 0)
        return acc
      },
      {} as Record<SupplierId, number>
    )

    const normalizedRacks = (snapshot.placedRacks || []).reduce<PlacedRack[]>((acc, rack) => {
      if (!rack) return acc
      const offerId = resolveOfferId(rack.offerId)
      const offer = OFFER_BY_ID[offerId]
      if (!offer) return acc

      acc.push({
        ...rack,
        offerId,
        supplierId: rack.supplierId ?? offer.supplierId,
        role: rack.role ?? offer.role,
        utilityType: rack.utilityType ?? offer.utilityType,
        adjacentIncomeBoost: Number.isFinite(rack.adjacentIncomeBoost)
          ? Math.max(0, rack.adjacentIncomeBoost)
          : Math.max(0, offer.adjacentIncomeBoost || 0),
        movedToday: Boolean(rack.movedToday),
        name: rack.name || offer.name,
        x: clamp(Math.floor(rack.x), 0, state.cols - 1),
        y: clamp(Math.floor(rack.y), 0, state.rows - 1),
        heat: Number.isFinite(rack.heat) ? rack.heat : offer.heat,
        dailyCash: Number.isFinite(rack.dailyCash) ? rack.dailyCash : offer.dailyCash,
        dailyPowerCost: Number.isFinite(rack.dailyPowerCost) ? rack.dailyPowerCost : offer.dailyPowerCost,
        workloadContribution: Number.isFinite(rack.workloadContribution)
          ? clamp(rack.workloadContribution, 0, 1)
          : offer.workloadContribution,
        repGain: Number.isFinite(rack.repGain) ? rack.repGain : offer.repGain
      })
      return acc
    }, [])

    state.placedRacks = normalizedRacks
    state.heatMap = snapshot.heatMap || createHeatMap(state.rows, state.cols)
    ensureHeatMapShape()

    movingRackId.value = null
    autosaveState.value = 'idle'
  }

  const snapshot = (): DataCenterRunSnapshot => {
    if (!state.locationId) {
      throw new Error('Cannot save run without location')
    }

    return {
      version: 1,
      phase: state.phase === 'setup' ? 'running' : state.phase,
      locationId: state.locationId,
      day: state.day,
      secondsIntoDay: state.secondsIntoDay,
      rows: state.rows,
      cols: state.cols,
      cash: state.cash,
      clients: state.clients,
      clientInterestProgress: state.clientInterestProgress,
      zeroClientDays: state.zeroClientDays,
      totalWorkload: state.totalWorkload,
      pressure: state.pressure,
      expansionLockDays: state.expansionLockDays,
      legalStrikes: state.legalStrikes,
      rapidExpansionDebt: state.rapidExpansionDebt,
      supplierRep: SUPPLIERS.reduce(
        (acc, supplier) => {
          acc[supplier.id] = state.supplierRep[supplier.id]
          return acc
        },
        {} as Record<SupplierId, number>
      ),
      placedRacks: state.placedRacks.map((rack) => ({ ...rack })),
      heatMap: state.heatMap.map((row) => [...row]),
      lossReason: state.lossReason,
      runName: state.runName
    }
  }

  const refreshRunSlots = async () => {
    if (!auth.isAuthenticated || !auth.token) {
      runSlots.value = []
      return
    }

    runSlots.value = await listRuns(auth.token)
  }

  const persistCurrentRun = async (options: { manual?: boolean } = {}): Promise<boolean> => {
    if (!auth.isAuthenticated || !auth.token || !state.runId || !state.locationId || state.phase === 'setup') {
      return false
    }

    if (saveInFlight) {
      return false
    }

    saveInFlight = true
    autosaveState.value = 'saving'

    try {
      await saveRun(auth.token, state.runId, {
        name: state.runName,
        location: state.locationId,
        state_json: snapshot(),
        status: toPersistenceStatus(state.phase),
        last_played_at: new Date().toISOString()
      })

      autosaveState.value = 'idle'
      auth.lastError = null

      if (options.manual) {
        await refreshRunSlots()
      }

      return true
    } catch (error) {
      console.error('Failed to save Data Center run:', error)
      autosaveState.value = 'error'
      auth.lastError = error instanceof Error ? error.message : 'Failed to save run'
      return false
    } finally {
      saveInFlight = false
    }
  }

  const setLost = (reason: string) => {
    if (state.phase !== 'running') return
    state.phase = 'lost'
    state.lossReason = reason
    stopTicking()
  }

  const setWon = () => {
    if (state.phase !== 'running') return
    state.phase = 'won'
    state.lossReason = null
    stopTicking()
  }

  const applyHeatTick = () => {
    if (!location.value) return

    const coolingFactor = clamp(0.075 * location.value.coolingMultiplier, 0.05, 0.17)
    const next = state.heatMap.map((row) => row.map((value) => Math.max(0, value * (1 - coolingFactor))))

    for (const rack of state.placedRacks) {
      const heatContribution = getRackHeatContribution(rack)
      next[rack.y][rack.x] = Math.max(0, next[rack.y][rack.x] + heatContribution * 0.9)
    }

    const source = next.map((row) => [...row])

    for (let y = 0; y < state.rows; y += 1) {
      for (let x = 0; x < state.cols; x += 1) {
        const value = source[y][x]
        if (value <= 0.01) continue

        const neighbors: Array<[number, number]> = []
        if (x > 0) neighbors.push([x - 1, y])
        if (x < state.cols - 1) neighbors.push([x + 1, y])
        if (y > 0) neighbors.push([x, y - 1])
        if (y < state.rows - 1) neighbors.push([x, y + 1])

        if (neighbors.length === 0) continue

        const spreadTotal = value * HEAT_SPREAD_RATIO
        const perNeighbor = spreadTotal / neighbors.length

        next[y][x] -= spreadTotal
        for (const [nx, ny] of neighbors) {
          next[ny][nx] += perNeighbor
        }
      }
    }

    state.heatMap = next.map((row) => row.map((value) => Math.max(0, Number(value.toFixed(3)))))
  }

  const removeOverheatedServers = (summaryAverageHeat: number): number => {
    let removedServers = 0
    const survivors: PlacedRack[] = []

    for (const rack of state.placedRacks) {
      if (rack.workloadContribution <= 0) {
        survivors.push(rack)
        continue
      }

      const tileHeat = state.heatMap[rack.y]?.[rack.x] ?? 0
      const severeTileHeat = tileHeat >= 17
      const sustainedHeat = tileHeat >= 14.5 && summaryAverageHeat >= 8.5

      if (severeTileHeat || sustainedHeat) {
        removedServers += 1
        continue
      }

      survivors.push(rack)
    }

    if (removedServers > 0) {
      state.placedRacks = survivors
      if (movingRackId.value && !state.placedRacks.some((rack) => rack.id === movingRackId.value)) {
        movingRackId.value = null
      }
    }

    return removedServers
  }

  const applyDayEnd = () => {
    if (!location.value) return

    const summaryAverageHeat = averageHeat.value
    const summaryMaxHeat = maxHeat.value
    const providerPulledServers = removeOverheatedServers(summaryAverageHeat)

    let baseIncome = 0
    let powerCost = 0
    for (const rack of state.placedRacks) {
      baseIncome += getRackDailyIncome(rack)
      powerCost += rack.dailyPowerCost
      state.supplierRep[rack.supplierId] += rack.repGain
    }

    const coolingCost = Math.round(summaryAverageHeat * 1.6 + summaryMaxHeat * 0.8)
    const backlashFine = state.pressure > 70 ? Math.round((state.pressure - 70) * 10) : 0
    const legalCost = state.pressure > 88 ? Math.round((state.pressure - 88) * 22) : 0
    const income = Math.round(baseIncome)
    const net = income - powerCost - coolingCost - backlashFine - legalCost

    state.cash += net

    const heatChurnRate =
      Math.max(0, summaryAverageHeat - 7.5) * 0.02 + Math.max(0, summaryMaxHeat - 15.5) * 0.015
    const pressureChurnRate =
      Math.max(0, state.pressure - 55) * 0.006 * location.value.pressureSensitivity
    const churnedClients = Math.min(
      state.clients,
      Math.floor(state.clients * clamp(heatChurnRate + pressureChurnRate, 0, 0.9)) + providerPulledServers
    )

    const heatInterestFactor = clamp((8.5 - summaryAverageHeat) / 8.5, 0, 1)
    const pressureInterestFactor = clamp((72 - state.pressure) / 72, 0, 1)
    const dailyInterestGain =
      (0.1 + heatInterestFactor * 0.35 + pressureInterestFactor * 0.35) *
      location.value.clientGrowthModifier
    state.clientInterestProgress += dailyInterestGain
    const gainedClients = Math.floor(state.clientInterestProgress)
    state.clientInterestProgress = Math.max(0, state.clientInterestProgress - gainedClients)

    state.clients = Math.max(0, state.clients + gainedClients - churnedClients)

    if (state.clients === 0) {
      state.zeroClientDays += 1
    } else {
      state.zeroClientDays = 0
    }

    const expansionFootprint = (state.rows * state.cols - GRID_START * GRID_START) / (GRID_MAX * GRID_MAX - GRID_START * GRID_START)
    const dailyPressureRise =
      expansionFootprint * 5.4 * location.value.pressureSensitivity +
      occupancyRatio.value * 4 * location.value.pressureSensitivity +
      state.rapidExpansionDebt

    const dailyPressureDecay = 1.8 / location.value.pressureSensitivity
    const dailyPressureRelief = state.placedRacks.reduce((relief, rack) => {
      return relief + (SUPPLIER_BY_ID[rack.supplierId]?.pressureReliefPerRack || 0)
    }, 0)

    state.pressure = clamp(
      state.pressure - dailyPressureDecay - dailyPressureRelief + dailyPressureRise,
      0,
      120
    )
    state.rapidExpansionDebt *= 0.62

    if (state.expansionLockDays > 0) {
      state.expansionLockDays -= 1
    }

    if (state.pressure > 78) {
      state.expansionLockDays = Math.max(state.expansionLockDays, 2)
    }

    if (state.pressure > 92) {
      state.legalStrikes += 1
      state.cash -= 120
    }

    if (state.pressure > 105) {
      state.legalStrikes += 1
      state.cash -= 180
    }

    const dailyWorkload = state.placedRacks.reduce(
      (workload, rack) => workload + rack.workloadContribution,
      0
    )
    state.totalWorkload += dailyWorkload / 25

    state.lastDaySummary = {
      income,
      powerCost,
      coolingCost,
      backlashFine,
      legalCost,
      net,
      churnedClients,
      gainedClients,
      providerPulledServers,
      averageHeat: summaryAverageHeat,
      maxHeat: summaryMaxHeat
    }

    if (state.cash < 0) {
      setLost('Bankruptcy: your operating costs exceeded available cash.')
    }

    if (state.legalStrikes >= 5 || state.pressure >= 115) {
      setLost('Legal shutdown: sustained backlash forced the site to close.')
    }

    if (state.zeroClientDays >= 3) {
      setLost('Client base collapsed due to temperature-related churn.')
    }

    if (state.phase === 'running' && state.totalWorkload >= 250) {
      setWon()
    }

    for (const rack of state.placedRacks) {
      rack.movedToday = false
    }

    state.day += 1
    state.secondsIntoDay = 0
  }

  const tick = async () => {
    if (state.phase !== 'running' || state.paused) return

    state.secondsIntoDay += 1
    applyHeatTick()

    if (state.secondsIntoDay >= DAY_DURATION_SECONDS) {
      applyDayEnd()

      if (auth.isAuthenticated && state.runId && state.phase !== 'setup') {
        await persistCurrentRun()
      }
    }
  }

  const skipToNextDay = async (): Promise<boolean> => {
    if (state.phase !== 'running') return false

    const remainingTicks = Math.max(1, DAY_DURATION_SECONDS - state.secondsIntoDay)
    for (let tickIndex = 0; tickIndex < remainingTicks; tickIndex += 1) {
      if (state.phase !== 'running') break
      state.secondsIntoDay += 1
      applyHeatTick()
    }

    if (state.phase === 'running' && state.secondsIntoDay >= DAY_DURATION_SECONDS) {
      applyDayEnd()

      if (auth.isAuthenticated && state.runId && state.phase !== 'setup') {
        await persistCurrentRun()
      }
    }

    return true
  }

  const startTicking = () => {
    if (tickHandle !== null) return
    tickHandle = window.setInterval(() => {
      void tick()
    }, TICK_MS)
  }

  const stopTicking = () => {
    if (tickHandle !== null) {
      window.clearInterval(tickHandle)
      tickHandle = null
    }
  }

  const setMoveRack = (rackId: string | null) => {
    movingRackId.value = rackId
  }

  const placeRackOnTile = (offerId: string, x: number, y: number): boolean => {
    if (state.phase !== 'running' || !state.locationId) return false
    if (!isTileInside(x, y)) return false
    if (rackAt(x, y)) return false

    const offer = OFFER_BY_ID[offerId]
    if (!offer) return false

    if (state.clients < getOfferClientInterestRequired(offer)) return false
    if (state.cash < offer.cost) return false

    state.cash -= offer.cost
    state.placedRacks.push({
      id: generateRackId(),
      offerId: offer.id,
      supplierId: offer.supplierId,
      role: offer.role,
      utilityType: offer.utilityType,
      adjacentIncomeBoost: offer.adjacentIncomeBoost || 0,
      movedToday: false,
      name: offer.name,
      x,
      y,
      heat: offer.heat,
      dailyCash: offer.dailyCash,
      dailyPowerCost: offer.dailyPowerCost,
      workloadContribution: offer.workloadContribution,
      repGain: offer.repGain
    })

    return true
  }

  const moveSelectedRackTo = (x: number, y: number): boolean => {
    if (state.phase !== 'running') return false
    if (!isTileInside(x, y)) return false
    if (!movingRackId.value) return false

    const targetRack = state.placedRacks.find((rack) => rack.id === movingRackId.value)
    if (!targetRack) return false

    const occupied = rackAt(x, y)
    if (occupied && occupied.id !== targetRack.id) return false

    if (targetRack.x === x && targetRack.y === y) {
      movingRackId.value = null
      return true
    }

    targetRack.x = x
    targetRack.y = y
    targetRack.movedToday = true
    movingRackId.value = null
    return true
  }

  const selectRackAt = (rackId: string) => {
    if (state.phase !== 'running') return
    const rack = state.placedRacks.find((entry) => entry.id === rackId)
    if (!rack) return
    movingRackId.value = rack.id
  }

  const removeSelectedRack = (): boolean => {
    if (state.phase !== 'running') return false
    if (!movingRackId.value) return false

    const index = state.placedRacks.findIndex((rack) => rack.id === movingRackId.value)
    if (index === -1) return false

    state.placedRacks.splice(index, 1)
    movingRackId.value = null
    return true
  }

  const expandRows = (): boolean => {
    if (!canExpandRows.value || !location.value) return false

    state.cash -= rowExpansionCost.value
    state.rows += 1
    state.heatMap.push(Array.from({ length: state.cols }, () => 0))
    state.rapidExpansionDebt += 4.8 * location.value.pressureSensitivity
    state.pressure = clamp(state.pressure + 3.1 * location.value.pressureSensitivity, 0, 120)

    return true
  }

  const expandCols = (): boolean => {
    if (!canExpandCols.value || !location.value) return false

    state.cash -= colExpansionCost.value
    state.cols += 1
    state.heatMap = state.heatMap.map((row) => [...row, 0])
    state.rapidExpansionDebt += 4.8 * location.value.pressureSensitivity
    state.pressure = clamp(state.pressure + 3.1 * location.value.pressureSensitivity, 0, 120)

    return true
  }

  const mitigateBacklash = (): boolean => {
    if (!canMitigateBacklash.value || !location.value) return false

    state.cash -= mitigationCost.value
    state.pressure = clamp(state.pressure - 18 / location.value.pressureSensitivity, 0, 120)
    if (state.pressure < 38) {
      state.legalStrikes = Math.max(0, state.legalStrikes - 1)
    }

    return true
  }

  const togglePause = () => {
    if (state.phase !== 'running') return
    state.paused = !state.paused
  }

  const bootstrap = async () => {
    auth.loading = true
    auth.lastError = null

    try {
      const token = getStoredToken()
      if (!token) {
        auth.token = null
        auth.isAuthenticated = false
        runSlots.value = []
        return
      }

      const valid = await validateSessionToken(token)
      auth.token = valid ? token : null
      auth.isAuthenticated = valid

      if (valid) {
        await refreshRunSlots()
      } else {
        runSlots.value = []
      }
    } catch (error) {
      console.error('Failed to initialize Data Center auth:', error)
      auth.token = null
      auth.isAuthenticated = false
      auth.lastError = error instanceof Error ? error.message : 'Failed to initialize auth'
      runSlots.value = []
    } finally {
      auth.loading = false
    }
  }

  const startNewRun = async (locationId: LocationId, runName?: string): Promise<boolean> => {
    const normalizedName = (runName || '').trim() || `${formatLocationName(locationId)} Run`

    applyFreshRun(locationId, normalizedName)

    if (auth.isAuthenticated && auth.token) {
      try {
        const createdRun = await createRun(auth.token, {
          name: normalizedName,
          location: locationId,
          state_json: snapshot(),
          status: 'active'
        })

        state.runId = createdRun.id
        await refreshRunSlots()
      } catch (error) {
        auth.lastError = error instanceof Error ? error.message : 'Failed to create save slot'
        console.error('Failed to create persistent run:', error)
      }
    }

    startTicking()
    return true
  }

  const loadRunSlot = async (runId: number): Promise<boolean> => {
    if (!auth.isAuthenticated || !auth.token) return false

    const record = await loadRun(auth.token, runId)
    const parsed = parseSnapshot(record.state_json)

    if (!parsed) {
      throw new Error('Saved run snapshot is invalid')
    }

    hydrateFromSnapshot(parsed, record)

    if (state.phase === 'running') {
      startTicking()
    } else {
      stopTicking()
    }

    await persistCurrentRun()
    await refreshRunSlots()
    return true
  }

  const deleteRunSlot = async (runId: number): Promise<boolean> => {
    if (!auth.isAuthenticated || !auth.token) return false

    await deleteRun(auth.token, runId)

    if (state.runId === runId) {
      resetStateForSetup()
    }

    await refreshRunSlots()
    return true
  }

  const archiveCurrentRun = async () => {
    if (auth.isAuthenticated && auth.token && state.runId) {
      try {
        await saveRun(auth.token, state.runId, {
          status: 'archived',
          last_played_at: new Date().toISOString(),
          state_json: snapshot()
        })
        await refreshRunSlots()
      } catch (error) {
        auth.lastError = error instanceof Error ? error.message : 'Failed to archive run'
      }
    }

    resetStateForSetup()
  }

  const manualSave = async () => {
    await persistCurrentRun({ manual: true })
  }

  onUnmounted(() => {
    stopTicking()
  })

  return {
    state,
    auth,
    runSlots,
    movingRackId,
    autosaveState,
    location,
    offersBySupplier,
    occupiedTiles,
    occupancyRatio,
    averageHeat,
    maxHeat,
    potentialDayIncome,
    dayProgress,
    workloadProgress,
    rowExpansionCost,
    colExpansionCost,
    mitigationCost,
    canExpandRows,
    canExpandCols,
    canMitigateBacklash,
    isAuthenticated,
    bootstrap,
    startNewRun,
    loadRunSlot,
    deleteRunSlot,
    archiveCurrentRun,
    manualSave,
    setMoveRack,
    rackAt,
    placeRackOnTile,
    moveSelectedRackTo,
    selectRackAt,
    removeSelectedRack,
    expandRows,
    expandCols,
    mitigateBacklash,
    togglePause,
    skipToNextDay,
    resetStateForSetup
  }
}
