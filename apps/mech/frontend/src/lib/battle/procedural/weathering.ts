/**
 * Weathering toolkit — makes salvage-grade parts look run-down.
 *
 * Companion to ./detailing (the clean "factory fresh" art bible). Where
 * detailing gives crisp charcoal plate + gold piping, this module gives the
 * starter-tier gear its story: faded chipped paint, rust bleeding from bolt
 * heads, mismatched replacement panels, exposed innards and drooping cable
 * runs. Two layers:
 *
 *  1. MATERIAL wear — `applyWear(group)` walks a built part and swaps every
 *     clean MeshStandardMaterial for a cached worn counterpart: desaturated
 *     color, canvas-generated grime `.map` + `roughnessMap`, higher roughness,
 *     lower metalness. Swaps are keyed by source-material reference so
 *     bakedParts.ts still collapses the part into a handful of draw calls.
 *  2. GEOMETRY wear — helpers for the "salvaged, not manufactured" read:
 *     `patchPlate` (wrong-color replacement armor), `weldSeam`, `hangingCable`,
 *     `rustStreak` / `scorchDecal` (alpha decals), `exposedRibs` (missing-panel
 *     cavity), and `jitter` (breaks the perfectly-flush plate alignment).
 *
 * Baking constraints honored throughout:
 *  - Worn materials are cached per source material / per key, so merged
 *    batches stay coherent (bakeZone buckets by material REFERENCE).
 *  - Decals share one transparent material each and use polygonOffset +
 *    depthWrite:false so merged coplanar quads don't z-fight.
 *  - Textures are generated lazily and only when a DOM exists, so builders
 *    stay importable in node test environments (materials just skip the map).
 *  - Builders are built ONCE per part id then cached (bakedParts.ts), so use
 *    `seededRand` for any scatter — the same part must look identical across
 *    sessions and mech instances.
 */

import * as THREE from 'three'
import { PALETTE, frameMat, ventMat } from './detailing'

/* ------------------------------------------------------------------ */
/* SEEDED RANDOM                                                       */
/* ------------------------------------------------------------------ */

/**
 * Deterministic PRNG (mulberry32). Part builders run once per session and get
 * baked/cached, so wear scatter must be reproducible — seed per part id.
 */
