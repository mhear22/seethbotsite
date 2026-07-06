/**
 * Phase 4 — on-foot locomotion (design §4.1/§4.3). The pilot is a fragile human:
 * a camera-relative walk with a jog on the dash key, near-instant acceleration,
 * no weight/dash-iframe/jump, terrain-follow with a small step-over tolerance,
 * and capsule-vs-cylinder blocking against town pedestrian colliders. These
 * cover the pure movement math and the collider/terrain resolution.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { OnFootPhysics } from '../OnFootPhysics'
import type { PedestrianCollider } from '../Town'
import type { PilotableEntity } from '../../battle/PilotableEntity'
import type { InputState } from '../../battle/InputManager'
import { ON_FOOT } from '../../battle/constants'

function makeEntity(pos = new THREE.Vector3()): PilotableEntity {
  return {
    position: pos.clone(),
    rotation: new THREE.Euler(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    mesh: new THREE.Group(),
    update() {},
  }
}

function input(partial: Partial<InputState> = {}): InputState {
  return {
    forward: false, backward: false, left: false, right: false,
    jump: false, shootLeft: false, shootRight: false,
    dash: false, useAbility: false, useRackAbility: false,
    mouseX: 0, mouseY: 0,
    ...partial,
  }
}

/** Advance n steps of dt so velocity reaches steady state (near-instant accel). */
function run(phys: OnFootPhysics, e: PilotableEntity, inp: InputState, dt: number, steps: number) {
  for (let i = 0; i < steps; i++) phys.updateMovement(e, inp, dt)
}

describe('OnFootPhysics — walk / jog', () => {
  it('walks forward at ~WALK_SPEED (camera-relative, no rotation)', () => {
    const phys = new OnFootPhysics()
    const e = makeEntity()
    run(phys, e, input({ forward: true }), 1 / 60, 40)
    const speed = Math.sqrt(e.velocity.x ** 2 + e.velocity.z ** 2)
    expect(speed).toBeCloseTo(ON_FOOT.WALK_SPEED, 1)
    // rotation.y = 0 → forward is +z.
    expect(e.velocity.z).toBeGreaterThan(0)
    expect(Math.abs(e.velocity.x)).toBeLessThan(0.01)
  })

  it('sprints at ~SPRINT_SPEED while the dash key is held', () => {
    const phys = new OnFootPhysics()
    const e = makeEntity()
    run(phys, e, input({ forward: true, dash: true }), 1 / 60, 40)
    const speed = Math.sqrt(e.velocity.x ** 2 + e.velocity.z ** 2)
    expect(speed).toBeCloseTo(ON_FOOT.SPRINT_SPEED, 1)
  })

  it('movement is camera-relative — yaw rotates the walk direction', () => {
    const phys = new OnFootPhysics()
    const e = makeEntity()
    e.rotation.y = Math.PI / 2 // face +x
    run(phys, e, input({ forward: true }), 1 / 60, 40)
    // forward now points along +x (approx), not +z.
    expect(e.velocity.x).toBeGreaterThan(ON_FOOT.WALK_SPEED * 0.9)
    expect(Math.abs(e.velocity.z)).toBeLessThan(0.5)
  })

  it('stops quickly under friction when input releases', () => {
    const phys = new OnFootPhysics()
    const e = makeEntity()
    run(phys, e, input({ forward: true }), 1 / 60, 40)
    run(phys, e, input(), 1 / 60, 40)
    const speed = Math.sqrt(e.velocity.x ** 2 + e.velocity.z ** 2)
    expect(speed).toBeLessThan(0.1)
  })
})

