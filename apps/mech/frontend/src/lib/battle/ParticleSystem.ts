import * as THREE from 'three'
import { markRaw } from 'vue'

interface Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  life: number
  maxLife: number
  color: THREE.Color
  size: number
  gravity: number // gravity multiplier (1 = normal fall, negative = rises like smoke)
  drag: number // per-frame velocity multiplier
  fadeIn: number // fraction of life spent fading in (0 = no fade-in)
}

// Expanding additive mesh effects (shockwave rings/spheres) are tracked separately
// from the point particles so they can grow and fade as solid geometry.
interface MeshEffect {
  mesh: THREE.Mesh
  material: THREE.MeshBasicMaterial
  life: number
  maxLife: number
  startScale: number
  endScale: number
  startOpacity: number
}

// Headroom raised from 500 so richer layered VFX (explosions, sparks, muzzle
// flashes, dash trails) don't starve each other.
const MAX_PARTICLES = 1500

// Cap on pooled shockwave meshes. Beyond this a multi-kill simply skips the
// extra rings (flash/fire particles still spawn) rather than allocating
// materials mid-combat.
const MAX_SHOCKWAVES = 8

export class ParticleSystem {
  private particles: Particle[] = []
  private geometry: THREE.BufferGeometry
  private material: THREE.PointsMaterial
  private points: THREE.Points
  private scene: THREE.Scene

  private meshEffects: MeshEffect[] = []
  // Pooled shared geometry for shockwave spheres (reused, never per-spawn).
  private shockwaveGeometry: THREE.SphereGeometry
  // Idle pooled shockwave mesh+material pairs (created lazily up to
  // MAX_SHOCKWAVES; hidden via visible=false, never allocated/disposed per
  // explosion).
  private freeShockwaves: Array<{ mesh: THREE.Mesh; material: THREE.MeshBasicMaterial }> = []
  private shockwavesCreated = 0

  private positionAttr: THREE.BufferAttribute
  private colorAttr: THREE.BufferAttribute
  private sizeAttr: THREE.BufferAttribute
  // Live-particle count written to the buffers last frame, so this frame only
  // needs to zero/upload the slots that changed.
  private lastLiveCount = 0

  constructor(scene: THREE.Scene) {
    this.scene = scene
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

    this.shockwaveGeometry = new THREE.SphereGeometry(1, 16, 12)
  }

  /** Internal helper: push a particle with sensible defaults. */
  private addParticle(opts: {
    position: THREE.Vector3
    velocity: THREE.Vector3
    life: number
    color: THREE.Color
    size: number
    gravity?: number
    drag?: number
    fadeIn?: number
  }): boolean {
    if (this.particles.length >= MAX_PARTICLES) return false
    this.particles.push({
      position: opts.position,
      velocity: opts.velocity,
      life: opts.life,
      maxLife: opts.life,
      color: opts.color,
      size: opts.size,
      gravity: opts.gravity ?? 1,
      drag: opts.drag ?? 0.95,
      fadeIn: opts.fadeIn ?? 0,
    })
    return true
  }

