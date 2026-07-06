/**
 * Phase 1 — the jump-jets rack ability's "boosted jump" window (design §3.4).
 * useRackAbility() opens mech.jumpBoostTimer; PhysicsSystem.updateJumpJets must
 * read it and launch harder while it is open. Before the fix the timer was set
 * but never read, so the advertised extra lift did nothing (only fuel refilled).
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { findPartById } from '../../../shared/data/MechParts'
import type { MechLoadout } from '../../../shared/types/MechTypes'
import { MechEntity, type CombatStats } from '../MechEntity'
import { PhysicsSystem } from '../PhysicsSystem'
import type { InputState } from '../InputManager'

function loadout(): MechLoadout {
  return {
    leftArm: findPartById('arm-autocannon-mk1') as MechLoadout['leftArm'],
    rightArm: findPartById('arm-autocannon-mk1') as MechLoadout['rightArm'],
    core: findPartById('core-diesel-gen') as MechLoadout['core'],
    legs: findPartById('legs-bipedal-standard') as MechLoadout['legs'],
    head: findPartById('head-standard-optics') as MechLoadout['head'],
    rack: findPartById('rack-jump-jets') as MechLoadout['rack'],
  }
}

function makeMech(): MechEntity {
  const stats: CombatStats = {
    maxHealth: 500, currentHealth: 500, armor: 0, speed: 50,
    firepower: 20, accuracy: 20, energy: 100,
  }
  return new MechEntity('t', 'Test', loadout(), stats, true, new THREE.Vector3(0, 0, 0))
}

function jumpInput(): InputState {
  return {
    forward: false, backward: false, left: false, right: false,
    jump: true, shootLeft: false, shootRight: false, dash: false,
    useAbility: false, useRackAbility: false, mouseX: 0, mouseY: 0,
  }
}

/** Launch velocity captured on the initiating frame (tiny dt so gravity is negligible). */
function launchVelocity(boosted: boolean): number {
  const ps = new PhysicsSystem()
  const mech = makeMech()
  mech.position.set(0, 0, 0)
  mech.velocity.set(0, 0, 0)
  mech.isJumping = false
  if (boosted) mech.jumpBoostTimer = 1
  ps.updateJumpJets(mech, jumpInput(), 0.0001)
  return mech.velocity.y
}

describe('jump-jets rack ability — boosted jump window', () => {
  it('launches harder while jumpBoostTimer is open than without it', () => {
    const base = launchVelocity(false)
    const boosted = launchVelocity(true)
    expect(base).toBeGreaterThan(0)
    expect(boosted).toBeGreaterThan(base)
    // ~1.5× the base launch (gravity over the 0.0001s frame is negligible).
    expect(boosted / base).toBeCloseTo(1.5, 1)
  })

  it('useRackAbility opens the boost window that the physics reads', () => {
    const mech = makeMech()
    expect(mech.jumpBoostTimer).toBe(0)
    expect(mech.useRackAbility()).toBe(true)
    expect(mech.jumpBoostTimer).toBeGreaterThan(0)
  })
})
