import * as THREE from 'three'
import { markRaw } from 'vue'
import { MechEntity } from '../battle/MechEntity'
import { EnemyAI, type EnemyArchetype } from '../battle/EnemyAI'
import { ProjectileSystem } from '../battle/ProjectileSystem'
import { ParticleSystem } from '../battle/ParticleSystem'
import {
  archetypeStats,
  archetypeLoadout,
  weaponProjectileSpeed,
  maxAliveForDifficulty,
  compositionForDifficulty,
  reinforcementComposition,
} from '../battle/enemyGeneration'
import type { AIDifficulty } from '../../composables/useGameSettings'
import type { MechSlot } from '../../shared/types/MechTypes'
import type { MechLoadout } from '../../composables/useMechBuilder'
import type { QuestDef } from './quests'
import {
  COLLATERAL_SEVERITY_PER_PLAYER_HIT,
  COLLATERAL_SEVERITY_PER_COMBAT_SECOND,
} from '../../composables/useStoryMode'

/**
 * Per-enemy bundle: the mech, its own AI brain, its weapon cooldowns, and the
 * archetype it was spawned as. Each enemy in a wave gets an independent AI so
 * they can flank/strafe separately.
 */
interface CombatEnemy {
  mech: MechEntity
  ai: EnemyAI
  lastShot: number
  archetype: EnemyArchetype
  /** Named-ace boss (drives the half-health reinforcement script). */
  isBoss: boolean
  /** Limb slots shot off this fight — the guaranteed-damaged salvage drops (§3.6). */
  destroyedSlots: MechSlot[]
}

/** Payload the host consumes to award salvage for a killed enemy (§3.6/§3.7). */
export interface EnemyKill {
  /** The killed enemy's loadout — its parts are the salvage drop pool. */
  loadout: MechLoadout
  /** Limb slots destroyed during the fight (drop damaged, guaranteed). */
  destroyedSlots: MechSlot[]
  archetype: EnemyArchetype
  isBoss: boolean
}

/** Story pacing: how much the quest difficulty tier scales archetype stats. */
const TIER_SCALE: Record<AIDifficulty, number> = {
  tutorial: 0.8,
  easy: 0.9,
  medium: 1.0,
  hard: 1.15,
  boss: 1.3,
}

/**
 * Radius (world units) around the town centre inside which combat collateral
 * (explosions, stray ordnance) registers. Mirrors useStoryMode's decay radius;
 * kept local so this module stays free of the story-state composable.
 */
const COLLATERAL_RADIUS = 60

/** Snapshot the host reads each frame to drive HUD / completion. */
export interface CombatProgress {
  /** Enemies cleared so far this encounter (wave/boss). */
  cleared: number
  /** Total enemies in this encounter. */
  total: number
  /** Hidden Object: whether the object has been revealed (player got close). */
  found: boolean
  /** Hidden Object: whether the object has been collected (quest done). */
  collected: boolean
  /** True once the whole encounter is complete. */
  complete: boolean
}

/**
 * Single-player combat encounter driver for Story Mode. Spawns the active
 * quest's enemies (or hidden object) near a town, runs the same combat sim as
 * BattleScene (AI, projectiles, collisions, damage, death VFX), and reports
 * progress so the host can complete the quest.
 *
 * It does NOT own the scene/renderer/camera — StoryWorld passes those in and
 * calls update() each frame. All THREE objects are markRaw via the systems they
 * come from; the class itself must not be made reactive.
 */
export class StoryCombat {
  private scene: THREE.Scene
  private projectiles: ProjectileSystem
  private particles: ParticleSystem

  private enemies: CombatEnemy[] = []
  private quest: QuestDef | null = null
  /** Town centre the encounter is anchored to. */
  private anchor = new THREE.Vector3()
  private arenaHalf = 100

  // Hidden Object state.
  private hiddenObject: THREE.Group | null = null
  private hiddenGeoms: THREE.BufferGeometry[] = []
  private hiddenMats: THREE.Material[] = []
  private objectFound = false
  private objectCollected = false

