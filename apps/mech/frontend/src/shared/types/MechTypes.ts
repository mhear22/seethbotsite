/**
 * Unified mech types for the entire application
 * Used by mech builder, battle system, and network layer
 */

// ============================================================================
// Base Stats
// ============================================================================

export interface MechStats {
  health: number        // Survivability
  armor: number         // Damage reduction
  speed: number         // Movement/evasion
  energy: number        // Power capacity
  firepower: number     // Damage output
  accuracy: number      // Hit chance
}

// ============================================================================
// Part Interfaces
// ============================================================================

export type PartType = 'arm' | 'core' | 'legs' | 'head' | 'rack'
// 'missile' is a first-class weapon type: it drives the homing-missile projectile
// path in ProjectileSystem (steering + trail). It is distinct from 'ballistic'
// (dumb-fire kinetic rounds) even though both are physically kinetic damage.
export type WeaponType = 'ballistic' | 'energy' | 'melee' | 'support' | 'missile'
export type MobilityType = 'bipedal' | 'quadrupedal' | 'hover' | 'tracked'
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary'

// ============================================================================
// Damage typing & resistances
// ============================================================================

/**
 * The three combat damage channels. A weapon deals exactly one; a chassis can
 * resist or be weak to each independently. Melee is intentionally its own
 * channel: per design it is "resisted only by range", so armour parts never
 * grant a melee resistance (see DamageResistances usage in MechEntity).
 */
export type DamageType = 'kinetic' | 'energy' | 'melee'

/**
 * Per-part resistance contribution, keyed by damage channel. Values are signed
 * fractions applied AFTER flat armour: +0.25 = take 25% less of that type,
 * -0.20 = take 20% more (a weakness). Contributions from every equipped part
 * sum, then clamp (see MechEntity.getResistance). Omitted channels contribute 0.
 */
export type DamageResistances = Partial<Record<DamageType, number>>

// ============================================================================
// Hit locations (design §3.3)
// ============================================================================

/**
 * The five destructible mech locations. Each maps 1:1 to a loadout slot and to
 * a sub-hitbox resolved in ProjectileSystem.checkCollisions. Limbs (leftArm /
 * rightArm / legs / head) carry an overlay HP pool derived from their part
 * stats; destroying one applies a delimb consequence (see MechEntity). `core`
 * is the death pool — a core hit / an unresolved hit damages `stats.currentHealth`
 * directly, exactly as before hit locations existed.
 */
export type MechSlot = 'leftArm' | 'rightArm' | 'legs' | 'head' | 'core'

// Base part interface
export interface MechPart {
  id: string
  name: string
  type: PartType
  icon: string                         // Icon identifier for visual display
  description: string
  stats: MechStats
  weight: number                       // Weight in arbitrary units (affects speed, acceleration, jump)
  pros: string[]                       // Positive attributes
  cons: string[]                       // Negative attributes
  rarity: Rarity
  manufacturer?: string                // Lore element
  synergyTags?: string[]              // Tags for synergy matching
  modelPath?: string                   // Path to 3D model file (e.g., '/models/arms/autocannon.glb')
  resistances?: DamageResistances      // Signed per-damage-type resistance this part grants (see DamageResistances)
}

// Specialized part types
export interface ArmPart extends MechPart {
  type: 'arm'
  weaponType: WeaponType
  powerDraw: number                    // Power consumed per shot
  fireRate?: number                    // Optional custom fire rate in seconds (cooldown between shots)
  projectileCount?: number             // Optional number of projectiles per shot (default: 1)
  // ---- Per-weapon combat identity (design §3.2 / §3.4). All optional so parts
  // that omit them fall back to per-weapon-type defaults in ProjectileSystem. ----
  damageType?: DamageType              // Combat channel this weapon deals (default derived from weaponType)
  projectileSpeed?: number             // Override muzzle velocity (u/s); default is per-projectile-type
  spread?: number                      // Override base inaccuracy cone (radians of half-jitter); default derives from accuracy
  armorPierce?: boolean                // If true, target's flat armour is halved against this weapon
  appliesBurn?: boolean                // If true, on-hit applies the flamer burn DoT (energy)
}

export interface CorePart extends MechPart {
  type: 'core'
  powerOutput: number                  // Energy generation
  slots: number                        // Equipment slots
}

