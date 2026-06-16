/**
 * Shared procedural-detailing toolkit for the mech part files.
 *
 * Goal: push every procedurally-generated mech toward one coherent
 * "Gundam / real-robot" art bible (charcoal armor, steel frame, red accents,
 * thin gold piping, glowing amber sensors) without each part file
 * re-implementing the same geometry tricks.
 *
 * Everything here is PURE (no async, no external assets), uses only three.js
 * primitives, and is cheap (a few dozen verts per helper at most). Helpers
 * return either a BufferGeometry (so the caller controls material/position) or
 * a fully-built Mesh/Group when the detail is self-contained.
 *
 * Coordinate convention: helpers build around their own local origin (centered
 * unless noted). Callers position them in the part's local space, exactly like
 * the existing `new THREE.Mesh(geom, mat); mesh.position.set(...)` pattern.
 */

import * as THREE from 'three'
import { createEnergyMaterial } from './materials'

/* ------------------------------------------------------------------ */
/* PALETTE                                                             */
/* ------------------------------------------------------------------ */

/**
 * The canonical art-bible palette. Use these constants instead of raw hex so
 * the whole roster stays on-model. All values are 0xRRGGBB numbers (three.js).
 */
export const PALETTE = {
  /** Dominant armor plate: dark charcoal / gunmetal (matte-ish). */
  armorDark: 0x2b2e33,
  /** Slightly lighter charcoal for layered/overlapping armor tiers. */
  armorMid: 0x3a3f47,
  /** Inner frame / joints / pistons: steel grey, more metallic. */
  frameSteel: 0x6f757e,
  /** Brightest steel for exposed pistons / polished mechanicals. */
  frameSteelLight: 0x828892,
  /** RED accents: chest vent, knee guards, shin/foot slashes, intake slats. */
  accentRed: 0xc2362f,
  /** GOLD/YELLOW trim: thin edge piping along plate borders, panel highlights. */
  trimGold: 0xd8a32b,
  /** Glowing AMBER: twin eyes, thin sensor strips (emissive). */
  glowAmber: 0xffc234,
  /** Near-black for deep vent cavities / recessed slats. */
  ventBlack: 0x14161a,
} as const

/** Type for any palette color key. */
export type PaletteColor = (typeof PALETTE)[keyof typeof PALETTE]

/* ------------------------------------------------------------------ */
/* MATERIAL FACTORIES                                                  */
/* ------------------------------------------------------------------ */
/* Factories return fresh materials so callers can tweak per-instance     */
/* (e.g. emissiveIntensity) without mutating a shared singleton. They are  */
/* cheap; reuse the returned material across meshes within one part.       */

/**
 * Dominant charcoal armor plate material (matte-ish gunmetal).
 * @param color override armor color (default PALETTE.armorDark)
 */
export function armorMat(color: number = PALETTE.armorDark): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, metalness: 0.65, roughness: 0.52 })
}

/**
 * Inner-frame / joint / piston material (lighter, more metallic steel).
 * @param color override steel color (default PALETTE.frameSteel)
 */
export function frameMat(color: number = PALETTE.frameSteel): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, metalness: 0.88, roughness: 0.3 })
}

/**
 * Red accent material (chest vents, knee guards, intake slats, shin slashes).
 * Faint emissive so red reads even in shadow.
 */
export function accentRedMat(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: PALETTE.accentRed,
    metalness: 0.4,
    roughness: 0.45,
    emissive: PALETTE.accentRed,
    emissiveIntensity: 0.12,
  })
}

/**
 * Gold trim material for thin edge piping and panel highlights.
 * Metallic and slightly emissive so the thin lines catch light.
 */
export function trimGoldMat(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: PALETTE.trimGold,
    metalness: 0.9,
    roughness: 0.25,
    emissive: PALETTE.trimGold,
    emissiveIntensity: 0.08,
  })
}

/**
 * Glowing amber eye / sensor-strip material. Thin wrapper over the shared
 * `createEnergyMaterial` keyed to the art-bible amber so all sensors match.
 * @param color override glow color (default PALETTE.glowAmber)
 */
export function glowEyeMat(color: number = PALETTE.glowAmber): THREE.MeshStandardMaterial {
  return createEnergyMaterial(color)
}

/** Deep matte material for vent cavities / recessed slats. */
export function ventMat(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: PALETTE.ventBlack, metalness: 0.5, roughness: 0.8 })
}

/* ------------------------------------------------------------------ */
/* GEOMETRY HELPERS                                                    */
/* ------------------------------------------------------------------ */

/**
 * A box with chamfered (beveled) edges, centered on its local origin.
 *
 * Built by extruding a rounded-corner rectangle (the W x H face) through depth
 * D, with an even bevel on the front/back faces. Reads as a crisp armor plate
 * rather than a plain cube. Cheap: low-segment bevel.
 *
 * @param w     width  (X)
 * @param h     height (Y)
 * @param d     depth  (Z)
 * @param bevel chamfer size in world units (default min(w,h,d) * 0.12).
 *              Clamped so it never exceeds ~45% of the smallest dimension.
 * @returns a centered BufferGeometry
 */
