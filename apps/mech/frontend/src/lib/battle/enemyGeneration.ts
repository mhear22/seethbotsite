import type { CombatStats } from './MechEntity'
import type { MechLoadout } from '../../composables/useMechBuilder'
import type { AIDifficulty } from '../../composables/useGameSettings'
import type { EnemyArchetype } from './EnemyAI'
import { ARM_PARTS, CORE_PARTS, LEGS_PARTS, HEAD_PARTS, RACK_PARTS } from '../../shared/data/MechParts'

/**
 * Single source of truth for enemy generation (GRINDER §3.6, Phase 2).
 *
 * Before Phase 2 there were TWO drifting copies of the enemy stat/loadout
 * tables: `StoryCombat.DIFFICULTY_STATS`/`DIFFICULTY_LOADOUT` and
 * `useMechBattle.generateEnemy`'s inline configs. Both now consume this module
 * so they can never diverge again.
 *
 * This module is PURE data + pure builders. It imports only types and the part
 * catalog — no THREE, no MechEntity runtime — so it is cheap to unit-test and
 * safe to import anywhere (BattleScene, StoryCombat, useMechBattle).
 *
 * ── HP rebalance (design fix note) ────────────────────────────────────────
 * Phase 1 changed weapon damage from the SUMMED firepower of all parts to the
 * *firing arm's* firepower — roughly halving sustained DPS. To keep a duel vs a
 * medium enemy lasting about as long as it did pre-Phase-1, enemy HP pools are
 * bumped ~+40% here (the design's +30-50% band). Player HP is untouched (it
 * comes from the builder loadout, not this table).
 */

// The multiplier that was folded into the maxHealth numbers below, kept as a
// documented constant so the rebalance intent is legible (the raw pre-Phase-1
// values were 150/200/300/400/600).
//
// Phase 3 tuning-triangle re-check (see MechEntity.SLOT_HP_MULTIPLIER): HELD at
// 1.4. The Phase 3 pass raised limb overlay HP, but a *core-aimed* medium-duel
// TTK depends only on this core pool and the per-shot core damage — neither
// changed — so medium-duel TTK stays within 0% of the P2 target. Only
// limb-focused fire was re-taxed (by SLOT_HP_MULTIPLIER), which is the intent.
export const HP_REBALANCE = 1.4

/** Base difficulty stat archetypes (the ladder used by both arena + story). */
export const DIFFICULTY_STATS: Record<AIDifficulty, CombatStats> = {
  tutorial: { maxHealth: 210, currentHealth: 210, armor: 10, speed: 60, firepower: 25, accuracy: 30, energy: 50 },
  easy:     { maxHealth: 280, currentHealth: 280, armor: 15, speed: 80, firepower: 30, accuracy: 40, energy: 60 },
  medium:   { maxHealth: 420, currentHealth: 420, armor: 25, speed: 70, firepower: 45, accuracy: 50, energy: 80 },
  hard:     { maxHealth: 560, currentHealth: 560, armor: 35, speed: 60, firepower: 60, accuracy: 60, energy: 100 },
  boss:     { maxHealth: 840, currentHealth: 840, armor: 45, speed: 70, firepower: 80, accuracy: 70, energy: 120 },
}

/** Display names per tier (mirrors the old useMechBattle enemyConfigs names). */
export const DIFFICULTY_NAMES: Record<AIDifficulty, string> = {
  tutorial: 'Training Bot',
  easy: 'Scout Mech',
  medium: 'Assault Mech',
  hard: 'Heavy Mech',
  boss: 'TITAN-Class Destroyer',
}

/**
 * Loadout part indices per difficulty. `arm` is used for BOTH arms unless
 * `leftArm` overrides the left slot (used by asymmetric archetypes like the
 * bulwark, which carries a shield on one arm and a gun on the other).
 */
interface LoadoutIndices {
  arm: number
  leftArm?: number
  core: number
  legs: number
  head: number
  rack: number
}

