import { ref, computed } from 'vue'

// Base stats contributed by all parts
export interface MechStats {
  health: number        // Survivability
  armor: number         // Damage reduction
  speed: number         // Movement/evasion
  energy: number        // Power capacity
  firepower: number     // Damage output
  accuracy: number      // Hit chance
}

// Synergy effect activated by part combinations
export interface SynergyEffect {
  id: string
  name: string
  description: string
  icon: string
  requiredParts: string[]              // Part IDs that must be equipped
  statBonus: Partial<MechStats>        // Additive bonuses
  specialEffect?: string               // Flavor text
}

// Base part interface
export interface MechPart {
  id: string
  name: string
  type: 'arm' | 'core' | 'legs' | 'head' | 'rack'
  icon: string                         // Emoji for visual display
  description: string
  stats: MechStats
  pros: string[]                       // Positive attributes
  cons: string[]                       // Negative attributes
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
  manufacturer?: string                // Lore element
  synergyTags?: string[]              // Tags for synergy matching
}

// Specialized part types
export interface ArmPart extends MechPart {
  type: 'arm'
  weaponType: 'ballistic' | 'energy' | 'melee' | 'support'
}

export interface CorePart extends MechPart {
  type: 'core'
  powerOutput: number                  // Energy generation
  slots: number                        // Equipment slots
}

export interface LegsPart extends MechPart {
  type: 'legs'
  mobilityType: 'bipedal' | 'quadrupedal' | 'hover' | 'tracked'
}

export interface HeadPart extends MechPart {
  type: 'head'
  sensorRange: number
  targetingBonus: number
}

export interface RackPart extends MechPart {
  type: 'rack'
  specialAbility: string
}

// Current loadout
export interface MechLoadout {
  leftArm: ArmPart | null
  rightArm: ArmPart | null
  core: CorePart | null
  legs: LegsPart | null
  head: HeadPart | null
  rack: RackPart | null
}

// Saved build
export interface SavedBuild {
  name: string
  timestamp: number
  loadout: MechLoadout
}

// ARM PRESETS
export const ARM_PRESETS: ArmPart[] = [
  {
    id: 'arm-autocannon-mk1',
    name: 'M61 Autocannon',
    type: 'arm',
    weaponType: 'ballistic',
    icon: 'autocannon',
    description: '20mm rotary cannon with high rate of fire',
    stats: { health: 10, armor: 5, speed: 0, energy: -10, firepower: 25, accuracy: 15 },
    pros: ['High rate of fire', 'Good accuracy', 'Low energy draw'],
    cons: ['Limited range', 'Ammo dependent'],
    rarity: 'common',
    manufacturer: 'ArmsCore',
    synergyTags: ['ballistic', 'rapid-fire']
  },
  {
    id: 'arm-railgun',
    name: 'Mk8 Railgun',
    type: 'arm',
    weaponType: 'energy',
    icon: 'railgun',
    description: 'Electromagnetic accelerator firing tungsten rounds',
    stats: { health: 5, armor: 0, speed: -5, energy: -30, firepower: 50, accuracy: 25 },
    pros: ['Armor piercing', 'Extreme range', 'High velocity'],
    cons: ['High energy cost', 'Slow rate of fire', 'Heavy'],
    rarity: 'rare',
    manufacturer: 'VoltTech',
    synergyTags: ['energy', 'precision', 'heavy-weapon']
  },
  {
    id: 'arm-pile-driver',
    name: 'Hydraulic Pile Driver',
    type: 'arm',
    weaponType: 'melee',
    icon: 'pile-driver',
    description: 'Pneumatic ram for devastating close combat',
    stats: { health: 20, armor: 15, speed: 5, energy: -5, firepower: 40, accuracy: 10 },
    pros: ['No ammo', 'Structural damage', 'Bonus armor'],
    cons: ['Melee only', 'Close range required'],
    rarity: 'uncommon',
    manufacturer: 'TitanForge',
    synergyTags: ['melee', 'heavy']
  },
  {
    id: 'arm-missile-pod',
    name: 'SRM-6 Missile Pod',
    type: 'arm',
    weaponType: 'ballistic',
    icon: 'missile-pod',
    description: 'Six-tube short-range missile launcher',
    stats: { health: 8, armor: 3, speed: 0, energy: -15, firepower: 35, accuracy: 8 },
    pros: ['Burst damage', 'Area effect', 'Good against groups'],
    cons: ['Low accuracy', 'Ammo limited', 'Reload time'],
    rarity: 'uncommon',
    manufacturer: 'ArmsCore',
    synergyTags: ['ballistic', 'explosive']
  },
  {
    id: 'arm-flamer',
    name: 'Type-7 Flamethrower',
    type: 'arm',
    weaponType: 'energy',
    icon: 'flamethrower',
    description: 'High-pressure napalm projector',
    stats: { health: 12, armor: 5, speed: 0, energy: -20, firepower: 30, accuracy: 12 },
    pros: ['Area denial', 'No ammo', 'Persistent damage'],
    cons: ['Very short range', 'High energy use', 'Collateral damage'],
    rarity: 'common',
    manufacturer: 'InfernoTech',
    synergyTags: ['energy', 'area-effect']
  },
  {
    id: 'arm-shield-gen',
    name: 'Aegis Shield Generator',
    type: 'arm',
    weaponType: 'support',
    icon: 'shield-gen',
    description: 'Directional energy shield projector',
    stats: { health: 15, armor: 25, speed: -3, energy: -25, firepower: 0, accuracy: 0 },
    pros: ['Blocks incoming fire', 'Energy resistant', 'Regenerates'],
    cons: ['No offensive capability', 'High energy drain', 'Directional only'],
    rarity: 'rare',
    manufacturer: 'VoltTech',
    synergyTags: ['energy', 'defensive']
  }
]

