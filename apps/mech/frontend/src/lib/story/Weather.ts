/**
 * Ambient overworld weather/atmosphere (§ "the world feels alive"): drifting
 * clouds, occasional rain and dust storms, and shifting haze/fog. A seeded
 * state machine picks the next weather state every ~90-180s and smoothly
 * crossfades every visual parameter (fog, sun/ambient/hemi light, cloud
 * density, precipitation) over an ~8-12s transition — nothing snaps.
 *
 * Ownership: this system MUTATES the scene's existing THREE.Fog and the
 * existing sun/ambient/hemi lights handed in by StoryWorld. It never replaces
 * scene.fog and never adds/removes lights at runtime — adding a light forces
 * a scene-wide shader recompile (see ProjectileSystem's missileLights comment
 * for the same constraint) — so it only ever writes .intensity/.color/.near/.far
 * on objects that already exist.
 *
 * Composition with DayNightCycle: this is the ONE place fog/light properties
 * get written each frame, so weather and day/night never fight over the same
 * object. `update()` takes a DayNightCycle and composes, every frame (not
 * just mid-transition): final = base × weather(live) × dayNight. Concretely
 * sun.intensity = baseSun × live.sunMult × dayNight.sunIntensityFactor,
 * sun.color = dayNight.lightColor (weather doesn't tint the sun's colour,
 * only its strength), fog.color = live.fogColor × dayNight.fogDim, and
 * ambient/hemi = base × live.mult × dayNight.daylight, floored so combined
 * ambient light never drops below ~35% of its base intensity — gameplay
 * (aiming, reading the terrain) stays readable even at midnight in a storm.
 *
 * Rendering budget: exactly 3 extra draw calls (one InstancedMesh each for
 * clouds/rain/dust), well under 1k instances total, and zero per-frame
 * allocation in the hot update path (scratch Object3D/Vector2 are reused).
 *
 * Canvas textures (cloud puffs, dust motes) are built with ONLY fillStyle,
 * fillRect, createRadialGradient and gradient.addColorStop, and creation is
 * wrapped in try/catch with a null fallback — the StoryWorld unit test stubs
 * document.createElement('canvas') with a getContext() that supports nothing
 * else, and the constructor must never throw there.
 */
import * as THREE from 'three'
import type { DayNightCycle } from './DayNightCycle'

export type WeatherState = 'clear' | 'overcast' | 'rain' | 'dust'

/** Combined ambient/hemisphere floor as a fraction of BASE intensity — never
 *  dips below this regardless of weather × day/night, so aiming/navigating
 *  stays readable at midnight in a storm. */
const NIGHT_AMBIENT_FLOOR = 0.35

/** Cool-blue lean for cloud tint at night (composed with the existing storm
 *  gloom tint — see updateClouds). */
const NIGHT_CLOUD_TINT = new THREE.Color(0x33405c)

/** The live scene objects this system mutates in place; never replaced. */
export interface WeatherRefs {
  fog: THREE.Fog
  sun: THREE.DirectionalLight
  ambient: THREE.AmbientLight
  hemi: THREE.HemisphereLight
}

/** One state's target visual parameters (interpolated toward on transition). */
interface WeatherParams {
  fogNear: number
  fogFar: number
  fogColor: THREE.Color
  /** Multiplier on the sun's intensity as captured at construction. */
  sunMult: number
  /** Multiplier on the ambient light's intensity as captured at construction. */
  ambientMult: number
  /** Multiplier on the hemisphere light's intensity as captured at construction. */
  hemiMult: number
  /** Cloud InstancedMesh opacity. */
  cloudOpacity: number
  /** Rain streak visibility/opacity, 0..1 (drives the rain InstancedMesh). */
  rainAmount: number
  /** Dust mote visibility/opacity, 0..1 (drives the dust InstancedMesh). */
  dustAmount: number
  /** Generic "how intense is the weather" scalar for future gameplay hooks
   *  (e.g. an accuracy debuff in rain/dust) — exposed via `.intensity`. */
  intensity: number
}

