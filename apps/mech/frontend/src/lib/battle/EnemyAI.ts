import * as THREE from 'three'
import type { MechEntity } from './MechEntity'
import { JUMP_VELOCITY_BASE, JUMP_VELOCITY_JETS } from './constants'
import type { AIDifficulty } from '../../composables/useGameSettings'

/** Top-speed multiplier for a stranded (legs-destroyed) mech (mirrors PhysicsSystem). */
const LEGS_DESTROYED_SPEED_MULT = 0.4

type AIState = 'flank' | 'retreat' | 'aggressive' | 'chase'

/**
 * Lightweight description of a hostile projectile the AI can react to. The scene
 * feeds these each frame (single-player only) so the AI can dodge incoming fire.
 */
export interface IncomingThreat {
  position: THREE.Vector3
  velocity: THREE.Vector3
}

/**
 * Per-difficulty behaviour profile. These change HOW the AI plays, not just its
 * raw numbers: reaction time, evasion frequency, strafe aggression, range
 * discipline, fire-rate, aim skill and whether it kites or brawls.
 */
interface DifficultyProfile {
  /** 0..1 — drives the aim-error cone (1 = near-perfect leading). */
  aimSkill: number
  /** Seconds the AI takes to react to threats (higher = sloppier). */
  reactionTime: number
  /** 0..1 — how often it actively dodges incoming fire. */
  evadeFrequency: number
  /** Multiplier on strafe blend — higher = more aggressive juking. */
  strafeAggression: number
  /** Preferred engagement range; the AI keeps discipline around it. */
  optimalRange: number
  /** Tolerance band around optimalRange before it adjusts distance. */
  rangeDiscipline: number
  /** Multiplier on fire chance per frame. */
  fireRateMult: number
  /** 'kite' keeps distance and pokes; 'brawl' closes and pressures. */
  combatStyle: 'kite' | 'brawl' | 'balanced'
  /** Multiplier on how much the AI leads its shots (0 = no lead). */
  leadFactor: number
}

const DIFFICULTY_PROFILES: Record<AIDifficulty, DifficultyProfile> = {
  tutorial: {
    aimSkill: 0.15,
    reactionTime: 0.7,
    evadeFrequency: 0.1,
    strafeAggression: 0.4,
    optimalRange: 18,
    rangeDiscipline: 14,
    fireRateMult: 0.9,
    combatStyle: 'balanced',
    leadFactor: 0.2,
  },
  easy: {
    aimSkill: 0.35,
    reactionTime: 0.45,
    evadeFrequency: 0.3,
    strafeAggression: 0.7,
    optimalRange: 16,
    rangeDiscipline: 10,
    fireRateMult: 1.2,
    combatStyle: 'balanced',
    leadFactor: 0.5,
  },
  medium: {
    aimSkill: 0.55,
    reactionTime: 0.3,
    evadeFrequency: 0.5,
    strafeAggression: 1.0,
    optimalRange: 15,
    rangeDiscipline: 8,
    fireRateMult: 1.5,
    combatStyle: 'balanced',
    leadFactor: 0.75,
  },
  hard: {
    aimSkill: 0.78,
    reactionTime: 0.18,
    evadeFrequency: 0.7,
    strafeAggression: 1.3,
    optimalRange: 14,
    rangeDiscipline: 6,
    fireRateMult: 1.9,
    combatStyle: 'kite',
    leadFactor: 0.9,
  },
  boss: {
    aimSkill: 0.95,
    reactionTime: 0.08,
    evadeFrequency: 0.9,
    strafeAggression: 1.6,
    optimalRange: 16,
    rangeDiscipline: 5,
    fireRateMult: 2.3,
    combatStyle: 'kite',
    leadFactor: 1.0,
  },
}

/**
 * Enemy archetypes (GRINDER §3.6). These are pure DATA rows mapped onto the
 * existing DifficultyProfile fields — no new AI code. They give the squad
 * combat of later phases distinct "roles" by re-weighting the same knobs the
 * difficulty ladder already uses (range discipline, dodge frequency, lead,
 * aim skill, combat style). Loadout (hover/tracked/quad + weapon) is assigned
 * by the enemy generator, not here; this only shapes behaviour.
 *
 *  - skirmisher: fast hover kiter, high dodge, harasses at range.
 *  - line:       balanced bipedal grunt, the baseline pressure unit.
 *  - bulwark:    tracked brawler wall — low dodge, high aim, closes and grinds.
 *  - sniper:     extreme-range shot-leader (the "lancer") — big aimed shots,
 *                low cadence, kites hard; the reason to want cover / smoke.
 *  - ace:        named-pilot boss profile (Kestrel / Kass), mixed loadout.
 */
