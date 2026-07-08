/**
 * Individual match instance managing game state for one 1v1 battle
 * Runs authoritative server tick loop at 20Hz
 */

import {
  PlayerState,
  ProjectileState,
  StateSnapshotMessage,
  EventMessage,
  MatchEndMessage,
  MatchStats,
  PlayerInput,
  MechLoadout,
  GameMode,
  AIMechState,
  WaveStartedEvent,
  WaveCompleteEvent
} from '../shared/types/NetworkMessages';
import {
  NETWORK,
  ARENA,
  MECH,
  PHYSICS,
  COMBAT,
  SURVIVAL
} from '../shared/constants/GameConstants';
import { MechEntity } from '../game/MechEntity';
import { ProjectileSystem } from '../game/ProjectileSystem';
import { SeededRNG } from '../game/SeededRNG';
import { ServerEnemyAI, type AIThreat } from '../game/ServerEnemyAI';
import { WaveManager, type WaveSpawn, type WaveHumanView } from '../game/WaveManager';
import type { MapDefinition, AABB, DynamicElement, HazardZone } from '../shared/types/MapDefinition';
import { computeAABB, getDynamicElementTransform, isHazardActive, isPointInHazard } from '../shared/types/MapDefinition';

interface PlayerData {
  playerId: string;
  playerName: string;
  loadout: MechLoadout;
  socket: any; // WebSocket
  state: PlayerState;
  lastInputSeq: number;
  lastInput: PlayerInput | null;
  connected: boolean;
  stats: MatchStats;
  mech: MechEntity; // Server-side mech entity
}

export type MatchState = 'COUNTDOWN' | 'ACTIVE' | 'ENDING' | 'ENDED';

/** A single server-controlled AI mech entity (survival mode). */
interface AIData {
  spawn: WaveSpawn;
  mech: MechEntity;
  ai: ServerEnemyAI;
  maxHealth: number;
  hasJumpJets: boolean;
}

export class MatchInstance {
  public readonly matchId: string;
  private player1: PlayerData;
  private player2: PlayerData | null;
  private matchState: MatchState = 'COUNTDOWN';
  private projectileSystem: ProjectileSystem;
  private tickInterval: NodeJS.Timeout | null = null;
  private serverTime: number = Date.now();
  private matchStartTime: number = Date.now();
  private countdownRemaining: number = 3;
  private onMatchEndCallback: ((matchId: string) => void) | null = null;
  private eventIdCounter = 0;

  // --- Survival mode (only populated when gameMode === 'survival') ---------
  private gameMode: GameMode = 'pvp';
  private waveManager: WaveManager | null = null;
  private survivalRng: SeededRNG | null = null;
  private aiMechs: Map<string, AIData> = new Map();

  // Map data
  private map: MapDefinition | null = null;
  private buildingAABBs: AABB[] = [];
  private arenaHalfW: number;
  private arenaHalfD: number;
  private floorY: number;
  private ceilingY: number;

  constructor(
    matchId: string,
    player1Id: string,
    player1Name: string,
    player1Loadout: MechLoadout,
    player1Socket: any,
    player2Id: string | null,
    player2Name: string | null,
    player2Loadout: MechLoadout | null,
    player2Socket: any,
    map?: MapDefinition,
    options?: { gameMode?: GameMode }
  ) {
    this.matchId = matchId;
    this.gameMode = options?.gameMode ?? 'pvp';

    // Setup map bounds
    if (map) {
      this.map = map;
      this.arenaHalfW = map.arena.width / 2;
      this.arenaHalfD = map.arena.depth / 2;
      this.floorY = map.arena.floorY;
      this.ceilingY = map.arena.ceilingY;

      // Precompute building AABBs for collision
      for (const geom of map.staticGeometry) {
        const aabb = computeAABB(geom);
        if (aabb) this.buildingAABBs.push(aabb);
      }
    } else {
      this.arenaHalfW = ARENA.WIDTH / 2;
      this.arenaHalfD = ARENA.DEPTH / 2;
      this.floorY = ARENA.FLOOR_Y;
      this.ceilingY = ARENA.CEILING_Y;
    }

    // Initialize projectile system
    this.projectileSystem = new ProjectileSystem();

    // Initialize player 1 - use map spawn points if available
    const spawn1 = map ? [...map.spawnPoints[0].position] as [number, number, number] : this.generateSpawnPosition(0);
    const mech1 = new MechEntity(player1Id, player1Name, player1Loadout, spawn1);
    this.player1 = {
      playerId: player1Id,
      playerName: player1Name,
      loadout: player1Loadout,
      socket: player1Socket,
      state: mech1.state,
      lastInputSeq: 0,
      lastInput: null,
      connected: true,
      stats: this.createInitialStats(),
      mech: mech1
    };

    // Initialize player 2 (optional — survival co-op may have a single human)
    if (player2Id && player2Name && player2Loadout) {
      const spawn2 = map ? [...map.spawnPoints[1].position] as [number, number, number] : this.generateSpawnPosition(Math.PI);
      const mech2 = new MechEntity(player2Id, player2Name, player2Loadout, spawn2);
      this.player2 = {
        playerId: player2Id,
        playerName: player2Name,
        loadout: player2Loadout,
        socket: player2Socket,
        state: mech2.state,
        lastInputSeq: 0,
        lastInput: null,
        connected: true,
        stats: this.createInitialStats(),
        mech: mech2
      };
    } else {
      this.player2 = null;
    }

    // Survival mode setup: deterministic RNG + wave manager. AI spawns at the
    // opposite spawn point (the slot a second player would occupy).
    if (this.gameMode === 'survival') {
      this.survivalRng = new SeededRNG(SeededRNG.seedFromString(matchId));
      const aiSpawn = map
        ? [...map.spawnPoints[1].position] as [number, number, number]
        : this.generateSpawnPosition(Math.PI);
      this.waveManager = new WaveManager({
        matchId,
        rng: this.survivalRng,
        spawnPosition: aiSpawn,
        startWave: SURVIVAL.START_WAVE,
      });
    }

    const opponentLabel = this.gameMode === 'survival'
      ? 'SURVIVAL'
      : (this.player2?.playerName ?? '???');
    console.log(`[Match ${matchId}] Created: ${player1Name} vs ${opponentLabel} on ${map?.name ?? 'default arena'}`);
  }

