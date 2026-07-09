/**
 * JUGGERNAUT — a hulking heavy-assault mech, built from scratch.
 *
 * Silhouette: massively wide layered shoulder pauldrons crown a thick tiered
 * chest with a glowing red central vent. Stubby, powerful legs plant on broad
 * clawed feet. A small head is sunk deep between the shoulders. Twin boxy
 * shoulder-mounted weapon pods (a missile rack + a twin cannon) finish the
 * brutal, top-heavy mass. Everything is oversized and blocky.
 *
 * Coordinate frame: stands on y=0, centered on x/z=0, faces +Z. Up is +Y.
 */

import * as THREE from 'three'
import {
  PALETTE, armorMat, frameMat, accentRedMat, trimGoldMat, glowEyeMat, ventMat,
  chamferBox, panelPlate, trimStripe, edgeLine, ventSlats, bolt, riveting,
} from '../procedural/detailing'

/* ------------------------------------------------------------------ */
/* Small local helpers                                                 */
/* ------------------------------------------------------------------ */

/** A chamfered armor plate mesh in one call. */
function plate(w: number, h: number, d: number, mat: THREE.Material, bevel?: number): THREE.Mesh {
  return new THREE.Mesh(chamferBox(w, h, d, bevel), mat)
}

/** A forward-pointing metallic claw (cone tip toward +Z). */
function claw(radius: number, length: number): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.ConeGeometry(radius, length, 5), frameMat(PALETTE.frameSteelLight))
  m.rotation.x = Math.PI / 2 // tip -> +Z
  return m
}

/* ------------------------------------------------------------------ */
/* Legs — stubby, broad clawed feet                                    */
/* ------------------------------------------------------------------ */

function buildLeg(side: 1 | -1): THREE.Group {
  const leg = new THREE.Group()
  leg.name = side < 0 ? 'leg-left' : 'leg-right'

  // Hip ball joint (exposed steel).
  const hip = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10), frameMat())
  hip.position.y = 1.72
  leg.add(hip)

  // Thigh — thick tapered block.
  const thigh = plate(0.86, 0.78, 0.94, armorMat())
  thigh.position.y = 1.36
  leg.add(thigh)
  // Outer thigh guard plate, canted outward for bulk.
  const thighGuard = plate(0.36, 0.72, 0.86, armorMat(PALETTE.armorMid))
  thighGuard.position.set(side * 0.5, 1.34, 0)
  thighGuard.rotation.z = side * -0.12
  leg.add(thighGuard)
  const thighRivets = riveting(3, 0.2, { radius: 0.03 })
  thighRivets.position.set(0, 1.34, 0.48)
  leg.add(thighRivets)

  // Knee — steel piston joint + red knee guard.
  const knee = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.9, 12), frameMat())
  knee.rotation.z = Math.PI / 2
  knee.position.y = 1.0
  leg.add(knee)
  const kneeGuard = plate(0.6, 0.42, 0.28, accentRedMat())
  kneeGuard.position.set(0, 1.0, 0.52)
  leg.add(kneeGuard)
  const kneeTrim = trimStripe(0.5, 0.34, { thickness: 0.03 })
  kneeTrim.position.set(0, 1.0, 0.67)
  leg.add(kneeTrim)

  // Shin — flares wider toward the foot (two stacked tiers).
  const shinUpper = plate(0.9, 0.55, 0.98, armorMat())
  shinUpper.position.y = 0.72
  leg.add(shinUpper)
  const shinLower = plate(1.02, 0.5, 1.06, armorMat(PALETTE.armorMid))
  shinLower.position.y = 0.4
  leg.add(shinLower)
  // Shin cooling vents (red intakes).
  const shinVent = ventSlats(4, 0.62, 0.36, { depth: 0.06 })
  shinVent.position.set(0, 0.66, 0.52)
  leg.add(shinVent)
  // Piston running down the back of the shin.
  const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.85, 8), frameMat(PALETTE.frameSteelLight))
  piston.position.set(side * 0.28, 0.6, -0.5)
  leg.add(piston)

  // Ankle joint.
  const ankle = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), frameMat())
  ankle.position.y = 0.24
  leg.add(ankle)

  // Broad clawed foot.
  const foot = new THREE.Group()
  foot.name = leg.name + '-foot'
  const sole = plate(1.16, 0.24, 1.5, armorMat(), 0.05)
  sole.position.set(0, 0.12, 0.12)
  foot.add(sole)
  const toeGuard = plate(1.1, 0.3, 0.5, armorMat(PALETTE.armorMid))
  toeGuard.position.set(0, 0.18, 0.78)
  foot.add(toeGuard)
  // Three forward claws + one rear spur.
  const clawXs = [-0.36, 0, 0.36]
  for (const cx of clawXs) {
    const c = claw(0.13, 0.5)
    c.position.set(cx, 0.1, 1.02)
    foot.add(c)
  }
  const heel = claw(0.11, 0.36)
  heel.position.set(0, 0.1, -0.62)
  heel.rotation.x = -Math.PI / 2 // rear-facing
  foot.add(heel)
  const footRivets = riveting(4, 0.22, { radius: 0.028 })
  footRivets.position.set(0, 0.25, 0.5)
  foot.add(footRivets)
  foot.position.y = 0
  leg.add(foot)

  // Whole leg planted; hips ±0.78.
  leg.position.set(side * 0.78, 0, 0)
  return leg
}

