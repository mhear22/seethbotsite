import * as THREE from 'three'

/**
 * A flattened circular region of the heightfield (towns + the player spawn).
 * Terrain is forced to `elevation` within `flatRadius`, then blends smoothly
 * back to the natural procedural height across `blendRadius`. This keeps town
 * buildings, farms and combat encounters (and the spawn) on level ground while
 * the surrounding wilderness stays varied.
 */
export interface TerrainPad {
  x: number
  z: number
  flatRadius: number
  blendRadius: number
  elevation: number
}

export interface TerrainConfig {
  /** Full width/depth of the square ground plane (world units). */
  size: number
  /** Grid resolution (segments per side). Higher = smoother, more verts. */
  segments?: number
  /** Seed for the deterministic noise so reloads reproduce the same world. */
  seed?: number
  /** Flattened town / spawn regions. */
  pads?: TerrainPad[]
}

/**
 * Procedurally-generated biome terrain for the story-mode overworld.
 *
 * A deterministic fractal-noise heightfield carved into recognisable real-world
 * biomes: oceans and beaches at the coasts, grassy plains and dry savanna in
 * the lowlands, forests in the wetter mid-elevations, and rocky, snow-capped
 * mountains up high — with winding rivers cut through the lowlands. Towns sit on
 * flattened pads at the plains baseline (y = 0) so combat/spawn logic is
 * unchanged. Given the same seed it always reproduces the same map, so the
 * visible mesh and the physics ground-height queries agree.
 *
 * Owns the ground mesh (`mesh`) and a translucent water surface (`waterMesh`).
 * Like the rest of Story Mode's three.js objects these must NOT be reactive.
 */
export class Terrain {
  /** The displaced, vertex-coloured ground mesh. */
  readonly mesh: THREE.Mesh
  /** Translucent water plane at sea level (rivers/oceans show through). */
  readonly waterMesh: THREE.Mesh

  private readonly seed: number
  private readonly pads: TerrainPad[]

  // --- Heightfield tuning (world units) ---
  /** Sea level. Plains sit ~0, so water reads as low ground/coast. */
  static readonly WATER_LEVEL = -8
  private static readonly OCEAN_FLOOR = -28
  /** Continent field below this is ocean; above it is land. */
  private static readonly SEA_THRESHOLD = 0.42
  private static readonly CONTINENT_SCALE = 540
  private static readonly MOUNTAIN_SCALE = 250
  private static readonly DETAIL_SCALE = 72
  private static readonly MOISTURE_SCALE = 360
  private static readonly RIVER_SCALE = 440
  private static readonly OCTAVES = 4

  private static readonly PLAINS_RISE = 14 // gentle climb from shore inland
  private static readonly MOUNTAIN_START = 0.5 // land factor where peaks begin
  private static readonly MOUNTAIN_HEIGHT = 72
  private static readonly DETAIL_AMP = 2.5
  private static readonly DETAIL_AMP_MTN = 11
  private static readonly RIVER_WIDTH = 0.055
  private static readonly RIVER_DEPTH = 16
  private static readonly SNOW_LINE = 34

  // --- Biome palette ---
  private static readonly MUD = new THREE.Color(0x4d4733)
  private static readonly SAND = new THREE.Color(0xcdbd8b)
  private static readonly SAVANNA = new THREE.Color(0x9fa959)
  private static readonly GRASS = new THREE.Color(0x5a8a3c)
  private static readonly FOREST = new THREE.Color(0x2f5a28)
  private static readonly ROCK = new THREE.Color(0x756b5c)
  private static readonly SNOW = new THREE.Color(0xeef2f6)

  constructor(config: TerrainConfig) {
    this.seed = config.seed ?? 1337
    this.pads = config.pads ?? []
    this.mesh = this.buildMesh(config.size, config.segments ?? 300)
    this.waterMesh = this.buildWater(config.size)
  }

  // --- Public height query (used by physics + spawn placement) -------------

  /** World-space ground height at (x, z): biome height, rivers, then town pads. */
  heightAt(x: number, z: number): number {
    let h = this.landHeight(x, z)
    h -= this.riverCarve(x, z, h)
    for (const pad of this.pads) {
      const d = Math.hypot(x - pad.x, z - pad.z)
      const w = 1 - THREE.MathUtils.smoothstep(d, pad.flatRadius, pad.flatRadius + pad.blendRadius)
      if (w > 0) h = THREE.MathUtils.lerp(h, pad.elevation, w)
    }
    return h
  }