/** mulberry32: tiny deterministic PRNG (mirrors Terrain.ts — reproducible per seed). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const lerp = THREE.MathUtils.lerp
/** Smoothstep easing so transitions ease in/out instead of moving linearly. */
const ease = (t: number): number => t * t * (3 - 2 * t)
const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t)

function cloneParams(p: WeatherParams): WeatherParams {
  return { ...p, fogColor: p.fogColor.clone() }
}

/** Per-state target parameters. `clear` matches StoryWorld's pre-weather
 *  defaults (fog 450/900, warm rose 0xb08a80, full light) so introducing this
 *  system doesn't shift the baseline look. */
const STATE_PARAMS: Record<WeatherState, WeatherParams> = {
  clear: {
    fogNear: 450, fogFar: 900, fogColor: new THREE.Color(0xb08a80),
    sunMult: 1.0, ambientMult: 1.0, hemiMult: 1.0,
    cloudOpacity: 0.25, rainAmount: 0, dustAmount: 0, intensity: 0,
  },
  overcast: {
    fogNear: 300, fogFar: 750, fogColor: new THREE.Color(0x8d8892),
    sunMult: 0.55, ambientMult: 0.8, hemiMult: 0.85,
    cloudOpacity: 0.6, rainAmount: 0, dustAmount: 0, intensity: 0.3,
  },
  rain: {
    fogNear: 180, fogFar: 550, fogColor: new THREE.Color(0x717a86),
    sunMult: 0.4, ambientMult: 0.7, hemiMult: 0.55,
    cloudOpacity: 0.75, rainAmount: 1, dustAmount: 0, intensity: 1.0,
  },
  dust: {
    fogNear: 120, fogFar: 420, fogColor: new THREE.Color(0xb99a6a),
    sunMult: 0.6, ambientMult: 0.9, hemiMult: 0.5,
    cloudOpacity: 0.3, rainAmount: 0, dustAmount: 1, intensity: 0.85,
  },
}

/** Weighted pick pool (clear is heaviest, ~50%). */
const STATE_WEIGHTS: Array<{ state: WeatherState; weight: number }> = [
  { state: 'clear', weight: 0.5 },
  { state: 'overcast', weight: 0.2 },
  { state: 'rain', weight: 0.15 },
  { state: 'dust', weight: 0.15 },
]

const CLOUD_COUNT = 30
const CLOUD_TILE = 700 // wrap tile so the cloud field always surrounds the player
const CLOUD_ALT_MIN = 130
const CLOUD_ALT_RANGE = 40 // altitude ∈ [130, 170]
const CLOUD_SIZE_MIN = 60
const CLOUD_SIZE_RANGE = 80 // size ∈ [60, 140]

const RAIN_COUNT = 400
const RAIN_BOX_W = 70
const RAIN_BOX_H = 45
const RAIN_FLOOR = -5 // a little below the player so wrap doesn't pop at y=0
const RAIN_SPEED_MIN = 38
const RAIN_SPEED_RANGE = 17 // fall speed ∈ [38, 55]

const DUST_COUNT = 150
const DUST_TILE = 130
const DUST_SIZE_MIN = 0.5
const DUST_SIZE_RANGE = 1.3

/**
 * Ambient overworld weather system. Construct once per StoryWorld, call
 * `update(dt, playerPos)` every frame (including while paused — ambient
 * weather must not freeze on a menu), and `dispose()` on teardown.
 */
export class WeatherSystem {
  private readonly scene: THREE.Scene
  private readonly fog: THREE.Fog
  private readonly sun: THREE.DirectionalLight
  private readonly ambient: THREE.AmbientLight
  private readonly hemi: THREE.HemisphereLight
  private readonly rng: () => number

