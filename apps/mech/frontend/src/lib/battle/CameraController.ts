import * as THREE from 'three'
import { markRaw } from 'vue'
import {
  CAMERA,
  CAMERA_PROFILES,
  CAMERA_TRANSITION,
  type CameraProfileName,
  type CameraProfileParams,
} from './constants'
import type { PilotableEntity } from './PilotableEntity'

/** A profile passed to setProfile / playDismountTransition, by name or by params. */
type ProfileArg = CameraProfileName | CameraProfileParams

export class CameraController {
  camera: THREE.PerspectiveCamera
  /** Anything pilotable — the Frame (MechEntity) or the pilot on foot (OnFootEntity). */
  target: PilotableEntity
  mouseRotation: { x: number; y: number } = { x: 0, y: 0 }

  /**
   * Active rig geometry (distances, shoulder/anchor offsets, base FOV, shake
   * scale). Swapped by setProfile() and interpolated by the dismount transition
   * so the same controller serves the towering-Frame view and the low, close,
   * calm on-foot view (design §3.1/§4.1). Defaults to the 'mech' profile, which
   * reproduces the pre-Phase-4 CAMERA constants exactly.
   */
  private profile: CameraProfileParams = { ...CAMERA_PROFILES.mech }

  // Pitch clamp is shared across profiles (looking straight up/down is always bad).
  private readonly MIN_PITCH = CAMERA.MIN_PITCH
  private readonly MAX_PITCH = CAMERA.MAX_PITCH
  private currentDistance: number = CAMERA_PROFILES.mech.defaultDistance
  public sensitivityMultiplier = 1.0
  public invertMouseX = false
  public invertMouseY = false
  /**
   * Reduced-motion multiplier (design §5 accessibility). 1 = full camera juice;
   * 0 = suppress shake / FOV kicks / dips entirely. Set from
   * `motionScale(graphics.reducedMotion)` by the scene that owns this rig
   * (StoryWorld / BattleScene). Multiplied into every punch primitive below so
   * footfalls, landings, hit-shake and dash kicks all honour the setting.
   */
  public motionScale = 1.0

  // Mouse velocity smoothing - converts discrete integer input into smooth rotation
  private mouseVelocity = { x: 0, y: 0 }
  private readonly MOUSE_VELOCITY_DECAY = CAMERA.MOUSE_VELOCITY_DECAY

  // Screen shake
  private shakeIntensity = 0
  private readonly SHAKE_DECAY = CAMERA.SHAKE_DECAY

  // FOV offset (dash kick +, landing settle −), eased back toward 0 each frame,
  // plus a live speed-based widening layered on top.
  private fovOffset = 0
  private readonly FOV_RETURN = CAMERA.FOV_RETURN

  // Camera dip — a downward punch from footfalls / landings, eased back.
  private dipOffset = 0

  // Smoothed camera position for subtle speed-based positional lag.
  private smoothedPosition: THREE.Vector3 | null = null

  // Seconds remaining in the post-dash catch-up window, during which the
  // positional-lag rate is clamped low so the camera trails the lunge and then
  // lerps forward to catch up. Set by onDash(), counted down in update().
  private dashCatchupTimer = 0

  /**
   * Active dismount/remount transition (design §4.1). While set, update() eases
   * the rig geometry from `from` → `to` over `duration`, punches a landing
   * settle, and calls `done` when complete. null = no transition.
   */
  private transition:
    | { from: CameraProfileParams; to: CameraProfileParams; elapsed: number; duration: number; done?: () => void }
    | null = null

  constructor(target: PilotableEntity, profile: ProfileArg = 'mech') {
    this.target = target
    this.profile = { ...this.resolveProfile(profile) }
    this.currentDistance = this.profile.defaultDistance
    // Aspect from the window when present; 1 in headless/test contexts.
    const aspect = typeof window !== 'undefined' && window.innerHeight
      ? window.innerWidth / window.innerHeight
      : 1
    this.camera = markRaw(new THREE.PerspectiveCamera(
      this.profile.baseFov, // FOV
      aspect,
      0.1, // Near
      1000 // Far
    ))
  }

