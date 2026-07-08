/**
 * ServerEnemyAI — pure, DB-free, DETERMINISTIC server-side mech AI.
 *
 * Ported from the client single-player AI
 * (apps/mech/frontend/src/lib/battle/EnemyAI.ts) to run against the
 * authoritative server state (PlayerState / MechEntity). It owns the AI mech's
 * movement decision (it mutates the AI mech's velocity/position the same way
 * MatchInstance.updatePlayerPhysics mutates a player) plus a per-tick fire
 * decision with projectile-leading aim.
 *
 * Determinism: ALL randomness flows through an injected SeededRNG. There is NO
 * Math.random() and NO Date.now(); time is the per-tick deltaTime fed in by the
 * caller. Identical seed + identical state stream => identical behaviour.
 *
 * No prisma / DB / network imports — safe to unit-test standalone.
 */

import type { PlayerState, MechLoadout, AIDifficultyTier } from '../shared/types/NetworkMessages';
import { MECH, PHYSICS, COMBAT } from '../shared/constants/GameConstants';
import { SeededRNG } from './SeededRNG';

type AIBehaviorState = 'flank' | 'retreat' | 'aggressive' | 'chase';

/** A hostile projectile the AI may react to (subset of ProjectileState). */
export interface AIThreat {
  position: [number, number, number];
  velocity: [number, number, number];
}

/** A potential target (a human player) the AI can engage. */
export interface AITargetView {
  id: string;
  state: PlayerState;
}

/** Per-tick output: a synthetic movement intent + optional fire command. */
export interface AIDecision {
  /** Whether to fire this tick. */
  fire: boolean;
  /**
   * World-space aim direction (normalized) when firing. Mirrors the
   * PlayerInput.aimDirection the server already understands. Undefined if not
   * firing.
   */
  aimDirection?: { x: number; y: number; z: number };
  /** Muzzle/spawn position the projectile should originate from. */
  muzzlePosition?: [number, number, number];
}

interface DifficultyProfile {
  aimSkill: number;
  reactionTime: number;
  evadeFrequency: number;
  strafeAggression: number;
  optimalRange: number;
  rangeDiscipline: number;
  fireRateMult: number;
  combatStyle: 'kite' | 'brawl' | 'balanced';
  leadFactor: number;
  /** Base per-second fire chance (replaces the client's accuracy stat gate). */
  baseFireRate: number;
}

const DIFFICULTY_PROFILES: Record<AIDifficultyTier, DifficultyProfile> = {
  tutorial: {
    aimSkill: 0.15, reactionTime: 0.7, evadeFrequency: 0.1, strafeAggression: 0.4,
    optimalRange: 18, rangeDiscipline: 14, fireRateMult: 0.9, combatStyle: 'balanced',
    leadFactor: 0.2, baseFireRate: 0.9,
  },
  easy: {
    aimSkill: 0.35, reactionTime: 0.45, evadeFrequency: 0.3, strafeAggression: 0.7,
    optimalRange: 16, rangeDiscipline: 10, fireRateMult: 1.2, combatStyle: 'balanced',
    leadFactor: 0.5, baseFireRate: 1.1,
  },
  medium: {
    aimSkill: 0.55, reactionTime: 0.3, evadeFrequency: 0.5, strafeAggression: 1.0,
    optimalRange: 15, rangeDiscipline: 8, fireRateMult: 1.5, combatStyle: 'balanced',
    leadFactor: 0.75, baseFireRate: 1.3,
  },
  hard: {
    aimSkill: 0.78, reactionTime: 0.18, evadeFrequency: 0.7, strafeAggression: 1.3,
    optimalRange: 14, rangeDiscipline: 6, fireRateMult: 1.9, combatStyle: 'kite',
    leadFactor: 0.9, baseFireRate: 1.5,
  },
  boss: {
    aimSkill: 0.95, reactionTime: 0.08, evadeFrequency: 0.9, strafeAggression: 1.6,
    optimalRange: 16, rangeDiscipline: 5, fireRateMult: 2.3, combatStyle: 'kite',
    leadFactor: 1.0, baseFireRate: 1.8,
  },
};

export class ServerEnemyAI {
  private behaviorState: AIBehaviorState = 'flank';
  private profile: DifficultyProfile;
  private difficulty: AIDifficultyTier;
  private rng: SeededRNG;
  private arenaHalf: number;

  // Movement speed of this AI (set per wave by WaveManager). Mirrors the
  // player's MOVE_SPEED so the AI feels comparable to a human.
  private moveSpeed: number;

