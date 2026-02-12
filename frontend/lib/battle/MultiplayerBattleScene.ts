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
  private matchStarted = false;
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
      console.log('[MultiplayerBattleScene] Reusing existing NetworkManager');
      this.networkManager = config.existingNetworkManager;
      this.connected = this.networkManager.isConnected();
      this.ownsNetworkManager = false; // We don't own this, don't disconnect on cleanup
    } else {
      console.log('[MultiplayerBattleScene] Creating new NetworkManager');
      this.networkManager = markRaw(new NetworkManager());
      this.ownsNetworkManager = true; // We created it, we should disconnect on cleanup
    }
    this.stateInterpolation = markRaw(new StateInterpolation());

    // Initialize client prediction with player's initial state
    const initialState: PlayerState = {
      position: [this.playerMech.position.x, this.playerMech.position.y, this.playerMech.position.z],
      rotation: [0, this.playerMech.mesh.rotation.y, 0],
      velocity: [0, 0, 0],
      health: this.playerMech.health,
      power: this.playerMech.power,
      jumpFuel: this.playerMech.jumpFuel,
      isDashing: this.playerMech.isDashing,
      isJumping: false,
      abilityActive: false
    };
    this.clientPrediction = markRaw(new ClientPrediction(initialState));

    // Setup network event handlers
    this.setupNetworkHandlers();

    // Connect to server only if we created a new NetworkManager
    if (!config.existingNetworkManager) {
      this.connectToServer(config.authToken);
    } else {
      console.log('[MultiplayerBattleScene] Skipping connection - already connected');
    }
  }

  /**
   * Setup network event handlers
   */
  private setupNetworkHandlers(): void {
    // Helper to register and track handlers
    const addHandler = (event: string, handler: NetworkEventHandler) => {
      this.eventHandlers.set(event, handler);
      this.networkManager.on(event, handler);
    };

    addHandler('connected', () => {
      console.log('[MultiplayerBattleScene] Connected to server');
      this.connected = true;
    });

    addHandler('disconnected', () => {
      console.log('[MultiplayerBattleScene] Disconnected from server');
      this.connected = false;
      // Handle disconnection (show message, return to menu, etc.)
    });

    addHandler('state_snapshot', (data) => {
      this.handleStateSnapshot(data);
    });

    addHandler('match_start', (data) => {
      console.log('[MultiplayerBattleScene] Match starting:', data);
      this.matchStarted = true;
    });

    addHandler('match_end', (data) => {
      console.log('[MultiplayerBattleScene] Match ended:', data);
      this.handleMatchEnd(data);
    });

    addHandler('opponent_disconnected', () => {
      console.log('[MultiplayerBattleScene] Opponent disconnected');
      // Handle opponent disconnect - you win by default
      this.handleOpponentDisconnect();
    });

    addHandler('latency_update', (data) => {
      // Update latency display (will be used in Phase 4 for HUD)
      // console.log('[MultiplayerBattleScene] RTT:', data.rtt);
    });

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
      console.log('[MultiplayerBattleScene] Successfully connected');
    } catch (error) {
      console.error('[MultiplayerBattleScene] Failed to connect:', error);
      // Handle connection failure (show error, return to menu)
    }
  }

  /**
   * Handle state snapshot from server
   */
  private handleStateSnapshot(snapshot: any): void {
    if (!snapshot.players) {
      console.warn('[MultiplayerBattleScene] No players in snapshot');
      return;
    }

    // Debug: Log player IDs in snapshot
    const playerIdsInSnapshot = Object.keys(snapshot.players);
    console.log('[MultiplayerBattleScene] Snapshot player IDs:', playerIdsInSnapshot);
    console.log('[MultiplayerBattleScene] My ID:', this.yourPlayerId, 'Opponent ID:', this.opponentId);

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
    } else {
      console.warn('[MultiplayerBattleScene] No player state for yourPlayerId:', this.yourPlayerId);
    }

    // Get opponent state
    const opponentState = snapshot.players[this.opponentId];
    if (!opponentState) {
      console.warn('[MultiplayerBattleScene] No opponent state for opponentId:', this.opponentId);
      console.warn('[MultiplayerBattleScene] Available player IDs in snapshot:', playerIdsInSnapshot);
      return;
    }

    // Add to interpolation buffer
    this.stateInterpolation.addState(opponentState, snapshot.serverTime);

    // Get interpolated state
    const interpolatedState = this.stateInterpolation.getInterpolatedState(Date.now());
    if (!interpolatedState) {
      console.warn('[MultiplayerBattleScene] No interpolated state available');
      return;
    }

    // Debug: Log opponent position every second
    if (Math.random() < 0.05) { // ~20Hz / 20 = once per second
      console.log('[MultiplayerBattleScene] Opponent pos:', interpolatedState.position);
    }

    // Apply interpolated state to enemy mech (opponent)
    this.enemyMech.position.set(
      interpolatedState.position[0],
      interpolatedState.position[1],
      interpolatedState.position[2]
    );

    // Update rotation on the MechEntity, not directly on mesh
    // (mesh rotation gets synced from this.rotation in update())
    this.enemyMech.rotation.y = interpolatedState.rotation[1];

    // Update health/power bars
    this.enemyMech.health = interpolatedState.health;
    this.enemyMech.power = interpolatedState.power;
    this.enemyMech.jumpFuel = interpolatedState.jumpFuel;

    // Update flags
    this.enemyMech.isDashing = interpolatedState.isDashing;
  }

  /**
   * Handle match end
   */
  private handleMatchEnd(data: any): void {
    const isVictory = data.winnerId === this.yourPlayerId;
    // The battle ending animation should already be triggered by mech_destroyed event
    // This just ensures we call the callback if not already ending
    if (!(this as any).battleEnding) {
      this.onBattleEnd(isVictory ? 'victory' : 'defeat');
    }
  }

  /**
   * Handle opponent disconnect
   */
  private handleOpponentDisconnect(): void {
    // You win by default
    if (!(this as any).battleEnding) {
      (this as any).battleEnding = true;
      (this as any).battleEndTimer = 2.0;
      (this as any).battleEndResult = 'victory';
      this.enemyMech.isDestroyed = true;

      const particleSystem = (this as any).particleSystem;
      const camera = (this as any).camera;
      if (particleSystem && camera) {
        particleSystem.spawnExplosion(this.enemyMech.position.clone());
        camera.triggerShake(1.0);
      }
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
   * Handle projectile spawned event
   */
  private handleProjectileSpawned(data: any): void {
    // Access projectile system from parent class
    const projectileSystem = (this as any).projectileSystem;
    if (!projectileSystem) return;

    // Determine which mech fired (for visual projectile spawning)
    const shooter = data.ownerId === this.yourPlayerId ? this.playerMech : this.enemyMech;

    // Create visual projectile
    // The projectile system will handle the visual representation
    // Server is authoritative for hit detection
    console.log('[MultiplayerBattleScene] Projectile spawned:', data.projectileId);
  }

  /**
   * Handle projectile hit event
   */
  private handleProjectileHit(data: any): void {
    const particleSystem = (this as any).particleSystem;
    const audio = (this as any).audio;

    if (!particleSystem || !audio) return;

    // Spawn impact effects at hit position
    const impactPos = new THREE.Vector3(
      data.position[0],
      data.position[1],
      data.position[2]
    );

    particleSystem.spawnHitEffect(impactPos, 'ballistic');
    //audio.playBulletHitMech();

    console.log('[MultiplayerBattleScene] Projectile hit:', data);
  }

  /**
   * Handle damage event
   */
  private handleDamage(data: any): void {
    const targetMech = data.targetId === this.yourPlayerId ? this.playerMech : this.enemyMech;

    // Update health (server state will update in next snapshot, but this provides immediate feedback)
    targetMech.health = data.newHealth;

    // Visual feedback for taking damage
    // Could add screen shake, red flash, etc.

    console.log('[MultiplayerBattleScene] Damage:', data.damage, 'to', data.targetId);
  }

  /**
   * Handle mech destroyed event
   */
  private handleMechDestroyed(data: any): void {
    console.log('[MultiplayerBattleScene] Mech destroyed:', data.playerId);

    // Determine which mech was destroyed
    const destroyedMech = data.playerId === this.yourPlayerId ? this.playerMech : this.enemyMech;
    const isVictory = data.playerId !== this.yourPlayerId;

    // Trigger battle ending animation
    const particleSystem = (this as any).particleSystem;
    const camera = (this as any).camera;

    if (particleSystem && camera) {
      particleSystem.spawnExplosion(destroyedMech.position.clone());
      camera.triggerShake(1.0);
    }

    destroyedMech.isDestroyed = true;
    (this as any).battleEnding = true;
    (this as any).battleEndTimer = 2.0;
    (this as any).battleEndResult = isVictory ? 'victory' : 'defeat';
  }

  /**
   * Override update method to send inputs to server
   * In multiplayer, we skip the parent's enemy AI/physics updates
   * since the opponent is controlled by network state
   */
  protected update(deltaTime: number): void {
    // We need to manually do what parent does but skip enemy AI
    // This is a simplified version - in production you might want to refactor
    // the parent class to make enemy updates optional

    // For now, just call parent update which includes both player and enemy
    // The enemy AI will run, but network state will override it each snapshot
    super.update(deltaTime);

    // Send inputs to server if connected and match started
    if (this.connected && this.matchStarted) {
      this.sendInputToServer();
    }

    // Periodically adjust interpolation delay based on jitter
    if (Math.random() < 0.01) { // 1% chance each frame
      this.stateInterpolation.adjustRenderDelay();
    }

    // Apply the latest interpolated state for smooth opponent movement
    // This ensures network state takes priority over any AI movement
    const currentState = this.stateInterpolation.getInterpolatedState(Date.now());
    if (currentState) {
      // Debug: Log when applying interpolated state
      if (Math.random() < 0.02) { // ~2% of frames
        console.log('[MultiplayerBattleScene] Applying interpolated state to enemy:', currentState.position);
      }

      this.enemyMech.position.set(
        currentState.position[0],
        currentState.position[1],
        currentState.position[2]
      );
      this.enemyMech.rotation.y = currentState.rotation[1];
    } else if (Math.random() < 0.02) {
      console.warn('[MultiplayerBattleScene] No interpolated state available in update()');
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
    const inputState = (this as any).inputManager.getInputState();

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

    // Only disconnect if we created the NetworkManager
    // If it was passed to us, the parent component owns it and will manage its lifecycle
    if (this.ownsNetworkManager) {
      console.log('[MultiplayerBattleScene] Disconnecting NetworkManager (we own it)');
      this.networkManager.disconnect();
    } else {
      console.log('[MultiplayerBattleScene] Not disconnecting NetworkManager (we don\'t own it)');
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