  /** Living human players in this match (co-op survival may have 1 or 2). */
  private getHumanPlayers(): PlayerData[] {
    return this.player2 ? [this.player1, this.player2] : [this.player1];
  }

  /**
   * Start the match with countdown
   */
  public start(): void {

    // Send match_start to both players
    this.broadcast({
      type: 'match_start',
      countdown: this.countdownRemaining
    });

    // Start countdown timer
    const countdownInterval = setInterval(() => {
      this.countdownRemaining--;

      if (this.countdownRemaining > 0) {
        this.broadcast({
          type: 'match_start',
          countdown: this.countdownRemaining
        });
      } else {
        clearInterval(countdownInterval);
        this.matchState = 'ACTIVE';
        if (this.gameMode === 'survival') {
          this.spawnCurrentWave();
        }
        this.startGameLoop();
      }
    }, 1000);
    countdownInterval.unref?.();
  }

  /**
   * Survival: materialize the current wave's AI mech entities from the
   * WaveManager descriptors and emit a wave_started event.
   */
  private spawnCurrentWave(): void {
    if (!this.waveManager || !this.survivalRng) return;
    const spawns = this.waveManager.buildCurrentWaveSpawns();
    this.materializeSpawns(spawns);

    const event: WaveStartedEvent = {
      wave: this.waveManager.getWave(),
      difficulty: this.waveManager.currentDifficulty(),
      enemyCount: spawns.length,
      aiLoadoutPreview: this.waveManager.buildPreviews(spawns),
    };
    this.emitEvent('wave_started', event);
  }

  /** Create AIData (MechEntity + ServerEnemyAI) for each spawn descriptor. */
  private materializeSpawns(spawns: WaveSpawn[]): void {
    for (const spawn of spawns) {
      const mech = new MechEntity(spawn.id, spawn.name, spawn.loadout, spawn.position);
      // Apply scaled max health for this wave.
      mech.state.health = spawn.maxHealth;
      const hasJumpJets = spawn.difficulty === 'easy' || spawn.difficulty === 'hard' || spawn.difficulty === 'boss';
      const ai = new ServerEnemyAI({
        difficulty: spawn.difficulty,
        rng: new SeededRNG(spawn.aiSeed),
        arenaHalf: Math.min(this.arenaHalfW, this.arenaHalfD),
        moveSpeed: spawn.moveSpeed,
      });
      this.aiMechs.set(spawn.id, {
        spawn,
        mech,
        ai,
        maxHealth: spawn.maxHealth,
        hasJumpJets,
      });
    }
  }

  /**
   * Start the main game loop at 20Hz
   */
  private startGameLoop(): void {
    this.matchStartTime = Date.now();
    this.tickInterval = setInterval(() => {
      this.tick();
    }, NETWORK.SNAPSHOT_INTERVAL);
    this.tickInterval.unref?.();
  }

  /**
   * Main game tick - update physics and send state snapshot
   */
  private tick(): void {
    this.serverTime = Date.now();
    const deltaTime = NETWORK.SNAPSHOT_INTERVAL / 1000;
    const matchElapsed = (this.serverTime - this.matchStartTime) / 1000;

    const humans = this.getHumanPlayers();

    // Update player physics based on last input
    for (const p of humans) {
      this.updatePlayerPhysics(p);
      this.checkBuildingCollisions(p, deltaTime);
    }

    // Process dynamic elements (conveyors, rotating arms, pistons)
    if (this.map) {
      this.processDynamicElements(matchElapsed, deltaTime);
      this.processHazardZones(matchElapsed);
    }

    // Update cooldowns
    for (const p of humans) {
      p.mech.updateCooldowns(deltaTime);
    }

    // Survival: tick AI mechs (movement + firing) and wave state machine.
    if (this.gameMode === 'survival') {
      this.tickSurvival(deltaTime, humans);
    }

    // Update projectiles
    this.projectileSystem.update(deltaTime);

    // Check projectile collisions against all human + AI mechs
    const collidableMechs: MechEntity[] = humans.map(p => p.mech);
    for (const ai of this.aiMechs.values()) {
      collidableMechs.push(ai.mech);
    }
    const hits = this.projectileSystem.checkCollisions(collidableMechs);

    // Process hits
    for (const hit of hits) {
      this.handleProjectileHit(hit.projectileId, hit.hitMechId, hit.position, hit.damage);
    }

    // Survival: after combat, resolve wave-complete / defeat transitions.
    if (this.gameMode === 'survival') {
      this.resolveSurvivalState(deltaTime);
    }

    // Send state snapshot to both players
    this.sendStateSnapshot();
  }

