import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// ============================================================================
// Wilderness scatter (rocks / alien flora / grass tufts). Deterministic,
// InstancedMesh-based props that dress the empty heightfield between towns.
// Assets are built once per Terrain; placement is seeded from the terrain seed
// so reloads reproduce the same distribution as the heightfield itself.
// ============================================================================

interface ScatterAssets {
  rockBoulderGeo: THREE.IcosahedronGeometry
  rockSlabGeo: THREE.BoxGeometry
  rockMat: THREE.MeshStandardMaterial
  pebbleClusterGeo: THREE.BufferGeometry
  pebbleMat: THREE.MeshStandardMaterial
  floraSpireTrunkGeo: THREE.CylinderGeometry
  floraSpireCanopyGeo: THREE.IcosahedronGeometry
  floraSpireTrunkMat: THREE.MeshStandardMaterial
  floraSpireCanopyMat: THREE.MeshStandardMaterial
  floraMushStalkGeo: THREE.CylinderGeometry
  floraMushCapGeo: THREE.CylinderGeometry
  floraMushStalkMat: THREE.MeshStandardMaterial
  floraMushCapMat: THREE.MeshStandardMaterial
  grassTuftGeo: THREE.BufferGeometry
  grassMat: THREE.MeshLambertMaterial
}

/** Builds every prop geometry+material once. Unit-sized; per-instance scale does the rest. */
function buildScatterAssets(): ScatterAssets {
  const rockBoulderGeo = new THREE.IcosahedronGeometry(1, 0)
  const rockSlabGeo = new THREE.BoxGeometry(1, 1, 1)
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x756b5c, roughness: 1, metalness: 0, flatShading: true,
  })

  // Pebble cluster: 5 small merged icosahedron/dodecahedron lumps forming an
  // irregular clump (unit-sized; per-instance scale/rotation gives variety).
  // Offsets are a fixed hand-placed pattern (not RNG) — deterministic like the
  // grass tuft below, and built once regardless of map seed.
  const pebbleLumpGeos: THREE.BufferGeometry[] = []
  const pebbleLumps: Array<[number, number, number, number, boolean]> = [
    [0, 0, 0, 0.34, true],
    [0.26, 0.02, 0.12, 0.24, false],
    [-0.22, -0.01, 0.18, 0.22, true],
    [0.05, 0.03, -0.28, 0.2, false],
    [-0.18, 0, -0.2, 0.18, true],
  ]
  for (const [ox, oy, oz, r, dodeca] of pebbleLumps) {
    // Polyhedron geometries (Icosahedron/Dodecahedron) are already
    // non-indexed in three r182, unlike the grass blade's ConeGeometry below
    // — no .toNonIndexed() needed (it would just warn and no-op).
    const lump = dodeca ? new THREE.DodecahedronGeometry(r, 0) : new THREE.IcosahedronGeometry(r, 0)
    lump.translate(ox, oy + r * 0.5, oz)
    pebbleLumpGeos.push(lump)
  }
  const pebbleClusterGeo = mergeGeometries(pebbleLumpGeos, false) as THREE.BufferGeometry
  pebbleLumpGeos.forEach((g) => g.dispose())
  const pebbleMat = new THREE.MeshStandardMaterial({
    color: 0x8c8172, roughness: 1, metalness: 0, flatShading: true,
  })

  // Alien flora #1 "spire": tapered trunk + angular violet canopy pod.
  const floraSpireTrunkGeo = new THREE.CylinderGeometry(0.1, 0.2, 1, 5)
  floraSpireTrunkGeo.translate(0, 0.5, 0)
  const floraSpireCanopyGeo = new THREE.IcosahedronGeometry(0.65, 0)
  floraSpireCanopyGeo.translate(0, 1.15, 0) // sit atop the trunk under the shared transform
  const floraSpireTrunkMat = new THREE.MeshStandardMaterial({
    color: 0x4a3f52, roughness: 0.9, metalness: 0, flatShading: true,
  })
  const floraSpireCanopyMat = new THREE.MeshStandardMaterial({
    color: 0x7a5cc4, roughness: 0.6, metalness: 0.05, flatShading: true,
    emissive: 0x3a2a66, emissiveIntensity: 0.25,
  })

  // Alien flora #2 "mushroom": short stalk + wide flattened teal cap.
  const floraMushStalkGeo = new THREE.CylinderGeometry(0.16, 0.2, 1, 6)
  floraMushStalkGeo.translate(0, 0.5, 0)
  const floraMushCapGeo = new THREE.CylinderGeometry(1, 0.45, 0.35, 7)
  floraMushCapGeo.translate(0, 1.0, 0)
  const floraMushStalkMat = new THREE.MeshStandardMaterial({
    color: 0x5a4a3a, roughness: 0.9, metalness: 0, flatShading: true,
  })
  const floraMushCapMat = new THREE.MeshStandardMaterial({
    color: 0x3fa695, roughness: 0.55, metalness: 0.05, flatShading: true,
    emissive: 0x145048, emissiveIntensity: 0.2,
  })

  // Grass tuft: 3 thin cone "blades" fanned out and merged into one geometry.
  const bladeGeos: THREE.BufferGeometry[] = []
  for (let i = 0; i < 3; i++) {
    const blade = new THREE.ConeGeometry(0.05, 0.5, 4)
    blade.translate(0, 0.25, 0)
    const angle = (i / 3) * Math.PI * 2
    blade.rotateZ(0.35)
    blade.rotateY(angle)
    blade.translate(Math.cos(angle) * 0.06, 0, Math.sin(angle) * 0.06)
    bladeGeos.push(blade.toNonIndexed())
  }
  const grassTuftGeo = mergeGeometries(bladeGeos, false)
  bladeGeos.forEach((g) => g.dispose())
  const grassMat = new THREE.MeshLambertMaterial({ color: 0x5f8f45 })

  return {
    rockBoulderGeo, rockSlabGeo, rockMat,
    pebbleClusterGeo, pebbleMat,
    floraSpireTrunkGeo, floraSpireCanopyGeo, floraSpireTrunkMat, floraSpireCanopyMat,
    floraMushStalkGeo, floraMushCapGeo, floraMushStalkMat, floraMushCapMat,
    grassTuftGeo, grassMat,
  }
}

