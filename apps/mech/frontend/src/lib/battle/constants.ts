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
// MECH_ANIM — procedural walk/idle/lean tuning for MechEntity.animateWalk.
// All the leg-swing arcs, idle breathing, turn lean and gait body motion that
// used to be magic numbers inside animateWalk live here so the machine's motion
// can be retuned in one place (parity with FOOTFALL / ON_FOOT).
// ---------------------------------------------------------------------------
export const MECH_ANIM = {
  /** Horizontal speed (u/s) at which the walk cycle reads as "full" — normalises
   *  moveT (0 parked → 1 striding) for amplitude + idle cross-fades. */
  WALK_REF_SPEED: 8,
  /** Phase-rate speed cap (u/s): dash speeds past this stop quickening the
   *  cadence so the legs saturate instead of strobing. */
  CADENCE_CAP_SPEED: 16,
  /** Walk-cycle phase advance per (capped) u/s. */
  CADENCE_RATE: 0.8,

  /** Bipedal leg swing arc (rad) = BASE + SPEED*moveT (short steps at a crawl,
   *  the full ~18° only at speed). */
  BIPED_ARC_BASE: 0.12,
  BIPED_ARC_SPEED: 0.2,
  /** Quadruped leg swing arc (rad) — a touch tighter than the biped. */
  QUAD_ARC_BASE: 0.1,
  QUAD_ARC_SPEED: 0.16,
  /** Arm counter-swing as a fraction of the same-side leg swing (opposed). */
  ARM_COUNTER_SWING: 0.5,

  /** Idle "breathing" phase rate (rad/s) — always advancing so a parked mech
   *  settles instead of freezing. */
  IDLE_FREQUENCY: 1.6,
  /** Idle leg sway amplitude (rad), cross-faded out as the mech gets moving. */
  IDLE_LEG_AMPLITUDE: 0.02,
  /** Idle vertical breath amplitude (units). */
  IDLE_BOB_AMPLITUDE: 0.015,
  /** Vertical body bob amplitude at full walk (units). */
  WALK_BOB_AMPLITUDE: 0.06,

  /** Torso lean into turns: rad of roll per (rad/s) of yaw rate, and its clamp. */
  TURN_LEAN_GAIN: 0.06,
  TURN_LEAN_MAX: 0.18,
  /** Nose pitch under acceleration: rad per (u/s²) forward accel, and its clamp. */
  ACCEL_PITCH_GAIN: 0.012,
  ACCEL_PITCH_MAX: 0.1,
  /** Exponential ease rate for lean/pitch so they glide rather than snap. */
  LEAN_EASE_RATE: 8,

  /** Quad trot: per-diagonal foot lift (units) on the forward half of the step. */
  QUAD_FOOT_LIFT: 0.08,
  /** Quad hull rock: fore/aft pitch and side roll amplitudes (rad). */
  QUAD_PITCH: 0.03,
  QUAD_ROLL: 0.04,

  /** Hover bank into strafe / pitch into forward drive: gain (rad per u/s of local
   *  velocity) and clamp for each. */
  HOVER_BANK_GAIN: 0.05,
  HOVER_BANK_MAX: 0.25,
  HOVER_PITCH_GAIN: 0.04,
  HOVER_PITCH_MAX: 0.2,
  /** Tracked suspension rumble: fast jitter amplitude (units), scaled by moveT. */
  TRACKED_JITTER: 0.01,

  /** Dash tell: extra forward crouch-pitch (rad) eased in while dashing. */
  DASH_CROUCH_PITCH: 0.14,
} as const

