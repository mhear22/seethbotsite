import * as THREE from 'three'
import type { MechEntity } from './MechEntity'
import { markRaw } from 'vue'

export interface Projectile {
  id: string
  type: 'ballistic' | 'energy' | 'missile'
  position: THREE.Vector3
  velocity: THREE.Vector3
  damage: number
  ownerId: string
  lifetime: number
  mesh: THREE.Mesh
  light?: THREE.PointLight
  glow?: THREE.Sprite
  // Homing missile fields
  targetId?: string
  homingDelay?: number // seconds before homing kicks in
  // Visual-only fields
  pooledGeometry?: boolean // geometry came from the shared pool; don't dispose per-shot
  pooledMaterial?: boolean // material came from the shared pool; don't dispose per-shot
  smokeTimer?: number // accumulator for missile smoke-trail emission
}

// Cap on simultaneously-pooled missile PointLights. Excess missiles render
// without a light (they still have a glow sprite) to avoid blowing past the
// renderer's light limit / GPU cost.
const MAX_MISSILE_LIGHTS = 6

export class ProjectileSystem {
  private projectiles: Projectile[] = []
  private scene: THREE.Scene
  private nextId: number = 0

  // ---- Pooled visuals (created once, reused across shots, disposed on cleanup) ----
  // One shared geometry per weapon type.
  private geometryPool: Map<string, THREE.BufferGeometry> = new Map()
  // One shared material per (weapon type + team). Key: `${type}:${isPlayer}`.
  private materialPool: Map<string, THREE.Material> = new Map()
  // Shared sprite texture + materials for trails.
  private trailTexture: THREE.Texture
  private trailMaterialPool: Map<string, THREE.SpriteMaterial> = new Map()
  // Pool of reusable missile PointLights.
  private missileLightPool: THREE.PointLight[] = []
  private activeMissileLights: number = 0