/* ------------------------------------------------------------------ */
/* Torso — thick tiered chest, big red central vent                    */
/* ------------------------------------------------------------------ */

function buildTorso(): THREE.Group {
  const torso = new THREE.Group()
  torso.name = 'torso'

  // Pelvis / waist block bridging the hips.
  const pelvis = plate(1.7, 0.6, 1.1, armorMat(PALETTE.armorMid))
  pelvis.position.y = 1.78
  torso.add(pelvis)
  const codpiece = plate(0.5, 0.5, 0.5, armorMat())
  codpiece.position.set(0, 1.62, 0.55)
  torso.add(codpiece)
  const beltTrim = trimStripe(1.5, 0.4, { thickness: 0.035 })
  beltTrim.position.set(0, 1.82, 0.56)
  torso.add(beltTrim)

  // Lower chest tier.
  const chestLow = plate(1.9, 0.62, 1.24, armorMat())
  chestLow.position.y = 2.32
  torso.add(chestLow)

  // Upper chest tier — wider, layered proud of the lower tier.
  const chestHigh = plate(2.18, 0.82, 1.42, armorMat(PALETTE.armorMid))
  chestHigh.position.set(0, 2.95, 0.02)
  torso.add(chestHigh)

  // Big red central intake vent, framed and recessed into the chest.
  const ventHousing = plate(0.86, 0.9, 0.24, frameMat())
  ventHousing.position.set(0, 2.5, 0.66)
  torso.add(ventHousing)
  const centralVent = ventSlats(6, 0.66, 0.74, { depth: 0.1 })
  centralVent.position.set(0, 2.5, 0.78)
  torso.add(centralVent)
  const ventTrim = trimStripe(0.82, 0.86, { thickness: 0.04 })
  ventTrim.position.set(0, 2.5, 0.8)
  torso.add(ventTrim)
  // Twin amber glow slots flanking the vent (small emissive accents).
  for (const gx of [-0.62, 0.62]) {
    const glow = plate(0.12, 0.5, 0.06, glowEyeMat())
    glow.position.set(gx, 2.5, 0.74)
    torso.add(glow)
  }

  // Layered collar plates that the pauldrons and head nest against.
  const collar = plate(1.5, 0.4, 1.2, armorMat())
  collar.position.set(0, 3.5, -0.02)
  torso.add(collar)
  const collarRivets = riveting(5, 0.24, { radius: 0.03 })
  collarRivets.position.set(0, 3.5, 0.58)
  torso.add(collarRivets)

  // Back power spine / heat sink.
  const spine = plate(0.7, 1.3, 0.5, armorMat(PALETTE.armorMid))
  spine.position.set(0, 2.7, -0.8)
  torso.add(spine)
  const spineVent = ventSlats(5, 0.5, 0.9, { depth: 0.06, slatMat: frameMat(PALETTE.frameSteelLight) })
  spineVent.position.set(0, 2.7, -1.06)
  spineVent.rotation.y = Math.PI
  torso.add(spineVent)

  return torso
}

/* ------------------------------------------------------------------ */
/* Head — small, recessed, sunk between the shoulders                  */
/* ------------------------------------------------------------------ */