  /**
   * Survival per-tick: step each AI's ServerEnemyAI (movement) and let it fire.
   */
  private tickSurvival(deltaTime: number, humans: PlayerData[]): void {
    if (!this.waveManager) return;
    if (this.aiMechs.size === 0) return;

    // Build the threat list once (human-owned projectiles in flight).
    const threats: AIThreat[] = this.projectileSystem.getProjectileStates()
      .filter(p => !this.aiMechs.has(p.ownerId))
      .map(p => ({ position: p.position, velocity: p.velocity }));

    for (const ai of this.aiMechs.values()) {
      if (ai.mech.state.health <= 0) continue;

      // Choose target among living humans.
      const targetView = ai.ai.selectTarget(
        ai.mech.state,
        humans.map(h => ({ id: h.playerId, state: h.state })),
      );
      if (!targetView) continue;

      ai.mech.updateCooldowns(deltaTime);

      const rightWeapon = ai.mech.loadout.rightWeapon;
      const projectileSpeed = rightWeapon?.projectileSpeed ?? 100;

      const decision = ai.ai.update(
        ai.mech.state,
        targetView.state,
        deltaTime,
        threats,
        projectileSpeed,
        this.floorY,
        this.ceilingY,
        ai.hasJumpJets,
      );

      if (decision.fire && decision.aimDirection && ai.mech.canFireWeapon('right')) {
        this.handleAIWeaponFire(ai, decision.aimDirection, decision.muzzlePosition);
      }
    }
  }

  /**
   * Survival: detect wave completion and defeat, drive between-wave staging.
   */
  private resolveSurvivalState(deltaTime: number): void {
    if (!this.waveManager) return;
    if (this.matchState !== 'ACTIVE') return;

    const humans = this.getHumanPlayers();

    // Defeat: all humans destroyed.
    if (humans.every(h => h.state.health <= 0)) {
      this.waveManager.markDefeat();
      this.endSurvival();
      return;
    }

    const phase = this.waveManager.getPhase();

    if (phase === 'active') {
      const aiHealths = Array.from(this.aiMechs.values()).map(a => a.mech.state.health);
      if (this.aiMechs.size > 0 && this.waveManager.allAIDead(aiHealths)) {
        // Build the WaveHumanView adapters for repair + scoring.
        const humanViews: WaveHumanView[] = humans.map(h => ({
          playerId: h.playerId,
          getHealth: () => h.state.health,
          getMaxHealth: () => MECH.MAX_HEALTH,
          heal: (amount: number) => {
            h.state.health = Math.min(MECH.MAX_HEALTH, h.state.health + amount);
            h.state.power = MECH.MAX_POWER;
            return h.state.health;
          },
        }));

        const info = this.waveManager.completeWave(humanViews);
        // Clear dead AI entities.
        this.aiMechs.clear();

        const event: WaveCompleteEvent = {
          wave: info.wave,
          waveScore: info.waveScore,
          totalScore: info.totalScore,
          repair: info.repair,
          repairDurationMs: info.repairDurationMs,
        };
        this.emitEvent('wave_complete', event);
      }
    } else if (phase === 'between_waves') {
      const spawns = this.waveManager.tickBetweenWaves(deltaTime * 1000);
      if (spawns) {
        this.materializeSpawns(spawns);
        const event: WaveStartedEvent = {
          wave: this.waveManager.getWave(),
          difficulty: this.waveManager.currentDifficulty(),
          enemyCount: spawns.length,
          aiLoadoutPreview: this.waveManager.buildPreviews(spawns),
        };
        this.emitEvent('wave_started', event);
      }
    }
  }

  /** Survival: AI fires a weapon (mirrors handleWeaponFire for players). */
  private handleAIWeaponFire(
    ai: AIData,
    aimDirection: { x: number; y: number; z: number },
    muzzleOverride?: [number, number, number],
  ): void {
    const weaponConfig = ai.mech.loadout.rightWeapon;
    if (!weaponConfig) return;

    ai.mech.fireWeapon('right');

    const muzzlePos = muzzleOverride ?? ai.mech.getMuzzlePosition('right');

    const projectileId = this.projectileSystem.spawnProjectile(
      ai.spawn.id,
      muzzlePos,
      [aimDirection.x, aimDirection.y, aimDirection.z],
      weaponConfig.type,
      weaponConfig.damage,
    );

    this.emitEvent('projectile_spawned', {
      projectileId,
      ownerId: ai.spawn.id,
      position: muzzlePos,
      weaponType: weaponConfig.type,
      damage: weaponConfig.damage,
    });
  }

  /** Broadcast a typed event with a generated id. */
  private emitEvent(eventType: EventMessage['eventType'], data: any): void {
    this.broadcast({
      type: 'event',
      eventId: this.generateEventId(),
      eventType,
      data,
    });
  }

