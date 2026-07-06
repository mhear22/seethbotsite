/**
 * Centralized movement / feel tuning for the battle + story mech physics and
 * camera. Everything the player *feels* — how a mech spools up and slides to a
 * stop, how a dash and boost spend power, how footfalls and landings punch the
 * camera — lives here so balance is one file, not a scavenger hunt through
 * PhysicsSystem/CameraController.
 *
 * IMPORTANT (multiplayer): the mech's *steady-state top speed* is intentionally
 * NOT parameterised here beyond BASE_SPEED_FACTOR — it stays identical to the
 * server sim (see ClientPrediction / backend GameConstants). Only the
 * acceleration/friction *transients*, the power economy, and camera juice are
 * tuned below, so widening the momentum spread never desyncs MP reconciliation.
 */

// ---------------------------------------------------------------------------
// Jump velocities (kept as top-level exports — imported by PhysicsSystem and
// EnemyAI, and matched against the server's JUMP_THRUST for MP parity).
// ---------------------------------------------------------------------------
export const JUMP_VELOCITY_BASE = 20
export const JUMP_VELOCITY_JETS = 80

// ---------------------------------------------------------------------------
// MOVEMENT — horizontal locomotion feel.
// ---------------------------------------------------------------------------
export const MOVEMENT = {
  /** targetSpeed = BASE_SPEED_FACTOR * speedMultiplier * speedStat * weightFactor.
   *  Steady-state top speed — DO NOT diverge from the server (MP parity). */
  BASE_SPEED_FACTOR: 8,

  /** Boost (useAbility) top-speed multiplier while power remains. */
  BOOST_MULTIPLIER: 3,

  /** How far below the ground a mech may be and still count as grounded
   *  (smooths walking over rolling hills; larger drops trigger a real fall). */
  GROUND_STICK_DISTANCE: 1.5,

  /** Default arena half-extents (overwritten per-map via setArenaBounds). */
  DEFAULT_ARENA_HALF: 150,
} as const

/**
 * Momentum by weight class. Acceleration (units/s²) is how fast a mech reaches
 * its target velocity; friction (per-second exponential decay) is how fast it
 * coasts to a stop when input releases. The spread is deliberately wide so
 * weight is a *choice*: a Light mech is twitchy and stops on a dime; an Assault
 * takes a beat to spool up and *slides* when you let go — a freight train.
 *
 * These only shape the transient, never the top speed, so MP stays matched.
 */
export const WEIGHT_MOVEMENT: Record<
  'light' | 'medium' | 'heavy' | 'assault',
  { accel: number; friction: number }
> = {
  light: { accel: 70, friction: 9.0 },
  medium: { accel: 55, friction: 7.0 },
  heavy: { accel: 42, friction: 5.5 },
  assault: { accel: 30, friction: 4.0 },
}

/**
 * Per-leg-type modifiers layered ON TOP of the weight-class curve.
 * frictionMult scales the class friction (hover slides more, tracked grips);
 * backwardPenalty caps reverse speed; blockJump disables jumping entirely.
 */
export const LEG_MODIFIERS: Record<
  string,
  { frictionMult: number; backwardPenalty: number; blockJump: boolean }
> = {
  bipedal: { frictionMult: 1.0, backwardPenalty: 0.6, blockJump: false },
  tracked: { frictionMult: 1.0, backwardPenalty: 0.6, blockJump: true },
  hover: { frictionMult: 0.4, backwardPenalty: 0.6, blockJump: false },
  quadrupedal: { frictionMult: 0.9, backwardPenalty: 0.8, blockJump: false },
}

// ---------------------------------------------------------------------------
// DASH — the skill-expression dodge verb.
// ---------------------------------------------------------------------------
export const DASH = {
  /** dashSpeed = BASE_SPEED + WEIGHT_BONUS * weightPenalty (light dashes faster). */
  SPEED_BASE: 30,
  SPEED_WEIGHT_BONUS: 30,

  /** cooldown = COOLDOWN_BASE * (COOLDOWN_WEIGHT_OFFSET - weightPenalty).
   *  Light mechs (high weightPenalty) get shorter cooldowns → more dodges. */
  COOLDOWN_BASE: 2.0,
  COOLDOWN_WEIGHT_OFFSET: 2.0,

  /** Power spent to initiate a dash (gated behind PhysicsSystem.powerEconomyEnabled). */
  POWER_COST: 20,
} as const

// ---------------------------------------------------------------------------
// BOOST — the 3× sprint, now a power resource, plus the counter-boost juke.
// ---------------------------------------------------------------------------
export const BOOST = {
  /** Power drained per second while boosting (useAbility held). */
  POWER_DRAIN: 40,

  /** One-shot power cost when hard-reversing a boost (the juke "brake"). */
  COUNTER_POWER_COST: 15,

  /** Fraction of horizontal velocity killed on a counter-boost brake
   *  (0 = no brake, 1 = dead stop). Breaks pursuit momentum. */
  COUNTER_BRAKE: 0.55,

  /** dot(moveDir, velDir) below this (i.e. reversing hard) triggers the juke. */
  COUNTER_DOT_THRESHOLD: -0.5,

  /** Minimum current horizontal speed for a counter-boost to register. */
  COUNTER_MIN_SPEED: 2,
} as const