  // --- Procedural biome heightfield ----------------------------------------

  /** Natural land/ocean height (before river carving and pads). */
  private landHeight(x: number, z: number): number {
    const cont = this.fbm(x / Terrain.CONTINENT_SCALE, z / Terrain.CONTINENT_SCALE, this.seed)
    const detail = this.fbm(x / Terrain.DETAIL_SCALE, z / Terrain.DETAIL_SCALE, this.seed + 99) - 0.5

    if (cont < Terrain.SEA_THRESHOLD) {
      // Ocean basin: deep offshore, rising to just under the waterline at the coast.
      const t = cont / Terrain.SEA_THRESHOLD
      return THREE.MathUtils.lerp(Terrain.OCEAN_FLOOR, Terrain.WATER_LEVEL - 1, t) + detail * 1.2
    }

    // Land: gentle plains rising inland, with ridged mountains in the interior.
    const land = (cont - Terrain.SEA_THRESHOLD) / (1 - Terrain.SEA_THRESHOLD) // 0..1
    const ridge = this.ridgedFbm(x / Terrain.MOUNTAIN_SCALE, z / Terrain.MOUNTAIN_SCALE, this.seed + 50)
    const mountainMask = THREE.MathUtils.smoothstep(land, Terrain.MOUNTAIN_START, 1.0)

    let h = Terrain.WATER_LEVEL + 1 + land * Terrain.PLAINS_RISE
    h += ridge * Terrain.MOUNTAIN_HEIGHT * mountainMask
    h += detail * (Terrain.DETAIL_AMP + mountainMask * Terrain.DETAIL_AMP_MTN)
    return h
  }

  /** River channel depth at (x, z); only meaningfully carves the lowlands. */
  private riverCarve(x: number, z: number, h: number): number {
    // Ridge lines of a low-frequency field form winding channels.
    const r = this.fbm(x / Terrain.RIVER_SCALE, z / Terrain.RIVER_SCALE, this.seed + 200)
    const channel = 1 - THREE.MathUtils.smoothstep(Math.abs(r - 0.5), 0, Terrain.RIVER_WIDTH)
    if (channel <= 0) return 0
    // Fade rivers out as terrain climbs so mountains keep their ridgelines.
    const lowland = 1 - THREE.MathUtils.smoothstep(h, 12, 40)
    return channel * Terrain.RIVER_DEPTH * lowland
  }

  /** Surface wetness 0..1 (drives grass vs. dry/desert colouring). */
  private moistureAt(x: number, z: number): number {
    return this.fbm(x / Terrain.MOISTURE_SCALE, z / Terrain.MOISTURE_SCALE, this.seed + 300)
  }

  // --- Noise primitives -----------------------------------------------------

  /** Fractal sum of value-noise octaves, normalised to 0..1. */
  private fbm(x: number, z: number, seed: number): number {
    let amp = 1, freq = 1, sum = 0, norm = 0
    for (let o = 0; o < Terrain.OCTAVES; o++) {
      sum += amp * this.valueNoise(x * freq, z * freq, seed + o * 1013)
      norm += amp
      amp *= 0.5
      freq *= 2
    }
    return sum / norm
  }

  /** Ridged fractal noise (sharp ridgelines) for mountains, normalised 0..1. */
  private ridgedFbm(x: number, z: number, seed: number): number {
    let amp = 1, freq = 1, sum = 0, norm = 0
    for (let o = 0; o < Terrain.OCTAVES; o++) {
      const n = this.valueNoise(x * freq, z * freq, seed + o * 1013)
      const ridge = 1 - Math.abs(2 * n - 1) // peaks where noise crosses 0.5
      sum += amp * ridge * ridge
      norm += amp
      amp *= 0.5
      freq *= 2
    }
    return sum / norm
  }

