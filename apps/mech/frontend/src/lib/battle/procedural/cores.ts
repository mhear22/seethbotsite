/**
 * Procedural Core Part Models
 * Max dimensions: ~2.4 x 2.0 x 1.8 units (pauldrons reach toward the arm
 * sockets at core-local x=±1.3, y≈1.0; head clearance to local y≈2.0).
 * Origin at bottom (where legs connect); the silhouette rises to ~y 2.0.
 *
 * Built to the shared "Gundam / real-robot" art bible via ./detailing:
 *   - tiered, sloped, chamfered chest plates with a central red vent,
 *   - a raised collar / neck guard with exposed steel neck,
 *   - a layered, narrowing abdomen and an armoured waist with hip flares,
 *   - prominent multi-tiered, angular shoulder pauldrons (the centerpiece).
 * Charcoal dominates; steel reads only on neck / joints / exhausts; gold is
 * thin edge piping; red is sparse punctuation; sensors glow amber.
 *
 * Local convention matches MechModelLoader: core attaches at world y=2.8, so
 * the arm sockets (world y=3.8, x=±1.3) live at core-local y≈1.0, x≈1.3 — the
 * pauldrons cap over those joints without floating or clipping the head.
 */

import * as THREE from 'three'
import { MATERIALS, createEnergyMaterial } from './materials'
import {
  PALETTE,
  armorMat,
  frameMat,
  accentRedMat,
  trimGoldMat,
  glowEyeMat,
  chamferBox,
  panelPlate,
  trimStripe,
  edgeLine,
  ventSlats,
  riveting,
  bolt,
} from './detailing'

/* ------------------------------------------------------------------ */
/* Shared core silhouette builder                                      */
/* ------------------------------------------------------------------ */

interface CoreOpts {
  /** Dominant armor material for the big plates. */
  armor: THREE.MeshStandardMaterial
  /** Slightly lighter tier material for raised / overlapping plates. */
  armorTier: THREE.MeshStandardMaterial
  /** Steel for neck / joints / exposed mechanicals. */
  steel: THREE.MeshStandardMaterial
  /** Glow color for the central reactor / sensors. */
  glow: number
}

/**
 * Builds the shared core skeleton: inner frame, sloped/tapered torso shell,
 * tiered overlapping chest plates, a raised collar with exposed steel neck, a
 * narrowing layered abdomen, an armoured waist with hip flares, a panelled
 * back, and prominent multi-tiered angular shoulder pauldrons.
 *
 * Returns the group plus the shared materials so each generator can drop in its
 * own signature chest detail (red vent vs. fusion core vs. turbine vs. caps).
 */
