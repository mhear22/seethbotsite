/**
 * Network message types for multiplayer mech battle game
 * Shared between frontend and backend for type safety
 */

// ============================================================================
// Client → Server Messages
// ============================================================================

/**
 * Player input state sent from client to server
 * Sent at variable rate (max 60Hz) when inputs change
 */
export interface InputMessage {
  type: 'input';
  seq: number; // Sequence number for reconciliation
  timestamp: number; // Client timestamp in ms
  input: PlayerInput;
}

export interface PlayerInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  shootLeft: boolean;
  shootRight: boolean;
  dash: boolean;
  useAbility: boolean;
  aimDirection: { x: number; y: number; z: number };
}

/**
 * Request to join matchmaking queue
 */
export interface MatchRequestMessage {
  type: 'match_request';
  loadout: MechLoadout;
}

/**
 * Cancel matchmaking request
 */
export interface CancelMatchmakingMessage {
  type: 'cancel_matchmaking';
}

/**
 * Acknowledgment for critical events
 */
export interface AckMessage {
  type: 'ack';
  eventId: string;
}

/**
 * Ping message for latency measurement
 */
export interface PingMessage {
  type: 'ping';
}

export type ClientMessage =
  | InputMessage
  | MatchRequestMessage
  | CancelMatchmakingMessage
  | AckMessage
  | PingMessage;

// ============================================================================
// Server → Client Messages
// ============================================================================

/**
 * Game state snapshot sent from server at 20Hz
 */
export interface StateSnapshotMessage {
  type: 'state_snapshot';
  serverTime: number; // Server timestamp in ms
  lastProcessedSeq: number; // Last client input seq processed (for reconciliation)
  players: Record<string, PlayerState>;
  projectiles: ProjectileState[];
}

export interface PlayerState {
  position: [number, number, number]; // [x, y, z]
  rotation: [number, number, number]; // [pitch, yaw, roll] in radians
  velocity: [number, number, number]; // [x, y, z]
  health: number; // 0-100
  power: number; // 0-100
  jumpFuel: number; // 0-100
  isDashing: boolean;
  isJumping: boolean;
  abilityActive: boolean;
}

export interface ProjectileState {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  ownerId: string;
  type: 'ballistic' | 'energy' | 'missile';
  damage: number;
}

/**
 * Critical game events (weapon fire, hits, damage, etc.)
 * Sent immediately with acknowledgment required
 */
export interface EventMessage {
  type: 'event';
  eventId: string;
  eventType: GameEventType;
  data: any;
}

export type GameEventType =
  | 'weapon_fire'
  | 'projectile_spawned'
  | 'projectile_hit'
  | 'damage'
  | 'ability_used'
  | 'mech_destroyed';

// Event data types
export interface WeaponFireEvent {
  playerId: string;
  weapon: 'left' | 'right';
  position: [number, number, number];
  direction: [number, number, number];
  timestamp: number;
}

export interface ProjectileSpawnedEvent {
  projectileId: string;
  ownerId: string;
  position: [number, number, number];
  velocity: [number, number, number];
  type: 'ballistic' | 'energy' | 'missile';
  damage: number;
}

export interface ProjectileHitEvent {
  projectileId: string;
  hitPlayerId: string;
  position: [number, number, number];
  normal: [number, number, number];
}

export interface DamageEvent {
  targetId: string;
  attackerId: string;
  damage: number;
  newHealth: number;
}

export interface AbilityUsedEvent {
  playerId: string;
  abilityType: string;
  timestamp: number;
}

export interface MechDestroyedEvent {
  playerId: string;
  killerId: string;
  position: [number, number, number];
}

/**
 * Match found notification
 */
export interface MatchFoundMessage {
  type: 'match_found';
  matchId: string;
  opponentId: string;
  opponentName: string;
  opponentLoadout: MechLoadout;
  yourPlayerId: string;
  yourSpawnPosition: [number, number, number];
  opponentSpawnPosition: [number, number, number];
  arenaBuildings: ArenaBuilding[];
}

export interface ArenaBuilding {
  position: [number, number, number];
  size: [number, number, number];
  type: 'building' | 'cover' | 'obstacle';
}

/**
 * Match lifecycle messages
 */
export interface MatchStartMessage {
  type: 'match_start';
  countdown: number; // Seconds until match starts
}

export interface MatchEndMessage {
  type: 'match_end';
  winnerId: string;
  reason: 'health_depleted' | 'disconnect' | 'forfeit';
  stats: MatchStats;
}

export interface MatchStats {
  damageDealt: number;
  damageReceived: number;
  shotsHit: number;
  shotsFired: number;
  timeSurvived: number; // seconds
}

export interface OpponentDisconnectedMessage {
  type: 'opponent_disconnected';
}

/**
 * Matchmaking status updates
 */
export interface MatchmakingStatusMessage {
  type: 'matchmaking_status';
  status: 'queued' | 'searching' | 'found' | 'cancelled';
  queuePosition?: number;
  estimatedWait?: number; // seconds
}

/**
 * Error messages
 */
export interface ErrorMessage {
  type: 'error';
  code: string;
  message: string;
}

/**
 * Pong response for latency measurement
 */
export interface PongMessage {
  type: 'pong';
}

export type ServerMessage =
  | StateSnapshotMessage
  | EventMessage
  | MatchFoundMessage
  | MatchStartMessage
  | MatchEndMessage
  | OpponentDisconnectedMessage
  | MatchmakingStatusMessage
  | ErrorMessage
  | PongMessage;

// ============================================================================
// Shared Types
// ============================================================================

export interface MechLoadout {
  chassisType: string;
  leftWeapon: WeaponConfig;
  rightWeapon: WeaponConfig;
  ability: AbilityConfig;
  paintScheme?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface WeaponConfig {
  type: 'autocannon' | 'laser' | 'railgun' | 'missile_launcher' | 'plasma_cannon';
  name: string;
  damage: number;
  fireRate: number; // rounds per minute
  projectileSpeed: number;
  energyCost: number;
  cooldown: number; // ms
}

export interface AbilityConfig {
  type: 'shield' | 'speed_boost' | 'emp' | 'repair' | 'cloak';
  name: string;
  duration: number; // ms
  cooldown: number; // ms
  energyCost: number;
}