// ---------------------------------------------------------------------------
// JUMP / GRAVITY.
// ---------------------------------------------------------------------------
export const JUMP = {
  GRAVITY: 50,
  /** Jump-jet fuel burn = FUEL_CONSUMPTION_BASE * (2 - weightPenalty). */
  FUEL_CONSUMPTION_BASE: 30,
  /** Jump-jet fuel regen per second while grounded. */
  FUEL_REGEN: 15,
  /** Extra launch velocity multiplier while the jump-jets rack ability window
   *  (mech.jumpBoostTimer) is open — the "boosted jump" the ability advertises. */
  BOOST_MULTIPLIER: 1.5,
} as const

// ---------------------------------------------------------------------------
// FOOTFALL / LANDING — seismic feedback scaled by weight.
// PhysicsSystem detects these and fires onFootstep/onLanding hooks; the camera
// (or any listener) turns the intensity into shake + dip.
// ---------------------------------------------------------------------------
export const FOOTFALL = {
  /** Below this horizontal speed the mech is considered standing (no steps). */
  MIN_STEP_SPEED: 0.5,

  /** Stride length in world units: step interval = STRIDE / speed, clamped.
   *  Faster movement → quicker cadence. */
  STRIDE_LENGTH: 3.0,
  MIN_STEP_INTERVAL: 0.25,
  MAX_STEP_INTERVAL: 0.9,

  /** Per-weight-class footstep intensity (fed to the camera dip/shake). */
  STEP_INTENSITY: {
    light: 0.05,
    medium: 0.1,
    heavy: 0.18,
    assault: 0.28,
  } as Record<'light' | 'medium' | 'heavy' | 'assault', number>,

  /** Downward speed (units/s) below which a landing is too soft to register. */
  MIN_LANDING_IMPACT: 3,
  /** Reference impact speed at which landing intensity hits 1.0 (pre weight). */
  LANDING_REFERENCE_IMPACT: 30,

  /** Per-weight-class multiplier on landing intensity — a heavy mech SLAMS. */
  LANDING_INTENSITY: {
    light: 0.4,
    medium: 0.7,
    heavy: 1.1,
    assault: 1.5,
  } as Record<'light' | 'medium' | 'heavy' | 'assault', number>,
} as const

// ---------------------------------------------------------------------------
// CAMERA — over-the-shoulder rig, shake, dip, FOV juice, speed lag.
// ---------------------------------------------------------------------------
export const CAMERA = {
  // Rig geometry.
  MIN_DISTANCE: 5,
  MAX_DISTANCE: 15,
  DEFAULT_DISTANCE: 10,
  MIN_PITCH: -Math.PI / 3,
  MAX_PITCH: Math.PI / 3,
  SHOULDER_RIGHT: 2.5,
  SHOULDER_UP: 3.0,
  ANCHOR_UP: 3.0,

  // Mouse-look smoothing.
  MOUSE_VELOCITY_DECAY: 16,

  // Screen shake.
  SHAKE_DECAY: 8,

  // FOV juice.
  BASE_FOV: 75,
  FOV_RETURN: 6,
  /** Outward FOV punch on dash start (scene passes this to triggerFovKick). */
  DASH_FOV_KICK: 10,
  /** Inward FOV pinch on landing, eased back — sells the "settle". Negative = narrow. */
  LANDING_FOV_SETTLE: -4,
  /** Max additive FOV from raw movement speed (speed sensation). */
  SPEED_FOV_MAX: 7,
  /** Horizontal speed at which SPEED_FOV_MAX is reached. */
  SPEED_FOV_REF_SPEED: 26,

  // Camera dip (footfall/landing vertical punch), eased back.
  DIP_RETURN: 9,
  /** Multiplier turning a footstep intensity into a downward dip (units). */
  FOOTSTEP_DIP_SCALE: 0.6,
  /** Multiplier turning a footstep intensity into screen shake. */
  FOOTSTEP_SHAKE_SCALE: 0.5,
  /** Multiplier turning a landing intensity into a downward dip (units). */
  LANDING_DIP_SCALE: 1.2,
  /** Multiplier turning a landing intensity into screen shake. */
  LANDING_SHAKE_SCALE: 1.0,

  // Subtle speed-based positional lag (higher = snappier, less trail).
  // Applied only in update(); reanchor() stays a hard copy for within-frame
  // correction, so this reads most clearly in BattleScene.
  POSITION_LAG_BASE: 40,
  /** How much the lag rate is reduced at SPEED_FOV_REF_SPEED (0..1). */
  POSITION_LAG_SPEED_FALLOFF: 0.5,
} as const
