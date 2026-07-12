import * as THREE from 'three'
import { MechEntity } from '../battle/MechEntity'
import { EnemyAI, type EnemyArchetype } from '../battle/EnemyAI'
import { archetypeStats, archetypeLoadout, weaponProjectileSpeed } from '../battle/enemyGeneration'
import { ProjectileSystem, type Projectile } from '../battle/ProjectileSystem'
import { ParticleSystem } from '../battle/ParticleSystem'
import { Terrain } from './Terrain'
import type { MechSlot } from '../../shared/types/MechTypes'
import type { EnemyKill } from './StoryCombat'
import type { PilotMode } from '../../composables/useStoryMode'
import { WORLD_HALF_EXTENT, type TownState } from '../../composables/useStoryMode'

/**
 * Roaming hostile mechs that prowl the overworld near living towns (design:
 * bandits give the player something to fight — and justify their weapons fire
 * near towns — outside quest encounters).
 *
 * Mirrors StoryCombat's spawn/AI/hit-application patterns (spawnArchetypeEnemy,
 * the updateCombat hit loop) but drives its OWN population of mechs, independent
 * of any active quest encounter — bandits freeze while `combatActive` (StoryCombat
 * owns the projectile system's collision pass during an encounter) and resume the
 * moment it ends.
 */

// --- Tuning (kept named, never inline — mirrors OverworldGunplay's style) ---
/** Hard cap on bandits alive at once (MechEntity meshes are expensive). */
export const MAX_BANDITS = 3
/** How often (seconds) a spawn attempt is considered while under the cap. */
export const SPAWN_CHECK_INTERVAL = 25
/** A town below this condition is abandoned — bandits don't bother prowling it. */
export const SPAWN_TOWN_MIN_CONDITION = 25
/** A spawn anchor town must be within this range of the player (bandits prowl
 *  where the action is, not the empty far side of the map). */
export const SPAWN_TOWN_PLAYER_RANGE = 250
/** Spawn ring radius band around the chosen town's centre. */
export const SPAWN_RING_MIN = 90
export const SPAWN_RING_MAX = 150
/** A spawn point must land at least this far from the player. */
export const SPAWN_MIN_PLAYER_DIST = 50
/** Bandits farther than this from the player are despawned (disposed). */
export const DESPAWN_DIST = 350
/** Aggro range: inside this the bandit engages (combat or on-foot loiter). */
export const AGGRO_RADIUS = 65
/** On-foot standoff distance a loitering bandit tries to hold. */
export const ON_FOOT_STANDOFF = 30
/** Bandits farther than this from the player update at half rate (perf). */
export const THROTTLE_DIST = 200
/** Wander waypoint ring radius around a bandit's home town. */
const WANDER_RADIUS = 60
const WANDER_INTERVAL_MIN = 8
const WANDER_INTERVAL_MAX = 15
/** Leisurely wander/loiter horizontal speed (units/s) — well under combat speed. */
const WANDER_SPEED = 4.5
/** Archetype stat/loadout scale (design: "~0.75" — lighter than a full encounter enemy). */
const BANDIT_SCALE = 0.75
/** Archetype pool bandits alternate between. */
const ARCHETYPES: EnemyArchetype[] = ['skirmisher', 'line']
/** Global cooldown between "bandits spotted" notifications (seconds). */
const AGGRO_NOTIFY_COOLDOWN = 20

const DESPAWN_DIST_SQ = DESPAWN_DIST * DESPAWN_DIST
const THROTTLE_DIST_SQ = THROTTLE_DIST * THROTTLE_DIST
const SPAWN_TOWN_PLAYER_RANGE_SQ = SPAWN_TOWN_PLAYER_RANGE * SPAWN_TOWN_PLAYER_RANGE
const SPAWN_MIN_PLAYER_DIST_SQ = SPAWN_MIN_PLAYER_DIST * SPAWN_MIN_PLAYER_DIST

/** Per-bandit bundle: the mech, its AI brain, wander state, and kill bookkeeping.
 *  Mirrors StoryCombat's CombatEnemy plus the wander/aggro fields bandits need. */
interface Bandit {
  mech: MechEntity
  ai: EnemyAI
  archetype: EnemyArchetype
  lastShot: number
  destroyedSlots: MechSlot[]
  /** Home town centre (XZ) the wander ring is anchored to. */
  home: THREE.Vector3
  waypoint: THREE.Vector3 | null
  wanderTimer: number
  /** Once true, this bandit's first-aggro notification has already been decided
   *  (fired or swallowed by the global cooldown) — never re-evaluated. */
  hasAggroed: boolean
  /** Throttle parity: bandits far from the player update every other frame. */
  skipFrame: boolean
}

