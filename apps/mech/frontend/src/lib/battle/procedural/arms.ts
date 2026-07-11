/**
 * Procedural Arm Weapon Models
 *
 * Local convention (unchanged): the weapon mounts near local z ~ 0 and extends
 * forward along +Z. Max bounding box ~ 1.0 (X) x 2.5 (Z) x 1.0 (Y).
 *
 * Each weapon sits on a shared "arm shell": an armored upper-arm / forearm
 * with gold edge trim, a visible steel elbow joint and a glowing amber status
 * eye, so the weapon reads as arm-mounted layered angular armor rather than a
 * floating box. The actual weapon hardware (barrels, pods, spikes, projectors)
 * stays visually distinct.
 *
 * Art bible: charcoal armor (armorDark/armorMid) over exposed steel frame,
 * RED accents on intakes/warnings, thin GOLD edge piping, glowing AMBER
 * sensors. See ./detailing PALETTE.
 */

import * as THREE from 'three'
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
  riveting,
} from './detailing'

/* ------------------------------------------------------------------ */
/* Shared arm-shell builder                                            */
/* ------------------------------------------------------------------ */

/**
 * Build the armored arm the weapon sits on: a chunky, slightly sloped upper-arm
 * pauldron, an exposed steel elbow joint with end caps + pivot bolts, and a
 * tapered, tiered forearm shell with gold edge trim and a small amber status
 * eye. A dark steel under-sleeve fills the chamfer gaps so the armor reads as
 * layered plate over a frame (never hollow).
 *
 * Returns the group plus the z at which the forearm front face ends, so each
 * weapon can mount its hardware just beyond it.
 */
