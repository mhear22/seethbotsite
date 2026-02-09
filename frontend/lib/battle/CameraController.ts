import * as THREE from 'three'
import type { MechEntity } from './MechEntity'
import { markRaw } from 'vue'

export class CameraController {
  camera: THREE.PerspectiveCamera
  target: MechEntity
  mouseRotation: { x: number; y: number } = { x: 0, y: 0 }

  // Camera settings
  private readonly MIN_DISTANCE = 5
  private readonly MAX_DISTANCE = 15
  private readonly MIN_PITCH = -Math.PI / 6 // -30 degrees
  private readonly MAX_PITCH = Math.PI / 3 // 60 degrees
  private currentDistance = 10
  public sensitivityMultiplier = 1.0

  // Over-the-shoulder offset (applied after orbit calculation)
  private readonly SHOULDER_RIGHT = 2.5
  private readonly SHOULDER_UP = 3.0

  // Smoothing rate (units per second, frame-rate independent)
  private readonly SMOOTH_SPEED = 12

  // Screen shake
  private shakeIntensity = 0
  private readonly SHAKE_DECAY = 8 // How fast shake fades

  constructor(target: MechEntity) {
    this.target = target
    this.camera = markRaw(new THREE.PerspectiveCamera(
      75, // FOV
      window.innerWidth / window.innerHeight,
      0.1, // Near
      1000 // Far
    ))
  }

  update(deltaTime: number, mouseX: number, mouseY: number) {
    // Apply mouse rotation
    const baseSensitivity = 0.002
    const sensitivity = baseSensitivity * this.sensitivityMultiplier
    this.mouseRotation.x -= mouseX * sensitivity // Horizontal (yaw)
    this.mouseRotation.y -= mouseY * sensitivity // Vertical (pitch)

    // Clamp vertical rotation
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
    anchor.y += 3

    // Position camera behind the aim direction + shoulder offset
    const desiredPosition = anchor.clone()
      .sub(aimDir.clone().multiplyScalar(distance))
      .add(rightDir.clone().multiplyScalar(this.SHOULDER_RIGHT))
    desiredPosition.y += this.SHOULDER_UP

    // Direct camera positioning — no lag on mouse input
    this.camera.position.copy(desiredPosition)

    // Apply screen shake offset
    if (this.shakeIntensity > 0.001) {
      this.camera.position.x += (Math.random() - 0.5) * 2 * this.shakeIntensity
      this.camera.position.y += (Math.random() - 0.5) * 2 * this.shakeIntensity
      this.shakeIntensity *= Math.max(0, 1 - this.SHAKE_DECAY * deltaTime)
    }

    // Look along the aim direction (at a far point), NOT at the mech
    const lookTarget = this.camera.position.clone().add(aimDir)
    this.camera.lookAt(lookTarget)

    // Update mech rotation based on camera (player faces camera direction)
    this.target.rotation.y = this.mouseRotation.x
  }

  triggerShake(intensity: number) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity)
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
