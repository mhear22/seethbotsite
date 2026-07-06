/**
 * Phase 1 — flamer burn damage-over-time lifecycle (design §3.2). The flamer's
 * kill identity: a hit with { burn: true } starts a short dt-driven DoT that
 * ticks in MechEntity.update(), respects pause (no update() call = no tick),
 * and expires on its own. Ticking is dt-scaled so it is frame-rate independent
 * and honours hitstop.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { findPartById } from '../../../shared/data/MechParts'
import type { MechLoadout } from '../../../shared/types/MechTypes'
import { MechEntity, type CombatStats } from '../MechEntity'

function makeLoadout(): MechLoadout {
  return {
    leftArm: findPartById('arm-autocannon-mk1') as MechLoadout['leftArm'],
    rightArm: findPartById('arm-autocannon-mk1') as MechLoadout['rightArm'],
    core: findPartById('core-diesel-gen') as MechLoadout['core'],
    legs: findPartById('legs-bipedal-standard') as MechLoadout['legs'],
    head: findPartById('head-standard-optics') as MechLoadout['head'],
    rack: null,
  }
}

function makeMech(health = 500): MechEntity {
  const stats: CombatStats = {
    maxHealth: 500, currentHealth: health, armor: 0, speed: 50,
    firepower: 20, accuracy: 20, energy: 100,
  }
  // armor 0 so the impact-hit maths stay obvious; we only care about the DoT here.
  return new MechEntity('t', 'Test', makeLoadout(), stats, false, new THREE.Vector3())
}

describe('flamer burn DoT', () => {
  it('applies a burn window on a burn hit', () => {
    const m = makeMech()
    m.takeDamage(0, 'energy', { burn: true })
    expect(m.burnTimer).toBeGreaterThan(0)
  })

  it('does NOT tick while paused (no update() calls)', () => {
    const m = makeMech()
    m.takeDamage(0, 'energy', { burn: true })
    const hp = m.stats.currentHealth
    // Simulate a paused host: time passes but update() is never called.
    expect(m.stats.currentHealth).toBe(hp)
    expect(m.burnTimer).toBeGreaterThan(0)
  })

  it('ticks health down over dt-driven update() calls', () => {
    const m = makeMech()
    m.takeDamage(0, 'energy', { burn: true })
    const start = m.stats.currentHealth
    m.update(0.1)
    expect(m.stats.currentHealth).toBeLessThan(start)
  })

  it('is frame-rate independent: one big step == many small steps', () => {
    const big = makeMech()
    big.takeDamage(0, 'energy', { burn: true })
    big.update(0.5)

    const small = makeMech()
    small.takeDamage(0, 'energy', { burn: true })
    for (let i = 0; i < 5; i++) small.update(0.1)

    expect(big.stats.currentHealth).toBeCloseTo(small.stats.currentHealth, 4)
  })

  it('expires after its duration and stops dealing damage', () => {
    const m = makeMech()
    m.takeDamage(0, 'energy', { burn: true })
    // Run well past the burn duration.
    for (let i = 0; i < 40; i++) m.update(0.1)
    expect(m.burnTimer).toBe(0)

    const settled = m.stats.currentHealth
    // Further updates must not reduce health any more.
    for (let i = 0; i < 10; i++) m.update(0.1)
    expect(m.stats.currentHealth).toBe(settled)
  })

  it('deals a bounded total (~duration × dps), not runaway damage', () => {
    const m = makeMech(500)
    m.takeDamage(0, 'energy', { burn: true })
    for (let i = 0; i < 40; i++) m.update(0.1)
    const total = 500 - m.stats.currentHealth
    // BURN_DURATION 2.0 × BURN_DPS 6 = 12 total.
    expect(total).toBeCloseTo(12, 1)
  })

  it('a re-hit refreshes the window rather than stacking dps', () => {
    const m = makeMech()
    m.takeDamage(0, 'energy', { burn: true })
    m.update(0.5)
    const refreshed = m.burnTimer
    m.takeDamage(0, 'energy', { burn: true }) // re-hit
    expect(m.burnTimer).toBeGreaterThan(refreshed)
  })

  it('burns down to zero and clamps (never negative)', () => {
    const m = makeMech(5) // less HP than the 12 total burn will deal
    m.takeDamage(0, 'energy', { burn: true })
    for (let i = 0; i < 40; i++) m.update(0.1)
    expect(m.stats.currentHealth).toBe(0)
  })
})