  // Wave Defence pacing: spawn enemies in small batches as the player clears them.
  private waveSpawnQueue: number = 0 // enemies still to spawn for the current wave quest
  private waveDifficulty: AIDifficulty = 'easy'
  private waveTierScale = 1
  private waveBatchTimer = 0
  private clearedCount = 0
  private totalCount = 0

  // Boss (Sanction / named ace) state — drives the half-health reinforcement
  // script (§3.6). `boss` is the ace unit; `bossReinforced` latches so the
  // reinforcement pair spawns exactly once when it crosses 50% HP.
  private boss: CombatEnemy | null = null
  private bossReinforced = false
  private bossScale = 1

  private elapsed = 0

  // Player firing cooldowns (the world drives player firing through us so the
  // single combat path matches BattleScene's dual-arm logic).
  private lastLeftShot = 0
  private lastRightShot = 0

  /** Fired when the encounter is fully complete (all enemies dead / object got). */
  onComplete?: (quest: QuestDef) => void
  /**
   * Fired when the player mech is destroyed during an encounter. Carries the
   * limb slots the player lost in the fight (from MechEntity.destroyedSlots, core
   * excluded) so the host can strip them into the inventory as damaged repair
   * debt (§3.7 death stakes).
   */
  onPlayerDefeated?: (destroyedSlots: MechSlot[]) => void
  /** Camera shake hook (host wires CameraController.triggerShake). */
  onShake?: (amount: number) => void
  /**
   * Collateral hook (§3.5): fired when combat harms the town. Reshaped in Phase 3
   * to the SYSTEMS severity contract — collateral is dominated by **hits the
   * player takes** and **combat-seconds spent near town**, and is NEVER driven by
   * the player landing shots or by kill/AoE explosions (those emit 0). `amount`
   * is a distance-tapered severity (full weight at the town centre, tapering to 0
   * at COLLATERAL_RADIUS); `position` is the world impact point. The host routes
   * it into useStoryMode.applyTownCollateral (a gentle one-way condition drop).
   */
  onCollateral?: (amount: number, position: THREE.Vector3) => void
  /**
   * Comms-style HUD callout hook (§3.6): fired once when a named ace calls in
   * its half-health reinforcement pair, so the host can surface a "hostile
   * reinforcements inbound" banner. Phase 2 emits; the HUD lands in Phase 3.
   */
  onReinforcement?: (info: { bossName: string; count: number }) => void
  /**
   * Salvage hook (§3.6/§3.7): fired once per enemy killed, with its loadout and
   * the limb slots destroyed during the fight. The host routes this into
   * `useStoryMode.awardKillSalvage` (scrap + rolled part drops) and a HUD toast.
   */
  onEnemyKilled?: (kill: EnemyKill) => void

  constructor(scene: THREE.Scene, projectiles: ProjectileSystem, particles: ParticleSystem) {
    this.scene = scene
    this.projectiles = projectiles
    this.particles = particles
  }

  setArenaBounds(half: number): void {
    this.arenaHalf = half
  }

  get active(): boolean {
    return this.quest !== null
  }

  get activeQuest(): QuestDef | null {
    return this.quest
  }

  getProgress(): CombatProgress {
    return {
      cleared: this.clearedCount,
      total: this.totalCount,
      found: this.objectFound,
      collected: this.objectCollected,
      complete: false,
    }
  }

  /**
   * Begin an encounter for a quest, anchored at the town centre. Spawns the
   * appropriate content. Returns false if an encounter is already running.
   */
  start(quest: QuestDef, townCenter: THREE.Vector3): boolean {
    if (this.quest) return false
    this.quest = quest
    this.anchor.copy(townCenter)
    this.elapsed = 0
    this.clearedCount = 0
    this.objectFound = false
    this.objectCollected = false
    this.boss = null
    this.bossReinforced = false

    if (quest.type === 'hidden_object') {
      this.totalCount = 1
      this.spawnHiddenObject(quest)
    } else if (quest.type === 'boss_hunt') {
      // Sanction: a named ace. The reinforcement pair (spawned at half HP) adds
      // to totalCount when it arrives.
      this.totalCount = 1
      this.bossScale = quest.bossScale ?? 1
      this.boss = this.spawnArchetypeEnemy('ace', this.bossScale, 0, true, quest.bossName)
    } else {
      // wave_defence: queue N enemies as a combined-arms composition, spawn the
      // first batch.
      const n = quest.waveCount ?? 3
      this.totalCount = n
      this.waveSpawnQueue = n
      this.waveDifficulty = quest.difficulty ?? 'easy'
      this.waveTierScale = TIER_SCALE[this.waveDifficulty] ?? 1
      this.spawnWaveBatch()
    }
    return true
  }

