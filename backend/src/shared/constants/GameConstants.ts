/**
 * Shared game constants for multiplayer mech battle
 * Used by both client and server to ensure consistent behavior
 */

// ============================================================================
// Network Configuration
// ============================================================================

export const NETWORK = {
  /** Server sends state snapshots at this rate (Hz) */
  SERVER_TICK_RATE: 20,

  /** Time between state snapshots (ms) */
  SNAPSHOT_INTERVAL: 50, // 1000ms / 20Hz

  /** Maximum client input rate (Hz) */
  MAX_CLIENT_INPUT_RATE: 60,

  /** Minimum time between client inputs (ms) */
  MIN_INPUT_INTERVAL: 16, // 1000ms / 60Hz

  /** Client interpolation buffer duration (ms) */
  INTERPOLATION_BUFFER: 100,

  /** Maximum age for inputs before rejection (ms) */
  MAX_INPUT_AGE: 1000,

  /** Timeout for client disconnection (ms) */
  CLIENT_TIMEOUT: 5000,

  /** Ping interval for keep-alive (ms) */
  PING_INTERVAL: 2000,
} as const;

// ============================================================================
// Arena Configuration
// ============================================================================

export const ARENA = {
  /** Arena width (1v1 mode) */
  WIDTH: 300,

  /** Arena depth (1v1 mode) */
  DEPTH: 300,

  /** Arena floor level */
  FLOOR_Y: 0,

  /** Ceiling height (out of bounds above) */
  CEILING_Y: 100,

  /** Number of random buildings in arena */
  BUILDING_COUNT: 8,

  /** Minimum building size */
  MIN_BUILDING_SIZE: [5, 10, 5] as [number, number, number],

  /** Maximum building size */
  MAX_BUILDING_SIZE: [15, 25, 15] as [number, number, number],

  /** Safe spawn distance from center */
  SPAWN_DISTANCE: 100,
} as const;

// ============================================================================
// Physics Configuration
// ============================================================================

export const PHYSICS = {
  /** Gravity acceleration (units/s²) */
  GRAVITY: -30,

  /** Ground friction coefficient */
  GROUND_FRICTION: 0.15,

  /** Air friction coefficient */
  AIR_FRICTION: 0.02,

  /** Maximum falling speed */
  MAX_FALL_SPEED: -50,

  /** Collision detection precision (world units) */
  COLLISION_EPSILON: 0.01,
} as const;

// ============================================================================
// Mech Configuration
// ============================================================================

export const MECH = {
  /** Maximum health points */
  MAX_HEALTH: 100,

  /** Maximum power/energy */
  MAX_POWER: 100,

  /** Power regeneration rate (per second) */
  POWER_REGEN: 10,

  /** Maximum jump fuel */
  MAX_JUMP_FUEL: 100,

  /** Jump fuel consumption rate (per second while jumping) */
  JUMP_FUEL_CONSUMPTION: 25,

  /** Jump fuel regeneration rate (per second on ground) */
  JUMP_FUEL_REGEN: 20,

  /** Ground movement speed (units/s) */
  MOVE_SPEED: 15,

  /** Air movement speed (units/s) */
  AIR_MOVE_SPEED: 10,

  /** Jump thrust force */
  JUMP_THRUST: 40,

  /** Dash speed multiplier */
  DASH_SPEED_MULTIPLIER: 2.5,

  /** Dash duration (ms) */
  DASH_DURATION: 300,

  /** Dash cooldown (ms) */
  DASH_COOLDOWN: 2000,

  /** Dash energy cost */
  DASH_ENERGY_COST: 20,

  /** Turn speed (radians/s) */
  TURN_SPEED: Math.PI,

  /** Mech bounding box dimensions */
  DIMENSIONS: {
    WIDTH: 4,
    HEIGHT: 6,
    DEPTH: 4,
  },
} as const;

// ============================================================================
// Combat Configuration
// ============================================================================

export const COMBAT = {
  /** Weapon configurations by type */
  WEAPONS: {
    autocannon: {
      damage: 8,
      fireRate: 300, // RPM
      projectileSpeed: 100,
      energyCost: 5,
      cooldown: 200, // ms
      projectileType: 'ballistic' as const,
    },
    laser: {
      damage: 12,
      fireRate: 120,
      projectileSpeed: 200,
      energyCost: 8,
      cooldown: 500,
      projectileType: 'energy' as const,
    },
    railgun: {
      damage: 35,
      fireRate: 30,
      projectileSpeed: 300,
      energyCost: 25,
      cooldown: 2000,
      projectileType: 'ballistic' as const,
    },
    missile_launcher: {
      damage: 20,
      fireRate: 60,
      projectileSpeed: 50,
      energyCost: 15,
      cooldown: 1000,
      projectileType: 'missile' as const,
    },
    plasma_cannon: {
      damage: 15,
      fireRate: 90,
      projectileSpeed: 80,
      energyCost: 12,
      cooldown: 667,
      projectileType: 'energy' as const,
    },
  },

  /** Projectile lifetime (ms) */
  PROJECTILE_LIFETIME: 5000,

  /** Projectile radius for collision detection */
  PROJECTILE_RADIUS: 0.3,

  /** Hit detection tolerance (units) */
  HIT_TOLERANCE: 1.0,

  /** Maximum lag compensation rewind time (ms) */
  MAX_LAG_COMPENSATION: 200,
} as const;

// ============================================================================
// Matchmaking Configuration
// ============================================================================

export const MATCHMAKING = {
  /** Maximum time to wait for match (ms) */
  MAX_QUEUE_TIME: 120000, // 2 minutes

  /** Time between matchmaking attempts (ms) */
  MATCHMAKING_INTERVAL: 1000,

  /** Countdown duration before match starts (s) */
  MATCH_COUNTDOWN: 3,

  /** Match time limit (ms) - null for no limit */
  MATCH_TIME_LIMIT: null as number | null,

  /** Grace period for reconnection (ms) */
  RECONNECT_GRACE_PERIOD: 10000,
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert milliseconds to server ticks
 */
export function msToTicks(ms: number): number {
  return Math.floor(ms / NETWORK.SNAPSHOT_INTERVAL);
}

/**
 * Convert server ticks to milliseconds
 */
export function ticksToMs(ticks: number): number {
  return ticks * NETWORK.SNAPSHOT_INTERVAL;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