export function seededRand(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ------------------------------------------------------------------ */
/* WEAR PALETTE                                                        */
/* ------------------------------------------------------------------ */

/** Salvage-yard colors layered on top of the clean PALETTE. */
export const WEAR_PALETTE = {
  /** Oxidised rust — bolt bleed, seam corrosion, raw patch plates. */
  rust: 0x7a4326,
  /** Brighter fresh-scrape orange rust for streak highlights. */
  rustLight: 0x9c5b31,
  /** Red-oxide primer — the classic unpainted replacement panel. */
  primer: 0x6e3a30,
  /** Bare scratched steel where paint has chipped away entirely. */
  bareSteel: 0x9aa0a6,
  /** Dusty olive-drab — faded military paint for mismatched panels. */
  fadedOlive: 0x555a48,
  /** Soot / scorch black. */
  soot: 0x0d0e10,
  /** Grubby cable-run rubber. */
  cable: 0x1f2124,
} as const

/* ------------------------------------------------------------------ */
/* CANVAS TEXTURES (lazy, cached, DOM-guarded)                         */
/* ------------------------------------------------------------------ */

const textureCache = new Map<string, THREE.Texture | null>()

function cachedTexture(key: string, make: (ctx: CanvasRenderingContext2D, size: number) => void, opts: { srgb?: boolean; size?: number } = {}): THREE.Texture | null {
  if (textureCache.has(key)) return textureCache.get(key) ?? null
  if (typeof document === 'undefined') {
    textureCache.set(key, null)
    return null
  }
  const size = opts.size ?? 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    textureCache.set(key, null)
    return null
  }
  make(ctx, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  if (opts.srgb) tex.colorSpace = THREE.SRGBColorSpace
  textureCache.set(key, tex)
  return tex
}

/**
 * Grime color map: neutral light base (multiplies with material color) with
 * darker grease blotches, faint pale paint-chip flecks and a whisper of
 * rust-tinted streaking. Deliberately low-contrast — it has to survive being
 * multiplied onto already-dark charcoal armor without turning to mud.
 */
function grimeMap(): THREE.Texture | null {
  return cachedTexture('grimeMap', (ctx, size) => {
    const rand = seededRand(1201)
    ctx.fillStyle = '#b8b6b2'
    ctx.fillRect(0, 0, size, size)
    // Grease/dirt blotches.
    for (let i = 0; i < 90; i++) {
      const x = rand() * size
      const y = rand() * size
      const r = 4 + rand() * 26
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      const a = 0.05 + rand() * 0.13
      g.addColorStop(0, `rgba(52, 50, 46, ${a})`)
      g.addColorStop(1, 'rgba(52, 50, 46, 0)')
      ctx.fillStyle = g
      ctx.fillRect(x - r, y - r, r * 2, r * 2)
    }
    // Vertical dirt streaking (gravity-pulled grime).
    for (let i = 0; i < 26; i++) {
      const x = rand() * size
      const y = rand() * size * 0.7
      const len = 20 + rand() * 70
      const w = 1 + rand() * 3
      const g = ctx.createLinearGradient(x, y, x, y + len)
      g.addColorStop(0, `rgba(60, 56, 50, ${0.10 + rand() * 0.12})`)
      g.addColorStop(1, 'rgba(60, 56, 50, 0)')
      ctx.fillStyle = g
      ctx.fillRect(x - w / 2, y, w, len)
    }
    // Rust-tinted seep marks, sparser.
    for (let i = 0; i < 12; i++) {
      const x = rand() * size
      const y = rand() * size * 0.8
      const len = 14 + rand() * 46
      const g = ctx.createLinearGradient(x, y, x, y + len)
      g.addColorStop(0, `rgba(150, 92, 50, ${0.10 + rand() * 0.14})`)
      g.addColorStop(1, 'rgba(150, 92, 50, 0)')
      ctx.fillStyle = g
      ctx.fillRect(x - 1.5, y, 3, len)
    }
    // Pale chips/nicks where paint has flaked to primer.
    for (let i = 0; i < 60; i++) {
      const x = rand() * size
      const y = rand() * size
      ctx.fillStyle = `rgba(214, 210, 200, ${0.08 + rand() * 0.16})`
      ctx.fillRect(x, y, 1 + rand() * 3, 1 + rand() * 2)
    }
  }, { srgb: true })
}

/**
 * Roughness map paired with the grime map: mostly rough (light) with darker
 * (smoother) worn-shiny patches where paint has been rubbed to metal.
 */
function grimeRoughnessMap(): THREE.Texture | null {
  return cachedTexture('grimeRough', (ctx, size) => {
    const rand = seededRand(4407)
    ctx.fillStyle = '#c9c9c9'
    ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < 40; i++) {
      const x = rand() * size
      const y = rand() * size
      const r = 6 + rand() * 30
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(90, 90, 90, ${0.25 + rand() * 0.3})`)
      g.addColorStop(1, 'rgba(90, 90, 90, 0)')
      ctx.fillStyle = g
      ctx.fillRect(x - r, y - r, r * 2, r * 2)
    }
    for (let i = 0; i < 120; i++) {
      ctx.fillStyle = `rgba(230, 230, 230, ${0.2 + rand() * 0.3})`
      ctx.fillRect(rand() * size, rand() * size, 1 + rand() * 4, 1)
    }
  })
}

/** Mottled rust color map for rustMat / patch plates. */
function rustMap(): THREE.Texture | null {
  return cachedTexture('rustMap', (ctx, size) => {
    const rand = seededRand(9631)
    ctx.fillStyle = '#a8886d'
    ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < 220; i++) {
      const x = rand() * size
      const y = rand() * size
      const r = 2 + rand() * 16
      const dark = rand() < 0.55
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      const c = dark ? '92, 62, 38' : '196, 148, 96'
      g.addColorStop(0, `rgba(${c}, ${0.16 + rand() * 0.3})`)
      g.addColorStop(1, `rgba(${c}, 0)`)
      ctx.fillStyle = g
      ctx.fillRect(x - r, y - r, r * 2, r * 2)
    }
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = `rgba(58, 38, 24, ${0.2 + rand() * 0.35})`
      ctx.fillRect(rand() * size, rand() * size, 1 + rand() * 3, 1 + rand() * 3)
    }
  }, { srgb: true })
}

/** Vertical drip/streak alpha texture for rustStreak decals (white = opaque). */
function streakAlphaMap(): THREE.Texture | null {
  return cachedTexture('streakAlpha', (ctx, size) => {
    const rand = seededRand(7717)
    ctx.clearRect(0, 0, size, size)
    for (let i = 0; i < 14; i++) {
      const x = size * (0.08 + rand() * 0.84)
      const w = 2 + rand() * 7
      const len = size * (0.35 + rand() * 0.6)
      const g = ctx.createLinearGradient(0, 0, 0, len)
      g.addColorStop(0, `rgba(255,255,255,${0.5 + rand() * 0.5})`)
      g.addColorStop(0.15, `rgba(255,255,255,${0.35 + rand() * 0.3})`)
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g
      ctx.save()
      ctx.translate(x, 0)
      ctx.fillRect(-w / 2, 0, w, len)
      ctx.restore()
    }
  })
}

/** Soft irregular blotch alpha texture for scorchDecal. */
function scorchAlphaMap(): THREE.Texture | null {
  return cachedTexture('scorchAlpha', (ctx, size) => {
    const rand = seededRand(3391)
    ctx.clearRect(0, 0, size, size)
    const cx = size / 2
    const cy = size / 2
    for (let i = 0; i < 40; i++) {
      const ang = rand() * Math.PI * 2
      const dist = rand() * size * 0.28
      const x = cx + Math.cos(ang) * dist
      const y = cy + Math.sin(ang) * dist
      const r = size * (0.06 + rand() * 0.16)
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(255,255,255,${0.25 + rand() * 0.4})`)
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(x - r, y - r, r * 2, r * 2)
    }
  })
}