  /** Abandon the current encounter, removing all spawned content from the scene. */
  abort(): void {
    for (const e of this.enemies) {
      this.scene.remove(e.mech.mesh)
      e.mech.cleanup()
    }
    this.enemies = []
    this.disposeHiddenObject()
    this.quest = null
    this.waveSpawnQueue = 0
    this.clearedCount = 0
    this.totalCount = 0
    this.boss = null
    this.bossReinforced = false
  }

  // --- Spawning ---

  private randomRingPoint(minR: number, maxR: number): THREE.Vector3 {
    const a = Math.random() * Math.PI * 2
    const r = minR + Math.random() * (maxR - minR)
    return new THREE.Vector3(
      this.anchor.x + Math.cos(a) * r,
      0,
      this.anchor.z + Math.sin(a) * r,
    )
  }

  /** Short HUD label per archetype (falls back to a generic "Raider"). */
  private static readonly ARCHETYPE_LABEL: Record<EnemyArchetype, string> = {
    skirmisher: 'Skirmisher',
    line: 'Trooper',
    bulwark: 'Bulwark',
    sniper: 'Lancer',
    ace: 'Ace',
  }

  /**
   * Spawn one archetype enemy from the unified enemyGeneration table and give it
   * the matching AI brain (§3.6). Returns the CombatEnemy bundle so callers
   * (boss spawn) can hold a reference. `scale` multiplies the archetype's base
   * stats (boss scale / wave ramp).
   */
  private spawnArchetypeEnemy(
    archetype: EnemyArchetype,
    scale: number,
    index: number,
    isBoss = false,
    bossName?: string,
  ): CombatEnemy {
    const stats = archetypeStats(archetype, scale)
    const loadout = archetypeLoadout(archetype)
    const spawn = this.randomRingPoint(30, 45)
    const label = StoryCombat.ARCHETYPE_LABEL[archetype] ?? 'Raider'
    // Named Combine ace (§2.5): the boss carries the quest's identity so the HUD
    // and the reinforcement callout read as a person, not a generic "Town Bully".
    const name = isBoss ? (bossName ?? 'Combine Ace') : `${label} ${index + 1}`
    const mech = new MechEntity(`story-enemy-${this.elapsed}-${index}-${Math.random().toString(36).slice(2, 6)}`,
      name, loadout, stats, false, spawn)
    // Face the town centre.
    const toCenter = this.anchor.clone().sub(spawn)
    mech.rotation.y = Math.atan2(toCenter.x, toCenter.z)

    // Behaviour brain: archetype profile drives kite/brawl/aim; the ace uses the
    // boss difficulty as its base so it stays elite even before setArchetype.
    const ai = new EnemyAI(isBoss ? 'boss' : 'medium')
    ai.setArchetype(archetype)
    ai.setArenaBounds(this.arenaHalf, this.arenaHalf)

    // Slot-destruction feedback + salvage tracking (§3.3/§3.6): record which limb
    // was shot off (a guaranteed damaged drop when this enemy dies) and punch a
    // burst + shake at the limb so delimbing reads distinctly from a plain hit.
    const unit: CombatEnemy = { mech, ai, lastShot: 0, archetype, isBoss, destroyedSlots: [] }
    mech.onSlotDestroyed = (m, slot) => {
      unit.destroyedSlots.push(slot)
      this.particles.spawnExplosion(m.getSlotPosition(slot), 1.2)
      this.onShake?.(0.5)
    }

    this.scene.add(mech.mesh)
    this.enemies.push(unit)
    return unit
  }