function armShell(opts: {
  armorMaterial: THREE.MeshStandardMaterial
  midMaterial?: THREE.MeshStandardMaterial
  forearmLen?: number
  /** Girth multiplier on the pauldron + forearm cross-section (and all coupled
   *  forearm detail offsets). 1.0 = stock; >1 = heavier bruiser arm, <1 = slim
   *  support arm. The elbow joint and the z-axis (weapon mount) stay fixed. */
  bulk?: number
}): { group: THREE.Group; forearmFrontZ: number } {
  const {
    armorMaterial,
    midMaterial = armorMat(PALETTE.armorMid),
    forearmLen = 0.85,
    bulk = 1.0,
  } = opts
  const b = bulk
  const group = new THREE.Group()

  const steel = frameMat()
  const steelLight = frameMat(PALETTE.frameSteelLight)
  const gold = trimGoldMat()

  /* --- Upper-arm pauldron: a tapered, layered plate raked back over the
     shoulder mount. Rotated/sloped so it reads as a fitted shoulder cap. --- */
  const pauldron = panelPlate(0.74 * b, 0.72 * b, 0.42, {
    baseMat: armorMaterial,
    topMat: midMaterial,
    bevel: 0.07,
    raise: 0.06,
    trim: true,
  })
  pauldron.position.set(0, 0.06, -0.34)
  pauldron.rotation.x = -0.16
  group.add(pauldron)

  // A second, smaller skirt plate overlapping the lower pauldron edge for tier.
  const pauldronSkirt = new THREE.Mesh(chamferBox(0.6, 0.26, 0.34, 0.05), midMaterial)
  pauldronSkirt.position.set(0, -0.26, -0.26)
  pauldronSkirt.rotation.x = 0.22
  group.add(pauldronSkirt)

  // Bolts along the pauldron shoulder edge.
  const shoulderRivets = riveting(4, 0.16, { radius: 0.022 })
  shoulderRivets.position.set(0, 0.34, -0.14)
  shoulderRivets.rotation.x = -0.16
  group.add(shoulderRivets)

  // Gold accent stripe across the pauldron crest.
  const crest = edgeLine(0.5, { thickness: 0.026, mat: gold })
  crest.position.set(0, 0.36, -0.12)
  crest.rotation.x = -0.16
  group.add(crest)

  /* --- Visible steel elbow joint: a short cross-axle barrel between upper arm
     and forearm, with machined end caps and pivot bolts. --- */
  const elbow = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.64, 16), steel)
  elbow.rotation.z = Math.PI / 2
  elbow.position.set(0, 0, -0.02)
  group.add(elbow)
  // Inner darker collar so the joint reads as a recessed pivot, not a plain rod.
  const elbowCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.3, 16), armorMaterial)
  elbowCollar.rotation.z = Math.PI / 2
  elbowCollar.position.set(0, 0, -0.02)
  group.add(elbowCollar)
  for (const side of [-1, 1]) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.27, 0.07, 16), steelLight)
    cap.rotation.z = Math.PI / 2
    cap.position.set(side * 0.32, 0, -0.02)
    group.add(cap)
    const pivotBolt = bolt(0.055)
    pivotBolt.rotation.x = 0
    pivotBolt.rotation.y = Math.PI / 2
    pivotBolt.position.set(side * 0.37, 0, -0.02)
    group.add(pivotBolt)
  }

  /* --- Forearm: a dark steel under-sleeve wrapped by a tapered, chamfered
     charcoal armor shell, with a raised mid-plate ridge and gold corner
     piping. The taper (narrower at the front) sharpens the silhouette. --- */
  const sleeve = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26 * b, 0.3 * b, forearmLen + 0.1, 12),
    steel
  )
  sleeve.rotation.x = Math.PI / 2
  sleeve.position.set(0, 0, 0.18 + forearmLen / 2)
  group.add(sleeve)

  // Main forearm armor shell (chamfered, slightly larger at the elbow end).
  const forearm = new THREE.Mesh(chamferBox(0.66 * b, 0.66 * b, forearmLen, 0.08), armorMaterial)
  forearm.position.set(0, 0, 0.18 + forearmLen / 2)
  group.add(forearm)

  // Side cheek plates, splayed outward, overlapping the main shell for layering.
  // The lateral offset scales with bulk so they stay hugged to the wider shell.
  for (const side of [-1, 1]) {
    const cheek = new THREE.Mesh(chamferBox(0.16, 0.46 * b, forearmLen * 0.78, 0.04), midMaterial)
    cheek.position.set(side * 0.34 * b, 0, 0.2 + forearmLen / 2)
    cheek.rotation.z = side * -0.18
    group.add(cheek)
  }

  // Layered top ridge plate proud of the forearm for a tiered crest. Its height
  // offset scales with bulk so it rides on the (taller) shell top.
  const forearmTop = new THREE.Mesh(chamferBox(0.5 * b, 0.16, forearmLen * 0.82, 0.05), midMaterial)
  forearmTop.position.set(0, 0.36 * b, 0.2 + forearmLen / 2)
  group.add(forearmTop)

  // Gold edge piping running down both top corners of the forearm.
  for (const side of [-1, 1]) {
    const line = edgeLine(forearmLen * 0.82, { thickness: 0.022, mat: gold })
    line.rotation.y = Math.PI / 2
    line.position.set(side * 0.3 * b, 0.3 * b, 0.22 + forearmLen / 2)
    group.add(line)
  }

  // Panel-line rivet row down the forearm top.
  const forearmRivets = riveting(Math.max(2, Math.round(forearmLen / 0.22)), 0.2, { radius: 0.018 })
  forearmRivets.rotation.z = Math.PI / 2
  forearmRivets.position.set(0, 0.45 * b, 0.2 + forearmLen / 2)
  group.add(forearmRivets)

  // Small glowing amber status eye on the forearm side.
  const eye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.03), glowEyeMat(PALETTE.glowAmber))
  eye.position.set(0.34 * b, 0.12 * b, 0.22)
  group.add(eye)

  // A thin gold trim band wrapping the front lip of the forearm.
  const frontFrame = trimStripe(0.64 * b, 0.64 * b, { thickness: 0.024, mat: gold })
  const forearmFrontZ = 0.18 + forearmLen
  frontFrame.position.set(0, 0, forearmFrontZ - 0.01)
  group.add(frontFrame)

  return { group, forearmFrontZ }
}

/* ------------------------------------------------------------------ */
/* AUTOCANNON — rotary gatling barrels on a chunky forearm             */
/* ------------------------------------------------------------------ */