  private readonly baseSunIntensity: number
  private readonly baseAmbientIntensity: number
  private readonly baseHemiIntensity: number

  private _current: WeatherState = 'clear'
  /** Seconds until the next state is (re)rolled. */
  private stateTimer: number
  private transitioning = false
  private transitionTimer = 0
  private transitionDuration = 0
  private from: WeatherParams
  private to: WeatherParams
  /** Current interpolated parameters, applied to the live refs each frame
   *  a transition is in flight. Owns its own Color (never aliases STATE_PARAMS). */
  private readonly live: WeatherParams

  private elapsed = 0
  /** Shared wind direction (x,z), reused by clouds/rain/dust at different speeds. */
  private readonly windDir = new THREE.Vector2(0.62, 0.34).normalize()

  // --- Clouds ---
  private cloudMesh: THREE.InstancedMesh | null = null
  private cloudTexture: THREE.Texture | null = null
  private cloudOffsetX = new Float32Array(0)
  private cloudOffsetZ = new Float32Array(0)
  private cloudAltitude = new Float32Array(0)
  private cloudSize = new Float32Array(0)
  private cloudYaw = new Float32Array(0)

  // --- Rain ---
  private rainMesh: THREE.InstancedMesh | null = null
  private rainX = new Float32Array(0)
  private rainY = new Float32Array(0)
  private rainZ = new Float32Array(0)
  private rainSpeed = new Float32Array(0)
  private rainLen = new Float32Array(0)

  // --- Dust ---
  private dustMesh: THREE.InstancedMesh | null = null
  private dustTexture: THREE.Texture | null = null
  private dustX = new Float32Array(0)
  private dustZ = new Float32Array(0)
  private dustBaseY = new Float32Array(0)
  private dustPhase = new Float32Array(0)
  private dustBobAmp = new Float32Array(0)
  private dustBobSpeed = new Float32Array(0)
  private dustSize = new Float32Array(0)

  // Scratch — reused every frame, never allocated in the hot path.
  private readonly _dummy = new THREE.Object3D()

  constructor(scene: THREE.Scene, refs: WeatherRefs, seed: number) {
    this.scene = scene
    this.fog = refs.fog
    this.sun = refs.sun
    this.ambient = refs.ambient
    this.hemi = refs.hemi
    this.rng = mulberry32(seed)

    // Multipliers are relative to whatever StoryWorld set up, so a graphics/
    // design tweak to the base intensities is respected automatically.
    this.baseSunIntensity = refs.sun.intensity
    this.baseAmbientIntensity = refs.ambient.intensity
    this.baseHemiIntensity = refs.hemi.intensity

    this.live = cloneParams(STATE_PARAMS.clear)
    this.from = cloneParams(STATE_PARAMS.clear)
    this.to = STATE_PARAMS.clear
    this.stateTimer = this.randRange(90, 180)

    this.setupClouds()
    this.setupRain()
    this.setupDust()
  }

  /** Current (or arriving, mid-transition) weather state. */
  get current(): WeatherState {
    return this._current
  }

  /** 0..1 scalar for how intense the current weather is (gameplay hook). */
  get intensity(): number {
    return this.live.intensity
  }

  private randRange(min: number, max: number): number {
    return min + this.rng() * (max - min)
  }

  private pickNextState(): WeatherState {
    const pool = STATE_WEIGHTS.filter((w) => w.state !== this._current)
    const total = pool.reduce((s, w) => s + w.weight, 0)
    let r = this.rng() * total
    for (const w of pool) {
      r -= w.weight
      if (r <= 0) return w.state
    }
    return pool[pool.length - 1].state
  }

  private beginTransition(state: WeatherState): void {
    this.from = cloneParams(this.live)
    this.to = STATE_PARAMS[state]
    this.transitionDuration = this.randRange(8, 12)
    this.transitionTimer = this.transitionDuration
    this.transitioning = true
    this._current = state
  }

