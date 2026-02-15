/**
 * Mech Part Data - All mech parts defined in JSON-friendly format
 * This file is the single source of truth for all mech parts
 * Edit this file to adjust game balance
 */

import type { ArmPart, CorePart, LegsPart, HeadPart, RackPart, SynergyEffect } from '../types/MechTypes'

// ============================================================================
// ARM PARTS
// ============================================================================

export const ARM_PARTS: ArmPart[] = [
  {
    id: 'arm-autocannon-mk1',
    name: 'M61 Autocannon',
    type: 'arm',
    weaponType: 'ballistic',
    icon: 'autocannon',
    description: '20mm rotary cannon with high rate of fire',
    stats: { health: 10, armor: 5, speed: 0, energy: -10, firepower: 50, accuracy: 15 },
    weight: 8,
    powerDraw: 5,
    fireRate: 0.12,
    pros: ['High rate of fire', 'Good accuracy', 'Low energy draw'],
    cons: ['Limited range', 'Ammo dependent'],
    rarity: 'common',
    manufacturer: 'ArmsCore',
    synergyTags: ['ballistic', 'rapid-fire'],
    modelPath: '/models/arms/autocannon.glb'
  },
  {
    id: 'arm-railgun',
    name: 'Mk8 Railgun',
    type: 'arm',
    weaponType: 'energy',
    icon: 'railgun',
    description: 'High-powered electromagnetic accelerator - devastating single shots',
    stats: { health: 5, armor: 0, speed: -5, energy: -30, firepower: 400, accuracy: 25 },
    weight: 12,
    powerDraw: 25,
    fireRate: 2.0,
    pros: ['Armor piercing', 'Extreme range', 'High velocity'],
    cons: ['High energy cost', 'Slow rate of fire', 'Heavy'],
    rarity: 'rare',
    manufacturer: 'VoltTech',
    synergyTags: ['energy', 'precision', 'heavy-weapon'],
    modelPath: '/models/arms/railgun.glb'
  },
  {
    id: 'arm-pile-driver',
    name: 'Hydraulic Pile Driver',
    type: 'arm',
    weaponType: 'melee',
    icon: 'pile-driver',
    description: 'Devastating pneumatic ram capable of crippling enemies in one strike',
    stats: { health: 20, armor: 15, speed: 5, energy: -5, firepower: 320, accuracy: 10 },
    weight: 15,
    powerDraw: 10,
    pros: ['No ammo', 'Structural damage', 'Bonus armor'],
    cons: ['Melee only', 'Close range required'],
    rarity: 'uncommon',
    manufacturer: 'TitanForge',
    synergyTags: ['melee', 'heavy'],
    modelPath: '/models/arms/pile-driver.glb'
  },
  {
    id: 'arm-missile-pod',
    name: 'SRM-6 Missile Pod',
    type: 'arm',
    weaponType: 'ballistic',
    icon: 'missile-pod',
    description: 'Six-tube launcher fires full salvo for devastating alpha strikes',
    stats: { health: 8, armor: 3, speed: 0, energy: -15, firepower: 100, accuracy: 8 },
    weight: 10,
    powerDraw: 15,
    fireRate: 1.0,
    projectileCount: 6,
    pros: ['Massive burst damage', 'Area effect', 'Good against groups'],
    cons: ['Low accuracy', 'Ammo limited', 'Reload time'],
    rarity: 'uncommon',
    manufacturer: 'ArmsCore',
    synergyTags: ['ballistic', 'explosive'],
    modelPath: '/models/arms/missile-pod.glb'
  },
  {
    id: 'arm-flamer',
    name: 'Type-7 Flamethrower',
    type: 'arm',
    weaponType: 'energy',
    icon: 'flamethrower',
    description: 'High-pressure napalm projector',
    stats: { health: 12, armor: 5, speed: 0, energy: -20, firepower: 240, accuracy: 12 },
    weight: 9,
    powerDraw: 20,
    fireRate: 0.4,
    pros: ['Area denial', 'No ammo', 'Persistent damage'],
    cons: ['Very short range', 'High energy use', 'Collateral damage'],
    rarity: 'common',
    manufacturer: 'InfernoTech',
    synergyTags: ['energy', 'area-effect'],
    modelPath: '/models/arms/flamethrower.glb'
  },
  {
    id: 'arm-shield-gen',
    name: 'Aegis Shield Generator',
    type: 'arm',
    weaponType: 'support',
    icon: 'shield-gen',
    description: 'Directional energy shield projector',
    stats: { health: 15, armor: 25, speed: -3, energy: -25, firepower: 0, accuracy: 0 },
    weight: 7,
    powerDraw: 0,
    pros: ['Blocks incoming fire', 'Energy resistant', 'Regenerates'],
    cons: ['No offensive capability', 'High energy drain', 'Directional only'],
    rarity: 'rare',
    manufacturer: 'VoltTech',
    synergyTags: ['energy', 'defensive'],
    modelPath: '/models/arms/shield-generator.glb'
  }
]

