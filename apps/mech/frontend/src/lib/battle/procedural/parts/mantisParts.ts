/**
 * MANTIS modular parts — the bespoke insectoid-raptor showcase Mantis
 * decomposed into the game's slot system so its pieces interoperate with the
 * rest of the catalogue.
 *
 * Each builder is authored in its slot's LOCAL frame so it drops straight onto
 * the shared skeleton:
 *   - LEGS  → group at MODEL_ATTACH_POINTS.legs (0,0,0); pivots 'leg-left' /
 *     'leg-right' at the hips (world y≈2.6) with all geometry hanging below to
 *     the foot sole at local y≈-2.6 (feet on the ground).
 *   - CORE  → group at (0,2.8,0); waist at local y≈-0.3, shoulders at +1.05,
 *     neck stub at top (world≈4.4).
 *   - HEAD  → group at (0,4.8,0); small mandibled skull around the origin.
 *   - ARM   → group at (±1.3,3.8,0); hangs DOWN from the shoulder joint, blade
 *     at the bottom/front, roughly centred on x so it mirrors.
 *   - RACK  → group at (0,4.2,-0.5); segmented carapace back shell.
 *
 * Silhouette (forward-pitched thorax, clustered eyes, reverse-joint raptor
 * legs, serrated scythe blade, segmented dorsal carapace) is re-authored from
 * the bespoke showcase mantis but rebuilt per slot with the shared toolkit.
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
  riveting,
} from '../detailing'

/* ------------------------------------------------------------------ */
/* small local helpers                                                 */
/* ------------------------------------------------------------------ */

const Y_AXIS = new THREE.Vector3(0, 1, 0)

/** A chamfered-box mesh (crisp armor plate). */
function plate(w: number, h: number, d: number, mat: THREE.Material, bevel?: number): THREE.Mesh {
  return new THREE.Mesh(chamferBox(w, h, d, bevel), mat)
}

/** A chamfered strut spanning two local points, long axis aligned a→b. */
function strut(
  a: THREE.Vector3,
  b: THREE.Vector3,
  thickness: number,
  depth: number,
  mat: THREE.Material,
  bevel?: number
): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(b, a)
  const len = Math.max(dir.length(), 1e-3)
  const m = new THREE.Mesh(
    chamferBox(thickness, len, depth, bevel ?? Math.min(thickness, depth) * 0.28),
    mat
  )
  m.position.copy(a).addScaledVector(dir, 0.5)
  m.quaternion.setFromUnitVectors(Y_AXIS, dir.multiplyScalar(1 / len))
  return m
}

/** An exposed-frame joint knuckle. */
function joint(radius: number): THREE.Mesh {
  return new THREE.Mesh(new THREE.IcosahedronGeometry(radius, 1), frameMat(PALETTE.frameSteelLight))
}

/** A sharp four-sided pyramid claw/spike, base at origin, tip along +Y. */
function spike(baseR: number, length: number, mat: THREE.Material): THREE.Mesh {
  const geo = new THREE.ConeGeometry(baseR, length, 4, 1)
  geo.translate(0, length / 2, 0)
  return new THREE.Mesh(geo, mat)
}

/* ------------------------------------------------------------------ */
/* LEGS — reverse-joint digitigrade raptor                             */
/* ------------------------------------------------------------------ */

/** Hip pivot height in the legs-slot local frame (matches the stock frame). */
const HIP_Y = 2.6
/** Lateral hip offset — a narrow, sprinter's stance. */
const HIP_X = 0.5

/**
 * One reverse-joint raptor leg. Pivot origin is the HIP; +Z is forward.
 * Chain: hip → femur (down & FORWARD) → knee (juts forward) → tibia (down &
 * BACK) → ankle → metatarsus (forward) → splayed talon foot whose sole sits at
 * local y≈-2.55 (world≈0).
 */