  /** Advance the weather one frame: state machine, fog/light crossfade
   *  composed with the current day/night reading, and the clouds/rain/dust
   *  particle fields. Called every frame — including while StoryWorld is
   *  paused — so ambient atmosphere never freezes. `dayNight` must already be
   *  updated for this frame (StoryWorld ticks it first — see its class doc). */
  update(dt: number, playerPos: THREE.Vector3, dayNight: DayNightCycle): void {
    this.elapsed += dt

    this.stateTimer -= dt
    if (this.stateTimer <= 0) {
      this.beginTransition(this.pickNextState())
      this.stateTimer = this.randRange(90, 180)
    }

    if (this.transitioning) {
      this.transitionTimer -= dt
      const raw = 1 - Math.max(0, this.transitionTimer) / this.transitionDuration
      const t = ease(clamp01(raw))
      const to = this.to
      this.live.fogNear = lerp(this.from.fogNear, to.fogNear, t)
      this.live.fogFar = lerp(this.from.fogFar, to.fogFar, t)
      this.live.fogColor.copy(this.from.fogColor).lerp(to.fogColor, t)
      this.live.sunMult = lerp(this.from.sunMult, to.sunMult, t)
      this.live.ambientMult = lerp(this.from.ambientMult, to.ambientMult, t)
      this.live.hemiMult = lerp(this.from.hemiMult, to.hemiMult, t)
      this.live.cloudOpacity = lerp(this.from.cloudOpacity, to.cloudOpacity, t)
      this.live.rainAmount = lerp(this.from.rainAmount, to.rainAmount, t)
      this.live.dustAmount = lerp(this.from.dustAmount, to.dustAmount, t)
      this.live.intensity = lerp(this.from.intensity, to.intensity, t)

      if (this.transitionTimer <= 0) this.transitioning = false
    }

    // Single per-frame write of fog/lights — composes weather's `live`
    // targets with the current day/night reading, every frame (not only
    // while transitioning), so the two systems never race to set the same
    // property (see class doc).
    this.fog.near = this.live.fogNear
    this.fog.far = this.live.fogFar
    this.fog.color.copy(this.live.fogColor).multiply(dayNight.fogDim)

    this.sun.intensity = this.baseSunIntensity * this.live.sunMult * dayNight.sunIntensityFactor
    this.sun.color.copy(dayNight.lightColor)

    const ambientFloor = this.baseAmbientIntensity * NIGHT_AMBIENT_FLOOR
    this.ambient.intensity = Math.max(
      ambientFloor,
      this.baseAmbientIntensity * this.live.ambientMult * dayNight.daylight,
    )
    const hemiFloor = this.baseHemiIntensity * NIGHT_AMBIENT_FLOOR
    this.hemi.intensity = Math.max(
      hemiFloor,
      this.baseHemiIntensity * this.live.hemiMult * dayNight.daylight,
    )

    this.updateClouds(dt, playerPos, dayNight)
    this.updateRain(dt, playerPos)
    this.updateDust(dt, playerPos)
  }

  // --- Texture builders (canvas-2d-lite: fillStyle/fillRect/createRadialGradient
  //     only — see the class doc comment for why). Never throws. ---