// ============================================================================
// CORE PARTS
// ============================================================================

export const CORE_PARTS: CorePart[] = [
  {
    id: 'core-diesel-gen',
    name: 'D9 Diesel Generator',
    type: 'core',
    icon: 'diesel-gen',
    description: 'Reliable diesel-electric hybrid core',
    stats: { health: 100, armor: 25, speed: 0, energy: 50, firepower: 0, accuracy: 0 },
    weight: 35,
    pros: ['Reliable', 'Easy maintenance', 'Balanced output'],
    cons: ['Moderate energy', 'No special features'],
    rarity: 'common',
    powerOutput: 50,
    slots: 2,
    manufacturer: 'PowerGen',
    synergyTags: ['balanced'],
    modelPath: '/models/core/diesel-generator.glb'
  },
  {
    id: 'core-fusion',
    name: 'FR-12 Fusion Reactor',
    type: 'core',
    icon: 'fusion-reactor',
    description: 'Compact fusion reactor with massive output',
    stats: { health: 120, armor: 20, speed: -10, energy: 100, firepower: 0, accuracy: 0 },
    weight: 50,
    pros: ['Massive energy', 'Powers heavy weapons', '4 equipment slots'],
    cons: ['Heavy', 'Reduced speed', 'Radiation shielding required'],
    rarity: 'legendary',
    powerOutput: 100,
    slots: 4,
    manufacturer: 'VoltTech',
    synergyTags: ['energy', 'heavy'],
    modelPath: '/models/core/fusion-reactor.glb'
  },
  {
    id: 'core-gas-turbine',
    name: 'GT-440 Gas Turbine',
    type: 'core',
    icon: 'gas-turbine',
    description: 'High-RPM turbine for mobility-focused builds',
    stats: { health: 80, armor: 15, speed: 15, energy: 40, firepower: 0, accuracy: 0 },
    weight: 28,
    pros: ['Lightweight', 'Speed boost', 'Quick startup'],
    cons: ['Lower energy output', 'Fragile', 'Fuel inefficient'],
    rarity: 'uncommon',
    powerOutput: 40,
    slots: 2,
    manufacturer: 'SwiftDrive',
    synergyTags: ['mobility', 'light'],
    modelPath: '/models/core/gas-turbine.glb'
  },
  {
    id: 'core-capacitor-bank',
    name: 'C-Series Capacitor Bank',
    type: 'core',
    icon: 'capacitor-bank',
    description: 'Ultra-capacitor array for burst power delivery',
    stats: { health: 90, armor: 18, speed: 0, energy: 70, firepower: 5, accuracy: 0 },
    weight: 30,
    pros: ['High burst output', 'Energy weapon bonus', 'Fast recharge'],
    cons: ['No sustained output', 'Requires downtime', 'Expensive'],
    rarity: 'rare',
    powerOutput: 70,
    slots: 3,
    manufacturer: 'VoltTech',
    synergyTags: ['energy', 'burst'],
    modelPath: '/models/core/capacitor-bank.glb'
  }
]

// ============================================================================
// LEGS PARTS
// ============================================================================

