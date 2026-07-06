import * as THREE from 'three'
import type { MechLoadout } from '../../composables/useMechBuilder'
import type { DamageType } from '../../shared/types/MechTypes'
import { markRaw } from 'vue'
import { getMechModelLoader, MODEL_ATTACH_POINTS } from './MechModelLoader'

// ---- Combat / damage tuning constants (design §3.2 / §3.4). Never inline. ----
/** Flat-armour reduction ceiling. Dropped 0.90 → 0.75 so nothing is unkillable. */
export const ARMOR_CAP = 0.75
/** Max magnitude of summed typed resistance (both resist and weakness). */
export const RESISTANCE_CLAMP = 0.6
/** Flamer burn DoT. Short, dt-driven, refreshes on re-hit. */
const BURN_DURATION = 2.0
const BURN_DPS = 6
/** Smoke: seconds enemy AI aiming at this mech should suffer an accuracy debuff. */
const SMOKE_SCREEN_DURATION = 6.0
/** Held directional shield block (support weapon). */
const SHIELD_HOLD_DURATION = 0.4      // block window; refreshed each support trigger
const SHIELD_BLOCK_FRACTION = 0.7     // fraction of frontal damage blocked (design §3.4)
/** dot(forward, incomingDir) below this counts as a frontal hit (≈120° frontal
 *  arc). Hits from the flanks/rear bypass the shield so it stays "a wall you
 *  flank" (design §3.6), not a 360° mitigator. */
const SHIELD_FRONTAL_DOT = -0.5
const SHIELD_POWER_PER_DAMAGE = 1.5   // power drained per point of damage blocked
/** Jump-jet rack ability. */
const JUMP_JET_COOLDOWN = 10          // matches the part's flavour text
const JUMP_JET_BOOST_DURATION = 1.2   // seconds of boosted jump PhysicsSystem may read
/** Ammo-feed rack ability: dt-driven fire-rate buff window (replaces setTimeout). */
const AMMO_FEED_DURATION = 5.0

/** Options carried from a projectile into takeDamage. */
export interface DamageOptions {
  armorPierce?: boolean          // halve target's flat armour (railgun)
  burn?: boolean                 // apply the flamer burn DoT
  fromFront?: boolean            // hit came from the mech's frontal arc (default true)
}

export interface CombatStats {
  maxHealth: number
  currentHealth: number
  armor: number
  speed: number
  firepower: number
  accuracy: number
  energy: number
}

export class MechEntity {
  id: string
  name: string
  loadout: MechLoadout
  stats: CombatStats

  // Three.js objects
  mesh: THREE.Group
  position: THREE.Vector3
  rotation: THREE.Euler
  velocity: THREE.Vector3

  // Combat state
  isJumping: boolean = false
  jumpFuel: number
  isPlayer: boolean
  isDestroyed: boolean = false

  // Walk animation
  private walkCycle: number = 0

  // Emissive-based damage flash (0 = none, 1 = full red). Decayed in update().
  private damageFlash: number = 0
  // Cached base emissive per mesh so the flash never captures a transient colour.
  private baseEmissive: WeakMap<THREE.Mesh, { color: number; intensity: number }> = new WeakMap()

  // Power system
  currentPower: number = 100
  maxPower: number = 100

  // Rack ability state
  rackAbilityCooldown: number = 0
  rackAbilityActive: boolean = false
  // dt-driven window for the ammo-feed fire-rate buff (replaces the old setTimeout
  // so it respects pause/hitstop). Decremented in update(); clears rackAbilityActive.
  private rackAbilityActiveTimer: number = 0

  // ---- Status effects (all dt-driven in update(); respect pause since update
  // is only called while unpaused) ----
  /** Flamer burn DoT remaining seconds; ticks BURN_DPS while > 0. */
  burnTimer: number = 0
  private burnDps: number = 0
  /** Smoke screen active window. Seam: EnemyAI should reduce accuracy vs a target whose smokeScreenTimer > 0. */
  smokeScreenTimer: number = 0
  /** Held frontal shield window (support weapon). Blocks a fraction of incoming, drained from power. */
  shieldTimer: number = 0
  /** Boosted jump-jet window. Seam: PhysicsSystem may read this for extra jump thrust. */
  jumpBoostTimer: number = 0