describe('OnFootPhysics — terrain follow', () => {
  it('snaps the pilot to the ground height each frame', () => {
    const phys = new OnFootPhysics()
    phys.setGroundHeightProvider(() => 5)
    const e = makeEntity(new THREE.Vector3(0, 0, 0))
    phys.updateMovement(e, input(), 1 / 60, 1)
    expect(e.position.y).toBeCloseTo(5, 3)
  })

  it('steps up small rises within STEP_UP_TOLERANCE without falling', () => {
    const phys = new OnFootPhysics()
    // Ground rises by less than the step tolerance ahead.
    phys.setGroundHeightProvider(() => 0.4)
    const e = makeEntity(new THREE.Vector3(0, 0, 0))
    phys.updateMovement(e, input({ forward: true }), 1 / 60, 1)
    expect(e.position.y).toBeCloseTo(0.4, 3)
    expect(e.velocity.y).toBe(0)
  })

  it('falls under gravity when above the ground beyond the step tolerance', () => {
    const phys = new OnFootPhysics()
    phys.setGroundHeightProvider(() => 0)
    const e = makeEntity(new THREE.Vector3(0, 10, 0))
    phys.updateMovement(e, input(), 1 / 60, 1)
    expect(e.velocity.y).toBeLessThan(0)
    expect(e.position.y).toBeLessThan(10)
  })
})

describe('OnFootPhysics — collider blocking', () => {
  it('blocks the pilot out of a cylinder collider (capsule vs cylinder)', () => {
    const phys = new OnFootPhysics()
    const collider: PedestrianCollider = { kind: 'cylinder', center: new THREE.Vector3(3, 0, 0), radius: 2, height: 4 }
    phys.setColliders([collider])
    const e = makeEntity(new THREE.Vector3(0, 0, 0))
    // Drive toward +x by facing +x and walking forward into the cylinder.
    e.rotation.y = Math.PI / 2
    run(phys, e, input({ forward: true }), 1 / 60, 120)
    const dx = e.position.x - collider.center.x
    const dz = e.position.z - collider.center.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    expect(dist).toBeGreaterThanOrEqual(collider.radius + ON_FOOT.RADIUS - 1e-3)
  })

  it('blocks the pilot out of an axis-aligned box collider (building)', () => {
    const phys = new OnFootPhysics()
    const box: PedestrianCollider = {
      kind: 'box',
      center: new THREE.Vector3(4, 0, 0),
      halfExtents: new THREE.Vector3(2, 5, 3),
    }
    phys.setColliders([box])
    const e = makeEntity(new THREE.Vector3(0, 0, 0))
    e.rotation.y = Math.PI / 2 // face +x, walk into the box's -x face
    run(phys, e, input({ forward: true }), 1 / 60, 200)
    // Should be stopped just outside the box's near face (minX - pilot radius).
    const nearFace = box.center.x - box.halfExtents.x
    expect(e.position.x).toBeLessThanOrEqual(nearFace - ON_FOOT.RADIUS + 1e-2)
  })

  it('leaves the pilot untouched when clear of all colliders', () => {
    const phys = new OnFootPhysics()
    phys.setColliders([{ kind: 'cylinder', center: new THREE.Vector3(50, 0, 50), radius: 2, height: 4 }])
    const e = makeEntity(new THREE.Vector3(0, 0, 0))
    phys.updateMovement(e, input({ forward: true }), 1 / 60, 1)
    // Moved forward normally; not shoved by the distant collider.
    expect(e.position.z).toBeGreaterThan(0)
  })
})

describe('OnFootPhysics — footstep hook', () => {
  it('fires onFootstep at ON_FOOT.STEP_INTENSITY while walking', () => {
    const phys = new OnFootPhysics()
    let last = -1
    let count = 0
    phys.onFootstep = (i) => { last = i; count++ }
    const e = makeEntity()
    run(phys, e, input({ forward: true }), 1 / 60, 120)
    expect(count).toBeGreaterThan(0)
    expect(last).toBeCloseTo(ON_FOOT.STEP_INTENSITY, 5)
  })

  it('does not fire footsteps while standing still', () => {
    const phys = new OnFootPhysics()
    let count = 0
    phys.onFootstep = () => { count++ }
    const e = makeEntity()
    run(phys, e, input(), 1 / 60, 120)
    expect(count).toBe(0)
  })
})