  /** Smooth value noise on the integer lattice (smoothstep-interpolated). */
  private valueNoise(x: number, z: number, seed: number): number {
    const ix = Math.floor(x)
    const iz = Math.floor(z)
    const fx = x - ix
    const fz = z - iz
    const ux = fx * fx * (3 - 2 * fx)
    const uz = fz * fz * (3 - 2 * fz)
    const a = Terrain.hash2(ix, iz, seed)
    const b = Terrain.hash2(ix + 1, iz, seed)
    const c = Terrain.hash2(ix, iz + 1, seed)
    const d = Terrain.hash2(ix + 1, iz + 1, seed)
    return THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(a, b, ux),
      THREE.MathUtils.lerp(c, d, ux),
      uz,
    )
  }

  /** Deterministic integer hash → 0..1 (reproducible; no Math.random). */
  private static hash2(ix: number, iz: number, seed: number): number {
    let h = (ix | 0) * 374761393 + (iz | 0) * 668265263 + (seed | 0) * 982451653
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    h = h ^ (h >>> 16)
    return (h >>> 0) / 4294967295
  }

  // --- Mesh construction ----------------------------------------------------

  private buildMesh(size: number, segments: number): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments)
    const pos = geo.attributes.position as THREE.BufferAttribute

    // Displace each vertex along local Z (becomes world Y after the -90° X
    // rotation). Local +Y maps to world -Z, hence the negation.
    for (let i = 0; i < pos.count; i++) {
      const worldX = pos.getX(i)
      const worldZ = -pos.getY(i)
      pos.setZ(i, this.heightAt(worldX, worldZ))
    }
    pos.needsUpdate = true

    geo.computeVertexNormals()
    geo.rotateX(-Math.PI / 2)

    this.applyBiomeColors(geo)

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.95,
      metalness: 0.0,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.receiveShadow = true
    // The ground does not cast — a near-flat heightfield self-shadowing under a
    // high sun adds nothing visible but would push ~180k tris through the shadow
    // pass. Mechs/towns still cast onto it (receiveShadow stays on).
    mesh.castShadow = false
    mesh.name = 'terrain'
    return mesh
  }

  /** Colour each vertex by biome: elevation + moisture + slope + snow line. */
  private applyBiomeColors(geo: THREE.BufferGeometry): void {
    const pos = geo.attributes.position as THREE.BufferAttribute
    const normal = geo.attributes.normal as THREE.BufferAttribute
    const colors = new Float32Array(pos.count * 3)
    const c = new THREE.Color()
    const SS = THREE.MathUtils.smoothstep

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i) // world height
      const zc = pos.getZ(i)
      const moisture = this.moistureAt(x, zc)
      const slopeUp = THREE.MathUtils.clamp(normal.getY(i), 0, 1)

      if (y < Terrain.WATER_LEVEL + 0.6) {
        // Submerged / shoreline: muddy bed rising to wet sand at the waterline.
        const t = THREE.MathUtils.clamp(
          (y - Terrain.OCEAN_FLOOR) / (Terrain.WATER_LEVEL + 0.6 - Terrain.OCEAN_FLOOR), 0, 1)
        c.copy(Terrain.MUD).lerp(Terrain.SAND, t)
      } else if (y < Terrain.WATER_LEVEL + 2.6) {
        // Beach.
        c.copy(Terrain.SAND)
      } else {
        // Inland: dry savanna/sand → grass with moisture, forest where wet+low,
        // rock as it climbs, snow on the peaks.
        const landN = THREE.MathUtils.clamp(
          (y - (Terrain.WATER_LEVEL + 2.6)) / (Terrain.MOUNTAIN_HEIGHT * 0.6), 0, 1)
        c.copy(Terrain.SAND).lerp(Terrain.SAVANNA, SS(moisture, 0.2, 0.42))
        c.lerp(Terrain.GRASS, SS(moisture, 0.4, 0.62))
        c.lerp(Terrain.FOREST, SS(moisture, 0.6, 0.9) * (1 - SS(landN, 0.35, 0.6)))
        c.lerp(Terrain.ROCK, SS(landN, 0.45, 0.72))
        c.lerp(Terrain.SNOW, SS(y, Terrain.SNOW_LINE, Terrain.SNOW_LINE + 16))
      }

      // Steep faces trend rocky regardless of biome.
      const rockFromSlope = (1 - SS(slopeUp, 0.74, 0.94)) * 0.8
      if (rockFromSlope > 0 && y > Terrain.WATER_LEVEL + 2.6) c.lerp(Terrain.ROCK, rockFromSlope)

      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  }

  private buildWater(size: number): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(size, size, 1, 1)
    geo.rotateX(-Math.PI / 2)
    const mat = new THREE.MeshStandardMaterial({
      color: 0x2f6f96,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: 0.78,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.y = Terrain.WATER_LEVEL
    mesh.receiveShadow = true
    mesh.name = 'water'
    return mesh
  }

  dispose(): void {
    for (const m of [this.mesh, this.waterMesh]) {
      m.geometry.dispose()
      const mat = m.material
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
      else mat.dispose()
    }
  }
}
