/**
 * Phase 4 — CameraController rig profiles + the dismount drop transition
 * (design §3.1/§4.1). The controller serves both the towering-Frame view and
 * the low, close, calm on-foot view via a swappable profile, and animates the
 * ~0.8s fall between them. Covers profile switching, target repointing, shake
 * damping, and the timed transition + completion callback.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { CameraController } from '../CameraController'
import type { PilotableEntity } from '../PilotableEntity'
import { CAMERA_PROFILES, CAMERA_TRANSITION } from '../constants'

function makeTarget(pos = new THREE.Vector3()): PilotableEntity {
  return {
    position: pos.clone(),
    rotation: new THREE.Euler(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    mesh: new THREE.Group(),
    update() {},
  }
}

describe('CameraController — profiles', () => {
  it('defaults to the mech profile (base FOV matches)', () => {
    const cam = new CameraController(makeTarget())
    expect(cam.camera.fov).toBe(CAMERA_PROFILES.mech.baseFov)
  })

  it('accepts an explicit profile name at construction', () => {
    const cam = new CameraController(makeTarget(), 'onFoot')
    expect(cam.camera.fov).toBe(CAMERA_PROFILES.onFoot.baseFov)
  })

  it('setProfile clamps the orbit distance into the new profile range', () => {
    const cam = new CameraController(makeTarget()) // mech: default 10
    cam.zoomOut(100) // push well past onFoot max
    cam.setProfile('onFoot')
    // After switching, a frame update should sit within onFoot distance bounds.
    cam.update(1 / 60, 0, 0)
    const anchor = new THREE.Vector3(0, CAMERA_PROFILES.onFoot.anchorUp, 0)
    const dist = cam.camera.position.distanceTo(anchor)
    // The camera sits behind + above the anchor within the profile's max distance
    // (plus the small shoulder offset), and far closer than the mech rig.
    expect(dist).toBeLessThan(CAMERA_PROFILES.onFoot.maxDistance + 2)
  })

  it('on-foot profile widens the resting FOV vs the mech', () => {
    const mech = new CameraController(makeTarget())
    const foot = new CameraController(makeTarget(), 'onFoot')
    mech.update(1 / 60, 0, 0)
    foot.update(1 / 60, 0, 0)
    expect(foot.camera.fov).toBeGreaterThan(mech.camera.fov)
  })

  it('on-foot profile damps shake heavily (fragile human, no weight)', () => {
    // The on-foot rig scales every shake/dip by its profile.shakeScale, so a
    // fragile human barely rattles the camera vs the seismic Frame.
    expect(CAMERA_PROFILES.onFoot.shakeScale).toBeLessThan(CAMERA_PROFILES.mech.shakeScale)
    expect(CAMERA_PROFILES.onFoot.shakeScale).toBeGreaterThan(0)
  })

  it('setTarget repoints the rig at a new body', () => {
    const a = makeTarget(new THREE.Vector3(0, 0, 0))
    const b = makeTarget(new THREE.Vector3(100, 0, 0))
    const cam = new CameraController(a)
    cam.update(1 / 60, 0, 0)
    cam.setTarget(b)
    cam.update(1 / 60, 0, 0)
    // Camera should be near b (x≈100), having snapped rather than lerped across.
    expect(cam.camera.position.x).toBeGreaterThan(90)
  })
})

describe('CameraController — dismount transition', () => {
  it('is not transitioning by default', () => {
    const cam = new CameraController(makeTarget())
    expect(cam.isTransitioning).toBe(false)
  })

  it('eases from mech → onFoot over DROP_DURATION and fires done once', () => {
    const cam = new CameraController(makeTarget())
    let done = 0
    cam.playDismountTransition('mech', 'onFoot', () => { done++ })
    expect(cam.isTransitioning).toBe(true)

    // Advance a bit less than the full duration: still transitioning, FOV between.
    const dt = CAMERA_TRANSITION.DROP_DURATION / 4
    cam.update(dt, 0, 0)
    expect(cam.isTransitioning).toBe(true)
    const midFov = cam.camera.fov
    expect(midFov).toBeGreaterThan(CAMERA_PROFILES.mech.baseFov)
    expect(midFov).toBeLessThanOrEqual(CAMERA_PROFILES.onFoot.baseFov)

    // Finish it.
    cam.update(CAMERA_TRANSITION.DROP_DURATION, 0, 0)
    expect(cam.isTransitioning).toBe(false)
    expect(done).toBe(1)

    // Further updates do not re-fire done.
    cam.update(1 / 60, 0, 0)
    expect(done).toBe(1)
  })

  it('lands on the onFoot resting FOV after completing', () => {
    const cam = new CameraController(makeTarget())
    cam.playDismountTransition('mech', 'onFoot')
    cam.update(CAMERA_TRANSITION.DROP_DURATION + 0.1, 0, 0)
    // Standing still (zero velocity) → no speed FOV; FOV settles to onFoot base
    // (a brief negative settle offset eases back over subsequent frames).
    for (let i = 0; i < 60; i++) cam.update(1 / 60, 0, 0)
    expect(cam.camera.fov).toBeCloseTo(CAMERA_PROFILES.onFoot.baseFov, 0)
  })

  it('remount is the reverse call (onFoot → mech)', () => {
    const cam = new CameraController(makeTarget(), 'onFoot')
    cam.playDismountTransition('onFoot', 'mech')
    cam.update(CAMERA_TRANSITION.DROP_DURATION + 0.1, 0, 0)
    for (let i = 0; i < 60; i++) cam.update(1 / 60, 0, 0)
    expect(cam.camera.fov).toBeCloseTo(CAMERA_PROFILES.mech.baseFov, 0)
  })
})