  /** Optional hook so the scene can spawn smoke particles when the smoke rack fires. */
  onSmokeDeploy?: (position: THREE.Vector3) => void

  // Destruction animation - random velocities per mesh child
  private destroyVelocities: THREE.Vector3[] = []
  private destroyRotations: THREE.Vector3[] = []

  /** Set each frame by PhysicsSystem.updateMovement; true while actively boosting
   *  (and not cut out by an empty power bar). The firing path reads this to
   *  suppress fire while boosting (design §3.1). */
  isBoosting: boolean = false

  // Dash state
  isDashing: boolean = false
  dashTimer: number = 0
  dashCooldown: number = 0
  readonly DASH_DURATION = 0.15
  readonly DASH_COOLDOWN = 2.0

  // AI state
  aiState: 'idle' | 'chase' | 'strafe' | 'shoot' | 'flank' | 'retreat' | 'aggressive' = 'idle'
  aiStrafeDir: number = 1
  aiStrafeDirTimer: number = 0
  lastShotTime: number = 0

  // Model loading state
  private modelLoadPromise: Promise<void> | null = null

  constructor(
    id: string,
    name: string,
    loadout: MechLoadout,
    stats: CombatStats,
    isPlayer: boolean,
    spawnPosition: THREE.Vector3
  ) {
    this.id = id
    this.name = name
    this.loadout = loadout
    this.stats = { ...stats }
    this.isPlayer = isPlayer
    this.jumpFuel = stats.energy

    this.position = spawnPosition.clone()
    this.rotation = new THREE.Euler(0, 0, 0)
    this.velocity = new THREE.Vector3(0, 0, 0)

    // Create immediate procedural mesh (fast, always available)
    this.mesh = markRaw(this.createMeshGroup())

    // Start async model loading in background
    this.modelLoadPromise = this.loadAndApplyModels()
  }

  /**
   * Load 3D models asynchronously and replace procedural geometry
   * Falls back silently if models aren't available
   */
  private async loadAndApplyModels(): Promise<void> {
    try {
      const loader = getMechModelLoader()
      const teamColor = this.isPlayer ? 0x3b82f6 : 0xef4444

      const modelGroup = await loader.assembleMech(this.loadout, teamColor)

      // Transfer position and rotation from old mesh
      modelGroup.position.copy(this.position)
      modelGroup.rotation.copy(this.rotation)

      // Dispose old procedural geometry
      this.disposeMeshGroup()

      // Replace with loaded model
      this.mesh = markRaw(modelGroup)
    } catch (error) {
      // Silently keep procedural geometry on error
      console.debug('Model loading failed, using procedural geometry:', error)
    }
  }

  /**
   * Wait for model loading to complete
   * Useful for loading screens
   */
  async waitForModelLoad(): Promise<void> {
    if (this.modelLoadPromise) {
      await this.modelLoadPromise
    }
  }

