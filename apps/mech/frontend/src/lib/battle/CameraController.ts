import * as THREE from 'three'
import type { MechEntity } from './MechEntity'
import { markRaw } from 'vue'
import { CAMERA } from './constants'

export class CameraController {
  camera: THREE.PerspectiveCamera
  target: MechEntity
  mouseRotation: { x: number; y: number } = { x: 0, y: 0 }

  // Camera settings (centralized in constants.ts CAMERA group).
  private readonly MIN_DISTANCE = CAMERA.MIN_DISTANCE
  private readonly MAX_DISTANCE = CAMERA.MAX_DISTANCE
  private readonly MIN_PITCH = CAMERA.MIN_PITCH
  private readonly MAX_PITCH = CAMERA.MAX_PITCH
  private currentDistance: number = CAMERA.DEFAULT_DISTANCE
  public sensitivityMultiplier = 1.0
  public invertMouseX = false
  public invertMouseY = false

  // Over-the-shoulder offset (applied after orbit calculation)
  private readonly SHOULDER_RIGHT = CAMERA.SHOULDER_RIGHT
  private readonly SHOULDER_UP = CAMERA.SHOULDER_UP

  // Mouse velocity smoothing - converts discrete integer input into smooth rotation
  private mouseVelocity = { x: 0, y: 0 }
  private readonly MOUSE_VELOCITY_DECAY = CAMERA.MOUSE_VELOCITY_DECAY

  // Screen shake
  private shakeIntensity = 0
  private readonly SHAKE_DECAY = CAMERA.SHAKE_DECAY

  // FOV offset (dash kick +, landing settle −), eased back toward 0 each frame,
  // plus a live speed-based widening layered on top.
  private readonly BASE_FOV = CAMERA.BASE_FOV
  private fovOffset = 0
  private readonly FOV_RETURN = CAMERA.FOV_RETURN

  // Camera dip — a downward punch from footfalls / landings, eased back.
  private dipOffset = 0

  // Smoothed camera position for subtle speed-based positional lag.
  private smoothedPosition: THREE.Vector3 | null = null

  constructor(target: MechEntity) {
    this.target = target
    this.camera = markRaw(new THREE.PerspectiveCamera(
      this.BASE_FOV, // FOV
      window.innerWidth / window.innerHeight,
      0.1, // Near
      1000 // Far
    ))
  }