export const LEGS_PARTS: LegsPart[] = [
  {
    id: 'legs-bipedal-standard',
    name: 'Standard Bipedal Frame',
    type: 'legs',
    mobilityType: 'bipedal',
    icon: 'bipedal',
    description: 'Standard two-legged walker configuration',
    stats: { health: 80, armor: 20, speed: 10, energy: 0, firepower: 0, accuracy: 5 },
    weight: 20,
    powerCapacity: 100,
    pros: ['Balanced mobility', 'Good stability', 'All-terrain'],
    cons: ['Nothing exceptional', 'Average speed'],
    rarity: 'common',
    manufacturer: 'GenMech',
    synergyTags: ['balanced'],
    modelPath: '/models/legs/bipedal-standard.glb'
  },
  {
    id: 'legs-tracked-heavy',
    name: 'T-90 Heavy Tracks',
    type: 'legs',
    mobilityType: 'tracked',
    icon: 'tracked',
    description: 'Military-grade tank treads for maximum stability',
    stats: { health: 120, armor: 40, speed: -5, energy: 0, firepower: 0, accuracy: 10 },
    weight: 30,
    powerCapacity: 120,
    pros: ['Extreme stability', 'Heavy armor', 'Perfect firing platform'],
    cons: ['Slow', 'Difficult terrain penalties', 'Heavy'],
    rarity: 'uncommon',
    manufacturer: 'ArmorWorks',
    synergyTags: ['heavy', 'defensive'],
    modelPath: '/models/legs/tracked-heavy.glb'
  },
  {
    id: 'legs-hover',
    name: 'Graviton Hover System',
    type: 'legs',
    mobilityType: 'hover',
    icon: 'hover',
    description: 'Anti-gravity propulsion for maximum mobility',
    stats: { health: 50, armor: 10, speed: 25, energy: -20, firepower: 0, accuracy: -5 },
    weight: 15,
    powerCapacity: 80,
    pros: ['Very fast', 'Ignores terrain', 'Evasion bonus'],
    cons: ['Fragile', 'Energy drain', 'Unstable firing platform'],
    rarity: 'rare',
    manufacturer: 'SwiftDrive',
    synergyTags: ['mobility', 'light'],
    modelPath: '/models/legs/hover-system.glb'
  },
  {
    id: 'legs-quad',
    name: 'Quadrupedal Chassis',
    type: 'legs',
    mobilityType: 'quadrupedal',
    icon: 'quadrupedal',
    description: 'Four-legged walker for rough terrain',
    stats: { health: 100, armor: 25, speed: 8, energy: 0, firepower: 0, accuracy: 8 },
    weight: 25,
    powerCapacity: 110,
    pros: ['Very stable', 'Excellent terrain handling', 'Good load capacity'],
    cons: ['Complex mechanics', 'Maintenance intensive', 'Slower than bipedal'],
    rarity: 'uncommon',
    manufacturer: 'TitanForge',
    synergyTags: ['stability', 'heavy'],
    modelPath: '/models/legs/quadrupedal.glb'
  }
]

// ============================================================================
// HEAD PARTS
// ============================================================================

export const HEAD_PARTS: HeadPart[] = [
  {
    id: 'head-standard-optics',
    name: 'Standard Optics Package',
    type: 'head',
    icon: 'standard-optics',
    description: 'Basic visual and thermal sensors',
    stats: { health: 30, armor: 10, speed: 0, energy: -5, firepower: 0, accuracy: 10 },
    weight: 8,
    pros: ['Reliable', 'Low cost', 'Good visibility'],
    cons: ['Basic sensors', 'No advanced targeting'],
    rarity: 'common',
    manufacturer: 'GenMech',
    sensorRange: 500,
    targetingBonus: 10,
    targetingConeAngle: 15,
    synergyTags: ['balanced'],
    modelPath: '/models/head/standard-optics.glb'
  },
  {
    id: 'head-targeting-array',
    name: 'Advanced Targeting Array',
    type: 'head',
    icon: 'targeting-array',
    description: 'Military-grade fire control system',
    stats: { health: 25, armor: 8, speed: 0, energy: -15, firepower: 0, accuracy: 25 },
    weight: 10,
    pros: ['Excellent accuracy', 'Target tracking', 'Weak point detection'],
    cons: ['Fragile', 'High energy use', 'Expensive'],
    rarity: 'rare',
    manufacturer: 'VoltTech',
    sensorRange: 800,
    targetingBonus: 25,
    targetingConeAngle: 25,
    synergyTags: ['precision', 'energy'],
    modelPath: '/models/head/targeting-array.glb'
  },
  {
    id: 'head-reinforced',
    name: 'Reinforced Command Pod',
    type: 'head',
    icon: 'reinforced',
    description: 'Heavily armored cockpit for survivability',
    stats: { health: 60, armor: 30, speed: 0, energy: 0, firepower: 0, accuracy: 5 },
    weight: 15,
    pros: ['Very durable', 'Pilot protection', 'EMP resistant'],
    cons: ['Limited sensors', 'Heavy', 'Reduced visibility'],
    rarity: 'uncommon',
    manufacturer: 'ArmorWorks',
    sensorRange: 350,
    targetingBonus: 5,
    targetingConeAngle: 10,
    synergyTags: ['defensive', 'heavy'],
    modelPath: '/models/head/reinforced-pod.glb'
  },
  {
    id: 'head-scout-suite',
    name: 'Scout Sensor Suite',
    type: 'head',
    icon: 'scout-suite',
    description: 'Long-range reconnaissance sensors',
    stats: { health: 20, armor: 5, speed: 5, energy: -10, firepower: 0, accuracy: 15 },
    weight: 5,
    pros: ['Extended range', 'Multi-spectrum', 'Threat detection'],
    cons: ['Very fragile', 'No armor', 'Vulnerable to EMP'],
    rarity: 'uncommon',
    manufacturer: 'SwiftDrive',
    sensorRange: 1200,
    targetingBonus: 15,
    targetingConeAngle: 20,
    synergyTags: ['mobility', 'light'],
    modelPath: '/models/head/scout-suite.glb'
  }
]