function buildLeg(side: -1 | 1): THREE.Group {
  const leg = new THREE.Group()
  leg.name = side === -1 ? 'leg-left' : 'leg-right'
  leg.position.set(side * HIP_X, HIP_Y, 0)

  const armor = armorMat()
  const armorMid = armorMat(PALETTE.armorMid)
  const frame = frameMat()
  const clawMat = frameMat(PALETTE.frameSteelLight)

  const hip = new THREE.Vector3(0, 0, 0)
  const knee = new THREE.Vector3(0.1 * side, -1.0, 0.5)
  const ankle = new THREE.Vector3(0.05 * side, -1.9, -0.28)
  const toeBase = new THREE.Vector3(0.02 * side, -2.4, 0.34)

  // Hip — chunky armored ball socket + collar.
  const hipHousing = plate(0.46, 0.46, 0.46, armorMid, 0.11)
  hipHousing.position.copy(hip)
  leg.add(hipHousing)
  const hipJoint = joint(0.2)
  hipJoint.position.copy(hip)
  leg.add(hipJoint)
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 6, 14), frame)
  collar.rotation.y = Math.PI / 2
  leg.add(collar)

  // Femur — thick, drives down & forward to the knee.
  const femur = strut(hip, knee, 0.38, 0.34, armor, 0.09)
  leg.add(femur)
  const thighPlate = panelPlate(0.32, 0.66, 0.1, { trim: true })
  thighPlate.position.copy(hip.clone().lerp(knee, 0.5))
  thighPlate.position.z += 0.23
  thighPlate.rotation.x = -0.48
  leg.add(thighPlate)

  // Knee — exposed joint + a forward red guard fin (reverse-joint signature).
  const kneeJoint = joint(0.19)
  kneeJoint.position.copy(knee)
  leg.add(kneeJoint)
  const kneeFin = plate(0.2, 0.34, 0.46, accentRedMat(), 0.06)
  kneeFin.position.copy(knee).add(new THREE.Vector3(0, 0.02, 0.22))
  kneeFin.rotation.x = 0.34
  leg.add(kneeFin)

  // Tibia — sweeps back down to the raised ankle.
  const tibia = strut(knee, ankle, 0.28, 0.28, armorMid, 0.08)
  leg.add(tibia)
  // A trio of exposed piston lines running the shin.
  for (let i = -1; i <= 1; i++) {
    const piston = strut(
      knee.clone().add(new THREE.Vector3(0.09 * i, -0.02, -0.14)),
      ankle.clone().add(new THREE.Vector3(0.09 * i, 0.02, -0.14)),
      0.05,
      0.05,
      frame
    )
    leg.add(piston)
  }

  // Ankle joint.
  const ankleJoint = joint(0.16)
  ankleJoint.position.copy(ankle)
  leg.add(ankleJoint)

  // Metatarsus ("foot bone") — pitches forward to the toe base so the talon
  // carries the mass out over the toes (digitigrade stance, foot never floats).
  const meta = strut(ankle, toeBase, 0.24, 0.24, armor, 0.07)
  leg.add(meta)

  // Foot pad + splayed forward talon claws. Sole rests near local y≈-2.55.
  const foot = new THREE.Group()
  foot.name = 'foot'
  foot.position.copy(toeBase)
  leg.add(foot)
  const pad = plate(0.4, 0.14, 0.48, armorMid, 0.05)
  pad.position.set(0, -0.06, 0.08)
  foot.add(pad)
  for (let i = -1; i <= 1; i++) {
    const claw = spike(0.07, 0.4, clawMat)
    claw.position.set(0.13 * i, -0.09, 0.28)
    claw.rotation.x = Math.PI * 0.62
    claw.rotation.z = -0.12 * i
    foot.add(claw)
  }
  // Rear dew-spur (killing claw) curling back and down.
  const spur = spike(0.065, 0.34, clawMat)
  spur.position.set(0, -0.04, -0.2)
  spur.rotation.x = Math.PI * 1.35
  foot.add(spur)

  // Amber sensor dot on the outer ankle.
  const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), glowEyeMat())
  sensor.position.copy(ankle).add(new THREE.Vector3(0.13 * side, 0.1, 0.02))
  leg.add(sensor)

  // Rivet row on the femur housing.
  const rivets = riveting(3, 0.12, { radius: 0.02 })
  rivets.position.copy(hip).add(new THREE.Vector3(0, -0.2, 0.24))
  rivets.rotation.x = -0.48
  leg.add(rivets)

  return leg
}

