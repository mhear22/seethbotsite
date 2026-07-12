/**
 * Day/night cycle for the Story Mode overworld.
 *
 * Fiction: the planet the player stands on rotates, so the WHOLE celestial
 * sphere — sun, huge ringed companion planet, moon, stars — sweeps overhead
 * together as one rigid rotation. This class owns that rotation: it advances
 * a single angle with real time, builds ONE quaternion from it each update,
 * and rotates the sun/planet/moon BASE directions (borrowed from
 * OverworldSky's fixed constants) by that same quaternion. Because a
 * quaternion rotation preserves angles between vectors, the sun and its
 * companions stay pinned to each other (constant relative bearing) for the
 * whole cycle — the moon/planet simply "lag" the sun by their base offset.
 *
 * The rotation axis is mostly horizontal with a shallow tilt (numerically
 * tuned against OverworldSky's SUN_DIRECTION — see the tune script this was
 * derived from) so the noon arc rides high (~45° elevation) while the night
 * dip stays shallow, giving a naturally longer day than night: about 60% of
 * the ~12-minute cycle reads as "day" (sun above the horizon) and 40% as
 * "night", with smooth dawn/dusk transitions rather than a hard cutover.
 *
 * `timeOfDay` is defined so that 0.25 reproduces OverworldSky's original
 * fixed constants exactly (today's "mid-morning" look) — a fresh StoryWorld
 * run starts there by default (see DayNightCycle's constructor default).
 *
 * Consumers (StoryWorld/OverworldSky/WeatherSystem) read `sunDir` /
 * `planetDir` / `moonDir` (reused Vector3s, valid until the next update) to
 * drive the sky shader, and `daylight` / `sunIntensityFactor` / `lightColor`
 * / `fogDim` to drive scene lighting and fog (see WeatherSystem, which
 * composes these with weather every frame — see its class doc).
 */
import * as THREE from 'three'
import { SUN_DIRECTION, PLANET_DIRECTION, MOON_DIRECTION } from './OverworldSky'

/** Full day/night cycle length, real seconds (~12 minutes). Tunable. */
export const CYCLE_LENGTH_SEC = 12 * 60

/**
 * Fixed rotation axis for the celestial sphere: mostly horizontal (so the sky
 * sweeps in a big overhead arc rather than spinning like a flat wheel) with a
 * shallow tilt off the sun's azimuth. Numerically tuned so that, rotating
 * SUN_DIRECTION once around this axis per cycle, the sun sits above the
 * horizon (y > 0) for ~60% of the sweep and its noon elevation reaches a high
 * ~45° arc rather than grazing the horizon.
 */
const ROTATION_AXIS = new THREE.Vector3(1, 0.25, 0.2).normalize()

const UP_Y = 1 // sunDir/planetDir/moonDir are unit vectors, so dot-with-up === .y

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

// --- Colour anchors (noon / dusk / night) for lightColor + fogDim -----------
const NOON_LIGHT = new THREE.Color(0xfff4e0) // matches OverworldSky's original sun-light warm white
const DUSK_LIGHT = new THREE.Color(0xff8c42) // deep orange
const NIGHT_LIGHT = new THREE.Color(0x5972a6) // dim, cool moonlight blue

const DAY_FOG = new THREE.Color(0xffffff)
const DUSK_FOG = new THREE.Color(0xffbf8c)
const NIGHT_FOG = new THREE.Color(0x2b3040) // dark blue-grey (~0.3 magnitude baked into the RGB)

/** sunIntensityFactor never fully bottoms out — a sliver of "moonlight" keeps
 *  the sun's directional light from going fully to zero at deep night. */
const NIGHT_SUN_FLOOR = 0.06

export class DayNightCycle {
  /** 0..1, 0 = dawn. Wraps every {@link CYCLE_LENGTH_SEC} seconds. */
  timeOfDay: number