export const DIFFICULTY_LOADOUT: Record<AIDifficulty, LoadoutIndices> = {
  tutorial: { arm: 0, core: 0, legs: 0, head: 0, rack: 0 }, // autocannon, diesel, bipedal, optics, smoke
  easy:     { arm: 0, core: 2, legs: 0, head: 3, rack: 2 }, // autocannon, gas turbine, bipedal, scout, jump jets
  medium:   { arm: 1, core: 0, legs: 1, head: 1, rack: 1 }, // railgun, diesel, tracked, targeting array, ammo feed
  hard:     { arm: 3, core: 1, legs: 3, head: 2, rack: 3 }, // missile pod, fusion, quad, reinforced, repair drone
  boss:     { arm: 1, core: 1, legs: 1, head: 1, rack: 2 }, // railgun, fusion, tracked, targeting array, jump jets
}

// ── Archetypes (combined-arms compositions, §3.6) ─────────────────────────
// Behaviour (aim/kite/dodge) lives in EnemyAI.ARCHETYPE_PROFILES; stats +
// loadout (the "body") live here. Callers pair the two: build the mech from
// these tables, then `ai.setArchetype(archetype)` for the matching brain.
//
// ARM_PARTS index legend: 0 autocannon, 1 railgun, 2 pile-driver, 3 missile-pod,
// 4 flamer, 5 shield-gen.  LEGS: 0 bipedal, 1 tracked, 2 hover, 3 quad.

export const ARCHETYPE_STATS: Record<EnemyArchetype, CombatStats> = {
  // Fast, fragile hover harasser.
  skirmisher: { maxHealth: 220, currentHealth: 220, armor: 12, speed: 95, firepower: 30, accuracy: 45, energy: 60 },
  // Balanced bipedal grunt — the baseline pressure unit.
  line:       { maxHealth: 360, currentHealth: 360, armor: 22, speed: 65, firepower: 45, accuracy: 50, energy: 80 },
  // Tracked wall: very high armour + HP, slow, grinds forward.
  bulwark:    { maxHealth: 640, currentHealth: 640, armor: 48, speed: 42, firepower: 40, accuracy: 55, energy: 90 },
  // Glass-cannon railgun sniper: big aimed shots, thin plating.
  sniper:     { maxHealth: 300, currentHealth: 300, armor: 18, speed: 55, firepower: 60, accuracy: 72, energy: 95 },
  // Named-pilot boss (Kestrel / Kass): elite everything, mixed loadout.
  ace:        { maxHealth: 840, currentHealth: 840, armor: 45, speed: 70, firepower: 80, accuracy: 72, energy: 120 },
}

export const ARCHETYPE_LOADOUT: Record<EnemyArchetype, LoadoutIndices> = {
  skirmisher: { arm: 0, core: 2, legs: 2, head: 3, rack: 2 }, // autocannon, gas turbine, hover, scout, jump jets
  line:       { arm: 3, core: 0, legs: 0, head: 0, rack: 1 }, // missile pod, diesel, bipedal, optics, ammo feed
  bulwark:    { arm: 0, leftArm: 5, core: 1, legs: 1, head: 2, rack: 3 }, // autocannon + shield, fusion, tracked, reinforced, repair
  sniper:     { arm: 1, core: 1, legs: 3, head: 1, rack: 1 }, // railgun, fusion, quad, targeting array, ammo feed
  ace:        { arm: 1, leftArm: 3, core: 1, legs: 3, head: 1, rack: 3 }, // railgun + missiles, fusion, quad, targeting array, repair
}

// ── Builders ──────────────────────────────────────────────────────────────

function buildLoadout(idx: LoadoutIndices): MechLoadout {
  return {
    rightArm: ARM_PARTS[idx.arm] ?? ARM_PARTS[0],
    leftArm: ARM_PARTS[idx.leftArm ?? idx.arm] ?? ARM_PARTS[0],
    core: CORE_PARTS[idx.core] ?? CORE_PARTS[0],
    legs: LEGS_PARTS[idx.legs] ?? LEGS_PARTS[0],
    head: HEAD_PARTS[idx.head] ?? HEAD_PARTS[0],
    rack: RACK_PARTS[idx.rack] ?? RACK_PARTS[0],
  }
}

