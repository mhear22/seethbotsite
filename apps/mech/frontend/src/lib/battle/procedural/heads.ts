/**
 * Procedural Head Part Models
 *
 * Art-bible heads: slim charcoal skull, sharp V-fin antenna on the forehead,
 * twin glowing amber eyes set behind a dark face mask, side cheek vents/ducts.
 * Layered, chamfered, overlapping angular armor (no plain cubes) with thin
 * gold edge piping and steel framing.
 *
 * Local convention (unchanged from previous impl): the part is built around a
 * short neck near y≈0 with the head rising to roughly y≈1.0–1.2 (scout
 * antennae tips reach ~1.25). Overall envelope ~1.5u. Front face is +Z.
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
  ventMat,
  chamferBox,
  panelPlate,
  trimStripe,
  edgeLine,
  ventSlats,
  bolt,
} from './detailing'

/* ------------------------------------------------------------------ */
/* Shared sub-assemblies                                               */
/* ------------------------------------------------------------------ */

/** Short steel neck pedestal sitting at the local origin. */
function buildNeck(mat: THREE.Material, topR = 0.22, botR = 0.3): THREE.Group {
  const g = new THREE.Group()

  // Tapered neck column.
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(topR, botR, 0.3, 12), mat)
  neck.position.set(0, 0.15, 0)
  g.add(neck)

  // Two stacked collar rings (steel) so the neck reads as an articulated joint.
  const collarLow = new THREE.Mesh(new THREE.TorusGeometry(botR * 0.96, 0.028, 6, 16), mat)
  collarLow.rotation.x = Math.PI / 2
  collarLow.position.set(0, 0.05, 0)
  g.add(collarLow)
  const collarHi = new THREE.Mesh(new THREE.TorusGeometry(topR * 1.02, 0.022, 6, 16), mat)
  collarHi.rotation.x = Math.PI / 2
  collarHi.position.set(0, 0.27, 0)
  g.add(collarHi)

  // A thin gold ring at the joint line — edge piping reads even at the neck.
  const trimRing = new THREE.Mesh(
    new THREE.TorusGeometry((topR + botR) * 0.5, 0.012, 6, 18),
    trimGoldMat()
  )
  trimRing.rotation.x = Math.PI / 2
  trimRing.position.set(0, 0.18, 0)
  g.add(trimRing)

  return g
}

/**
 * Sharp forehead V-fin antenna: two swept gold blades over dark backing slats
 * forming a tight V, plus a central red-jewel crest. Built around its own
 * origin (base at y≈0, sweeping up and back) so the caller drops it on the
 * forehead. Front face is +Z.
 */
function buildVFin(): THREE.Group {
  const g = new THREE.Group()
  const goldMat = trimGoldMat()
  const darkMat = armorMat(PALETTE.armorMid)

  // Central crest base — a sharp little chamfered keystone.
  const crest = new THREE.Mesh(chamferBox(0.13, 0.18, 0.11, 0.03), darkMat)
  crest.position.set(0, 0.03, 0)
  crest.rotation.x = -0.1
  g.add(crest)

  // Red sensor jewel set into the crest (recessed look via dark bezel behind).
  const bezel = new THREE.Mesh(chamferBox(0.08, 0.08, 0.04, 0.01), ventMat())
  bezel.position.set(0, 0.05, 0.055)
  g.add(bezel)
  const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.04, 0), accentRedMat())
  jewel.position.set(0, 0.05, 0.075)
  jewel.scale.set(1, 1.2, 0.6)
  g.add(jewel)

  // Two swept fin blades forming a V, each = dark backing + proud gold edge.
  for (const side of [-1, 1]) {
    const swept = new THREE.Group()
    swept.position.set(side * 0.12, 0.14, 0)
    swept.rotation.z = side * 0.58
    swept.rotation.x = -0.2

    // Dark backing blade (slightly larger -> gold reads as bright edge trim).
    const back = new THREE.Mesh(chamferBox(0.07, 0.36, 0.04, 0.012), darkMat)
    back.position.set(0, 0, -0.012)
    swept.add(back)

    // Gold blade proud of the backing, tapered toward the tip via scale.
    const blade = new THREE.Mesh(chamferBox(0.055, 0.34, 0.045, 0.012), goldMat)
    blade.position.set(0, 0.01, 0.018)
    swept.add(blade)

    // Sharp gold tip cone capping the blade.
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 4), goldMat)
    tip.position.set(0, 0.22, 0.0)
    tip.rotation.y = Math.PI / 4
    swept.add(tip)

    g.add(swept)
  }

  return g
}