export function createAutocannon(): THREE.Group {
  const group = new THREE.Group()
  const armor = armorMat()
  const mid = armorMat(PALETTE.armorMid)
  const steel = frameMat()
  const gold = trimGoldMat()

  const { group: arm, forearmFrontZ } = armShell({ armorMaterial: armor, midMaterial: mid, bulk: 1.15 })
  group.add(arm)

  // Rotary breech housing — a multi-tier charcoal block at the muzzle end.
  const breech = panelPlate(0.68, 0.68, 0.42, {
    baseMat: armor,
    topMat: mid,
    bevel: 0.06,
    raise: 0.05,
    trim: true,
  })
  breech.rotation.x = Math.PI / 2
  breech.position.set(0, 0, forearmFrontZ + 0.18)
  group.add(breech)

  // Rotary hub the barrels spin on (steel), with a darker recessed back-plate.
  const hubPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.06, 16), ventMat())
  hubPlate.rotation.x = Math.PI / 2
  hubPlate.position.set(0, 0, forearmFrontZ + 0.4)
  group.add(hubPlate)
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.36, 16), steel)
  hub.rotation.x = Math.PI / 2
  hub.position.set(0, 0, forearmFrontZ + 0.44)
  group.add(hub)
  // Gold ring around the hub face.
  const hubRing = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.022, 8, 20), gold)
  hubRing.position.set(0, 0, forearmFrontZ + 0.6)
  group.add(hubRing)

  // 6 rotary barrels with stepped collars, ringed around the hub.
  const barrelMat = frameMat(PALETTE.frameSteelLight)
  const barrelLen = 1.5
  const muzzleZ = forearmFrontZ + 0.44 + barrelLen / 2
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2
    const bx = Math.cos(angle) * 0.14
    const by = Math.sin(angle) * 0.14

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, barrelLen, 8), barrelMat)
    barrel.rotation.x = Math.PI / 2
    barrel.position.set(bx, by, muzzleZ)
    group.add(barrel)

    // Stepped collar partway down for machined detail.
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.08, 8), steel)
    collar.rotation.x = Math.PI / 2
    collar.position.set(bx, by, forearmFrontZ + 0.7)
    group.add(collar)

    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.09, 8), steel)
    tip.rotation.x = Math.PI / 2
    tip.position.set(bx, by, forearmFrontZ + 0.44 + barrelLen)
    group.add(tip)
  }

  // Central barrel support shaft with glowing amber core peeking out the muzzle.
  const support = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, barrelLen * 0.95, 8), steel)
  support.rotation.x = Math.PI / 2
  support.position.set(0, 0, muzzleZ)
  group.add(support)
  const coreGlow = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), glowEyeMat(PALETTE.glowAmber))
  coreGlow.position.set(0, 0, forearmFrontZ + 0.5)
  group.add(coreGlow)

  // Ammo feed chute (red accent box) sloping in from the top, with trim.
  const feed = new THREE.Mesh(chamferBox(0.24, 0.52, 0.26, 0.04), accentRedMat())
  feed.position.set(0.18, 0.36, forearmFrontZ + 0.02)
  feed.rotation.z = -0.45
  group.add(feed)
  const feedTrim = edgeLine(0.5, { thickness: 0.018, mat: gold })
  feedTrim.rotation.z = -0.45 + Math.PI / 2
  feedTrim.position.set(0.31, 0.36, forearmFrontZ + 0.16)
  group.add(feedTrim)

  // Cooling vent slats on the breech side (cooling for sustained fire).
  const vent = ventSlats(4, 0.4, 0.3, { horizontal: true })
  vent.rotation.y = -Math.PI / 2
  vent.position.set(-0.35, 0, forearmFrontZ + 0.18)
  group.add(vent)

  return group
}

/* ------------------------------------------------------------------ */
/* RAILGUN — long dual rails + amber capacitor core                    */
/* ------------------------------------------------------------------ */