/* ------------------------------------------------------------------ */
/* WORN MATERIAL FACTORIES                                             */
/* ------------------------------------------------------------------ */

const wornMaterialCache = new Map<string, THREE.MeshStandardMaterial>()

function cachedWornMaterial(key: string, make: () => THREE.MeshStandardMaterial): THREE.MeshStandardMaterial {
  let mat = wornMaterialCache.get(key)
  if (!mat) {
    mat = make()
    wornMaterialCache.set(key, mat)
  }
  return mat
}

/** Assign a texture map only when it exists (node test envs have no DOM, and
 *  three warns on constructor params explicitly set to undefined). */
function withMaps(
  mat: THREE.MeshStandardMaterial,
  maps: { map?: THREE.Texture | null; roughnessMap?: THREE.Texture | null; alphaMap?: THREE.Texture | null }
): THREE.MeshStandardMaterial {
  if (maps.map) mat.map = maps.map
  if (maps.roughnessMap) mat.roughnessMap = maps.roughnessMap
  if (maps.alphaMap) mat.alphaMap = maps.alphaMap
  return mat
}

/** Mottled rust for corroded fittings and the worst patch plates. */
export function rustMat(): THREE.MeshStandardMaterial {
  return cachedWornMaterial('rust', () => withMaps(new THREE.MeshStandardMaterial({
    color: WEAR_PALETTE.rust,
    metalness: 0.25,
    roughness: 0.95,
  }), { map: rustMap() }))
}

/** Red-oxide primer — unpainted replacement panel straight from the scrapper. */
export function primerMat(): THREE.MeshStandardMaterial {
  return cachedWornMaterial('primer', () => withMaps(new THREE.MeshStandardMaterial({
    color: WEAR_PALETTE.primer,
    metalness: 0.2,
    roughness: 0.85,
  }), { map: grimeMap() }))
}

/** Bare scuffed steel — paint gone entirely, dull scratched metal. */
export function bareSteelMat(): THREE.MeshStandardMaterial {
  return cachedWornMaterial('bareSteel', () => withMaps(new THREE.MeshStandardMaterial({
    color: WEAR_PALETTE.bareSteel,
    metalness: 0.75,
    roughness: 0.6,
  }), { map: grimeMap(), roughnessMap: grimeRoughnessMap() }))
}

/** Faded olive-drab — a mismatched panel scavenged off some other chassis. */
export function fadedOliveMat(): THREE.MeshStandardMaterial {
  return cachedWornMaterial('fadedOlive', () => withMaps(new THREE.MeshStandardMaterial({
    color: WEAR_PALETTE.fadedOlive,
    metalness: 0.35,
    roughness: 0.8,
  }), { map: grimeMap() }))
}