export interface LegsPart extends MechPart {
  type: 'legs'
  mobilityType: MobilityType
  powerCapacity: number                // Maximum power pool
}

export interface HeadPart extends MechPart {
  type: 'head'
  sensorRange: number
  targetingBonus: number
  targetingConeAngle: number  // Targeting cone width in degrees
}

export interface RackPart extends MechPart {
  type: 'rack'
  specialAbility: string
}

// ============================================================================
// Loadout Types
// ============================================================================

/**
 * Full mech loadout with complete part objects
 * Used by the mech builder UI
 */
export interface MechLoadout {
  leftArm: ArmPart | null
  rightArm: ArmPart | null
  core: CorePart | null
  legs: LegsPart | null
  head: HeadPart | null
  rack: RackPart | null
}

/**
 * Serialized loadout for storage and network transmission
 * Contains only part IDs for compactness
 */
export interface SerializedLoadout {
  leftArm: string | null
  rightArm: string | null
  core: string | null
  legs: string | null
  head: string | null
  rack: string | null
}

/**
 * Saved build with metadata
 */
export interface SavedBuild {
  name: string
  timestamp: number
  loadout: MechLoadout
}

// ============================================================================
// Synergy System
// ============================================================================

export interface SynergyEffect {
  id: string
  name: string
  description: string
  icon: string
  requiredParts: string[]              // Part IDs that must be equipped
  statBonus: Partial<MechStats>        // Additive bonuses
  specialEffect?: string               // Flavor text
}

// ============================================================================
// Network/Combat Types
// ============================================================================

/**
 * Weapon configuration for network transmission
 * Derived from ArmPart but simplified for combat
 */
export interface WeaponConfig {
  type: 'autocannon' | 'laser' | 'railgun' | 'missile_launcher' | 'plasma_cannon'
  name: string
  damage: number
  fireRate: number    // rounds per minute
  projectileSpeed: number
  energyCost: number
  cooldown: number    // ms
}

/**
 * Ability configuration for network transmission
 */
export interface AbilityConfig {
  type: 'shield' | 'speed_boost' | 'emp' | 'repair' | 'cloak'
  name: string
  duration: number    // ms
  cooldown: number    // ms
  energyCost: number
}

/**
 * Network-ready loadout for multiplayer matches
 * Contains weapon and ability configs derived from parts
 */
export interface NetworkLoadout {
  chassisType: string           // Derived from legs type
  leftWeapon: WeaponConfig
  rightWeapon: WeaponConfig
  ability: AbilityConfig
  paintScheme?: {
    primary: string
    secondary: string
    accent: string
  }
}

// ============================================================================
// Combat State Types
// ============================================================================

export interface CombatStats {
  maxHealth: number
  currentHealth: number
  armor: number
  speed: number
  firepower: number
  accuracy: number
  energy: number
  maxEnergy: number
}

export interface MechCombatState {
  position: { x: number; y: number; z: number }
  rotation: number
  velocity: { x: number; y: number; z: number }
  jumpFuel: number
  isDashing: boolean
  isJumping: boolean
  rackAbilityCooldown: number
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Serialize a full loadout to part IDs only
 */
export function serializeLoadout(loadout: MechLoadout): SerializedLoadout {
  return {
    leftArm: loadout.leftArm?.id ?? null,
    rightArm: loadout.rightArm?.id ?? null,
    core: loadout.core?.id ?? null,
    legs: loadout.legs?.id ?? null,
    head: loadout.head?.id ?? null,
    rack: loadout.rack?.id ?? null,
  }
}

/**
 * Map weapon type string to network weapon type
 */
export function toNetworkWeaponType(weaponType: WeaponType, partId: string): WeaponConfig['type'] {
  // Map arm part weapon types to network weapon types
  if (weaponType === 'missile') return 'missile_launcher'
  if (weaponType === 'ballistic') {
    if (partId.includes('missile')) return 'missile_launcher'
    return 'autocannon'
  }
  if (weaponType === 'energy') {
    if (partId.includes('railgun')) return 'railgun'
    if (partId.includes('flamer')) return 'plasma_cannon'
    return 'laser'
  }
  // Default fallback
  return 'autocannon'
}
