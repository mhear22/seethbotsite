/**
 * Tiny deterministic value-noise + fbm used to shape the story overworld
 * terrain. Pure CPU (no GPU) so the same function drives both the displaced
 * heightfield geometry and the getGroundHeight() query the town stage uses to
 * sit buildings on the ground.
 *
 * Deliberately dependency-free and seedable so a reload reproduces the exact
 * same hills. Not made reactive (plain functions / numbers).
 */

/** Hash a 2D integer lattice point to [0,1). Stable, cheap, no allocations. */
function hash2(ix: number, iz: number): number {
  // Large primes + a sin-fract mix; good enough for gentle scenic terrain.
  const s = Math.sin(ix * 127.1 + iz * 311.7) * 43758.5453
  return s - Math.floor(s)
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

/** Bilinearly-interpolated value noise in [0,1]. */
function valueNoise(x: number, z: number): number {
  const ix = Math.floor(x)
  const iz = Math.floor(z)
  const fx = x - ix
  const fz = z - iz
  const a = hash2(ix, iz)
  const b = hash2(ix + 1, iz)
  const c = hash2(ix, iz + 1)
  const d = hash2(ix + 1, iz + 1)
  const ux = smoothstep(fx)
  const uz = smoothstep(fz)
  const top = a + (b - a) * ux
  const bot = c + (d - c) * ux
  return top + (bot - top) * uz
}

/** 4-octave fractal Brownian motion in roughly [0,1]. */
export function fbm(x: number, z: number): number {
  let value = 0
  let amplitude = 0.5
  let freq = 1
  let norm = 0
  for (let i = 0; i < 4; i++) {
    value += amplitude * valueNoise(x * freq, z * freq)
    norm += amplitude
    amplitude *= 0.5
    freq *= 2
  }
  return value / norm
}

export interface TerrainParams {
  /** Half-extent of the world (matches WORLD_HALF_EXTENT). */
  halfExtent: number
  /** Peak hill height (world units) reached out near the world edge. */
  maxHeight: number
  /** Horizontal scale of the hills (larger = broader hills). */
  hillScale: number
  /**
   * Inside this XZ radius from origin the terrain is forced flat (y≈0) so the
   * play area / spawn never has bumps the mech can't climb (physics clamps the
   * mech to y=0). Hills only swell beyond this, blending in gradually.
   */
  flatRadius: number
  /** Distance over which terrain ramps from flat to full hills past flatRadius. */
  flatFalloff: number
}

/**
 * Height of the visual terrain at a world XZ position.
 *
 * Returns ~0 within `flatRadius` (and across the play area generally), then
 * ramps up into rolling hills toward the edges. Town footprints additionally
 * flatten their own patch via flattenAt() applied by the caller — but since
 * towns sit well inside the world and this stays near 0 across the broad inner
 * region, towns are effectively grounded at y=0. The town stage can call this to
 * confirm/sit buildings precisely on the surface.
 */
export function terrainHeight(x: number, z: number, p: TerrainParams): number {
  const dist = Math.sqrt(x * x + z * z)
  // Radial mask: 0 inside flatRadius, easing to 1 past flatRadius+falloff.
  const t = (dist - p.flatRadius) / p.flatFalloff
  const mask = t <= 0 ? 0 : t >= 1 ? 1 : smoothstep(t)
  if (mask <= 0) return 0

  // Two fbm layers: broad rolling hills + a touch of finer detail.
  const broad = fbm(x / p.hillScale + 100, z / p.hillScale + 100)
  const detail = fbm(x / (p.hillScale * 0.35) - 50, z / (p.hillScale * 0.35) - 50)
  const h = broad * 0.8 + detail * 0.2
  // Bias downward a hair so the flat plain reads as the valley floor.
  return (h - 0.15) * p.maxHeight * mask
}