function buildCoreBase(opts: CoreOpts): {
  group: THREE.Group
  armor: THREE.MeshStandardMaterial
  armorTier: THREE.MeshStandardMaterial
  steel: THREE.MeshStandardMaterial
  trimMat: THREE.MeshStandardMaterial
  redMat: THREE.MeshStandardMaterial
} {
  const group = new THREE.Group()
  const { armor, armorTier, steel } = opts
  const trimMat = trimGoldMat()
  const redMat = accentRedMat()

  /* --- Inner frame block (mostly hidden, gives the silhouette mass) --- */
  const frameBlock = new THREE.Mesh(chamferBox(1.32, 1.5, 1.02, 0.07), steel)
  frameBlock.position.set(0, 0.95, -0.03)
  group.add(frameBlock)

  /* --- Main torso armor shell ----------------------------------------- *
   * Upper chest block (wider, leaning slightly back at the top so the
   * pectorals read as a sloped wedge rather than a flat slab).            */
  const chestBlock = new THREE.Mesh(chamferBox(1.46, 0.78, 1.12, 0.1), armor)
  chestBlock.position.set(0, 1.28, 0.0)
  chestBlock.rotation.x = -0.06
  group.add(chestBlock)

  // Lower torso (narrower — gives the inverted-trapezoid real-robot taper).
  const lowerTorso = new THREE.Mesh(chamferBox(1.18, 0.62, 1.0, 0.09), armor)
  lowerTorso.position.set(0, 0.82, 0.0)
  group.add(lowerTorso)

  // Slim steel sternum spine where the two pecs meet (exposed mechanical).
  const sternum = new THREE.Mesh(chamferBox(0.16, 0.78, 0.12, 0.03), steel)
  sternum.position.set(0, 1.26, 0.62)
  group.add(sternum)

  /* --- Tiered chest plates (two overlapping, sloped pectoral plates) --- */
  for (const side of [-1, 1]) {
    const pec = panelPlate(0.6, 0.78, 0.2, {
      baseMat: armor,
      topMat: armorTier,
      bevel: 0.06,
      inset: 0.1,
      raise: 0.05,
      trim: true,
    })
    // Splay outward + lean back at the top for a sharp, layered chest.
    pec.position.set(side * 0.42, 1.3, 0.56)
    pec.rotation.y = side * 0.16
    pec.rotation.x = -0.1
    pec.rotation.z = side * -0.04
    group.add(pec)

    // Thin gold edge highlight down the inner chest seam.
    const seam = edgeLine(0.66, { thickness: 0.02, mat: trimMat })
    seam.rotation.z = Math.PI / 2
    seam.position.set(side * 0.12, 1.3, 0.69)
    group.add(seam)

    // A short diagonal panel-line slash across each pec (etched detail).
    const slash = edgeLine(0.34, { thickness: 0.016, mat: trimMat })
    slash.rotation.z = side * -0.7
    slash.position.set(side * 0.5, 1.46, 0.69)
    group.add(slash)

    // Two rivets anchoring the outer pec corner.
    const pecRivets = riveting(2, 0.16, { radius: 0.022 })
    pecRivets.rotation.z = Math.PI / 2
    pecRivets.position.set(side * 0.66, 1.18, 0.66)
    group.add(pecRivets)
  }

  /* --- Raised collar / neck guard ------------------------------------- */
  const collar = new THREE.Mesh(chamferBox(0.92, 0.28, 0.72, 0.06), armorTier)
  collar.position.set(0, 1.68, 0.04)
  collar.rotation.x = -0.14
  group.add(collar)

  // Sloped collar wings rising toward the shoulders (frame the neck).
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(chamferBox(0.34, 0.22, 0.5, 0.05), armor)
    wing.position.set(side * 0.5, 1.74, 0.0)
    wing.rotation.z = side * -0.35
    wing.rotation.y = side * 0.2
    group.add(wing)
  }

  // Exposed steel neck column.
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.26, 0.36, 12), steel)
  neck.position.set(0, 1.76, -0.02)
  group.add(neck)
  // Neck collar ring (steel detail at the base of the column).
  const neckRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 8, 16), steel)
  neckRing.rotation.x = Math.PI / 2
  neckRing.position.set(0, 1.62, -0.02)
  group.add(neckRing)

  // Collar gold trim across the front face.
  const collarTrim = trimStripe(0.8, 0.22, { thickness: 0.018, mat: trimMat })
  collarTrim.position.set(0, 1.68, 0.42)
  collarTrim.rotation.x = -0.14
  group.add(collarTrim)

  /* --- Layered abdomen (stacked, narrowing, slightly forward plates) --- */
  const abMats = [armorTier, armor, armorTier, armor]
  const abWidths = [1.12, 1.0, 0.86, 0.72]
  let abY = 0.6
  for (let i = 0; i < abWidths.length; i++) {
    const seg = new THREE.Mesh(
      chamferBox(abWidths[i], 0.18, 0.94 - i * 0.05, 0.045),
      abMats[i]
    )
    // Each plate sits slightly proud of the one below and tips forward → the
    // overlapping "stacked plate" abdomen of the reference.
    seg.position.set(0, abY, 0.07 + i * 0.012)
    seg.rotation.x = 0.06
    group.add(seg)
    // Thin gold under-edge on the two larger plates only (sparse trim).
    if (i < 2) {
      const lip = edgeLine(abWidths[i] * 0.7, { thickness: 0.014, mat: trimMat })
      lip.position.set(0, abY - 0.085, 0.07 + i * 0.012 + 0.46)
      group.add(lip)
    }
    abY -= 0.2
  }

  /* --- Waist (steel block + armored hip flares) ----------------------- */
  const waist = new THREE.Mesh(chamferBox(0.96, 0.3, 0.82, 0.06), steel)
  waist.position.set(0, 0.16, 0)
  group.add(waist)

  // Central waist buckle (small gold-trimmed plate — sparse accent).
  const buckle = new THREE.Mesh(chamferBox(0.26, 0.2, 0.1, 0.03), armorTier)
  buckle.position.set(0, 0.2, 0.42)
  group.add(buckle)
  const buckleTrim = trimStripe(0.24, 0.18, { thickness: 0.014, mat: trimMat })
  buckleTrim.position.set(0, 0.2, 0.48)
  group.add(buckleTrim)

  for (const side of [-1, 1]) {
    const hip = new THREE.Mesh(chamferBox(0.34, 0.46, 0.5, 0.06), armor)
    hip.position.set(side * 0.66, 0.28, 0.05)
    hip.rotation.z = side * 0.22
    group.add(hip)
    // Steel hip-joint disc peeking from under the flare.
    const hipJoint = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.16, 12), steel)
    hipJoint.rotation.z = Math.PI / 2
    hipJoint.position.set(side * 0.5, 0.18, 0.05)
    group.add(hipJoint)
  }

  /* --- Back armor plate (panelled) ------------------------------------ */
  const back = new THREE.Mesh(chamferBox(1.26, 1.3, 0.16, 0.08), armor)
  back.position.set(0, 1.05, -0.62)
  group.add(back)
  // Vertical spine ridge + panel trim on the back.
  const spine = new THREE.Mesh(chamferBox(0.18, 1.1, 0.1, 0.03), armorTier)
  spine.position.set(0, 1.05, -0.72)
  group.add(spine)
  const backTrim = trimStripe(1.1, 1.12, { thickness: 0.016, mat: trimMat })
  backTrim.position.set(0, 1.05, -0.71)
  group.add(backTrim)

  /* --- Multi-tiered angular shoulder pauldrons (centerpiece) ---------- *
   * Three stacked, rotated/tapered tiers + a steel pivot, capping the arm
   * socket (core-local x≈1.3, y≈1.0). Sloped outward & up for a wide,        *
   * aggressive silhouette.                                                  */
  for (const side of [-1, 1]) {
    const pauldron = new THREE.Group()

    // Tier 1 — big outer cap, tapered (narrower at the bottom front face).
    const cap = new THREE.Mesh(chamferBox(0.66, 0.5, 0.94, 0.1), armor)
    cap.position.set(0, 0.14, 0)
    cap.rotation.x = -0.06
    pauldron.add(cap)

    // Tier 2 — raised, lighter middle plate facing outward (±X), gold-trimmed.
    const midTier = panelPlate(0.56, 0.36, 0.78, {
      baseMat: armorTier,
      topMat: armorTier,
      bevel: 0.06,
      inset: 0.08,
      raise: 0.045,
      trim: true,
    })
    midTier.rotation.y = Math.PI / 2 // trimmed plate faces ±X
    midTier.position.set(side * 0.35, 0.2, 0)
    pauldron.add(midTier)

    // Tier 3 — angled forward "fang" plate jutting off the leading edge.
    const fang = new THREE.Mesh(chamferBox(0.3, 0.34, 0.5, 0.05), armorTier)
    fang.position.set(0, 0.12, 0.46)
    fang.rotation.x = 0.4
    pauldron.add(fang)

    // Tier 4 — lower skirt plate under the cap (small, angled).
    const skirt = new THREE.Mesh(chamferBox(0.52, 0.3, 0.8, 0.06), armor)
    skirt.position.set(0, -0.22, 0)
    skirt.rotation.z = side * 0.12
    pauldron.add(skirt)

    // Steel pivot joint into the torso.
    const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.52, 12), steel)
    pivot.rotation.z = Math.PI / 2
    pivot.position.set(side * -0.08, -0.06, 0)
    pauldron.add(pivot)
    // Pivot end cap (lighter steel disc — reads as a bolted hub).
    const pivotCap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 12), steel)
    pivotCap.rotation.z = Math.PI / 2
    pivotCap.position.set(side * -0.32, -0.06, 0)
    pauldron.add(pivotCap)
    const pivotBolt = bolt(0.05, { mat: trimMat })
    pivotBolt.rotation.set(0, side * Math.PI / 2, 0)
    pivotBolt.position.set(side * -0.36, -0.06, 0)
    pauldron.add(pivotBolt)

    // Edge rivets along the cap's leading top edge.
    const rivets = riveting(3, 0.24, { radius: 0.026 })
    rivets.rotation.y = Math.PI / 2
    rivets.position.set(side * 0.36, 0.36, 0.28)
    pauldron.add(rivets)

    // Thin gold trim line wrapping the cap's outer top edge.
    const capEdge = edgeLine(0.84, { thickness: 0.018, mat: trimMat })
    capEdge.position.set(side * 0.34, 0.38, 0.0)
    capEdge.rotation.set(0, Math.PI / 2, 0)
    pauldron.add(capEdge)

    pauldron.position.set(side * 1.02, 1.34, 0)
    pauldron.rotation.z = side * -0.14 // slope outward / up for a sharp line
    pauldron.rotation.y = side * 0.06
    group.add(pauldron)
  }

  return { group, armor, armorTier, steel, trimMat, redMat }
}