export function createRailgun(): THREE.Group {
  const group = new THREE.Group()
  const armor = armorMat()
  const mid = armorMat(PALETTE.armorMid)
  const steel = frameMat()
  const gold = trimGoldMat()

  const { group: arm, forearmFrontZ } = armShell({ armorMaterial: armor, midMaterial: mid, forearmLen: 0.7 })
  group.add(arm)

  // Capacitor housing — a tall layered charcoal block with gold trim.
  const housing = panelPlate(0.8, 0.68, 0.5, {
    baseMat: armor,
    topMat: mid,
    bevel: 0.07,
    raise: 0.06,
    trim: true,
  })
  housing.position.set(0, 0, forearmFrontZ + 0.22)
  group.add(housing)

  // Glowing amber capacitor core seated in a steel collar in the housing face.
  const coreCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.1, 16), steel)
  coreCollar.rotation.x = Math.PI / 2
  coreCollar.position.set(0, 0, forearmFrontZ + 0.46)
  group.add(coreCollar)
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), glowEyeMat(PALETTE.glowAmber))
  core.position.set(0, 0, forearmFrontZ + 0.5)
  group.add(core)

  // Top capacitor bank (raised charcoal cap) with gold edge piping.
  const cap = new THREE.Mesh(chamferBox(0.66, 0.2, 0.46, 0.05), mid)
  cap.position.set(0, 0.42, forearmFrontZ + 0.2)
  group.add(cap)
  for (const side of [-1, 1]) {
    const capLine = edgeLine(0.42, { thickness: 0.02, mat: gold })
    capLine.rotation.y = Math.PI / 2
    capLine.position.set(side * 0.31, 0.52, forearmFrontZ + 0.2)
    group.add(capLine)
  }

  // Dual parallel rails with amber accelerator coils.
  const railLen = 1.55
  const railZ = forearmFrontZ + 0.47 + railLen / 2
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(chamferBox(0.13, 0.13, railLen, 0.03), steel)
    rail.position.set(side * 0.18, 0, railZ)
    group.add(rail)

    // Thin gold strip down each rail.
    const line = edgeLine(railLen * 0.9, { thickness: 0.02, mat: gold })
    line.rotation.y = Math.PI / 2
    line.position.set(side * 0.18, 0.08, railZ)
    group.add(line)

    // Amber energy strip running the inner edge of each rail.
    const energy = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, railLen * 0.85), glowEyeMat(PALETTE.glowAmber))
    energy.position.set(side * 0.11, 0, railZ)
    group.add(energy)
  }

  // Top/bottom frame beams tying the rails together.
  for (const yPos of [0.13, -0.13]) {
    const beam = new THREE.Mesh(chamferBox(0.07, 0.07, railLen * 0.95, 0.02), steel)
    beam.position.set(0, yPos, railZ)
    group.add(beam)
  }

  // Amber accelerator coils ringing the rails, with steel mounting rings.
  for (let i = 0; i < 6; i++) {
    const ringZ = forearmFrontZ + 0.55 + i * 0.26
    const mount = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.018, 6, 16), steel)
    mount.position.set(0, 0, ringZ)
    group.add(mount)
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.032, 8, 16), glowEyeMat(PALETTE.glowAmber))
    coil.position.set(0, 0, ringZ)
    group.add(coil)
  }

  // Muzzle brake (chamfered charcoal block) with a steel vented tip.
  const muzzleZ = forearmFrontZ + 0.47 + railLen + 0.05
  const muzzle = new THREE.Mesh(chamferBox(0.46, 0.36, 0.18, 0.04), armor)
  muzzle.position.set(0, 0, muzzleZ)
  group.add(muzzle)
  for (const side of [-1, 1]) {
    const port = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.12), ventMat())
    port.position.set(side * 0.18, 0, muzzleZ)
    group.add(port)
  }

  // Red heat-sink slats on the housing sides.
  for (const side of [-1, 1]) {
    const vent = ventSlats(3, 0.22, 0.36)
    vent.rotation.y = (side * Math.PI) / 2
    vent.position.set(side * 0.4, 0.05, forearmFrontZ + 0.22)
    group.add(vent)
  }

  return group
}

/* ------------------------------------------------------------------ */
/* PILE DRIVER — hydraulic ram + heavy spike                           */
/* ------------------------------------------------------------------ */