function buildHead(): THREE.Group {
  const head = new THREE.Group()
  head.name = 'head'

  // Neck stub, mostly buried.
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.3, 10), frameMat())
  neck.position.y = -0.2
  head.add(neck)

  // Compact armored skull, cowl brow overhanging the visor.
  const skull = plate(0.62, 0.5, 0.6, armorMat())
  head.add(skull)
  const brow = plate(0.7, 0.2, 0.4, armorMat(PALETTE.armorMid))
  brow.position.set(0, 0.22, 0.22)
  brow.rotation.x = -0.25
  head.add(brow)

  // Single amber optic band under the brow (emissive accent).
  const visor = plate(0.46, 0.12, 0.1, glowEyeMat())
  visor.position.set(0, 0.02, 0.3)
  head.add(visor)
  const visorTrim = edgeLine(0.5, { thickness: 0.03 })
  visorTrim.position.set(0, -0.08, 0.32)
  head.add(visorTrim)

  // Side ear housings.
  for (const sx of [-1, 1]) {
    const ear = plate(0.12, 0.3, 0.34, frameMat())
    ear.position.set(sx * 0.36, 0, 0)
    head.add(ear)
  }

  // Sunk between the shoulders: low y, pulled back into the collar.
  head.position.set(0, 3.42, 0.12)
  return head
}

/* ------------------------------------------------------------------ */
/* Shoulders — massive layered pauldrons                               */
/* ------------------------------------------------------------------ */

function buildShoulder(side: 1 | -1): THREE.Group {
  const sh = new THREE.Group()
  sh.name = side < 0 ? 'shoulder-left' : 'shoulder-right'

  // Shoulder ball socket into the torso.
  const socket = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 10), frameMat())
  sh.add(socket)

  // Layered pauldron: three descending, outward-canted armor tiers.
  const cap = new THREE.Group()
  cap.name = sh.name + '-cap'

  const tier1 = panelPlate(1.5, 0.66, 1.6, { inset: 0.16, raise: 0.05, trim: true })
  tier1.position.set(side * 0.35, 0.42, 0)
  tier1.rotation.z = side * -0.16
  cap.add(tier1)

  const tier2 = plate(1.34, 0.5, 1.5, armorMat())
  tier2.position.set(side * 0.55, 0.02, 0)
  tier2.rotation.z = side * -0.22
  cap.add(tier2)

  const tier3 = plate(1.1, 0.44, 1.34, armorMat(PALETTE.armorMid))
  tier3.position.set(side * 0.66, -0.36, 0)
  tier3.rotation.z = side * -0.26
  cap.add(tier3)

  // Red slash accent + rivet line along the leading edge of the top tier.
  const slash = plate(0.9, 0.14, 0.1, accentRedMat())
  slash.position.set(side * 0.4, 0.5, 0.8)
  slash.rotation.z = side * -0.16
  cap.add(slash)
  const capRivets = riveting(4, 0.28, { radius: 0.035 })
  capRivets.position.set(side * 0.4, 0.66, 0.4)
  capRivets.rotation.z = side * -0.16
  cap.add(capRivets)
  const capEdge = edgeLine(1.4, { thickness: 0.035 })
  capEdge.position.set(side * 0.4, 0.24, 0.82)
  capEdge.rotation.z = side * -0.16
  cap.add(capEdge)

  sh.add(cap)

  // Mount over the torso, high and very wide.
  sh.position.set(side * 1.28, 3.2, 0)
  return sh
}

/* ------------------------------------------------------------------ */
/* Shoulder weapon pods — twin boxy missile / cannon                   */
/* ------------------------------------------------------------------ */

/** Boxy missile rack: a 3x2 grid of dark tubes in a framed housing. */
function buildMissilePod(): THREE.Group {
  const pod = new THREE.Group()
  pod.name = 'pod-missile'

  const housing = plate(0.78, 0.66, 1.15, armorMat(PALETTE.armorMid))
  pod.add(housing)
  const housingTrim = trimStripe(0.64, 0.52, { thickness: 0.03 })
  housingTrim.position.set(0, 0, 0.58)
  pod.add(housingTrim)

  // Tube grid on the +Z face.
  const cols = [-0.2, 0.2]
  const rows = [-0.18, 0.0, 0.18]
  for (const cx of cols) {
    for (const ry of rows) {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.14, 10), frameMat())
      ring.rotation.x = Math.PI / 2
      ring.position.set(cx, ry, 0.56)
      pod.add(ring)
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.16, 10), ventMat())
      hole.rotation.x = Math.PI / 2
      hole.position.set(cx, ry, 0.58)
      pod.add(hole)
    }
  }
  const podRivets = riveting(3, 0.24, { radius: 0.03 })
  podRivets.position.set(0, -0.36, 0.2)
  pod.add(podRivets)

  return pod
}