/** Reverse-joint raptor legs slot part (id: legs-mantis-raptor). */
export function createMantisLegs(): THREE.Group {
  const legs = new THREE.Group()

  // Pelvis yoke tying the hips together, just under the core attach (2.8).
  const pelvis = plate(0.96, 0.5, 0.66, armorMat(PALETTE.armorMid), 0.11)
  pelvis.position.set(0, HIP_Y + 0.06, -0.06)
  legs.add(pelvis)
  const pelvisTrim = edgeLine(0.9, { thickness: 0.025, mat: accentRedMat() })
  pelvisTrim.rotation.z = Math.PI / 2
  pelvisTrim.position.set(0, HIP_Y + 0.28, 0.28)
  legs.add(pelvisTrim)

  legs.add(buildLeg(-1))
  legs.add(buildLeg(1))
  return legs
}

/* ------------------------------------------------------------------ */
/* CORE — forward-pitched thorax carapace                              */
/* ------------------------------------------------------------------ */

/** Insectoid thorax torso (id: core-mantis-thorax). */
export function createMantisCore(): THREE.Group {
  const g = new THREE.Group()

  const armor = armorMat()
  const armorMid = armorMat(PALETTE.armorMid)

  // Waist collar — meets the legs' pelvis top at local y≈-0.3.
  const waist = plate(1.0, 0.5, 0.72, armorMid, 0.1)
  waist.position.set(0, -0.3, -0.04)
  g.add(waist)

  // Lower thorax — broad segmented belly.
  const lowerThorax = plate(1.5, 0.72, 0.92, armor, 0.14)
  lowerThorax.position.set(0, 0.18, 0.02)
  g.add(lowerThorax)

  // Upper thorax — carries the shoulder mounts, pitched slightly forward.
  const upperThorax = plate(1.7, 0.78, 0.86, armorMid, 0.14)
  upperThorax.position.set(0, 0.78, 0.06)
  upperThorax.rotation.x = -0.12
  g.add(upperThorax)

  // Rear abdomen stub — the carapace slings back and down toward the rack.
  const abdomen = plate(0.86, 0.56, 0.5, armor, 0.1)
  abdomen.position.set(0, 0.12, -0.66)
  abdomen.rotation.x = 0.28
  g.add(abdomen)

  // Front pronotum / neck-base collar, thrust forward over the legs.
  const pronotum = plate(0.86, 0.6, 0.44, armor, 0.1)
  pronotum.position.set(0, 0.55, 0.62)
  pronotum.rotation.x = 0.2
  g.add(pronotum)

  // Ventral sternum plate + red intake grille (the "chest").
  const sternum = panelPlate(0.72, 0.6, 0.16, { trim: true })
  sternum.position.set(0, 0.12, 0.56)
  sternum.rotation.x = 0.18
  g.add(sternum)
  const intake = ventSlats(4, 0.5, 0.34, { depth: 0.05 })
  intake.position.set(0, -0.02, 0.66)
  intake.rotation.x = 0.18
  g.add(intake)

  // Shoulder mounts at local y≈+1.05 (world≈3.85), where the scythe arms hang.
  for (const side of [-1, 1]) {
    const mount = plate(0.5, 0.44, 0.6, armorMid, 0.09)
    mount.position.set(0.86 * side, 1.02, 0.04)
    g.add(mount)
    const mountJoint = joint(0.18)
    mountJoint.position.set(1.0 * side, 1.02, 0.04)
    g.add(mountJoint)
    // Gold seam along the shoulder shelf.
    const seam = trimStripe(0.5, 0.36, { thickness: 0.02 })
    seam.rotation.y = Math.PI / 2
    seam.position.set(1.02 * side, 1.02, 0.04)
    g.add(seam)
  }

  // Dorsal ridge — overlapping angular carapace scutes down the back.
  const ridgeMat = armorMat(PALETTE.armorMid)
  const ridgeY = [1.0, 0.72, 0.44, 0.16]
  ridgeY.forEach((y: number, i: number) => {
    const scute = plate(0.6 - i * 0.04, 0.16, 0.34, ridgeMat, 0.05)
    scute.position.set(0, y, -0.42 - i * 0.06)
    scute.rotation.x = 0.42
    g.add(scute)
    const crest = edgeLine(0.34, { thickness: 0.03, mat: trimGoldMat() })
    crest.rotation.y = Math.PI / 2
    crest.position.set(0, y + 0.08, -0.42 - i * 0.06)
    g.add(crest)
  })

  // Dorsal sensor strip — the one long glow line down the spine.
  const spineStrip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.0, 0.02), glowEyeMat())
  spineStrip.position.set(0, 0.55, -0.5)
  spineStrip.rotation.x = 0.42
  g.add(spineStrip)

  // Segmented side flank plates with rivet rows.
  for (const side of [-1, 1]) {
    const flank = plate(0.14, 0.62, 0.86, armor, 0.06)
    flank.position.set(0.78 * side, 0.24, 0.04)
    g.add(flank)
    const flankRivets = riveting(4, 0.18, { radius: 0.022 })
    flankRivets.rotation.y = Math.PI / 2
    flankRivets.position.set(0.86 * side, 0.24, 0.04)
    g.add(flankRivets)
  }

  // Neck stub at the top (world≈4.4), where the head sits.
  const neck = plate(0.4, 0.34, 0.4, frameMat(), 0.06)
  neck.position.set(0, 1.5, 0.14)
  g.add(neck)

  return g
}

