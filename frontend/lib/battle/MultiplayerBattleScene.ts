/**
 * Multiplayer battle scene
 * Extends BattleScene with network synchronization
 */

import * as THREE from 'three';
import { BattleScene, type BattleSceneConfig } from './BattleScene';
import { NetworkManager } from './NetworkManager';
import { StateInterpolation } from './StateInterpolation';
import { ClientPrediction } from './ClientPrediction';
import { MechEntity } from './MechEntity';
import type { PlayerInput, MechLoadout, PlayerState } from '@shared/types/NetworkMessages';
import { markRaw } from 'vue';

export interface MultiplayerBattleSceneConfig extends Omit<BattleSceneConfig, 'enemyMech'> {
  authToken: string;
  opponentMech: MechEntity;
  opponentName: string;
  opponentLoadout: MechLoadout;
  matchId: string;
  yourPlayerId: string;
  opponentId: string;
  existingNetworkManager?: NetworkManager; // Optional: reuse existing NetworkManager
}

export class MultiplayerBattleScene extends BattleScene {
  private networkManager: NetworkManager;
  private stateInterpolation: StateInterpolation;
  private clientPrediction: ClientPrediction;
  private inputSequence = 0;
  private lastInputSent = 0;
  private readonly MIN_INPUT_INTERVAL = 16; // ~60Hz max
  private matchId: string;
  private yourPlayerId: string;
  private opponentId: string;
  private connected = false;
  private matchStarted = true;
  private ownsNetworkManager = false; // Track if we created the NetworkManager (and should disconnect it)

  // Store event handlers so we can remove them on cleanup
  private eventHandlers = new Map<string, NetworkEventHandler>();

  constructor(config: MultiplayerBattleSceneConfig) {
    // Call parent constructor with opponent mech as enemy
    super({
      ...config,
      enemyMech: config.opponentMech
    });

    this.matchId = config.matchId;
    this.yourPlayerId = config.yourPlayerId;
    this.opponentId = config.opponentId;

    // Initialize network manager - reuse existing if provided, otherwise create new
    if (config.existingNetworkManager) {
      this.networkManager = config.existingNetworkManager;
      this.connected = this.networkManager.isConnected();
      this.ownsNetworkManager = false;
    } else {
      this.networkManager = markRaw(new NetworkManager());
      this.ownsNetworkManager = true;
    }
    this.stateInterpolation = markRaw(new StateInterpolation());

    // Initialize client prediction with player's initial state
    const initialState: PlayerState = {
      position: [this.playerMech.position.x, this.playerMech.position.y, this.playerMech.position.z],
      rotation: [0, this.playerMech.mesh.rotation.y, 0],
      velocity: [0, 0, 0],
      health: this.playerMech.stats.currentHealth,
      power: this.playerMech.currentPower,
      jumpFuel: this.playerMech.jumpFuel,
      isDashing: this.playerMech.isDashing,
      isJumping: false,
      abilityActive: false
    };
    this.clientPrediction = markRaw(new ClientPrediction(initialState));

    // If map was loaded, set arena bounds on client prediction
    if (this.mapDef) {
      this.clientPrediction.setArenaBounds(
        this.mapDef.arena.width,
        this.mapDef.arena.depth,
        this.mapDef.arena.floorY,
        this.mapDef.arena.ceilingY
      );
    }

    // Setup network event handlers
    this.setupNetworkHandlers();

    if (!config.existingNetworkManager) {
      this.connectToServer(config.authToken);
    }
  }

  /**
   * Setup network event handlers
   */
  private setupNetworkHandlers(): void {
    const addHandler = (event: string, handler: NetworkEventHandler) => {
      this.eventHandlers.set(event, handler);
      this.networkManager.on(event, handler);
    };

    addHandler('connected', () => {
      this.connected = true;
    });

    addHandler('disconnected', () => {
      this.connected = false;
    });

    addHandler('state_snapshot', (data) => {
      this.handleStateSnapshot(data);
    });

    addHandler('match_start', () => {
      this.matchStarted = true;
    });

    addHandler('match_end', (data) => {
      this.handleMatchEnd(data);
    });

    addHandler('opponent_disconnected', () => {
      this.handleOpponentDisconnect();
    });

    addHandler('latency_update', () => {});

    addHandler('server_error', (data) => {
      console.error('[MultiplayerBattleScene] Server error:', data);
    });

    addHandler('game_event', (data) => {
      this.handleGameEvent(data);
    });
  }

  /**
   * Connect to multiplayer server
   */
  private async connectToServer(authToken: string): Promise<void> {
    try {
      await this.networkManager.connect(authToken);
    } catch (error) {
      console.error('[MultiplayerBattleScene] Failed to connect:', error);
    }
  }