export interface BanditSystemConfig {
  scene: THREE.Scene
  projectileSystem: ProjectileSystem
  particleSystem: ParticleSystem
  terrain: Terrain
  /** Live town state (id/position/condition) — the SAME array/objects the host
   *  mutates as decay/collateral tick, so eligibility always reads current
   *  condition without StoryWorld needing to push updates in. */
  towns: TownState[]
  /** Camera shake hook (mirrors StoryCombat.onShake). */
  onShake?: (amount: number) => void
  /** Fired once per bandit killed (same payload shape as StoryCombat's EnemyKill
   *  so the host can award salvage identically). */
  onBanditKilled?: (kill: EnemyKill) => void
  /** Fired when a bandit kills the player — routed through the SAME defeat flow
   *  StoryCombat uses (shared StoryWorldConfig.onPlayerDefeated). */
  onPlayerDefeated?: (destroyedSlots: MechSlot[]) => void
  /** Fired (throttled) when a bandit first aggros on the player. */
  onBanditsSpotted?: (count: number) => void
  /** A bandit aggroed on the on-foot pilot — starts the forced-remount countdown
   *  (StoryWorld.signalHostileWhileOnFoot). No-op in the mech. */
  onHostileWhileOnFoot?: () => void
}

export class BanditSystem {
  private readonly scene: THREE.Scene
  private readonly projectileSystem: ProjectileSystem
  private readonly particleSystem: ParticleSystem
  private readonly terrain: Terrain
  private readonly towns: TownState[]

  onShake?: (amount: number) => void
  onBanditKilled?: (kill: EnemyKill) => void
  onPlayerDefeated?: (destroyedSlots: MechSlot[]) => void
  onBanditsSpotted?: (count: number) => void
  onHostileWhileOnFoot?: () => void

  private bandits: Bandit[] = []
  private nextId = 0
  private elapsed = 0
  private spawnTimer = SPAWN_CHECK_INTERVAL
  private lastAggroNotify = -Infinity

  // --- Reusable per-frame scratch (perf: no hot-path allocation) ---
  /** Scratch list for AI threat feeding, refilled each frame (no allocations). */
  private readonly _threatScratch: Projectile[] = []

  constructor(config: BanditSystemConfig) {
    this.scene = config.scene
    this.projectileSystem = config.projectileSystem
    this.particleSystem = config.particleSystem
    this.terrain = config.terrain
    this.towns = config.towns
    this.onShake = config.onShake
    this.onBanditKilled = config.onBanditKilled
    this.onPlayerDefeated = config.onPlayerDefeated
    this.onBanditsSpotted = config.onBanditsSpotted
    this.onHostileWhileOnFoot = config.onHostileWhileOnFoot
  }

  /** Number of bandits currently alive (for HUD / debugging). */
  get count(): number {
    return this.bandits.length
  }

  /** True if any live bandit is within `radius` of `pos` — the reckless-fire
   *  gate reuses this (OverworldGunplay.hostilesNear) so nearby bandits justify
   *  the player's weapons fire near a town. */
  hasHostileNear(pos: THREE.Vector3, radius: number): boolean {
    const r2 = radius * radius
    for (const bandit of this.bandits) {
      if (bandit.mech.position.distanceToSquared(pos) <= r2) return true
    }
    return false
  }

  /**
   * Advance the bandit population one frame. Skips almost everything while an
   * encounter is active — StoryCombat owns the projectile system's collision
   * pass then, so bandits would double-process hits (and shouldn't be spawning
   * into the middle of a scripted fight either).
   */
  update(dt: number, player: MechEntity, mode: PilotMode, combatActive: boolean): void {
    this.elapsed += dt
    if (combatActive) return

    this.spawnTimer -= dt
    if (this.spawnTimer <= 0) {
      this.spawnTimer = SPAWN_CHECK_INTERVAL
      this.trySpawn(player.position)
    }

    for (let i = this.bandits.length - 1; i >= 0; i--) {
      const bandit = this.bandits[i]
      const distSq = bandit.mech.position.distanceToSquared(player.position)
      if (distSq > DESPAWN_DIST_SQ) {
        this.despawnBandit(i)
        continue
      }
      if (distSq > THROTTLE_DIST_SQ) {
        bandit.skipFrame = !bandit.skipFrame
        if (bandit.skipFrame) continue
      }
      this.updateBandit(bandit, dt, player, mode)
    }

    if (this.bandits.length > 0) this.resolveCombat(player)
  }