/** Sooty scorched metal for burn boxes / exhaust-adjacent plating. */
export function sootMat(): THREE.MeshStandardMaterial {
  return cachedWornMaterial('soot', () => new THREE.MeshStandardMaterial({
    color: WEAR_PALETTE.soot,
    metalness: 0.3,
    roughness: 1.0,
  }))
}

/** Grubby rubber/plastic for cable runs and hoses. */
export function cableMat(): THREE.MeshStandardMaterial {
  return cachedWornMaterial('cable', () => new THREE.MeshStandardMaterial({
    color: WEAR_PALETTE.cable,
    metalness: 0.1,
    roughness: 0.9,
  }))
}

/* ------------------------------------------------------------------ */
/* MATERIAL WEAR PASS                                                  */
/* ------------------------------------------------------------------ */

/** Worn counterpart per source material — keyed by reference so every mesh
 *  sharing a clean material also shares its worn swap (keeps bake batching). */
const wornSwapCache = new Map<THREE.Material, THREE.MeshStandardMaterial>()

const hslScratch = { h: 0, s: 0, l: 0 }

function wornCounterpart(source: THREE.MeshStandardMaterial): THREE.MeshStandardMaterial {
  let worn = wornSwapCache.get(source)
  if (!worn) {
    worn = source.clone()
    // Fade the paint: pull saturation down, lift very dark charcoal slightly so
    // the grime map has some value range to bite into.
    worn.color.getHSL(hslScratch)
    const s = hslScratch.s * 0.55
    const l = hslScratch.l < 0.2 ? hslScratch.l * 1.35 + 0.03 : hslScratch.l * 0.92
    worn.color.setHSL(hslScratch.h, s, Math.min(l, 0.85))
    worn.metalness = Math.max(0, source.metalness - 0.25)
    worn.roughness = Math.min(1, source.roughness + 0.3)
    // Chipped paint kills the showroom emissive tint on accents/trim.
    worn.emissiveIntensity = Math.min(source.emissiveIntensity, 0.03)
    const map = grimeMap()
    if (map) worn.map = map
    const rough = grimeRoughnessMap()
    if (rough) worn.roughnessMap = rough
    worn.needsUpdate = true
    wornSwapCache.set(source, worn)
  }
  return worn
}

/**
 * Swap every clean opaque MeshStandardMaterial under `root` for its cached
 * worn counterpart. Call INSIDE the part builder (before bakedParts caching).
 * Glowing sensor/energy materials (strong emissive) and transparent materials
 * (decals, glass) are left alone; pass `opts.skip` to exempt more.
 *
 * Safe by construction: never mutates the source material, and materials
 * produced by this module (already worn) are skipped, so double application
 * is a no-op.
 */
export function applyWear(
  root: THREE.Object3D,
  opts: { skip?: (mat: THREE.MeshStandardMaterial, mesh: THREE.Mesh) => boolean } = {}
): void {
  const wornOutputs = new Set<THREE.Material>(
    [...wornMaterialCache.values(), ...wornSwapCache.values()]
  )
  root.traverse((node: THREE.Object3D) => {
    if (!(node instanceof THREE.Mesh)) return
    const mat = node.material
    if (!(mat instanceof THREE.MeshStandardMaterial)) return
    // Skip actual glow materials (colored emissive at meaningful intensity) and
    // transparent decals. NOTE: three defaults emissiveIntensity to 1.0 with a
    // BLACK emissive, so intensity alone says nothing — check the color too.
    if (mat.transparent || (mat.emissiveIntensity > 0.3 && mat.emissive.getHex() !== 0)) return
    if (wornOutputs.has(mat)) return
    if (opts.skip?.(mat, node)) return
    node.material = wornCounterpart(mat)
  })
}

/* ------------------------------------------------------------------ */
/* SALVAGE GREEBLES                                                    */
/* ------------------------------------------------------------------ */

/**
 * Nudge an object off its perfectly-machined transform — the core fix for
 * parts reading as "all one piece". Small position drift + rotation skew makes
 * plates sit like they were re-bolted by hand in a field workshop.
 *
 * @param obj    object to disturb (mutated in place, relative to current pose)
 * @param rand   seeded PRNG (see seededRand) so the bake is reproducible
 * @param posAmt max positional drift per axis (default 0.02)
 * @param rotAmt max rotation skew per axis in radians (default 0.05)
 */