/* ------------------------------------------------------------------ */
/* HEAD — mandibled clustered-eye skull                                */
/* ------------------------------------------------------------------ */

/** Small mandibled insect head (id: head-mantis-clustered). */
export function createMantisHead(): THREE.Group {
  const g = new THREE.Group()

  const armorMid = armorMat(PALETTE.armorMid)

  // Neck stalk dropping to the core neck stub (world≈4.4).
  const neck = strut(
    new THREE.Vector3(0, -0.42, -0.1),
    new THREE.Vector3(0, -0.08, 0.02),
    0.18,
    0.18,
    frameMat()
  )
  g.add(neck)

  // Angular skull carapace, pitched slightly forward.
  const skull = plate(0.6, 0.46, 0.6, armorMid, 0.08)
  skull.position.set(0, 0.05, 0.02)
  skull.rotation.x = 0.14
  g.add(skull)
  // Brow / crest plate.
  const brow = plate(0.5, 0.14, 0.32, armorMat(), 0.04)
  brow.position.set(0, 0.28, 0.1)
  brow.rotation.x = -0.4
  g.add(brow)

  // Dark socket recess to make the eye cluster pop.
  const socket = plate(0.46, 0.3, 0.06, ventMat(), 0.04)
  socket.position.set(0, 0.04, 0.3)
  g.add(socket)

  // Clustered compound glow-eyes — several amber facets on the face.
  const eyeMat = glowEyeMat()
  const eyeGeo = new THREE.IcosahedronGeometry(0.06, 0)
  const eyePositions: [number, number, number][] = [
    [-0.15, 0.08, 0.32],
    [0.15, 0.08, 0.32],
    [-0.11, -0.04, 0.33],
    [0.11, -0.04, 0.33],
    [0, 0.14, 0.32],
    [0, 0.02, 0.35],
  ]
  eyePositions.forEach((p: [number, number, number]) => {
    const eye = new THREE.Mesh(eyeGeo, eyeMat)
    eye.position.set(p[0], p[1], p[2])
    g.add(eye)
  })

  // Mandibles — hooked jaw plates jutting forward-down at the mouth.
  const mandMat = frameMat(PALETTE.frameSteelLight)
  for (const side of [-1, 1]) {
    const mandible = strut(
      new THREE.Vector3(0.13 * side, -0.14, 0.28),
      new THREE.Vector3(0.22 * side, -0.36, 0.56),
      0.09,
      0.09,
      mandMat
    )
    g.add(mandible)
    const tip = spike(0.05, 0.16, accentRedMat())
    tip.position.set(0.22 * side, -0.36, 0.56)
    tip.rotation.x = Math.PI * 0.75
    tip.rotation.z = 0.3 * side
    g.add(tip)
  }

  // Twin antennae sweeping up and back, amber-tipped.
  for (const side of [-1, 1]) {
    const ant = strut(
      new THREE.Vector3(0.13 * side, 0.26, 0.04),
      new THREE.Vector3(0.28 * side, 0.66, -0.22),
      0.03,
      0.03,
      frameMat()
    )
    g.add(ant)
    const antTip = new THREE.Mesh(new THREE.IcosahedronGeometry(0.04, 0), glowEyeMat())
    antTip.position.set(0.28 * side, 0.66, -0.22)
    g.add(antTip)
  }

  return g
}

/* ------------------------------------------------------------------ */
/* ARM (primary) — great serrated scythe blade                         */
/* ------------------------------------------------------------------ */