  /**
   * Update player physics based on input
   */
  private updatePlayerPhysics(player: PlayerData): void {
    if (!player.lastInput) return;

    const input = player.lastInput;
    const state = player.state;
    const dt = NETWORK.SNAPSHOT_INTERVAL / 1000; // Convert to seconds

    // Calculate movement direction from input
    let moveX = 0;
    let moveZ = 0;

    if (input.forward) moveZ -= 1;
    if (input.backward) moveZ += 1;
    if (input.left) moveX -= 1;
    if (input.right) moveX += 1;

    // Normalize movement
    const moveLength = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (moveLength > 0) {
      moveX /= moveLength;
      moveZ /= moveLength;
    }

    // Apply movement speed
    const speed = state.isJumping ? MECH.AIR_MOVE_SPEED : MECH.MOVE_SPEED;
    const dashMultiplier = state.isDashing ? MECH.DASH_SPEED_MULTIPLIER : 1;

    // Rotate movement from local space to world space using mech's yaw
    const yaw = input.aimDirection
      ? Math.atan2(input.aimDirection.x, input.aimDirection.z)
      : state.rotation[1];
    const sinYaw = Math.sin(yaw);
    const cosYaw = Math.cos(yaw);
    const worldMoveX = -(moveX * cosYaw + moveZ * sinYaw);
    const worldMoveZ = -(moveZ * cosYaw - moveX * sinYaw);

    state.velocity[0] = worldMoveX * speed * dashMultiplier;
    state.velocity[2] = worldMoveZ * speed * dashMultiplier;

    // Apply gravity
    if (state.position[1] > this.floorY) {
      state.velocity[1] += PHYSICS.GRAVITY * dt;
      state.velocity[1] = Math.max(state.velocity[1], PHYSICS.MAX_FALL_SPEED);
      state.isJumping = true;
    } else {
      // On ground
      state.position[1] = this.floorY;
      state.velocity[1] = 0;
      state.isJumping = false;

      // Regen jump fuel on ground
      state.jumpFuel = Math.min(MECH.MAX_JUMP_FUEL, state.jumpFuel + MECH.JUMP_FUEL_REGEN * dt);
    }

    // Handle jump
    if (input.jump && !state.isJumping && state.jumpFuel > 0) {
      state.velocity[1] = MECH.JUMP_THRUST;
      state.isJumping = true;
    }

    // Consume jump fuel while jumping
    if (input.jump && state.isJumping && state.jumpFuel > 0) {
      state.velocity[1] = Math.max(state.velocity[1], 0); // Maintain upward velocity
      state.velocity[1] += MECH.JUMP_THRUST * 0.5 * dt;
      state.jumpFuel = Math.max(0, state.jumpFuel - MECH.JUMP_FUEL_CONSUMPTION * dt);
    }

    // Update position
    state.position[0] += state.velocity[0] * dt;
    state.position[1] += state.velocity[1] * dt;
    state.position[2] += state.velocity[2] * dt;

    // Clamp to arena bounds
    state.position[0] = Math.max(-this.arenaHalfW, Math.min(this.arenaHalfW, state.position[0]));
    state.position[2] = Math.max(-this.arenaHalfD, Math.min(this.arenaHalfD, state.position[2]));
    state.position[1] = Math.max(this.floorY, Math.min(this.ceilingY, state.position[1]));

    // Update rotation based on aim direction
    if (input.aimDirection) {
      const yaw = Math.atan2(input.aimDirection.x, input.aimDirection.z);
      state.rotation[1] = yaw;
    }

    // Regenerate power
    state.power = Math.min(MECH.MAX_POWER, state.power + MECH.POWER_REGEN * dt);
  }

  /**
   * Check building AABB collisions - both horizontal push-out and landing on top
   */
  private checkBuildingCollisions(player: PlayerData, dt: number): void {
    if (this.buildingAABBs.length === 0) return;

    const state = player.state;
    const mechRadius = 2;
    const mechHeight = 5; // Mech height for collision
    const px = state.position[0];
    const py = state.position[1];
    const pz = state.position[2];

    // Track highest surface we're standing on
    let groundY = this.floorY;

    for (const aabb of this.buildingAABBs) {
      // Check if horizontally within building bounds (with mech radius)
      const horizontallyAbove = px >= aabb.minX - mechRadius && px <= aabb.maxX + mechRadius &&
                                 pz >= aabb.minZ - mechRadius && pz <= aabb.maxZ + mechRadius;

      // Check for landing on top of building
      if (horizontallyAbove && state.velocity[1] <= 0) {
        const topSurfaceY = aabb.maxY;
        // Check if falling onto the top surface (within landing range)
        if (py >= topSurfaceY && py <= topSurfaceY + mechHeight && topSurfaceY > groundY) {
          groundY = topSurfaceY;
        }
      }

      // Horizontal push-out collision (only if inside building vertically)
      if (py + mechHeight > aabb.minY && py < aabb.maxY) {
        const closestX = Math.max(aabb.minX, Math.min(px, aabb.maxX));
        const closestZ = Math.max(aabb.minZ, Math.min(pz, aabb.maxZ));

        const dx = px - closestX;
        const dz = pz - closestZ;
        const distSq = dx * dx + dz * dz;

        if (distSq < mechRadius * mechRadius) {
          const dist = Math.sqrt(distSq);
          if (dist > 0) {
            const pushX = (dx / dist) * (mechRadius - dist);
            const pushZ = (dz / dist) * (mechRadius - dist);
            state.position[0] += pushX;
            state.position[2] += pushZ;
          } else {
            state.position[0] += mechRadius;
          }
        }
      }
    }

    // Apply ground collision for standing on buildings (in addition to floor)
    if (py <= groundY && state.velocity[1] <= 0) {
      state.position[1] = groundY;
      state.velocity[1] = 0;
      state.isJumping = false;
      // Regen jump fuel when on buildings too - same rate as floor
      state.jumpFuel = Math.min(MECH.MAX_JUMP_FUEL, state.jumpFuel + MECH.JUMP_FUEL_REGEN * dt);
    }
  }

