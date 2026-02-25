import type {
  LocationDefinition,
  LocationId,
  RackOffer,
  SupplierDefinition,
  SupplierId,
  SupplierOfferView
} from '../types/game'

export const SUPPLIERS: SupplierDefinition[] = [
  {
    id: 'zoogle',
    name: 'Zoogle',
    color: '#22c55e',
    benefit: 'Runs cooler across all rack tiers.',
    heatMultiplier: 0.62
  },
  {
    id: 'asw',
    name: 'ASW',
    color: '#facc15',
    benefit: 'Each ASW rack lowers daily social pressure.',
    pressureReliefPerRack: 0.5
  },
  {
    id: 'macrohard',
    name: 'Macrohard',
    color: '#3b82f6',
    benefit: 'Pays 2x daily income on Macrohard racks.',
    incomeMultiplier: 2
  },
  {
    id: 'gridlink',
    name: 'GridLink Utilities',
    color: '#111111',
    benefit: 'Utility specialist: cooling towers and data uplinks.'
  }
]

export const SUPPLIER_BY_ID = SUPPLIERS.reduce(
  (acc, supplier) => {
    acc[supplier.id] = supplier
    return acc
  },
  {} as Record<SupplierId, SupplierDefinition>
)

export const LOCATIONS: LocationDefinition[] = [
  {
    id: 'tech_hub',
    label: 'Tech Hub',
    description: 'Dense urban market with high scrutiny and fast client growth.',
    pressureSensitivity: 1.45,
    coolingMultiplier: 1,
    clientGrowthModifier: 1.15,
    startingCash: 2100
  },
  {
    id: 'suburbia',
    label: 'Suburbia',
    description: 'Balanced growth, moderate legal pressure, reliable customers.',
    pressureSensitivity: 1,
    coolingMultiplier: 1.1,
    clientGrowthModifier: 1,
    startingCash: 1900
  },
  {
    id: 'country',
    label: 'Country',
    description: 'Lower scrutiny and slower growth, best legal tolerance.',
    pressureSensitivity: 0.65,
    coolingMultiplier: 1.2,
    clientGrowthModifier: 0.85,
    startingCash: 1800
  }
]

export const LOCATION_BY_ID = LOCATIONS.reduce(
  (acc, location) => {
    acc[location.id] = location
    return acc
  },
  {} as Record<LocationId, LocationDefinition>
)