export function jitter(obj: THREE.Object3D, rand: () => number, posAmt = 0.02, rotAmt = 0.05): void {
  obj.position.x += (rand() - 0.5) * 2 * posAmt
  obj.position.y += (rand() - 0.5) * 2 * posAmt
  obj.position.z += (rand() - 0.5) * 2 * posAmt
  obj.rotation.x += (rand() - 0.5) * 2 * rotAmt
  obj.rotation.y += (rand() - 0.5) * 2 * rotAmt
  obj.rotation.z += (rand() - 0.5) * 2 * rotAmt
}

/**
 * A mismatched replacement armor plate: flat slab in primer / bare steel /
 * olive with crude corner bolts and a weld bead along one edge. Slap it over
 * (proud of) existing armor, slightly rotated, to sell "patched in the field".
 * Centered on origin, facing +Z.
 *
 * @param w    plate width (X)
 * @param h    plate height (Y)
 * @param opts.mat   plate material (default primerMat())
 * @param opts.d     plate thickness (default 0.035)
 * @param opts.weld  add a weld bead along the top edge (default true)
 */
export function patchPlate(
  w: number,
  h: number,
  opts: { mat?: THREE.Material; d?: number; weld?: boolean } = {}
): THREE.Group {
  const { mat = primerMat(), d = 0.035, weld = true } = opts
  const group = new THREE.Group()

  const plate = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  group.add(plate)

  // Crude oversized corner bolts in bare steel.
  const boltMat = bareSteelMat()
  const br = Math.min(w, h) * 0.09
  const boltGeom = new THREE.CylinderGeometry(br, br * 0.85, d * 0.9, 6)
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const b = new THREE.Mesh(boltGeom, boltMat)
      b.rotation.x = Math.PI / 2
      b.position.set(sx * (w / 2 - br * 1.6), sy * (h / 2 - br * 1.6), d / 2)
      group.add(b)
    }
  }

  if (weld) {
    const bead = weldSeam(w * 0.92)
    bead.position.set(0, h / 2 - 0.005, d / 2 - 0.005)
    group.add(bead)
  }

  return group
}

/**
 * A lumpy weld bead running along +X — a row of overlapping little spheres in
 * dull rusty steel. Centered on origin.
 *
 * @param length bead length along X
 * @param opts.radius lump radius (default 0.018)
 */
export function weldSeam(length: number, opts: { radius?: number } = {}): THREE.Group {
  const r = opts.radius ?? 0.018
  const group = new THREE.Group()
  const geom = new THREE.SphereGeometry(r, 5, 4)
  const mat = rustMat()
  const n = Math.max(3, Math.round(length / (r * 1.3)))
  const rand = seededRand(Math.round(length * 1000) + 17)
  for (let i = 0; i < n; i++) {
    const lump = new THREE.Mesh(geom, mat)
    lump.position.set(
      -length / 2 + (i / (n - 1)) * length,
      (rand() - 0.5) * r * 0.5,
      (rand() - 0.5) * r * 0.4
    )
    const s = 0.8 + rand() * 0.5
    lump.scale.set(s, s * 0.75, s * 0.75)
    group.add(lump)
  }
  return group
}

/**
 * A sagging cable run between two points in the part's local space — exposed
 * wiring where a conduit cover has gone missing. TubeGeometry over a quadratic
 * bezier whose control point droops below the midpoint.
 *
 * @param from      start point
 * @param to        end point
 * @param opts.sag     how far the midpoint droops (default 30% of span)
 * @param opts.radius  cable radius (default 0.022)
 * @param opts.mat     material (default cableMat())
 */
export function hangingCable(
  from: THREE.Vector3,
  to: THREE.Vector3,
  opts: { sag?: number; radius?: number; mat?: THREE.Material } = {}
): THREE.Mesh {
  const span = from.distanceTo(to)
  const { sag = span * 0.3, radius = 0.022, mat = cableMat() } = opts
  const mid = from.clone().lerp(to, 0.5)
  mid.y -= sag
  const curve = new THREE.QuadraticBezierCurve3(from.clone(), mid, to.clone())
  const geom = new THREE.TubeGeometry(curve, 8, radius, 5, false)
  return new THREE.Mesh(geom, mat)
}