/** mulberry32: tiny deterministic PRNG (not Math.random — reproducible per seed). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface ScatterTypeSpec {
  count: number
  attemptsPerInstance: number
  waterMargin: number
  minY: number
  maxY: number
  maxSlope: number
  moistureBias?: [lo: number, hi: number]
  scaleRange: [min: number, max: number]
  sinkDepth: number
  /** Extra 0..1 acceptance weight (multiplied against a fresh rng() roll),
   *  e.g. to bias a prop toward steep/rocky ground or river banks without a
   *  hard cutoff like maxSlope. */
  extraBias?: (x: number, z: number, y: number, slope: number) => number
}

const SCATTER_SPECS: Record<'rockBoulder' | 'rockSlab' | 'pebbleCluster' | 'floraSpire' | 'floraMush' | 'grass', ScatterTypeSpec> = {
  rockBoulder: { count: 150, attemptsPerInstance: 6, waterMargin: 1.5, minY: -6, maxY: 200, maxSlope: 1.4, scaleRange: [0.8, 3.2], sinkDepth: 0.3 },
  rockSlab:    { count: 100, attemptsPerInstance: 6, waterMargin: 1.5, minY: -6, maxY: 200, maxSlope: 1.4, scaleRange: [0.9, 2.6], sinkDepth: 0.15 },
  // Small pebble clumps: broadly scattered but weighted toward steep/rocky
  // ground and river-bank elevations (just above the waterline).
  pebbleCluster: {
    count: 80, attemptsPerInstance: 10, waterMargin: 0.5, minY: -7, maxY: 200, maxSlope: 1.6,
    scaleRange: [0.35, 0.9], sinkDepth: 0.08,
    extraBias: (_x, _z, y, slope) => {
      const riverBank = 1 - THREE.MathUtils.smoothstep(y, Terrain.WATER_LEVEL + 0.6, Terrain.WATER_LEVEL + 6)
      const rocky = THREE.MathUtils.smoothstep(slope, 0.25, 0.9)
      return THREE.MathUtils.clamp(Math.max(riverBank, rocky) + 0.15, 0, 1)
    },
  },
  floraSpire:  { count: 170, attemptsPerInstance: 8, waterMargin: 2,   minY: -5, maxY: 34,  maxSlope: 0.5, moistureBias: [0.25, 0.55], scaleRange: [1.4, 3.2], sinkDepth: 0.2 },
  floraMush:   { count: 140, attemptsPerInstance: 8, waterMargin: 2,   minY: -5, maxY: 30,  maxSlope: 0.45, moistureBias: [0.35, 0.7], scaleRange: [1.0, 2.2], sinkDepth: 0.15 },
  grass:       { count: 450, attemptsPerInstance: 4, waterMargin: 0.5, minY: -7, maxY: 45,  maxSlope: 0.6, moistureBias: [0.2, 0.5], scaleRange: [0.7, 1.8], sinkDepth: 0.05 },
}