  // Optional callback so the integration layer can spawn smoke particles for
  // missile trails without ProjectileSystem depending on ParticleSystem.
  onMissileSmoke?: (position: THREE.Vector3) => void

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.trailTexture = this.createTrailTexture()
  }

  /** Soft radial-gradient texture used for additive trail/streak sprites. */
  private createTrailTexture(): THREE.Texture {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.4, 'rgba(255,255,255,0.5)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }

  fireWeapon(mech: MechEntity, targetDirection: THREE.Vector3, arm: 'left' | 'right' = 'left', target?: MechEntity): Projectile | null {
    // Get correct weapon
    const armPart = arm === 'left' ? mech.loadout.leftArm : mech.loadout.rightArm
    if (!armPart) return null

    const weaponType = armPart.weaponType || 'ballistic'

    // Check power consumption
    const powerCost = armPart.powerDraw
    if (mech.currentPower < powerCost) {
      // Not enough power - can't fire
      return null
    }

    // Consume power
    mech.currentPower -= powerCost

    // Calculate damage based on firepower stat
    let baseDamage = Math.max(5, mech.stats.firepower / 10)

    // Handle melee weapons specially
    if (weaponType === 'melee') {
      baseDamage *= 2.5 // Melee deals 2.5x damage

      // Very short range spawn position
      const spawnPosition = mech.getArmPosition(arm)

      // Create melee projectile (short-lived, slow)
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshStandardMaterial({
        color: mech.isPlayer ? 0xff6600 : 0xff0066
      })
      const mesh = markRaw(new THREE.Mesh(geometry, material))
      mesh.position.copy(spawnPosition)
      this.scene.add(mesh)

      // Lunge forward when attacking
      mech.velocity.add(mech.getForwardDirection().multiplyScalar(8))

      const projectile: Projectile = {
        id: `proj_${this.nextId++}`,
        type: 'ballistic',
        position: spawnPosition,
        velocity: targetDirection.clone().multiplyScalar(80), // Slow projectile
        damage: baseDamage,
        ownerId: mech.id,
        lifetime: 0.2, // Only 200ms to hit
        mesh,
        // Melee uses its own throwaway geom/material (not pooled).
        pooledGeometry: false,
        pooledMaterial: false,
      }

      this.projectiles.push(projectile)
      return projectile
    }

    // Calculate distance to target for targeting bonus (use 50 as default for AI)
    const targetDistance = 50
    const isMoving = mech.velocity.length() > 1.0
    const targetingBonus = mech.getTargetingBonus(targetDistance, isMoving)

    // Accuracy affects spread
    const accuracyFactor = Math.max(0.1, Math.min(1, (mech.stats.accuracy / 100) + targetingBonus))
    const baseSpread = (1 - accuracyFactor) * 0.15

    // Check for multi-projectile weapons
    const projectileCount = armPart.projectileCount ?? 1
    let firstProjectile: Projectile | null = null

    // Fire multiple projectiles if specified
    for (let i = 0; i < projectileCount; i++) {
      // Add spread for multiple projectiles to create a cone pattern
      const spreadAngle = projectileCount > 1 ? (i - (projectileCount - 1) / 2) * 0.15 : 0

      // Apply random accuracy spread
      const direction = targetDirection.clone().add(
        new THREE.Vector3(
          (Math.random() - 0.5) * baseSpread,
          (Math.random() - 0.5) * baseSpread,
          (Math.random() - 0.5) * baseSpread
        )
      ).normalize()

      // Apply cone spread for multi-projectile weapons
      if (spreadAngle !== 0) {
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), spreadAngle)
      }

      const spawnPosition = mech.getArmPosition(arm)

      // Create projectile mesh from pooled geometry/material (not disposed per shot).
      const geometry = this.getProjectileGeometry(weaponType)
      const material = this.getProjectileMaterial(weaponType, mech.isPlayer)
      const mesh = markRaw(new THREE.Mesh(geometry, material))
      mesh.position.copy(spawnPosition)
      this.scene.add(mesh)

      const velocity = direction.clone().multiplyScalar(this.getProjectileSpeed(weaponType))
      const { light: missileLight, glow: missileGlow } = this.createProjectileVisuals(
        weaponType,
        mech.isPlayer,
        spawnPosition,
        velocity,
        mesh,
      )

      const projectile: Projectile = {
        id: `proj_${this.nextId++}`,
        type: weaponType,
        position: spawnPosition,
        velocity,
        damage: baseDamage,
        ownerId: mech.id,
        lifetime: 3, // 3 seconds
        mesh,
        light: missileLight,
        glow: missileGlow,
        pooledGeometry: true,
        pooledMaterial: true,
        smokeTimer: 0,
        ...(weaponType === 'missile' && target ? {
          targetId: target.id,
          homingDelay: 0.4 // start homing after 0.4 seconds
        } : {})
      }

      this.projectiles.push(projectile)

      // Return the first projectile for compatibility
      if (i === 0) {
        firstProjectile = projectile
      }
    }

    return firstProjectile
  }

  /**
   * Returns a POOLED shared geometry per weapon type. Never dispose the result
   * per shot - it is reused across all projectiles of that type and disposed
   * only in cleanup(). Geometry is built so weapons read distinctly:
   *  - ballistic: small elongated tracer (stretched along travel axis)
   *  - energy:    glowing sphere
   *  - missile:   tapered cylinder body
   */
  private getProjectileGeometry(type: string): THREE.BufferGeometry {
    const cached = this.geometryPool.get(type)
    if (cached) return cached

    let geom: THREE.BufferGeometry
    switch (type) {
      case 'energy':
        geom = new THREE.SphereGeometry(0.3, 10, 10)
        break
      case 'missile':
        geom = new THREE.CylinderGeometry(0.3, 0.15, 1.2, 8)
        break
      default: { // ballistic - thin elongated tracer
        // Cylinder oriented along +Z so the mesh can be aimed down the velocity.
        geom = new THREE.CylinderGeometry(0.09, 0.09, 1.6, 6)
        geom.rotateX(Math.PI / 2) // align length with local +Z
        break
      }
    }
    this.geometryPool.set(type, geom)
    return geom
  }

  /**
   * Returns a POOLED shared material per (weapon type + team). Never dispose the
   * result per shot - reused across all matching projectiles, disposed only in
   * cleanup().
   */
  private getProjectileMaterial(type: string, isPlayer: boolean): THREE.Material {
    const key = `${type}:${isPlayer}`
    const cached = this.materialPool.get(key)
    if (cached) return cached

    let mat: THREE.Material
    switch (type) {
      case 'energy':
        mat = new THREE.MeshBasicMaterial({
          color: isPlayer ? 0x00ffff : 0xff00ff,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
        break
      case 'missile':
        mat = new THREE.MeshBasicMaterial({ color: 0xff6600 })
        break
      default: // ballistic - bright tracer
        mat = new THREE.MeshBasicMaterial({ color: isPlayer ? 0xbfdcff : 0xffd0d0 })
        break
    }
    this.materialPool.set(key, mat)
    return mat
  }

  /** Pooled additive trail/streak sprite material keyed by colour. */
  private getTrailMaterial(colorHex: number): THREE.SpriteMaterial {
    const key = String(colorHex)
    const cached = this.trailMaterialPool.get(key)
    if (cached) return cached
    const mat = markRaw(new THREE.SpriteMaterial({
      map: this.trailTexture,
      color: colorHex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }))
    this.trailMaterialPool.set(key, mat)
    return mat
  }

  /**
   * Attach weapon-distinct visuals (glow/streak trails, missile light+glow).
   * The streak sprite is parented to the mesh and stretched back along -Z so it
   * trails behind the bolt. Returns optional missile light/glow for the record.
   */
  private createProjectileVisuals(
    type: string,
    isPlayer: boolean,
    spawnPosition: THREE.Vector3,
    velocity: THREE.Vector3,
    mesh: THREE.Mesh,
  ): { light?: THREE.PointLight; glow?: THREE.Sprite } {
    if (type === 'missile') {
      // Aim the body down the velocity now so the spawn frame looks correct.
      mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        velocity.clone().normalize(),
      )

      let light: THREE.PointLight | undefined
      if (this.activeMissileLights < MAX_MISSILE_LIGHTS) {
        light = this.missileLightPool.pop()
        if (!light) {
          light = markRaw(new THREE.PointLight(0xff6600, 40, 60))
        }
        light.position.copy(spawnPosition)
        this.scene.add(light)
        this.activeMissileLights++
      }

      // Billboard glow sprite (pooled material).
      const glow = markRaw(new THREE.Sprite(this.getTrailMaterial(0xff8800)))
      glow.scale.set(6, 6, 1)
      glow.position.copy(spawnPosition)
      this.scene.add(glow)

      return { light, glow }
    }

    // Energy + ballistic: a billboarded additive glow that sits on the bolt for
    // a bright bloom. The directional "streak" comes from the elongated bolt
    // MESH itself (ballistic cylinder is stretched along its velocity; energy is
    // a glowing sphere), which reads correctly from any camera angle - unlike a
    // stretched sprite, which would stretch in screen space.
    const glowColor = type === 'energy'
      ? (isPlayer ? 0x66ffff : 0xff66ff)
      : (isPlayer ? 0x99ccff : 0xffb0b0)
    const glowSize = type === 'energy' ? 1.8 : 0.9

    const glow = markRaw(new THREE.Sprite(this.getTrailMaterial(glowColor)))
    glow.scale.set(glowSize, glowSize, 1)
    glow.position.copy(spawnPosition)
    this.scene.add(glow)

    // Orient the ballistic bolt mesh along its velocity for an elongated tracer.
    if (type === 'ballistic') {
      mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        velocity.clone().normalize(),
      )
    }

    return { glow }
  }

  private getProjectileSpeed(type: string): number {
    switch (type) {
      case 'energy':
        return 400 // Fast
      case 'missile':
        return 240 // Medium
      default: // ballistic
        return 300 // Fast
    }
  }

  update(deltaTime: number, mechs?: MechEntity[]): Projectile[] {
    const activeProjectiles: Projectile[] = []

    for (const proj of this.projectiles) {
      // Homing logic for missiles
      if (proj.type === 'missile' && proj.targetId && proj.homingDelay !== undefined) {
        proj.homingDelay -= deltaTime
        if (proj.homingDelay <= 0 && mechs) {
          const target = mechs.find(m => m.id === proj.targetId && !m.isDestroyed)
          if (target) {
            const targetPos = target.getCorePosition()
            const toTarget = targetPos.sub(proj.position).normalize()
            const speed = proj.velocity.length()
            // Smoothly steer toward target (turn rate: ~180 deg/s)
            const turnRate = Math.PI * deltaTime
            proj.velocity.normalize().lerp(toTarget, Math.min(1, turnRate)).normalize().multiplyScalar(speed)
          }
        }
      }

      // Update position
      proj.position.add(proj.velocity.clone().multiplyScalar(deltaTime))
      proj.mesh.position.copy(proj.position)

      // Glow trail follows every projectile that has one (energy/ballistic/missile).
      if (proj.glow) {
        proj.glow.position.copy(proj.position)
      }

      if (proj.type === 'missile') {
        // Rotate missile body to face direction of travel.
        proj.mesh.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          proj.velocity.clone().normalize()
        )
        if (proj.light) {
          proj.light.position.copy(proj.position)
        }
        // Emit a short fading smoke trail behind missiles via the optional hook.
        if (this.onMissileSmoke) {
          proj.smokeTimer = (proj.smokeTimer ?? 0) + deltaTime
          if (proj.smokeTimer >= 0.03) {
            proj.smokeTimer = 0
            this.onMissileSmoke(proj.position.clone())
          }
        }
      } else if (proj.type === 'ballistic') {
        // Keep the elongated tracer aligned with its travel direction.
        proj.mesh.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          proj.velocity.clone().normalize()
        )
      }

      // Update lifetime
      proj.lifetime -= deltaTime

      // Keep if still alive
      if (proj.lifetime > 0) {
        activeProjectiles.push(proj)
      } else {
        // Cleanup expired projectile (respects the geometry/material pool).
        this.disposeProjectileVisuals(proj)
      }
    }

    this.projectiles = activeProjectiles
    return this.projectiles
  }

  checkCollisions(mechs: MechEntity[]): Array<{projectile: Projectile, target: MechEntity}> {
    const hits: Array<{projectile: Projectile, target: MechEntity}> = []

    for (const proj of this.projectiles) {
      for (const mech of mechs) {
        // Skip if projectile owner is the target
        if (proj.ownerId === mech.id) continue

        // Skip if mech is already destroyed
        if (mech.isDestroyed) continue

        // Cylinder collision detection - matches mech shape better
        // Mech dimensions based on procedural models:
        // - Width/Depth: ~2.5 units (body + arm reach)
        // - Height: ~5 units (legs + torso + head)
        const mechCenter = mech.position.clone()
        mechCenter.y += 2.5 // Center of mech vertically

        const dx = proj.position.x - mechCenter.x
        const dy = proj.position.y - mechCenter.y
        const dz = proj.position.z - mechCenter.z

        // Horizontal distance (XZ plane) - cylinder radius
        const horizontalDist = Math.sqrt(dx * dx + dz * dz)

        // Hit box dimensions match procedural model bounds
        const hitRadiusXZ = 1.25 // Cylinder radius (generous for arm reach)
        const hitRadiusY = 2.5    // Half-height (total height ~5 units)

        if (horizontalDist < hitRadiusXZ && Math.abs(dy) < hitRadiusY) {
          hits.push({ projectile: proj, target: mech })
        }
      }
    }

    return hits
  }

  /**
   * Tear down a projectile's scene objects. Pooled geometry/materials are NOT
   * disposed (they are shared and reused); only per-projectile-owned resources
   * (melee throwaway geom/material, missile glow sprite) are disposed. Missile
   * PointLights are returned to the pool for reuse.
   */
  private disposeProjectileVisuals(proj: Projectile) {
    this.scene.remove(proj.mesh)
    if (proj.pooledGeometry !== true) {
      proj.mesh.geometry.dispose()
    }
    if (proj.pooledMaterial !== true && proj.mesh.material instanceof THREE.Material) {
      proj.mesh.material.dispose()
    }
    if (proj.light) {
      this.scene.remove(proj.light)
      // Return to pool (material is the shared light, safe to reuse).
      if (this.missileLightPool.length < MAX_MISSILE_LIGHTS) {
        this.missileLightPool.push(proj.light)
      }
      this.activeMissileLights = Math.max(0, this.activeMissileLights - 1)
    }
    if (proj.glow) {
      this.scene.remove(proj.glow)
      // Glow uses a POOLED sprite material - do not dispose it here.
    }
  }

  removeProjectile(projectile: Projectile) {
    const index = this.projectiles.indexOf(projectile)
    if (index !== -1) {
      this.projectiles.splice(index, 1)
      this.disposeProjectileVisuals(projectile)
    }
  }

  cleanup() {
    for (const proj of this.projectiles) {
      this.disposeProjectileVisuals(proj)
    }
    this.projectiles = []

    // Dispose pooled resources now that no projectiles reference them.
    for (const geom of this.geometryPool.values()) geom.dispose()
    this.geometryPool.clear()
    for (const mat of this.materialPool.values()) mat.dispose()
    this.materialPool.clear()
    for (const mat of this.trailMaterialPool.values()) mat.dispose()
    this.trailMaterialPool.clear()
    this.trailTexture.dispose()
    this.missileLightPool = []
    this.activeMissileLights = 0
  }

  getProjectiles(): Projectile[] {
    return this.projectiles
  }

  /**
   * Spawn a projectile from network data (multiplayer)
   */
  spawnFromNetwork(
    id: string,
    position: [number, number, number],
    velocity: [number, number, number],
    type: 'ballistic' | 'energy' | 'missile',
    ownerId: string,
    damage: number,
    isLocalPlayer: boolean
  ): Projectile {
    const geometry = this.getProjectileGeometry(type)
    const material = this.getProjectileMaterial(type, isLocalPlayer)
    const mesh = markRaw(new THREE.Mesh(geometry, material))
    const pos = new THREE.Vector3(position[0], position[1], position[2])
    const vel = new THREE.Vector3(velocity[0], velocity[1], velocity[2])
    mesh.position.copy(pos)
    this.scene.add(mesh)

    // Same weapon-distinct visuals (glow/streak, missile light+glow) as the
    // single-player fire path. Purely cosmetic; does not touch network data.
    const { light, glow } = this.createProjectileVisuals(type, isLocalPlayer, pos, vel, mesh)

    const projectile: Projectile = {
      id,
      type,
      position: pos,
      velocity: vel,
      damage,
      ownerId,
      lifetime: 5,
      mesh,
      light,
      glow,
      pooledGeometry: true,
      pooledMaterial: true,
      smokeTimer: 0,
    }

    this.projectiles.push(projectile)
    return projectile
  }

  /**
   * Sync projectiles from server state snapshot (multiplayer)
   * Creates new projectiles, updates existing ones, removes stale ones.
   */
  syncFromSnapshot(
    serverProjectiles: Array<{
      id: string
      position: [number, number, number]
      velocity: [number, number, number]
      ownerId: string
      type: 'ballistic' | 'energy' | 'missile'
      damage: number
    }>,
    localPlayerId: string
  ): void {
    const serverIds = new Set(serverProjectiles.map(p => p.id))

    // Remove projectiles no longer on server
    const toRemove = this.projectiles.filter(p => !serverIds.has(p.id))
    for (const proj of toRemove) {
      this.removeProjectile(proj)
    }

    // Create or update projectiles from server
    for (const sp of serverProjectiles) {
      const existing = this.projectiles.find(p => p.id === sp.id)
      if (existing) {
        // Update position and velocity from server
        existing.position.set(sp.position[0], sp.position[1], sp.position[2])
        existing.velocity.set(sp.velocity[0], sp.velocity[1], sp.velocity[2])
        existing.mesh.position.copy(existing.position)
      } else {
        // Spawn new projectile
        this.spawnFromNetwork(
          sp.id,
          sp.position,
          sp.velocity,
          sp.type,
          sp.ownerId,
          sp.damage,
          sp.ownerId === localPlayerId
        )
      }
    }
  }

  /**
   * Remove a projectile by its ID string
   */
  removeById(id: string): void {
    const proj = this.projectiles.find(p => p.id === id)
    if (proj) {
      this.removeProjectile(proj)
    }
  }
}