  update(deltaTime: number, mouseX: number, mouseY: number) {
    const baseSensitivity = 0.0003
    const sensitivity = baseSensitivity * this.sensitivityMultiplier

    // Apply invert settings
    const xMultiplier = this.invertMouseX ? 1 : -1
    const yMultiplier = this.invertMouseY ? -1 : 1

    // Convert raw integer mouse input into velocity impulses
    // New input adds to velocity, then velocity is applied and decayed each frame
    this.mouseVelocity.x += mouseX * sensitivity * xMultiplier
    this.mouseVelocity.y += mouseY * sensitivity * yMultiplier

    // Apply velocity to rotation
    this.mouseRotation.x += this.mouseVelocity.x
    this.mouseRotation.y -= this.mouseVelocity.y

    // Decay velocity toward zero (frame-rate independent)
    const decay = Math.exp(-this.MOUSE_VELOCITY_DECAY * deltaTime)
    this.mouseVelocity.x *= decay
    this.mouseVelocity.y *= decay

    // Kill tiny residual velocity to prevent drift
    if (Math.abs(this.mouseVelocity.x) < 0.0001) this.mouseVelocity.x = 0
    if (Math.abs(this.mouseVelocity.y) < 0.0001) this.mouseVelocity.y = 0

    // Clamp vertical rotation to prevent looking too far up/down
    this.mouseRotation.y = Math.max(
      this.MIN_PITCH,
      Math.min(this.MAX_PITCH, this.mouseRotation.y)
    )

    const yaw = this.mouseRotation.x
    const pitch = this.mouseRotation.y
    const distance = this.currentDistance

    // Camera's forward direction from yaw/pitch (where the player is aiming)
    const aimDir = new THREE.Vector3(
      Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.cos(yaw) * Math.cos(pitch)
    )

    // Camera right direction (must match THREE.js Euler Y rotation convention)
    const rightDir = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw))

    // Anchor point: mech center, slightly elevated
    const anchor = this.target.position.clone()
    anchor.y += CAMERA.ANCHOR_UP

    // Position camera behind the aim direction + shoulder offset
    const desiredPosition = anchor.clone()
      .sub(aimDir.clone().multiplyScalar(distance))
      .add(rightDir.clone().multiplyScalar(this.SHOULDER_RIGHT))
    desiredPosition.y += this.SHOULDER_UP

    // Subtle speed-based positional lag: the camera eases toward the desired
    // spot, and the lag rate drops a little at speed so the rig trails the mech
    // just enough to feel weighty. Snappy enough to stay readable.
    const speed = Math.sqrt(this.target.velocity.x ** 2 + this.target.velocity.z ** 2)
    if (!this.smoothedPosition) {
      this.smoothedPosition = desiredPosition.clone()
    } else {
      const speedT = Math.min(1, speed / CAMERA.SPEED_FOV_REF_SPEED)
      const lagRate = CAMERA.POSITION_LAG_BASE * (1 - CAMERA.POSITION_LAG_SPEED_FALLOFF * speedT)
      const lerpFactor = 1 - Math.exp(-lagRate * deltaTime)
      this.smoothedPosition.lerp(desiredPosition, lerpFactor)
    }
    this.camera.position.copy(this.smoothedPosition)

    // Ease the camera dip back toward zero, then apply as a downward punch.
    this.dipOffset *= Math.max(0, 1 - CAMERA.DIP_RETURN * deltaTime)
    if (this.dipOffset < 0.001) this.dipOffset = 0
    this.camera.position.y -= this.dipOffset

    // Apply screen shake offset
    if (this.shakeIntensity > 0.001) {
      this.camera.position.x += (Math.random() - 0.5) * 2 * this.shakeIntensity
      this.camera.position.y += (Math.random() - 0.5) * 2 * this.shakeIntensity
      this.shakeIntensity *= Math.max(0, 1 - this.SHAKE_DECAY * deltaTime)
    }

    // Look along the aim direction (at a far point), NOT at the mech
    const lookTarget = this.camera.position.clone().add(aimDir)
    this.camera.lookAt(lookTarget)

    // Ease the FOV offset back toward zero (works for both the + dash kick and
    // the − landing pinch), then layer a live speed-based widening on top.
    this.fovOffset *= Math.max(0, 1 - this.FOV_RETURN * deltaTime)
    if (Math.abs(this.fovOffset) < 0.01) this.fovOffset = 0
    const speedFov = CAMERA.SPEED_FOV_MAX * Math.min(1, speed / CAMERA.SPEED_FOV_REF_SPEED)
    const desiredFov = this.BASE_FOV + this.fovOffset + speedFov
    if (Math.abs(this.camera.fov - desiredFov) > 0.01) {
      this.camera.fov = desiredFov
      this.camera.updateProjectionMatrix()
    }

    // Update mech rotation based on camera (player faces camera direction)
    this.target.rotation.y = this.mouseRotation.x
  }

  /**
   * Reposition the camera to the current target + rotation WITHOUT advancing
   * any time-based state (mouse velocity, shake, FOV, dip). Call after the
   * target's position has moved within the same frame so the view tracks the
   * mech. This is a hard within-frame correction, so it snaps the smoothed
   * position to the corrected spot.
   */
  reanchor() {
    const yaw = this.mouseRotation.x
    const pitch = this.mouseRotation.y
    const distance = this.currentDistance

    const aimDir = new THREE.Vector3(
      Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.cos(yaw) * Math.cos(pitch)
    )
    const rightDir = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw))

    const anchor = this.target.position.clone()
    anchor.y += CAMERA.ANCHOR_UP

    const desiredPosition = anchor.clone()
      .sub(aimDir.clone().multiplyScalar(distance))
      .add(rightDir.clone().multiplyScalar(this.SHOULDER_RIGHT))
    desiredPosition.y += this.SHOULDER_UP
    desiredPosition.y -= this.dipOffset

    if (this.smoothedPosition) {
      this.smoothedPosition.copy(desiredPosition)
    }
    this.camera.position.copy(desiredPosition)
    this.camera.lookAt(this.camera.position.clone().add(aimDir))
  }

  triggerShake(intensity: number) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity)
  }

  /** Punch the FOV outward (dash juice); eased back to base in update(). */
  triggerFovKick(amount: number) {
    // Additive so kicks accumulate a little, clamped so it never over-widens.
    this.fovOffset = Math.max(-15, Math.min(25, this.fovOffset + amount))
  }

  /** Punch the camera downward (footfall / landing weight); eased back in update(). */
  triggerDip(amount: number) {
    this.dipOffset = Math.min(2.0, this.dipOffset + amount)
  }

  /**
   * Footfall hook — wire from PhysicsSystem.onFootstep. Turns a weight-scaled
   * step intensity into a small camera dip + shake so a heavy mech's stride is
   * felt, not just seen.
   */
  onFootstep(intensity: number) {
    this.triggerDip(intensity * CAMERA.FOOTSTEP_DIP_SCALE)
    this.triggerShake(intensity * CAMERA.FOOTSTEP_SHAKE_SCALE)
  }

  /**
   * Landing hook — wire from PhysicsSystem.onLanding. A hard landing dips and
   * shakes harder and pinches the FOV inward briefly (the "settle").
   */
  onLanding(intensity: number) {
    this.triggerDip(intensity * CAMERA.LANDING_DIP_SCALE)
    this.triggerShake(intensity * CAMERA.LANDING_SHAKE_SCALE)
    // Scale the inward FOV pinch by intensity (LANDING_FOV_SETTLE is negative).
    this.triggerFovKick(CAMERA.LANDING_FOV_SETTLE * intensity)
  }

  handleResize(width: number, height: number) {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  zoomIn(amount: number) {
    this.currentDistance = Math.max(this.MIN_DISTANCE, this.currentDistance - amount)
  }

  zoomOut(amount: number) {
    this.currentDistance = Math.min(this.MAX_DISTANCE, this.currentDistance + amount)
  }
}
