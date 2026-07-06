/**
 * Phase 2 — StoryCombat encounter integration (design §3.6 squads, the
 * half-HP reinforcement graft, and §3.5 collateral groundwork). There was no
 * StoryCombat test before; the clusters covered the units (hit-locations,
 * salvage, enemy generation) but not the encounter seams. This drives a real
 * StoryCombat (real Scene + Projectile/Particle systems + MechEntities) and
 * pins:
 *   - squad win condition: onComplete fires once the last enemy is cleared;
 *   - the salvage kill chain: onEnemyKilled carries the loadout + destroyed limbs;
 *   - named-ace reinforcement: exactly one skirmisher pair spawns at 50% boss HP;
 *   - onCollateral: distance-tapered severity, no-op outside the town radius.
 *
 * MechEntity fires async GLB loads that can't resolve under node -> stub the
 * loader. ProjectileSystem builds a canvas particle texture -> stub document.
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import * as THREE from 'three'
import { MechEntity, type CombatStats } from '../../battle/MechEntity'
import { ProjectileSystem } from '../../battle/ProjectileSystem'
import { ParticleSystem } from '../../battle/ParticleSystem'
import { StoryCombat, type EnemyKill } from '../StoryCombat'
import { archetypeStats } from '../../battle/enemyGeneration'
import { findPartById } from '../../../shared/data/MechParts'
import type { ArmPart, MechLoadout } from '../../../shared/types/MechTypes'
import type { QuestDef } from '../quests'

vi.mock('../../../lib/battle/MechModelLoader', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../lib/battle/MechModelLoader')>()
  return { ...actual, getMechModelLoader: () => ({ assembleMech: async () => new THREE.Group() }) }
})

beforeAll(() => {
  if (typeof (globalThis as any).document === 'undefined') {
    const ctx = { createRadialGradient: () => ({ addColorStop() {} }), fillRect() {}, set fillStyle(_v: unknown) {} }
    ;(globalThis as any).document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) }
  }
})

// --- Fixtures ---------------------------------------------------------------
const arm = (id: string) => findPartById(id) as ArmPart
function playerLoadout(): MechLoadout {
  return {
    leftArm: arm('arm-autocannon-mk1'),
    rightArm: arm('arm-autocannon-mk1'),
    core: findPartById('core-diesel-gen') as MechLoadout['core'],
    legs: findPartById('legs-bipedal-standard') as MechLoadout['legs'],
    head: findPartById('head-standard-optics') as MechLoadout['head'],
    rack: null,
  }
}
function makePlayer(): MechEntity {
  const stats: CombatStats = { maxHealth: 5000, currentHealth: 5000, armor: 0, speed: 50, firepower: 20, accuracy: 20, energy: 100 }
  const p = new MechEntity('player', 'Player', playerLoadout(), stats, true, new THREE.Vector3())
  p.currentPower = 10_000
  return p
}

function quest(over: Partial<QuestDef>): QuestDef {
  return {
    id: 'town-0-quest-0', townId: 'town-0', index: 0,
    type: 'wave_defence', title: 'T', flavor: 'F', reward: 100,
    // Phase 3 authored-content fields (default filler for the combat-seam tests).
    briefing: 'B', completion: 'C', giver: 'G',
    sanctioned: true, commandRep: 0, townRep: 0,
    ...over,
  }
}

const NO_FIRE = { left: false, right: false, aimDir: null as THREE.Vector3 | null }

interface Rig {
  combat: StoryCombat
  player: MechEntity
  enemies: () => any[]
}
function makeRig(): Rig {
  const scene = new THREE.Scene()
  const projectiles = new ProjectileSystem(scene)
  const particles = new ParticleSystem(scene)
  const combat = new StoryCombat(scene, projectiles, particles)
  const player = makePlayer()
  return { combat, player, enemies: () => (combat as any).enemies }
}

// ---------------------------------------------------------------------------
describe('squad win condition', () => {
  it('fires onComplete exactly once when the last enemy is cleared', () => {
    const { combat, player, enemies } = makeRig()
    let completed: QuestDef | null = null
    let completeCount = 0
    combat.onComplete = (q) => { completed = q; completeCount++ }

    const q = quest({ type: 'wave_defence', waveCount: 1, difficulty: 'easy' })
    expect(combat.start(q, new THREE.Vector3(0, 0, 0))).toBe(true)
    expect(enemies()).toHaveLength(1)
    expect((combat as any).waveSpawnQueue).toBe(0) // whole wave already on field

    // Combat still running until the enemy dies.
    combat.update(0.05, player, NO_FIRE, 1)
    expect(combat.active).toBe(true)

    // Zero the enemy's HP -> the removal loop counts it as a burn-out kill.
    enemies()[0].mech.stats.currentHealth = 0
    combat.update(0.05, player, NO_FIRE, 1.05)

    expect(completeCount).toBe(1)
    expect(completed!.id).toBe(q.id)
    expect(combat.active).toBe(false)
    expect(enemies()).toHaveLength(0)
  })

  it('routes the killed enemy through onEnemyKilled with its loadout + destroyed limbs', () => {
    const { combat, player, enemies } = makeRig()
    const kills: EnemyKill[] = []
    combat.onEnemyKilled = (k) => kills.push(k)

    combat.start(quest({ type: 'wave_defence', waveCount: 1, difficulty: 'easy' }), new THREE.Vector3(0, 0, 0))
    const victim = enemies()[0].mech as MechEntity

    // Shoot off its left arm first (guaranteed damaged salvage drop, §3.6), then kill it.
    victim.takeDamage(99_999, 'kinetic', { slot: 'leftArm' })
    expect(victim.leftArmDestroyed).toBe(true)
    victim.stats.currentHealth = 0

    const expectedLoadout = victim.loadout
    combat.update(0.05, player, NO_FIRE, 1)

    expect(kills).toHaveLength(1)
    expect(kills[0].destroyedSlots).toContain('leftArm')
    expect(kills[0].loadout).toBe(expectedLoadout)
    expect(kills[0].archetype).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
describe('named-ace half-health reinforcement (§3.6)', () => {
  it('spawns exactly one skirmisher pair when the boss first crosses 50% HP', () => {
    const { combat, player, enemies } = makeRig()
    const calls: { bossName: string; count: number }[] = []
    combat.onReinforcement = (info) => calls.push(info)

    combat.start(quest({ type: 'boss_hunt', bossScale: 2, difficulty: 'boss' }), new THREE.Vector3(0, 0, 0))
    const boss = (combat as any).boss.mech as MechEntity
    // Story boss body comes from the unified archetype table (ace @ scale 2).
    expect(boss.stats.maxHealth).toBe(archetypeStats('ace', 2).maxHealth)
    expect((combat as any).totalCount).toBe(1)

    // Not yet reinforced above 50%.
    boss.stats.currentHealth = boss.stats.maxHealth * 0.75
    combat.update(0.05, player, NO_FIRE, 1)
    expect(calls).toHaveLength(0)
    expect(enemies()).toHaveLength(1)

    // Cross 50% -> the pair arrives once.
    boss.stats.currentHealth = boss.stats.maxHealth * 0.5
    combat.update(0.05, player, NO_FIRE, 1.05)
    expect(calls).toHaveLength(1)
    expect(calls[0].count).toBe(2)
    expect((combat as any).totalCount).toBe(3) // boss + 2 reinforcements
    expect(enemies()).toHaveLength(3)

    // Latched: staying under 50% does not spawn a second wave.
    combat.update(0.05, player, NO_FIRE, 1.1)
    expect(calls).toHaveLength(1)
    expect(enemies()).toHaveLength(3)
  })
})

// ---------------------------------------------------------------------------
describe('onCollateral emission (§3.5 groundwork)', () => {
  it('emits distance-tapered severity and no-ops outside the town radius', () => {
    const { combat } = makeRig()
    const events: { amount: number; pos: THREE.Vector3 }[] = []
    combat.onCollateral = (amount, position) => events.push({ amount, pos: position })
    // start() sets the anchor (town centre) the taper is measured from.
    combat.start(quest({ type: 'wave_defence', waveCount: 1, difficulty: 'easy' }), new THREE.Vector3(0, 0, 0))
    events.length = 0 // ignore any spawn-time noise

    // At the town centre, proximity = 1 -> full severity passes through.
    ;(combat as any).emitCollateral(new THREE.Vector3(0, 0, 0), 1.0)
    expect(events).toHaveLength(1)
    expect(events[0].amount).toBeCloseTo(1.0, 5)

    // Half-radius (30 of 60) -> proximity 0.5 -> half severity.
    ;(combat as any).emitCollateral(new THREE.Vector3(0, 0, 30), 1.0)
    expect(events).toHaveLength(2)
    expect(events[1].amount).toBeCloseTo(0.5, 5)

    // Well outside the radius -> no emission at all.
    ;(combat as any).emitCollateral(new THREE.Vector3(0, 0, 200), 1.0)
    expect(events).toHaveLength(2)
  })

  // Phase 3 reshape (§3.5 contract): kill/AoE explosions are UNTAXED. Landing a
  // kill must never feel like it hurts the town, so a death blast emits nothing.
  it('does NOT tax the town for a death/AoE explosion (kills are untaxed)', () => {
    const { combat } = makeRig()
    const amounts: number[] = []
    combat.onCollateral = (amount) => amounts.push(amount)
    combat.start(quest({ type: 'wave_defence', waveCount: 1, difficulty: 'easy' }), new THREE.Vector3(0, 0, 0))
    amounts.length = 0
    ;(combat as any).spawnDeathExplosion(new THREE.Vector3(0, 0, 0), 1.8)
    expect(amounts).toHaveLength(0)
  })

  // Phase 3 (§3.5): collateral is dominated by time-in-combat-near-town. Each
  // update tick inside the town accrues a small, distance-tapered severity.
  it('accrues time-in-combat collateral each tick, tapered by proximity', () => {
    const { combat, player, enemies } = makeRig()
    const amounts: number[] = []
    combat.onCollateral = (amount) => amounts.push(amount)
    combat.start(quest({ type: 'wave_defence', waveCount: 1, difficulty: 'easy' }), new THREE.Vector3(0, 0, 0))
    // Keep the enemy alive so the encounter does not complete this tick, and put
    // the player at the town centre so proximity = 1.
    enemies()[0].mech.stats.currentHealth = enemies()[0].mech.stats.maxHealth
    player.position.set(0, 0, 0)
    amounts.length = 0
    combat.update(0.1, player, NO_FIRE, 1)
    // PER_COMBAT_SECOND (0.35) * dt (0.1) * proximity (1) = 0.035.
    expect(amounts.length).toBeGreaterThanOrEqual(1)
    expect(amounts[0]).toBeCloseTo(0.035, 5)
  })

  // The player LANDING shots never taxes the town (design §3.5 FIX). With the
  // player firing but no hits landing on the player, only the (tiny) time term
  // registers — never a per-shot term.
  it('never taxes the player for firing their own weapons', () => {
    const { combat, player, enemies } = makeRig()
    const amounts: number[] = []
    combat.onCollateral = (amount) => amounts.push(amount)
    combat.start(quest({ type: 'wave_defence', waveCount: 2, difficulty: 'easy' }), new THREE.Vector3(0, 0, 0))
    enemies().forEach((e: any) => { e.mech.stats.currentHealth = e.mech.stats.maxHealth })
    player.position.set(0, 0, 0)
    amounts.length = 0
    // Fire both arms; the only collateral this tick is the time term (0.035),
    // not a per-shot term.
    combat.update(0.1, player, { left: true, right: true, aimDir: null }, 100)
    for (const a of amounts) expect(a).toBeLessThanOrEqual(0.035 + 1e-6)
  })
})

// ---------------------------------------------------------------------------
// Phase 5 mission variety (§5) — the four new types on the multi-enemy core.
describe('escort_convoy (§5.1)', () => {
  it('spawns crawlers, marches them to the waypoint, and completes with full reward when none are lost', () => {
    const { combat, player, enemies } = makeRig()
    let completed: QuestDef | null = null
    let outcome: any = null
    combat.onComplete = (q, o) => { completed = q; outcome = o }

    // Short waypoint, no harassers -> a clean delivery.
    combat.start(
      quest({ type: 'escort_convoy', escortCount: 2, waypointDistance: 20, interceptorCount: 0, difficulty: 'easy' }),
      new THREE.Vector3(0, 0, 0),
    )
    expect((combat as any).crawlers).toHaveLength(2)
    expect(enemies()).toHaveLength(0) // no interceptors queued

    // March the convoy: several steps at the slow crawler speed until arrival.
    for (let i = 0; i < 30 && combat.active; i++) combat.update(0.5, player, NO_FIRE, i)

    expect(completed).not.toBeNull()
    expect(outcome.rewardMultiplier).toBeCloseTo(1, 5)
    expect(outcome.crawlersSaved).toBe(2)
    expect(combat.active).toBe(false)
  })

  it('fails (not player death) when the whole convoy is wiped out', () => {
    const { combat, player } = makeRig()
    let failed: { quest: QuestDef; reason: string } | null = null
    combat.onQuestFailed = (q, reason) => { failed = { quest: q, reason } }
    combat.onComplete = () => { throw new Error('should not complete') }

    combat.start(
      quest({ type: 'escort_convoy', escortCount: 2, waypointDistance: 400, interceptorCount: 0, difficulty: 'easy' }),
      new THREE.Vector3(0, 0, 0),
    )
    // Kill every crawler outright, then tick: the convoy-lost fail fires.
    ;(combat as any).crawlers.forEach((c: any) => { c.alive = false })
    combat.update(0.1, player, NO_FIRE, 1)

    expect(failed).not.toBeNull()
    expect(failed!.reason).toBe('convoy-lost')
    expect(combat.active).toBe(false)
  })
})

describe('hold_the_line (§5.2)', () => {
  it('deploys a barricade, runs N waves with a breather, and completes after the last wave', () => {
    const { combat, player, enemies } = makeRig()
    let completed: QuestDef | null = null
    combat.onComplete = (q) => { completed = q }

    combat.start(
      quest({ type: 'hold_the_line', holdWaves: 2, breatherSeconds: 0, barricadeHp: 100000, difficulty: 'easy' }),
      new THREE.Vector3(0, 0, 0),
    )
    expect((combat as any).barricade).not.toBeNull()
    expect((combat as any).holdWaveIndex).toBe(1) // first wave on field
    expect(enemies().length).toBeGreaterThan(0)

    // Clear wave 1 (park enemies far from the barricade so it takes no attrition).
    enemies().forEach((e: any) => { e.mech.position.set(500, 0, 500); e.mech.stats.currentHealth = 0 })
    combat.update(0.1, player, NO_FIRE, 1)
    expect(combat.active).toBe(true)
    expect((combat as any).holdWaveIndex).toBe(2) // second wave spawned after breather

    // Clear wave 2 -> completion.
    enemies().forEach((e: any) => { e.mech.position.set(500, 0, 500); e.mech.stats.currentHealth = 0 })
    combat.update(0.1, player, NO_FIRE, 2)
    expect(completed).not.toBeNull()
    expect(combat.active).toBe(false)
  })

  it('fails when the barricade is destroyed', () => {
    const { combat, player, enemies } = makeRig()
    let failed: { reason: string } | null = null
    combat.onQuestFailed = (_q, reason) => { failed = { reason } }

    combat.start(
      quest({ type: 'hold_the_line', holdWaves: 3, breatherSeconds: 5, barricadeHp: 1, difficulty: 'easy' }),
      new THREE.Vector3(0, 0, 0),
    )
    // Drive an enemy onto the barricade so it takes attrition, and tick.
    enemies()[0].mech.position.set(0, 0, 0)
    combat.update(0.5, player, NO_FIRE, 1)

    expect(failed).not.toBeNull()
    expect(failed!.reason).toBe('barricade-destroyed')
    expect(combat.active).toBe(false)
  })
})

describe('extraction (§5.3)', () => {
  it('flips reach -> hold when the player reaches the beacon, then completes after the timer', () => {
    const { combat, player } = makeRig()
    let completed: QuestDef | null = null
    combat.onComplete = (q) => { completed = q }

    combat.start(
      quest({ type: 'extraction', beaconDistance: 30, perimeterRadius: 20, holdSeconds: 2, difficulty: 'easy' }),
      new THREE.Vector3(0, 0, 0),
    )
    const beaconPos = (combat as any).beacon.position.clone() as THREE.Vector3
    expect((combat as any).extractionPhase).toBe('reach')

    // Away from the beacon: stays in reach.
    player.position.set(beaconPos.x + 300, 0, beaconPos.z + 300)
    combat.update(0.1, player, NO_FIRE, 1)
    expect((combat as any).extractionPhase).toBe('reach')
    expect(combat.getProgress().extractionPhase).toBe('reach')

    // Stand on the beacon: flips to hold and starts the countdown.
    player.position.copy(beaconPos)
    combat.update(0.1, player, NO_FIRE, 1.1)
    expect((combat as any).extractionPhase).toBe('hold')
    expect(combat.getProgress().secondsLeft).toBeGreaterThan(0)

    // Ride out the hold timer -> completion.
    combat.update(2.5, player, NO_FIRE, 4)
    expect(completed).not.toBeNull()
    expect(combat.active).toBe(false)
  })
})

describe('ace_hunt (§5.4)', () => {
  it('spawns an ace + bodyguard pair, and killing the ace completes regardless of the guards, dropping a pristine part', () => {
    const { combat, player, enemies } = makeRig()
    let completed: QuestDef | null = null
    const kills: EnemyKill[] = []
    combat.onComplete = (q) => { completed = q }
    combat.onEnemyKilled = (k) => kills.push(k)

    combat.start(
      quest({ type: 'ace_hunt', bossScale: 2, bodyguardCount: 2, difficulty: 'boss', bossName: 'Captain Roone' }),
      new THREE.Vector3(0, 0, 0),
    )
    expect(enemies()).toHaveLength(3) // ace + 2 bodyguards
    const ace = (combat as any).boss.mech as MechEntity
    expect(ace.name).toBe('Captain Roone')

    // Suppress the half-HP reinforcement so the completion-regardless-of-guards
    // assertion is unambiguous, then drop the ace with both guards at full HP.
    ;(combat as any).bossReinforced = true
    ace.stats.currentHealth = 0
    combat.update(0.05, player, NO_FIRE, 1)

    expect(completed).not.toBeNull()
    // The ace kill carries the guaranteed pristine drop flag (§5.4).
    const aceKill = kills.find((k) => k.isBoss)
    expect(aceKill).toBeTruthy()
    expect(aceKill!.pristineDrop).toBe(true)
    expect(combat.active).toBe(false)
  })
})

// On-foot Recovery (design §2.6/§4): a hidden_object encounter is driven from the
// dismounted PILOT's position via updateSearchAt (no MechEntity, no combat loop).
// This is the Phase-4 seam StoryWorld.updateOnFoot uses while dismounted.
describe('on-foot Recovery search (updateSearchAt)', () => {
  it('reveals and collects the hidden object from a walked position, then completes', () => {
    const { combat } = makeRig()
    let completed: QuestDef | null = null
    combat.onComplete = (q) => { completed = q }

    combat.start(quest({ type: 'hidden_object', searchRadius: 28 }), new THREE.Vector3(0, 0, 0))
    expect(combat.active).toBe(true)
    expect(combat.getProgress().collected).toBe(false)

    const objPos = (combat as any).hiddenObject.position.clone() as THREE.Vector3

    // Standing far away: not found.
    combat.updateSearchAt(new THREE.Vector3(objPos.x + 500, 0, objPos.z + 500), 0.1)
    expect(combat.getProgress().found).toBe(false)

    // Walk onto it: reveal + pick up in the same step -> encounter finishes.
    combat.updateSearchAt(objPos, 0.1)
    expect(combat.getProgress().found).toBe(true)
    expect(completed).not.toBeNull()
    expect(combat.active).toBe(false)
  })

  it('is a no-op for a combat (non-hidden_object) encounter', () => {
    const { combat } = makeRig()
    combat.start(quest({ type: 'wave_defence', waveCount: 1, difficulty: 'easy' }), new THREE.Vector3(0, 0, 0))
    const before = combat.getProgress().cleared
    // Driving a search on a Hold does nothing (no on-foot combat, §6).
    combat.updateSearchAt(new THREE.Vector3(0, 0, 0), 0.1)
    expect(combat.getProgress().cleared).toBe(before)
    expect(combat.active).toBe(true)
  })
})
