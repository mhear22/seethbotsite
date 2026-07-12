import * as THREE from 'three'
import { markRaw } from 'vue'
import { MechEntity } from '../battle/MechEntity'
import { ProjectileSystem, type Projectile } from '../battle/ProjectileSystem'
import { ParticleSystem } from '../battle/ParticleSystem'
import { Terrain } from './Terrain'
import type { PilotMode } from '../../composables/useStoryMode'
import type { PedestrianCollider } from './Town'

/**
 * Free-roam weapons fire for the story overworld (outside active encounters).
 *
 * Mirrors StoryCombat.updateCombat's per-arm fire cadence (fireRate / isBoosting
 * gate / ammo-feed rack halving) but with NO auto-aim — free aim only, straight
 * from the camera's aim direction — since there are no hostiles to lock onto in
 * free roam. Also ticks the projectile system while no encounter is running
 * (StoryCombat only does that while `combat.active`), scars the terrain where
 * shots hit the ground (regardless of combat state, so stray encounter fire
 * scars too), taxes the nearest town's standing when the player fires near it
 * with no encounter running (there being no hostiles to blame it on), taxes a
 * nearby town's physical CONDITION when a free-roam shot lands near it (stray
 * ordnance — separate from the standing tax above), and lets projectiles strike
 * town BUILDINGS directly (much harsher condition tax, no ground scar).
 */

/** XZ radius within which a free-roam shot taxes the nearest town's standing,
 *  and also the radius a landed shot's stray-impact condition tax tapers across. */
export const RECKLESS_FIRE_RADIUS = 70
/** Per-town cooldown between reckless-fire standing hits (seconds) — stops one
 *  volley from stacking into a dozen penalties. */
export const RECKLESS_FIRE_COOLDOWN = 4
/**
 * Stray-impact collateral severity at a town's centre, tapering linearly to 0
 * at RECKLESS_FIRE_RADIUS (`1 - dist/RADIUS`, same taper shape as reckless-fire
 * standing). Roughly 2-4s of StoryCombat's COLLATERAL_SEVERITY_PER_COMBAT_SECOND
 * combat tax — meaningfully faster than lingering nearby in a fight, but nowhere
 * near ruinous on its own. Unlike reckless-fire standing, this has NO per-town
 * cooldown: every landed shell counts.
 */
export const IMPACT_SEVERITY = 0.35
/** A projectile that strikes a building directly taxes condition this many
 *  times harder than one that merely lands nearby. */
export const BUILDING_HIT_SEVERITY_MULTIPLIER = 3
/** XZ broad-phase radius (from town centre) within which projectile positions
 *  are tested against that town's building colliders. Comfortably covers every
 *  town's footprint (farthest structure ~22u out at the gate) with margin. */
const BUILDING_CHECK_RADIUS = 45
const BUILDING_CHECK_RADIUS_SQ = BUILDING_CHECK_RADIUS * BUILDING_CHECK_RADIUS
/** Max pooled ground-scar instances; a ring buffer overwrites the oldest. */
const MAX_SCARS = 96
/** Water surface height (mirrors StoryWorld's terrain/water setup). Terrain
 *  heights below this are underwater — sparks still fly, but no scar decal. */
const WATER_LEVEL = -8
/** Vertical tolerance for "a projectile has reached the ground" this frame. */
const GROUND_IMPACT_EPS = 0.15
/** Height a scar decal sits above the terrain surface (avoids z-fighting). */
const SCAR_LIFT = 0.04
/** Half-step used to sample the terrain heightfield for a normal via central
 *  differences (groundNormalAt). */
const NORMAL_SAMPLE_EPS = 0.5
/** Base scar radius (world units) per weapon type, before jitter. */
const SCAR_BASE_SIZE: Record<Projectile['type'], number> = {
  missile: 3.2,
  ballistic: 1.6,
  energy: 1.9,
}

// ---- Module-level scratch objects (perf): reused across calls, never retained
// past the expression they appear in (mirrors ProjectileSystem's _Y_AXIS etc.). ----
const _UP = new THREE.Vector3(0, 1, 0)

interface TownTarget {
  id: string
  position: THREE.Vector3
  /** Building/anchor-structure collision volumes, WORLD-space (same set the
   *  on-foot walker collides against — reused, not duplicated). */
  getPedestrianColliders(): PedestrianCollider[]
}

export interface OverworldGunplayConfig {
  projectileSystem: ProjectileSystem
  particleSystem: ParticleSystem
  terrain: Terrain
  scene: THREE.Scene
  /** Towns to check free-roam shots against (id + world position + colliders). */
  towns: TownTarget[]
}