  // --- Spawning ---

  /**
   * Attempt to spawn one bandit near an eligible town within range of the
   * player. Returns whether a bandit was spawned (false: at the cap, no
   * eligible town, or no valid ring point far enough from the player after a
   * few tries). Exposed (not private) so tests can force-spawn deterministically.
   */
  trySpawn(playerPos: THREE.Vector3): boolean {
    if (this.bandits.length >= MAX_BANDITS) return false

    const eligible = this.towns.filter((t) => {
      if (t.condition <= SPAWN_TOWN_MIN_CONDITION) return false
      const dx = t.position[0] - playerPos.x
      const dz = t.position[2] - playerPos.z
      return dx * dx + dz * dz <= SPAWN_TOWN_PLAYER_RANGE_SQ
    })
    if (eligible.length === 0) return false

    const town = eligible[Math.floor(Math.random() * eligible.length)]
    let spawnX = 0
    let spawnZ = 0
    let found = false
    for (let attempt = 0; attempt < 8; attempt++) {
      const angle = Math.random() * Math.PI * 2
      const r = SPAWN_RING_MIN + Math.random() * (SPAWN_RING_MAX - SPAWN_RING_MIN)
      const x = town.position[0] + Math.cos(angle) * r
      const z = town.position[2] + Math.sin(angle) * r
      const dx = x - playerPos.x
      const dz = z - playerPos.z
      if (dx * dx + dz * dz >= SPAWN_MIN_PLAYER_DIST_SQ) {
        spawnX = x
        spawnZ = z
        found = true
        break
      }
    }
    if (!found) return false

    const spawnPos = new THREE.Vector3(spawnX, this.terrain.heightAt(spawnX, spawnZ), spawnZ)
    const home = new THREE.Vector3(town.position[0], 0, town.position[2])
    this.spawnBanditAt(spawnPos, home)
    return true
  }

  private spawnBanditAt(spawnPos: THREE.Vector3, home: THREE.Vector3): void {
    const archetype = ARCHETYPES[this.nextId % ARCHETYPES.length]
    const stats = archetypeStats(archetype, BANDIT_SCALE)
    const loadout = archetypeLoadout(archetype)
    const id = `bandit-${this.nextId++}-${Math.random().toString(36).slice(2, 6)}`
    const mech = new MechEntity(id, 'Bandit', loadout, stats, false, spawnPos)
    // Face the home town initially (mirrors StoryCombat's spawnArchetypeEnemy).
    const toHome = home.clone().sub(spawnPos)
    mech.rotation.y = Math.atan2(toHome.x, toHome.z)

    const ai = new EnemyAI('medium')
    ai.setArchetype(archetype)
    ai.setArenaBounds(WORLD_HALF_EXTENT, WORLD_HALF_EXTENT)

    const bandit: Bandit = {
      mech,
      ai,
      archetype,
      lastShot: -Infinity,
      destroyedSlots: [],
      home,
      waypoint: null,
      wanderTimer: 0,
      hasAggroed: false,
      skipFrame: false,
    }
    mech.onSlotDestroyed = (m, slot) => {
      bandit.destroyedSlots.push(slot)
      this.particleSystem.spawnExplosion(m.getSlotPosition(slot), 1.2)
      this.onShake?.(0.5)
    }

    this.scene.add(mech.mesh)
    this.bandits.push(bandit)
  }

  private despawnBandit(index: number): void {
    const bandit = this.bandits[index]
    this.scene.remove(bandit.mech.mesh)
    bandit.mech.cleanup()
    this.bandits.splice(index, 1)
  }

  // --- Behaviour ---

  private updateBandit(bandit: Bandit, dt: number, player: MechEntity, mode: PilotMode): void {
    const dist = bandit.mech.position.distanceTo(player.position)
    if (dist <= AGGRO_RADIUS && mode === 'mech') {
      this.markAggro(bandit)
      this.updateCombatAI(bandit, dt, player)
    } else if (dist <= AGGRO_RADIUS && mode === 'onFoot') {
      this.markAggro(bandit)
      this.onHostileWhileOnFoot?.()
      this.updateOnFootLoiter(bandit, dt, player)
    } else {
      this.updateWander(bandit, dt)
    }
  }

