import * as THREE from 'three'
import type { MechEntity } from './MechEntity'
import { markRaw } from 'vue'

export class CameraController {
  camera: THREE.PerspectiveCamera
  target: MechEntity
  offset: THREE.Vector3
  mouseRotation: { x: number; y: number } = { x: 0, y: 0 }

  // Camera settings
  private readonly MIN_DISTANCE = 5
  private readonly MAX_DISTANCE = 15
  private readonly MIN_PITCH = -Math.PI / 6 // -30 degrees
  private readonly MAX_PITCH = Math.PI / 3 // 60 degrees
  private currentDistance = 10
  public sensitivityMultiplier = 1.0

  constructor(target: MechEntity) {
    this.target = target
    this.camera = markRaw(new THREE.PerspectiveCamera(
      75, // FOV
      window.innerWidth / window.innerHeight,
      0.1, // Near
      1000 // Far
    ))

    // Initial offset: behind and above the mech
    this.offset = new THREE.Vector3(0, 6, -10)
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

    // Over-the-shoulder offset (right shoulder)
    const shoulderOffsetRight = 6.0 // Lateral offset to the right
    const shoulderOffsetUp = 3.0 // Height offset above shoulder

    // Calculate base camera offset (behind the mech)
    const distance = this.currentDistance
    const behindOffset = distance * Math.cos(this.mouseRotation.y)
    const heightFromPitch = distance * Math.sin(this.mouseRotation.y)

    // Target position (mech center, slightly elevated)
    const targetPosition = this.target.position.clone()
    targetPosition.y += 3 // Look at point higher on the mech

    // Calculate camera position with rotation
    const cameraOffset = new THREE.Vector3(
      shoulderOffsetRight, // Right shoulder offset
      4 + shoulderOffsetUp + heightFromPitch, // Height with pitch adjustment
      -behindOffset // Behind the mech
    )

    // Rotate offset based on mech rotation (yaw)
    cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mouseRotation.x)

    // Calculate desired camera position
    const desiredPosition = this.target.position.clone().add(cameraOffset)

    // Smooth follow with lerp
    this.camera.position.lerp(desiredPosition, 0.15)

    // Look at target (over the shoulder view point)
    const lookAtPoint = targetPosition.clone()
    lookAtPoint.x -= shoulderOffsetRight * 0.3 * Math.cos(this.mouseRotation.x) // Slight offset from center
    lookAtPoint.z -= shoulderOffsetRight * 0.3 * Math.sin(this.mouseRotation.x)
    this.camera.lookAt(lookAtPoint)

    // Update mech rotation based on camera (player faces camera direction)
    this.target.rotation.y = this.mouseRotation.x
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
