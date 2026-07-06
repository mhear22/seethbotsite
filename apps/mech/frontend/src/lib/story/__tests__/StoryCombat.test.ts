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
    type: 'wave_defence', title: 'T', flavor: 'F', reward: 100, ...over,
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

  it('normalizes a standard 1.8-scale death blast at the centre to ~1.0 severity', () => {
    const { combat } = makeRig()
    const amounts: number[] = []
    combat.onCollateral = (amount) => amounts.push(amount)
    combat.start(quest({ type: 'wave_defence', waveCount: 1, difficulty: 'easy' }), new THREE.Vector3(0, 0, 0))
    amounts.length = 0
    ;(combat as any).spawnCollateralExplosion(new THREE.Vector3(0, 0, 0), 1.8)
    expect(amounts).toHaveLength(1)
    expect(amounts[0]).toBeCloseTo(1.0, 5)
  })

  it('fires onCollateral when an enemy is destroyed inside the town', () => {
    const { combat, player, enemies } = makeRig()
    let fired = false
    let maxAmount = 0
    combat.onCollateral = (amount) => { fired = true; maxAmount = Math.max(maxAmount, amount) }
    combat.start(quest({ type: 'wave_defence', waveCount: 1, difficulty: 'easy' }), new THREE.Vector3(0, 0, 0))
    enemies()[0].mech.stats.currentHealth = 0
    combat.update(0.05, player, NO_FIRE, 1)
    expect(fired).toBe(true)
    expect(maxAmount).toBeGreaterThan(0)
  })
})