export class OverworldGunplay {
  private readonly projectileSystem: ProjectileSystem
  private readonly particleSystem: ParticleSystem
  private readonly terrain: Terrain
  private readonly scene: THREE.Scene
  private readonly towns: TownTarget[]

  /**
   * Fired when a free-roam shot lands near a town with no encounter active
   * (design: reckless-fire standing penalty). `severity` is `1 - dist/RADIUS`.
   * Set by the host (StoryWorld) after construction.
   */
  onRecklessFire?: (townId: string, severity: number) => void

  /**
   * Fired when a free-roam shot taxes a town's physical CONDITION: either it
   * landed within RECKLESS_FIRE_RADIUS of the town (severity tapers with
   * proximity, no cooldown — every landed shell counts) or it struck one of
   * the town's buildings directly (severity × BUILDING_HIT_SEVERITY_MULTIPLIER).
   * Set by the host (StoryWorld) after construction.
   */
  onStrayImpact?: (townId: string, severity: number) => void

  /**
   * Optional hostile-presence check (design: roaming bandits, see Bandits.ts).
   * When set and it returns true for the player's current position, a trigger
   * pull suppresses ONLY the reckless-fire standing protest below (registerShot)
   * — there's an actual hostile nearby to blame the shots on. The stray-impact/
   * building CONDITION tax (registerStrayImpact / updateBuildingHits) stays
   * unconditional, mirroring how combat collateral still taxes the town during a
   * sanctioned fight. Set by the host (StoryWorld) after construction.
   */
  hostilesNear?: (pos: THREE.Vector3) => boolean

  // --- Fire cadence clocks (mirrors StoryCombat.updateCombat's lastLeftShot/
  // lastRightShot, but ticked off an internally-accumulated clock since free
  // roam has no shared battleTime to key off). ---
  private elapsed = 0
  private lastLeftShot = -Infinity
  private lastRightShot = -Infinity

  /** Per-town cooldown timestamps (in `elapsed` seconds) for reckless-fire. */
  private readonly townCooldowns = new Map<string, number>()

  // --- Ground scar pool: one InstancedMesh, ring-buffer overwrite. ---
  private readonly scarGeometry: THREE.PlaneGeometry
  private readonly scarMaterial: THREE.MeshBasicMaterial
  private readonly scarMesh: THREE.InstancedMesh
  private readonly scarTexture: THREE.Texture | null
  private scarCount = 0
  private scarNextIndex = 0

  /** Deterministic seeded PRNG state (mulberry32) for scar size/rotation
   *  variety — never Math.random(), so a session's scar layout is reproducible
   *  given the same shot sequence. */
  private rngState = 0x9e3779b9 >>> 0

  // --- Reusable scratch objects (perf: zero per-frame allocation) ---
  private readonly _scratchNormal = new THREE.Vector3()
  /** Outward-normal-ish direction (impact point minus collider centre) reused
   *  by building-hit spark FX — see updateBuildingHits. */
  private readonly _buildingNormal = new THREE.Vector3()
  private readonly _scarQuat = new THREE.Quaternion()
  private readonly _scarSpin = new THREE.Quaternion()
  private readonly _scarPos = new THREE.Vector3()
  private readonly _scarScale = new THREE.Vector3()
  private readonly _scarMatrix = new THREE.Matrix4()

  constructor(config: OverworldGunplayConfig) {
    this.projectileSystem = config.projectileSystem
    this.particleSystem = config.particleSystem
    this.terrain = config.terrain
    this.scene = config.scene
    this.towns = config.towns

    this.scarGeometry = markRaw(new THREE.PlaneGeometry(1, 1))
    // Lie flat: PlaneGeometry defaults to facing +Z, so a -90° X rotation makes
    // its local face normal +Y — the axis spawnScar aligns to the terrain normal.
    this.scarGeometry.rotateX(-Math.PI / 2)

    // Scorch texture: dark radial gradient fading to transparent. Wrapped in
    // try/catch with a plain-color fallback — the constructor must never throw,
    // even against a minimal canvas stub that only supports fillStyle/fillRect/
    // createRadialGradient/addColorStop (see StoryWorld.dismount.test.ts).
    this.scarTexture = this.createScorchTexture()
    this.scarMaterial = markRaw(new THREE.MeshBasicMaterial({
      map: this.scarTexture ?? undefined,
      color: this.scarTexture ? 0xffffff : 0x140c0a,
      transparent: true,
      depthWrite: false,
      // Avoids z-fighting against the terrain the decal sits just above.
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    }))

    this.scarMesh = markRaw(new THREE.InstancedMesh(this.scarGeometry, this.scarMaterial, MAX_SCARS))
    this.scarMesh.count = 0 // grows as scars spawn, caps at MAX_SCARS (ring buffer)
    this.scarMesh.frustumCulled = false
    this.scene.add(this.scarMesh)
  }