export function chamferBox(w: number, h: number, d: number, bevel?: number): THREE.BufferGeometry {
  const b = Math.min(bevel ?? Math.min(w, h, d) * 0.12, Math.min(w, h, d) * 0.45)
  const safeB = Math.max(b, 1e-4)

  // 2D rounded rect in the X/Y plane, centered, inset by the bevel so the final
  // outer dimensions are exactly w x h.
  const hw = w / 2 - safeB
  const hh = h / 2 - safeB
  const shape = new THREE.Shape()
  shape.moveTo(-hw, -hh - safeB)
  shape.lineTo(hw, -hh - safeB)
  shape.quadraticCurveTo(hw + safeB, -hh - safeB, hw + safeB, -hh)
  shape.lineTo(hw + safeB, hh)
  shape.quadraticCurveTo(hw + safeB, hh + safeB, hw, hh + safeB)
  shape.lineTo(-hw, hh + safeB)
  shape.quadraticCurveTo(-hw - safeB, hh + safeB, -hw - safeB, hh)
  shape.lineTo(-hw - safeB, -hh)
  shape.quadraticCurveTo(-hw - safeB, -hh - safeB, -hw, -hh - safeB)

  const depth = Math.max(d - 2 * safeB, 1e-4)
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: safeB,
    bevelSize: safeB,
    bevelSegments: 1,
    curveSegments: 1,
  })
  // ExtrudeGeometry extrudes +Z from z=0; recenter on origin.
  geom.translate(0, 0, -depth / 2 - safeB)
  geom.computeVertexNormals()
  return geom
}

/**
 * A layered armor "panel plate": a chamfered base plate with a smaller raised
 * plate stacked on its front face, optionally edged with a thin gold trim
 * outline. Produces the overlapping-tier silhouette of the reference.
 *
 * Built centered on origin; front face is +Z. Add to your group and position.
 *
 * @param w        plate width (X)
 * @param h        plate height (Y)
 * @param d        base plate depth/thickness (Z)
 * @param opts.baseMat   base plate material (default armorMat())
 * @param opts.topMat    raised plate material (default armorMat(PALETTE.armorMid))
 * @param opts.bevel     chamfer for both plates
 * @param opts.inset     how much smaller the raised plate is per side (default 0.12)
 * @param opts.raise     how far the raised plate sits proud of the base (default 0.06)
 * @param opts.trim      add a gold edge outline around the raised plate (default false)
 */
export function panelPlate(
  w: number,
  h: number,
  d: number,
  opts: {
    baseMat?: THREE.Material
    topMat?: THREE.Material
    bevel?: number
    inset?: number
    raise?: number
    trim?: boolean
  } = {}
): THREE.Group {
  const {
    baseMat = armorMat(),
    topMat = armorMat(PALETTE.armorMid),
    bevel,
    inset = 0.12,
    raise = 0.06,
    trim = false,
  } = opts

  const group = new THREE.Group()

  const base = new THREE.Mesh(chamferBox(w, h, d, bevel), baseMat)
  group.add(base)

  const tw = Math.max(w - inset * 2, w * 0.2)
  const th = Math.max(h - inset * 2, h * 0.2)
  const td = Math.max(d * 0.6, 0.04)
  const top = new THREE.Mesh(chamferBox(tw, th, td, bevel), topMat)
  top.position.z = d / 2 - td / 2 + raise // sit proud of base front face
  group.add(top)

  if (trim) {
    const t = trimStripe(tw + 0.02, th + 0.02, { thickness: 0.018 })
    t.position.z = top.position.z + td / 2 + 0.001
    group.add(t)
  }

  return group
}

/* ------------------------------------------------------------------ */
/* TRIM / EDGE LINES                                                   */
/* ------------------------------------------------------------------ */

/**
 * A thin rectangular edge outline ("piping") lying in the local X/Y plane,
 * facing +Z. Four slim bars forming a frame — use for the gold plate borders.
 *
 * @param w           outer width of the frame (X)
 * @param h           outer height of the frame (Y)
 * @param opts.thickness bar thickness (default 0.02)
 * @param opts.depth     bar depth in Z (default 0.02)
 * @param opts.mat       material (default trimGoldMat())
 * @returns a Group of 4 thin bars, centered on origin
 */
export function trimStripe(
  w: number,
  h: number,
  opts: { thickness?: number; depth?: number; mat?: THREE.Material } = {}
): THREE.Group {
  const { thickness = 0.02, depth = 0.02, mat = trimGoldMat() } = opts
  const group = new THREE.Group()

  const horiz = new THREE.BoxGeometry(w, thickness, depth)
  const vert = new THREE.BoxGeometry(thickness, h - thickness * 2, depth)

  const top = new THREE.Mesh(horiz, mat)
  top.position.y = h / 2 - thickness / 2
  const bottom = new THREE.Mesh(horiz, mat)
  bottom.position.y = -h / 2 + thickness / 2
  const left = new THREE.Mesh(vert, mat)
  left.position.x = -w / 2 + thickness / 2
  const right = new THREE.Mesh(vert, mat)
  right.position.x = w / 2 - thickness / 2

  group.add(top, bottom, left, right)
  return group
}