/* ------------------------------------------------------------------ */
/* Generators                                                          */
/* ------------------------------------------------------------------ */

export function createDieselGenerator(): THREE.Group {
  const armor = armorMat(PALETTE.armorDark)
  const armorTier = armorMat(PALETTE.armorMid)
  const steel = frameMat()
  const { group, redMat, trimMat } = buildCoreBase({
    armor,
    armorTier,
    steel,
    glow: PALETTE.glowAmber,
  })

  // Central red chest vent (the signature accent), recessed behind gold trim.
  const chestVent = ventSlats(5, 0.48, 0.64, { depth: 0.08, slatMat: redMat })
  chestVent.position.set(0, 1.16, 0.64)
  group.add(chestVent)
  const ventTrim = trimStripe(0.56, 0.72, { thickness: 0.02, mat: trimMat })
  ventTrim.position.set(0, 1.16, 0.69)
  group.add(ventTrim)
  // Corner bolts framing the vent.
  for (const cx of [-1, 1]) {
    const b = bolt(0.03, { mat: trimMat })
    b.position.set(cx * 0.27, 1.16, 0.7)
    group.add(b)
  }

  // Twin back-mounted exhaust stacks (steel, exposed mechanical) with hot tips.
  const exhaustMat = frameMat(PALETTE.frameSteelLight)
  for (let i = 0; i < 2; i++) {
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.12, 0.72, 12),
      exhaustMat
    )
    pipe.position.set((i - 0.5) * 0.6, 1.64, -0.66)
    group.add(pipe)
    // Stack collar ring.
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 14), exhaustMat)
    ring.rotation.x = Math.PI / 2
    ring.position.set((i - 0.5) * 0.6, 1.84, -0.66)
    group.add(ring)
    // Hot tip glow.
    const tip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.06, 12),
      createEnergyMaterial(PALETTE.accentRed)
    )
    tip.position.set((i - 0.5) * 0.6, 2.0, -0.66)
    group.add(tip)
  }

  // Side intake stacks on the lower flanks (red slats facing outward).
  for (const side of [-1, 1]) {
    const intake = ventSlats(3, 0.18, 0.4, { depth: 0.05, slatMat: redMat })
    intake.rotation.y = (side * Math.PI) / 2
    intake.position.set(side * 0.76, 0.84, 0.28)
    group.add(intake)
  }

  // Twin amber pilot sensors flanking the vent (tasteful glow punctuation).
  for (const side of [-1, 1]) {
    const pilot = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 10, 10),
      glowEyeMat(PALETTE.glowAmber)
    )
    pilot.position.set(side * 0.34, 1.5, 0.66)
    group.add(pilot)
  }

  return group
}