  /**
   * Handle state snapshot from server
   */
  private handleStateSnapshot(snapshot: any): void {
    if (!snapshot.players) return;

    // Get our player state from server for reconciliation
    const serverPlayerState = snapshot.players[this.yourPlayerId];
    if (serverPlayerState) {
      // Reconcile client prediction with server state
      this.clientPrediction.reconcile(serverPlayerState, snapshot.lastProcessedSeq);

      // Apply predicted state to player mech
      const predictedState = this.clientPrediction.getPredictedState();
      this.playerMech.position.set(
        predictedState.position[0],
        predictedState.position[1],
        predictedState.position[2]
      );
      this.playerMech.mesh.rotation.y = predictedState.rotation[1];
      //this.playerMech.health = predictedState.health;
      //this.playerMech.power = predictedState.power;
      this.playerMech.jumpFuel = predictedState.jumpFuel;
      this.playerMech.isDashing = predictedState.isDashing;
    }

    // Get opponent state
    const opponentState = snapshot.players[this.opponentId];
    if (!opponentState) return;

    // Add to interpolation buffer - actual state application happens in update()
    this.stateInterpolation.addState(opponentState, snapshot.serverTime);

    // Sync projectiles from server snapshot
    if (snapshot.projectiles) {
      this.projectileSystem.syncFromSnapshot(snapshot.projectiles, this.yourPlayerId);
    }
  }

  /**
   * Handle match end
   */
  private handleMatchEnd(data: any): void {
    const isVictory = data.winnerId === this.yourPlayerId;
    // The battle ending animation should already be triggered by mech_destroyed event
    // This just ensures we call the callback if not already ending
    if (!this.battleEnding) {
      this.onBattleEnd(isVictory ? 'victory' : 'defeat');
    }
  }

  /**
   * Handle opponent disconnect
   */
  private handleOpponentDisconnect(): void {
    // You win by default
    if (!this.battleEnding) {
      this.battleEnding = true;
      this.battleEndTimer = 2.0;
      this.battleEndResult = 'victory';
      this.enemyMech.isDestroyed = true;

      this.particleSystem.spawnExplosion(this.enemyMech.position.clone());
      this.camera.triggerShake(1.0);
    }
  }

  /**
   * Handle game events from server
   */
  private handleGameEvent(event: any): void {
    if (!event || !event.eventType) return;

    switch (event.eventType) {
      case 'projectile_spawned':
        this.handleProjectileSpawned(event.data);
        break;

      case 'projectile_hit':
        this.handleProjectileHit(event.data);
        break;

      case 'damage':
        this.handleDamage(event.data);
        break;

      case 'mech_destroyed':
        this.handleMechDestroyed(event.data);
        break;

      case 'weapon_fire':
        // Optional: play weapon fire sound/animation
        break;

      default:
        console.warn('[MultiplayerBattleScene] Unknown event type:', event.eventType);
    }

    // Send acknowledgment for critical events
    if (event.eventId) {
      this.networkManager.sendAck(event.eventId);
    }
  }

  /**
   * Handle projectile spawned event - create visual projectile immediately
   */
  private handleProjectileSpawned(data: any): void {
    // Visual projectile will be created/synced from state snapshots
    // This event fires for immediate feedback but snapshot sync handles the rest
  }

  private handleProjectileHit(data: any): void {
    if (!data.position) return;

    const impactPos = new THREE.Vector3(
      data.position[0],
      data.position[1],
      data.position[2]
    );

    this.particleSystem.spawnHitEffect(impactPos, 'ballistic');

    // Remove the projectile visually
    if (data.projectileId) {
      this.projectileSystem.removeById(data.projectileId);
    }
  }

  /**
   * Handle damage event
   */
  private handleDamage(data: any): void {
    const targetMech = data.targetId === this.yourPlayerId ? this.playerMech : this.enemyMech;

    // Update health immediately for visual feedback (server snapshot will confirm)
    targetMech.stats.currentHealth = data.newHealth;

    // Screen shake when player takes damage
    if (data.targetId === this.yourPlayerId) {
      this.camera.triggerShake(0.4);
    }
  }

  /**
   * Handle mech destroyed event
   */
  private handleMechDestroyed(data: any): void {
    const destroyedMech = data.playerId === this.yourPlayerId ? this.playerMech : this.enemyMech;
    const isVictory = data.playerId !== this.yourPlayerId;

    this.particleSystem.spawnExplosion(destroyedMech.position.clone());
    this.camera.triggerShake(1.0);

    destroyedMech.isDestroyed = true;
    this.battleEnding = true;
    this.battleEndTimer = 2.0;
    this.battleEndResult = isVictory ? 'victory' : 'defeat';
  }