/**
 * A single thin straight trim line (one length of gold piping). Centered on
 * origin, running along +X by default.
 *
 * @param length      line length along X
 * @param opts.thickness cross-section thickness (default 0.02)
 * @param opts.mat       material (default trimGoldMat())
 * @returns a Mesh
 */
export function edgeLine(
  length: number,
  opts: { thickness?: number; mat?: THREE.Material } = {}
): THREE.Mesh {
  const { thickness = 0.02, mat = trimGoldMat() } = opts
  return new THREE.Mesh(new THREE.BoxGeometry(length, thickness, thickness), mat)
}

/* ------------------------------------------------------------------ */
/* VENTS & GREEBLES                                                    */
/* ------------------------------------------------------------------ */

/**
 * A row of parallel vent slats inside a recessed dark frame — the red intake
 * slats / cheek ducts / cooling grilles of the reference.
 *
 * Slats are stacked along Y by default and inset slightly so they read as
 * recessed louvers. Whole assembly is centered on origin, facing +Z.
 *
 * @param count          number of slats
 * @param w              overall width (X) of the vent
 * @param h              overall height (Y) of the vent
 * @param opts.depth     slat depth (Z) (default 0.04)
 * @param opts.slatMat   slat material (default accentRedMat() for red intakes)
 * @param opts.frameMat  recessed backing material (default ventMat())
 * @param opts.horizontal stack slats along X instead of Y (default false)
 * @returns a Group
 */
export function ventSlats(
  count: number,
  w: number,
  h: number,
  opts: {
    depth?: number
    slatMat?: THREE.Material
    frameMat?: THREE.Material
    horizontal?: boolean
  } = {}
): THREE.Group {
  const n = Math.max(1, Math.floor(count))
  const {
    depth = 0.04,
    slatMat = accentRedMat(),
    frameMat: backing = ventMat(),
    horizontal = false,
  } = opts

  const group = new THREE.Group()

  // Recessed dark backing.
  const back = new THREE.Mesh(new THREE.BoxGeometry(w, h, depth * 0.5), backing)
  back.position.z = -depth * 0.4
  group.add(back)

  const span = horizontal ? w : h
  const gap = span / (n + 0.5)
  const slatLong = horizontal ? h * 0.92 : w * 0.92
  const slatThin = gap * 0.55
  const slatGeom = horizontal
    ? new THREE.BoxGeometry(slatThin, slatLong, depth)
    : new THREE.BoxGeometry(slatLong, slatThin, depth)

  for (let i = 0; i < n; i++) {
    const slat = new THREE.Mesh(slatGeom, slatMat)
    const off = -span / 2 + gap * (i + 0.75)
    if (horizontal) slat.position.x = off
    else slat.position.y = off
    group.add(slat)
  }

  return group
}

/**
 * A single bolt / rivet head — a short, slightly tapered metallic cylinder.
 * Centered on origin with its flat face toward +Z (rotated so it reads as a
 * disc on a panel surface).
 *
 * @param radius     bolt radius (default 0.03)
 * @param opts.depth head depth (default radius * 0.6)
 * @param opts.mat   material (default frameMat(PALETTE.frameSteelLight))
 * @returns a Mesh
 */
export function bolt(
  radius: number = 0.03,
  opts: { depth?: number; mat?: THREE.Material } = {}
): THREE.Mesh {
  const { depth = radius * 0.6, mat = frameMat(PALETTE.frameSteelLight) } = opts
  const geom = new THREE.CylinderGeometry(radius, radius * 0.85, depth, 6)
  const mesh = new THREE.Mesh(geom, mat)
  mesh.rotation.x = Math.PI / 2 // flat face -> +Z
  return mesh
}

/**
 * Scatter a line/grid of rivets along a panel edge. Convenience over `bolt`.
 *
 * @param count       number of rivets
 * @param spacing     center-to-center spacing along X
 * @param opts.radius bolt radius (default 0.025)
 * @param opts.mat    material (passed to bolt)
 * @returns a Group of rivets centered on origin, running along X, facing +Z
 */
export function riveting(
  count: number,
  spacing: number,
  opts: { radius?: number; mat?: THREE.Material } = {}
): THREE.Group {
  const n = Math.max(1, Math.floor(count))
  const group = new THREE.Group()
  const total = (n - 1) * spacing
  for (let i = 0; i < n; i++) {
    const r = bolt(opts.radius ?? 0.025, { mat: opts.mat })
    r.position.x = -total / 2 + i * spacing
    group.add(r)
  }
  return group
}
