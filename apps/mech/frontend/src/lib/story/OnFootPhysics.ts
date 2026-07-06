import * as THREE from 'three'
import type { InputState } from '../battle/InputManager'
import type { PilotableEntity } from '../battle/PilotableEntity'
import type { PedestrianCollider } from './Town'
import { ON_FOOT } from '../battle/constants'

// PedestrianCollider is the WORLD cluster's contract (Town.ts): a discriminated
// union of axis-aligned boxes (buildings) and cylinders (masts/pillars/wells),
// all WORLD-space. OnFootPhysics resolves the pilot capsule (radius
// ON_FOOT.RADIUS) against both in the XZ plane — height/y are ignored, which is
// all the pedestrian hub needs. Fed in via setColliders(town.getPedestrianColliders()).
export type { PedestrianCollider }

/**
 * On-foot locomotion (design §4.1/§4.3) — the deliberately un-fun-to-optimise,
 * fragile-human counterpart to PhysicsSystem. WASD is camera-relative (the
 * camera writes `entity.rotation.y`, same as the mech), speed is a walk with a
 * jog on the dash key, acceleration is near-instant, and there is NO weight,
 * dash i-frame, jump-jet, boost, or power economy. Terrain-follow reuses the
 * existing `setGroundHeightProvider` heightfield; blocking is capsule-vs-cylinder
 * against the town's pedestrian colliders with a small step-over tolerance.
 *
 * Mirrors PhysicsSystem's method shape (`setGroundHeightProvider`, `onFootstep`,
 * an `updateMovement(entity, input, dt)` entry point) so the host can swap
 * systems on dismount without special-casing the loop.
 */
export class OnFootPhysics {
  /** Ground height at world (x, z); flat floor at 0 until the overworld supplies terrain. */
  private groundHeightAt: (x: number, z: number) => number = () => 0

  /** Cylinders the pilot is blocked by (town buildings / anchors). */
  private colliders: PedestrianCollider[] = []

  /**
   * Footstep hook — reuses the P1 onFootstep hook shape (a 0..~1 intensity) so
   * the camera can turn a step into a tiny dip/shake. Fired at a fraction of the
   * mech's intensity (ON_FOOT.STEP_INTENSITY). Default no-op.
   */
  public onFootstep: ((intensity: number) => void) | null = null

  private footstepAccumulator = 0

  /** Supply a ground-height function (e.g. terrain.heightAt). */
  setGroundHeightProvider(fn: (x: number, z: number) => number) {
    this.groundHeightAt = fn
  }

  /** Replace the set of pedestrian colliders the pilot is blocked by. */
  setColliders(colliders: PedestrianCollider[]) {
    this.colliders = colliders
  }

  /**
   * Advance the pilot one frame: camera-relative walk/jog, collider blocking,
   * terrain-follow + gravity, footstep cadence. Pure w.r.t. rendering — only
   * mutates `entity.position`/`entity.velocity`.
   */
  updateMovement(entity: PilotableEntity, input: InputState, deltaTime: number): void {
    // Camera-relative basis from the body's yaw (the camera wrote rotation.y).
    const forward = new THREE.Vector3(0, 0, 1).applyEuler(entity.rotation)
    const right = new THREE.Vector3(1, 0, 0).applyEuler(entity.rotation)

    const moveDir = new THREE.Vector3()
    if (input.forward) moveDir.add(forward)
    if (input.backward) moveDir.sub(forward)
    if (input.left) moveDir.add(right)
    if (input.right) moveDir.sub(right)

    const targetSpeed = input.dash ? ON_FOOT.SPRINT_SPEED : ON_FOOT.WALK_SPEED

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize()
      // Near-instant acceleration toward the target velocity (frame-rate independent).
      const targetVel = moveDir.multiplyScalar(targetSpeed)
      const diffX = targetVel.x - entity.velocity.x
      const diffZ = targetVel.z - entity.velocity.z
      const step = ON_FOOT.ACCEL * deltaTime
      entity.velocity.x += Math.sign(diffX) * Math.min(Math.abs(diffX), step)
      entity.velocity.z += Math.sign(diffZ) * Math.min(Math.abs(diffZ), step)
    } else {
      // No input: brisk friction — a person stops fast, no coasting.
      const frictionFactor = Math.exp(-ON_FOOT.FRICTION * deltaTime)
      entity.velocity.x *= frictionFactor
      entity.velocity.z *= frictionFactor
    }

    // Integrate horizontal motion, then resolve out of any colliders (sliding
    // along walls because we only push along the surface normal).
    entity.position.x += entity.velocity.x * deltaTime
    entity.position.z += entity.velocity.z * deltaTime
    this.resolveColliders(entity.position)

    // Terrain-follow + gravity with a step-over tolerance.
    this.applyGround(entity, deltaTime)