export function createFusionReactor(): THREE.Group {
  const armor = armorMat(PALETTE.armorMid)
  const armorTier = armorMat(PALETTE.armorDark)
  const steel = frameMat(PALETTE.frameSteelLight)
  const { group, trimMat } = buildCoreBase({
    armor,
    armorTier,
    steel,
    glow: PALETTE.glowAmber,
  })

  // Glowing amber fusion core set into the chest between the pec plates.
  const coreGlow = glowEyeMat(PALETTE.glowAmber)
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 20), coreGlow)
  core.position.set(0, 1.18, 0.6)
  group.add(core)

  // Steel containment rings around the core (two crossed + a gold front ring).
  for (let i = 0; i < 2; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.035, 8, 24), steel)
    ring.position.set(0, 1.18, 0.58)
    ring.rotation.y = (i * Math.PI) / 2
    group.add(ring)
  }
  const ringFront = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.03, 8, 28), trimMat)
  ringFront.position.set(0, 1.18, 0.66)
  group.add(ringFront)

  // Three steel containment struts radiating from the core to the pecs.
  for (let i = 0; i < 3; i++) {
    const ang = (i / 3) * Math.PI * 2 + Math.PI / 6
    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.045, 0.03), steel)
    strut.position.set(0, 1.18, 0.64)
    strut.rotation.z = ang
    group.add(strut)
  }

  // Amber sensor strip just under the collar.
  const sensor = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.04, 0.03),
    glowEyeMat(PALETTE.glowAmber)
  )
  sensor.position.set(0, 1.56, 0.6)
  group.add(sensor)

  // Back reactor cooling vent (amber-lit slats behind steel framing).
  const backVent = ventSlats(5, 1.0, 0.9, {
    depth: 0.06,
    slatMat: createEnergyMaterial(PALETTE.glowAmber),
  })
  backVent.position.set(0, 1.05, -0.72)
  backVent.rotation.y = Math.PI
  group.add(backVent)

  return group
}