/** Face optic layout per head archetype (see buildFace). */
type FaceVariant = 'standard' | 'targeting' | 'reinforced' | 'scout'

/**
 * The dark face mask + eyes + brow visor. Centered on origin, faces +Z. The
 * mask is a near-black recessed plate with a chin taper and a central ridge.
 *
 * The optic treatment varies by archetype so the four heads don't read as one
 * head with swapped antennas:
 *   - standard   : twin amber eyes in dark sockets (the classic real-robot mask)
 *   - targeting  : twin eyes as tall narrow slits (precision gunsight read)
 *   - reinforced : one horizontal amber optic band behind a heavy dark brow
 *                  slot (armored bunker read) + a wider brow
 *   - scout      : a single cyclopean mono-eye in a steel bezel + a slimmer brow
 */
function buildFace(
  eyeColor = PALETTE.glowAmber,
  opts: { variant?: FaceVariant } = {}
): THREE.Group {
  const { variant = 'standard' } = opts
  const g = new THREE.Group()

  // Dark recessed face mask (the "T" visor backing).
  const maskMat = new THREE.MeshStandardMaterial({
    color: PALETTE.ventBlack,
    metalness: 0.6,
    roughness: 0.4,
  })
  const mask = new THREE.Mesh(chamferBox(0.62, 0.34, 0.1, 0.04), maskMat)
  g.add(mask)

  // Chin taper — a smaller chamfered plate angled forward under the mask, giving
  // the slim pointed-jaw silhouette of the reference.
  const chin = new THREE.Mesh(chamferBox(0.34, 0.16, 0.12, 0.04), armorMat())
  chin.position.set(0, -0.2, 0.02)
  chin.rotation.x = -0.5
  g.add(chin)

  // Central vertical face ridge (charcoal) splitting the mask — sharpens it.
  const ridge = new THREE.Mesh(chamferBox(0.06, 0.3, 0.08, 0.02), armorMat(PALETTE.armorMid))
  ridge.position.set(0, -0.02, 0.05)
  g.add(ridge)

  // Brow visor lip (charcoal) proud of the mask, slightly down-angled, with an
  // overlapping second tier so the brow reads as layered armor. Reinforced heads
  // widen the brow into a heavy cowl; scouts slim it into a sharper wedge.
  const browW = variant === 'reinforced' ? 0.74 : variant === 'scout' ? 0.58 : 0.66
  const brow = new THREE.Mesh(chamferBox(browW, 0.1, 0.12, 0.03), armorMat(PALETTE.armorMid))
  brow.position.set(0, 0.18, 0.05)
  brow.rotation.x = 0.22
  g.add(brow)
  const browTier = new THREE.Mesh(chamferBox(browW * 0.76, 0.05, 0.1, 0.02), armorMat())
  browTier.position.set(0, 0.21, 0.09)
  browTier.rotation.x = 0.22
  g.add(browTier)

  // Thin gold line under the brow.
  const browTrim = edgeLine(0.46, { thickness: 0.014 })
  browTrim.position.set(0, 0.11, 0.085)
  g.add(browTrim)

  // --- Optic cluster (varies by archetype) ----------------------------------
  const eyeMat = glowEyeMat(eyeColor)
  if (variant === 'reinforced') {
    // Single horizontal amber optic band recessed behind a heavy dark brow slot.
    const slot = new THREE.Mesh(chamferBox(0.54, 0.14, 0.05, 0.02), ventMat())
    slot.position.set(0, 0.04, 0.04)
    g.add(slot)
    const band = new THREE.Mesh(chamferBox(0.46, 0.09, 0.05, 0.02), eyeMat)
    band.position.set(0, 0.04, 0.07)
    g.add(band)
  } else if (variant === 'scout') {
    // Cyclopean mono-eye in a steel bezel (recon read).
    const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 14), frameMat())
    bezel.rotation.x = Math.PI / 2
    bezel.position.set(0, 0.04, 0.05)
    g.add(bezel)
    const mono = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 14), eyeMat)
    mono.rotation.x = Math.PI / 2
    mono.position.set(0, 0.04, 0.08)
    g.add(mono)
  } else {
    // Twin eyes in dark sockets. Standard = wide lenses; targeting = tall slits.
    const ew = variant === 'targeting' ? 0.1 : 0.16
    const eh = variant === 'targeting' ? 0.12 : 0.07
    for (const side of [-1, 1]) {
      const socket = new THREE.Mesh(chamferBox(ew + 0.04, eh + 0.03, 0.05, 0.015), maskMat)
      socket.position.set(side * 0.16, 0.04, 0.045)
      socket.rotation.z = side * 0.12
      g.add(socket)

      const eye = new THREE.Mesh(chamferBox(ew, eh, 0.05, 0.015), eyeMat)
      eye.position.set(side * 0.16, 0.04, 0.07)
      eye.rotation.z = side * 0.12
      g.add(eye)
    }
  }

  // Central mouth/intake slit (dark backing + thin red bar) below the ridge.
  const slitBack = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.07, 0.03), maskMat)
  slitBack.position.set(0, -0.11, 0.05)
  g.add(slitBack)
  const slit = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.04), accentRedMat())
  slit.position.set(0, -0.11, 0.07)
  g.add(slit)

  return g
}