  // Counter for periodic interpolation delay adjustment
  private adjustDelayCounter = 0;

  /**
   * Override update method for multiplayer
   * Only runs: player physics, camera, particles, network input, and opponent interpolation.
   * Skips: enemy AI, local projectile collisions, local damage/combat.
   */
  protected update(deltaTime: number): void {
    // Update particles
    this.particleSystem.update(deltaTime);

    // Handle battle ending animation
    if (this.battleEnding) {
      this.battleEndTimer -= deltaTime;
      const defeated = this.battleEndResult === 'victory' ? this.enemyMech : this.playerMech;
      defeated.playDestroyAnimation(deltaTime);

      const input = this.inputManager.getInputState();
      this.camera.update(deltaTime, input.mouseX, input.mouseY);
      this.inputManager.resetMouseMovement();

      if (this.battleEndTimer <= 0) {
        this.onBattleEnd(this.battleEndResult);
        this.stop();
      }
      return;
    }

    const input = this.inputManager.getInputState();

    // Update player mech physics (local prediction)
    this.physicsSystem.updateDash(this.playerMech, input, deltaTime);
    if (!this.playerMech.isDashing) {
      this.physicsSystem.updateMovement(this.playerMech, input, deltaTime);
    }
    this.physicsSystem.updateJumpJets(this.playerMech, input, deltaTime);
    // Skip building collisions for player in multiplayer - server is authoritative
    this.playerMech.update(deltaTime);
    this.playerMech.updatePower(deltaTime);

    // Send inputs to server
    if (this.connected && this.matchStarted) {
      this.sendInputToServer();
    }

    // Update projectiles (move them based on velocity between server snapshots)
    this.projectileSystem.update(deltaTime);

    // Interpolate opponent position for smooth rendering
    const currentState = this.stateInterpolation.getInterpolatedState(Date.now());
    if (currentState) {
      this.enemyMech.position.set(
        currentState.position[0],
        currentState.position[1],
        currentState.position[2]
      );
      this.enemyMech.rotation.y = currentState.rotation[1];
      this.enemyMech.stats.currentHealth = currentState.health;
      this.enemyMech.currentPower = currentState.power;
      this.enemyMech.jumpFuel = currentState.jumpFuel;
      this.enemyMech.isDashing = currentState.isDashing;
    }
    this.enemyMech.update(deltaTime);

    // Update camera
    this.camera.update(deltaTime, input.mouseX, input.mouseY);
    this.inputManager.resetMouseMovement();

    // Adjust interpolation delay every ~100 frames instead of randomly
    this.adjustDelayCounter++;
    if (this.adjustDelayCounter >= 100) {
      this.adjustDelayCounter = 0;
      this.stateInterpolation.adjustRenderDelay();
    }
  }

  /**
   * Send player input to server
   */
  private sendInputToServer(): void {
    const now = Date.now();

    // Rate limit input sends
    if (now - this.lastInputSent < this.MIN_INPUT_INTERVAL) {
      return;
    }

    this.lastInputSent = now;
    this.inputSequence++;

    // Get current input state
    const inputState = this.inputManager.getInputState();

    if (!inputState) return;

    // Get aim direction from camera
    const aimDirection = this.playerMech.getForwardDirection();

    // Create input message
    const input: PlayerInput = {
      forward: inputState.forward,
      backward: inputState.backward,
      left: inputState.left,
      right: inputState.right,
      jump: inputState.jump,
      shootLeft: inputState.shootLeft,
      shootRight: inputState.shootRight,
      dash: inputState.dash,
      useAbility: inputState.useAbility,
      aimDirection: {
        x: aimDirection.x,
        y: aimDirection.y,
        z: aimDirection.z
      }
    };

    // Add input to prediction buffer for reconciliation
    this.clientPrediction.addInput(this.inputSequence, input);

    // Send to server
    this.networkManager.sendInput(this.inputSequence, input);
  }

  /**
   * Override cleanup to disconnect network (only if we created it)
   */
  cleanup(): void {
    super.cleanup();

    // Remove our event handlers from the NetworkManager
    for (const [event, handler] of this.eventHandlers.entries()) {
      this.networkManager.off(event, handler);
    }
    this.eventHandlers.clear();

    if (this.ownsNetworkManager) {
      this.networkManager.disconnect();
    }

    this.stateInterpolation.clear();
  }

  /**
   * Get client prediction (for debugging)
   */
  getClientPrediction(): ClientPrediction {
    return this.clientPrediction;
  }

  /**
   * Get network manager (for HUD to display latency)
   */
  getNetworkManager(): NetworkManager {
    return this.networkManager;
  }

  /**
   * Get match ID
   */
  getMatchId(): string {
    return this.matchId;
  }
}