  /**
   * Process dynamic elements: conveyors push mechs, rotating arms deal damage, pistons slam
   */
  private processDynamicElements(matchElapsed: number, deltaTime: number): void {
    if (!this.map) return;

    for (const elem of this.map.dynamicElements) {
      const transform = getDynamicElementTransform(elem, matchElapsed);

      switch (elem.type) {
        case 'conveyor': {
          // Check if either player is on the conveyor
          for (const player of this.getHumanPlayers()) {
            const state = player.state;
            const [cx, cy, cz] = elem.position;
            const [sw, sh, sl] = elem.size;
            // Check if player is within conveyor bounds
            if (Math.abs(state.position[0] - cx) < sw / 2 + 2 &&
                Math.abs(state.position[2] - cz) < sl / 2 + 2 &&
                state.position[1] <= cy + sh + 1) {
              // Push player
              state.position[0] += elem.pushDirection[0] * elem.pushSpeed * deltaTime;
              state.position[2] += elem.pushDirection[2] * elem.pushSpeed * deltaTime;
            }
          }
          break;
        }
        case 'rotating': {
          // Check collision with rotating arm - simplified AABB at current position
          const [rx, ry, rz] = transform.position;
          const armLen = elem.size[0] / 2;
          const angle = transform.rotation[1]; // Y axis rotation
          // Arm endpoints
          const endX1 = rx + Math.sin(angle) * armLen;
          const endZ1 = rz + Math.cos(angle) * armLen;
          const endX2 = rx - Math.sin(angle) * armLen;
          const endZ2 = rz - Math.cos(angle) * armLen;

          for (const player of this.getHumanPlayers()) {
            const state = player.state;
            // Simple distance-to-line-segment check
            if (Math.abs(state.position[1] - ry) < elem.size[1] + 3) {
              const dist = this.pointToSegmentDist(
                state.position[0], state.position[2],
                endX1, endZ1, endX2, endZ2
              );
              if (dist < 3) {
                // Deal contact damage and push away
                const defeated = player.mech.takeDamage(elem.contactDamage * deltaTime);
                // Push away from arm center
                const pushX = state.position[0] - rx;
                const pushZ = state.position[2] - rz;
                const pushLen = Math.sqrt(pushX * pushX + pushZ * pushZ) || 1;
                state.position[0] += (pushX / pushLen) * 5 * deltaTime;
                state.position[2] += (pushZ / pushLen) * 5 * deltaTime;
                if (defeated) this.handleEnvironmentKill(player);
              }
            }
          }
          break;
        }
        case 'piston': {
          // Check if piston is in slam phase and player is under it
          const cycleProgress = (matchElapsed % elem.cycleDuration) / elem.cycleDuration;
          const isSlamming = cycleProgress > 0.9; // Slam phase
          const isExtended = cycleProgress < elem.extendedFraction;

          if (isSlamming || isExtended) {
            const [px, py, pz] = transform.position;
            for (const player of this.getHumanPlayers()) {
              const state = player.state;
              if (Math.abs(state.position[0] - px) < elem.size[0] / 2 + 2 &&
                  Math.abs(state.position[2] - pz) < elem.size[2] / 2 + 2 &&
                  Math.abs(state.position[1] - py) < elem.size[1] / 2 + 3) {
                if (isSlamming) {
                  const defeated = player.mech.takeDamage(elem.slamDamage);
                  this.broadcastDamageEvent(player.playerId, 'environment', elem.slamDamage, player.state.health);
                  if (defeated) this.handleEnvironmentKill(player);
                }
                // Push mech out from under piston
                state.position[1] = py - elem.size[1] / 2 - 3;
              }
            }
          }
          break;
        }
      }
    }
  }

  /**
   * Process hazard zones - check if mechs are in active hazard areas
   */
  private processHazardZones(matchElapsed: number): void {
    if (!this.map) return;

    for (const hazard of this.map.hazardZones) {
      const state = isHazardActive(hazard, matchElapsed);
      if (!state.active) continue;

      for (const player of this.getHumanPlayers()) {
        if (isPointInHazard(hazard, player.state.position)) {
          const defeated = player.mech.takeDamage(hazard.damage);
          this.broadcastDamageEvent(player.playerId, 'environment', hazard.damage, player.state.health);
          if (defeated) this.handleEnvironmentKill(player);
        }
      }
    }
  }

  /**
   * Handle a kill caused by environment (hazard/dynamic element)
   */
  private handleEnvironmentKill(defeated: PlayerData): void {
    // In survival, defeat resolution is handled by resolveSurvivalState (all
    // humans must be dead). A single environment kill doesn't end the run.
    if (this.gameMode === 'survival') {
      this.broadcastMechDestroyedEvent(defeated.playerId, 'environment', defeated.state.position);
      return;
    }
    const victor = defeated === this.player1 ? this.player2 : this.player1;
    if (victor) this.handleMechDestroyed(defeated, victor);
  }

  /**
   * Broadcast a damage event
   */
  private broadcastDamageEvent(targetId: string, attackerId: string, damage: number, newHealth: number): void {
    const eventId = this.generateEventId();
    this.broadcast({
      type: 'event',
      eventId,
      eventType: 'damage',
      data: { targetId, attackerId, damage, newHealth }
    });
  }