export type EnemyArchetype = 'skirmisher' | 'line' | 'bulwark' | 'sniper' | 'ace'

export const ARCHETYPE_PROFILES: Record<EnemyArchetype, DifficultyProfile> = {
  skirmisher: {
    aimSkill: 0.5,
    reactionTime: 0.2,
    evadeFrequency: 0.85,
    strafeAggression: 1.5,
    optimalRange: 20,
    rangeDiscipline: 8,
    fireRateMult: 1.6,
    combatStyle: 'kite',
    leadFactor: 0.7,
  },
  line: {
    aimSkill: 0.55,
    reactionTime: 0.3,
    evadeFrequency: 0.45,
    strafeAggression: 1.0,
    optimalRange: 15,
    rangeDiscipline: 8,
    fireRateMult: 1.4,
    combatStyle: 'balanced',
    leadFactor: 0.6,
  },
  bulwark: {
    aimSkill: 0.8,
    reactionTime: 0.25,
    evadeFrequency: 0.15,
    strafeAggression: 0.5,
    optimalRange: 10,
    rangeDiscipline: 6,
    fireRateMult: 1.3,
    combatStyle: 'brawl',
    leadFactor: 0.5,
  },
  sniper: {
    aimSkill: 0.9,
    reactionTime: 0.2,
    evadeFrequency: 0.4,
    strafeAggression: 0.7,
    optimalRange: 34,
    rangeDiscipline: 10,
    fireRateMult: 0.6,
    combatStyle: 'kite',
    leadFactor: 1.0,
  },
  ace: {
    aimSkill: 0.95,
    reactionTime: 0.08,
    evadeFrequency: 0.9,
    strafeAggression: 1.6,
    optimalRange: 16,
    rangeDiscipline: 5,
    fireRateMult: 2.3,
    combatStyle: 'kite',
    leadFactor: 1.0,
  },
}

// --- Module-level scratch vectors (perf) ---
// Dodge detection and steering run every frame for every enemy; reusing these
// avoids hundreds of Vector3 allocations per frame (pure GC churn). All maths
// here is synchronous and per-call, so sharing across instances is safe —
// values never escape a call except via an explicit .copy() into caller state.
// Each register is used by exactly one site; never alias two within a call.
const _enemyCenter = new THREE.Vector3()
const _rel = new THREE.Vector3()
const _vDir = new THREE.Vector3()
const _closestPoint = new THREE.Vector3()
const _perp = new THREE.Vector3()
const _offset = new THREE.Vector3()
const _bestDodge = new THREE.Vector3()
const _instantVel = new THREE.Vector3()
const _dirToPlayer = new THREE.Vector3()
const _strafeVec = new THREE.Vector3()
const _combatDir = new THREE.Vector3()
const _toWaypoint = new THREE.Vector3()
const _waypointDir = new THREE.Vector3()
const _desiredDir = new THREE.Vector3()
const _playerLookDir = new THREE.Vector3()
const _playerToEnemy = new THREE.Vector3()

// Squared-distance prefilter for dodge detection. Any threat that can pass the
// detailed checks (along <= 60, miss <= 4) is within sqrt(60² + 4²) ≈ 60.13u,
// so gating at 61u skips the closest-approach math for far threats without
// changing behaviour.
const MAX_THREAT_DIST_SQ = 61 * 61

export class EnemyAI {
  private state: AIState = 'flank'
  private strafeDir: number = 1
  private strafeDirTimer: number = 2 + Math.random() * 2

  // Arena bounds — set by BattleScene to match the actual map
  private arenaHalf: number = 100

  // Waypoint roaming — pick spots around the arena to keep moving
  private waypoint: THREE.Vector3 = new THREE.Vector3()
  private waypointTimer: number = 0

  // Jump cooldown — only jump evasively, not constantly
  private jumpCooldown: number = 6 + Math.random() * 4