  // Strafe oscillation
  private strafeDir = 1;
  private strafeDirTimer: number;

  // Waypoint roaming
  private waypoint: [number, number, number] = [0, 0, 0];
  private waypointTimer = 0;

  // Evasive jump cooldown
  private jumpCooldown: number;

  // Reactive dodge
  private threatReactTimer = 0;
  private dodgeDir: [number, number, number] = [0, 0, 0];
  private dodgeTimer = 0;

  // Velocity-leading estimate of the current target
  private lastTargetPos: [number, number, number] | null = null;
  private targetVelEstimate: [number, number, number] = [0, 0, 0];

  constructor(opts: {
    difficulty: AIDifficultyTier;
    rng: SeededRNG;
    arenaHalf: number;
    moveSpeed?: number;
  }) {
    this.difficulty = opts.difficulty;
    this.profile = DIFFICULTY_PROFILES[opts.difficulty] ?? DIFFICULTY_PROFILES.medium;
    this.rng = opts.rng;
    this.arenaHalf = opts.arenaHalf;
    this.moveSpeed = opts.moveSpeed ?? MECH.MOVE_SPEED;

    this.strafeDirTimer = 2 + this.rng.next() * 2;
    this.jumpCooldown = 6 + this.rng.next() * 4;
    this.pickNewWaypoint();
  }

  setDifficulty(difficulty: AIDifficultyTier): void {
    this.difficulty = difficulty;
    this.profile = DIFFICULTY_PROFILES[difficulty] ?? DIFFICULTY_PROFILES.medium;
  }

  /**
   * Pick the closest living human player as the engagement target.
   * Returns null when no valid target exists.
   */
  selectTarget(self: PlayerState, targets: AITargetView[]): AITargetView | null {
    let best: AITargetView | null = null;
    let bestDist = Infinity;
    for (const t of targets) {
      if (t.state.health <= 0) continue;
      const d = this.dist2(self.position, t.state.position);
      if (d < bestDist) {
        bestDist = d;
        best = t;
      }
    }
    return best;
  }