/** One sampled sub-segment of a curved dirt path between two pads, with a
 *  precomputed bounding box for cheap distance-query rejection. */
interface PathSegment {
  ax: number
  az: number
  bx: number
  bz: number
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

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
  /** Instanced wilderness props (rocks, alien flora, grass). Add each to the
   *  scene; disposed via Terrain.dispose(). */
  readonly scatterMeshes: THREE.InstancedMesh[]

  private readonly seed: number
  private readonly pads: TerrainPad[]
  /** Sampled polyline segments of the dirt-path network connecting town pads
   *  (built once at construction). Empty when fewer than 2 pads exist. */
  private readonly pathSegments: PathSegment[]
  /** Coarse spatial index over pathSegments (world units -> grid cell) so
   *  heightAt/applyBiomeColors/buildScatter can cheaply reject points far from
   *  any path instead of scanning every segment. */
  private readonly pathGrid: Map<string, PathSegment[]> = new Map()
  /** Optional tiling bump-noise texture (falls back to none if canvas 2D isn't
   *  available, e.g. under the headless test DOM). Disposed in dispose(). */
  private bumpTexture: THREE.Texture | null = null

  // --- Heightfield tuning (world units) ---
  /** Sea level. Plains sit ~0, so water reads as low ground/coast. */
  static readonly WATER_LEVEL = -8
  // Ocean basins are deliberately SHALLOW: the ground provider (heightAt) returns
  // the seabed, so a deep floor would let the mech walk submerged in a dead,
  // disorienting trench under the translucent water plane. Keeping the floor only
  // a few units under WATER_LEVEL makes basins read as wadeable coastal shallows /
  // lakes instead. This regenerates the heightfield, so the visible mesh and the
  // physics ground height stay in sync automatically.
  private static readonly OCEAN_FLOOR = -14
  /** Continent field below this is ocean; above it is land. Lowered so oceans
   *  cover less of the map (more walkable land, smaller dead-water regions). */
  private static readonly SEA_THRESHOLD = 0.3
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