export function createPileDriver(): THREE.Group {
  const group = new THREE.Group()
  const armor = armorMat()
  const mid = armorMat(PALETTE.armorMid)
  const steel = frameMat()
  const steelLight = frameMat(PALETTE.frameSteelLight)
  const gold = trimGoldMat()

  const { group: arm, forearmFrontZ } = armShell({ armorMaterial: armor, midMaterial: mid, forearmLen: 0.75, bulk: 1.15 })
  group.add(arm)

  // Heavy hydraulic housing — chunky layered charcoal block with gold trim.
  const housing = panelPlate(0.84, 0.84, 0.46, {
    baseMat: armor,
    topMat: mid,
    bevel: 0.08,
    raise: 0.06,
    trim: true,
  })
  housing.rotation.x = Math.PI / 2
  housing.position.set(0, 0, forearmFrontZ + 0.2)
  group.add(housing)

  // Gold ring framing the cylinder mouth.
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 8, 20), gold)
  collar.position.set(0, 0, forearmFrontZ + 0.42)
  group.add(collar)

  // Hydraulic cylinder (tapered steel) driving the ram.
  const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.27, 0.95, 16), steel)
  cylinder.rotation.x = Math.PI / 2
  cylinder.position.set(0, 0, forearmFrontZ + 0.65)
  group.add(cylinder)
  // Amber pressure indicator on the cylinder side.
  const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 12), glowEyeMat(PALETTE.glowAmber))
  gauge.rotation.z = Math.PI / 2
  gauge.position.set(0.24, 0, forearmFrontZ + 0.55)
  group.add(gauge)

  // Exposed ram shaft (bright steel) protruding from the cylinder.
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 12), steelLight)
  shaft.rotation.x = Math.PI / 2
  shaft.position.set(0, 0, forearmFrontZ + 1.18)
  group.add(shaft)

  // Heavy faceted spike tip with a steel base flange.
  const spikeBase = forearmFrontZ + 1.4
  const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.1, 8), steel)
  flange.rotation.x = Math.PI / 2
  flange.position.set(0, 0, spikeBase)
  group.add(flange)
  const spike = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.72, 6), steelLight)
  spike.rotation.x = -Math.PI / 2
  spike.position.set(0, 0, spikeBase + 0.36)
  group.add(spike)

  // External hydraulic lines around the cylinder.
  for (let i = 0; i < 3; i++) {
    const line = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.85, 6), steel)
    const a = (i * Math.PI * 2) / 3 + Math.PI / 6
    line.rotation.x = Math.PI / 2
    line.position.set(Math.cos(a) * 0.34, Math.sin(a) * 0.34, forearmFrontZ + 0.6)
    group.add(line)
  }

  // Red warning slats on the housing front face, framed in gold.
  const warn = ventSlats(3, 0.5, 0.16, { horizontal: true })
  warn.position.set(0, -0.34, forearmFrontZ + 0.42)
  group.add(warn)
  const warnFrame = trimStripe(0.54, 0.2, { thickness: 0.018, mat: gold })
  warnFrame.position.set(0, -0.34, forearmFrontZ + 0.44)
  group.add(warnFrame)

  return group
}

/* ------------------------------------------------------------------ */
/* MISSILE POD — 2x3 tube cluster                                      */
/* ------------------------------------------------------------------ */