  private spawnWaveBatch(): void {
    // Combined-arms composition for this tier, cycled across the wave so the
    // batch is mixed (skirmisher + bulwark + sniper …) rather than N clones.
    const maxAlive = maxAliveForDifficulty(this.waveDifficulty)
    const composition = compositionForDifficulty(this.waveDifficulty)
    while (this.enemies.length < maxAlive && this.waveSpawnQueue > 0) {
      const idx = this.totalCount - this.waveSpawnQueue
      const archetype = composition[idx % composition.length]
      // Tier scale sets the wave's baseline toughness; later enemies ramp slightly.
      const scale = this.waveTierScale * (1 + idx * 0.08)
      this.spawnArchetypeEnemy(archetype, scale, idx)
      this.waveSpawnQueue--
    }
  }

  private spawnHiddenObject(quest: QuestDef): void {
    const group = markRaw(new THREE.Group())
    // A small glittering crate/orb hidden out in the town's fields.
    const bodyGeo = new THREE.IcosahedronGeometry(1.1, 0)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.5,
      metalness: 0.3,
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.position.y = 1.1
    body.castShadow = true
    body.name = 'hidden-body'
    group.add(body)
    this.hiddenGeoms.push(bodyGeo)
    this.hiddenMats.push(bodyMat)

    // A faint base ring so, once revealed, it's easy to spot.
    const ringGeo = new THREE.RingGeometry(1.6, 2.0, 24)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffe066,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.05
    ring.name = 'hidden-ring'
    group.add(ring)
    this.hiddenGeoms.push(ringGeo)
    this.hiddenMats.push(ringMat)

    const pos = this.randomRingPoint(14, quest.searchRadius ?? 26)
    group.position.copy(pos)
    group.visible = false // concealed until proximity reveal
    this.hiddenObject = group
    this.scene.add(group)
  }

  private disposeHiddenObject(): void {
    if (this.hiddenObject) {
      this.scene.remove(this.hiddenObject)
      this.hiddenObject = null
    }
    for (const g of this.hiddenGeoms) g.dispose()
    for (const m of this.hiddenMats) m.dispose()
    this.hiddenGeoms = []
    this.hiddenMats = []
  }

  // --- Per-frame update ---

  /**
   * Advance the encounter one frame. The host supplies the player mech, current
   * input-driven fire intent, and battleTime for cooldown bookkeeping. Returns
   * the in-flight player projectiles so the host can optionally feed the AI.
   */
  update(
    deltaTime: number,
    player: MechEntity,
    fire: { left: boolean; right: boolean; aimDir: THREE.Vector3 | null },
    battleTime: number,
  ): void {
    if (!this.quest) return
    this.elapsed += deltaTime

    if (this.quest.type === 'hidden_object') {
      this.updateHiddenObject(player)
      return
    }

    this.updateCombat(deltaTime, player, fire, battleTime)
  }

  private updateHiddenObject(player: MechEntity): void {
    if (!this.hiddenObject || this.objectCollected) return
    const obj = this.hiddenObject
    const dx = player.position.x - obj.position.x
    const dz = player.position.z - obj.position.z
    const distSq = dx * dx + dz * dz

    // Reveal within 18 units; sparkle/grow when found.
    const revealDist = 18
    if (!this.objectFound && distSq <= revealDist * revealDist) {
      this.objectFound = true
      obj.visible = true
      const ring = obj.getObjectByName('hidden-ring') as THREE.Mesh | null
      if (ring) (ring.material as THREE.MeshBasicMaterial).opacity = 0.7
      const body = obj.getObjectByName('hidden-body') as THREE.Mesh | null
      if (body) {
        const m = body.material as THREE.MeshStandardMaterial
        m.emissive.setHex(0xffaa00)
        m.emissiveIntensity = 0.6
      }
    }

    if (this.objectFound) {
      // Gentle bob + spin so it reads as a collectible.
      obj.rotation.y += 0.02
      obj.position.y = Math.sin(this.elapsed * 2.5) * 0.3
      // Pick up within 4 units.
      if (distSq <= 16) {
        this.objectCollected = true
        this.particles.spawnHitEffect(obj.position.clone().setY(1.2), 'energy')
        this.disposeHiddenObject()
        this.finish()
      }
    }
  }