export function createGasTurbine(): THREE.Group {
  const armor = armorMat(PALETTE.armorDark)
  const armorTier = armorMat(PALETTE.armorMid)
  const steel = frameMat(PALETTE.frameSteelLight)
  const { group, redMat, trimMat } = buildCoreBase({
    armor,
    armorTier,
    steel,
    glow: PALETTE.glowAmber,
  })

  // Central turbine intake recessed in the chest (steel ring + dark hub).
  const intakeRing = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.05, 10, 22), steel)
  intakeRing.position.set(0, 1.18, 0.62)
  group.add(intakeRing)
  // Dark recessed throat behind the blades.
  const throat = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.24, 0.12, 16),
    armorMat(PALETTE.ventBlack)
  )
  throat.rotation.x = Math.PI / 2
  throat.position.set(0, 1.18, 0.54)
  group.add(throat)
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.16, 12), steel)
  hub.rotation.x = Math.PI / 2
  hub.position.set(0, 1.18, 0.62)
  group.add(hub)
  // Turbine blades (thin steel fins).
  for (let i = 0; i < 9; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.045, 0.02), steel)
    blade.position.set(0, 1.18, 0.6)
    blade.rotation.z = (i / 9) * Math.PI * 2
    group.add(blade)
  }
  const intakeTrim = trimStripe(0.62, 0.62, { thickness: 0.018, mat: trimMat })
  intakeTrim.position.set(0, 1.18, 0.68)
  group.add(intakeTrim)

  // Shoulder-flank exhaust nacelles with red-hot nozzles.
  for (const side of [-1, 1]) {
    const nacelle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.21, 0.6, 12),
      steel
    )
    nacelle.rotation.x = Math.PI / 2
    nacelle.position.set(side * 0.82, 1.0, -0.45)
    group.add(nacelle)
    // Nacelle banding (steel ring detail).
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.022, 8, 16), steel)
    band.rotation.x = Math.PI / 2
    band.position.set(side * 0.82, 1.0, -0.3)
    group.add(band)

    const nozzle = new THREE.Mesh(
      new THREE.ConeGeometry(0.2, 0.28, 12),
      createEnergyMaterial(PALETTE.accentRed)
    )
    nozzle.rotation.x = -Math.PI / 2
    nozzle.position.set(side * 0.82, 1.0, -0.78)
    group.add(nozzle)

    // Red intake slats on the flank.
    const slats = ventSlats(3, 0.22, 0.34, { depth: 0.05, slatMat: redMat })
    slats.rotation.y = (side * Math.PI) / 2
    slats.position.set(side * 0.76, 0.78, 0.32)
    group.add(slats)
  }

  return group
}