/**
 * A cheek armor pod with a recessed red vent and a thin gold frame, built
 * around its own origin and faced/raked by the caller. Centered; faces +Z.
 */
function buildCheek(
  w: number,
  h: number,
  d: number,
  ventCount: number,
  armorBase: THREE.Material
): THREE.Group {
  const g = new THREE.Group()

  // Overlapping two-tier cheek armor (sloped outer plate on a base block).
  const base = new THREE.Mesh(chamferBox(w, h, d, 0.045), armorBase)
  g.add(base)
  const outer = new THREE.Mesh(chamferBox(w * 0.7, h * 0.7, d * 0.5, 0.03), armorMat(PALETTE.armorMid))
  outer.position.set(0, h * 0.02, d * 0.42)
  outer.rotation.y = 0.0
  g.add(outer)

  // Recessed red cheek vent on the front-outer face with a gold edge frame.
  const vent = ventSlats(ventCount, w * 0.55, h * 0.55)
  vent.position.set(0, -h * 0.05, d * 0.5)
  g.add(vent)
  const frame = trimStripe(w * 0.58, h * 0.58, { thickness: 0.012 })
  frame.position.set(0, -h * 0.05, d * 0.52)
  g.add(frame)

  return g
}

/* ------------------------------------------------------------------ */
/* HEAD VARIANTS                                                       */
/* ------------------------------------------------------------------ */