// ============================================================================
// RACK PARTS
// ============================================================================

export const RACK_PARTS: RackPart[] = [
  {
    id: 'rack-smoke-launcher',
    name: 'Smoke Launcher System',
    type: 'rack',
    icon: 'smoke-launcher',
    description: 'Deploys smoke screens for cover',
    stats: { health: 5, armor: 0, speed: 0, energy: 0, firepower: 0, accuracy: -5 },
    weight: 8,
    pros: ['Breaks lock-on', 'Concealment', 'Escape tool'],
    cons: ['Obscures own vision', 'Limited charges'],
    rarity: 'common',
    manufacturer: 'TacticalSys',
    specialAbility: 'Deploy smoke screen (3 charges)',
    synergyTags: ['tactical', 'defensive'],
    modelPath: '/models/rack/smoke-launcher.glb'
  },
  {
    id: 'rack-ammo-feed',
    name: 'Extended Ammo Feed',
    type: 'rack',
    icon: 'ammo-feed',
    description: 'Additional ammunition storage and feed system',
    stats: { health: 10, armor: 5, speed: -3, energy: 0, firepower: 10, accuracy: 0 },
    weight: 12,
    pros: ['More ammo', 'Sustained fire', 'Faster reload'],
    cons: ['Heavy', 'Explosive if hit', 'Only helps ballistic weapons'],
    rarity: 'uncommon',
    manufacturer: 'ArmsCore',
    specialAbility: '+50% ammo capacity for ballistic weapons',
    synergyTags: ['ballistic', 'heavy'],
    modelPath: '/models/rack/ammo-feed.glb'
  },
  {
    id: 'rack-jump-jets',
    name: 'Jump Jet Pack',
    type: 'rack',
    icon: 'jump-jets',
    description: 'Short-burst rockets for vertical mobility',
    stats: { health: 8, armor: 0, speed: 15, energy: -15, firepower: 0, accuracy: 0 },
    weight: 10,
    pros: ['Vertical mobility', 'Obstacle clearing', 'Repositioning'],
    cons: ['Energy drain', 'Limited fuel', 'Unstable when firing'],
    rarity: 'rare',
    manufacturer: 'SwiftDrive',
    specialAbility: 'Short vertical jumps (recharge 10s)',
    synergyTags: ['mobility', 'light'],
    modelPath: '/models/rack/jump-jets.glb'
  },
  {
    id: 'rack-repair-drone',
    name: 'Auto-Repair Drone Bay',
    type: 'rack',
    icon: 'repair-drone',
    description: 'Autonomous repair drones for field maintenance',
    stats: { health: 15, armor: 5, speed: 0, energy: -10, firepower: 0, accuracy: 0 },
    weight: 15,
    pros: ['Passive healing', 'Repairs all components', 'Long duration'],
    cons: ['Slow repair rate', 'Energy drain', 'Vulnerable drones'],
    rarity: 'legendary',
    manufacturer: 'GenMech',
    specialAbility: 'Restore 5 HP/sec when out of combat',
    synergyTags: ['support', 'defensive'],
    modelPath: '/models/rack/repair-drone.glb'
  }
]