  /** Resolve a profile name or explicit params to a params object. */
  private resolveProfile(p: ProfileArg): CameraProfileParams {
    return typeof p === 'string' ? CAMERA_PROFILES[p] : p
  }

  /**
   * Instantly adopt a rig profile (no transition). Repoints the resting distance
   * and clamps the current orbit distance into the new profile's range.
   */
  setProfile(profile: ProfileArg): void {
    this.transition = null
    this.profile = { ...this.resolveProfile(profile) }
    this.currentDistance = Math.max(
      this.profile.minDistance,
      Math.min(this.profile.maxDistance, this.profile.defaultDistance),
    )
  }

  /**
   * Repoint the rig at a new pilotable body (mount/dismount pointer swap). Snaps
   * the smoothed position so the view does not lerp across the world from the old
   * body — the drop transition (if any) owns the felt motion.
   */
  setTarget(target: PilotableEntity): void {
    this.target = target
    this.smoothedPosition = null
  }

  /**
   * Play the ~0.8s camera fall from the cockpit view to the human eye view
   * (design §4.1). Eases the rig geometry from `from` → `to`, and on landing
   * punches a downward settle + brief FOV pinch. The remount is the same call
   * with the profiles swapped (from onFoot → mech = the climb back up).
   */
  playDismountTransition(from: ProfileArg, to: ProfileArg, done?: () => void): void {
    const f = { ...this.resolveProfile(from) }
    const t = { ...this.resolveProfile(to) }
    this.profile = { ...f }
    this.currentDistance = f.defaultDistance
    this.transition = { from: f, to: t, elapsed: 0, duration: CAMERA_TRANSITION.DROP_DURATION, done }
  }

  /** True while a dismount/remount drop is animating. */
  get isTransitioning(): boolean {
    return this.transition !== null
  }

  /**
   * Advance an active dismount/remount transition: ease the rig geometry and
   * resting distance from `from` → `to`, then on completion snap to `to`, punch
   * the landing settle (dip + inward FOV pinch), and fire the done callback.
   */
  private advanceTransition(deltaTime: number) {
    const tr = this.transition
    if (!tr) return
    tr.elapsed += deltaTime
    const raw = Math.min(1, tr.elapsed / tr.duration)
    // easeOutCubic — fast fall that settles gently, matching "falls … and settles".
    const e = 1 - Math.pow(1 - raw, 3)
    this.profile = CameraController.lerpProfile(tr.from, tr.to, e)
    this.currentDistance = tr.from.defaultDistance + (tr.to.defaultDistance - tr.from.defaultDistance) * e
    if (raw >= 1) {
      this.profile = { ...tr.to }
      this.currentDistance = tr.to.defaultDistance
      // Landing settle: a downward thud + a brief inward FOV pinch.
      this.triggerDip(CAMERA_TRANSITION.SETTLE_DIP)
      this.triggerFovKick(CAMERA_TRANSITION.SETTLE_FOV)
      const done = tr.done
      this.transition = null
      done?.()
    }
  }

  /** Linear blend of two rig profiles (used mid-transition). */
  private static lerpProfile(a: CameraProfileParams, b: CameraProfileParams, t: number): CameraProfileParams {
    const l = (x: number, y: number) => x + (y - x) * t
    return {
      minDistance: l(a.minDistance, b.minDistance),
      maxDistance: l(a.maxDistance, b.maxDistance),
      defaultDistance: l(a.defaultDistance, b.defaultDistance),
      shoulderRight: l(a.shoulderRight, b.shoulderRight),
      shoulderUp: l(a.shoulderUp, b.shoulderUp),
      anchorUp: l(a.anchorUp, b.anchorUp),
      baseFov: l(a.baseFov, b.baseFov),
      shakeScale: l(a.shakeScale, b.shakeScale),
    }
  }

