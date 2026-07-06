/**
 * Phase 2 — delimb consequences on the ENEMY side (design §3.3, integration
 * report "Delimb flags → enemy AI/firing"). The player-side strand/lock-off is
 * covered in hit-locations.test.ts; this pins the mirror behaviour the AI and
 * enemy-firing selector must show:
 *   - legs shot off  -> capped to 0.4x top speed, drops the retreat/kite intent
 *     (holds ground and closes/fires instead of vainly fleeing), no evasive jump.
 *   - arm shot off   -> MechEntity.liveWeaponArm() switches to the surviving arm;
 *     both gone -> null (the enemy stops firing).
 */
import { describe, it, expect, beforeAll, vi, afterEach } from 'vitest'
import * as THREE from 'three'
import { EnemyAI } from '../EnemyAI'
import { MechEntity, type CombatStats } from '../MechEntity'
import { findPartById } from '../../../shared/data/MechParts'
import type { ArmPart, MechLoadout } from '../../../shared/types/MechTypes'

// MechEntity's fireWeapon path / model loading is not needed here, but the
// constructor touches a canvas-less code path only for liveWeaponArm; keep the
// node canvas stub for parity with the other battle tests.
beforeAll(() => {
  if (typeof (globalThis as any).document === 'undefined') {
    const ctx = { createRadialGradient: () => ({ addColorStop() {} }), fillRect() {}, set fillStyle(_v: unknown) {} }
    ;(globalThis as any).document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) }
  }
})

/** Minimal MechEntity stand-in exposing only what EnemyAI.update reads. */
function fakeMech(opts: { pos?: THREE.Vector3; rotationY?: number; health?: number; legsDestroyed?: boolean } = {}) {
  const position = (opts.pos ?? new THREE.Vector3()).clone()
  return {
    position,
    rotation: new THREE.Euler(0, opts.rotationY ?? 0, 0),
    velocity: new THREE.Vector3(),
    isJumping: false,
    weightPenalty: 1,
    legsDestroyed: opts.legsDestroyed ?? false,
    stats: { currentHealth: opts.health ?? 300, maxHealth: 300, speed: 60, accuracy: 50 },
    loadout: { rack: null },
    getCorePosition: () => position.clone(),
    getArmPosition: () => position.clone(),
  } as unknown as MechEntity
}

afterEach(() => vi.restoreAllMocks())

describe('legs destroyed strands the enemy AI', () => {
  it('caps a stranded enemy to a lower top speed than a healthy one', () => {
    const drive = (legsDestroyed: boolean): number => {
      const ai = new EnemyAI('medium')
      const enemy = fakeMech({ pos: new THREE.Vector3(0, 0, 0), legsDestroyed })
      const player = fakeMech({ pos: new THREE.Vector3(0, 0, 40) }) // far -> chase, full throttle
      let maxSpeed = 0
      for (let i = 0; i < 60; i++) {
        ai.update(enemy, player, 0.05)
        maxSpeed = Math.max(maxSpeed, Math.hypot(enemy.velocity.x, enemy.velocity.z))
      }
      return maxSpeed
    }
    const healthy = drive(false)
    const stranded = drive(true)
    expect(stranded).toBeLessThan(healthy)
    expect(stranded).toBeGreaterThan(0) // still crawls, not frozen
    // Roughly the 0.4x strand multiplier (allow slack for accel/friction ramp).
    expect(stranded).toBeLessThan(healthy * 0.6)
  })

  it('drops the retreat intent: a low-HP stranded enemy holds/closes instead of fleeing', () => {
    // Deterministic strafe/waypoint so the only difference is retreat-vs-flank.
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const run = (legsDestroyed: boolean) => {
      const ai = new EnemyAI('medium')
      const enemy = fakeMech({ pos: new THREE.Vector3(0, 0, 0), health: 20, legsDestroyed }) // <30% HP
      const player = fakeMech({ pos: new THREE.Vector3(0, 0, 30) }) // player at +z
      // Freeze the roam waypoint at the origin so waypoint pull doesn't mask intent.
      ;(ai as any).waypoint = new THREE.Vector3(0, 0, 0)
      ;(ai as any).waypointTimer = 999
      for (let i = 0; i < 40; i++) {
        ;(ai as any).waypointTimer = 999
        ai.update(enemy, player, 0.05)
      }
      return enemy.position.z
    }
    const healthyLegsZ = run(false) // retreats -> moves away from +z player -> z < 0
    const strandedZ = run(true) // retreat dropped -> flanks/closes -> z >= healthy
    // The intact-legs mech flees toward -z; the stranded one does NOT flee.
    expect(healthyLegsZ).toBeLessThan(0)
    expect(strandedZ).toBeGreaterThan(healthyLegsZ)
  })

  it('disables the evasive jump when legs are gone', () => {
    const tryJump = (legsDestroyed: boolean): boolean => {
      const ai = new EnemyAI('medium')
      // Enemy at origin, player 10u away looking straight at it (aimDot ~1, dist<15).
      const enemy = fakeMech({ pos: new THREE.Vector3(0, 0, 0), legsDestroyed })
      const player = fakeMech({ pos: new THREE.Vector3(0, 0, 10), rotationY: Math.PI })
      ;(ai as any).jumpCooldown = 0 // eligible to jump this frame
      ai.update(enemy, player, 0.05)
      return enemy.isJumping
    }
    expect(tryJump(false)).toBe(true) // healthy: leaps away from the aimed shot
    expect(tryJump(true)).toBe(false) // stranded: grounded, cannot jump
  })
})

