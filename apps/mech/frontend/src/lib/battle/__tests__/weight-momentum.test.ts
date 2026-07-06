/**
 * Phase 1 — weight-class momentum (design §3.1). Weight is a *choice*: a Light
 * mech is twitchy (high acceleration, high friction → stops on a dime); an
 * Assault spools up slowly and slides (low acceleration, low friction → a
 * freight train). The pure curve lives in constants.ts (WEIGHT_MOVEMENT), keyed
 * by MechEntity.weightClass, and PhysicsSystem.updateMovement reads
 * `WEIGHT_MOVEMENT[mech.weightClass].accel`. We test the pure math here: the
 * class→curve table and the weightClass banding that selects it.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { findPartById } from '../../../shared/data/MechParts'
import type { MechLoadout } from '../../../shared/types/MechTypes'
import { WEIGHT_MOVEMENT } from '../constants'
import { MechEntity, type CombatStats } from '../MechEntity'

type Cls = 'light' | 'medium' | 'heavy' | 'assault'
const ORDER: Cls[] = ['light', 'medium', 'heavy', 'assault']

function part(id: string | null) {
  return id ? (findPartById(id) as any) : null
}

/** Build a loadout with only the slots we need to hit a target total weight. */
function loadout(over: Partial<MechLoadout>): MechLoadout {
  return {
    leftArm: null, rightArm: null, core: null, legs: null, head: null, rack: null,
    ...over,
  }
}

function mechFor(over: Partial<MechLoadout>): MechEntity {
  const stats: CombatStats = {
    maxHealth: 100, currentHealth: 100, armor: 0, speed: 50,
    firepower: 20, accuracy: 20, energy: 100,
  }
  return new MechEntity('t', 'T', loadout(over), stats, true, new THREE.Vector3())
}

describe('WEIGHT_MOVEMENT curve (constants.ts)', () => {
  it('acceleration falls monotonically as class gets heavier', () => {
    for (let i = 1; i < ORDER.length; i++) {
      expect(WEIGHT_MOVEMENT[ORDER[i]].accel)
        .toBeLessThan(WEIGHT_MOVEMENT[ORDER[i - 1]].accel)
    }
  })

  it('friction falls monotonically as class gets heavier (heavier coasts further)', () => {
    for (let i = 1; i < ORDER.length; i++) {
      expect(WEIGHT_MOVEMENT[ORDER[i]].friction)
        .toBeLessThan(WEIGHT_MOVEMENT[ORDER[i - 1]].friction)
    }
  })

  it('spans a meaningful spread (light is a real freight-train step above assault)', () => {
    expect(WEIGHT_MOVEMENT.light.accel).toBeGreaterThan(WEIGHT_MOVEMENT.assault.accel * 1.5)
  })
})

describe('MechEntity.weightClass banding', () => {
  it.each<[string, Partial<MechLoadout>, Cls]>([
    // Totals: hover 15 + scout 5 = 20 → light (<60)
    ['light', { legs: part('legs-hover'), head: part('head-scout-suite') }, 'light'],
    // diesel 35 + bipedal 20 + standard 8 = 63 → medium (60–89)
    ['medium', { core: part('core-diesel-gen'), legs: part('legs-bipedal-standard'), head: part('head-standard-optics') }, 'medium'],
    // fusion 50 + tracked 30 + reinforced 15 = 95 → heavy (90–119)
    ['heavy', { core: part('core-fusion'), legs: part('legs-tracked-heavy'), head: part('head-reinforced') }, 'heavy'],
    // + two pile drivers (15 each) = 125 → assault (≥120)
    ['assault', {
      core: part('core-fusion'), legs: part('legs-tracked-heavy'), head: part('head-reinforced'),
      leftArm: part('arm-pile-driver'), rightArm: part('arm-pile-driver'),
    }, 'assault'],
  ])('a %s-weight loadout classes as %s', (_label, slots, expected) => {
    expect(mechFor(slots).weightClass).toBe(expected)
  })
})

describe('heavier class → lower effective acceleration (composed path)', () => {
  it('the accel PhysicsSystem would read is lower for the heavier mech', () => {
    const lightMech = mechFor({ legs: part('legs-hover'), head: part('head-scout-suite') })
    const assaultMech = mechFor({
      core: part('core-fusion'), legs: part('legs-tracked-heavy'), head: part('head-reinforced'),
      leftArm: part('arm-pile-driver'), rightArm: part('arm-pile-driver'),
    })
    const lightAccel = WEIGHT_MOVEMENT[lightMech.weightClass].accel
    const assaultAccel = WEIGHT_MOVEMENT[assaultMech.weightClass].accel
    expect(assaultAccel).toBeLessThan(lightAccel)
  })

  it('weightPenalty (top-speed factor) also decreases with total weight', () => {
    const light = mechFor({ legs: part('legs-hover'), head: part('head-scout-suite') })
    const assault = mechFor({
      core: part('core-fusion'), legs: part('legs-tracked-heavy'), head: part('head-reinforced'),
      leftArm: part('arm-pile-driver'), rightArm: part('arm-pile-driver'),
    })
    expect(assault.weightPenalty).toBeLessThan(light.weightPenalty)
  })
})