// CORE PRESETS
export const CORE_PRESETS: CorePart[] = [
  {
    id: 'core-diesel-gen',
    name: 'D9 Diesel Generator',
    type: 'core',
    icon: 'diesel-gen',
    description: 'Reliable diesel-electric hybrid core',
    stats: { health: 100, armor: 25, speed: 0, energy: 50, firepower: 0, accuracy: 0 },
    pros: ['Reliable', 'Easy maintenance', 'Balanced output'],
    cons: ['Moderate energy', 'No special features'],
    rarity: 'common',
    powerOutput: 50,
    slots: 2,
    manufacturer: 'PowerGen',
    synergyTags: ['balanced']
  },
  {
    id: 'core-fusion',
    name: 'FR-12 Fusion Reactor',
    type: 'core',
    icon: 'fusion-reactor',
    description: 'Compact fusion reactor with massive output',
    stats: { health: 120, armor: 20, speed: -10, energy: 100, firepower: 0, accuracy: 0 },
    pros: ['Massive energy', 'Powers heavy weapons', '4 equipment slots'],
    cons: ['Heavy', 'Reduced speed', 'Radiation shielding required'],
    rarity: 'legendary',
    powerOutput: 100,
    slots: 4,
    manufacturer: 'VoltTech',
    synergyTags: ['energy', 'heavy']
  },
  {
    id: 'core-gas-turbine',
    name: 'GT-440 Gas Turbine',
    type: 'core',
    icon: 'gas-turbine',
    description: 'High-RPM turbine for mobility-focused builds',
    stats: { health: 80, armor: 15, speed: 15, energy: 40, firepower: 0, accuracy: 0 },
    pros: ['Lightweight', 'Speed boost', 'Quick startup'],
    cons: ['Lower energy output', 'Fragile', 'Fuel inefficient'],
    rarity: 'uncommon',
    powerOutput: 40,
    slots: 2,
    manufacturer: 'SwiftDrive',
    synergyTags: ['mobility', 'light']
  },
  {
    id: 'core-capacitor-bank',
    name: 'C-Series Capacitor Bank',
    type: 'core',
    icon: 'capacitor-bank',
    description: 'Ultra-capacitor array for burst power delivery',
    stats: { health: 90, armor: 18, speed: 0, energy: 70, firepower: 5, accuracy: 0 },
    pros: ['High burst output', 'Energy weapon bonus', 'Fast recharge'],
    cons: ['No sustained output', 'Requires downtime', 'Expensive'],
    rarity: 'rare',
    powerOutput: 70,
    slots: 3,
    manufacturer: 'VoltTech',
    synergyTags: ['energy', 'burst']
  }
]

