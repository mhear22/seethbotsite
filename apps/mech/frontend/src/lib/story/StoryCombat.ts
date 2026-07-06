import * as THREE from 'three'
import { markRaw } from 'vue'
import { MechEntity, type CombatStats } from '../battle/MechEntity'
import { EnemyAI } from '../battle/EnemyAI'
import { ProjectileSystem } from '../battle/ProjectileSystem'
import { ParticleSystem } from '../battle/ParticleSystem'
import { ARM_PARTS, CORE_PARTS, LEGS_PARTS, HEAD_PARTS, RACK_PARTS } from '../../shared/data/MechParts'
import type { MechLoadout } from '../../composables/useMechBuilder'
import type { AIDifficulty } from '../../composables/useGameSettings'
import type { QuestDef } from './quests'

/**
 * Per-enemy bundle: the mech, its own AI brain, and its weapon cooldowns. Each
 * enemy in a wave gets an independent AI so they can flank/strafe separately.
 */
interface CombatEnemy {
  mech: MechEntity
  ai: EnemyAI
  lastShot: number
}

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

/** Base difficulty stat archetypes (mirrors useMechBattle.generateEnemy). */
const DIFFICULTY_STATS: Record<AIDifficulty, CombatStats> = {
  tutorial: { maxHealth: 150, currentHealth: 150, armor: 10, speed: 60, firepower: 25, accuracy: 30, energy: 50 },
  easy: { maxHealth: 200, currentHealth: 200, armor: 15, speed: 80, firepower: 30, accuracy: 40, energy: 60 },
  medium: { maxHealth: 300, currentHealth: 300, armor: 25, speed: 70, firepower: 45, accuracy: 50, energy: 80 },
  hard: { maxHealth: 400, currentHealth: 400, armor: 35, speed: 60, firepower: 60, accuracy: 60, energy: 100 },
  boss: { maxHealth: 600, currentHealth: 600, armor: 45, speed: 70, firepower: 80, accuracy: 70, energy: 120 },
}

/** Loadout part indices per difficulty (mirrors useMechBattle.generateEnemy). */
const DIFFICULTY_LOADOUT: Record<AIDifficulty, { arm: number; core: number; legs: number; head: number; rack: number }> = {
  tutorial: { arm: 0, core: 0, legs: 0, head: 0, rack: 0 },
  easy: { arm: 0, core: 2, legs: 0, head: 3, rack: 2 },
  medium: { arm: 1, core: 0, legs: 1, head: 1, rack: 1 },
  hard: { arm: 3, core: 1, legs: 3, head: 2, rack: 3 },
  boss: { arm: 1, core: 1, legs: 1, head: 1, rack: 2 },
}

function enemyLoadout(difficulty: AIDifficulty): MechLoadout {
  const idx = DIFFICULTY_LOADOUT[difficulty] ?? DIFFICULTY_LOADOUT.tutorial
  return {
    leftArm: ARM_PARTS[idx.arm] ?? ARM_PARTS[0],
    rightArm: ARM_PARTS[idx.arm] ?? ARM_PARTS[0],
    core: CORE_PARTS[idx.core] ?? CORE_PARTS[0],
    legs: LEGS_PARTS[idx.legs] ?? LEGS_PARTS[0],
    head: HEAD_PARTS[idx.head] ?? HEAD_PARTS[0],
    rack: RACK_PARTS[idx.rack] ?? RACK_PARTS[0],
  }
}

function scaledStats(difficulty: AIDifficulty, scale: number): CombatStats {
  const base = DIFFICULTY_STATS[difficulty] ?? DIFFICULTY_STATS.tutorial
  if (scale === 1) return { ...base }
  return {
    maxHealth: Math.round(base.maxHealth * scale),
    currentHealth: Math.round(base.maxHealth * scale),
    armor: Math.round(base.armor * scale),
    speed: base.speed,
    firepower: Math.round(base.firepower * scale),
    accuracy: Math.min(95, Math.round(base.accuracy * scale)),
    energy: Math.round(base.energy * scale),
  }
}