  /**
   * Distance from point to line segment (2D)
   */
  private pointToSegmentDist(px: number, pz: number, ax: number, az: number, bx: number, bz: number): number {
    const dx = bx - ax, dz = bz - az;
    const lenSq = dx * dx + dz * dz;
    if (lenSq === 0) return Math.sqrt((px - ax) ** 2 + (pz - az) ** 2);
    let t = ((px - ax) * dx + (pz - az) * dz) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const projX = ax + t * dx, projZ = az + t * dz;
    return Math.sqrt((px - projX) ** 2 + (pz - projZ) ** 2);
  }

  /**
   * Send state snapshot to both players
   */
  private sendStateSnapshot(): void {
    const players: Record<string, PlayerState> = {
      [this.player1.playerId]: this.player1.state,
    };
    if (this.player2) {
      players[this.player2.playerId] = this.player2.state;
    }

    const snapshot: StateSnapshotMessage = {
      type: 'state_snapshot',
      serverTime: this.serverTime,
      lastProcessedSeq: 0, // Will be set per player
      players,
      projectiles: this.projectileSystem.getProjectileStates()
    };

    // Survival: attach AI mechs + wave/score/staging state (optional fields;
    // entirely absent in PvP so existing clients are unaffected).
    if (this.gameMode === 'survival' && this.waveManager) {
      const aiMechs: Record<string, AIMechState> = {};
      for (const ai of this.aiMechs.values()) {
        aiMechs[ai.spawn.id] = {
          ...ai.mech.state,
          id: ai.spawn.id,
          difficulty: ai.spawn.difficulty,
          wave: ai.spawn.wave,
          name: ai.spawn.name,
          loadout: ai.spawn.loadout,
        };
      }
      snapshot.aiMechs = aiMechs;
      snapshot.wave = this.waveManager.getWave();
      snapshot.survivalScore = this.waveManager.getScore();
      snapshot.betweenWaves = this.waveManager.isBetweenWaves();
    }

    // Send to player 1 with their last seq
    if (this.player1.connected && this.player1.socket.readyState === 1) {
      const p1Snapshot = { ...snapshot, lastProcessedSeq: this.player1.lastInputSeq };
      this.player1.socket.send(JSON.stringify(p1Snapshot));
    }

    // Send to player 2 with their last seq
    if (this.player2 && this.player2.connected && this.player2.socket.readyState === 1) {
      const p2Snapshot = { ...snapshot, lastProcessedSeq: this.player2.lastInputSeq };
      this.player2.socket.send(JSON.stringify(p2Snapshot));
    }
  }

  /**
   * Handle input message from a player
   */
  public handleInput(playerId: string, seq: number, timestamp: number, input: PlayerInput): void {
    const player = this.getPlayer(playerId);
    if (!player || this.matchState !== 'ACTIVE') return;

    // Validate timestamp (reject if too old or in future)
    const timeDiff = this.serverTime - timestamp;
    if (Math.abs(timeDiff) > NETWORK.MAX_INPUT_AGE) {
      console.warn(`[Match ${this.matchId}] Rejected input from ${player.playerName}: timestamp too old/future`);
      return;
    }

    // Update sequence number and input
    if (seq > player.lastInputSeq) {
      player.lastInputSeq = seq;
      player.lastInput = input;
    }

    // Handle weapon firing
    if (input.shootLeft && player.mech.canFireWeapon('left')) {
      this.handleWeaponFire(player, 'left', input.aimDirection);
    }

    if (input.shootRight && player.mech.canFireWeapon('right')) {
      this.handleWeaponFire(player, 'right', input.aimDirection);
    }
  }

  /**
   * Handle player disconnection
   */
  public handleDisconnect(playerId: string): void {
    const player = this.getPlayer(playerId);
    if (!player) return;

    console.log(`[Match ${this.matchId}] Player ${player.playerName} disconnected`);
    player.connected = false;

    // --- Survival: disconnects don't forfeit; end only when all humans gone ---
    if (this.gameMode === 'survival') {
      const anyConnected = this.getHumanPlayers().some(p => p.connected);
      if (!anyConnected) {
        if (this.matchState === 'ACTIVE') {
          this.endSurvival();
        } else {
          this.cleanup();
          if (this.onMatchEndCallback) this.onMatchEndCallback(this.matchId);
        }
      }
      return;
    }

    if (this.matchState === 'ACTIVE') {
      // Notify opponent of disconnection
      const opponent = playerId === this.player1.playerId ? this.player2 : this.player1;

      if (opponent && opponent.connected && opponent.socket.readyState === 1) {
        opponent.socket.send(JSON.stringify({
          type: 'opponent_disconnected'
        }));
      }

      // End match - opponent wins by forfeit
      if (opponent) this.endMatch(opponent.playerId, 'disconnect');
    } else if (this.matchState === 'COUNTDOWN') {
      // Cancel match during countdown
      console.log(`[Match ${this.matchId}] Match cancelled during countdown`);

      // Notify other player
      const opponent = playerId === this.player1.playerId ? this.player2 : this.player1;
      if (opponent && opponent.connected && opponent.socket.readyState === 1) {
        opponent.socket.send(JSON.stringify({
          type: 'error',
          code: 'MATCH_CANCELLED',
          message: 'Match cancelled - opponent disconnected during countdown'
        }));
      }

      this.cleanup();
      if (this.onMatchEndCallback) {
        this.onMatchEndCallback(this.matchId);
      }
    }
  }

