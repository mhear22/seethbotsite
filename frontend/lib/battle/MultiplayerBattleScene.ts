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
import { PlayerInput, MechLoadout, PlayerState } from '../../shared/types/NetworkMessages';
import { markRaw } from 'vue';

export interface MultiplayerBattleSceneConfig extends Omit<BattleSceneConfig, 'enemyMech'> {
  authToken: string;
  opponentMech: MechEntity;
  opponentName: string;
  opponentLoadout: MechLoadout;
  matchId: string;
  yourPlayerId: string;
  opponentId: string;
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

  constructor(config: MultiplayerBattleSceneConfig) {
    // Call parent constructor with opponent mech as enemy
    super({
      ...config,
      enemyMech: config.opponentMech
    });

    this.matchId = config.matchId;
    this.yourPlayerId = config.yourPlayerId;
    this.opponentId = config.opponentId;

    // Initialize network manager
    this.networkManager = markRaw(new NetworkManager());
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

    // Connect to server
    this.connectToServer(config.authToken);
  }

  /**
   * Setup network event handlers
   */
  private setupNetworkHandlers(): void {
    this.networkManager.on('connected', () => {
      console.log('[MultiplayerBattleScene] Connected to server');
      this.connected = true;
    });

    this.networkManager.on('disconnected', () => {
      console.log('[MultiplayerBattleScene] Disconnected from server');
      this.connected = false;
      // Handle disconnection (show message, return to menu, etc.)
    });

    this.networkManager.on('state_snapshot', (data) => {
      this.handleStateSnapshot(data);
    });

    this.networkManager.on('match_start', (data) => {
      console.log('[MultiplayerBattleScene] Match starting:', data);
      this.matchStarted = true;
    });

    this.networkManager.on('match_end', (data) => {
      console.log('[MultiplayerBattleScene] Match ended:', data);
      this.handleMatchEnd(data);
    });

    this.networkManager.on('opponent_disconnected', () => {
      console.log('[MultiplayerBattleScene] Opponent disconnected');
      // Handle opponent disconnect - you win by default
      this.handleOpponentDisconnect();
    });

    this.networkManager.on('latency_update', (data) => {
      // Update latency display (will be used in Phase 4 for HUD)
      // console.log('[MultiplayerBattleScene] RTT:', data.rtt);
    });

    this.networkManager.on('server_error', (data) => {
      console.error('[MultiplayerBattleScene] Server error:', data);
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
      this.playerMech.health = predictedState.health;
      this.playerMech.power = predictedState.power;
      this.playerMech.jumpFuel = predictedState.jumpFuel;
      this.playerMech.isDashing = predictedState.isDashing;
    }

    // Get opponent state
    const opponentState = snapshot.players[this.opponentId];
    if (!opponentState) return;

    // Add to interpolation buffer
    this.stateInterpolation.addState(opponentState, snapshot.serverTime);

    // Get interpolated state
    const interpolatedState = this.stateInterpolation.getInterpolatedState(Date.now());
    if (!interpolatedState) return;

    // Apply interpolated state to enemy mech (opponent)
    this.enemyMech.position.set(
      interpolatedState.position[0],
      interpolatedState.position[1],
      interpolatedState.position[2]
    );

    this.enemyMech.mesh.rotation.y = interpolatedState.rotation[1];

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
    // Trigger battle end animation
    (this as any).triggerBattleEnd(isVictory ? 'victory' : 'defeat');
  }

  /**
   * Handle opponent disconnect
   */
  private handleOpponentDisconnect(): void {
    // You win by default
    (this as any).triggerBattleEnd('victory');
  }

  /**
   * Override update method to send inputs to server
   */
  protected update(deltaTime: number): void {
    // Call parent update for rendering and local simulation
    super.update(deltaTime);

    // Send inputs to server if connected and match started
    if (this.connected && this.matchStarted) {
      this.sendInputToServer();
    }

    // Periodically adjust interpolation delay based on jitter
    if (Math.random() < 0.01) { // 1% chance each frame
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
   * Override cleanup to disconnect network
   */
  cleanup(): void {
    super.cleanup();
    this.networkManager.disconnect();
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