export function createStandardOptics(): THREE.Group {
  const group = new THREE.Group()

  const steel = frameMat()
  const armorBase = armorMat()
  const armorTop = armorMat(PALETTE.armorMid)

  group.add(buildNeck(steel))

  // Main slim skull as a layered panel plate (charcoal, gold-trimmed crown).
  const skull = panelPlate(0.78, 0.62, 0.72, {
    baseMat: armorBase,
    topMat: armorTop,
    inset: 0.1,
    raise: 0.04,
  })
  skull.position.set(0, 0.6, -0.04)
  group.add(skull)

  // Sloped forehead crown plate, layered with a thin overlapping cap.
  const crown = new THREE.Mesh(chamferBox(0.7, 0.22, 0.34, 0.05), armorTop)
  crown.position.set(0, 0.86, 0.18)
  crown.rotation.x = -0.34
  group.add(crown)
  const crownCap = new THREE.Mesh(chamferBox(0.5, 0.1, 0.28, 0.03), armorBase)
  crownCap.position.set(0, 0.94, 0.16)
  crownCap.rotation.x = -0.34
  group.add(crownCap)
  // Gold panel line along the crown seam.
  const crownTrim = edgeLine(0.46, { thickness: 0.014 })
  crownTrim.position.set(0, 0.9, 0.36)
  crownTrim.rotation.x = -0.34
  group.add(crownTrim)

  // Face mask + twin amber eyes.
  const face = buildFace()
  face.position.set(0, 0.58, 0.34)
  group.add(face)

  // V-fin antenna on the forehead.
  const fin = buildVFin()
  fin.position.set(0, 0.92, 0.12)
  group.add(fin)

  // Side cheek vents (red slats) + dark cheek armor pods, raked outward.
  for (const side of [-1, 1]) {
    const cheek = buildCheek(0.18, 0.42, 0.5, 3, armorBase)
    cheek.position.set(side * 0.46, 0.56, 0.02)
    cheek.rotation.y = side * 0.32
    group.add(cheek)

    // Rivet greeble high on the cheek.
    const b = bolt(0.022)
    b.position.set(side * 0.5, 0.78, 0.2)
    group.add(b)
  }

  // Rear sensor block with a steel frame collar.
  const rear = new THREE.Mesh(chamferBox(0.5, 0.36, 0.22, 0.04), armorBase)
  rear.position.set(0, 0.6, -0.42)
  group.add(rear)
  const rearTrim = trimStripe(0.42, 0.28, { thickness: 0.012 })
  rearTrim.position.set(0, 0.6, -0.53)
  rearTrim.rotation.y = Math.PI
  group.add(rearTrim)

  return group
}

export function createTargetingArray(): THREE.Group {
  const group = new THREE.Group()

  const steel = frameMat()
  const armorBase = armorMat()
  const armorTop = armorMat(PALETTE.armorMid)

  group.add(buildNeck(steel))

  // Slim skull housing, gold-trimmed.
  const skull = panelPlate(0.8, 0.6, 0.7, {
    baseMat: armorBase,
    topMat: armorTop,
    inset: 0.1,
    raise: 0.04,
    trim: true,
  })
  skull.position.set(0, 0.58, -0.04)
  group.add(skull)

  // Sloped forehead crown.
  const crown = new THREE.Mesh(chamferBox(0.72, 0.2, 0.32, 0.05), armorTop)
  crown.position.set(0, 0.84, 0.16)
  crown.rotation.x = -0.32
  group.add(crown)

  // Face mask + twin eyes as tall narrow targeting slits.
  const face = buildFace(PALETTE.glowAmber, { variant: 'targeting' })
  face.position.set(0, 0.56, 0.33)
  group.add(face)

  // V-fin antenna.
  const fin = buildVFin()
  fin.position.set(0, 0.9, 0.1)
  group.add(fin)

  // Tall central targeting sensor strip above the brow (amber glow) in a dark
  // recessed housing with a gold frame.
  const sensorHousing = new THREE.Mesh(chamferBox(0.14, 0.22, 0.06, 0.02), ventMat())
  sensorHousing.position.set(0, 0.74, 0.33)
  group.add(sensorHousing)
  const sensor = new THREE.Mesh(chamferBox(0.1, 0.18, 0.06, 0.02), glowEyeMat())
  sensor.position.set(0, 0.74, 0.35)
  group.add(sensor)
  const sensorFrame = trimStripe(0.14, 0.22, { thickness: 0.014 })
  sensorFrame.position.set(0, 0.74, 0.37)
  group.add(sensorFrame)

  // Side cheek pods with stacked sensor lenses + red vents.
  for (const side of [-1, 1]) {
    const pod = buildCheek(0.22, 0.48, 0.54, 3, armorBase)
    pod.position.set(side * 0.5, 0.56, 0.0)
    pod.rotation.y = side * 0.28
    group.add(pod)

    // Two small amber lenses in steel bezels stacked on the pod's outer face.
    for (let i = 0; i < 2; i++) {
      const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 10), steel)
      bezel.rotation.x = Math.PI / 2
      bezel.position.set(side * 0.62, 0.46 + i * 0.18, 0.22)
      group.add(bezel)
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 10), glowEyeMat())
      lens.rotation.x = Math.PI / 2
      lens.position.set(side * 0.62, 0.46 + i * 0.18, 0.24)
      group.add(lens)
    }

    // Slim side antenna fin (gold over dark) raked back.
    const sideFin = new THREE.Mesh(chamferBox(0.045, 0.34, 0.1, 0.012), trimGoldMat())
    sideFin.position.set(side * 0.58, 0.92, -0.08)
    sideFin.rotation.z = side * 0.32
    group.add(sideFin)
    const sideFinTip = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 4), trimGoldMat())
    sideFinTip.position.set(side * 0.68, 1.08, -0.08)
    sideFinTip.rotation.z = side * 0.32
    sideFinTip.rotation.y = Math.PI / 4
    group.add(sideFinTip)
  }

  // Rear processor block with cooling slats + gold seam.
  const proc = new THREE.Mesh(chamferBox(0.56, 0.42, 0.26, 0.05), armorBase)
  proc.position.set(0, 0.58, -0.44)
  group.add(proc)
  const procVent = ventSlats(3, 0.42, 0.26)
  procVent.position.set(0, 0.58, -0.58)
  procVent.rotation.y = Math.PI
  group.add(procVent)

  return group
}