  private makeRadialTexture(stops: Array<[number, string]>, size: number): THREE.Texture | null {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d') as (CanvasRenderingContext2D & { createRadialGradient: any }) | null
      if (!ctx || !ctx.createRadialGradient) return null
      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
      for (const [offset, color] of stops) grad.addColorStop(offset, color)
      ctx.fillStyle = grad as unknown as string
      ctx.fillRect(0, 0, size, size)
      const tex = new THREE.CanvasTexture(canvas)
      tex.needsUpdate = true
      return tex
    } catch {
      return null
    }
  }

  private makePuffTexture(): THREE.Texture | null {
    return this.makeRadialTexture([
      [0, 'rgba(255,255,255,0.95)'],
      [0.4, 'rgba(255,255,255,0.55)'],
      [1, 'rgba(255,255,255,0)'],
    ], 64)
  }

  private makeMoteTexture(): THREE.Texture | null {
    return this.makeRadialTexture([
      [0, 'rgba(232,202,150,0.85)'],
      [0.5, 'rgba(210,175,120,0.35)'],
      [1, 'rgba(200,160,100,0)'],
    ], 32)
  }

  /** Two crossed vertical quads (unit-ish) so a streak/mote reads from any yaw
   *  without per-instance billboard rotation math. */
  private buildCrossGeometry(width: number, height: number): THREE.BufferGeometry {
    const hw = width / 2
    const hh = height / 2
    const positions = new Float32Array([
      -hw, -hh, 0, hw, -hh, 0, hw, hh, 0, -hw, hh, 0,
      0, -hh, -hw, 0, -hh, hw, 0, hh, hw, 0, hh, -hw,
    ])
    const uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1])
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    geo.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7])
    return geo
  }

  // --- Clouds ---

  private setupClouds(): void {
    try {
      const geo = new THREE.PlaneGeometry(1, 1)
      geo.rotateX(-Math.PI / 2) // lie flat; DoubleSide covers the from-below view
      this.cloudTexture = this.makePuffTexture()
      const mat = new THREE.MeshBasicMaterial({
        map: this.cloudTexture ?? undefined,
        color: this.cloudTexture ? 0xffffff : 0xf2ece7,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        opacity: this.live.cloudOpacity,
      })
      const mesh = new THREE.InstancedMesh(geo, mat, CLOUD_COUNT)
      mesh.frustumCulled = false

      this.cloudOffsetX = new Float32Array(CLOUD_COUNT)
      this.cloudOffsetZ = new Float32Array(CLOUD_COUNT)
      this.cloudAltitude = new Float32Array(CLOUD_COUNT)
      this.cloudSize = new Float32Array(CLOUD_COUNT)
      this.cloudYaw = new Float32Array(CLOUD_COUNT)
      for (let i = 0; i < CLOUD_COUNT; i++) {
        this.cloudOffsetX[i] = (this.rng() - 0.5) * CLOUD_TILE
        this.cloudOffsetZ[i] = (this.rng() - 0.5) * CLOUD_TILE
        this.cloudAltitude[i] = CLOUD_ALT_MIN + this.rng() * CLOUD_ALT_RANGE
        this.cloudSize[i] = CLOUD_SIZE_MIN + this.rng() * CLOUD_SIZE_RANGE
        this.cloudYaw[i] = this.rng() * Math.PI * 2
      }

      this.scene.add(mesh)
      this.cloudMesh = mesh
    } catch {
      this.cloudMesh = null
    }
  }

  private updateClouds(dt: number, playerPos: THREE.Vector3, dayNight: DayNightCycle): void {
    const mesh = this.cloudMesh
    if (!mesh) return
    const mat = mesh.material as THREE.MeshBasicMaterial
    mat.opacity = this.live.cloudOpacity
    // Storm clouds shouldn't stay showroom-white: darken with the dimming sun
    // (clear sunMult=1 -> white; rain ~0.4 -> heavy grey). Composed with the
    // night dim too — clouds shouldn't glow white at midnight either.
    const gloom = clamp01((1 - this.live.sunMult) * 1.5)
    const nightDim = 1 - dayNight.daylight
    const totalDim = clamp01(Math.max(gloom, nightDim * 0.9))
    mat.color.setRGB(1 - 0.42 * totalDim, 1 - 0.4 * totalDim, 1 - 0.36 * totalDim)
      .lerp(NIGHT_CLOUD_TINT, nightDim * 0.5)

    const half = CLOUD_TILE / 2
    const windX = this.windDir.x * 4.5 * dt
    const windZ = this.windDir.y * 4.5 * dt
    for (let i = 0; i < CLOUD_COUNT; i++) {
      let ox = this.cloudOffsetX[i] + windX
      let oz = this.cloudOffsetZ[i] + windZ
      if (ox > half) ox -= CLOUD_TILE
      else if (ox < -half) ox += CLOUD_TILE
      if (oz > half) oz -= CLOUD_TILE
      else if (oz < -half) oz += CLOUD_TILE
      this.cloudOffsetX[i] = ox
      this.cloudOffsetZ[i] = oz

      const size = this.cloudSize[i]
      this._dummy.position.set(playerPos.x + ox, this.cloudAltitude[i], playerPos.z + oz)
      this._dummy.rotation.set(0, this.cloudYaw[i], 0)
      this._dummy.scale.set(size, 1, size)
      this._dummy.updateMatrix()
      mesh.setMatrixAt(i, this._dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }

  // --- Rain ---

  private setupRain(): void {
    try {
      // Thin + muted: streaks close to the camera occupy a lot of screen space,
      // so anything wider/brighter reads as falling rods instead of rain.
      const geo = this.buildCrossGeometry(0.028, 1.2)
      const mat = new THREE.MeshBasicMaterial({
        color: 0xb9c6d4,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.InstancedMesh(geo, mat, RAIN_COUNT)
      mesh.frustumCulled = false
      mesh.visible = false

      this.rainX = new Float32Array(RAIN_COUNT)
      this.rainY = new Float32Array(RAIN_COUNT)
      this.rainZ = new Float32Array(RAIN_COUNT)
      this.rainSpeed = new Float32Array(RAIN_COUNT)
      this.rainLen = new Float32Array(RAIN_COUNT)
      for (let i = 0; i < RAIN_COUNT; i++) {
        this.rainX[i] = (this.rng() - 0.5) * RAIN_BOX_W
        this.rainZ[i] = (this.rng() - 0.5) * RAIN_BOX_W
        this.rainY[i] = this.rng() * RAIN_BOX_H
        this.rainSpeed[i] = RAIN_SPEED_MIN + this.rng() * RAIN_SPEED_RANGE
        this.rainLen[i] = 0.8 + this.rng() * 0.8
      }

      this.scene.add(mesh)
      this.rainMesh = mesh
    } catch {
      this.rainMesh = null
    }
  }

  private updateRain(dt: number, playerPos: THREE.Vector3): void {
    const mesh = this.rainMesh
    if (!mesh) return
    const amt = this.live.rainAmount
    if (amt <= 0.003) {
      if (mesh.visible) mesh.visible = false
      return
    }
    mesh.visible = true
    ;(mesh.material as THREE.MeshBasicMaterial).opacity = 0.34 * amt

    const half = RAIN_BOX_W / 2
    const shearX = this.windDir.x * 3.5 * dt
    const shearZ = this.windDir.y * 3.5 * dt
    for (let i = 0; i < RAIN_COUNT; i++) {
      let y = this.rainY[i] - this.rainSpeed[i] * dt
      let x = this.rainX[i] + shearX
      let z = this.rainZ[i] + shearZ
      if (y < RAIN_FLOOR) {
        y = RAIN_BOX_H
        x = (this.rng() - 0.5) * RAIN_BOX_W
        z = (this.rng() - 0.5) * RAIN_BOX_W
      }
      if (x > half) x -= RAIN_BOX_W
      else if (x < -half) x += RAIN_BOX_W
      if (z > half) z -= RAIN_BOX_W
      else if (z < -half) z += RAIN_BOX_W
      this.rainX[i] = x
      this.rainY[i] = y
      this.rainZ[i] = z

      this._dummy.position.set(playerPos.x + x, playerPos.y + y, playerPos.z + z)
      this._dummy.rotation.set(0, 0, 0)
      this._dummy.scale.set(1, this.rainLen[i], 1)
      this._dummy.updateMatrix()
      mesh.setMatrixAt(i, this._dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }

  // --- Dust ---

  private setupDust(): void {
    try {
      const geo = this.buildCrossGeometry(1, 1)
      this.dustTexture = this.makeMoteTexture()
      const mat = new THREE.MeshBasicMaterial({
        map: this.dustTexture ?? undefined,
        color: this.dustTexture ? 0xffffff : 0xc9a876,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.InstancedMesh(geo, mat, DUST_COUNT)
      mesh.frustumCulled = false
      mesh.visible = false

      this.dustX = new Float32Array(DUST_COUNT)
      this.dustZ = new Float32Array(DUST_COUNT)
      this.dustBaseY = new Float32Array(DUST_COUNT)
      this.dustPhase = new Float32Array(DUST_COUNT)
      this.dustBobAmp = new Float32Array(DUST_COUNT)
      this.dustBobSpeed = new Float32Array(DUST_COUNT)
      this.dustSize = new Float32Array(DUST_COUNT)
      for (let i = 0; i < DUST_COUNT; i++) {
        this.dustX[i] = (this.rng() - 0.5) * DUST_TILE
        this.dustZ[i] = (this.rng() - 0.5) * DUST_TILE
        this.dustBaseY[i] = 1 + this.rng() * 4
        this.dustPhase[i] = this.rng() * Math.PI * 2
        this.dustBobAmp[i] = 0.3 + this.rng() * 0.6
        this.dustBobSpeed[i] = 0.4 + this.rng() * 0.5
        this.dustSize[i] = DUST_SIZE_MIN + this.rng() * DUST_SIZE_RANGE
      }

      this.scene.add(mesh)
      this.dustMesh = mesh
    } catch {
      this.dustMesh = null
    }
  }

  private updateDust(dt: number, playerPos: THREE.Vector3): void {
    const mesh = this.dustMesh
    if (!mesh) return
    const amt = this.live.dustAmount
    if (amt <= 0.003) {
      if (mesh.visible) mesh.visible = false
      return
    }
    mesh.visible = true
    ;(mesh.material as THREE.MeshBasicMaterial).opacity = 0.5 * amt

    const half = DUST_TILE / 2
    const windX = this.windDir.x * 2.2 * dt
    const windZ = this.windDir.y * 2.2 * dt
    for (let i = 0; i < DUST_COUNT; i++) {
      let x = this.dustX[i] + windX
      let z = this.dustZ[i] + windZ
      if (x > half) x -= DUST_TILE
      else if (x < -half) x += DUST_TILE
      if (z > half) z -= DUST_TILE
      else if (z < -half) z += DUST_TILE
      this.dustX[i] = x
      this.dustZ[i] = z

      const y = this.dustBaseY[i] + Math.sin(this.elapsed * this.dustBobSpeed[i] + this.dustPhase[i]) * this.dustBobAmp[i]
      const size = this.dustSize[i]
      this._dummy.position.set(playerPos.x + x, playerPos.y + y, playerPos.z + z)
      this._dummy.rotation.set(0, 0, 0)
      this._dummy.scale.set(size, size, size)
      this._dummy.updateMatrix()
      mesh.setMatrixAt(i, this._dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }

  // --- Lifecycle ---

  dispose(): void {
    this.disposeMesh(this.cloudMesh)
    this.disposeMesh(this.rainMesh)
    this.disposeMesh(this.dustMesh)
    this.cloudTexture?.dispose()
    this.dustTexture?.dispose()
    this.cloudMesh = null
    this.rainMesh = null
    this.dustMesh = null
    this.cloudTexture = null
    this.dustTexture = null
  }

  private disposeMesh(mesh: THREE.InstancedMesh | null): void {
    if (!mesh) return
    this.scene.remove(mesh)
    mesh.geometry.dispose()
    const mat = mesh.material
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
    else mat.dispose()
  }
}