  /** Unit vector to the sun, world space. Reused instance — mutated in place
   *  each update, never reallocated. Copy it if you need to retain a frame's
   *  value across the next update. */
  readonly sunDir = new THREE.Vector3()
  /** Unit vector to the companion gas giant. Same rotation as sunDir, so the
   *  two stay pinned at a constant relative bearing (see class doc). */
  readonly planetDir = new THREE.Vector3()
  /** Unit vector to the moon. Same rotation as sunDir/planetDir. */
  readonly moonDir = new THREE.Vector3()

  /** 0..1: 0 = deep night, 1 = noon. Smooth (not stepped) through dawn/dusk —
   *  a single elevation smoothstep, independent of the 3-colour blend below. */
  daylight = 0
  /** ~1 at day, eases down toward {@link NIGHT_SUN_FLOOR} as the sun sets/
   *  during the night. Drives the sun DirectionalLight's intensity. */
  sunIntensityFactor = 1
  /** Warm white at noon -> deep orange at dawn/dusk -> dim cool blue at night.
   *  Reused Color instance, mutated in place each update. */
  readonly lightColor = new THREE.Color()
  /** Multiplier for fog/haze colour: white by day, dusk-orange tinted at low
   *  sun, dark blue-grey (~0.3) at night. Reused Color instance. */
  readonly fogDim = new THREE.Color()

  /** Scratch quaternion, rebuilt (not reallocated) every update. */
  private readonly _quat = new THREE.Quaternion()

  /** @param startTimeOfDay Defaults to 0.25 — reproduces OverworldSky's
   *  original fixed sun/planet/moon constants exactly, so a fresh run starts
   *  looking like "today" (mid-morning) before the cycle even ticks. */
  constructor(startTimeOfDay = 0.25) {
    this.timeOfDay = ((startTimeOfDay % 1) + 1) % 1
    this.recompute()
  }

  /** Force a specific time of day (0..1, wraps) — the dev debug handle and
   *  tests use this to jump straight to a moment without waiting real time. */
  setTimeOfDay(t: number): void {
    this.timeOfDay = ((t % 1) + 1) % 1
    this.recompute()
  }

  /** Advance the cycle by dt real seconds and recompute every output. */
  update(dt: number): void {
    this.timeOfDay = (((this.timeOfDay + dt / CYCLE_LENGTH_SEC) % 1) + 1) % 1
    this.recompute()
  }

  private recompute(): void {
    // One rotation per full cycle. theta=0 at timeOfDay=0.25 so the base
    // constants (today's fixed look) come back out unrotated at that time.
    const theta = (this.timeOfDay - 0.25) * Math.PI * 2
    this._quat.setFromAxisAngle(ROTATION_AXIS, theta)
    this.sunDir.copy(SUN_DIRECTION).applyQuaternion(this._quat)
    this.planetDir.copy(PLANET_DIRECTION).applyQuaternion(this._quat)
    this.moonDir.copy(MOON_DIRECTION).applyQuaternion(this._quat)

    const elev = this.sunDir.y / UP_Y // sunDir is unit length, so this is just .y

    // Simple, single smooth curve for the "how much daylight" readout.
    this.daylight = smoothstep(-0.15, 0.35, elev)
    this.sunIntensityFactor = NIGHT_SUN_FLOOR + (1 - NIGHT_SUN_FLOOR) * this.daylight

    // Three-band colour blend (night -> dusk -> noon), chained so each stage
    // saturates before the next begins: t1 carries night into the dusk band,
    // t2 carries dusk into full day. Whenever t2 reaches 1 the noon colour
    // wins outright regardless of t1, so there's no double-counting.
    const t1 = smoothstep(-0.30, -0.02, elev) // night -> dusk
    const t2 = smoothstep(-0.02, 0.28, elev) // dusk -> day
    this.lightColor.copy(NIGHT_LIGHT).lerp(DUSK_LIGHT, t1).lerp(NOON_LIGHT, t2)
    this.fogDim.copy(NIGHT_FOG).lerp(DUSK_FOG, t1).lerp(DAY_FOG, t2)
  }
}