export function createReinforcedPod(): THREE.Group {
  const group = new THREE.Group()

  const steel = frameMat()
  const armorBase = armorMat()
  const armorTop = armorMat(PALETTE.armorMid)

  group.add(buildNeck(steel, 0.26, 0.32))

  // Heavier, blockier skull (still chamfered + layered).
  const skull = panelPlate(0.92, 0.78, 0.82, {
    baseMat: armorBase,
    topMat: armorTop,
    inset: 0.12,
    raise: 0.05,
    trim: true,
  })
  skull.position.set(0, 0.6, -0.04)
  group.add(skull)

  // Thick sloped armor brow plate, layered with an overlapping cap and rivets.
  const brow = new THREE.Mesh(chamferBox(0.86, 0.26, 0.36, 0.06), armorTop)
  brow.position.set(0, 0.9, 0.14)
  brow.rotation.x = -0.3
  group.add(brow)
  const browCap = new THREE.Mesh(chamferBox(0.6, 0.12, 0.3, 0.04), armorBase)
  browCap.position.set(0, 0.99, 0.12)
  browCap.rotation.x = -0.3
  group.add(browCap)
  for (const side of [-1, 1]) {
    const b = bolt(0.026)
    b.position.set(side * 0.3, 0.88, 0.34)
    b.rotation.y = 0
    group.add(b)
  }

  // Reinforced face mask + single horizontal amber optic band (bunker read).
  const face = buildFace(PALETTE.glowAmber, { variant: 'reinforced' })
  face.scale.set(1.05, 0.9, 1)
  face.position.set(0, 0.58, 0.4)
  group.add(face)

  // No V-fin on the bunker head — instead stubby armored side "ear" housings
  // flanking the skull (ported from the Juggernaut bunker head).
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(chamferBox(0.12, 0.3, 0.34, 0.04), steel)
    ear.position.set(side * 0.5, 0.62, -0.04)
    group.add(ear)
  }

  // Side cheek armor blocks + red vents (heavier).
  for (const side of [-1, 1]) {
    const cheek = buildCheek(0.24, 0.52, 0.6, 2, armorBase)
    cheek.position.set(side * 0.52, 0.58, 0.02)
    cheek.rotation.y = side * 0.26
    group.add(cheek)

    // Bolt cluster greeble (armored rivets) along the cheek edge.
    for (const dy of [0.36, 0.58, 0.8]) {
      const b = bolt(0.03)
      b.position.set(side * 0.5, dy, 0.36)
      group.add(b)
    }
  }

  // Heavy rear armor block with a gold trim seam.
  const rear = new THREE.Mesh(chamferBox(0.6, 0.5, 0.28, 0.06), armorBase)
  rear.position.set(0, 0.6, -0.42)
  group.add(rear)
  const rearTrim = trimStripe(0.5, 0.4, { thickness: 0.014 })
  rearTrim.position.set(0, 0.6, -0.56)
  rearTrim.rotation.y = Math.PI
  group.add(rearTrim)

  return group
}