  /**
   * Internal helper: spawn an expanding additive shockwave sphere. Meshes and
   * materials come from a small pool (lazily grown to MAX_SHOCKWAVES) and are
   * reused via visible toggling instead of per-explosion new/dispose.
   */
  private addShockwave(opts: {
    position: THREE.Vector3
    color: THREE.Color
    life: number
    startScale: number
    endScale: number
    startOpacity: number
  }) {
    let entry = this.freeShockwaves.pop()
    if (!entry) {
      if (this.shockwavesCreated >= MAX_SHOCKWAVES) return // pool exhausted - skip the ring
      this.shockwavesCreated++
      const material = markRaw(new THREE.MeshBasicMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }))
      const mesh = markRaw(new THREE.Mesh(this.shockwaveGeometry, material))
      this.scene.add(mesh)
      entry = { mesh, material }
    }
    const { mesh, material } = entry
    // Reset pooled state (callers may vary the colour).
    material.color.copy(opts.color)
    material.opacity = opts.startOpacity
    mesh.position.copy(opts.position)
    mesh.scale.setScalar(opts.startScale)
    mesh.visible = true

    this.meshEffects.push({
      mesh,
      material,
      life: opts.life,
      maxLife: opts.life,
      startScale: opts.startScale,
      endScale: opts.endScale,
      startOpacity: opts.startOpacity,
    })
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

      this.addParticle({
        position: position.clone().add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
          )
        ),
        velocity,
        life: 0.4 + Math.random() * 0.3, // 0.4 - 0.7s (increased lifetime for visibility)
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

      this.addParticle({
        position: position.clone(),
        velocity,
        life: 0.15, // Short, bright flash
        color: flashColor,
        size: 0.6 + Math.random() * 0.4, // Large bright particles
      })
    }
  }

  /**
   * Short additive muzzle flash at the gun barrel on weapon fire.
   * Energy = cyan/magenta, ballistic = orange-white, missile = orange.
   */
  spawnMuzzleFlash(position: THREE.Vector3, weaponType: 'ballistic' | 'energy' | 'missile', direction?: THREE.Vector3) {
    let core: THREE.Color
    let spark: THREE.Color
    switch (weaponType) {
      case 'energy':
        core = new THREE.Color(0x66ffff)
        spark = new THREE.Color(0x00ffff)
        break
      case 'missile':
        core = new THREE.Color(0xffaa55)
        spark = new THREE.Color(0xff6600)
        break
      default: // ballistic
        core = new THREE.Color(0xfff0c0)
        spark = new THREE.Color(0xff8800)
        break
    }

    // Bright central flash particles (very short-lived).
    for (let i = 0; i < 3; i++) {
      this.addParticle({
        position: position.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 3,
        ),
        life: 0.06 + Math.random() * 0.04,
        color: core.clone(),
        size: 0.9 + Math.random() * 0.5,
        gravity: 0,
        drag: 0.8,
      })
    }

    // A few forward-spitting sparks along the firing direction.
    const dir = direction ? direction.clone().normalize() : null
    const sparkCount = 5 + Math.floor(Math.random() * 4)
    for (let i = 0; i < sparkCount; i++) {
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      ).normalize()
      if (dir) v.lerp(dir, 0.6).normalize()
      v.multiplyScalar(6 + Math.random() * 10)

      this.addParticle({
        position: position.clone(),
        velocity: v,
        life: 0.1 + Math.random() * 0.1,
        color: spark.clone(),
        size: 0.25 + Math.random() * 0.3,
        gravity: 0.2,
        drag: 0.85,
      })
    }
  }

  /**
   * Layered explosion for mech deaths / heavy impacts:
   *  - expanding additive shockwave sphere that grows + fades
   *  - bright central flash particles
   *  - large fire particles
   *  - a few dark, slow-rising smoke particles
   *  - optional tumbling debris sparks
   * @param scale overall size multiplier (default 1)
   */
  spawnExplosion(position: THREE.Vector3, scale: number = 1) {
    // 1) Shockwave ring/sphere
    this.addShockwave({
      position: position.clone(),
      color: new THREE.Color(0xffaa44),
      life: 0.45,
      startScale: 0.5 * scale,
      endScale: 7 * scale,
      startOpacity: 0.55,
    })

    // 2) Central bright flash
    for (let i = 0; i < 6; i++) {
      this.addParticle({
        position: position.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
        ).multiplyScalar(scale),
        life: 0.12 + Math.random() * 0.08,
        color: new THREE.Color(1, 1, 0.85),
        size: (1.0 + Math.random() * 0.8) * scale,
        gravity: 0,
        drag: 0.85,
      })
    }

    // 3) Fire particles
    const fireCount = 34
    for (let i = 0; i < fireCount; i++) {
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 1.2,
        (Math.random() - 0.5) * 2,
      ).normalize().multiplyScalar((4 + Math.random() * 10) * scale)

      const r = 0.85 + Math.random() * 0.15
      const g = 0.25 + Math.random() * 0.4
      const b = Math.random() * 0.1

      this.addParticle({
        position: position.clone(),
        velocity,
        life: 0.5 + Math.random() * 0.6,
        color: new THREE.Color(r, g, b),
        size: (0.4 + Math.random() * 0.7) * scale,
        gravity: 0.6,
        drag: 0.94,
      })
    }

    // 4) Dark rising smoke (negative gravity so it drifts up; additive blend
    //    keeps it dim/grey so it reads as smoke against the fire).
    const smokeCount = 8
    for (let i = 0; i < smokeCount; i++) {
      const shade = 0.1 + Math.random() * 0.12
      this.addParticle({
        position: position.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * 1.5 * scale,
          Math.random() * 1.0 * scale,
          (Math.random() - 0.5) * 1.5 * scale,
        )),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 1.5,
          1 + Math.random() * 1.5,
          (Math.random() - 0.5) * 1.5,
        ).multiplyScalar(scale),
        life: 0.9 + Math.random() * 0.7,
        color: new THREE.Color(shade, shade, shade),
        size: (1.2 + Math.random() * 1.2) * scale,
        gravity: -0.4,
        drag: 0.96,
        fadeIn: 0.25,
      })
    }

    // 5) Debris sparks (fast, fall under gravity)
    const debrisCount = 10
    for (let i = 0; i < debrisCount; i++) {
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        0.4 + Math.random() * 1.2,
        (Math.random() - 0.5) * 2,
      ).normalize().multiplyScalar((10 + Math.random() * 12) * scale)

      this.addParticle({
        position: position.clone(),
        velocity,
        life: 0.6 + Math.random() * 0.5,
        color: new THREE.Color(1, 0.7 + Math.random() * 0.2, 0.3),
        size: (0.2 + Math.random() * 0.25) * scale,
        gravity: 1.4,
        drag: 0.97,
      })
    }
  }

  /**
   * Directional dash thruster burst/trail. Spawns a streak of fading particles
   * trailing OPPOSITE the dash direction so a dash reads as movement, not a death.
   * @param direction the dash travel direction
   */
  /**
   * Deploy a smoke-screen cloud for the smoke rack ability (design §3.4). A
   * dense puff of slow, dark, upward-drifting particles that lingers as visual
   * cover — the diegetic counterpart to the EnemyAI accuracy debuff applied
   * while a target's smokeScreenTimer is active.
   */
  spawnSmokeScreen(position: THREE.Vector3) {
    const puffs = 26
    for (let i = 0; i < puffs; i++) {
      const shade = 0.14 + Math.random() * 0.14
      this.addParticle({
        position: position.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          Math.random() * 2.5,
          (Math.random() - 0.5) * 4,
        )),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 1.2,
          0.4 + Math.random() * 0.9,
          (Math.random() - 0.5) * 1.2,
        ),
        life: 2.5 + Math.random() * 2.0,
        color: new THREE.Color(shade, shade, shade),
        size: 2.4 + Math.random() * 1.8,
        gravity: -0.15,
        drag: 0.97,
        fadeIn: 0.4,
      })
    }
  }

  spawnDashBurst(position: THREE.Vector3, direction: THREE.Vector3) {
    const back = direction.clone().normalize().negate()
    const count = 18
    for (let i = 0; i < count; i++) {
      // Spread particles in a small cone behind the mech.
      const jitter = new THREE.Vector3(
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 1.2,
      )
      const v = back.clone().multiplyScalar(6 + Math.random() * 8).add(jitter)

      // Cool blue-white thruster colour.
      const t = Math.random()
      const color = new THREE.Color().setRGB(
        0.5 + t * 0.5,
        0.7 + t * 0.3,
        1.0,
      )

      this.addParticle({
        position: position.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.6,
        )),
        velocity: v,
        life: 0.2 + Math.random() * 0.25,
        color,
        size: 0.35 + Math.random() * 0.4,
        gravity: 0,
        drag: 0.9,
      })
    }
  }

  /**
   * Directional spark spray + tiny additive flash for projectile impacts.
   * Sparks shoot back along the surface (reflected off the incoming direction),
   * and the look differs between mech hits and building/floor hits.
   * @param dir normal of the surface, OR the incoming projectile direction
   * @param surfaceType 'mech' = hotter/whiter spray, 'building'/'floor' = orange debris + scorch flash
   */
  spawnImpactSparks(
    position: THREE.Vector3,
    dir: THREE.Vector3,
    surfaceType: 'mech' | 'building' | 'floor' = 'mech',
  ) {
    // Determine the spray axis. For a surface normal we spray outward along it;
    // for an incoming direction we reflect roughly back toward the shooter.
    const axis = dir.clone()
    if (axis.lengthSq() < 1e-6) axis.set(0, 1, 0)
    axis.normalize()

    const isMech = surfaceType === 'mech'
    const sparkColor = isMech
      ? new THREE.Color(0xffeeaa)
      : new THREE.Color(0xff9944)
    const flashColor = isMech
      ? new THREE.Color(1, 1, 1)
      : new THREE.Color(1, 0.6, 0.2)

    // Tiny central additive flash.
    for (let i = 0; i < 3; i++) {
      this.addParticle({
        position: position.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
        ),
        life: 0.08 + Math.random() * 0.05,
        color: flashColor.clone(),
        size: (isMech ? 0.7 : 0.6) + Math.random() * 0.4,
        gravity: 0,
        drag: 0.8,
      })
    }

    // Directional spark spray in a cone around the axis.
    const sparkCount = isMech ? 10 + Math.floor(Math.random() * 6) : 8 + Math.floor(Math.random() * 6)
    for (let i = 0; i < sparkCount; i++) {
      const cone = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      ).normalize()
      // Bias toward the spray axis (tighter cone for mech, wider for surfaces).
      const bias = isMech ? 0.55 : 0.4
      const v = cone.lerp(axis, bias).normalize()
      v.multiplyScalar((isMech ? 9 : 6) + Math.random() * (isMech ? 12 : 9))

      this.addParticle({
        position: position.clone(),
        velocity: v,
        life: (isMech ? 0.18 : 0.28) + Math.random() * 0.2,
        color: sparkColor.clone(),
        size: (isMech ? 0.22 : 0.3) + Math.random() * 0.25,
        gravity: isMech ? 0.6 : 1.2, // surface debris falls harder
        drag: 0.9,
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
    // Update particles. Dead ones are removed via swap-and-pop (order doesn't
    // matter for additive, depth-write-off points) instead of O(n) splice.
    // Iterating backward means the swapped-in tail element was already updated
    // this frame, so nothing is skipped or double-ticked.
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.life -= deltaTime
      if (p.life <= 0) {
        const last = this.particles.length - 1
        if (i !== last) this.particles[i] = this.particles[last]
        this.particles.pop()
        continue
      }

      // Apply gravity (per-particle multiplier; negative = rises)
      p.velocity.y -= 10 * p.gravity * deltaTime

      // Apply velocity (allocation-free integration)
      p.position.addScaledVector(p.velocity, deltaTime)

      // Drag
      p.velocity.multiplyScalar(p.drag)
    }

    // Update expanding mesh effects (shockwaves)
    for (let i = this.meshEffects.length - 1; i >= 0; i--) {
      const e = this.meshEffects[i]
      e.life -= deltaTime
      if (e.life <= 0) {
        // Return the mesh+material to the pool (hidden, never disposed here).
        e.mesh.visible = false
        this.freeShockwaves.push({ mesh: e.mesh, material: e.material })
        this.meshEffects.splice(i, 1)
        continue
      }
      const t = 1 - e.life / e.maxLife // 0 -> 1
      const eased = 1 - Math.pow(1 - t, 3) // ease-out
      const scale = e.startScale + (e.endScale - e.startScale) * eased
      e.mesh.scale.setScalar(scale)
      e.material.opacity = e.startOpacity * (1 - t)
    }

    // Write to buffer attributes — only the live prefix (drawRange hides the
    // rest), instead of touching all MAX_PARTICLES slots every frame.
    const positions = this.positionAttr.array as Float32Array
    const colors = this.colorAttr.array as Float32Array
    const sizes = this.sizeAttr.array as Float32Array
    const live = this.particles.length

    for (let i = 0; i < live; i++) {
      const p = this.particles[i]
      const lifeFrac = p.life / p.maxLife // 1 -> 0
      // Optional fade-in at the start of life (used for smoke).
      let t = lifeFrac
      if (p.fadeIn > 0) {
        const age = 1 - lifeFrac // 0 -> 1
        if (age < p.fadeIn) {
          t = (age / p.fadeIn) * lifeFrac
        }
      }

      positions[i * 3] = p.position.x
      positions[i * 3 + 1] = p.position.y
      positions[i * 3 + 2] = p.position.z

      colors[i * 3] = p.color.r * t
      colors[i * 3 + 1] = p.color.g * t
      colors[i * 3 + 2] = p.color.b * t

      sizes[i] = p.size * t
    }
    // Hide only the slots that were live last frame but died this frame (safety
    // net in case drawRange is ever widened; slots beyond lastLiveCount are
    // already zero).
    for (let i = live; i < this.lastLiveCount; i++) {
      sizes[i] = 0
    }

    // Upload only the touched prefix instead of all 1500 slots. Update ranges
    // accumulate across frames, so clear them before adding this frame's.
    const sizeSpan = Math.max(live, this.lastLiveCount)
    this.positionAttr.clearUpdateRanges()
    this.colorAttr.clearUpdateRanges()
    this.sizeAttr.clearUpdateRanges()
    if (live > 0) {
      this.positionAttr.addUpdateRange(0, live * 3)
      this.colorAttr.addUpdateRange(0, live * 3)
      this.positionAttr.needsUpdate = true
      this.colorAttr.needsUpdate = true
    }
    if (sizeSpan > 0) {
      this.sizeAttr.addUpdateRange(0, sizeSpan)
      this.sizeAttr.needsUpdate = true
    }
    this.lastLiveCount = live
    this.geometry.setDrawRange(0, live)
  }

  cleanup() {
    this.geometry.dispose()
    this.material.dispose()
    // Active effects and idle pooled shockwaves are disjoint; tear down both.
    for (const e of this.meshEffects) {
      this.scene.remove(e.mesh)
      e.material.dispose()
    }
    this.meshEffects = []
    for (const s of this.freeShockwaves) {
      this.scene.remove(s.mesh)
      s.material.dispose()
    }
    this.freeShockwaves = []
    this.shockwavesCreated = 0
    this.shockwaveGeometry.dispose()
  }
}