  private updateCombat(
    deltaTime: number,
    player: MechEntity,
    fire: { left: boolean; right: boolean; aimDir: THREE.Vector3 | null },
    battleTime: number,
  ): void {
    // --- Collateral: time-in-combat-near-town (§3.5 contract) ---
    // Each second of active combat inside the town taxes its condition a little,
    // tapered by the player's proximity to the town centre. This (plus hits the
    // player takes, below) is the dominant, deliberately-gentle collateral term.
    // The player LANDING shots and kill/AoE explosions are explicitly untaxed.
    this.emitCollateral(player.position, COLLATERAL_SEVERITY_PER_COMBAT_SECOND * deltaTime)

    // --- Player firing (mirrors BattleScene dual-arm cadence) ---
    const aim = fire.aimDir ?? player.getForwardDirection()
    // Cannot fire while boosting (design §3.1). PhysicsSystem sets isBoosting
    // on the player each frame from StoryWorld's movement update.
    const canFire = !player.isBoosting
    // Ammo-feed rack ability: doubled fire rate while active (design §3.4 — a
    // fire-rate buff, not a magazine sim). Mirrors BattleScene so the rack works
    // in the campaign, not just Build & Battle.
    const ammoFeed = player.rackAbilityActive && player.loadout.rack?.id === 'rack-ammo-feed'
    if (canFire && fire.left && player.loadout.leftArm) {
      let rate = player.loadout.leftArm.fireRate ?? (player.loadout.leftArm.weaponType === 'melee' ? 1.5 : 0.25)
      if (ammoFeed) rate *= 0.5
      if (battleTime - this.lastLeftShot > rate) {
        const target = this.nearestEnemyTo(player)
        const fired = this.projectiles.fireWeapon(player, this.armAim(player, 'left', aim), 'left', target?.mech)
        if (fired) {
          this.lastLeftShot = battleTime
          this.spawnMuzzle(player, 'left', aim)
        }
      }
    }
    if (canFire && fire.right && player.loadout.rightArm) {
      let rate = player.loadout.rightArm.fireRate ?? (player.loadout.rightArm.weaponType === 'melee' ? 1.5 : 0.25)
      if (ammoFeed) rate *= 0.5
      if (battleTime - this.lastRightShot > rate) {
        const target = this.nearestEnemyTo(player)
        const fired = this.projectiles.fireWeapon(player, this.armAim(player, 'right', aim), 'right', target?.mech)
        if (fired) {
          this.lastRightShot = battleTime
          this.spawnMuzzle(player, 'right', aim)
        }
      }
    }

    // Feed AI the player's in-flight projectiles so it can dodge.
    const threats = this.projectiles.getProjectiles()
      .filter((p) => p.ownerId === player.id)
      .map((p) => ({ position: p.position, velocity: p.velocity }))

    // --- Enemy AI + firing ---
    for (const e of this.enemies) {
      if (e.mech.isDestroyed) continue
      e.ai.feedThreats(threats)
      const shouldFire = e.ai.update(e.mech, player, deltaTime)
      e.mech.updatePower(deltaTime)
      e.mech.update(deltaTime)
      if (shouldFire) {
        // Fire from a live weapon arm (§3.3): a defanged right arm falls back to
        // the left; both gone = the enemy can't shoot.
        const fireArm = e.mech.liveWeaponArm()
        if (fireArm) {
          const armPart = e.mech.loadout[fireArm === 'left' ? 'leftArm' : 'rightArm']
          const projSpeed = weaponProjectileSpeed(armPart?.weaponType)
          const aimPoint = e.ai.computeAimPoint(e.mech, player, projSpeed)
          const dir = aimPoint.sub(e.mech.getArmPosition(fireArm)).normalize()
          this.projectiles.fireWeapon(e.mech, dir, fireArm, player)
        }
      }
    }

    // --- Projectiles + collisions (player + all live enemies) ---
    const allMechs = [player, ...this.enemies.map((e) => e.mech)]
    this.projectiles.update(deltaTime, allMechs)
    const hits = this.projectiles.checkCollisions(allMechs)
    for (const hit of hits) {
      const defeated = hit.target.takeDamage(hit.projectile.damage, hit.projectile.damageType, {
        armorPierce: hit.projectile.armorPierce,
        burn: hit.projectile.appliesBurn,
        fromFront: hit.target.isHitFromFront(hit.projectile.velocity),
        slot: hit.slot,
      })
      const impact = hit.target.position.clone()
      impact.y += 1.5
      this.particles.spawnHitEffect(impact, hit.projectile.type)
      this.particles.spawnImpactSparks(impact, hit.projectile.velocity.clone().normalize(), 'mech')
      this.projectiles.removeProjectile(hit.projectile)

      if (hit.target === player) {
        this.onShake?.(0.4)
        // A hit LANDING ON THE PLAYER is the dominant collateral term (§3.5): the
        // town pays for the fight you couldn't dodge. Full per-hit severity,
        // tapered by proximity to the town centre.
        this.emitCollateral(hit.target.position, COLLATERAL_SEVERITY_PER_PLAYER_HIT)
      } else {
        this.onShake?.(Math.min(0.4, 0.1 + hit.projectile.damage * 0.01))
      }

      if (defeated) {
        this.spawnDeathExplosion(hit.target.position.clone(), 1.8)
        this.onShake?.(1.0)
        hit.target.isDestroyed = true
        if (hit.target === player) {
          this.onPlayerDefeated?.(this.playerDestroyedLimbs(player))
          this.abort()
          return
        }
      }
    }

    // Burn DoT (flamer) can reduce a mech to 0 HP in MechEntity.update() without
    // a projectile hit. Register a burn-only player defeat here (enemies handled
    // in the removal loop below). Design §3.2 flamer identity.
    if (player.stats.currentHealth <= 0 && !player.isDestroyed) {
      player.isDestroyed = true
      this.spawnDeathExplosion(player.position.clone(), 1.8)
      this.onShake?.(1.0)
      this.onPlayerDefeated?.(this.playerDestroyedLimbs(player))
      this.abort()
      return
    }

    // --- Named-ace half-health reinforcement script (§3.6) ---
    // When the boss first drops to 50% HP, it calls in a scripted skirmisher
    // pair and fires the comms callout hook. Fires exactly once.
    const boss = this.boss
    if (boss && !this.bossReinforced && !boss.mech.isDestroyed) {
      const hp = boss.mech.stats.currentHealth / boss.mech.stats.maxHealth
      if (hp <= 0.5) {
        this.bossReinforced = true
        const pair = reinforcementComposition()
        // Reinforcements are lighter than the ace — half the boss scale, floored
        // at 1 so they still bite.
        const reScale = Math.max(1, this.bossScale * 0.5)
        pair.forEach((arch, i) => this.spawnArchetypeEnemy(arch, reScale, this.totalCount + i))
        this.totalCount += pair.length
        this.onReinforcement?.({ bossName: boss.mech.name, count: pair.length })
      }
    }

    // --- Remove dead enemies, refill wave, check completion ---
    const stillAlive: CombatEnemy[] = []
    for (const e of this.enemies) {
      // A burn-out (currentHealth <= 0 with no explosion yet) counts as a kill.
      if (!e.mech.isDestroyed && e.mech.stats.currentHealth <= 0) {
        e.mech.isDestroyed = true
        this.spawnDeathExplosion(e.mech.position.clone(), 1.8)
      }
      if (e.mech.isDestroyed) {
        // Salvage (§3.6/§3.7): hand the host this enemy's loadout + the limbs it
        // lost so it can award scrap and roll part drops. Read before cleanup().
        this.onEnemyKilled?.({
          loadout: e.mech.loadout,
          destroyedSlots: e.destroyedSlots.slice(),
          archetype: e.archetype,
          isBoss: e.isBoss,
        })
        this.scene.remove(e.mech.mesh)
        e.mech.cleanup()
        this.clearedCount++
        if (this.boss === e) this.boss = null
      } else {
        stillAlive.push(e)
      }
    }
    this.enemies = stillAlive

    // Wave: refill from the queue if a slot opened.
    if (this.quest.type === 'wave_defence' && this.waveSpawnQueue > 0) {
      this.waveBatchTimer -= deltaTime
      if (this.enemies.length < maxAliveForDifficulty(this.waveDifficulty) && this.waveBatchTimer <= 0) {
        this.spawnWaveBatch()
        this.waveBatchTimer = 1.5
      }
    }

    // Complete when nothing left to fight or spawn.
    if (this.enemies.length === 0 && this.waveSpawnQueue === 0) {
      this.finish()
    }
  }