/**
 * Raptorial scythe arm hanging DOWN from the shoulder. Local origin is the
 * shoulder joint; the upper arm drops to a forward elbow and the great serrated
 * blade folds down & forward, its hooked tip near local y≈-1.9. Kept roughly
 * centred on x so it mirrors onto either shoulder.
 */
export function createMantisArmScythe(): THREE.Group {
  const g = new THREE.Group()

  const armor = armorMat()
  const armorMid = armorMat(PALETTE.armorMid)
  const edgeMat = frameMat(PALETTE.frameSteelLight)

  // Shoulder — heavy coxa housing + exposed pivot.
  const shoulder = plate(0.46, 0.46, 0.46, armorMid, 0.1)
  g.add(shoulder)
  g.add(joint(0.2))

  // Upper arm (femur) — drops down & slightly forward to the elbow.
  const elbow = new THREE.Vector3(0, -0.9, 0.22)
  const femur = strut(new THREE.Vector3(0, 0, 0), elbow, 0.32, 0.3, armor, 0.08)
  g.add(femur)
  // Small grasping teeth along the inner femur edge.
  for (let i = 0; i < 3; i++) {
    const t = 0.3 + i * 0.22
    const p = new THREE.Vector3(0, 0, 0).lerp(elbow, t)
    const tooth = spike(0.05, 0.15, edgeMat)
    tooth.position.copy(p).add(new THREE.Vector3(0, 0, 0.18))
    tooth.rotation.x = Math.PI * 0.5
    g.add(tooth)
  }

  // Elbow joint + outer back-spur.
  const elbowJoint = joint(0.18)
  elbowJoint.position.copy(elbow)
  g.add(elbowJoint)
  const backSpur = spike(0.07, 0.3, armor)
  backSpur.position.copy(elbow).add(new THREE.Vector3(0, -0.02, -0.2))
  backSpur.rotation.x = Math.PI * 1.15
  g.add(backSpur)

  // Great blade (tibia) — folds down & forward, tapering to a hooked tip.
  const bladeTip = elbow.clone().add(new THREE.Vector3(0, -1.0, 0.62))
  const bladeMid = elbow.clone().lerp(bladeTip, 0.5)
  const bladeDir = new THREE.Vector3().subVectors(bladeTip, elbow)
  const bladeLen = bladeDir.length()
  const bladeQuat = new THREE.Quaternion().setFromUnitVectors(Y_AXIS, bladeDir.clone().normalize())

  const blade = new THREE.Mesh(chamferBox(0.14, bladeLen, 0.46, 0.05), armorMid)
  blade.position.copy(bladeMid)
  blade.quaternion.copy(bladeQuat)
  g.add(blade)

  // Bright cutting lip along the forward edge of the blade.
  const edge = new THREE.Mesh(chamferBox(0.05, bladeLen * 0.94, 0.06, 0.02), edgeMat)
  edge.position.copy(bladeMid).add(new THREE.Vector3(0, 0, 0.26))
  edge.quaternion.copy(bladeQuat)
  g.add(edge)

  // Red war-stripe down the blade flat.
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.06, bladeLen * 0.8, 0.02), accentRedMat())
  stripe.position.copy(bladeMid).add(new THREE.Vector3(0.06, 0, 0.16))
  stripe.quaternion.copy(bladeQuat)
  g.add(stripe)

  // Serrated grasping spines along the forward blade edge.
  const nTeeth = 5
  for (let i = 0; i < nTeeth; i++) {
    const t = 0.12 + (i / (nTeeth - 1)) * 0.76
    const p = elbow.clone().lerp(bladeTip, t)
    const tooth = spike(0.045, 0.2 - i * 0.02, accentRedMat())
    tooth.position.copy(p).add(new THREE.Vector3(0, 0, 0.26))
    tooth.rotation.x = Math.PI * 0.5
    g.add(tooth)
  }

  // Hooked tip claw (the killing point).
  const hook = spike(0.09, 0.36, edgeMat)
  hook.position.copy(bladeTip)
  hook.quaternion.copy(bladeQuat)
  hook.rotateX(0.5)
  g.add(hook)

  // Amber power vane where blade meets elbow.
  const vane = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), glowEyeMat())
  vane.position.copy(elbow).add(new THREE.Vector3(0, 0.02, 0.16))
  g.add(vane)

  return g
}

/* ------------------------------------------------------------------ */
/* ARM (variant) — lighter manipulator pincer                          */
/* ------------------------------------------------------------------ */