/** Shared transparent decal materials (one each, so decals batch together). */
function decalMaterial(key: 'rustStreak' | 'scorch'): THREE.MeshStandardMaterial {
  return cachedWornMaterial(`decal:${key}`, () => {
    const alpha = key === 'rustStreak' ? streakAlphaMap() : scorchAlphaMap()
    return withMaps(new THREE.MeshStandardMaterial({
      color: key === 'rustStreak' ? WEAR_PALETTE.rustLight : WEAR_PALETTE.soot,
      metalness: 0.1,
      roughness: 1.0,
      transparent: true,
      opacity: alpha ? 0.85 : 0, // no DOM -> invisible rather than a solid quad
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    }), { alphaMap: alpha })
  })
}

/**
 * A rust-drip decal quad (transparent plane, streaks running down -Y).
 * Place flat against a panel face, offset ~0.005 off the surface, facing +Z.
 * Classic spots: under bolt rows, panel bottom edges, joint seams.
 */
export function rustStreak(w: number, h: number): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), decalMaterial('rustStreak'))
  return mesh
}

/**
 * A soft scorch-mark decal quad (transparent plane). Place flat against a
 * panel ~0.005 off the surface, facing +Z — muzzle soot, exhaust burn, an old
 * hit that never got buffed out.
 */
export function scorchDecal(size: number): THREE.Mesh {
  return new THREE.Mesh(new THREE.PlaneGeometry(size, size), decalMaterial('scorch'))
}

/**
 * A "missing panel" cavity: recessed near-black box with exposed frame ribs
 * and a hint of internal cabling. Sink it INTO an armor surface (its front
 * face flush with, or a touch below, the surrounding plate) so the armor reads
 * as an opened shell with guts, not a solid sculpted block.
 *
 * Centered on origin, opening faces +Z, `d` deep.
 *
 * @param w    opening width (X)
 * @param h    opening height (Y)
 * @param d    cavity depth (Z) (default 0.12)
 * @param opts.ribs      number of vertical frame ribs (default 3)
 * @param opts.cable     include a sagging internal cable (default true)
 * @param opts.seed      scatter seed (default 1)
 */
export function exposedRibs(
  w: number,
  h: number,
  d = 0.12,
  opts: { ribs?: number; cable?: boolean; seed?: number } = {}
): THREE.Group {
  const { ribs = 3, cable = true, seed = 1 } = opts
  const rand = seededRand(seed)
  const group = new THREE.Group()

  // Dark cavity backing.
  const back = new THREE.Mesh(new THREE.BoxGeometry(w, h, d * 0.4), ventMat())
  back.position.z = -d * 0.7
  group.add(back)

  // Exposed structural ribs in steel.
  const ribGeom = new THREE.BoxGeometry(Math.min(0.05, w * 0.14), h * 0.94, d * 0.5)
  const ribMat = frameMat(PALETTE.frameSteel)
  for (let i = 0; i < ribs; i++) {
    const rib = new THREE.Mesh(ribGeom, ribMat)
    rib.position.set(-w / 2 + ((i + 0.75) / (ribs + 0.5)) * w, 0, -d * 0.35)
    rib.rotation.z = (rand() - 0.5) * 0.06
    group.add(rib)
  }

  // Torn edge lip: thin bare-steel strips framing the opening, slightly askew.
  const lipMat = bareSteelMat()
  const lipTop = new THREE.Mesh(new THREE.BoxGeometry(w * 1.04, 0.03, 0.03), lipMat)
  lipTop.position.set(0, h / 2, -0.005)
  lipTop.rotation.z = (rand() - 0.5) * 0.05
  group.add(lipTop)
  const lipBottom = new THREE.Mesh(new THREE.BoxGeometry(w * 1.04, 0.03, 0.03), lipMat)
  lipBottom.position.set(0, -h / 2, -0.005)
  lipBottom.rotation.z = (rand() - 0.5) * 0.05
  group.add(lipBottom)

  if (cable) {
    const c = hangingCable(
      new THREE.Vector3(-w * 0.38, h * 0.3, -d * 0.3),
      new THREE.Vector3(w * 0.38, h * 0.18, -d * 0.3),
      { sag: h * 0.4, radius: Math.min(0.02, h * 0.08) }
    )
    group.add(c)
  }

  return group
}