  private finish(): void {
    const quest = this.quest
    this.quest = null
    if (quest) this.onComplete?.(quest)
  }

  // --- Helpers ---

  /**
   * Spawn a death/AoE explosion (VFX only). Kill explosions are NOT taxed as
   * collateral (§3.5 contract — PER_ENEMY_KILL = 0): landing a kill should never
   * feel like it hurts the town, so the disposable P2 kill-explosion collateral
   * term was removed here. Collateral now comes only from hits-you-take and
   * time-in-combat (see updateCombat).
   */
  private spawnDeathExplosion(position: THREE.Vector3, scale: number): void {
    this.particles.spawnExplosion(position, scale)
  }

  /** The limb slots the player lost this fight (core excluded — that IS the death),
   *  handed to onPlayerDefeated so the host strips them into damaged repair debt. */
  private playerDestroyedLimbs(player: MechEntity): MechSlot[] {
    return [...player.destroyedSlots].filter((s) => s !== 'core')
  }

  /**
   * Emit a distance-tapered collateral severity toward the town centre. No-op
   * when there is no listener, the severity is non-positive, or the impact is
   * outside COLLATERAL_RADIUS. The emitter feeds raw severity from the §3.5
   * contract (hits-taken / combat-time); the host applies the condition-per-
   * severity coefficient.
   */
  private emitCollateral(position: THREE.Vector3, severity: number): void {
    if (!this.onCollateral || severity <= 0) return
    const dx = position.x - this.anchor.x
    const dz = position.z - this.anchor.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    const proximity = 1 - dist / COLLATERAL_RADIUS
    if (proximity <= 0) return
    this.onCollateral(severity * proximity, position.clone())
  }

