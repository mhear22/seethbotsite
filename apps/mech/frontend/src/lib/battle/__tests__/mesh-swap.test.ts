/**
 * Regression: the async model-load swap in MechEntity.loadAndApplyModels must
 * keep the mech's rendered body attached to the scene.
 *
 * Callers add `mech.mesh` to the scene synchronously right after construction
 * (StoryWorld.ts:342, StoryCombat.ts:549, BattleScene.ts:505/556). The loader
 * then resolves (assembleMech never rejects — it falls back to procedural
 * parts) and rebinds `this.mesh` to a freshly assembled group. Before the fix,
 * that new group was never added to the scene: the visible body froze at the
 * spawn transform while update() animated a detached group, and on kill
 * `scene.remove(mech.mesh)` removed the wrong group, leaking a ghost mesh.
 *
 * The fix reparents the new group into the old mesh's parent inside
 * loadAndApplyModels, so after waitForModelLoad() the live `mech.mesh` is the
 * one in the scene and the old group is gone.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { findPartById } from '../../../shared/data/MechParts'
import type { ArmPart, MechLoadout } from '../../../shared/types/MechTypes'
import { MechEntity, type CombatStats } from '../MechEntity'

function makeLoadout(): MechLoadout {
  return {
    leftArm: findPartById('arm-autocannon-mk1') as ArmPart,
    rightArm: findPartById('arm-autocannon-mk1') as ArmPart,
    core: findPartById('core-diesel-gen') as MechLoadout['core'],
    legs: findPartById('legs-bipedal-standard') as MechLoadout['legs'],
    head: findPartById('head-standard-optics') as MechLoadout['head'],
    rack: null,
  }
}

function makeMech(): MechEntity {
  const stats: CombatStats = {
    maxHealth: 500, currentHealth: 500, armor: 0, speed: 50,
    firepower: 999, accuracy: 20, energy: 100,
  }
  return new MechEntity('swap', 'Swap', makeLoadout(), stats, true, new THREE.Vector3(1, 0, 2))
}

describe('MechEntity async model swap keeps the body in the scene', () => {
  it('after waitForModelLoad, mech.mesh is the group attached to the scene (no ghost)', async () => {
    const scene = new THREE.Scene()
    const mech = makeMech()

    // Mirror every call site: add the immediate procedural mesh synchronously.
    scene.add(mech.mesh)
    const before = mech.mesh

    await mech.waitForModelLoad()

    // Whatever group the entity now animates must be the one the scene renders.
    expect(mech.mesh.parent).toBe(scene)
    expect(scene.children.includes(mech.mesh)).toBe(true)

    // If the loader swapped in a new group, the old one must not linger as a
    // frozen ghost in the scene.
    if (mech.mesh !== before) {
      expect(scene.children.includes(before)).toBe(false)
    }

    // Kill-path contract: scene.remove(mech.mesh) leaves no mech group behind.
    scene.remove(mech.mesh)
    expect(scene.children.some((c) => c === mech.mesh || c === before)).toBe(false)
  })

  it('still resolves cleanly when the mesh was never added to a scene', async () => {
    const mech = makeMech()
    await mech.waitForModelLoad()
    expect(mech.mesh.parent).toBeNull()
    // Position transfer still applies to the swapped group.
    expect(mech.mesh.position.x).toBe(1)
    expect(mech.mesh.position.z).toBe(2)
  })
})