  /** Soft dark radial-gradient scorch decal texture. Session-only (never saved).
   *  Returns null (plain-color fallback) if canvas 2D is unavailable/throws. */
  private createScorchTexture(): THREE.Texture | null {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 64
      canvas.height = 64
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null
      if (!ctx) return null
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
      grad.addColorStop(0, 'rgba(12,9,8,0.95)')
      grad.addColorStop(0.45, 'rgba(24,17,13,0.55)')
      grad.addColorStop(1, 'rgba(24,17,13,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 64, 64)
      const texture = markRaw(new THREE.CanvasTexture(canvas))
      texture.needsUpdate = true
      return texture
    } catch {
      return null
    }
  }

  /**
   * Advance free-roam gunplay one frame. Firing (with cadence + free aim, no
   * auto-aim) only runs while `mode === 'mech' && !combatActive`; projectile
   * flight is ticked here only while `!combatActive` (StoryCombat owns it while
   * an encounter is running); building-hit detection and ground-impact scarring
   * both run every frame regardless of combat state, so stray encounter fire
   * hits buildings / scars the terrain too. Building hits are checked before
   * ground impacts so a projectile that embeds in a building the same frame it
   * would've touched down is resolved as a building hit only (no ground scar).
   */
  update(
    dt: number,
    player: MechEntity,
    input: { shootLeft: boolean; shootRight: boolean },
    aimDir: THREE.Vector3,
    combatActive: boolean,
    mode: PilotMode,
  ): void {
    this.elapsed += dt

    if (mode === 'mech' && !combatActive) {
      this.updateFiring(player, input, aimDir)
    }

    if (!combatActive) {
      this.projectileSystem.update(dt)
    }

    this.updateBuildingHits()
    this.updateGroundImpacts(combatActive)
  }

  /** Per-arm cadence-gated firing, mirrors StoryCombat.updateCombat minus the
   *  auto-aim assist (armAim) — free roam has no hostiles to lock onto. */
  private updateFiring(
    player: MechEntity,
    input: { shootLeft: boolean; shootRight: boolean },
    aimDir: THREE.Vector3,
  ): void {
    // Cannot fire while boosting (design §3.1), mirrors StoryCombat's canFire gate.
    if (player.isBoosting) return
    const ammoFeed = player.rackAbilityActive && player.loadout.rack?.id === 'rack-ammo-feed'

    if (input.shootLeft && player.loadout.leftArm) {
      let rate = player.loadout.leftArm.fireRate ?? (player.loadout.leftArm.weaponType === 'melee' ? 1.5 : 0.25)
      if (ammoFeed) rate *= 0.5
      if (this.elapsed - this.lastLeftShot > rate) {
        const fired = this.projectileSystem.fireWeapon(player, aimDir, 'left')
        if (fired) {
          this.lastLeftShot = this.elapsed
          this.spawnMuzzle(player, 'left', aimDir)
          this.registerShot(player.position)
        }
      }
    }
    if (input.shootRight && player.loadout.rightArm) {
      let rate = player.loadout.rightArm.fireRate ?? (player.loadout.rightArm.weaponType === 'melee' ? 1.5 : 0.25)
      if (ammoFeed) rate *= 0.5
      if (this.elapsed - this.lastRightShot > rate) {
        const fired = this.projectileSystem.fireWeapon(player, aimDir, 'right')
        if (fired) {
          this.lastRightShot = this.elapsed
          this.spawnMuzzle(player, 'right', aimDir)
          this.registerShot(player.position)
        }
      }
    }
  }

  /** Muzzle flash matching the fired arm's weapon type (mirrors StoryCombat.spawnMuzzle). */
  private spawnMuzzle(player: MechEntity, arm: 'left' | 'right', aim: THREE.Vector3): void {
    const part = arm === 'left' ? player.loadout.leftArm : player.loadout.rightArm
    const rawType = part?.weaponType ?? 'ballistic'
    const fxType: 'ballistic' | 'energy' | 'missile' =
      rawType === 'energy' ? 'energy' : rawType === 'missile' ? 'missile' : 'ballistic'
    this.particleSystem.spawnMuzzleFlash(player.getArmPosition(arm), fxType, aim)
  }