  private nearestEnemyTo(player: MechEntity): CombatEnemy | null {
    let best: CombatEnemy | null = null
    let bestSq = Infinity
    for (const e of this.enemies) {
      if (e.mech.isDestroyed) continue
      const d = e.mech.position.distanceToSquared(player.position)
      if (d < bestSq) {
        bestSq = d
        best = e
      }
    }
    return best
  }

  /** Per-arm aim: if a free aim dir is given use it, else lead toward the
   *  nearest enemy's core from the arm muzzle (auto-aim assist for roaming). */
  private armAim(player: MechEntity, arm: 'left' | 'right', freeAim: THREE.Vector3): THREE.Vector3 {
    const target = this.nearestEnemyTo(player)
    if (!target) return freeAim
    const muzzle = player.getArmPosition(arm)
    const to = target.mech.getCorePosition().sub(muzzle)
    // Only auto-aim when the player is roughly facing the target (so free look
    // still matters); otherwise honour the free aim direction.
    if (to.lengthSq() < 1e-4) return freeAim
    const dir = to.normalize()
    if (dir.dot(freeAim) > 0.3) {
      const spread = 0.02
      dir.x += (Math.random() - 0.5) * spread
      dir.y += (Math.random() - 0.5) * spread
      dir.z += (Math.random() - 0.5) * spread
      return dir.normalize()
    }
    return freeAim
  }

  private spawnMuzzle(player: MechEntity, arm: 'left' | 'right', aim: THREE.Vector3): void {
    const part = arm === 'left' ? player.loadout.leftArm : player.loadout.rightArm
    const rawType = part?.weaponType ?? 'ballistic'
    let fxType: 'ballistic' | 'energy' | 'missile'
    if (rawType === 'energy') fxType = 'energy'
    else if (rawType === 'missile') fxType = 'missile'
    else fxType = 'ballistic'
    this.particles.spawnMuzzleFlash(player.getArmPosition(arm), fxType, aim)
  }

  cleanup(): void {
    this.abort()
  }
}
