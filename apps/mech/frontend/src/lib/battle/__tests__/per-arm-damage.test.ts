/**
 * Phase 1 — per-arm damage identity through the real ProjectileSystem.fireWeapon
 * choke point (design §3.2). The headline change: damage is derived from the
 * *firing arm's* own firepower (armPart.stats.firepower / 10), not the summed
 * mech firepower, so the two arms deal different damage when the parts differ
 * and the 6 weapons stop being cosmetic. Also verifies the free wins wired at
 * the same seam: homing missiles (target plumbed → targetId/homingDelay), the
 * armour-pierce + burn flags carried onto the projectile, and support (shield)
 * firing no projectile.
 *
 * fireWeapon builds three.js meshes and a pooled canvas trail texture, so we
 * stub a minimal `document.createElement('canvas')` for the node test env
 * (three.js math otherwise runs headless). No WebGL/DOM rendering happens.
 */
import { describe, it, expect, beforeAll } from 'vitest'
import * as THREE from 'three'
import { findPartById } from '../../../shared/data/MechParts'
import type { ArmPart, MechLoadout } from '../../../shared/types/MechTypes'
import { MechEntity, type CombatStats } from '../MechEntity'
import { ProjectileSystem } from '../ProjectileSystem'

// --- Minimal canvas stub so ProjectileSystem's pooled trail texture builds. ---
beforeAll(() => {
  if (typeof (globalThis as any).document === 'undefined') {
    const ctx = {
      createRadialGradient: () => ({ addColorStop() {} }),
      fillRect() {},
      set fillStyle(_v: unknown) {},
    }
    ;(globalThis as any).document = {
      createElement: () => ({ width: 0, height: 0, getContext: () => ctx }),
    }
  }
})

function arm(id: string): ArmPart {
  return findPartById(id) as ArmPart
}

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
  const stats: CombatStats = {
    maxHealth: 500, currentHealth: 500, armor: 0, speed: 50,
    firepower: 999, accuracy: 20, energy: 100,
  }
  const m = new MechEntity('shooter', 'Shooter', loadout, stats, true, new THREE.Vector3())
  // Plenty of power so the power gate never blocks a shot under test.
  m.currentPower = 10_000
  m.maxPower = 10_000
  return m
}

const FORWARD = new THREE.Vector3(0, 0, 1)

/** Fire one shot from `arm` and return the resulting first projectile. */
function fireArm(armId: string, side: 'left' | 'right' = 'left', target?: MechEntity) {
  const ps = new ProjectileSystem(new THREE.Scene())
  const loadout = makeLoadout(side === 'left' ? { leftArm: arm(armId) } : { rightArm: arm(armId) })
  const mech = makeMech(loadout)
  return ps.fireWeapon(mech, FORWARD, side, target)
}