export const OFFERS: RackOffer[] = [
  {
    id: 'zoogle-micro-pod',
    supplierId: 'zoogle',
    role: 'compute',
    tier: 1,
    repRequired: 0,
    name: 'Micro Pod',
    cost: 340,
    dailyCash: 74,
    dailyPowerCost: 0,
    workloadContribution: 1,
    heat: 3.8,
    repGain: 0.45
  },
  {
    id: 'zoogle-tensor-train',
    supplierId: 'zoogle',
    role: 'compute',
    tier: 2,
    repRequired: 30,
    name: 'Tensor Train',
    cost: 780,
    dailyCash: 168,
    dailyPowerCost: 0,
    workloadContribution: 1,
    heat: 6.8,
    repGain: 0.7
  },
  {
    id: 'gridlink-cooling-tower',
    supplierId: 'gridlink',
    role: 'utility',
    utilityType: 'cooling_tower',
    tier: 2,
    repRequired: 24,
    name: 'Cooling Tower',
    cost: 640,
    dailyCash: 0,
    dailyPowerCost: 36,
    workloadContribution: 0,
    heat: -9.6,
    repGain: 0.35
  },
  {
    id: 'gridlink-data-uplink',
    supplierId: 'gridlink',
    role: 'utility',
    utilityType: 'data_uplink',
    adjacentIncomeBoost: 0.2,
    tier: 2,
    repRequired: 24,
    name: 'Data Uplink',
    cost: 670,
    dailyCash: 0,
    dailyPowerCost: 28,
    workloadContribution: 0,
    heat: 1.6,
    repGain: 0.35
  },
  {
    id: 'zoogle-agi-grid',
    supplierId: 'zoogle',
    role: 'compute',
    tier: 3,
    repRequired: 70,
    name: 'AGI Grid',
    cost: 1620,
    dailyCash: 356,
    dailyPowerCost: 0,
    workloadContribution: 1,
    heat: 11.2,
    repGain: 1.2
  },
  {
    id: 'asw-edge-brick',
    supplierId: 'asw',
    role: 'compute',
    tier: 1,
    repRequired: 0,
    name: 'Edge Brick',
    cost: 300,
    dailyCash: 68,
    dailyPowerCost: 0,
    workloadContribution: 1,
    heat: 3.3,
    repGain: 0.4
  },
  {
    id: 'asw-burst-chassis',
    supplierId: 'asw',
    role: 'compute',
    tier: 2,
    repRequired: 28,
    name: 'Burst Chassis',
    cost: 720,
    dailyCash: 152,
    dailyPowerCost: 0,
    workloadContribution: 1,
    heat: 6.1,
    repGain: 0.68
  },
  {
    id: 'asw-photon-cage',
    supplierId: 'asw',
    role: 'compute',
    tier: 3,
    repRequired: 68,
    name: 'Photon Cage',
    cost: 1480,
    dailyCash: 325,
    dailyPowerCost: 0,
    workloadContribution: 1,
    heat: 10.2,
    repGain: 1.1
  },
  {
    id: 'macrohard-legacy-rack',
    supplierId: 'macrohard',
    role: 'compute',
    tier: 1,
    repRequired: 0,
    name: 'Legacy Rack',
    cost: 280,
    dailyCash: 74,
    dailyPowerCost: 0,
    workloadContribution: 1,
    heat: 2.9,
    repGain: 0.38
  },
  {
    id: 'macrohard-enterprise-cube',
    supplierId: 'macrohard',
    role: 'compute',
    tier: 2,
    repRequired: 32,
    name: 'Enterprise Cube',
    cost: 760,
    dailyCash: 168,
    dailyPowerCost: 0,
    workloadContribution: 1,
    heat: 6.2,
    repGain: 0.72
  },
  {
    id: 'macrohard-quantum-crate',
    supplierId: 'macrohard',
    role: 'compute',
    tier: 3,
    repRequired: 74,
    name: 'Quantum Crate',
    cost: 1690,
    dailyCash: 356,
    dailyPowerCost: 0,
    workloadContribution: 1,
    heat: 11.6,
    repGain: 1.22
  }
]

export const OFFER_BY_ID = OFFERS.reduce(
  (acc, offer) => {
    acc[offer.id] = offer
    return acc
  },
  {} as Record<string, RackOffer>
)

export const getOfferClientInterestRequired = (offer: RackOffer): number => {
  if (typeof offer.clientInterestRequired === 'number') {
    return Math.max(0, Math.floor(offer.clientInterestRequired))
  }

  if (offer.tier <= 1) return 0
  if (offer.tier === 2) {
    return offer.role === 'compute' ? 8 : 6
  }

  return offer.role === 'compute' ? 16 : 12
}

export function getOfferGroups(interestedClients: number): Record<SupplierId, SupplierOfferView[]> {
  const groups = SUPPLIERS.reduce(
    (acc, supplier) => {
      acc[supplier.id] = []
      return acc
    },
    {} as Record<SupplierId, SupplierOfferView[]>
  )

  for (const offer of OFFERS) {
    const clientInterestRequired = getOfferClientInterestRequired(offer)
    groups[offer.supplierId].push({
      offer,
      clientInterestRequired,
      locked: interestedClients < clientInterestRequired
    })
  }

  for (const supplier of SUPPLIERS) {
    groups[supplier.id].sort((a, b) => a.offer.tier - b.offer.tier)
  }

  return groups
}