export function createMissilePod(): THREE.Group {
  const group = new THREE.Group()
  const armor = armorMat()
  const mid = armorMat(PALETTE.armorMid)
  const steel = frameMat()
  const gold = trimGoldMat()

  const { group: arm, forearmFrontZ } = armShell({ armorMaterial: armor, midMaterial: mid, forearmLen: 0.7, bulk: 1.15 })
  group.add(arm)

  // Pod box — layered charcoal housing with gold trim around the launch face.
  const podDepth = 0.55
  const pod = panelPlate(1.0, 0.8, podDepth, {
    baseMat: armor,
    topMat: mid,
    bevel: 0.07,
    raise: 0.05,
    trim: true,
  })
  const podZ = forearmFrontZ + podDepth / 2 + 0.05
  pod.position.set(0, 0, podZ)
  group.add(pod)

  // Hinged top blast lid, raised and tilted back, overlapping the pod crown.
  const lid = new THREE.Mesh(chamferBox(0.98, 0.16, 0.5, 0.04), mid)
  lid.position.set(0, 0.46, podZ - 0.12)
  lid.rotation.x = -0.4
  group.add(lid)
  const lidTrim = edgeLine(0.9, { thickness: 0.02, mat: gold })
  lidTrim.position.set(0, 0.52, podZ - 0.02)
  lidTrim.rotation.x = -0.4
  group.add(lidTrim)

  // Gold piping framing the whole launch face.
  const faceZ = podZ + podDepth / 2 + 0.02
  const faceFrame = trimStripe(0.98, 0.78, { thickness: 0.026, mat: gold })
  faceFrame.position.set(0, 0, faceZ)
  group.add(faceFrame)

  // 6 missile tubes (2 rows x 3 cols) recessed into the face.
  const tubeMat = frameMat(PALETTE.frameSteelLight)
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const x = (col - 1) * 0.3
      const y = (row - 0.5) * 0.34

      // Dark recessed cavity backing so each tube reads as a deep hole.
      const cavity = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 12), ventMat())
      cavity.rotation.x = Math.PI / 2
      cavity.position.set(x, y, faceZ - 0.06)
      group.add(cavity)

      // Tube ring (steel rim).
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.12, 12), steel)
      ring.rotation.x = Math.PI / 2
      ring.position.set(x, y, faceZ + 0.02)
      group.add(ring)

      // Visible missile nose (red accent) tipped with a tiny amber seeker.
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.16, 10), accentRedMat())
      nose.rotation.x = -Math.PI / 2
      nose.position.set(x, y, faceZ - 0.02)
      group.add(nose)
      const seeker = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), glowEyeMat(PALETTE.glowAmber))
      seeker.position.set(x, y, faceZ + 0.07)
      group.add(seeker)

      // Tube cavity backing.
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.4, 10), tubeMat)
      tube.rotation.x = Math.PI / 2
      tube.position.set(x, y, podZ)
      group.add(tube)
    }
  }

  // Rivets along the top and bottom edges of the pod.
  const rivetsTop = riveting(5, 0.2, { radius: 0.022 })
  rivetsTop.position.set(0, 0.34, faceZ)
  group.add(rivetsTop)
  const rivetsBot = riveting(5, 0.2, { radius: 0.022 })
  rivetsBot.position.set(0, -0.34, faceZ)
  group.add(rivetsBot)

  return group
}

/* ------------------------------------------------------------------ */
/* FLAMETHROWER — wide nozzle + side fuel tanks                        */
/* ------------------------------------------------------------------ */

export function createFlamethrower(): THREE.Group {
  const group = new THREE.Group()
  const armor = armorMat()
  const mid = armorMat(PALETTE.armorMid)
  const steel = frameMat()
  const gold = trimGoldMat()

  const { group: arm, forearmFrontZ } = armShell({ armorMaterial: armor, midMaterial: mid, forearmLen: 0.7 })
  group.add(arm)

  // Pump housing — layered charcoal block with gold trim.
  const housing = panelPlate(0.72, 0.62, 0.4, {
    baseMat: armor,
    topMat: mid,
    bevel: 0.06,
    raise: 0.05,
    trim: true,
  })
  housing.position.set(0, 0, forearmFrontZ + 0.18)
  group.add(housing)

  // Main barrel (tapered steel).
  const barrelLen = 1.2
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.19, barrelLen, 12), steel)
  barrel.rotation.x = Math.PI / 2
  barrel.position.set(0, 0, forearmFrontZ + 0.38 + barrelLen / 2)
  group.add(barrel)

  // Heat shroud (chamfered armor sleeve) around the barrel base, with red vents.
  const shroud = new THREE.Mesh(chamferBox(0.42, 0.42, 0.46, 0.05), mid)
  shroud.position.set(0, 0, forearmFrontZ + 0.5)
  group.add(shroud)
  const shroudVent = ventSlats(4, 0.32, 0.32, { horizontal: true })
  shroudVent.position.set(0, 0, forearmFrontZ + 0.74)
  group.add(shroudVent)

  // Wide steel nozzle with a gold lip ring and a glowing amber pilot flame.
  const nozzleZ = forearmFrontZ + 0.38 + barrelLen
  const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.4, 14), steel)
  nozzle.rotation.x = Math.PI / 2
  nozzle.position.set(0, 0, nozzleZ + 0.05)
  group.add(nozzle)
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.022, 8, 20), gold)
  lip.position.set(0, 0, nozzleZ + 0.22)
  group.add(lip)
  const pilot = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.32, 12), glowEyeMat(PALETTE.glowAmber))
  pilot.rotation.x = -Math.PI / 2
  pilot.position.set(0, 0, nozzleZ + 0.2)
  group.add(pilot)

  // Two side fuel tanks (capsules) with red intake slats and steel end caps.
  for (const side of [-1, 1]) {
    const tank = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.8, 8, 12), armor)
    tank.rotation.x = Math.PI / 2
    tank.position.set(side * 0.36, -0.05, forearmFrontZ + 0.35)
    group.add(tank)

    // Steel banding rings on each tank for a pressure-vessel read.
    for (const z of [forearmFrontZ + 0.1, forearmFrontZ + 0.6]) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.02, 6, 14), steel)
      band.position.set(side * 0.36, -0.05, z)
      group.add(band)
    }

    const slats = ventSlats(3, 0.16, 0.3)
    slats.rotation.y = (side * Math.PI) / 2
    slats.position.set(side * 0.49, -0.05, forearmFrontZ + 0.35)
    group.add(slats)
  }

  return group
}