  /**
   * Dispose all geometry and materials in the mesh group
   */
  private disposeMeshGroup(): void {
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (child.material instanceof THREE.Material) {
          child.material.dispose()
        }
      }
    })
  }

  private createMeshGroup(): THREE.Group {
    const group = new THREE.Group()

    // Color based on team
    const color = this.isPlayer ? 0x3b82f6 : 0xef4444 // Blue vs Red

    // Core body (compact torso)
    const coreGeometry = new THREE.BoxGeometry(1.6, 1.6, 1.3)
    const coreMaterial = new THREE.MeshStandardMaterial({ color })
    const core = new THREE.Mesh(coreGeometry, coreMaterial)
    core.position.copy(MODEL_ATTACH_POINTS.core)
    core.position.y += 0.8
    group.add(core)

    // Head (1x1x1)
    const headGeometry = new THREE.BoxGeometry(1, 1, 1)
    const headMaterial = new THREE.MeshStandardMaterial({
      color: this.isPlayer ? 0x60a5fa : 0xfca5a5
    })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.copy(MODEL_ATTACH_POINTS.head)
    group.add(head)

    // Left arm
    const armGeometry = new THREE.BoxGeometry(0.8, 2, 0.8)
    const armMaterial = new THREE.MeshStandardMaterial({
      color: this.isPlayer ? 0x2563eb : 0xdc2626
    })
    const leftArm = new THREE.Mesh(armGeometry, armMaterial)
    leftArm.position.copy(MODEL_ATTACH_POINTS.leftArm)
    group.add(leftArm)

    // Right arm
    const rightArm = new THREE.Mesh(armGeometry, armMaterial)
    rightArm.position.copy(MODEL_ATTACH_POINTS.rightArm)
    group.add(rightArm)

    // Legs (taller bipedal legs)
    const legsGeometry = new THREE.BoxGeometry(1.8, 2.8, 1.5)
    const legsMaterial = new THREE.MeshStandardMaterial({
      color: this.isPlayer ? 0x1e40af : 0x991b1b
    })
    const legs = new THREE.Mesh(legsGeometry, legsMaterial)
    legs.position.copy(MODEL_ATTACH_POINTS.legs)
    legs.position.y += 1.4
    group.add(legs)

    // Set initial position
    group.position.copy(this.position)

    return group
  }

  update(deltaTime: number) {
    // Update mesh position and rotation
    this.mesh.position.copy(this.position)
    this.mesh.rotation.copy(this.rotation)

    // Walk animation
    if (!this.isDestroyed) {
      this.animateWalk(deltaTime)
    }

    // Decay emissive damage flash
    this.updateDamageFlash(deltaTime)

    // Tick dt-driven status effects (all pause-safe: update() is skipped while paused).
    this.updateStatusEffects(deltaTime)
  }

  /**
   * Advance all timed combat statuses. dt-driven so they honour pause/hitstop
   * (the host stops calling update() when paused).
   */
  private updateStatusEffects(deltaTime: number) {
    // Flamer burn DoT.
    if (this.burnTimer > 0 && !this.isDestroyed) {
      this.burnTimer = Math.max(0, this.burnTimer - deltaTime)
      this.stats.currentHealth = Math.max(0, this.stats.currentHealth - this.burnDps * deltaTime)
      // Reuse the hit flash so burn reads visually.
      if (this.damageFlash < 0.4) this.damageFlash = 0.4
    }

    // Smoke screen window (enemy-AI accuracy debuff flag).
    if (this.smokeScreenTimer > 0) this.smokeScreenTimer = Math.max(0, this.smokeScreenTimer - deltaTime)

    // Held shield window (must be re-triggered to persist).
    if (this.shieldTimer > 0) this.shieldTimer = Math.max(0, this.shieldTimer - deltaTime)

    // Boosted jump-jet window.
    if (this.jumpBoostTimer > 0) this.jumpBoostTimer = Math.max(0, this.jumpBoostTimer - deltaTime)

    // Ammo-feed fire-rate buff window (dt-driven replacement for setTimeout).
    if (this.rackAbilityActiveTimer > 0) {
      this.rackAbilityActiveTimer = Math.max(0, this.rackAbilityActiveTimer - deltaTime)
      if (this.rackAbilityActiveTimer === 0) this.rackAbilityActive = false
    }
  }

  /** True while the dash i-frame window is active (design §3.1 skill-dodge). */
  get isInvulnerable(): boolean {
    return this.isDashing
  }

  /** Raise/refresh the held frontal shield block (called by ProjectileSystem for support weapons). */
  activateShield() {
    this.shieldTimer = SHIELD_HOLD_DURATION
  }

  /**
   * Whether a projectile travelling in `incomingDir` strikes this mech's frontal
   * arc (design §3.4/§3.6: the shield only blocks the front, so it can be flanked).
   * A frontal hit travels roughly opposite the mech's facing — into its face.
   * Callers pass the projectile velocity so the shield block can be directional.
   */
  isHitFromFront(incomingDir: THREE.Vector3): boolean {
    const dir = incomingDir.clone()
    dir.y = 0
    if (dir.lengthSq() < 1e-6) return true // unknown direction — treat as frontal
    dir.normalize()
    const forward = this.getForwardDirection()
    forward.y = 0
    if (forward.lengthSq() < 1e-6) return true
    forward.normalize()
    return forward.dot(dir) < SHIELD_FRONTAL_DOT
  }

  /**
   * Summed typed resistance from every equipped part for a damage channel,
   * clamped to ±RESISTANCE_CLAMP. Positive = resistant, negative = weak. Melee
   * callers never reach here (melee is "resisted only by range", design §3.2).
   */
  getResistance(damageType: DamageType): number {
    let total = 0
    const parts = [
      this.loadout.leftArm, this.loadout.rightArm, this.loadout.core,
      this.loadout.legs, this.loadout.head, this.loadout.rack,
    ]
    for (const part of parts) {
      const r = part?.resistances?.[damageType]
      if (typeof r === 'number') total += r
    }
    return Math.max(-RESISTANCE_CLAMP, Math.min(RESISTANCE_CLAMP, total))
  }

  /**
   * Emissive-based damage flash. On hit we set damageFlash = 1; here it decays
   * back to 0 and the cached base emissive is restored. Using emissive (not the
   * material colour) avoids the captured-colour bug from the old setTimeout swap
   * and is safe to drive from multiplayer too (purely visual).
   */
  private updateDamageFlash(deltaTime: number) {
    if (this.damageFlash <= 0) return
    this.damageFlash = Math.max(0, this.damageFlash - deltaTime * 5) // ~0.2s flash

    const flash = this.damageFlash
    this.mesh.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      const mat = child.material
      if (!(mat instanceof THREE.MeshStandardMaterial) || !mat.emissive) return

      // Cache the resting emissive once, before we ever modify it.
      if (!this.baseEmissive.has(child)) {
        this.baseEmissive.set(child, { color: mat.emissive.getHex(), intensity: mat.emissiveIntensity })
      }
      const base = this.baseEmissive.get(child)!

      // Lerp from base toward red proportional to the current flash value.
      mat.emissive.setHex(base.color).lerp(new THREE.Color(0xff0000), flash)
      mat.emissiveIntensity = base.intensity + flash * 1.5
    })
  }

  private animateWalk(deltaTime: number) {
    const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2)
    const isMoving = speed > 0.5

    if (isMoving) {
      // Advance walk cycle based on movement speed
      this.walkCycle += deltaTime * speed * 0.8
    } else {
      // Smoothly return to neutral when stopped
      this.walkCycle *= 0.9
      if (Math.abs(this.walkCycle) < 0.01) this.walkCycle = 0
    }

    const swing = Math.sin(this.walkCycle)
    const legsGroup = this.findChildByName(this.mesh, 'legs')
    if (!legsGroup) return

    // Bipedal legs — swing left/right legs in opposition
    const legLeft = this.findChildByName(legsGroup, 'leg-left')
    const legRight = this.findChildByName(legsGroup, 'leg-right')
    if (legLeft && legRight) {
      const angle = swing * 0.3 // max ~17 degrees
      legLeft.rotation.x = angle
      legRight.rotation.x = -angle
      // Subtle body bob on the upper parts
      this.applyBodyBob(swing, isMoving)
      return
    }

    // Quadrupedal — diagonal pairs move together (trot gait)
    const legLF = this.findChildByName(legsGroup, 'leg-lf')
    const legRB = this.findChildByName(legsGroup, 'leg-rb')
    const legRF = this.findChildByName(legsGroup, 'leg-rf')
    const legLB = this.findChildByName(legsGroup, 'leg-lb')
    if (legLF && legRB && legRF && legLB) {
      const angle = swing * 0.25
      // Diagonal pair 1
      legLF.rotation.x = angle
      legRB.rotation.x = angle
      // Diagonal pair 2 (opposite)
      legRF.rotation.x = -angle
      legLB.rotation.x = -angle
      return
    }

    // Tracked — spin wheels based on speed
    const trackLeft = this.findChildByName(legsGroup, 'track-left')
    const trackRight = this.findChildByName(legsGroup, 'track-right')
    if (trackLeft || trackRight) {
      const spinRate = speed * deltaTime * 3
      const spinWheels = (parent: THREE.Object3D) => {
        parent.traverse((child) => {
          if (child.name.startsWith('wheel-') || child.name.startsWith('sprocket-') || child.name.startsWith('idler-')) {
            child.rotation.x += spinRate
          }
        })
      }
      if (trackLeft) spinWheels(trackLeft)
      if (trackRight) spinWheels(trackRight)
      return
    }

    // Hover — constant bob + thrust glow pulse
    const thruster = this.findChildByName(legsGroup, 'thruster-lf')
    if (thruster) {
      // Hover always bobs (use raw time via walkCycle advancing)
      this.walkCycle += deltaTime * 4 // override: constant advance for hover
      const bobAmount = isMoving ? 0.1 : 0.05
      const bob = Math.sin(this.walkCycle) * bobAmount
      if (legsGroup.userData.baseY === undefined) {
        legsGroup.userData.baseY = legsGroup.position.y
      }
      legsGroup.position.y = (legsGroup.userData.baseY as number) + bob
      // Pulse thrust glow
      legsGroup.traverse((child) => {
        if (child.name === 'thrust-glow' && child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial
          mat.emissiveIntensity = isMoving ? 0.8 + Math.sin(this.walkCycle * 3) * 0.3 : 0.5
        }
      })
      return
    }
  }

  private applyBodyBob(swing: number, isMoving: boolean) {
    // Subtle vertical bob based on walk cycle
    // Uses the attach points as base, so we set absolute Y offset
    const bobY = isMoving ? Math.abs(swing) * 0.06 : 0
    for (const name of ['core', 'head', 'leftArm', 'rightArm', 'rack'] as const) {
      const part = this.findChildByName(this.mesh, name)
      if (part && part.userData.baseY === undefined) {
        part.userData.baseY = part.position.y
      }
      if (part && part.userData.baseY !== undefined) {
        part.position.y = part.userData.baseY + bobY
      }
    }
  }

  private findChildByName(parent: THREE.Object3D, name: string): THREE.Object3D | null {
    for (const child of parent.children) {
      if (child.name === name) return child
    }
    return null
  }

  /** Returns the world-space position of the mech's arm weapon spawn, falling back to MODEL_ATTACH_POINTS. */
  getArmPosition(arm: 'left' | 'right'): THREE.Vector3 {
    const childName = arm === 'left' ? 'leftArm' : 'rightArm'
    const attachPoint = arm === 'left' ? MODEL_ATTACH_POINTS.leftArm : MODEL_ATTACH_POINTS.rightArm
    const armMesh = this.findChildByName(this.mesh, childName)
    if (armMesh) {
      const worldPos = new THREE.Vector3()
      armMesh.getWorldPosition(worldPos)
      return worldPos
    }
    return this.position.clone()
      .add(this.getForwardDirection().multiplyScalar(2))
      .add(this.getRightDirection().multiplyScalar(arm === 'left' ? -1.4 : 1.4))
      .setY(this.position.y + attachPoint.y)
  }

  /** Returns the world-space position of the mech's core, falling back to MODEL_ATTACH_POINTS. */
  getCorePosition(): THREE.Vector3 {
    const coreMesh = this.findChildByName(this.mesh, 'core')
    if (coreMesh) {
      const worldPos = new THREE.Vector3()
      coreMesh.getWorldPosition(worldPos)
      return worldPos
    }
    return this.position.clone().setY(this.position.y + MODEL_ATTACH_POINTS.core.y)
  }

  /**
   * Single damage choke point (design §3.2). Applies, in order:
   *  1. Dash i-frames — full invulnerability during the 0.15s dash window.
   *  2. Held shield block — a fraction of frontal, non-melee damage is drained
   *     from power instead of HP (fails when power runs out).
   *  3. Flat armour — capped at ARMOR_CAP (75%); halved by armour-piercing hits.
   *  4. Typed resistance — chassis parts resist/are weak to kinetic/energy;
   *     melee ignores this ("resisted only by range").
   *  5. Flamer burn — starts/refreshes a dt-driven DoT (ticked in update()).
   *
   * `damageType`/`opts` are optional so legacy call sites (`takeDamage(dmg)`)
   * still compile; the integrator should pass the projectile's damageType and
   * `{ armorPierce, burn }` from the hit to activate typed combat.
   */
  takeDamage(damage: number, damageType: DamageType = 'kinetic', opts?: DamageOptions): boolean {
    // 1. Dash i-frames: fully invulnerable mid-dash (the skill dodge, §3.1).
    if (this.isInvulnerable) return false

    let incoming = damage

    // 2. Held directional shield: block a fraction, drained from power not HP.
    //    Blocks ranged damage from the front (default true if direction unknown).
    if (this.shieldTimer > 0 && damageType !== 'melee' && (opts?.fromFront ?? true) && this.currentPower > 0) {
      const wanted = incoming * SHIELD_BLOCK_FRACTION
      const affordable = this.currentPower / SHIELD_POWER_PER_DAMAGE
      const blocked = Math.min(wanted, affordable)
      this.currentPower = Math.max(0, this.currentPower - blocked * SHIELD_POWER_PER_DAMAGE)
      incoming -= blocked
    }

    // 3. Flat armour reduction (cap 75%; armour-piercing sees half the armour).
    const effectiveArmor = opts?.armorPierce ? this.stats.armor / 2 : this.stats.armor
    const armorReduction = Math.min(ARMOR_CAP, effectiveArmor / 100)
    let actualDamage = incoming * (1 - armorReduction)

    // 4. Typed resistance (melee excluded).
    if (damageType !== 'melee') {
      actualDamage *= (1 - this.getResistance(damageType))
    }

    actualDamage = Math.max(0, actualDamage)
    this.stats.currentHealth -= actualDamage

    // 5. Flamer burn: start/refresh the DoT.
    if (opts?.burn) {
      this.burnTimer = BURN_DURATION
      this.burnDps = BURN_DPS
    }

    // Visual feedback - flash red
    this.flashDamage()

    if (this.stats.currentHealth <= 0) {
      this.stats.currentHealth = 0
      return true // Defeated
    }

    return false
  }

  private flashDamage() {
    // Trigger the emissive flash; the decay + restore happens in update().
    this.damageFlash = 1
  }

  playDestroyAnimation(deltaTime: number) {
    const children = this.mesh.children
    // Initialize random velocities on first call
    if (this.destroyVelocities.length === 0) {
      for (let i = 0; i < children.length; i++) {
        this.destroyVelocities.push(new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          2 + Math.random() * 6,
          (Math.random() - 0.5) * 8,
        ))
        this.destroyRotations.push(new THREE.Vector3(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5,
        ))
      }
    }

    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      const vel = this.destroyVelocities[i]
      const rot = this.destroyRotations[i]
      if (!vel || !rot) continue

      // Apply gravity to velocity
      vel.y -= 12 * deltaTime

      // Move part
      child.position.x += vel.x * deltaTime
      child.position.y += vel.y * deltaTime
      child.position.z += vel.z * deltaTime

      // Spin part
      child.rotation.x += rot.x * deltaTime
      child.rotation.y += rot.y * deltaTime
      child.rotation.z += rot.z * deltaTime
    }
  }

  getForwardDirection(): THREE.Vector3 {
    const direction = new THREE.Vector3(0, 0, 1)
    direction.applyEuler(this.rotation)
    return direction.normalize()
  }

  getRightDirection(): THREE.Vector3 {
    const direction = new THREE.Vector3(1, 0, 0)
    direction.applyEuler(this.rotation)
    return direction.normalize()
  }

  // Weight system computed properties
  get totalWeight(): number {
    let weight = 0
    if (this.loadout.leftArm) weight += this.loadout.leftArm.weight
    if (this.loadout.rightArm) weight += this.loadout.rightArm.weight
    if (this.loadout.core) weight += this.loadout.core.weight
    if (this.loadout.legs) weight += this.loadout.legs.weight
    if (this.loadout.head) weight += this.loadout.head.weight
    if (this.loadout.rack) weight += this.loadout.rack.weight
    return weight
  }

  get weightClass(): 'light' | 'medium' | 'heavy' | 'assault' {
    const w = this.totalWeight
    if (w < 60) return 'light'
    if (w < 90) return 'medium'
    if (w < 120) return 'heavy'
    return 'assault'
  }

  get weightPenalty(): number {
    // 0.5 to 1.0 multiplier (lighter = higher, faster)
    return Math.max(0.5, 1.0 - (this.totalWeight / 200))
  }

  // Power system computed properties
  get powerCapacity(): number {
    return this.loadout.legs?.powerCapacity || 100
  }

  get totalPowerDraw(): number {
    let draw = 0
    if (this.loadout.leftArm) draw += this.loadout.leftArm.powerDraw
    if (this.loadout.rightArm) draw += this.loadout.rightArm.powerDraw
    return draw
  }

  updatePower(deltaTime: number) {
    // Regenerate power from core
    const regenRate = this.loadout.core?.powerOutput || 10
    this.currentPower = Math.min(this.powerCapacity, this.currentPower + regenRate * deltaTime)
    this.maxPower = this.powerCapacity
  }

  // Targeting system
  getTargetingBonus(targetDistance: number, isMoving: boolean): number {
    const head = this.loadout.head
    if (!head) return 0

    let bonus = head.targetingBonus / 100 // Base bonus (0.0 to 1.0)

    // Head-specific range modifiers
    switch (head.id) {
      case 'head-targeting-array':
        // Excellent at all ranges, no movement penalty
        if (targetDistance > 50) bonus += 0.2
        break
      case 'head-scout-suite':
        // Best at extreme range, poor close-up
        if (targetDistance > 70) bonus += 0.3
        if (targetDistance < 20) bonus -= 0.2
        break
      case 'head-reinforced':
        // Consistent but mediocre
        bonus *= 0.8
        break
      case 'head-standard-optics':
        // Balanced
        break
    }

    // Movement penalty (reduced by advanced targeting)
    if (isMoving && head.id !== 'head-targeting-array') {
      bonus -= 0.15
    }

    return Math.max(-0.3, Math.min(0.3, bonus)) // Clamp to ±30%
  }

  // Rack ability system
  useRackAbility(): boolean {
    if (!this.loadout.rack || this.rackAbilityCooldown > 0) return false

    switch (this.loadout.rack.id) {
      case 'rack-jump-jets':
        // Refill jump fuel and open a boosted-jump window. PhysicsSystem owns the
        // actual thrust; it can read jumpBoostTimer/jumpFuel for extra lift (seam).
        this.jumpFuel = this.stats.energy
        this.jumpBoostTimer = JUMP_JET_BOOST_DURATION
        this.rackAbilityCooldown = JUMP_JET_COOLDOWN
        return true
      case 'rack-smoke-launcher':
        // Deploy a smoke screen: sets an enemy-AI accuracy-debuff window on this
        // mech and asks the scene to spawn the obscuring particle cloud.
        this.smokeScreenTimer = SMOKE_SCREEN_DURATION
        this.onSmokeDeploy?.(this.getCorePosition())
        this.rackAbilityCooldown = 15
        return true
      case 'rack-ammo-feed':
        // Fire-rate buff (NOT a magazine sim — power stays the only economy, §6).
        // dt-driven window so it respects pause/hitstop (replaces setTimeout).
        this.rackAbilityActive = true
        this.rackAbilityActiveTimer = AMMO_FEED_DURATION
        this.rackAbilityCooldown = 20
        return true
      case 'rack-repair-drone':
        // Instant heal
        this.stats.currentHealth = Math.min(this.stats.maxHealth, this.stats.currentHealth + 50)
        this.rackAbilityCooldown = 30
        return true
    }
    return false
  }

  cleanup() {
    this.disposeMeshGroup()
  }
}