/** Boxy twin-cannon pod: housing with two heavy forward barrels. */
function buildCannonPod(): THREE.Group {
  const pod = new THREE.Group()
  pod.name = 'pod-cannon'

  const housing = plate(0.8, 0.7, 1.0, armorMat(PALETTE.armorMid))
  pod.add(housing)
  const backVent = ventSlats(4, 0.6, 0.5, { depth: 0.06, slatMat: frameMat(PALETTE.frameSteelLight) })
  backVent.position.set(0, 0, -0.52)
  backVent.rotation.y = Math.PI
  pod.add(backVent)

  for (const bx of [-0.2, 0.2]) {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 1.2, 12), frameMat())
    barrel.rotation.x = Math.PI / 2
    barrel.position.set(bx, 0.02, 0.62)
    pod.add(barrel)
    const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.18, 12), armorMat())
    muzzle.rotation.x = Math.PI / 2
    muzzle.position.set(bx, 0.02, 1.2)
    pod.add(muzzle)
    const bore = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 10), ventMat())
    bore.rotation.x = Math.PI / 2
    bore.position.set(bx, 0.02, 1.26)
    pod.add(bore)
  }
  const podTrim = edgeLine(0.7, { thickness: 0.03 })
  podTrim.position.set(0, 0.32, 0.5)
  pod.add(podTrim)

  return pod
}

/* ------------------------------------------------------------------ */
/* Arms — heavy, blocky, oversized fists                               */
/* ------------------------------------------------------------------ */

function buildArm(side: 1 | -1): THREE.Group {
  const arm = new THREE.Group()
  arm.name = side < 0 ? 'arm-left' : 'arm-right'

  // Upper arm actuator + armor.
  const shoulderJoint = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), frameMat())
  shoulderJoint.position.y = 2.9
  arm.add(shoulderJoint)
  const upper = plate(0.56, 0.82, 0.62, armorMat())
  upper.position.y = 2.55
  arm.add(upper)

  // Elbow.
  const elbow = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.66, 12), frameMat())
  elbow.rotation.z = Math.PI / 2
  elbow.position.y = 2.16
  arm.add(elbow)

  // Forearm — bulky, wider than the upper arm.
  const forearm = plate(0.72, 0.92, 0.8, armorMat(PALETTE.armorMid))
  forearm.position.y = 1.72
  arm.add(forearm)
  const foreVent = ventSlats(3, 0.44, 0.4, { depth: 0.05 })
  foreVent.position.set(side * 0.32, 1.78, 0.24)
  foreVent.rotation.y = side * 0.4
  arm.add(foreVent)
  const foreRivets = riveting(3, 0.22, { radius: 0.03 })
  foreRivets.position.set(0, 1.9, 0.42)
  arm.add(foreRivets)

  // Oversized blocky fist / breacher knuckle.
  const fist = plate(0.78, 0.62, 0.86, armorMat())
  fist.position.y = 1.18
  arm.add(fist)
  // Knuckle spikes on the front of the fist.
  for (const kx of [-0.24, 0, 0.24]) {
    const spike = claw(0.1, 0.34)
    spike.position.set(kx, 1.18, 0.46)
    arm.add(spike)
  }
  const fistTrim = trimStripe(0.6, 0.44, { thickness: 0.03 })
  fistTrim.position.set(0, 1.18, 0.45)
  arm.add(fistTrim)

  // Arms hang just outboard of the pauldrons.
  arm.position.set(side * 1.55, 0, 0)
  arm.rotation.z = side * 0.05
  return arm
}

/* ------------------------------------------------------------------ */
/* Assembly                                                            */
/* ------------------------------------------------------------------ */

export function createJuggernautMech(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'juggernaut'

  root.add(buildLeg(-1))
  root.add(buildLeg(1))
  root.add(buildTorso())
  root.add(buildHead())

  const shoulderL = buildShoulder(-1)
  const shoulderR = buildShoulder(1)
  // Weapon pods ride on top of the pauldrons.
  const missile = buildMissilePod()
  missile.position.set(0.15, 0.85, -0.05)
  missile.rotation.z = 0.16
  shoulderL.add(missile)
  const cannon = buildCannonPod()
  cannon.position.set(-0.15, 0.85, -0.05)
  cannon.rotation.z = -0.16
  shoulderR.add(cannon)
  root.add(shoulderL)
  root.add(shoulderR)

  root.add(buildArm(-1))
  root.add(buildArm(1))

  // Enforce shadows on every mesh in one pass.
  root.traverse((obj: THREE.Object3D) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = true
      obj.receiveShadow = true
    }
  })

  return root
}