// LEGS PRESETS
export const LEGS_PRESETS: LegsPart[] = [
  {
    id: 'legs-bipedal-standard',
    name: 'Standard Bipedal Frame',
    type: 'legs',
    mobilityType: 'bipedal',
    icon: 'bipedal',
    description: 'Standard two-legged walker configuration',
    stats: { health: 80, armor: 20, speed: 10, energy: 0, firepower: 0, accuracy: 5 },
    pros: ['Balanced mobility', 'Good stability', 'All-terrain'],
    cons: ['Nothing exceptional', 'Average speed'],
    rarity: 'common',
    manufacturer: 'GenMech',
    synergyTags: ['balanced']
  },
  {
    id: 'legs-tracked-heavy',
    name: 'T-90 Heavy Tracks',
    type: 'legs',
    mobilityType: 'tracked',
    icon: 'tracked',
    description: 'Military-grade tank treads for maximum stability',
    stats: { health: 120, armor: 40, speed: -5, energy: 0, firepower: 0, accuracy: 10 },
    pros: ['Extreme stability', 'Heavy armor', 'Perfect firing platform'],
    cons: ['Slow', 'Difficult terrain penalties', 'Heavy'],
    rarity: 'uncommon',
    manufacturer: 'ArmorWorks',
    synergyTags: ['heavy', 'defensive']
  },
  {
    id: 'legs-hover',
    name: 'Graviton Hover System',
    type: 'legs',
    mobilityType: 'hover',
    icon: 'hover',
    description: 'Anti-gravity propulsion for maximum mobility',
    stats: { health: 50, armor: 10, speed: 25, energy: -20, firepower: 0, accuracy: -5 },
    pros: ['Very fast', 'Ignores terrain', 'Evasion bonus'],
    cons: ['Fragile', 'Energy drain', 'Unstable firing platform'],
    rarity: 'rare',
    manufacturer: 'SwiftDrive',
    synergyTags: ['mobility', 'light']
  },
  {
    id: 'legs-quad',
    name: 'Quadrupedal Chassis',
    type: 'legs',
    mobilityType: 'quadrupedal',
    icon: 'quadrupedal',
    description: 'Four-legged walker for rough terrain',
    stats: { health: 100, armor: 25, speed: 8, energy: 0, firepower: 0, accuracy: 8 },
    pros: ['Very stable', 'Excellent terrain handling', 'Good load capacity'],
    cons: ['Complex mechanics', 'Maintenance intensive', 'Slower than bipedal'],
    rarity: 'uncommon',
    manufacturer: 'TitanForge',
    synergyTags: ['stability', 'heavy']
  }
]