    // Footstep cadence (tiny camera events).
    this.updateFootsteps(entity, deltaTime)
  }

  /**
   * Push the pilot's centre out of every overlapping collider along the XZ
   * surface normal so the capsule (radius ON_FOOT.RADIUS) never intersects a
   * building or pillar. Motion tangential to the surface is preserved, so the
   * pilot slides along walls. Handles both collider kinds (Town.ts contract).
   */
  private resolveColliders(pos: THREE.Vector3) {
    const r = ON_FOOT.RADIUS
    for (const c of this.colliders) {
      if (c.kind === 'cylinder') {
        this.pushOutCircle(pos, c.center.x, c.center.z, c.radius + r)
      } else {
        this.pushOutBox(pos, c.center, c.halfExtents, r)
      }
    }
  }

  /** Push a point out of a circle of `minDist` centred at (cx, cz), in XZ. */
  private pushOutCircle(pos: THREE.Vector3, cx: number, cz: number, minDist: number) {
    const dx = pos.x - cx
    const dz = pos.z - cz
    const distSq = dx * dx + dz * dz
    if (distSq >= minDist * minDist) return
    const dist = Math.sqrt(distSq)
    if (dist < 1e-4) {
      pos.x = cx + minDist // dead-centre: pop out along an arbitrary axis
      return
    }
    const push = minDist / dist
    pos.x = cx + dx * push
    pos.z = cz + dz * push
  }

  /**
   * Push a point (inflated by capsule radius `r`) out of an axis-aligned box in
   * XZ. Outside/edge cases push along the nearest surface; a point that has sunk
   * inside the box is ejected through the shallowest face.
   */
  private pushOutBox(pos: THREE.Vector3, center: THREE.Vector3, half: THREE.Vector3, r: number) {
    const minX = center.x - half.x
    const maxX = center.x + half.x
    const minZ = center.z - half.z
    const maxZ = center.z + half.z

    const insideX = pos.x > minX && pos.x < maxX
    const insideZ = pos.z > minZ && pos.z < maxZ

    if (insideX && insideZ) {
      // Centre is inside the box: eject through the shallowest of the four faces.
      const toLeft = pos.x - minX
      const toRight = maxX - pos.x
      const toBack = pos.z - minZ
      const toFront = maxZ - pos.z
      const minPen = Math.min(toLeft, toRight, toBack, toFront)
      if (minPen === toLeft) pos.x = minX - r
      else if (minPen === toRight) pos.x = maxX + r
      else if (minPen === toBack) pos.z = minZ - r
      else pos.z = maxZ + r
      return
    }

    // Outside on at least one axis: push out of the box's rounded footprint via
    // the closest point on the box to the pilot.
    const cx = Math.max(minX, Math.min(maxX, pos.x))
    const cz = Math.max(minZ, Math.min(maxZ, pos.z))
    const dx = pos.x - cx
    const dz = pos.z - cz
    const distSq = dx * dx + dz * dz
    if (distSq >= r * r) return
    const dist = Math.sqrt(distSq)
    if (dist < 1e-4) return
    const push = r / dist
    pos.x = cx + dx * push
    pos.z = cz + dz * push
  }

  /**
   * Snap to the terrain surface, allowing a small upward step (so kerbs/rolling
   * hills don't trigger falls), and apply gravity when genuinely above ground
   * (walked off a ledge). No jump — the pilot never leaves the ground on purpose.
   */
  private applyGround(entity: PilotableEntity, deltaTime: number) {
    const groundY = this.groundHeightAt(entity.position.x, entity.position.z)
    const above = entity.position.y - groundY
    if (above > ON_FOOT.STEP_UP_TOLERANCE) {
      entity.velocity.y -= ON_FOOT.GRAVITY * deltaTime
      entity.position.y += entity.velocity.y * deltaTime
      if (entity.position.y <= groundY) {
        entity.position.y = groundY
        entity.velocity.y = 0
      }
    } else {
      // Within step tolerance (or below): stick to the surface.
      entity.position.y = groundY
      entity.velocity.y = 0
    }
  }

  /** Fire a low-intensity footstep on a speed-driven cadence while walking. */
  private updateFootsteps(entity: PilotableEntity, deltaTime: number) {
    const speed = Math.sqrt(entity.velocity.x ** 2 + entity.velocity.z ** 2)
    if (speed < ON_FOOT.MIN_STEP_SPEED) {
      this.footstepAccumulator = ON_FOOT.MAX_STEP_INTERVAL
      return
    }
    const interval = Math.max(
      ON_FOOT.MIN_STEP_INTERVAL,
      Math.min(ON_FOOT.MAX_STEP_INTERVAL, ON_FOOT.STRIDE_LENGTH / speed),
    )
    this.footstepAccumulator += deltaTime
    if (this.footstepAccumulator >= interval) {
      this.footstepAccumulator -= interval
      this.onFootstep?.(ON_FOOT.STEP_INTENSITY)
    }
  }
}