  /**
   * Survival end: broadcast a survival_defeat match_end with score + waves
   * cleared, then clean up. Winner field carries no meaning in co-op (empty).
   */
  private endSurvival(): void {
    if (this.matchState === 'ENDING' || this.matchState === 'ENDED') return;
    this.matchState = 'ENDING';

    const survivalScore = this.waveManager?.getScore() ?? 0;
    // Highest wave fully cleared = current wave - 1 (current wave was in progress).
    const wavesCleared = Math.max(0, (this.waveManager?.getWave() ?? 1) - 1);

    console.log(`[Match ${this.matchId}] Survival ended. Score: ${survivalScore}, Waves cleared: ${wavesCleared}`);

    for (const human of this.getHumanPlayers()) {
      const msg: MatchEndMessage = {
        type: 'match_end',
        winnerId: '',
        reason: 'survival_defeat',
        stats: human.stats,
        survivalScore,
        wavesCleared,
      };
      if (human.connected && human.socket.readyState === 1) {
        human.socket.send(JSON.stringify(msg));
      }
    }

    setTimeout(() => {
      this.matchState = 'ENDED';
      this.cleanup();
      if (this.onMatchEndCallback) this.onMatchEndCallback(this.matchId);
    }, 2000);
  }

  /**
   * End the match
   */
  private endMatch(winnerId: string, reason: 'health_depleted' | 'disconnect' | 'forfeit'): void {
    if (this.matchState === 'ENDING' || this.matchState === 'ENDED') return;

    this.matchState = 'ENDING';
    console.log(`[Match ${this.matchId}] Match ending. Winner: ${winnerId}, Reason: ${reason}`);

    const winner = this.getPlayer(winnerId);
    const loser: PlayerData | null = winnerId === this.player1.playerId ? this.player2 : this.player1;

    if (!winner || !loser) return;

    // Send match_end to both players
    const winnerMessage: MatchEndMessage = {
      type: 'match_end',
      winnerId: winner.playerId,
      reason,
      stats: winner.stats
    };

    const loserMessage: MatchEndMessage = {
      type: 'match_end',
      winnerId: winner.playerId,
      reason,
      stats: loser.stats
    };

    if (winner.connected && winner.socket.readyState === 1) {
      winner.socket.send(JSON.stringify(winnerMessage));
    }

    if (loser.connected && loser.socket.readyState === 1) {
      loser.socket.send(JSON.stringify(loserMessage));
    }

    // Wait 2 seconds before cleanup
    setTimeout(() => {
      this.matchState = 'ENDED';
      this.cleanup();
      if (this.onMatchEndCallback) {
        this.onMatchEndCallback(this.matchId);
      }
    }, 2000);
  }

  /**
   * Broadcast message to both players
   */
  private broadcast(message: any): void {
    const messageStr = JSON.stringify(message);

    if (this.player1.connected && this.player1.socket.readyState === 1) {
      this.player1.socket.send(messageStr);
    }

    if (this.player2 && this.player2.connected && this.player2.socket.readyState === 1) {
      this.player2.socket.send(messageStr);
    }
  }

  /**
   * Get player by ID
   */
  private getPlayer(playerId: string): PlayerData | null {
    if (this.player1.playerId === playerId) return this.player1;
    if (this.player2 && this.player2.playerId === playerId) return this.player2;
    return null;
  }

  /**
   * Get opponent for a player
   */
  public getOpponent(playerId: string): PlayerData | null {
    if (this.player1.playerId === playerId) return this.player2;
    if (this.player2 && this.player2.playerId === playerId) return this.player1;
    return null;
  }

  /**
   * Generate spawn position based on angle
   */
  private generateSpawnPosition(angle: number): [number, number, number] {
    const distance = ARENA.SPAWN_DISTANCE;
    return [
      Math.sin(angle) * distance,
      ARENA.FLOOR_Y,
      Math.cos(angle) * distance
    ];
  }

  /**
   * Create initial player state
   */
  private createInitialState(position: [number, number, number]): PlayerState {
    return {
      position,
      rotation: [0, 0, 0],
      velocity: [0, 0, 0],
      health: MECH.MAX_HEALTH,
      power: MECH.MAX_POWER,
      jumpFuel: MECH.MAX_JUMP_FUEL,
      isDashing: false,
      isJumping: false,
      abilityActive: false
    };
  }

  /**
   * Create initial stats
   */
  private createInitialStats(): MatchStats {
    return {
      damageDealt: 0,
      damageReceived: 0,
      shotsHit: 0,
      shotsFired: 0,
      timeSurvived: 0
    };
  }

  /**
   * Set match end callback
   */
  public setOnMatchEnd(callback: (matchId: string) => void): void {
    this.onMatchEndCallback = callback;
  }

  /**
   * Get match state
   */
  public getState(): MatchState {
    return this.matchState;
  }

  /**
   * Check if player is in this match
   */
  public hasPlayer(playerId: string): boolean {
    return this.player1.playerId === playerId || this.player2.playerId === playerId;
  }

