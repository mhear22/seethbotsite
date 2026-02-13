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
  MechLoadout
} from '../shared/types/NetworkMessages';
import {
  NETWORK,
  ARENA,
  MECH,
  PHYSICS,
  COMBAT
} from '../shared/constants/GameConstants';
import { MechEntity } from '../game/MechEntity';
import { ProjectileSystem } from '../game/ProjectileSystem';
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

export class MatchInstance {
  public readonly matchId: string;
  private player1: PlayerData;
  private player2: PlayerData;
  private matchState: MatchState = 'COUNTDOWN';
  private projectileSystem: ProjectileSystem;
  private tickInterval: NodeJS.Timeout | null = null;
  private serverTime: number = Date.now();
  private matchStartTime: number = Date.now();
  private countdownRemaining: number = 3;
  private onMatchEndCallback: ((matchId: string) => void) | null = null;
  private eventIdCounter = 0;

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
    player2Id: string,
    player2Name: string,
    player2Loadout: MechLoadout,
    player2Socket: any,
    map?: MapDefinition
  ) {
    this.matchId = matchId;

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

    // Initialize player 2
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

    console.log(`[Match ${matchId}] Created: ${player1Name} vs ${player2Name} on ${map?.name ?? 'default arena'}`);
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
        this.startGameLoop();
      }
    }, 1000);
  }

  /**
   * Start the main game loop at 20Hz
   */
  private startGameLoop(): void {
    this.matchStartTime = Date.now();
    this.tickInterval = setInterval(() => {
      this.tick();
    }, NETWORK.SNAPSHOT_INTERVAL);
  }

  /**
   * Main game tick - update physics and send state snapshot
   */
  private tick(): void {
    this.serverTime = Date.now();
    const deltaTime = NETWORK.SNAPSHOT_INTERVAL / 1000;
    const matchElapsed = (this.serverTime - this.matchStartTime) / 1000;

    // Update player physics based on last input
    this.updatePlayerPhysics(this.player1);
    this.updatePlayerPhysics(this.player2);

    // Check building collisions for both players
    this.checkBuildingCollisions(this.player1);
    this.checkBuildingCollisions(this.player2);

    // Process dynamic elements (conveyors, rotating arms, pistons)
    if (this.map) {
      this.processDynamicElements(matchElapsed, deltaTime);
      this.processHazardZones(matchElapsed);
    }

    // Update cooldowns
    this.player1.mech.updateCooldowns(deltaTime);
    this.player2.mech.updateCooldowns(deltaTime);

    // Update projectiles
    this.projectileSystem.update(deltaTime);

    // Check projectile collisions
    const hits = this.projectileSystem.checkCollisions([
      this.player1.mech,
      this.player2.mech
    ]);

    // Process hits
    for (const hit of hits) {
      this.handleProjectileHit(hit.projectileId, hit.hitMechId, hit.position, hit.damage);
    }

    // Send state snapshot to both players
    this.sendStateSnapshot();
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
   * Check building AABB collisions and push mech out
   */
  private checkBuildingCollisions(player: PlayerData): void {
    if (this.buildingAABBs.length === 0) return;

    const state = player.state;
    const mechRadius = 2;
    const px = state.position[0];
    const py = state.position[1];
    const pz = state.position[2];

    for (const aabb of this.buildingAABBs) {
      // Check if mech center is near the AABB (with radius)
      const closestX = Math.max(aabb.minX, Math.min(px, aabb.maxX));
      const closestZ = Math.max(aabb.minZ, Math.min(pz, aabb.maxZ));

      // Only check Y overlap for buildings mech could be at (not above/below)
      if (py + 3 < aabb.minY || py > aabb.maxY) continue;

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
          for (const player of [this.player1, this.player2]) {
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

          for (const player of [this.player1, this.player2]) {
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
            for (const player of [this.player1, this.player2]) {
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

      for (const player of [this.player1, this.player2]) {
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
    const victor = defeated === this.player1 ? this.player2 : this.player1;
    this.handleMechDestroyed(defeated, victor);
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
    const snapshot: StateSnapshotMessage = {
      type: 'state_snapshot',
      serverTime: this.serverTime,
      lastProcessedSeq: 0, // Will be set per player
      players: {
        [this.player1.playerId]: this.player1.state,
        [this.player2.playerId]: this.player2.state
      },
      projectiles: this.projectileSystem.getProjectileStates()
    };

    // Send to player 1 with their last seq
    if (this.player1.connected && this.player1.socket.readyState === 1) {
      const p1Snapshot = { ...snapshot, lastProcessedSeq: this.player1.lastInputSeq };
      this.player1.socket.send(JSON.stringify(p1Snapshot));
    }

    // Send to player 2 with their last seq
    if (this.player2.connected && this.player2.socket.readyState === 1) {
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

    if (this.matchState === 'ACTIVE') {
      // Notify opponent of disconnection
      const opponent = playerId === this.player1.playerId ? this.player2 : this.player1;

      if (opponent.connected && opponent.socket.readyState === 1) {
        opponent.socket.send(JSON.stringify({
          type: 'opponent_disconnected'
        }));
      }

      // End match - opponent wins by forfeit
      this.endMatch(opponent.playerId, 'disconnect');
    } else if (this.matchState === 'COUNTDOWN') {
      // Cancel match during countdown
      console.log(`[Match ${this.matchId}] Match cancelled during countdown`);

      // Notify other player
      const opponent = playerId === this.player1.playerId ? this.player2 : this.player1;
      if (opponent.connected && opponent.socket.readyState === 1) {
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
   * End the match
   */
  private endMatch(winnerId: string, reason: 'health_depleted' | 'disconnect' | 'forfeit'): void {
    if (this.matchState === 'ENDING' || this.matchState === 'ENDED') return;

    this.matchState = 'ENDING';
    console.log(`[Match ${this.matchId}] Match ending. Winner: ${winnerId}, Reason: ${reason}`);

    const winner = this.getPlayer(winnerId);
    const loser = winnerId === this.player1.playerId ? this.player2 : this.player1;

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

    if (this.player2.connected && this.player2.socket.readyState === 1) {
      this.player2.socket.send(messageStr);
    }
  }

  /**
   * Get player by ID
   */
  private getPlayer(playerId: string): PlayerData | null {
    if (this.player1.playerId === playerId) return this.player1;
    if (this.player2.playerId === playerId) return this.player2;
    return null;
  }

  /**
   * Get opponent for a player
   */
  public getOpponent(playerId: string): PlayerData | null {
    if (this.player1.playerId === playerId) return this.player2;
    if (this.player2.playerId === playerId) return this.player1;
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
    const hitPlayer = this.getPlayer(hitMechId);
    if (!hitPlayer) return;

    const attacker = hitPlayer === this.player1 ? this.player2 : this.player1;

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