// HEAD PRESETS
export const HEAD_PRESETS: HeadPart[] = [
  {
    id: 'head-standard-optics',
    name: 'Standard Optics Package',
    type: 'head',
    icon: 'standard-optics',
    description: 'Basic visual and thermal sensors',
    stats: { health: 30, armor: 10, speed: 0, energy: -5, firepower: 0, accuracy: 10 },
    pros: ['Reliable', 'Low cost', 'Good visibility'],
    cons: ['Basic sensors', 'No advanced targeting'],
    rarity: 'common',
    manufacturer: 'GenMech',
    sensorRange: 500,
    targetingBonus: 10,
    synergyTags: ['balanced']
  },
  {
    id: 'head-targeting-array',
    name: 'Advanced Targeting Array',
    type: 'head',
    icon: 'targeting-array',
    description: 'Military-grade fire control system',
    stats: { health: 25, armor: 8, speed: 0, energy: -15, firepower: 0, accuracy: 25 },
    pros: ['Excellent accuracy', 'Target tracking', 'Weak point detection'],
    cons: ['Fragile', 'High energy use', 'Expensive'],
    rarity: 'rare',
    manufacturer: 'VoltTech',
    sensorRange: 800,
    targetingBonus: 25,
    synergyTags: ['precision', 'energy']
  },
  {
    id: 'head-reinforced',
    name: 'Reinforced Command Pod',
    type: 'head',
    icon: 'reinforced',
    description: 'Heavily armored cockpit for survivability',
    stats: { health: 60, armor: 30, speed: 0, energy: 0, firepower: 0, accuracy: 5 },
    pros: ['Very durable', 'Pilot protection', 'EMP resistant'],
    cons: ['Limited sensors', 'Heavy', 'Reduced visibility'],
    rarity: 'uncommon',
    manufacturer: 'ArmorWorks',
    sensorRange: 350,
    targetingBonus: 5,
    synergyTags: ['defensive', 'heavy']
  },
  {
    id: 'head-scout-suite',
    name: 'Scout Sensor Suite',
    type: 'head',
    icon: 'scout-suite',
    description: 'Long-range reconnaissance sensors',
    stats: { health: 20, armor: 5, speed: 5, energy: -10, firepower: 0, accuracy: 15 },
    pros: ['Extended range', 'Multi-spectrum', 'Threat detection'],
    cons: ['Very fragile', 'No armor', 'Vulnerable to EMP'],
    rarity: 'uncommon',
    manufacturer: 'SwiftDrive',
    sensorRange: 1200,
    targetingBonus: 15,
    synergyTags: ['mobility', 'light']
  }
]

// RACK PRESETS
export const RACK_PRESETS: RackPart[] = [
  {
    id: 'rack-smoke-launcher',
    name: 'Smoke Launcher System',
    type: 'rack',
    icon: 'smoke-launcher',
    description: 'Deploys smoke screens for cover',
    stats: { health: 5, armor: 0, speed: 0, energy: 0, firepower: 0, accuracy: -5 },
    pros: ['Breaks lock-on', 'Concealment', 'Escape tool'],
    cons: ['Obscures own vision', 'Limited charges'],
    rarity: 'common',
    manufacturer: 'TacticalSys',
    specialAbility: 'Deploy smoke screen (3 charges)',
    synergyTags: ['tactical', 'defensive']
  },
  {
    id: 'rack-ammo-feed',
    name: 'Extended Ammo Feed',
    type: 'rack',
    icon: 'ammo-feed',
    description: 'Additional ammunition storage and feed system',
    stats: { health: 10, armor: 5, speed: -3, energy: 0, firepower: 10, accuracy: 0 },
    pros: ['More ammo', 'Sustained fire', 'Faster reload'],
    cons: ['Heavy', 'Explosive if hit', 'Only helps ballistic weapons'],
    rarity: 'uncommon',
    manufacturer: 'ArmsCore',
    specialAbility: '+50% ammo capacity for ballistic weapons',
    synergyTags: ['ballistic', 'heavy']
  },
  {
    id: 'rack-jump-jets',
    name: 'Jump Jet Pack',
    type: 'rack',
    icon: 'jump-jets',
    description: 'Short-burst rockets for vertical mobility',
    stats: { health: 8, armor: 0, speed: 15, energy: -15, firepower: 0, accuracy: 0 },
    pros: ['Vertical mobility', 'Obstacle clearing', 'Repositioning'],
    cons: ['Energy drain', 'Limited fuel', 'Unstable when firing'],
    rarity: 'rare',
    manufacturer: 'SwiftDrive',
    specialAbility: 'Short vertical jumps (recharge 10s)',
    synergyTags: ['mobility', 'light']
  },
  {
    id: 'rack-repair-drone',
    name: 'Auto-Repair Drone Bay',
    type: 'rack',
    icon: 'repair-drone',
    description: 'Autonomous repair drones for field maintenance',
    stats: { health: 15, armor: 5, speed: 0, energy: -10, firepower: 0, accuracy: 0 },
    pros: ['Passive healing', 'Repairs all components', 'Long duration'],
    cons: ['Slow repair rate', 'Energy drain', 'Vulnerable drones'],
    rarity: 'legendary',
    manufacturer: 'GenMech',
    specialAbility: 'Restore 5 HP/sec when out of combat',
    synergyTags: ['support', 'defensive']
  }
]