  update(deltaTime: number, mouseX: number, mouseY: number) {
    this.advanceTransition(deltaTime)
    // Bumped from 0.0003 to compensate for the tighter MOUSE_VELOCITY_DECAY: a
    // higher decay drains each impulse over fewer frames, so a larger impulse
    // keeps the same per-flick rotation gain while aim stops gliding.
    const baseSensitivity = 0.00048
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

    // Anchor point: target center, elevated by the active profile.
    const anchor = this.target.position.clone()
    anchor.y += this.profile.anchorUp

    // Position camera behind the aim direction + shoulder offset
    const desiredPosition = anchor.clone()
      .sub(aimDir.clone().multiplyScalar(distance))
      .add(rightDir.clone().multiplyScalar(this.profile.shoulderRight))
    desiredPosition.y += this.profile.shoulderUp

    // Subtle speed-based positional lag: the camera eases toward the desired
    // spot, and the lag rate drops a little at speed so the rig trails the mech
    // just enough to feel weighty. Snappy enough to stay readable.
    const speed = Math.sqrt(this.target.velocity.x ** 2 + this.target.velocity.z ** 2)
    if (this.dashCatchupTimer > 0) this.dashCatchupTimer = Math.max(0, this.dashCatchupTimer - deltaTime)
    if (!this.smoothedPosition) {
      this.smoothedPosition = desiredPosition.clone()
    } else {
      const speedT = Math.min(1, speed / CAMERA.SPEED_FOV_REF_SPEED)
      let lagRate = CAMERA.POSITION_LAG_BASE * (1 - CAMERA.POSITION_LAG_SPEED_FALLOFF * speedT)
      // Just dashed: clamp to a long trail so the camera visibly lerps forward to
      // catch the lunge instead of rigidly tracking it.
      if (this.dashCatchupTimer > 0) lagRate = Math.min(lagRate, CAMERA.DASH_LAG_RATE)
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
    const desiredFov = this.profile.baseFov + this.fovOffset + speedFov
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
    anchor.y += this.profile.anchorUp

    const desiredPosition = anchor.clone()
      .sub(aimDir.clone().multiplyScalar(distance))
      .add(rightDir.clone().multiplyScalar(this.profile.shoulderRight))
    desiredPosition.y += this.profile.shoulderUp
    desiredPosition.y -= this.dipOffset

    if (this.smoothedPosition) {
      this.smoothedPosition.copy(desiredPosition)
    }
    this.camera.position.copy(desiredPosition)
    this.camera.lookAt(this.camera.position.clone().add(aimDir))
  }

  triggerShake(intensity: number) {
    // Profile shake scale heavily damps on-foot shake — a person has no weight.
    // motionScale (reduced-motion) can zero it out entirely.
    this.shakeIntensity = Math.max(
      this.shakeIntensity,
      intensity * this.profile.shakeScale * this.motionScale,
    )
  }

  /**
   * Open the post-dash catch-up window: for a short spell the positional lag is
   * clamped low so the camera hangs back as the mech lunges, then lerps forward
   * to catch up (a burst-of-speed read rather than a rigid teleport of the view).
   * Reduced-motion (motionScale 0) skips the trail so the view stays locked.
   */
  onDash() {
    if (this.motionScale <= 0) return
    this.dashCatchupTimer = CAMERA.DASH_CATCHUP_DURATION
  }

  /** Punch the FOV outward (dash juice); eased back to base in update(). */
  triggerFovKick(amount: number) {
    // Additive so kicks accumulate a little, clamped so it never over-widens.
    // Reduced-motion suppresses the kick (motionScale = 0).
    this.fovOffset = Math.max(-15, Math.min(25, this.fovOffset + amount * this.motionScale))
  }

  /** Punch the camera downward (footfall / landing weight); eased back in update(). */
  triggerDip(amount: number) {
    // Damped by the active profile so on-foot footfalls barely register; and by
    // motionScale so reduced-motion holds the camera steady.
    this.dipOffset = Math.min(
      2.0,
      this.dipOffset + amount * this.profile.shakeScale * this.motionScale,
    )
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
    this.currentDistance = Math.max(this.profile.minDistance, this.currentDistance - amount)
  }

  zoomOut(amount: number) {
    this.currentDistance = Math.min(this.profile.maxDistance, this.currentDistance + amount)
  }
}
