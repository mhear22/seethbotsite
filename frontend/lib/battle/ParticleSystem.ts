import * as THREE from 'three'
import { markRaw } from 'vue'

interface Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  life: number
  maxLife: number
  color: THREE.Color
  size: number
}

const MAX_PARTICLES = 500

export class ParticleSystem {
  private particles: Particle[] = []
  private geometry: THREE.BufferGeometry
  private material: THREE.PointsMaterial
  private points: THREE.Points

  private positionAttr: THREE.BufferAttribute
  private colorAttr: THREE.BufferAttribute
  private sizeAttr: THREE.BufferAttribute

  constructor(scene: THREE.Scene) {
    this.geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(MAX_PARTICLES * 3)
    const colors = new Float32Array(MAX_PARTICLES * 3)
    const sizes = new Float32Array(MAX_PARTICLES)

    this.positionAttr = new THREE.BufferAttribute(positions, 3)
    this.colorAttr = new THREE.BufferAttribute(colors, 3)
    this.sizeAttr = new THREE.BufferAttribute(sizes, 1)

    this.geometry.setAttribute('position', this.positionAttr)
    this.geometry.setAttribute('color', this.colorAttr)
    this.geometry.setAttribute('size', this.sizeAttr)

    this.material = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    this.points = markRaw(new THREE.Points(this.geometry, this.material))
    scene.add(this.points)
  }

  spawnHitEffect(position: THREE.Vector3, projectileType: 'ballistic' | 'energy' | 'missile') {
    const count = 12 + Math.floor(Math.random() * 12) // 12-23 particles (increased from 8-15)
    const color = this.getColor(projectileType)

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= MAX_PARTICLES) break

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      ).normalize().multiplyScalar(8 + Math.random() * 15) // Increased speed for more impact

      this.particles.push({
        position: position.clone().add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
          )
        ),
        velocity,
        life: 0.4 + Math.random() * 0.3, // 0.4 - 0.7s (increased lifetime for visibility)
        maxLife: 0.4 + Math.random() * 0.3,
        color: color.clone(),
        size: 0.3 + Math.random() * 0.4, // Larger particles
      })
    }

    // Add bright flash particles at the center for more visual impact
    for (let i = 0; i < 4; i++) {
      if (this.particles.length >= MAX_PARTICLES) break

      const flashColor = new THREE.Color(1, 1, 1) // White flash
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      ).normalize().multiplyScalar(2 + Math.random() * 5)

      this.particles.push({
        position: position.clone(),
        velocity,
        life: 0.15, // Short, bright flash
        maxLife: 0.15,
        color: flashColor,
        size: 0.6 + Math.random() * 0.4, // Large bright particles
      })
    }
  }

  spawnExplosion(position: THREE.Vector3) {
    const count = 30
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= MAX_PARTICLES) break

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random(),
        (Math.random() - 0.5) * 2,
      ).normalize().multiplyScalar(3 + Math.random() * 8)

      const r = 0.8 + Math.random() * 0.2
      const g = 0.2 + Math.random() * 0.4
      const b = Math.random() * 0.1

      this.particles.push({
        position: position.clone(),
        velocity,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 0.5 + Math.random() * 0.5,
        color: new THREE.Color(r, g, b),
        size: 0.3 + Math.random() * 0.5,
      })
    }
  }

  private getColor(type: 'ballistic' | 'energy' | 'missile'): THREE.Color {
    switch (type) {
      case 'energy': return new THREE.Color(0x00ffff)
      case 'missile': return new THREE.Color(0xff3300)
      default: return new THREE.Color(0xff8800)
    }
  }

  update(deltaTime: number) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.life -= deltaTime
      if (p.life <= 0) {
        this.particles.splice(i, 1)
        continue
      }

      // Apply gravity
      p.velocity.y -= 10 * deltaTime

      // Apply velocity
      p.position.add(p.velocity.clone().multiplyScalar(deltaTime))

      // Drag
      p.velocity.multiplyScalar(0.95)
    }

    // Write to buffer attributes
    const positions = this.positionAttr.array as Float32Array
    const colors = this.colorAttr.array as Float32Array
    const sizes = this.sizeAttr.array as Float32Array

    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (i < this.particles.length) {
        const p = this.particles[i]
        const t = p.life / p.maxLife // 1 -> 0

        positions[i * 3] = p.position.x
        positions[i * 3 + 1] = p.position.y
        positions[i * 3 + 2] = p.position.z

        colors[i * 3] = p.color.r * t
        colors[i * 3 + 1] = p.color.g * t
        colors[i * 3 + 2] = p.color.b * t

        sizes[i] = p.size * t
      } else {
        // Hide unused particles
        sizes[i] = 0
      }
    }

    this.positionAttr.needsUpdate = true
    this.colorAttr.needsUpdate = true
    this.sizeAttr.needsUpdate = true
    this.geometry.setDrawRange(0, this.particles.length)
  }

  cleanup() {
    this.geometry.dispose()
    this.material.dispose()
  }
}