  /**
   * Advance the AI one tick. Mutates `self` (position/velocity/rotation) the
   * same way the server mutates a player, and returns a fire decision.
   *
   * @param self      The AI mech's authoritative PlayerState (mutated in place).
   * @param target    The chosen target's PlayerState (read-only).
   * @param deltaTime Seconds since last tick (fixed at SNAPSHOT_INTERVAL/1000).
   * @param threats   Hostile projectiles in flight (for reactive dodging).
   * @param projectileSpeed Speed of the AI's right weapon projectile (for leading).
   * @param floorY    Arena floor height.
   * @param ceilingY  Arena ceiling height.
   * @param hasJumpJets Whether this AI mech has jump jets (stronger jump).
   */
  update(
    self: PlayerState,
    target: PlayerState,
    deltaTime: number,
    threats: AIThreat[],
    projectileSpeed: number,
    floorY: number,
    ceilingY: number,
    hasJumpJets: boolean,
  ): AIDecision {
    const dt = deltaTime;
    const optimalRange = this.profile.optimalRange;

    // Flat distance to target.
    const distanceToTarget = this.dist2(self.position, target.position);

    // --- Estimate target velocity for shot leading. ---
    if (this.lastTargetPos && dt > 0) {
      const ivx = (target.position[0] - this.lastTargetPos[0]) / dt;
      const ivy = (target.position[1] - this.lastTargetPos[1]) / dt;
      const ivz = (target.position[2] - this.lastTargetPos[2]) / dt;
      // Smooth (lerp 0.4) to reduce jitter.
      this.targetVelEstimate[0] += (ivx - this.targetVelEstimate[0]) * 0.4;
      this.targetVelEstimate[1] += (ivy - this.targetVelEstimate[1]) * 0.4;
      this.targetVelEstimate[2] += (ivz - this.targetVelEstimate[2]) * 0.4;
    }
    this.lastTargetPos = [...target.position] as [number, number, number];

    // Direction to target (flat XZ).
    let dx = target.position[0] - self.position[0];
    let dz = target.position[2] - self.position[2];
    const flatLen = Math.hypot(dx, dz) || 1;
    dx /= flatLen;
    dz /= flatLen;

    // Face target (yaw).
    self.rotation[1] = Math.atan2(dx, dz);

    // --- Health-based behaviour state selection. ---
    const selfHealthPct = self.health / MECH.MAX_HEALTH;
    const targetHealthPct = target.health / MECH.MAX_HEALTH;
    const band = this.profile.rangeDiscipline;

    if (selfHealthPct < 0.3) {
      this.behaviorState = 'retreat';
    } else if (targetHealthPct < 0.3 && this.profile.combatStyle !== 'kite') {
      this.behaviorState = 'aggressive';
    } else if (this.profile.combatStyle === 'kite' && distanceToTarget < optimalRange - band) {
      this.behaviorState = 'retreat';
    } else if (distanceToTarget > optimalRange + band) {
      this.behaviorState = 'chase';
    } else if (this.profile.combatStyle === 'brawl') {
      this.behaviorState = 'aggressive';
    } else {
      this.behaviorState = 'flank';
    }

    // Strafe flip.
    this.strafeDirTimer -= dt;
    if (this.strafeDirTimer <= 0) {
      this.strafeDir *= -1;
      const baseHold = 2 + this.rng.next() * 2;
      this.strafeDirTimer = baseHold / Math.max(0.5, this.profile.strafeAggression);
    }

    // Waypoint roam.
    this.waypointTimer -= dt;
    if (this.waypointTimer <= 0) this.pickNewWaypoint();

    // Strafe vector (perpendicular to dir-to-target, flat).
    const strafeX = -dz * this.strafeDir;
    const strafeZ = dx * this.strafeDir;

    // Combat direction blend.
    let combatX = 0;
    let combatZ = 0;
    switch (this.behaviorState) {
      case 'chase':
        combatX = dx; combatZ = dz;
        break;
      case 'flank': {
        const closingBias = distanceToTarget > optimalRange ? 0.3 : -0.2;
        combatX = strafeX + dx * closingBias;
        combatZ = strafeZ + dz * closingBias;
        break;
      }
      case 'retreat':
        combatX = strafeX + dx * -0.7;
        combatZ = strafeZ + dz * -0.7;
        break;
      case 'aggressive': {
        const s = 0.3 * this.profile.strafeAggression;
        combatX = dx + strafeX * s;
        combatZ = dz + strafeZ * s;
        break;
      }
    }
    [combatX, combatZ] = this.norm2(combatX, combatZ);

    // --- Reactive dodging. ---
    const dodge = this.detectIncomingDodge(self, threats);
    if (dodge) {
      this.threatReactTimer += dt;
      if (this.threatReactTimer >= this.profile.reactionTime && this.dodgeTimer <= 0) {
        if (this.rng.chance(this.profile.evadeFrequency)) {
          this.dodgeDir = dodge;
          this.dodgeTimer = 0.4;
        }
        this.threatReactTimer = 0;
      }
    } else {
      this.threatReactTimer = Math.max(0, this.threatReactTimer - dt);
    }

    // Waypoint direction.
    let wpX = this.waypoint[0] - self.position[0];
    let wpZ = this.waypoint[2] - self.position[2];
    const wpLen = Math.hypot(wpX, wpZ);
    if (wpLen > 0.5) {
      wpX /= wpLen; wpZ /= wpLen;
    } else {
      wpX = 0; wpZ = 0;
    }

    // Blend combat + roam.
    const roamBlend = this.behaviorState === 'chase' ? 0.2 : 0.5;
    let desX = combatX * (1 - roamBlend) + wpX * roamBlend;
    let desZ = combatZ * (1 - roamBlend) + wpZ * roamBlend;

    // Active dodge override.
    if (this.dodgeTimer > 0) {
      this.dodgeTimer -= dt;
      const imp = 2.5 * this.profile.strafeAggression;
      desX += this.dodgeDir[0] * imp;
      desZ += this.dodgeDir[2] * imp;
    }
    [desX, desZ] = this.norm2(desX, desZ);

    // --- Apply movement (velocity-based, like the player). ---
    const speedMult =
      this.behaviorState === 'retreat' ? 1.2 :
      this.behaviorState === 'aggressive' ? 1.15 : 1.0;
    self.velocity[0] = desX * this.moveSpeed * speedMult;
    self.velocity[2] = desZ * this.moveSpeed * speedMult;

    // --- Evasive jump. ---
    this.jumpCooldown -= dt;
    const grounded = self.position[1] <= floorY + 0.001;
    if (this.jumpCooldown <= 0 && grounded) {
      // Is the target aimed at us?
      const lookX = Math.sin(target.rotation[1]);
      const lookZ = Math.cos(target.rotation[1]);
      // direction from target to self (flat, normalized)
      const tsx = self.position[0] - target.position[0];
      const tsz = self.position[2] - target.position[2];
      const tsLen = Math.hypot(tsx, tsz) || 1;
      const aimDot = lookX * (tsx / tsLen) + lookZ * (tsz / tsLen);

      const isBeingAimedAt = aimDot > 0.85 && distanceToTarget < 15;
      const isRetreating = this.behaviorState === 'retreat' && distanceToTarget < 20;
      const dodgeJump = dodge !== null && this.rng.chance(this.profile.evadeFrequency * 0.5);

      if (isBeingAimedAt || isRetreating || dodgeJump) {
        self.velocity[1] = hasJumpJets ? MECH.JUMP_THRUST * 1.25 : MECH.JUMP_THRUST;
        self.isJumping = true;
      }
      const baseCd = 6 + this.rng.next() * 4;
      this.jumpCooldown = baseCd * (0.5 + (1 - this.profile.evadeFrequency) * 0.5);
    }

    // --- Vertical physics (gravity / landing). ---
    if (self.position[1] > floorY) {
      self.velocity[1] += PHYSICS.GRAVITY * dt;
      self.velocity[1] = Math.max(self.velocity[1], PHYSICS.MAX_FALL_SPEED);
      self.isJumping = true;
    } else {
      self.position[1] = floorY;
      self.velocity[1] = 0;
      self.isJumping = false;
    }

    // Integrate position.
    self.position[0] += self.velocity[0] * dt;
    self.position[1] += self.velocity[1] * dt;
    self.position[2] += self.velocity[2] * dt;

    // Clamp to arena.
    self.position[0] = Math.max(-this.arenaHalf, Math.min(this.arenaHalf, self.position[0]));
    self.position[2] = Math.max(-this.arenaHalf, Math.min(this.arenaHalf, self.position[2]));
    self.position[1] = Math.max(floorY, Math.min(ceilingY, self.position[1]));

    // Regen power so the AI can keep firing.
    self.power = Math.min(MECH.MAX_POWER, self.power + MECH.POWER_REGEN * dt);

    // --- Fire decision. ---
    let fireRateMult = this.profile.fireRateMult;
    if (this.behaviorState === 'aggressive') fireRateMult *= 1.4;
    if (this.behaviorState === 'retreat') fireRateMult *= 0.7;

    const fireChance = this.profile.baseFireRate * dt * fireRateMult;
    const wantsFire = this.rng.chance(fireChance) && distanceToTarget < 30;

    if (!wantsFire) {
      return { fire: false };
    }

    const muzzle = this.muzzlePosition(self);
    const aim = this.computeAimDirection(muzzle, target, projectileSpeed);
    return { fire: true, aimDirection: aim, muzzlePosition: muzzle };
  }