// SYNERGY PRESETS
export const SYNERGY_PRESETS: SynergyEffect[] = [
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
    icon: '🏃',
    requiredParts: ['legs-hover', 'head-scout-suite', 'core-gas-turbine'],
    statBonus: { speed: 20, accuracy: 10 },
    specialEffect: 'Extended sensor range and evasion bonus'
  },
  {
    id: 'melee-brawler',
    name: 'Melee Brawler',
    description: 'Heavy armor and melee weapons for close combat',
    icon: '🥊',
    requiredParts: ['arm-pile-driver', 'legs-quad', 'head-reinforced'],
    statBonus: { health: 40, armor: 25, firepower: 20 },
    specialEffect: 'Melee damage increased, charge attack unlocked'
  },
  {
    id: 'missile-barrage',
    name: 'Missile Barrage',
    description: 'Dual missile systems with extended ammunition',
    icon: '💥',
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

// Helper function to find part by ID
function findPartById(id: string): MechPart | null {
  const allParts = [
    ...ARM_PRESETS,
    ...CORE_PRESETS,
    ...LEGS_PRESETS,
    ...HEAD_PRESETS,
    ...RACK_PRESETS
  ]
  return allParts.find(part => part.id === id) || null
}

export function useMechBuilder() {
  // State
  const loadout = ref<MechLoadout>({
    leftArm: null,
    rightArm: null,
    core: null,
    legs: null,
    head: null,
    rack: null
  })

  const savedBuilds = ref<SavedBuild[]>([])

  // Computed: Total stats including synergy bonuses
  const totalStats = computed(() => {
    const base: MechStats = {
      health: 0,
      armor: 0,
      speed: 0,
      energy: 0,
      firepower: 0,
      accuracy: 0
    }

    // Sum stats from all equipped parts
    Object.values(loadout.value).forEach(part => {
      if (part) {
        base.health += part.stats.health
        base.armor += part.stats.armor
        base.speed += part.stats.speed
        base.energy += part.stats.energy
        base.firepower += part.stats.firepower
        base.accuracy += part.stats.accuracy
      }
    })

    // Add synergy bonuses
    activeSynergies.value.forEach(synergy => {
      if (synergy.statBonus.health) base.health += synergy.statBonus.health
      if (synergy.statBonus.armor) base.armor += synergy.statBonus.armor
      if (synergy.statBonus.speed) base.speed += synergy.statBonus.speed
      if (synergy.statBonus.energy) base.energy += synergy.statBonus.energy
      if (synergy.statBonus.firepower) base.firepower += synergy.statBonus.firepower
      if (synergy.statBonus.accuracy) base.accuracy += synergy.statBonus.accuracy
    })

    return base
  })

  // Computed: Active synergies
  const activeSynergies = computed(() => {
    const active: SynergyEffect[] = []
    const equippedIds = Object.values(loadout.value)
      .filter(part => part !== null)
      .map(part => part!.id)

    SYNERGY_PRESETS.forEach(synergy => {
      // Check if all required parts are equipped
      const hasAll = synergy.requiredParts.every(id => equippedIds.includes(id))
      if (hasAll) {
        active.push(synergy)
      }
    })

    return active
  })

  // Computed: Threat level (0-100 scale)
  const threatLevel = computed(() => {
    const stats = totalStats.value
    // Weighted scoring
    const score = (
      stats.health * 0.5 +
      stats.armor * 1.0 +
      stats.speed * 0.8 +
      stats.energy * 0.3 +
      stats.firepower * 1.2 +
      stats.accuracy * 0.9
    ) / 10 // Normalize

    return Math.min(100, Math.max(0, Math.round(score)))
  })

  // Computed: Warnings
  const warnings = computed(() => {
    const warns: string[] = []

    if (!loadout.value.core) warns.push('No core equipped - mech inoperable')
    if (!loadout.value.legs) warns.push('No legs equipped - mech immobile')
    if (!loadout.value.head) warns.push('No head equipped - no sensors or targeting')
    if (!loadout.value.leftArm && !loadout.value.rightArm) {
      warns.push('No weapons equipped - defenseless')
    }
    if (totalStats.value.energy < 0) {
      warns.push(`Energy deficit: ${totalStats.value.energy} - weapons may be underpowered`)
    }

    return warns
  })

  // Computed: Build score
  const buildScore = computed(() => {
    const stats = totalStats.value
    const synergyBonus = activeSynergies.value.length * 10
    const completionBonus = warnings.value.length === 0 ? 20 : 0

    const base = (
      stats.health * 0.3 +
      stats.armor * 0.4 +
      stats.speed * 0.3 +
      (stats.energy > 0 ? stats.energy * 0.2 : 0) +
      stats.firepower * 0.5 +
      stats.accuracy * 0.4
    )

    return Math.round(base + synergyBonus + completionBonus)
  })

  // Computed: Is loadout complete
  const isComplete = computed(() => {
    return loadout.value.core !== null &&
           loadout.value.legs !== null &&
           loadout.value.head !== null
  })

  // Actions
  function selectPart(part: MechPart, slot: keyof MechLoadout) {
    loadout.value[slot] = part as any
    saveToBrowser()
  }

  function removePart(slot: keyof MechLoadout) {
    loadout.value[slot] = null
    saveToBrowser()
  }

  function resetBuild() {
    loadout.value = {
      leftArm: null,
      rightArm: null,
      core: null,
      legs: null,
      head: null,
      rack: null
    }
    saveToBrowser()
  }

  function randomizeBuild() {
    const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

    loadout.value = {
      leftArm: randomItem(ARM_PRESETS),
      rightArm: randomItem(ARM_PRESETS),
      core: randomItem(CORE_PRESETS),
      legs: randomItem(LEGS_PRESETS),
      head: randomItem(HEAD_PRESETS),
      rack: randomItem(RACK_PRESETS)
    }
    saveToBrowser()
  }

  function saveBuild(name: string) {
    const build: SavedBuild = {
      name,
      timestamp: Date.now(),
      loadout: { ...loadout.value }
    }
    savedBuilds.value.push(build)
    saveBuildsToStorage()
  }

  function loadBuild(index: number) {
    if (index >= 0 && index < savedBuilds.value.length) {
      loadout.value = { ...savedBuilds.value[index].loadout }
      saveToBrowser()
    }
  }

  function deleteBuild(index: number) {
    if (index >= 0 && index < savedBuilds.value.length) {
      savedBuilds.value.splice(index, 1)
      saveBuildsToStorage()
    }
  }

  function exportBuild(): string {
    const exportData = {
      leftArm: loadout.value.leftArm?.id || null,
      rightArm: loadout.value.rightArm?.id || null,
      core: loadout.value.core?.id || null,
      legs: loadout.value.legs?.id || null,
      head: loadout.value.head?.id || null,
      rack: loadout.value.rack?.id || null
    }
    return btoa(JSON.stringify(exportData))
  }

  function importBuild(code: string): boolean {
    try {
      const data = JSON.parse(atob(code))
      loadout.value.leftArm = data.leftArm ? findPartById(data.leftArm) as ArmPart : null
      loadout.value.rightArm = data.rightArm ? findPartById(data.rightArm) as ArmPart : null
      loadout.value.core = data.core ? findPartById(data.core) as CorePart : null
      loadout.value.legs = data.legs ? findPartById(data.legs) as LegsPart : null
      loadout.value.head = data.head ? findPartById(data.head) as HeadPart : null
      loadout.value.rack = data.rack ? findPartById(data.rack) as RackPart : null
      saveToBrowser()
      return true
    } catch {
      return false
    }
  }

  // Persistence
  function saveToBrowser() {
    try {
      localStorage.setItem('mechBuilder_loadout', JSON.stringify({
        leftArm: loadout.value.leftArm?.id || null,
        rightArm: loadout.value.rightArm?.id || null,
        core: loadout.value.core?.id || null,
        legs: loadout.value.legs?.id || null,
        head: loadout.value.head?.id || null,
        rack: loadout.value.rack?.id || null
      }))
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
    }
  }

  function loadFromBrowser() {
    try {
      const saved = localStorage.getItem('mechBuilder_loadout')
      if (saved) {
        const data = JSON.parse(saved)
        loadout.value.leftArm = data.leftArm ? findPartById(data.leftArm) as ArmPart : null
        loadout.value.rightArm = data.rightArm ? findPartById(data.rightArm) as ArmPart : null
        loadout.value.core = data.core ? findPartById(data.core) as CorePart : null
        loadout.value.legs = data.legs ? findPartById(data.legs) as LegsPart : null
        loadout.value.head = data.head ? findPartById(data.head) as HeadPart : null
        loadout.value.rack = data.rack ? findPartById(data.rack) as RackPart : null
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e)
    }
  }

  function saveBuildsToStorage() {
    try {
      localStorage.setItem('mechBuilder_savedBuilds', JSON.stringify(savedBuilds.value.map(build => ({
        name: build.name,
        timestamp: build.timestamp,
        loadout: {
          leftArm: build.loadout.leftArm?.id || null,
          rightArm: build.loadout.rightArm?.id || null,
          core: build.loadout.core?.id || null,
          legs: build.loadout.legs?.id || null,
          head: build.loadout.head?.id || null,
          rack: build.loadout.rack?.id || null
        }
      }))))
    } catch (e) {
      console.error('Failed to save builds to localStorage:', e)
    }
  }

  function loadBuildsFromStorage() {
    try {
      const saved = localStorage.getItem('mechBuilder_savedBuilds')
      if (saved) {
        const data = JSON.parse(saved)
        savedBuilds.value = data.map((build: any) => ({
          name: build.name,
          timestamp: build.timestamp,
          loadout: {
            leftArm: build.loadout.leftArm ? findPartById(build.loadout.leftArm) as ArmPart : null,
            rightArm: build.loadout.rightArm ? findPartById(build.loadout.rightArm) as ArmPart : null,
            core: build.loadout.core ? findPartById(build.loadout.core) as CorePart : null,
            legs: build.loadout.legs ? findPartById(build.loadout.legs) as LegsPart : null,
            head: build.loadout.head ? findPartById(build.loadout.head) as HeadPart : null,
            rack: build.loadout.rack ? findPartById(build.loadout.rack) as RackPart : null
          }
        }))
      }
    } catch (e) {
      console.error('Failed to load builds from localStorage:', e)
    }
  }

  return {
    // State
    loadout,
    savedBuilds,
    // Computed
    totalStats,
    activeSynergies,
    threatLevel,
    warnings,
    buildScore,
    isComplete,
    // Actions
    selectPart,
    removePart,
    resetBuild,
    randomizeBuild,
    saveBuild,
    loadBuild,
    deleteBuild,
    exportBuild,
    importBuild,
    saveToBrowser,
    loadFromBrowser,
    saveBuildsToStorage,
    loadBuildsFromStorage,
    // Presets
    ARM_PRESETS,
    CORE_PRESETS,
    LEGS_PRESETS,
    HEAD_PRESETS,
    RACK_PRESETS
  }
}
