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
    const sensitivity = 0.002
    this.mouseRotation.x -= mouseX * sensitivity // Horizontal (yaw)
    this.mouseRotation.y -= mouseY * sensitivity // Vertical (pitch)

    // Clamp vertical rotation
    this.mouseRotation.y = Math.max(
      this.MIN_PITCH,
      Math.min(this.MAX_PITCH, this.mouseRotation.y)
    )

    // Calculate camera position based on mouse rotation
    const horizontalOffset = this.currentDistance * Math.sin(this.mouseRotation.x)
    const verticalOffset = this.currentDistance * Math.sin(this.mouseRotation.y) + 6
    const depthOffset = this.currentDistance * Math.cos(this.mouseRotation.x)

    // Target position (slightly above mech center)
    const targetPosition = this.target.position.clone()
    targetPosition.y += 2

    // Calculate desired camera position
    const desiredPosition = targetPosition.clone()
    desiredPosition.x -= horizontalOffset
    desiredPosition.y += verticalOffset
    desiredPosition.z -= depthOffset

    // Smooth follow with lerp
    this.camera.position.lerp(desiredPosition, 0.15)

    // Look at target
    this.camera.lookAt(targetPosition)

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