  /**
   * Compute a normalized world-space aim direction toward the target with
   * first-order projectile leading and an aim-error cone (deterministic via RNG).
   */
  private computeAimDirection(
    spawn: [number, number, number],
    target: PlayerState,
    projectileSpeed: number,
  ): { x: number; y: number; z: number } {
    // Core/torso aim point.
    const aimPoint: [number, number, number] = [
      target.position[0],
      target.position[1] + 1.5,
      target.position[2],
    ];

    const lead = this.profile.leadFactor;
    if (lead > 0 && projectileSpeed > 0) {
      const ddx = aimPoint[0] - spawn[0];
      const ddy = aimPoint[1] - spawn[1];
      const ddz = aimPoint[2] - spawn[2];
      const dist = Math.hypot(ddx, ddy, ddz);
      const interceptTime = (dist / projectileSpeed) * lead;
      aimPoint[0] += this.targetVelEstimate[0] * interceptTime;
      aimPoint[1] += this.targetVelEstimate[1] * interceptTime;
      aimPoint[2] += this.targetVelEstimate[2] * interceptTime;
    }

    let dirX = aimPoint[0] - spawn[0];
    let dirY = aimPoint[1] - spawn[1];
    let dirZ = aimPoint[2] - spawn[2];
    const len = Math.hypot(dirX, dirY, dirZ) || 1;
    dirX /= len; dirY /= len; dirZ /= len;

    // Aim-error cone, inversely proportional to aimSkill.
    const maxConeRad = 0.18;
    const coneHalf = maxConeRad * (1 - this.profile.aimSkill);
    if (coneHalf > 0) {
      // Random axis (deterministic), bias toward smaller errors.
      let ax = this.rng.next() - 0.5;
      let ay = this.rng.next() - 0.5;
      let az = this.rng.next() - 0.5;
      const al = Math.hypot(ax, ay, az) || 1;
      ax /= al; ay /= al; az /= al;
      const angle = Math.pow(this.rng.next(), 1.5) * coneHalf;
      [dirX, dirY, dirZ] = this.rotateAroundAxis(dirX, dirY, dirZ, ax, ay, az, angle);
    }

    return { x: dirX, y: dirY, z: dirZ };
  }

