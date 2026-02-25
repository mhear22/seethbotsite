export type SupplierId = 'zoogle' | 'asw' | 'macrohard' | 'gridlink'
export type LocationId = 'tech_hub' | 'suburbia' | 'country'

export type RunPhase = 'setup' | 'running' | 'won' | 'lost'
export type RunPersistenceStatus = 'active' | 'won' | 'lost' | 'archived'

export interface RackOffer {
  id: string
  supplierId: SupplierId
  role: 'compute' | 'cooling' | 'utility'
  utilityType?: 'cooling_tower' | 'data_uplink'
  adjacentIncomeBoost?: number
  tier: number
  clientInterestRequired?: number
  repRequired: number
  name: string
  cost: number
  dailyCash: number
  dailyPowerCost: number
  workloadContribution: number
  heat: number
  repGain: number
}

export interface SupplierDefinition {
  id: SupplierId
  name: string
  color: string
  benefit: string
  heatMultiplier?: number
  incomeMultiplier?: number
  pressureReliefPerRack?: number
}

export interface LocationDefinition {
  id: LocationId
  label: string
  description: string
  pressureSensitivity: number
  coolingMultiplier: number
  clientGrowthModifier: number
  startingCash: number
}

export interface PlacedRack {
  id: string
  offerId: string
  supplierId: SupplierId
  role: 'compute' | 'cooling' | 'utility'
  utilityType?: 'cooling_tower' | 'data_uplink'
  adjacentIncomeBoost?: number
  movedToday: boolean
  name: string
  x: number
  y: number
  heat: number
  dailyCash: number
  dailyPowerCost: number
  workloadContribution: number
  repGain: number
}

export interface DaySummary {
  income: number
  powerCost: number
  coolingCost: number
  backlashFine: number
  legalCost: number
  net: number
  churnedClients: number
  gainedClients: number
  providerPulledServers: number
  averageHeat: number
  maxHeat: number
}

export interface DataCenterRunSnapshot {
  version: number
  phase: Exclude<RunPhase, 'setup'>
  locationId: LocationId
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
  supplierRep: Record<SupplierId, number>
  placedRacks: PlacedRack[]
  heatMap: number[][]
  lossReason: string | null
  runName: string
}

export interface DataCenterRunRecord {
  id: number
  user_id: number
  name: string
  location: LocationId
  state_json: string
  status: RunPersistenceStatus
  created_at: string
  updated_at: string
  last_played_at: string
}

export interface SupplierOfferView {
  offer: RackOffer
  clientInterestRequired: number
  locked: boolean
}