  // --- Dirt path network (world units) ---
  /** Distance from a path centerline that stays fully "on path" (flatten +
   *  full dirt colour). */
  private static readonly PATH_HALF_WIDTH = 2.5
  /** Distance at which the path's height/colour influence fully fades out.
   *  The band between PATH_HALF_WIDTH and this is the soft falloff. */
  private static readonly PATH_BAND = 5
  /** Cell size of the coarse spatial grid used to bucket path segments. */
  private static readonly PATH_GRID_CELL = 40
  /** Dry, worn-dirt tone paths blend toward. */
  private static readonly PATH_COLOR = new THREE.Color(0x8a6f4d)

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
    // Path network must exist before the mesh/scatter build: heightAt (used by
    // buildMesh's per-vertex displacement) and buildScatter's exclusion check
    // both consult it.
    this.pathSegments = this.buildPathNetwork(config.size)
    this.buildPathGrid()
    this.mesh = this.buildMesh(config.size, config.segments ?? 300)
    this.waterMesh = this.buildWater(config.size)
    this.scatterMeshes = this.buildScatter(config.size)
  }

  // --- Deterministic wilderness scatter -------------------------------------

  /** Central-difference slope (gradient magnitude); only run at scatter-build time. */
  private slopeAt(x: number, z: number): number {
    const e = 2
    const hx = (this.heightAt(x + e, z) - this.heightAt(x - e, z)) / (2 * e)
    const hz = (this.heightAt(x, z + e) - this.heightAt(x, z - e)) / (2 * e)
    return Math.hypot(hx, hz)
  }

  /** True if (x,z) falls inside any town/spawn pad's flattened+blend footprint. */
  private isInsidePad(x: number, z: number): boolean {
    for (const pad of this.pads) {
      const d = Math.hypot(x - pad.x, z - pad.z)
      if (d < pad.flatRadius + pad.blendRadius + 4) return true
    }
    return false
  }

  /**
   * Scatter rocks, two alien-flora silhouettes, and grass tufts across the
   * wilderness, each as a single InstancedMesh (or a matched pair for two-part
   * props). Seeded from the terrain seed so reloads reproduce the same layout.
   * Rejects water, town pads, out-of-band elevation/slope, and biases by moisture.
   */
  private buildScatter(size: number): THREE.InstancedMesh[] {
    const assets = buildScatterAssets()
    const rng = mulberry32(this.seed ^ 0x5c1e57e5)
    const half = size / 2 - 20 // keep off the very edge of the world
    const meshes: THREE.InstancedMesh[] = []

    const place = (
      spec: ScatterTypeSpec,
      build: (matrices: THREE.Matrix4[]) => THREE.InstancedMesh[],
    ): THREE.InstancedMesh[] => {
      const matrices: THREE.Matrix4[] = []
      const maxAttempts = spec.count * spec.attemptsPerInstance
      let attempts = 0
      while (matrices.length < spec.count && attempts < maxAttempts) {
        attempts++
        const x = (rng() * 2 - 1) * half
        const z = (rng() * 2 - 1) * half
        if (this.isInsidePad(x, z)) continue
        // Keep props off the worn dirt paths (matches the visual/height blend band).
        if (this.pathSegments.length > 0 && this.nearestPathDist(x, z) < Terrain.PATH_BAND) continue
        const y = this.heightAt(x, z)
        if (y < Terrain.WATER_LEVEL + spec.waterMargin) continue
        if (y < spec.minY || y > spec.maxY) continue
        const slope = this.slopeAt(x, z)
        if (slope > spec.maxSlope) continue
        if (spec.moistureBias) {
          const [lo, hi] = spec.moistureBias
          const w = THREE.MathUtils.smoothstep(this.moistureAt(x, z), lo, hi)
          if (rng() > w) continue
        }
        if (spec.extraBias) {
          const w = spec.extraBias(x, z, y, slope)
          if (rng() > w) continue
        }

        const scale = THREE.MathUtils.lerp(spec.scaleRange[0], spec.scaleRange[1], rng())
        const anisotropy = 0.85 + rng() * 0.3
        const rotY = rng() * Math.PI * 2
        const tilt = (rng() - 0.5) * 0.12

        const m = new THREE.Matrix4()
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, rotY, tilt * 0.7))
        m.compose(
          new THREE.Vector3(x, y - spec.sinkDepth, z),
          q,
          new THREE.Vector3(scale, scale * anisotropy, scale),
        )
        matrices.push(m)
      }
      return build(matrices)
    }

    const makeSingle = (geo: THREE.BufferGeometry, mat: THREE.Material, matrices: THREE.Matrix4[], castShadow: boolean): THREE.InstancedMesh => {
      const mesh = new THREE.InstancedMesh(geo, mat, matrices.length)
      matrices.forEach((m, i) => mesh.setMatrixAt(i, m))
      mesh.instanceMatrix.needsUpdate = true
      mesh.castShadow = castShadow
      mesh.receiveShadow = false
      mesh.computeBoundingSphere() // per-instance transforms span the whole map
      return mesh
    }

    meshes.push(...place(SCATTER_SPECS.rockBoulder, (mats) => [makeSingle(assets.rockBoulderGeo, assets.rockMat, mats, true)]))
    meshes.push(...place(SCATTER_SPECS.rockSlab, (mats) => [makeSingle(assets.rockSlabGeo, assets.rockMat, mats, true)]))
    meshes.push(...place(SCATTER_SPECS.pebbleCluster, (mats) => [makeSingle(assets.pebbleClusterGeo, assets.pebbleMat, mats, true)]))
    meshes.push(...place(SCATTER_SPECS.floraSpire, (mats) => [
      makeSingle(assets.floraSpireTrunkGeo, assets.floraSpireTrunkMat, mats, true),
      makeSingle(assets.floraSpireCanopyGeo, assets.floraSpireCanopyMat, mats, true),
    ]))
    meshes.push(...place(SCATTER_SPECS.floraMush, (mats) => [
      makeSingle(assets.floraMushStalkGeo, assets.floraMushStalkMat, mats, true),
      makeSingle(assets.floraMushCapGeo, assets.floraMushCapMat, mats, true),
    ]))
    meshes.push(...place(SCATTER_SPECS.grass, (mats) => [makeSingle(assets.grassTuftGeo, assets.grassMat, mats, false)]))

    return meshes
  }

  // --- Dirt path network ------------------------------------------------------
  // Connects town/spawn pads with gently curved dirt paths so settlements read
  // as a lived-in place rather than isolated dots on a heightfield. Built once
  // at construction; heightAt/applyBiomeColors/buildScatter all consult the
  // precomputed segment list (never recomputed per frame).

  /**
   * Build a sparse path graph over the pads (each connects to its 1-2 nearest
   * neighbours, edges deduped, long edges skipped) then sample each edge as a
   * quadratic bezier — a seeded perpendicular offset at the midpoint gives it a
   * gentle curve — into short PathSegments with precomputed bounding boxes.
   */
  private buildPathNetwork(size: number): PathSegment[] {
    const pads = this.pads
    if (pads.length < 2) return []

    const maxEdgeLen = size * (2 / 3)
    const edgeKeys = new Set<string>()
    const edges: Array<[number, number]> = []
    for (let i = 0; i < pads.length; i++) {
      const candidates: Array<{ j: number; d: number }> = []
      for (let j = 0; j < pads.length; j++) {
        if (i === j) continue
        const d = Math.hypot(pads[i].x - pads[j].x, pads[i].z - pads[j].z)
        if (d > maxEdgeLen) continue
        candidates.push({ j, d })
      }
      candidates.sort((a, b) => a.d - b.d)
      for (let k = 0; k < Math.min(2, candidates.length); k++) {
        const j = candidates[k].j
        const key = i < j ? `${i}_${j}` : `${j}_${i}`
        if (edgeKeys.has(key)) continue
        edgeKeys.add(key)
        edges.push(i < j ? [i, j] : [j, i])
      }
    }

    const SEGMENTS_PER_EDGE = 20
    const segments: PathSegment[] = []
    for (const [i, j] of edges) {
      const a = pads[i]
      const b = pads[j]
      // Seed from the pad pair (not the whole-network rng) so edge order/count
      // changes elsewhere never reshuffle an already-generated curve.
      const rng = mulberry32(this.seed ^ ((i + 1) * 92821) ^ ((j + 1) * 51329))
      const dx = b.x - a.x
      const dz = b.z - a.z
      const len = Math.hypot(dx, dz) || 1
      const px = -dz / len // perpendicular unit vector
      const pz = dx / len
      const offset = (rng() - 0.5) * len * 0.28 // gentle bow, seeded per edge
      const cx = (a.x + b.x) / 2 + px * offset
      const cz = (a.z + b.z) / 2 + pz * offset

      let prevX = a.x
      let prevZ = a.z
      for (let s = 1; s <= SEGMENTS_PER_EDGE; s++) {
        const t = s / SEGMENTS_PER_EDGE
        const it = 1 - t
        const qx = it * it * a.x + 2 * it * t * cx + t * t * b.x
        const qz = it * it * a.z + 2 * it * t * cz + t * t * b.z
        segments.push({
          ax: prevX, az: prevZ, bx: qx, bz: qz,
          minX: Math.min(prevX, qx), maxX: Math.max(prevX, qx),
          minZ: Math.min(prevZ, qz), maxZ: Math.max(prevZ, qz),
        })
        prevX = qx
        prevZ = qz
      }
    }
    return segments
  }

  /** Bucket path segments into a coarse grid so distance queries only scan the
   *  handful of segments near (x,z) instead of the whole network. */
  private buildPathGrid(): void {
    const cell = Terrain.PATH_GRID_CELL
    const margin = Terrain.PATH_BAND
    for (const seg of this.pathSegments) {
      const minCX = Math.floor((seg.minX - margin) / cell)
      const maxCX = Math.floor((seg.maxX + margin) / cell)
      const minCZ = Math.floor((seg.minZ - margin) / cell)
      const maxCZ = Math.floor((seg.maxZ + margin) / cell)
      for (let cx = minCX; cx <= maxCX; cx++) {
        for (let cz = minCZ; cz <= maxCZ; cz++) {
          const key = `${cx}_${cz}`
          let bucket = this.pathGrid.get(key)
          if (!bucket) { bucket = []; this.pathGrid.set(key, bucket) }
          bucket.push(seg)
        }
      }
    }
  }

  /** Shortest distance from (x,z) to the path network, via the coarse grid
   *  (only the 3x3 neighbourhood of cells around the point is scanned). */
  private nearestPathDist(x: number, z: number): number {
    if (this.pathSegments.length === 0) return Infinity
    const cell = Terrain.PATH_GRID_CELL
    const cx = Math.floor(x / cell)
    const cz = Math.floor(z / cell)
    let best = Infinity
    for (let dcx = -1; dcx <= 1; dcx++) {
      for (let dcz = -1; dcz <= 1; dcz++) {
        const bucket = this.pathGrid.get(`${cx + dcx}_${cz + dcz}`)
        if (!bucket) continue
        for (const seg of bucket) {
          const d = Terrain.distToSegment(x, z, seg.ax, seg.az, seg.bx, seg.bz)
          if (d < best) best = d
        }
      }
    }
    return best
  }

  /** Point-to-segment distance in the XZ plane. */
  private static distToSegment(px: number, pz: number, ax: number, az: number, bx: number, bz: number): number {
    const dx = bx - ax
    const dz = bz - az
    const lenSq = dx * dx + dz * dz
    let t = lenSq > 1e-8 ? ((px - ax) * dx + (pz - az) * dz) / lenSq : 0
    t = THREE.MathUtils.clamp(t, 0, 1)
    return Math.hypot(px - (ax + t * dx), pz - (az + t * dz))
  }

  /** 0..1 path influence at (x,z): 1 within PATH_HALF_WIDTH of a centerline,
   *  fading to 0 by PATH_BAND. Drives both the height smoothing and the dirt
   *  colour blend so the visual and physical surfaces always agree. */
  private pathInfluence(x: number, z: number): number {
    if (this.pathSegments.length === 0) return 0
    const d = this.nearestPathDist(x, z)
    if (d >= Terrain.PATH_BAND) return 0
    return 1 - THREE.MathUtils.smoothstep(d, Terrain.PATH_HALF_WIDTH, Terrain.PATH_BAND)
  }

  // --- Public height query (used by physics + spawn placement) -------------

  /** World-space ground height at (x, z): biome height, rivers, worn dirt
   *  paths, then town pads. */
  heightAt(x: number, z: number): number {
    let h = this.landHeight(x, z)
    h -= this.riverCarve(x, z, h)

    // Paths are worn, not carved trenches: suppress local noise (not the
    // underlying continent/mountain shape) near the centerline, feathered out
    // across the band, so the mesh reads as smoothed dirt rather than a ditch.
    const pathT = this.pathInfluence(x, z)
    if (pathT > 0) {
      const smoothLand = this.landHeight(x, z, 0)
      const smoothH = smoothLand - this.riverCarve(x, z, smoothLand)
      h = THREE.MathUtils.lerp(h, smoothH, pathT * 0.5) // ~50% noise suppression at center
    }

    for (const pad of this.pads) {
      const d = Math.hypot(x - pad.x, z - pad.z)
      const w = 1 - THREE.MathUtils.smoothstep(d, pad.flatRadius, pad.flatRadius + pad.blendRadius)
      if (w > 0) h = THREE.MathUtils.lerp(h, pad.elevation, w)
    }
    return h
  }

  // --- Procedural biome heightfield ----------------------------------------

  /**
   * Natural land/ocean height (before river carving and pads).
   * `detailMul` scales the fine detail-noise term only (continent/mountain
   * shape is untouched) — heightAt passes 0 near dirt paths to get a "worn
   * smooth" variant of the same ground for the path height blend.
   */
  private landHeight(x: number, z: number, detailMul: number = 1): number {
    const cont = this.fbm(x / Terrain.CONTINENT_SCALE, z / Terrain.CONTINENT_SCALE, this.seed)
    const detail = (this.fbm(x / Terrain.DETAIL_SCALE, z / Terrain.DETAIL_SCALE, this.seed + 99) - 0.5) * detailMul

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

    // Lambert, not Standard: the terrain fills most of the screen, so this is
    // the scene's dominant lit surface. It's matte (metalness 0, roughness 0.95)
    // so GGX specular/IBL buys nothing — Lambert gives the same diffuse look for
    // a fraction of the per-fragment cost. vertexColors, fog and receiveShadow
    // all still apply; it just skips the expensive PBR math on every covered pixel.
    const mat = new THREE.MeshLambertMaterial({
      vertexColors: true,
    })
    this.bumpTexture = this.buildBumpTexture()
    if (this.bumpTexture) {
      mat.bumpMap = this.bumpTexture
      mat.bumpScale = 0.35
    }
    const mesh = new THREE.Mesh(geo, mat)
    mesh.receiveShadow = true
    // The ground does not cast — a near-flat heightfield self-shadowing under a
    // high sun adds nothing visible but would push ~180k tris through the shadow
    // pass. Mechs/towns still cast onto it (receiveShadow stays on).
    mesh.castShadow = false
    mesh.name = 'terrain'
    return mesh
  }

  /**
   * Small tiling noise texture used as a subtle bump map so the terrain isn't
   * perfectly smooth under grazing light. Drawn with fillStyle/fillRect ONLY
   * (many small rects) — no drawImage/getImageData/gradients on the fill path
   * — because the headless unit-test DOM stubs canvas 2D with just fillStyle,
   * fillRect and createRadialGradient. Wrapped in try/catch so any environment
   * that can't produce a real 2D context (that stub, or a canvas-less host)
   * silently falls back to no bump map instead of throwing during Terrain
   * construction.
   */
  private buildBumpTexture(): THREE.Texture | null {
    try {
      const size = 128
      const canvas = document.createElement('canvas') as HTMLCanvasElement
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null
      if (!ctx) return null

      ctx.fillStyle = '#808080' // neutral mid-grey = no bump
      ctx.fillRect(0, 0, size, size)

      const rng = mulberry32(this.seed ^ 0x9e3779b1)
      const cell = 4
      for (let y = 0; y < size; y += cell) {
        for (let x = 0; x < size; x += cell) {
          const v = Math.floor(96 + rng() * 96) // 96..192 grey
          const hex = v.toString(16).padStart(2, '0')
          ctx.fillStyle = `#${hex}${hex}${hex}`
          ctx.fillRect(x, y, cell, cell)
        }
      }

      const texture = new THREE.CanvasTexture(canvas)
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(56, 56) // PlaneGeometry UVs span 0..1 over the whole terrain
      texture.needsUpdate = true
      return texture
    } catch {
      return null
    }
  }

  /** Colour each vertex by biome: elevation + moisture + slope + snow line. */
  private applyBiomeColors(geo: THREE.BufferGeometry): void {
    const pos = geo.attributes.position as THREE.BufferAttribute
    const normal = geo.attributes.normal as THREE.BufferAttribute
    const colors = new Float32Array(pos.count * 3)
    const c = new THREE.Color()
    const dirt = new THREE.Color()
    const SS = THREE.MathUtils.smoothstep
    const hasPaths = this.pathSegments.length > 0

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

      // Dirt paths: blend toward a dry worn tone near path centerlines, with a
      // seeded high-frequency wobble on the distance so the border reads as a
      // ragged trodden edge instead of a ruler-straight line.
      if (hasPaths) {
        const d = this.nearestPathDist(x, zc)
        if (d < Terrain.PATH_BAND + 2) {
          const edgeNoise = (this.valueNoise(x / 4, zc / 4, this.seed + 777) - 0.5) * 2.2
          const t = 1 - SS(d + edgeNoise, Terrain.PATH_HALF_WIDTH, Terrain.PATH_BAND)
          if (t > 0) {
            const tone = (this.valueNoise(x / 6 + 50, zc / 6 + 50, this.seed + 888) - 0.5) * 0.12
            dirt.copy(Terrain.PATH_COLOR)
            dirt.r = THREE.MathUtils.clamp(dirt.r + tone, 0, 1)
            dirt.g = THREE.MathUtils.clamp(dirt.g + tone * 0.8, 0, 1)
            dirt.b = THREE.MathUtils.clamp(dirt.b + tone * 0.6, 0, 1)
            c.lerp(dirt, t)
          }
        }
      }

      // High-frequency per-vertex jitter so large flat-biome areas break up
      // instead of reading as one flat colour; slightly stronger where mossy/
      // grassy (mid moisture) since flat green fields show banding the most.
      const jitterHash = Terrain.hash2(Math.round(x * 2), Math.round(zc * 2), this.seed + 4242)
      const jitterStrength = 0.05 + 0.02 * SS(moisture, 0.3, 0.6)
      const jitter = (jitterHash - 0.5) * 2 * jitterStrength
      c.r = THREE.MathUtils.clamp(c.r * (1 + jitter), 0, 1)
      c.g = THREE.MathUtils.clamp(c.g * (1 + jitter), 0, 1)
      c.b = THREE.MathUtils.clamp(c.b * (1 + jitter * 0.9), 0, 1)

      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  }

  private buildWater(size: number): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(size, size, 1, 1)
    geo.rotateX(-Math.PI / 2)
    const mat = new THREE.MeshLambertMaterial({
      color: 0x2f6f96,
      transparent: true,
      opacity: 0.78,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.y = Terrain.WATER_LEVEL
    // No shadow receive on water: the surface sits below terrain and is 78%
    // transparent, so cast shadows on it are invisible but cost a shadow-map
    // sample per covered fragment in the transparent pass.
    mesh.receiveShadow = false
    mesh.name = 'water'
    return mesh
  }

  dispose(): void {
    for (const m of [this.mesh, this.waterMesh, ...this.scatterMeshes]) {
      m.geometry.dispose()
      const mat = m.material
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
      else mat.dispose()
    }
    this.bumpTexture?.dispose()
  }
}
