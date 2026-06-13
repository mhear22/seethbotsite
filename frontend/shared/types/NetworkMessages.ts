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
 * Game mode for a match.
 * - 'pvp': classic 1v1 player-vs-player (default when absent for backward compat).
 * - 'survival': co-op survival vs escalating server-driven AI waves.
 */
export type GameMode = 'pvp' | 'survival';

/**
 * Request to join matchmaking queue
 */
export interface MatchRequestMessage {
  type: 'match_request';
  loadout: MechLoadout;
  /** Desired game mode. Absent => 'pvp' (existing behavior unchanged). */
  gameMode?: GameMode;
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

  // --- Survival mode (optional; absent in PvP) ---------------------------
  /**
   * Server-controlled AI mechs broadcast as extra entities (survival mode).
   * Keyed by AI mech id. Reuses the PlayerState shape so clients can render
   * them with the same interpolation path as opponent players.
   */
  aiMechs?: Record<string, AIMechState>;
  /** Current survival wave number (1-based). */
  wave?: number;
  /** Accumulated survival score for the match. */
  survivalScore?: number;
  /** True during the brief repair/staging interval between waves. */
  betweenWaves?: boolean;
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

/**
 * Server-controlled AI mech entity (survival mode).
 * Extends the on-wire PlayerState shape with an explicit id and optional
 * presentation/difficulty metadata so clients can label and render waves.
 * All extra fields are optional => safe to render with the PlayerState path.
 */
export interface AIMechState extends PlayerState {
  /** Unique id for this AI mech within the match. */
  id: string;
  /** Difficulty tier driving this AI's stats/loadout. */
  difficulty?: AIDifficultyTier;
  /** Wave this AI belongs to (1-based). */
  wave?: number;
  /** Display name (e.g. "Heavy Mech W3"). */
  name?: string;
  /** Loadout the AI is using (for client model rendering). */
  loadout?: MechLoadout;
}

/**
 * AI difficulty tiers, mirroring the single-player ladder.
 * Steps up the ladder as survival waves progress.
 */
export type AIDifficultyTier = 'tutorial' | 'easy' | 'medium' | 'hard' | 'boss';

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
  | 'mech_destroyed'
  // --- Survival mode events (optional; only emitted in survival mode) ---
  | 'wave_started'
  | 'wave_complete';

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

// --- Survival mode event data ---------------------------------------------

/**
 * Emitted when a new survival wave begins.
 */
export interface WaveStartedEvent {
  /** Wave number that just started (1-based). */
  wave: number;
  /** Difficulty tier for this wave. */
  difficulty: AIDifficultyTier;
  /** Number of AI mechs spawned this wave. */
  enemyCount: number;
  /** Optional preview of the AI loadout(s) for this wave (for HUD/intro). */
  aiLoadoutPreview?: AIMechPreview[];
}

/**
 * Lightweight preview of an AI mech for an upcoming wave.
 */
export interface AIMechPreview {
  id: string;
  name: string;
  difficulty: AIDifficultyTier;
  loadout?: MechLoadout;
}

/**
 * Emitted when a survival wave is fully cleared (all AI destroyed).
 */
export interface WaveCompleteEvent {
  /** Wave number that was just cleared (1-based). */
  wave: number;
  /** Score awarded for clearing this wave. */
  waveScore: number;
  /** Total accumulated survival score after this wave. */
  totalScore: number;
  /** Per-player health restored during the between-wave repair. */
  repair?: WaveRepairInfo[];
  /** Duration (ms) of the between-wave staging interval before the next wave. */
  repairDurationMs?: number;
}

/**
 * Repair applied to a single player between waves.
 */
export interface WaveRepairInfo {
  playerId: string;
  /** Health restored this repair. */
  healthRestored: number;
  /** Player health after the repair. */
  newHealth: number;
}

/**
 * Match found notification
 */
export interface MatchFoundMessage {
  type: 'match_found';
  matchId: string;
  mapId: string;
  opponentId: string;
  opponentName: string;
  opponentLoadout: MechLoadout;
  yourPlayerId: string;
  yourSpawnPosition: [number, number, number];
  opponentSpawnPosition: [number, number, number];
  arenaBuildings: ArenaBuilding[];

  // --- Survival mode (optional; absent in PvP) ---------------------------
  /** Game mode for this match. Absent => 'pvp'. */
  gameMode?: GameMode;
  /** Starting wave for survival matches (typically 1). */
  initialWave?: number;
  /** Initial AI mechs for the first survival wave (preview/spawn info). */
  initialAIMechs?: AIMechPreview[];
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
  /**
   * Why the match ended. 'survival_defeat' is the survival co-op end reason
   * (all human players destroyed). Existing PvP reasons are unchanged.
   */
  reason: 'health_depleted' | 'disconnect' | 'forfeit' | 'survival_defeat';
  stats: MatchStats;
  // --- Survival mode (optional; absent in PvP) ---------------------------
  /** Final survival score (survival mode). */
  survivalScore?: number;
  /** Highest wave reached/cleared (survival mode). */
  wavesCleared?: number;
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