  private markAggro(bandit: Bandit): void {
    if (bandit.hasAggroed) return
    bandit.hasAggroed = true
    if (this.elapsed - this.lastAggroNotify < AGGRO_NOTIFY_COOLDOWN) return
    this.lastAggroNotify = this.elapsed
    this.onBanditsSpotted?.(this.bandits.length)
  }

  /** In-mech aggro: run the archetype AI brain, snap to terrain (the AI's own
   *  gravity assumes an arena floor at y=0, which the overworld's undulating
   *  terrain is not), and fire on its cadence-gated cue. */
  private updateCombatAI(bandit: Bandit, dt: number, player: MechEntity): void {
    this._threatScratch.length = 0
    for (const p of this.projectileSystem.getProjectiles()) {
      if (p.ownerId === player.id) this._threatScratch.push(p)
    }
    bandit.ai.feedThreats(this._threatScratch)
    const shouldFire = bandit.ai.update(bandit.mech, player, dt)
    bandit.mech.position.y = this.terrain.heightAt(bandit.mech.position.x, bandit.mech.position.z)
    bandit.mech.updatePower(dt)
    bandit.mech.update(dt)

    if (!shouldFire) return
    const fireArm = bandit.mech.liveWeaponArm()
    if (!fireArm) return
    const armPart = bandit.mech.loadout[fireArm === 'left' ? 'leftArm' : 'rightArm']
    const rate = armPart?.fireRate ?? (armPart?.weaponType === 'melee' ? 1.5 : 0.25)
    if (this.elapsed - bandit.lastShot <= rate) return
    const projSpeed = weaponProjectileSpeed(armPart?.weaponType)
    const aimPoint = bandit.ai.computeAimPoint(bandit.mech, player, projSpeed)
    const dir = aimPoint.sub(bandit.mech.getArmPosition(fireArm)).normalize()
    const fired = this.projectileSystem.fireWeapon(bandit.mech, dir, fireArm, player)
    if (fired) bandit.lastShot = this.elapsed
  }

  /** On-foot aggro: no shooting the pilot (design: no on-foot combat) — hold a
   *  standoff distance and face the player, menacingly. */
  private updateOnFootLoiter(bandit: Bandit, dt: number, player: MechEntity): void {
    const dx = player.position.x - bandit.mech.position.x
    const dz = player.position.z - bandit.mech.position.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    let moveX = 0
    let moveZ = 0
    if (dist > 0.01) {
      const nx = dx / dist
      const nz = dz / dist
      bandit.mech.rotation.y = Math.atan2(nx, nz)
      if (dist > ON_FOOT_STANDOFF + 2) {
        moveX = nx
        moveZ = nz
      } else if (dist < ON_FOOT_STANDOFF - 2) {
        moveX = -nx
        moveZ = -nz
      }
    }
    bandit.mech.velocity.x = moveX * WANDER_SPEED
    bandit.mech.velocity.z = moveZ * WANDER_SPEED
    bandit.mech.position.x += bandit.mech.velocity.x * dt
    bandit.mech.position.z += bandit.mech.velocity.z * dt
    bandit.mech.position.y = this.terrain.heightAt(bandit.mech.position.x, bandit.mech.position.z)
    bandit.mech.updatePower(dt)
    bandit.mech.update(dt)
  }

  /** Player out of aggro range (or the bandit hasn't noticed): amble between
   *  waypoints on a ring around the home town so bandits read as patrolling. */
  private updateWander(bandit: Bandit, dt: number): void {
    bandit.wanderTimer -= dt
    if (bandit.waypoint === null || bandit.wanderTimer <= 0) {
      this.pickWanderWaypoint(bandit)
    }
    const wp = bandit.waypoint!
    const dx = wp.x - bandit.mech.position.x
    const dz = wp.z - bandit.mech.position.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    if (dist > 1) {
      const nx = dx / dist
      const nz = dz / dist
      bandit.mech.velocity.x = nx * WANDER_SPEED
      bandit.mech.velocity.z = nz * WANDER_SPEED
      bandit.mech.rotation.y = Math.atan2(nx, nz)
    } else {
      bandit.mech.velocity.x = 0
      bandit.mech.velocity.z = 0
    }
    bandit.mech.position.x += bandit.mech.velocity.x * dt
    bandit.mech.position.z += bandit.mech.velocity.z * dt
    bandit.mech.position.y = this.terrain.heightAt(bandit.mech.position.x, bandit.mech.position.z)
    bandit.mech.updatePower(dt)
    bandit.mech.update(dt)
  }