  /** Rodrigues' rotation of a unit vector around a unit axis by `angle` rad. */
  private rotateAroundAxis(
    vx: number, vy: number, vz: number,
    ax: number, ay: number, az: number,
    angle: number,
  ): [number, number, number] {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dot = vx * ax + vy * ay + vz * az;
    // v*cos + (axis×v)*sin + axis*(axis·v)*(1-cos)
    const crossX = ay * vz - az * vy;
    const crossY = az * vx - ax * vz;
    const crossZ = ax * vy - ay * vx;
    return [
      vx * cos + crossX * sin + ax * dot * (1 - cos),
      vy * cos + crossY * sin + ay * dot * (1 - cos),
      vz * cos + crossZ * sin + az * dot * (1 - cos),
    ];
  }

  /** Muzzle position (right arm offset + torso height), matching MechEntity. */
  private muzzlePosition(self: PlayerState): [number, number, number] {
    const offset = 1.5; // right weapon
    const yaw = self.rotation[1];
    return [
      self.position[0] + Math.sin(yaw) * offset,
      self.position[1] + 1.5,
      self.position[2] + Math.cos(yaw) * offset,
    ];
  }

  /**
   * Returns a perpendicular sidestep direction (flat) when a threat is on an
   * intercept course, else null. Ported from client detectIncomingDodge.
   */
  private detectIncomingDodge(self: PlayerState, threats: AIThreat[]): [number, number, number] | null {
    if (threats.length === 0) return null;

    const cx = self.position[0];
    const cy = self.position[1] + 2.5;
    const cz = self.position[2];

    let best: { dir: [number, number, number]; closeness: number } | null = null;

    for (const threat of threats) {
      const relX = cx - threat.position[0];
      const relY = cy - threat.position[1];
      const relZ = cz - threat.position[2];

      const speed = Math.hypot(threat.velocity[0], threat.velocity[1], threat.velocity[2]);
      if (speed < 0.01) continue;
      const vx = threat.velocity[0] / speed;
      const vy = threat.velocity[1] / speed;
      const vz = threat.velocity[2] / speed;

      const along = relX * vx + relY * vy + relZ * vz;
      if (along <= 0 || along > 60) continue;

      const closestX = threat.position[0] + vx * along;
      const closestY = threat.position[1] + vy * along;
      const closestZ = threat.position[2] + vz * along;
      const miss = Math.hypot(closestX - cx, closestY - cy, closestZ - cz);
      if (miss > 4) continue;

      // Perpendicular (flat) to the threat heading.
      let perpX = -vz;
      let perpZ = vx;
      const pl = Math.hypot(perpX, perpZ) || 1;
      perpX /= pl; perpZ /= pl;
      // Choose the side away from the projectile path.
      const offX = cx - closestX;
      const offZ = cz - closestZ;
      if (offX * perpX + offZ * perpZ < 0) {
        perpX = -perpX; perpZ = -perpZ;
      }

      const closeness = 1 - miss / 4;
      if (!best || closeness > best.closeness) {
        best = { dir: [perpX, 0, perpZ], closeness };
      }
    }

    return best ? best.dir : null;
  }

  private pickNewWaypoint(): void {
    const angle = this.rng.next() * Math.PI * 2;
    const dist = this.arenaHalf * 0.4 + this.rng.next() * this.arenaHalf * 0.5;
    this.waypoint = [Math.cos(angle) * dist, 0, Math.sin(angle) * dist];
    this.waypointTimer = 3 + this.rng.next() * 3;
  }

  /** Flat (XZ) distance between two world points. */
  private dist2(a: [number, number, number], b: [number, number, number]): number {
    return Math.hypot(a[0] - b[0], a[2] - b[2]);
  }

  /** Normalize a 2D (XZ) vector; returns [0,0] if near-zero. */
  private norm2(x: number, z: number): [number, number] {
    const l = Math.hypot(x, z);
    if (l < 0.001) return [0, 0];
    return [x / l, z / l];
  }
}