  /**
   * Handle weapon fire
   */
  private handleWeaponFire(
    player: PlayerData,
    weapon: 'left' | 'right',
    aimDirection: { x: number; y: number; z: number }
  ): void {
    const weaponConfig = weapon === 'left' ? player.loadout.leftWeapon : player.loadout.rightWeapon;
    if (!weaponConfig) return;

    // Fire weapon (consumes resources and sets cooldown)
    player.mech.fireWeapon(weapon);

    // Update stats
    player.stats.shotsFired++;

    // Get muzzle position
    const muzzlePos = player.mech.getMuzzlePosition(weapon);

    // Spawn projectile
    const projectileId = this.projectileSystem.spawnProjectile(
      player.playerId,
      muzzlePos,
      [aimDirection.x, aimDirection.y, aimDirection.z],
      weaponConfig.type,
      weaponConfig.damage
    );

    // Broadcast projectile_spawned event
    const eventId = this.generateEventId();
    this.broadcast({
      type: 'event',
      eventId,
      eventType: 'projectile_spawned',
      data: {
        projectileId,
        ownerId: player.playerId,
        position: muzzlePos,
        weaponType: weaponConfig.type,
        damage: weaponConfig.damage
      }
    });
  }

  /**
   * Handle projectile hit
   */
  private handleProjectileHit(
    projectileId: string,
    hitMechId: string,
    position: [number, number, number],
    damage: number
  ): void {
    // --- Survival: the hit mech may be an AI, and/or the attacker may be one ---
    if (this.gameMode === 'survival') {
      this.handleSurvivalProjectileHit(projectileId, hitMechId, position, damage);
      return;
    }

    const hitPlayer = this.getPlayer(hitMechId);
    if (!hitPlayer) return;

    const attacker = hitPlayer === this.player1 ? this.player2 : this.player1;
    if (!attacker) return;

    // Apply damage
    const defeated = hitPlayer.mech.takeDamage(damage);

    // Update stats
    attacker.stats.shotsHit++;
    attacker.stats.damageDealt += damage;
    hitPlayer.stats.damageReceived += damage;

    // Broadcast damage event
    const damageEventId = this.generateEventId();
    this.broadcast({
      type: 'event',
      eventId: damageEventId,
      eventType: 'damage',
      data: {
        targetId: hitMechId,
        attackerId: attacker.playerId,
        damage,
        newHealth: hitPlayer.state.health
      }
    });

    // Broadcast projectile hit event
    const hitEventId = this.generateEventId();
    this.broadcast({
      type: 'event',
      eventId: hitEventId,
      eventType: 'projectile_hit',
      data: {
        projectileId,
        hitPlayerId: hitMechId,
        position,
        normal: [0, 1, 0] // Simplified
      }
    });

    // Check if mech was destroyed
    if (defeated) {
      this.handleMechDestroyed(hitPlayer, attacker);
    }
  }

  /**
   * Survival projectile-hit resolution. Damage applies to whichever mech (human
   * or AI) was struck; mech_destroyed is emitted but the run only ends via
   * resolveSurvivalState (all humans dead). AI deaths drive wave completion.
   */
  private handleSurvivalProjectileHit(
    projectileId: string,
    hitMechId: string,
    position: [number, number, number],
    damage: number,
  ): void {
    const hitHuman = this.getPlayer(hitMechId);
    const hitAI = this.aiMechs.get(hitMechId);
    const targetMech: MechEntity | null = hitHuman ? hitHuman.mech : (hitAI ? hitAI.mech : null);
    if (!targetMech) return;

    const defeated = targetMech.takeDamage(damage);

    // Attribute stats to the human attacker if the projectile came from one.
    const attacker = this.getPlayer(this.projectileOwnerId(projectileId, hitMechId));
    if (attacker) {
      attacker.stats.shotsHit++;
      attacker.stats.damageDealt += damage;
    }
    if (hitHuman) hitHuman.stats.damageReceived += damage;

    this.emitEvent('damage', {
      targetId: hitMechId,
      attackerId: attacker?.playerId ?? 'ai',
      damage,
      newHealth: targetMech.state.health,
    });

    this.emitEvent('projectile_hit', {
      projectileId,
      hitPlayerId: hitMechId,
      position,
      normal: [0, 1, 0],
    });

    if (defeated) {
      this.broadcastMechDestroyedEvent(
        hitMechId,
        attacker?.playerId ?? 'ai',
        targetMech.state.position,
      );
    }
  }

  /**
   * Best-effort attacker lookup: the ProjectileSystem already removed the
   * projectile by the time we resolve the hit, so we infer the attacker as the
   * human that is NOT the hit mech. (Survival has at most 2 humans; AI-owned
   * projectiles hitting humans simply yield no human attacker.)
   */
  private projectileOwnerId(_projectileId: string, hitMechId: string): string {
    // If an AI was hit, the attacker must be a human (AI never shoots AI).
    if (this.aiMechs.has(hitMechId)) {
      // Prefer player1 unless they were the one hit (they weren't — it's an AI).
      return this.player1.playerId;
    }
    return '';
  }

  /** Broadcast a mech_destroyed event (used by both PvP and survival). */
  private broadcastMechDestroyedEvent(
    playerId: string,
    killerId: string,
    position: [number, number, number],
  ): void {
    this.emitEvent('mech_destroyed', { playerId, killerId, position });
  }

  /**
   * Handle mech destroyed
   */
  private handleMechDestroyed(defeated: PlayerData, victor: PlayerData): void {
    // Broadcast mech_destroyed event
    const eventId = this.generateEventId();
    this.broadcast({
      type: 'event',
      eventId,
      eventType: 'mech_destroyed',
      data: {
        playerId: defeated.playerId,
        killerId: victor.playerId,
        position: defeated.state.position
      }
    });

    // End match
    this.endMatch(victor.playerId, 'health_depleted');
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${this.matchId}_${this.eventIdCounter++}`;
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }

    console.log(`[Match ${this.matchId}] Cleaned up`);
  }
}