// ---------------------------------------------------------------------------
// ON-FOOT — the dismount (design §4.1/§4.3). The pilot is a fragile human, not
// a machine: no weight, no dash i-frames, no jump-jets, no power economy. Speed
// collapses from the mech's tens-of-u/s to a walk, acceleration is near-instant
// (a person just moves), and the only "juice" is a tiny footstep event fed to
// the camera at a fraction of the mech's intensity. All values live here so the
// integrator can retune the god→person contrast in one place.
//
// NOTE (design reconciliation): design §4.1/§4.3 name a ~4u/s walk; this cluster
// ships the slightly brisker 6u/s walk / 10u/s sprint from the Phase-4 task brief
// so the hub is not tedious to cross. Both read as an enormous collapse from the
// Frame's speed; retune WALK_SPEED to 4 here if the emotional beat needs it.
// ---------------------------------------------------------------------------
export const ON_FOOT = {
  /** Pilot total height in world units. The ~5-6u Frame towers over this. */
  HEIGHT: 1.8,
  /** Capsule radius used for collider blocking against town pedestrian colliders. */
  RADIUS: 0.45,

  /** Base walk speed (units/s). */
  WALK_SPEED: 6,
  /** Sprint speed (units/s) while the dash key is held — no i-frames, just a jog.
   *  A clear 2× over the walk so the jog actually reads (paired with a small FOV
   *  kick on sprint-start in StoryWorld.updateOnFoot). */
  SPRINT_SPEED: 12,
  /** Near-instant acceleration (units/s²) — a human has no momentum to spool up. */
  ACCEL: 60,
  /** Ground friction (per-second exponential decay) when input releases. Stops fast. */
  FRICTION: 14,

  /** Gravity (units/s²) — gentler than the mech; only matters walking off a ledge. */
  GRAVITY: 30,
  /** Max upward ground step the pilot snaps over without falling/climbing logic. */
  STEP_UP_TOLERANCE: 0.6,

  // Footstep cadence + juice (mirrors the FOOTFALL shape at a fraction of scale).
  /** Below this horizontal speed the pilot is standing (no steps). */
  MIN_STEP_SPEED: 0.4,
  /** Stride length: step interval = STRIDE / speed, clamped. */
  STRIDE_LENGTH: 1.6,
  MIN_STEP_INTERVAL: 0.28,
  MAX_STEP_INTERVAL: 0.55,
  /** Footstep intensity fed to the camera — tiny vs the mech's 0.05–0.28. */
  STEP_INTENSITY: 0.02,

  // Idle / walk body bob (OnFootEntity.update animates the mesh with these).
  BOB_WALK_FREQUENCY: 9,     // rad/s at full walk
  BOB_WALK_AMPLITUDE: 0.06,  // vertical bob (units) at full walk
  BOB_IDLE_FREQUENCY: 2.2,   // slow breathing sway when standing
  BOB_IDLE_AMPLITUDE: 0.02,
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

  // Mouse-look smoothing. Higher = tighter: residual aim glide dies in ~2 frames
  // instead of ~10, so aim/turn stops feeling floaty. The base sensitivity in
  // CameraController.update is bumped in step to keep the same per-flick gain.
  MOUSE_VELOCITY_DECAY: 28,

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

  // Dash "catch-up": on a dash the mech lunges forward instantly, but the camera
  // should hang back and then lerp forward to catch it, so the dodge reads as a
  // burst of speed instead of the whole view teleporting. For a short window
  // after a dash the position-lag rate is clamped to a much lower value (a long
  // trail), then eases back to normal.
  DASH_LAG_RATE: 6,
  /** Seconds the reduced dash catch-up lag stays in effect after a dash starts. */
  DASH_CATCHUP_DURATION: 0.5,
} as const

// ---------------------------------------------------------------------------
// CAMERA PROFILES — the god↔person contrast (design §3.1/§4.1). The rig geometry
// that differs between piloting the Frame and walking as the human is bundled
// into a profile the CameraController swaps with setProfile()/the dismount
// transition. The 'mech' profile is exactly today's behaviour (sourced from the
// CAMERA group above), so switching to it is a no-op for existing scenes.
// ---------------------------------------------------------------------------
export interface CameraProfileParams {
  /** Orbit distance clamp + resting distance. */
  minDistance: number
  maxDistance: number
  defaultDistance: number
  /** Over-the-shoulder offset applied after the orbit calc. */
  shoulderRight: number
  shoulderUp: number
  /** Anchor lift above the target's position (rig pivot height). */
  anchorUp: number
  /** Resting field of view. On foot this widens for the small-and-exposed read. */
  baseFov: number
  /** Multiplier on ALL shake/dip intensity — heavily damped on foot (no weight). */
  shakeScale: number
}

export const CAMERA_PROFILES: Record<'mech' | 'onFoot', CameraProfileParams> = {
  // The Frame: high, heavy, far shoulder — identical to the standalone CAMERA group.
  mech: {
    minDistance: CAMERA.MIN_DISTANCE,
    maxDistance: CAMERA.MAX_DISTANCE,
    defaultDistance: CAMERA.DEFAULT_DISTANCE,
    shoulderRight: CAMERA.SHOULDER_RIGHT,
    shoulderUp: CAMERA.SHOULDER_UP,
    anchorUp: CAMERA.ANCHOR_UP,
    baseFov: CAMERA.BASE_FOV,
    shakeScale: 1.0,
  },
  // The human: close, low (~1.7u eye height = anchorUp + shoulderUp), wide, calm.
  onFoot: {
    minDistance: 1.5,
    maxDistance: 4.5,
    defaultDistance: 2.8,
    shoulderRight: 0.7,
    shoulderUp: 0.3,
    anchorUp: 1.4,
    baseFov: 82,
    shakeScale: 0.25,
  },
}

export type CameraProfileName = keyof typeof CAMERA_PROFILES

// ---------------------------------------------------------------------------
// DISMOUNT TRANSITION — the ~0.8s fall from cockpit height to human eye height
// (design §4.1: "the camera falls … with a landing settle"). The reverse (climb)
// reuses the same machinery with the profiles swapped.
// ---------------------------------------------------------------------------
export const CAMERA_TRANSITION = {
  /** Duration of the drop/climb, seconds. */
  DROP_DURATION: 0.8,
  /** Downward dip punched in when the drop lands (the "settle" thud). */
  SETTLE_DIP: 0.35,
  /** Brief inward FOV pinch on the landing settle (negative = narrow). */
  SETTLE_FOV: -3,
} as const