/** Apply a linear stat scale (survival waves / boss scale) to a stat block. */
export function scaleStats(base: CombatStats, scale: number): CombatStats {
  if (scale === 1) return { ...base }
  return {
    maxHealth: Math.round(base.maxHealth * scale),
    currentHealth: Math.round(base.maxHealth * scale),
    armor: Math.round(base.armor * scale),
    speed: base.speed, // keep mobility readable across scales
    firepower: Math.round(base.firepower * scale),
    accuracy: Math.min(95, Math.round(base.accuracy * scale)),
    energy: Math.round(base.energy * scale),
  }
}

export function enemyStats(difficulty: AIDifficulty, scale = 1): CombatStats {
  return scaleStats(DIFFICULTY_STATS[difficulty] ?? DIFFICULTY_STATS.tutorial, scale)
}

export function enemyLoadout(difficulty: AIDifficulty): MechLoadout {
  return buildLoadout(DIFFICULTY_LOADOUT[difficulty] ?? DIFFICULTY_LOADOUT.tutorial)
}

export function archetypeStats(archetype: EnemyArchetype, scale = 1): CombatStats {
  return scaleStats(ARCHETYPE_STATS[archetype] ?? ARCHETYPE_STATS.line, scale)
}

export function archetypeLoadout(archetype: EnemyArchetype): MechLoadout {
  return buildLoadout(ARCHETYPE_LOADOUT[archetype] ?? ARCHETYPE_LOADOUT.line)
}

/**
 * Projectile speed for a weapon part (single source; previously duplicated in
 * BattleScene.getWeaponProjectileSpeed and StoryCombat.weaponProjectileSpeed).
 * Missiles are ballistic-family parts whose id contains 'missile'.
 */
export function weaponProjectileSpeed(weaponType?: string): number {
  if (weaponType === 'energy') return 400
  if (weaponType === 'missile') return 200 // matches arm-missile-pod's projectileSpeed
  return 300 // ballistic / melee / support fallback
}

// ── Squad compositions (combined arms, §3.6) ──────────────────────────────

/**
 * Max enemies alive at once for a given tier. Raised from the old flat cap of 2
 * (§3.6 "raise the cap") so real squads can field 3-5 bodies. Readability still
 * bounds it — a screen full of AIs is noise, not tactics.
 */
export function maxAliveForDifficulty(difficulty: AIDifficulty): number {
  switch (difficulty) {
    case 'tutorial': return 2
    case 'easy': return 3
    case 'medium': return 3
    case 'hard': return 4
    case 'boss': return 5
    default: return 3
  }
}

/**
 * The archetype pool a wave/encounter of the given tier draws from. Callers
 * cycle it across the spawn count so mixed compositions (skirmisher + bulwark +
 * sniper, etc.) appear instead of N identical grunts. Ordering matters: the
 * front of the list spawns first, so anchor/wall units (bulwark) lead.
 */
export function compositionForDifficulty(difficulty: AIDifficulty): EnemyArchetype[] {
  switch (difficulty) {
    case 'tutorial': return ['line']
    case 'easy': return ['line', 'skirmisher']
    case 'medium': return ['line', 'skirmisher', 'sniper']
    case 'hard': return ['bulwark', 'skirmisher', 'sniper']
    case 'boss': return ['bulwark', 'sniper', 'skirmisher']
    default: return ['line', 'skirmisher']
  }
}

/**
 * The scripted reinforcement pair a named ace calls in at half health
 * (§3.6 graft). Two fast skirmishers that flip a duel into a two-stage fight.
 */
export function reinforcementComposition(): EnemyArchetype[] {
  return ['skirmisher', 'skirmisher']
}