  /**
   * On a successful trigger pull, tax the nearest town within RECKLESS_FIRE_RADIUS
   * if its cooldown has expired. `position` is the player's current world position
   * (distanceTo — no allocation). No-op if no host callback or no towns.
   */
  private registerShot(position: THREE.Vector3): void {
    if (this.towns.length === 0 || !this.onRecklessFire) return
    // A live hostile nearby vouches for the shots — no protest to file.
    if (this.hostilesNear?.(position)) return
    let nearest: TownTarget | null = null
    let nearestDist = Infinity
    for (const town of this.towns) {
      const d = town.position.distanceTo(position)
      if (d < nearestDist) {
        nearestDist = d
        nearest = town
      }
    }
    if (!nearest || nearestDist > RECKLESS_FIRE_RADIUS) return
    const lastFire = this.townCooldowns.get(nearest.id) ?? -Infinity
    if (this.elapsed - lastFire < RECKLESS_FIRE_COOLDOWN) return
    this.townCooldowns.set(nearest.id, this.elapsed)
    this.onRecklessFire(nearest.id, 1 - nearestDist / RECKLESS_FIRE_RADIUS)
  }

  /** Proximity-tapered stray-impact severity at `dist` from a town centre:
   *  IMPACT_SEVERITY at the centre, linearly down to 0 at RECKLESS_FIRE_RADIUS. */
  private static impactSeverityAt(dist: number): number {
    if (dist >= RECKLESS_FIRE_RADIUS) return 0
    return IMPACT_SEVERITY * (1 - dist / RECKLESS_FIRE_RADIUS)
  }

  /**
   * A free-roam shot landed on the ground with no encounter running: tax the
   * nearest town's CONDITION (distinct from the standing tax in registerShot),
   * tapered by XZ proximity to the town centre (matches Town.distanceSqTo's own
   * XZ-only convention — a shot landing on a rise/hollow near a town shouldn't
   * be exempted just because its Y differs from the town's). Unlike
   * reckless-fire standing, there is NO per-town cooldown — every landed shell
   * counts. No-op if no host callback, no towns, or the nearest town is beyond
   * RECKLESS_FIRE_RADIUS.
   */
  private registerStrayImpact(position: THREE.Vector3): void {
    if (this.towns.length === 0 || !this.onStrayImpact) return
    let nearest: TownTarget | null = null
    let nearestDistSq = Infinity
    for (const town of this.towns) {
      const dx = position.x - town.position.x
      const dz = position.z - town.position.z
      const dSq = dx * dx + dz * dz
      if (dSq < nearestDistSq) {
        nearestDistSq = dSq
        nearest = town
      }
    }
    if (!nearest) return
    const severity = OverworldGunplay.impactSeverityAt(Math.sqrt(nearestDistSq))
    if (severity > 0) this.onStrayImpact(nearest.id, severity)
  }

  /** True if world point (x, y, z) lies inside collider `c`. */
  private static colliderContains(c: PedestrianCollider, x: number, y: number, z: number): boolean {
    if (c.kind === 'box') {
      return (
        Math.abs(x - c.center.x) <= c.halfExtents.x &&
        Math.abs(y - c.center.y) <= c.halfExtents.y &&
        Math.abs(z - c.center.z) <= c.halfExtents.z
      )
    }
    const dx = x - c.center.x
    const dz = z - c.center.z
    return Math.abs(y - c.center.y) <= c.height / 2 && dx * dx + dz * dz <= c.radius * c.radius
  }