// ============================================================================
// SYNERGIES
// ============================================================================

export const SYNERGIES: SynergyEffect[] = [
  {
    id: 'heavy-assault',
    name: 'Heavy Assault Platform',
    description: 'Reinforced chassis and heavy weapons create a devastating tank',
    icon: 'synergy-shield',
    requiredParts: ['core-fusion', 'legs-tracked-heavy'],
    statBonus: { health: 50, armor: 30 },
    specialEffect: 'Reduced terrain penalties'
  },
  {
    id: 'dual-ballistic',
    name: 'Dual Ballistic Weapons',
    description: 'Matched ballistic weapons improve fire coordination',
    icon: 'synergy-target',
    requiredParts: ['arm-autocannon-mk1', 'arm-autocannon-mk1'],
    statBonus: { accuracy: 20, firepower: 15 },
    specialEffect: 'Synchronized fire mode available'
  },
  {
    id: 'volttech-suite',
    name: 'VoltTech Integration',
    description: 'VoltTech components operate with peak efficiency together',
    icon: 'capacitor-bank',
    requiredParts: ['core-fusion', 'arm-railgun', 'head-targeting-array'],
    statBonus: { energy: 20, accuracy: 25 },
    specialEffect: 'Energy weapons recharge 30% faster'
  },
  {
    id: 'scout-config',
    name: 'Scout Configuration',
    description: 'Light, fast build optimized for reconnaissance',
    icon: 'scout',
    requiredParts: ['legs-hover', 'head-scout-suite', 'core-gas-turbine'],
    statBonus: { speed: 20, accuracy: 10 },
    specialEffect: 'Extended sensor range and evasion bonus'
  },
  {
    id: 'melee-brawler',
    name: 'Melee Brawler',
    description: 'Heavy armor and melee weapons for close combat',
    icon: 'fist',
    requiredParts: ['arm-pile-driver', 'legs-quad', 'head-reinforced'],
    statBonus: { health: 40, armor: 25, firepower: 20 },
    specialEffect: 'Melee damage increased, charge attack unlocked'
  },
  {
    id: 'missile-barrage',
    name: 'Missile Barrage',
    description: 'Dual missile systems with extended ammunition',
    icon: 'explosion',
    requiredParts: ['arm-missile-pod', 'arm-missile-pod', 'rack-ammo-feed'],
    statBonus: { firepower: 30, accuracy: 10 },
    specialEffect: 'Salvo mode: Fire all missiles simultaneously'
  },
  {
    id: 'energy-fortress',
    name: 'Energy Fortress',
    description: 'Shield generator and high energy output for defense',
    icon: 'synergy-fortress',
    requiredParts: ['arm-shield-gen', 'core-capacitor-bank'],
    statBonus: { armor: 35, energy: 25 },
    specialEffect: 'Shield regenerates twice as fast'
  }
]

// ============================================================================
// LOOKUP HELPERS
// ============================================================================

/** All parts combined for easy lookup */
export const ALL_PARTS = [
  ...ARM_PARTS,
  ...CORE_PARTS,
  ...LEGS_PARTS,
  ...HEAD_PARTS,
  ...RACK_PARTS
]

/**
 * Find a part by its ID
 */
export function findPartById(id: string) {
  return ALL_PARTS.find(part => part.id === id) ?? null
}

/**
 * Get all parts of a specific type
 */
export function getPartsByType(type: 'arm'): ArmPart[]
export function getPartsByType(type: 'core'): CorePart[]
export function getPartsByType(type: 'legs'): LegsPart[]
export function getPartsByType(type: 'head'): HeadPart[]
export function getPartsByType(type: 'rack'): RackPart[]
export function getPartsByType(type: string) {
  switch (type) {
    case 'arm': return ARM_PARTS
    case 'core': return CORE_PARTS
    case 'legs': return LEGS_PARTS
    case 'head': return HEAD_PARTS
    case 'rack': return RACK_PARTS
    default: return []
  }
}