  private pickWanderWaypoint(bandit: Bandit): void {
    const angle = Math.random() * Math.PI * 2
    const r = Math.random() * WANDER_RADIUS
    const x = bandit.home.x + Math.cos(angle) * r
    const z = bandit.home.z + Math.sin(angle) * r
    if (bandit.waypoint) bandit.waypoint.set(x, 0, z)
    else bandit.waypoint = new THREE.Vector3(x, 0, z)
    bandit.wanderTimer = WANDER_INTERVAL_MIN + Math.random() * (WANDER_INTERVAL_MAX - WANDER_INTERVAL_MIN)
  }

  // --- Damage / death (mirrors StoryCombat.updateCombat's hit-application block) ---

  /**
   * Resolve projectile collisions against the player + all live bandits. Called
   * AFTER OverworldGunplay has advanced the projectile system for this frame
   * (StoryWorld.update ordering), so shots fired this frame have already moved.
   */
  private resolveCombat(player: MechEntity): void {
    const allMechs: MechEntity[] = [player]
    for (const b of this.bandits) allMechs.push(b.mech)
    const hits = this.projectileSystem.checkCollisions(allMechs)

    for (const hit of hits) {
      const defeated = hit.target.takeDamage(hit.projectile.damage, hit.projectile.damageType, {
        armorPierce: hit.projectile.armorPierce,
        burn: hit.projectile.appliesBurn,
        fromFront: hit.target.isHitFromFront(hit.projectile.velocity),
        slot: hit.slot,
      })
      const impact = hit.target.position.clone()
      impact.y += 1.5
      this.particleSystem.spawnHitEffect(impact, hit.projectile.type)
      this.particleSystem.spawnImpactSparks(impact, hit.projectile.velocity.clone().normalize(), 'mech')
      this.projectileSystem.removeProjectile(hit.projectile)

      if (hit.target === player) {
        this.onShake?.(0.4)
      } else {
        this.onShake?.(Math.min(0.4, 0.1 + hit.projectile.damage * 0.01))
      }

      if (defeated) {
        this.particleSystem.spawnExplosion(hit.target.position.clone(), 1.8)
        this.onShake?.(1.0)
        hit.target.isDestroyed = true
        if (hit.target === player) {
          this.onPlayerDefeated?.(this.playerDestroyedLimbs(player))
        }
      }
    }

    // Burn DoT (flamer) can zero HP without a projectile hit this frame — mirrors
    // StoryCombat's inline player burn-death check.
    if (player.stats.currentHealth <= 0 && !player.isDestroyed) {
      player.isDestroyed = true
      this.particleSystem.spawnExplosion(player.position.clone(), 1.8)
      this.onShake?.(1.0)
      this.onPlayerDefeated?.(this.playerDestroyedLimbs(player))
    }

    // Remove dead bandits (direct kill OR burn-out), award salvage, dispose.
    for (let i = this.bandits.length - 1; i >= 0; i--) {
      const bandit = this.bandits[i]
      if (!bandit.mech.isDestroyed && bandit.mech.stats.currentHealth <= 0) {
        bandit.mech.isDestroyed = true
        this.particleSystem.spawnExplosion(bandit.mech.position.clone(), 1.8)
      }
      if (bandit.mech.isDestroyed) {
        this.onBanditKilled?.({
          loadout: bandit.mech.loadout,
          destroyedSlots: bandit.destroyedSlots.slice(),
          archetype: bandit.archetype,
          isBoss: false,
        })
        this.scene.remove(bandit.mech.mesh)
        bandit.mech.cleanup()
        this.bandits.splice(i, 1)
      }
    }
  }

  /** The limb slots the player lost (core excluded — that IS the death), handed
   *  to onPlayerDefeated so the host strips them into damaged repair debt. */
  private playerDestroyedLimbs(player: MechEntity): MechSlot[] {
    return [...player.destroyedSlots].filter((s) => s !== 'core')
  }

  dispose(): void {
    for (const bandit of this.bandits) {
      this.scene.remove(bandit.mech.mesh)
      bandit.mech.cleanup()
    }
    this.bandits = []
  }
}