/** Projectile speed for a weapon part (mirrors BattleScene.getWeaponProjectileSpeed). */
function weaponProjectileSpeed(weaponType?: string, _partId?: string): number {
  if (weaponType === 'energy') return 400
  if (weaponType === 'missile') return 200 // matches arm-missile-pod's projectileSpeed
  return 300
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
  private waveBatchTimer = 0
  private clearedCount = 0
  private totalCount = 0

  private elapsed = 0

  // Player firing cooldowns (the world drives player firing through us so the
  // single combat path matches BattleScene's dual-arm logic).
  private lastLeftShot = 0
  private lastRightShot = 0

  /** Fired when the encounter is fully complete (all enemies dead / object got). */
  onComplete?: (quest: QuestDef) => void
  /** Fired when the player mech is destroyed during an encounter. */
  onPlayerDefeated?: () => void
  /** Camera shake hook (host wires CameraController.triggerShake). */
  onShake?: (amount: number) => void

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

    if (quest.type === 'hidden_object') {
      this.totalCount = 1
      this.spawnHiddenObject(quest)
    } else if (quest.type === 'boss_hunt') {
      this.totalCount = 1
      this.spawnEnemy('boss', quest.bossScale ?? 1, 0)
    } else {
      // wave_defence: queue N enemies, spawn the first batch.
      const n = quest.waveCount ?? 3
      this.totalCount = n
      this.waveSpawnQueue = n
      this.waveDifficulty = quest.difficulty ?? 'easy'
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

  private spawnEnemy(difficulty: AIDifficulty, scale: number, index: number): void {
    const stats = scaledStats(difficulty, scale)
    const loadout = enemyLoadout(difficulty)
    const spawn = this.randomRingPoint(30, 45)
    const isBoss = difficulty === 'boss'
    const name = isBoss ? 'Town Bully' : `Raider ${index + 1}`
    const mech = new MechEntity(`story-enemy-${this.elapsed}-${index}-${Math.random().toString(36).slice(2, 6)}`,
      name, loadout, stats, false, spawn)
    // Face the town centre.
    const toCenter = this.anchor.clone().sub(spawn)
    mech.rotation.y = Math.atan2(toCenter.x, toCenter.z)

    const ai = new EnemyAI(difficulty)
    ai.setArenaBounds(this.arenaHalf, this.arenaHalf)

    this.scene.add(mech.mesh)
    this.enemies.push({ mech, ai, lastShot: 0 })
  }

  private spawnWaveBatch(): void {
    // Keep at most ~2 enemies alive at once for readability; refill from queue.
    const maxAlive = 2
    while (this.enemies.length < maxAlive && this.waveSpawnQueue > 0) {
      const idx = this.totalCount - this.waveSpawnQueue
      // Later enemies in the wave scale up slightly.
      const scale = 1 + idx * 0.1
      this.spawnEnemy(this.waveDifficulty, scale, idx)
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
        const armPart = e.mech.loadout.rightArm ?? e.mech.loadout.leftArm
        const projSpeed = weaponProjectileSpeed(armPart?.weaponType, armPart?.id)
        const aimPoint = e.ai.computeAimPoint(e.mech, player, projSpeed)
        const dir = aimPoint.sub(e.mech.getArmPosition('right')).normalize()
        this.projectiles.fireWeapon(e.mech, dir, 'right', player)
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
      })
      const impact = hit.target.position.clone()
      impact.y += 1.5
      this.particles.spawnHitEffect(impact, hit.projectile.type)
      this.particles.spawnImpactSparks(impact, hit.projectile.velocity.clone().normalize(), 'mech')
      this.projectiles.removeProjectile(hit.projectile)

      if (hit.target === player) {
        this.onShake?.(0.4)
      } else {
        this.onShake?.(Math.min(0.4, 0.1 + hit.projectile.damage * 0.01))
      }

      if (defeated) {
        this.particles.spawnExplosion(hit.target.position.clone(), 1.8)
        this.onShake?.(1.0)
        hit.target.isDestroyed = true
        if (hit.target === player) {
          this.onPlayerDefeated?.()
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
      this.particles.spawnExplosion(player.position.clone(), 1.8)
      this.onShake?.(1.0)
      this.onPlayerDefeated?.()
      this.abort()
      return
    }

    // --- Remove dead enemies, refill wave, check completion ---
    const stillAlive: CombatEnemy[] = []
    for (const e of this.enemies) {
      // A burn-out (currentHealth <= 0 with no explosion yet) counts as a kill.
      if (!e.mech.isDestroyed && e.mech.stats.currentHealth <= 0) {
        e.mech.isDestroyed = true
        this.particles.spawnExplosion(e.mech.position.clone(), 1.8)
      }
      if (e.mech.isDestroyed) {
        this.scene.remove(e.mech.mesh)
        e.mech.cleanup()
        this.clearedCount++
      } else {
        stillAlive.push(e)
      }
    }
    this.enemies = stillAlive

    // Wave: refill from the queue if a slot opened.
    if (this.quest.type === 'wave_defence' && this.waveSpawnQueue > 0) {
      this.waveBatchTimer -= deltaTime
      if (this.enemies.length < 2 && this.waveBatchTimer <= 0) {
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