// ---------------------------------------------------------------------------
describe('MechEntity.liveWeaponArm() — enemy firing arm selection (§3.3)', () => {
  const arm = (id: string) => findPartById(id) as ArmPart
  function makeLoadout(over: Partial<MechLoadout> = {}): MechLoadout {
    return {
      leftArm: arm('arm-autocannon-mk1'),
      rightArm: arm('arm-autocannon-mk1'),
      core: findPartById('core-diesel-gen') as MechLoadout['core'],
      legs: findPartById('legs-bipedal-standard') as MechLoadout['legs'],
      head: findPartById('head-standard-optics') as MechLoadout['head'],
      rack: null,
      ...over,
    }
  }
  function makeMech(loadout: MechLoadout): MechEntity {
    const stats: CombatStats = { maxHealth: 500, currentHealth: 500, armor: 0, speed: 50, firepower: 20, accuracy: 20, energy: 100 }
    return new MechEntity('e', 'Enemy', loadout, stats, false, new THREE.Vector3())
  }

  it('prefers the right arm when both are intact', () => {
    expect(makeMech(makeLoadout()).liveWeaponArm()).toBe('right')
  })

  it('falls back to the left arm when the right is defanged', () => {
    const m = makeMech(makeLoadout())
    m.rightArmDestroyed = true
    expect(m.liveWeaponArm()).toBe('left')
  })

  it('returns null when both weapon arms are destroyed (enemy stops firing)', () => {
    const m = makeMech(makeLoadout())
    m.rightArmDestroyed = true
    m.leftArmDestroyed = true
    expect(m.liveWeaponArm()).toBeNull()
  })

  it('skips an empty slot and fires from the surviving arm', () => {
    const m = makeMech(makeLoadout({ rightArm: null }))
    expect(m.liveWeaponArm()).toBe('left')
  })

  it('never falls back to a support (shield) arm — a defanged gun mech goes silent', () => {
    // Bulwark shape: gun on the right, shield-gen on the left. Shooting off the
    // right gun arm must NOT make it "fire" the shield (which would re-raise the
    // block and invert the §3.3 delimb consequence).
    const m = makeMech(makeLoadout({ leftArm: arm('arm-shield-gen') }))
    expect(m.liveWeaponArm()).toBe('right') // gun arm live -> fine
    m.rightArmDestroyed = true
    expect(m.liveWeaponArm()).toBeNull() // gun gone, only a shield left -> defanged
  })

  it('fires from a live gun arm even when the OTHER arm is a support shield', () => {
    // Gun on the left, shield on the right, no right-side gun to prefer.
    const m = makeMech(makeLoadout({ leftArm: arm('arm-autocannon-mk1'), rightArm: arm('arm-shield-gen') }))
    expect(m.liveWeaponArm()).toBe('left')
  })
})