export function createCapacitorBank(): THREE.Group {
  const armor = armorMat(PALETTE.armorMid)
  const armorTier = armorMat(PALETTE.armorDark)
  const steel = frameMat()
  const { group, trimMat } = buildCoreBase({
    armor,
    armorTier,
    steel,
    glow: PALETTE.glowAmber,
  })

  // Exposed capacitor cylinders glowing amber, set behind a dark chest cutout.
  const capGlow = glowEyeMat(PALETTE.glowAmber)
  const housing = new THREE.Mesh(
    chamferBox(0.62, 0.66, 0.12, 0.04),
    armorMat(PALETTE.ventBlack)
  )
  housing.position.set(0, 1.16, 0.6)
  group.add(housing)
  for (const col of [-1, 1]) {
    for (const row of [-1, 1]) {
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.5, 12),
        capGlow
      )
      cap.position.set(col * 0.16, 1.16 + row * 0.14, 0.66)
      group.add(cap)
      // Steel terminal cap on each capacitor.
      const term = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.04, 12),
        frameMat(PALETTE.frameSteelLight)
      )
      term.position.set(col * 0.16, 1.16 + row * 0.14 + (row > 0 ? 0.26 : -0.26), 0.66)
      group.add(term)
    }
  }
  const capTrim = trimStripe(0.66, 0.7, { thickness: 0.02, mat: trimMat })
  capTrim.position.set(0, 1.16, 0.67)
  group.add(capTrim)

  // Power terminals on the collar (steel + amber pilot lights).
  const termMat = frameMat(PALETTE.frameSteelLight)
  for (let i = 0; i < 2; i++) {
    const term = new THREE.Mesh(chamferBox(0.2, 0.16, 0.2, 0.03), termMat)
    term.position.set((i - 0.5) * 0.7, 1.84, -0.1)
    group.add(term)
    const pilot = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 10, 10),
      glowEyeMat(PALETTE.glowAmber)
    )
    pilot.position.set((i - 0.5) * 0.7, 1.94, -0.05)
    group.add(pilot)
  }

  // Status sensor strip on the right side flank.
  for (let i = 0; i < 3; i++) {
    const light = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      glowEyeMat(PALETTE.glowAmber)
    )
    light.position.set(0.8, 1.3 + i * 0.14, 0.32)
    group.add(light)
  }

  // Capacitor side rails use the manufacturer preset (keeps MATERIALS wired in).
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(chamferBox(0.12, 0.9, 0.5, 0.04), MATERIALS.voltTech)
    rail.position.set(side * 0.7, 1.05, -0.12)
    group.add(rail)
  }

  return group
}