  /**
   * Projectiles that fly straight into a town building instead of arcing over
   * it: broad-phase by XZ distance to each town centre (cheap; skipped entirely
   * when there are no live projectiles — the common case), then narrow-phase
   * against that town's actual building/anchor colliders (the same set the
   * on-foot walker resolves against — reused, not duplicated). On a hit: impact
   * sparks (no ground scar), remove the projectile, and tax the town's condition
   * BUILDING_HIT_SEVERITY_MULTIPLIER times harder than a stray ground impact.
   * Runs every frame regardless of combat state (stray encounter rounds hit
   * buildings too — mirrors ground-impact scarring). Iterates backwards over the
   * LIVE array so mid-loop removal (which splices) never skips an element.
   */
  private updateBuildingHits(): void {
    const projectiles = this.projectileSystem.getProjectiles()
    if (projectiles.length === 0 || this.towns.length === 0) return

    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i]
      for (const town of this.towns) {
        const dx = p.position.x - town.position.x
        const dz = p.position.z - town.position.z
        if (dx * dx + dz * dz > BUILDING_CHECK_RADIUS_SQ) continue

        const colliders = town.getPedestrianColliders()
        let hit: PedestrianCollider | null = null
        for (const c of colliders) {
          if (OverworldGunplay.colliderContains(c, p.position.x, p.position.y, p.position.z)) {
            hit = c
            break
          }
        }
        if (!hit) continue

        this._buildingNormal.subVectors(p.position, hit.center)
        if (this._buildingNormal.lengthSq() < 1e-6) this._buildingNormal.copy(_UP)
        else this._buildingNormal.normalize()
        this.particleSystem.spawnImpactSparks(p.position, this._buildingNormal, 'building')
        this.projectileSystem.removeProjectile(p)

        if (this.onStrayImpact) {
          const dist = Math.sqrt(dx * dx + dz * dz)
          const severity = OverworldGunplay.impactSeverityAt(dist) * BUILDING_HIT_SEVERITY_MULTIPLIER
          if (severity > 0) this.onStrayImpact(town.id, severity)
        }
        break // this projectile is gone; stop checking other towns for it
      }
    }
  }

  /**
   * Reap projectiles that have reached the ground: spawn impact sparks, add a
   * ground scar (skipped underwater — sparks only), tax a nearby town's
   * condition while no encounter is running (registerStrayImpact), and remove
   * the projectile. Sparks/scar run every frame regardless of combat state
   * (stray encounter fire scars the terrain too); the condition tax only runs
   * while `!combatActive` (mirrors registerShot's reckless-fire standing tax —
   * stray rounds during an active encounter are StoryCombat's own collateral
   * contract, not this one). Iterates backwards over the LIVE array so mid-loop
   * removal (which splices) never skips an element.
   */
  private updateGroundImpacts(combatActive: boolean): void {
    const projectiles = this.projectileSystem.getProjectiles()
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i]
      const rawHeight = this.terrain.heightAt(p.position.x, p.position.z)
      const groundY = Math.max(rawHeight, WATER_LEVEL)
      if (p.position.y > groundY + GROUND_IMPACT_EPS) continue

      const normal = this.groundNormalAt(p.position.x, p.position.z)
      this.particleSystem.spawnImpactSparks(p.position, normal, 'floor')
      if (rawHeight >= WATER_LEVEL) {
        this.spawnScar(p.position.x, groundY, p.position.z, normal, p.type)
      }
      if (!combatActive) this.registerStrayImpact(p.position)
      this.projectileSystem.removeProjectile(p)
    }
  }

  /** Terrain surface normal at (x, z) via central differences of heightAt.
   *  Returns the reused scratch vector — valid until the next call. */
  private groundNormalAt(x: number, z: number): THREE.Vector3 {
    const eps = NORMAL_SAMPLE_EPS
    const hL = this.terrain.heightAt(x - eps, z)
    const hR = this.terrain.heightAt(x + eps, z)
    const hD = this.terrain.heightAt(x, z - eps)
    const hU = this.terrain.heightAt(x, z + eps)
    return this._scratchNormal.set((hL - hR) / (2 * eps), 1, (hD - hU) / (2 * eps)).normalize()
  }

  /** Add a scorch decal to the pooled InstancedMesh ring buffer. */
  private spawnScar(x: number, y: number, z: number, normal: THREE.Vector3, weaponType: Projectile['type']): void {
    const jitter = 0.85 + this.nextRandom() * 0.3 // ±15%, deterministic
    const size = SCAR_BASE_SIZE[weaponType] * jitter
    const spinAngle = this.nextRandom() * Math.PI * 2

    this._scarQuat.setFromUnitVectors(_UP, normal)
    this._scarSpin.setFromAxisAngle(normal, spinAngle)
    this._scarQuat.premultiply(this._scarSpin)

    this._scarPos.set(x, y, z).addScaledVector(normal, SCAR_LIFT)
    this._scarScale.set(size, 1, size)
    this._scarMatrix.compose(this._scarPos, this._scarQuat, this._scarScale)

    this.scarMesh.setMatrixAt(this.scarNextIndex, this._scarMatrix)
    this.scarMesh.instanceMatrix.needsUpdate = true
    this.scarNextIndex = (this.scarNextIndex + 1) % MAX_SCARS
    if (this.scarCount < MAX_SCARS) {
      this.scarCount++
      this.scarMesh.count = this.scarCount
    }
  }

  /** Deterministic seeded PRNG (mulberry32) — see the `rngState` field doc. */
  private nextRandom(): number {
    this.rngState = (this.rngState + 0x6d2b79f5) >>> 0
    let t = this.rngState
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  dispose(): void {
    this.scene.remove(this.scarMesh)
    this.scarGeometry.dispose()
    this.scarMaterial.dispose()
    this.scarTexture?.dispose()
  }
}