  // Difficulty profile (mutable via setDifficulty)
  private profile: DifficultyProfile = DIFFICULTY_PROFILES.medium
  private difficulty: AIDifficulty = 'medium'

  // Reaction-delay accumulator for dodging. The AI only commits to an evasive
  // manoeuvre after observing a threat for `reactionTime` seconds.
  private threatReactTimer: number = 0
  // Short-lived sidestep impulse direction when actively dodging.
  private dodgeDir: THREE.Vector3 = new THREE.Vector3()
  private dodgeTimer: number = 0

  // Incoming hostile projectiles for this frame (set by feedThreats).
  private threats: IncomingThreat[] = []

  // Estimated player velocity for shot leading (smoothed).
  private lastPlayerPos: THREE.Vector3 | null = null
  private playerVelEstimate: THREE.Vector3 = new THREE.Vector3()

  constructor(difficulty: AIDifficulty = 'medium') {
    this.setDifficulty(difficulty)
    this.pickNewWaypoint(new THREE.Vector3())
  }

  setDifficulty(difficulty: AIDifficulty): void {
    this.difficulty = difficulty
    this.profile = DIFFICULTY_PROFILES[difficulty] ?? DIFFICULTY_PROFILES.medium
  }

  /**
   * Adopt an archetype behaviour profile (§3.6). Additive to setDifficulty —
   * the caller (enemy generator / StoryCombat) picks whichever it wants as the
   * source of this AI's DifficultyProfile. No behaviour code changes; only the
   * profile knobs swap.
   */
  setArchetype(archetype: EnemyArchetype): void {
    this.profile = ARCHETYPE_PROFILES[archetype] ?? DIFFICULTY_PROFILES.medium
  }

  setArenaBounds(halfWidth: number, halfDepth: number): void {
    this.arenaHalf = Math.min(halfWidth, halfDepth)
  }

  /**
   * Feed the AI the hostile projectiles in flight this frame so it can react.
   * Single-player only; multiplayer netcode never calls this.
   */
  feedThreats(threats: IncomingThreat[]): void {
    this.threats = threats
  }

  /**
   * Aim point the enemy should fire at, accounting for player velocity leading
   * and an aim-error cone inversely proportional to aimSkill. Exposed so the
   * scene can fire at a realistic intercept instead of the player's current
   * position. Returns a world-space target point.
   */
  computeAimPoint(enemy: MechEntity, player: MechEntity, projectileSpeed: number): THREE.Vector3 {
    const target = player.getCorePosition()
    const spawn = enemy.getArmPosition('right')

    // --- Leading: solve for intercept time using estimated player velocity. ---
    const lead = this.profile.leadFactor
    let aimPoint = target.clone()
    if (lead > 0 && projectileSpeed > 0) {
      const toTarget = target.clone().sub(spawn)
      const dist = toTarget.length()
      // First-order intercept: t ≈ distance / projectileSpeed, then project the
      // target forward along its velocity. Scaled by leadFactor so weaker AIs
      // under-lead.
      const interceptTime = (dist / projectileSpeed) * lead
      aimPoint = target.clone().add(this.playerVelEstimate.clone().multiplyScalar(interceptTime))
    }

    // --- Aim-error cone inversely proportional to aimSkill. ---
    const dir = aimPoint.clone().sub(spawn).normalize()
    // At aimSkill 1 -> ~0 spread; at 0 -> ~0.18 rad cone half-angle.
    const maxConeRad = 0.18
    let coneHalf = maxConeRad * (1 - this.profile.aimSkill)
    // Smoke screen (design §3.4): a target hidden in smoke is much harder to
    // hit — widen the aim-error cone substantially while its screen is active.
    if (player.smokeScreenTimer > 0) coneHalf += 0.22
    if (coneHalf > 0) {
      // Random small rotation off the perfect direction (random axis + angle).
      const axis = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5,
      ).normalize()
      const angle = (Math.random() ** 1.5) * coneHalf // bias toward smaller errors
      dir.applyAxisAngle(axis, angle)
    }