/**
 * Thin secondary manipulator arm hanging DOWN from the shoulder, ending in a
 * two-finger pincer. A lighter loadout alternative to the scythe.
 */
export function createMantisArmClaw(): THREE.Group {
  const g = new THREE.Group()

  const frame = frameMat()
  const armorMid = armorMat(PALETTE.armorMid)
  const pincerMat = frameMat(PALETTE.frameSteelLight)

  // Shoulder housing + pivot.
  const shoulder = plate(0.36, 0.36, 0.36, armorMid, 0.08)
  g.add(shoulder)
  g.add(joint(0.15))

  // Upper segment down & forward to the elbow.
  const elbow = new THREE.Vector3(0, -0.78, 0.3)
  const upper = strut(new THREE.Vector3(0, 0, 0), elbow, 0.18, 0.18, frame, 0.05)
  g.add(upper)
  const elbowJoint = joint(0.11)
  elbowJoint.position.copy(elbow)
  g.add(elbowJoint)

  // Forearm continues down to the wrist.
  const wrist = elbow.clone().add(new THREE.Vector3(0, -0.72, -0.02))
  const fore = strut(elbow, wrist, 0.14, 0.14, armorMid, 0.04)
  g.add(fore)

  // Two-finger pincer at the wrist.
  for (const s of [-1, 1]) {
    const finger = strut(
      wrist.clone(),
      wrist.clone().add(new THREE.Vector3(0.12 * s, -0.28, 0.18)),
      0.055,
      0.055,
      pincerMat
    )
    g.add(finger)
  }

  // Amber wrist actuator glow.
  const wristGlow = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 0), glowEyeMat())
  wristGlow.position.copy(wrist)
  g.add(wristGlow)

  return g
}

/* ------------------------------------------------------------------ */
/* RACK — segmented carapace back shell                                */
/* ------------------------------------------------------------------ */

/** Segmented dorsal carapace / wing-case rack (id: rack-mantis-carapace). */
export function createMantisRack(): THREE.Group {
  const g = new THREE.Group()

  const armor = armorMat()
  const armorMid = armorMat(PALETTE.armorMid)

  // Central spine of overlapping angular scutes, tiling down the back.
  const scuteY = [0.7, 0.36, 0.02, -0.32]
  scuteY.forEach((y: number, i: number) => {
    const scute = plate(0.7 - i * 0.06, 0.22, 0.3, armorMid, 0.06)
    scute.position.set(0, y, -0.12 - i * 0.05)
    scute.rotation.x = -0.5
    g.add(scute)
    const crest = edgeLine(0.42, { thickness: 0.03, mat: trimGoldMat() })
    crest.rotation.y = Math.PI / 2
    crest.position.set(0, y + 0.1, -0.06 - i * 0.05)
    g.add(crest)
  })

  // Twin elytra (folded wing-cases) flaring out and back.
  for (const side of [-1, 1]) {
    const elytron = plate(0.5, 1.0, 0.16, armor, 0.08)
    elytron.position.set(0.42 * side, 0.16, -0.36)
    elytron.rotation.set(-0.35, 0.4 * side, 0.12 * side)
    g.add(elytron)
    // Rivet seam down each wing-case.
    const rivets = riveting(4, 0.2, { radius: 0.022 })
    rivets.rotation.z = Math.PI / 2
    rivets.position.set(0.42 * side, 0.16, -0.28)
    g.add(rivets)
    // Segmented tip plate.
    const tip = plate(0.4, 0.34, 0.12, armorMid, 0.05)
    tip.position.set(0.5 * side, -0.36, -0.5)
    tip.rotation.set(-0.35, 0.4 * side, 0.12 * side)
    g.add(tip)
  }

  // Lower thruster cluster — dark slats with amber glow, venting back & down.
  const thruster = ventSlats(4, 0.7, 0.42, {
    slatMat: glowEyeMat(),
    frameMat: ventMat(),
    depth: 0.07,
  })
  thruster.position.set(0, -0.66, -0.34)
  thruster.rotation.x = Math.PI + 0.4
  g.add(thruster)

  // Twin exhaust nozzles flanking the thruster.
  for (const side of [-1, 1]) {
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.28, 10), frameMat())
    nozzle.position.set(0.28 * side, -0.62, -0.44)
    nozzle.rotation.x = Math.PI / 2 - 0.4
    g.add(nozzle)
  }

  return g
}