export function createScoutSuite(): THREE.Group {
  const group = new THREE.Group()

  const steel = frameMat(PALETTE.frameSteelLight)
  const armorBase = armorMat()
  const armorTop = armorMat(PALETTE.armorMid)

  group.add(buildNeck(steel, 0.2, 0.26))

  // Sleek, slimmer scout skull.
  const skull = panelPlate(0.66, 0.56, 0.66, {
    baseMat: armorBase,
    topMat: armorTop,
    inset: 0.1,
    raise: 0.04,
  })
  skull.position.set(0, 0.56, -0.02)
  group.add(skull)

  // Sharply sloped forehead crown with a gold panel line.
  const crown = new THREE.Mesh(chamferBox(0.6, 0.18, 0.36, 0.05), armorTop)
  crown.position.set(0, 0.8, 0.2)
  crown.rotation.x = -0.4
  group.add(crown)
  const crownTrim = edgeLine(0.4, { thickness: 0.012 })
  crownTrim.position.set(0, 0.84, 0.37)
  crownTrim.rotation.x = -0.4
  group.add(crownTrim)

  // Face mask + single cyclopean mono-eye (recon read).
  const face = buildFace(PALETTE.glowAmber, { variant: 'scout' })
  face.scale.set(0.92, 1, 1)
  face.position.set(0, 0.54, 0.32)
  group.add(face)

  // Tall sweeping V-fin (scouts get a prominent antenna).
  const fin = buildVFin()
  fin.scale.set(1.1, 1.25, 1)
  fin.position.set(0, 0.86, 0.12)
  group.add(fin)

  // Forward-raked long-range sensor lens between the eyes' brow, in a steel
  // bezel with a gold ring so it reads as a precision optic.
  const lrBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.08, 12), steel)
  lrBezel.rotation.x = Math.PI / 2
  lrBezel.position.set(0, 0.72, 0.33)
  group.add(lrBezel)
  const longRange = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.1, 12), glowEyeMat())
  longRange.rotation.x = Math.PI / 2
  longRange.position.set(0, 0.72, 0.37)
  group.add(longRange)
  const lrFrame = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.016, 6, 18), trimGoldMat())
  lrFrame.position.set(0, 0.72, 0.41)
  group.add(lrFrame)

  // Slim cheek vents + a thin amber lens per side + swept comms antennae.
  for (const side of [-1, 1]) {
    const cheek = buildCheek(0.14, 0.36, 0.46, 3, armorBase)
    cheek.position.set(side * 0.4, 0.54, 0.0)
    cheek.rotation.y = side * 0.34
    group.add(cheek)

    const lens = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), glowEyeMat())
    lens.position.set(side * 0.5, 0.66, 0.22)
    group.add(lens)

    // Long swept communication antenna with an amber tip beacon.
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.5, 6), steel)
    ant.position.set(side * 0.26, 1.0, -0.06)
    ant.rotation.z = side * 0.22
    ant.rotation.x = -0.1
    group.add(ant)
    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 8, 8),
      createEnergyMaterial(PALETTE.glowAmber)
    )
    tip.position.set(side * 0.32, 1.24, -0.1)
    group.add(tip)
  }

  // Compact rear comms block (uses a manufacturer material for variety).
  const rear = new THREE.Mesh(chamferBox(0.42, 0.3, 0.2, 0.04), MATERIALS.swiftDrive)
  rear.position.set(0, 0.56, -0.38)
  group.add(rear)

  return group
}
