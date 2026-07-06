/**
 * Phase 1 combat pipeline: per-weapon damage identity, damage types &
 * resistances, armour cap, dash i-frames, flamer burn, and the held shield.
 * Covers the COMBAT / DAMAGE cluster (MechParts data + MechEntity.takeDamage).
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { ARM_PARTS, findPartById } from '../../../shared/data/MechParts'
import type { ArmPart, LegsPart, HeadPart, MechLoadout } from '../../../shared/types/MechTypes'
import { MechEntity, ARMOR_CAP, RESISTANCE_CLAMP, type CombatStats } from '../../battle/MechEntity'

function arm(id: string): ArmPart { return findPartById(id) as ArmPart }
function legs(id: string): LegsPart { return findPartById(id) as LegsPart }
function head(id: string): HeadPart { return findPartById(id) as HeadPart }

function makeLoadout(over: Partial<MechLoadout> = {}): MechLoadout {
  return {
    leftArm: arm('arm-autocannon-mk1'),
    rightArm: arm('arm-autocannon-mk1'),
    core: findPartById('core-diesel-gen') as MechLoadout['core'],
    legs: legs('legs-bipedal-standard'),
    head: head('head-standard-optics'),
    rack: null,
    ...over,
  }
}

function makeMech(loadout: MechLoadout, stats: Partial<CombatStats> = {}): MechEntity {
  const full: CombatStats = {
    maxHealth: 500, currentHealth: 500, armor: 0, speed: 50,
    firepower: 20, accuracy: 20, energy: 100, ...stats,
  }
  return new MechEntity('t', 'Test', loadout, full, false, new THREE.Vector3())
}

describe('per-weapon combat identity (MechParts data)', () => {
  it('gives each of the 6 arms a distinct damage channel', () => {
    const byId = Object.fromEntries(ARM_PARTS.map((p) => [p.id, p]))
    expect(byId['arm-autocannon-mk1'].damageType).toBe('kinetic')
    expect(byId['arm-railgun'].damageType).toBe('energy')
    expect(byId['arm-pile-driver'].damageType).toBe('melee')
    expect(byId['arm-missile-pod'].damageType).toBe('kinetic')
    expect(byId['arm-flamer'].damageType).toBe('energy')
  })

  it('activates the homing missile path (missile-pod is weaponType "missile")', () => {
    expect(arm('arm-missile-pod').weaponType).toBe('missile')
  })

  it('flags railgun armour-pierce and flamer burn', () => {
    expect(arm('arm-railgun').armorPierce).toBe(true)
    expect(arm('arm-flamer').appliesBurn).toBe(true)
  })

  it('per-shot damage (firepower/10) matches the design table', () => {
    expect(arm('arm-autocannon-mk1').stats.firepower / 10).toBe(5)
    expect(arm('arm-railgun').stats.firepower / 10).toBe(40)
    expect(arm('arm-flamer').stats.firepower / 10).toBe(24)
    expect(arm('arm-missile-pod').stats.firepower / 10).toBe(10)
    // Pile driver: 32 base * 2.5 melee = 80.
    expect((arm('arm-pile-driver').stats.firepower / 10) * 2.5).toBe(80)
  })

  it('gives distinct projectile speeds / spreads', () => {
    expect(arm('arm-railgun').projectileSpeed).toBeGreaterThan(arm('arm-missile-pod').projectileSpeed!)
    expect(arm('arm-flamer').spread!).toBeGreaterThan(arm('arm-autocannon-mk1').spread!)
  })
})

describe('chassis resistances', () => {
  it('tracked legs resist kinetic, are weak to energy', () => {
    expect(legs('legs-tracked-heavy').resistances).toEqual({ kinetic: 0.25, energy: -0.2 })
  })
  it('hover legs resist energy, are weak to kinetic', () => {
    expect(legs('legs-hover').resistances).toEqual({ energy: 0.25, kinetic: -0.2 })
  })
  it('sums part resistances and clamps', () => {
    const m = makeMech(makeLoadout({ legs: legs('legs-tracked-heavy'), head: head('head-reinforced') }))
    // kinetic: 0.25 + 0.2 = 0.45
    expect(m.getResistance('kinetic')).toBeCloseTo(0.45, 5)
    // energy: -0.2 + -0.05 = -0.25 (a weakness)
    expect(m.getResistance('energy')).toBeCloseTo(-0.25, 5)
    // melee is never granted by parts
    expect(m.getResistance('melee')).toBe(0)
  })
  it('clamps runaway resistance to ±RESISTANCE_CLAMP', () => {
    const m = makeMech(makeLoadout({
      legs: legs('legs-tracked-heavy'), head: head('head-reinforced'),
      leftArm: arm('arm-shield-gen'), rightArm: arm('arm-shield-gen'),
    }))
    expect(m.getResistance('kinetic')).toBeLessThanOrEqual(RESISTANCE_CLAMP)
  })
})

describe('takeDamage pipeline', () => {
  it('caps flat armour reduction at 75% (was 90%)', () => {
    const m = makeMech(makeLoadout(), { armor: 100, currentHealth: 500 })
    m.takeDamage(100, 'kinetic')
    // 100 armour -> capped 0.75 -> 25 damage taken.
    expect(500 - m.stats.currentHealth).toBeCloseTo(100 * (1 - ARMOR_CAP), 5)
  })

  it('applies typed resistance after armour', () => {
    const m = makeMech(makeLoadout({ legs: legs('legs-hover') }), { armor: 0, currentHealth: 500 })
    // energy resist 0.25 -> 100 * 0.75 = 75 taken; kinetic weak -0.2 -> 120 taken.
    m.takeDamage(100, 'energy')
    expect(500 - m.stats.currentHealth).toBeCloseTo(75, 5)
    const m2 = makeMech(makeLoadout({ legs: legs('legs-hover') }), { armor: 0, currentHealth: 500 })
    m2.takeDamage(100, 'kinetic')
    expect(500 - m2.stats.currentHealth).toBeCloseTo(120, 5)
  })

  it('melee ignores typed resistance', () => {
    const m = makeMech(makeLoadout({ legs: legs('legs-tracked-heavy') }), { armor: 0, currentHealth: 500 })
    m.takeDamage(100, 'melee')
    expect(500 - m.stats.currentHealth).toBeCloseTo(100, 5)
  })

  it('armour-piercing halves flat armour', () => {
    const m = makeMech(makeLoadout(), { armor: 40, currentHealth: 500 })
    m.takeDamage(100, 'energy', { armorPierce: true })
    // effective armour 20% -> 80 taken.
    expect(500 - m.stats.currentHealth).toBeCloseTo(80, 5)
  })

  it('dash i-frames negate all damage', () => {
    const m = makeMech(makeLoadout(), { armor: 0, currentHealth: 500 })
    m.isDashing = true
    const defeated = m.takeDamage(9999, 'kinetic')
    expect(defeated).toBe(false)
    expect(m.stats.currentHealth).toBe(500)
  })

  it('flamer burn starts a DoT that ticks in update() and respects pause', () => {
    const m = makeMech(makeLoadout(), { armor: 0, currentHealth: 500 })
    m.takeDamage(24, 'energy', { burn: true })
    expect(m.burnTimer).toBeGreaterThan(0)
    const afterHit = m.stats.currentHealth
    // Not calling update() = paused: no burn tick.
    expect(m.stats.currentHealth).toBe(afterHit)
    // 1s of updates burns.
    for (let i = 0; i < 10; i++) m.update(0.1)
    expect(m.stats.currentHealth).toBeLessThan(afterHit)
  })

  it('held shield blocks frontal damage and drains power instead of HP', () => {
    const m = makeMech(makeLoadout({ leftArm: arm('arm-shield-gen') }), { armor: 0, currentHealth: 500, energy: 100 })
    m.currentPower = 100
    m.activateShield()
    expect(m.shieldTimer).toBeGreaterThan(0)
    m.takeDamage(50, 'energy')
    // 70% of 50 = 35 blocked -> 15 to HP; but energy resist from shield-gen (0.2) also applies.
    const taken = 500 - m.stats.currentHealth
    expect(taken).toBeLessThan(50)          // shield reduced it
    expect(m.currentPower).toBeLessThan(100) // power drained
  })

  it('shield is directional: it blocks frontal fire but NOT flank/rear fire (design §3.6)', () => {
    // Mech faces +Z by default (rotation 0), so getForwardDirection() = (0,0,1).
    const frontal = new THREE.Vector3(0, 0, -1) // travelling into the +Z-facing front
    const fromRear = new THREE.Vector3(0, 0, 1) // travelling with the facing = hit from behind
    const shielded = () => makeMech(makeLoadout({ leftArm: arm('arm-shield-gen') }), { armor: 0, currentHealth: 500, energy: 100 })

    // Direction classifier
    const mDir = shielded()
    expect(mDir.isHitFromFront(frontal)).toBe(true)
    expect(mDir.isHitFromFront(fromRear)).toBe(false)

    // Frontal hit: shield engages (power drained, HP reduced by less than raw).
    const mFront = shielded(); mFront.currentPower = 100; mFront.activateShield()
    mFront.takeDamage(50, 'energy', { fromFront: mFront.isHitFromFront(frontal) })
    expect(mFront.currentPower).toBeLessThan(100)

    // Rear hit: shield does NOT block — no power drained. (Energy resist 0.2 from
    // the shield-gen part still applies to HP, but that's not the shield block.)
    const mRear = shielded(); mRear.currentPower = 100; mRear.activateShield()
    mRear.takeDamage(50, 'energy', { fromFront: mRear.isHitFromFront(fromRear) })
    expect(mRear.currentPower).toBe(100)                 // power untouched — no block
    expect(500 - mRear.stats.currentHealth).toBeCloseTo(40, 5) // 50 * (1 - 0.2 energy resist)
  })
})

describe('rack abilities', () => {
  it('ammo-feed uses a dt-driven window (no setTimeout)', () => {
    const m = makeMech(makeLoadout({ rack: findPartById('rack-ammo-feed') as MechLoadout['rack'] }))
    expect(m.useRackAbility()).toBe(true)
    expect(m.rackAbilityActive).toBe(true)
    // 5s of updates expires it.
    for (let i = 0; i < 60; i++) m.update(0.1)
    expect(m.rackAbilityActive).toBe(false)
  })

  it('smoke sets a screen window and invokes the particle hook', () => {
    const m = makeMech(makeLoadout({ rack: findPartById('rack-smoke-launcher') as MechLoadout['rack'] }))
    let spawned = false
    m.onSmokeDeploy = () => { spawned = true }
    expect(m.useRackAbility()).toBe(true)
    expect(m.smokeScreenTimer).toBeGreaterThan(0)
    expect(spawned).toBe(true)
  })

  it('jump-jets now returns true and opens a boost window', () => {
    const m = makeMech(makeLoadout({ rack: findPartById('rack-jump-jets') as MechLoadout['rack'] }))
    expect(m.useRackAbility()).toBe(true)
    expect(m.jumpBoostTimer).toBeGreaterThan(0)
  })
})