    const aimDist = aimPoint.distanceTo(spawn)
    return spawn.clone().add(dir.multiplyScalar(aimDist))
  }

  private pickNewWaypoint(_currentPos: THREE.Vector3): void {
    // Pick a random point spread across most of the arena
    const angle = Math.random() * Math.PI * 2
    const dist = this.arenaHalf * 0.4 + Math.random() * this.arenaHalf * 0.5
    this.waypoint.set(
      Math.cos(angle) * dist,
      0,
      Math.sin(angle) * dist,
    )
    // Hold waypoint for 3–6 seconds before picking a new one
    this.waypointTimer = 3 + Math.random() * 3
  }

  /**
   * Detects whether any incoming projectile is on an intercept course with the
   * enemy and, if so, returns a sidestep direction perpendicular to the threat.
   * Returns null when nothing dangerous is inbound.
   */
  private detectIncomingDodge(enemy: MechEntity): THREE.Vector3 | null {
    if (this.threats.length === 0) return null

    const enemyCenter = _enemyCenter.copy(enemy.position)
    enemyCenter.y += 2.5

    let bestCloseness = -1

    for (const threat of this.threats) {
      const rel = _rel.subVectors(enemyCenter, threat.position)
      // Cheap early-out: too far away to possibly pass the checks below.
      if (rel.lengthSq() > MAX_THREAT_DIST_SQ) continue
      if (threat.velocity.lengthSq() < 0.0001) continue
      const vDir = _vDir.copy(threat.velocity).normalize()

      // Only consider projectiles heading roughly toward us.
      const along = rel.dot(vDir)
      if (along <= 0 || along > 60) continue // behind us or too far

      // Perpendicular miss distance (how close the projectile passes).
      // (Distinct scratch from vDir — vDir is still needed for perp below.)
      const closestPoint = _closestPoint.copy(vDir).multiplyScalar(along).add(threat.position)
      const miss = closestPoint.distanceTo(enemyCenter)
      if (miss > 4) continue // will miss comfortably

      // Sidestep perpendicular to the incoming direction (flat).
      const perp = _perp.set(-vDir.z, 0, vDir.x).normalize()
      // Choose the side that moves away from the projectile path.
      const offset = _offset.subVectors(enemyCenter, closestPoint)
      if (offset.dot(perp) < 0) perp.multiplyScalar(-1)

      const closeness = 1 - miss / 4
      if (closeness > bestCloseness) {
        bestCloseness = closeness
        _bestDodge.copy(perp)
      }
    }

    // Returns a shared scratch vector — the sole caller (update) copies it
    // immediately; callers must never retain the reference across frames.
    return bestCloseness >= 0 ? _bestDodge : null
  }

  /**
   * Updates enemy AI and returns whether the enemy should fire this frame.
   */
  update(enemy: MechEntity, player: MechEntity, deltaTime: number): boolean {
    const distanceToPlayer = enemy.position.distanceTo(player.position)
    const optimalRange = this.profile.optimalRange

    // --- Estimate player velocity (for leading) from frame-to-frame movement. ---
    if (this.lastPlayerPos && deltaTime > 0) {
      const instantVel = _instantVel.subVectors(player.position, this.lastPlayerPos).divideScalar(deltaTime)
      // Smooth to reduce jitter.
      this.playerVelEstimate.lerp(instantVel, 0.4)
    }
    if (this.lastPlayerPos) this.lastPlayerPos.copy(player.position)
    else this.lastPlayerPos = player.position.clone()

    // Direction to player (flat)
    const dirToPlayer = _dirToPlayer.subVectors(player.position, enemy.position)
    dirToPlayer.y = 0
    dirToPlayer.normalize()

    // Face player
    enemy.rotation.y = Math.atan2(dirToPlayer.x, dirToPlayer.z)

    // Health-based state selection — combat style biases the thresholds.
    const enemyHealthPct = enemy.stats.currentHealth / enemy.stats.maxHealth
    const playerHealthPct = player.stats.currentHealth / player.stats.maxHealth
    const band = this.profile.rangeDiscipline

    if (enemyHealthPct < 0.3) {
      this.state = 'retreat'
    } else if (playerHealthPct < 0.3 && this.profile.combatStyle !== 'kite') {
      this.state = 'aggressive'
    } else if (this.profile.combatStyle === 'kite' && distanceToPlayer < optimalRange - band) {
      // Kiters back off when the player gets inside their preferred range.
      this.state = 'retreat'
    } else if (distanceToPlayer > optimalRange + band) {
      this.state = 'chase'
    } else if (this.profile.combatStyle === 'brawl') {
      this.state = 'aggressive'
    } else {
      this.state = 'flank'
    }

    // Delimb consequence (design §3.3): a stranded mech (legs shot off) can't
    // kite — it can barely move. Drop the retreat intent so it holds ground and
    // keeps firing instead of vainly trying to back off; the speed cap below is
    // slashed to match, and the evasive jump is disabled further down.
    if (enemy.legsDestroyed && this.state === 'retreat') {
      this.state = 'flank'
    }

    // Strafe direction — flip every 2–4 seconds (faster for aggressive profiles)
    this.strafeDirTimer -= deltaTime
    if (this.strafeDirTimer <= 0) {
      this.strafeDir *= -1
      const baseHold = 2 + Math.random() * 2
      this.strafeDirTimer = baseHold / Math.max(0.5, this.profile.strafeAggression)
    }

    // Waypoint roaming — tick down and pick a new destination periodically
    this.waypointTimer -= deltaTime
    if (this.waypointTimer <= 0) {
      this.pickNewWaypoint(enemy.position)
    }

    // Approximate player locomotion: same steady-state top speed formula, with
    // an acceleration in the ballpark of the player's weight-class curve
    // (PhysicsSystem now tunes accel per weight class; enemies keep a simple
    // single accel so their behaviour tuning stays independent and stable).
    const speedStat = Math.max(10, enemy.stats.speed) / 100
    const weightFactor = enemy.weightPenalty
    // Strand a delimbed mech: legs gone ⇒ 40% top speed (mirrors PhysicsSystem's
    // LEGS_DESTROYED_SPEED_MULT for the player, design §3.3).
    const strandMult = enemy.legsDestroyed ? LEGS_DESTROYED_SPEED_MULT : 1
    const maxSpeed = 8 * speedStat * weightFactor * strandMult
    const accel = 60 * weightFactor // units/s²

    const strafeVec = _strafeVec.set(-dirToPlayer.z, 0, dirToPlayer.x)
      .multiplyScalar(this.strafeDir)

    // Compute a desired move direction that blends combat intent with roaming
    const combatDir = _combatDir.set(0, 0, 0)

    switch (this.state) {
      case 'chase': {
        combatDir.copy(dirToPlayer)
        break
      }
      case 'flank': {
        const closingBias = distanceToPlayer > optimalRange ? 0.3 : -0.2
        combatDir.copy(strafeVec)
          .addScaledVector(dirToPlayer, closingBias)
          .normalize()
        break
      }
      case 'retreat': {
        combatDir.copy(strafeVec)
          .addScaledVector(dirToPlayer, -0.7)
          .normalize()
        break
      }
      case 'aggressive': {
        combatDir.copy(dirToPlayer)
          .addScaledVector(strafeVec, 0.3 * this.profile.strafeAggression)
          .normalize()
        break
      }
    }

    // --- Reactive dodging: react to incoming fire after a reaction delay. ---
    const dodge = this.detectIncomingDodge(enemy)
    if (dodge) {
      this.threatReactTimer += deltaTime
      // Commit to a dodge once the reaction delay elapses and a random roll
      // (scaled by evadeFrequency) passes.
      if (this.threatReactTimer >= this.profile.reactionTime && this.dodgeTimer <= 0) {
        if (Math.random() < this.profile.evadeFrequency) {
          this.dodgeDir.copy(dodge)
          this.dodgeTimer = 0.4
        }
        this.threatReactTimer = 0
      }
    } else {
      this.threatReactTimer = Math.max(0, this.threatReactTimer - deltaTime)
    }

    // Direction toward the current roam waypoint
    const toWaypoint = _toWaypoint.subVectors(this.waypoint, enemy.position)
    toWaypoint.y = 0
    const distToWaypoint = toWaypoint.length()
    const waypointDir = distToWaypoint > 0.5
      ? _waypointDir.copy(toWaypoint).normalize()
      : _waypointDir.set(0, 0, 0)

    // Blend: combat-heavy when engaged, waypoint-heavy when at ideal range
    // This ensures the AI keeps moving around the map even while fighting
    const roamBlend = this.state === 'chase' ? 0.2 : 0.5
    const desiredDir = _desiredDir.copy(combatDir)
      .multiplyScalar(1 - roamBlend)
      .addScaledVector(waypointDir, roamBlend)

    // Active dodge overrides the blend with a strong sidestep impulse.
    if (this.dodgeTimer > 0) {
      this.dodgeTimer -= deltaTime
      desiredDir.addScaledVector(this.dodgeDir, 2.5 * this.profile.strafeAggression)
    }

    if (desiredDir.lengthSq() > 0.001) desiredDir.normalize()

    // Accelerate toward desired direction (horizontal only)
    enemy.velocity.x += desiredDir.x * accel * deltaTime
    enemy.velocity.z += desiredDir.z * accel * deltaTime

    // Clamp horizontal speed
    const hSpeed = Math.sqrt(enemy.velocity.x ** 2 + enemy.velocity.z ** 2)
    const speedMult = this.state === 'retreat' ? 1.2 : this.state === 'aggressive' ? 1.15 : 1.0
    const cap = maxSpeed * speedMult
    if (hSpeed > cap) {
      enemy.velocity.x = (enemy.velocity.x / hSpeed) * cap
      enemy.velocity.z = (enemy.velocity.z / hSpeed) * cap
    }

    // --- Evasive jump ---
    // Jump when the player is close and aiming at us, when retreating, or to
    // leap over an imminent incoming shot (scaled by evadeFrequency).
    this.jumpCooldown -= deltaTime
    if (this.jumpCooldown <= 0 && !enemy.isJumping && !enemy.legsDestroyed) {
      // Estimate if player is aimed toward us
      const playerLookDir = _playerLookDir.set(
        Math.sin(player.rotation.y),
        0,
        Math.cos(player.rotation.y),
      )
      const playerToEnemy = _playerToEnemy.subVectors(enemy.position, player.position)
      playerToEnemy.y = 0
      playerToEnemy.normalize()
      const aimDot = playerLookDir.dot(playerToEnemy)

      const isBeingAimedAt = aimDot > 0.85 && distanceToPlayer < 15
      const isRetreating = this.state === 'retreat' && distanceToPlayer < 20
      const dodgeJump = dodge !== null && Math.random() < this.profile.evadeFrequency * 0.5

      if (isBeingAimedAt || isRetreating || dodgeJump) {
        const hasJumpJets = enemy.loadout.rack?.id === 'rack-jump-jets'
        enemy.velocity.y = hasJumpJets ? JUMP_VELOCITY_JETS * enemy.weightPenalty : JUMP_VELOCITY_BASE * enemy.weightPenalty
        enemy.isJumping = true
      }

      // Reset cooldown whether we jumped or not. Tighter AIs check more often.
      const baseCd = 6 + Math.random() * 4
      this.jumpCooldown = baseCd * (0.5 + (1 - this.profile.evadeFrequency) * 0.5)
    }

    // Gravity and landing
    if (enemy.position.y > 0 || enemy.velocity.y > 0) {
      enemy.velocity.y -= 50 * deltaTime
      enemy.position.y += enemy.velocity.y * deltaTime
    }
    if (enemy.position.y <= 0) {
      enemy.position.y = 0
      enemy.velocity.y = 0
      enemy.isJumping = false
    }

    // Apply horizontal movement
    enemy.position.x += enemy.velocity.x * deltaTime
    enemy.position.z += enemy.velocity.z * deltaTime

    // Frame-rate independent friction
    const friction = Math.exp(-6 * deltaTime)
    enemy.velocity.x *= friction
    enemy.velocity.z *= friction

    // Arena bounds
    enemy.position.x = Math.max(-this.arenaHalf, Math.min(this.arenaHalf, enemy.position.x))
    enemy.position.z = Math.max(-this.arenaHalf, Math.min(this.arenaHalf, enemy.position.z))

    // Fire decision — accuracy stat AND difficulty fire-rate both gate firing.
    let fireRateMult = this.profile.fireRateMult
    if (this.state === 'aggressive') fireRateMult *= 1.4
    if (this.state === 'retreat') fireRateMult *= 0.7

    // Better aim skill also lets the AI hold fire for cleaner shots (only shoot
    // when the player is reasonably within the firing arc at higher skill).
    let fireChance = (enemy.stats.accuracy / 100) * deltaTime * fireRateMult
    // Smoke screen also makes the AI hold fire more often (loss of a clean lock).
    if (player.smokeScreenTimer > 0) fireChance *= 0.4
    return Math.random() < fireChance && distanceToPlayer < 30
  }
}