describe('per-arm firepower (ProjectileSystem.fireWeapon)', () => {
  // Expected per-shot damage straight off the design table (firepower/10,
  // melee ×2.5). Support fires no projectile.
  const cases: Array<[string, number | null]> = [
    ['arm-autocannon-mk1', 5],   // fp 50
    ['arm-missile-pod', 10],     // fp 100
    ['arm-flamer', 24],          // fp 240
    ['arm-railgun', 40],         // fp 400
    ['arm-pile-driver', 80],     // fp 320 × 2.5 melee
    ['arm-shield-gen', null],    // support → no projectile
  ]

  it.each(cases)('%s deals its own damage from part stats', (armId, expected) => {
    const proj = fireArm(armId)
    if (expected === null) {
      expect(proj).toBeNull()
    } else {
      expect(proj).not.toBeNull()
      expect(proj!.damage).toBeCloseTo(expected, 5)
    }
  })

  it('all 6 arm weapons produce distinct per-shot damage (none share a value)', () => {
    const damages = cases
      .filter(([, d]) => d !== null)
      .map(([id]) => fireArm(id)!.damage)
    expect(new Set(damages).size).toBe(damages.length)
  })

  it('two DIFFERENT arms on one mech no longer deal identical damage', () => {
    const ps = new ProjectileSystem(new THREE.Scene())
    const mech = makeMech(makeLoadout({
      leftArm: arm('arm-autocannon-mk1'), // fp 50 → 5
      rightArm: arm('arm-railgun'),       // fp 400 → 40
    }))
    const left = ps.fireWeapon(mech, FORWARD, 'left')
    const right = ps.fireWeapon(mech, FORWARD, 'right')
    expect(left!.damage).toBeCloseTo(5, 5)
    expect(right!.damage).toBeCloseTo(40, 5)
    expect(left!.damage).not.toBeCloseTo(right!.damage, 5)
  })

  it('two IDENTICAL arms still deal the same damage (control)', () => {
    const ps = new ProjectileSystem(new THREE.Scene())
    const mech = makeMech(makeLoadout({
      leftArm: arm('arm-railgun'), rightArm: arm('arm-railgun'),
    }))
    const left = ps.fireWeapon(mech, FORWARD, 'left')
    const right = ps.fireWeapon(mech, FORWARD, 'right')
    expect(left!.damage).toBeCloseTo(right!.damage, 5)
  })

  it('per-arm damage is independent of the summed mech.stats.firepower', () => {
    // Same autocannon, wildly different summed firepower → identical per-shot
    // damage (proves the old summed-firepower path is gone).
    const psA = new ProjectileSystem(new THREE.Scene())
    const mA = makeMech(makeLoadout({ leftArm: arm('arm-autocannon-mk1') }))
    mA.stats.firepower = 50
    const psB = new ProjectileSystem(new THREE.Scene())
    const mB = makeMech(makeLoadout({ leftArm: arm('arm-autocannon-mk1') }))
    mB.stats.firepower = 5000
    expect(psA.fireWeapon(mA, FORWARD, 'left')!.damage)
      .toBeCloseTo(psB.fireWeapon(mB, FORWARD, 'left')!.damage, 5)
  })
})

describe('typed-combat flags plumbed onto the projectile', () => {
  it('carries the arm damage channel', () => {
    expect(fireArm('arm-autocannon-mk1')!.damageType).toBe('kinetic')
    expect(fireArm('arm-railgun')!.damageType).toBe('energy')
    expect(fireArm('arm-flamer')!.damageType).toBe('energy')
    expect(fireArm('arm-pile-driver')!.damageType).toBe('melee')
  })

  it('flags railgun armour-pierce and flamer burn on the projectile', () => {
    expect(fireArm('arm-railgun')!.armorPierce).toBe(true)
    expect(fireArm('arm-flamer')!.appliesBurn).toBe(true)
    const auto = fireArm('arm-autocannon-mk1')!
    expect(auto.armorPierce).toBeFalsy()
    expect(auto.appliesBurn).toBeFalsy()
  })
})

describe('homing missile activation (missile-pod)', () => {
  it('is a missile-type projectile and fires a full salvo', () => {
    const ps = new ProjectileSystem(new THREE.Scene())
    const mech = makeMech(makeLoadout({ leftArm: arm('arm-missile-pod') }))
    ps.fireWeapon(mech, FORWARD, 'left')
    // projectileCount 6 → six projectiles in flight.
    expect(ps.getProjectiles().length).toBe(6)
    expect(ps.getProjectiles()[0].type).toBe('missile')
  })

  it('plumbs the target so the dormant homing path engages', () => {
    const target = makeMech(makeLoadout())
    target.id = 'victim'
    const withTarget = fireArm('arm-missile-pod', 'left', target)!
    expect(withTarget.targetId).toBe('victim')
    expect(withTarget.homingDelay).toBeGreaterThan(0)
  })

  it('flies straight (no homing) when no target is supplied', () => {
    const noTarget = fireArm('arm-missile-pod', 'left')!
    expect(noTarget.targetId).toBeUndefined()
    expect(noTarget.homingDelay).toBeUndefined()
  })
})