/* ------------------------------------------------------------------ */
/* SHIELD GENERATOR — amber projector dish on a forearm                */
/* ------------------------------------------------------------------ */

export function createShieldGenerator(): THREE.Group {
  const group = new THREE.Group()
  const armor = armorMat()
  const mid = armorMat(PALETTE.armorMid)
  const steel = frameMat()
  const gold = trimGoldMat()

  const { group: arm, forearmFrontZ } = armShell({ armorMaterial: armor, midMaterial: mid, forearmLen: 0.7, bulk: 0.9 })
  group.add(arm)

  // Emitter housing — layered charcoal block with gold trim.
  const housing = panelPlate(0.74, 0.74, 0.42, {
    baseMat: armor,
    topMat: mid,
    bevel: 0.07,
    raise: 0.06,
    trim: true,
  })
  housing.position.set(0, 0, forearmFrontZ + 0.2)
  group.add(housing)

  // Steel emitter ring (the dish mount).
  const ringZ = forearmFrontZ + 0.5
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 12, 28), steel)
  ring.position.set(0, 0, ringZ)
  group.add(ring)

  // Gold trim ring just inside the emitter ring.
  const goldRing = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.025, 8, 28), gold)
  goldRing.position.set(0, 0, ringZ + 0.02)
  group.add(goldRing)

  // Amber projector dish (half-sphere) glowing inside the ring.
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 12, 0, Math.PI), glowEyeMat(PALETTE.glowAmber))
  dish.rotation.x = -Math.PI / 2
  dish.position.set(0, 0, ringZ + 0.04)
  group.add(dish)
  // Bright amber focal node at the dish center.
  const node = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), glowEyeMat(PALETTE.glowAmber))
  node.position.set(0, 0, ringZ + 0.22)
  group.add(node)

  // Three steel projector prongs spaced around the dish, gold-capped.
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3 - Math.PI / 2
    const px = Math.cos(a) * 0.42
    const py = Math.sin(a) * 0.42
    const prong = new THREE.Mesh(chamferBox(0.1, 0.1, 0.34, 0.03), steel)
    prong.position.set(px, py, ringZ + 0.12)
    prong.rotation.set(Math.sin(a) * 0.3, -Math.cos(a) * 0.3, 0)
    group.add(prong)
    const tipNode = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), glowEyeMat(PALETTE.glowAmber))
    tipNode.position.set(px * 1.08, py * 1.08, ringZ + 0.28)
    group.add(tipNode)
  }

  // Red status slats on the housing underside, gold-framed.
  const slats = ventSlats(3, 0.4, 0.14, { horizontal: true })
  slats.position.set(0, -0.34, forearmFrontZ + 0.4)
  group.add(slats)
  const slatFrame = trimStripe(0.44, 0.18, { thickness: 0.016, mat: gold })
  slatFrame.position.set(0, -0.34, forearmFrontZ + 0.42)
  group.add(slatFrame)

  return group
}
