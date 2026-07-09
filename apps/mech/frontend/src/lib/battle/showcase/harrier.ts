/**
 * HARRIER — an Armored-Core-style reverse-joint ("RJ" / chicken-walker)
 * lightweight raider mech.
 *
 * The whole point is the digitigrade backward-bending leg: the thigh angles
 * DOWN-AND-FORWARD to a knee that juts out ahead of the machine, the shin then
 * sweeps DOWN-AND-BACK to a heel-spurred ankle, and a splayed bird-like talon
 * foot reaches forward to grip the ground. Exposed hydraulic struts and cabling
 * ride the joints. On top: a compact angular torso pitched slightly forward, a
 * slim visored head with a single amber optic, a shoulder-mounted missile pod
 * on the left, a slim blade-rifle on the right arm, and a pair of back-mounted
 * booster thrusters with amber nozzle glow.
 *
 * Pure procedural three.js (r182) geometry built only from the shared art
 * toolkit so it matches the game's gritty-industrial look. Faces +Z, stands on
 * y=0, centered on x=0/z=0.
 */

import * as THREE from 'three'
import {
  PALETTE, armorMat, frameMat, accentRedMat, trimGoldMat, glowEyeMat, ventMat,
  chamferBox, panelPlate, trimStripe, edgeLine, ventSlats, bolt, riveting,
} from '../procedural/detailing'

/* ------------------------------------------------------------------ */
/* Local build helpers                                                 */
/* ------------------------------------------------------------------ */

const UP = new THREE.Vector3(0, 1, 0)

/** A chamfered-box plate mesh (shadow flags are set globally at the end). */
function plate(w: number, h: number, d: number, mat: THREE.Material, bevel?: number): THREE.Mesh {
  return new THREE.Mesh(chamferBox(w, h, d, bevel), mat)
}

/** A metallic joint ball / actuator. */
function joint(radius: number, mat: THREE.Material = frameMat()): THREE.Mesh {
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 14, 10), mat)
}

/**
 * A tapered chamfer-box limb segment spanning from `a` to `b` in local space,
 * its long (Y) axis rotated onto the a→b direction.
 */
function limbSegment(
  a: THREE.Vector3,
  b: THREE.Vector3,
  w: number,
  d: number,
  mat: THREE.Material,
): THREE.Mesh {
  const len = Math.max(a.distanceTo(b), 0.02)
  const mesh = new THREE.Mesh(chamferBox(w, len, d), mat)
  mesh.position.copy(a).add(b).multiplyScalar(0.5)
  mesh.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize())
  return mesh
}

/** A thin cylindrical strut / hydraulic piston / cable spanning `a`→`b`. */
function strut(
  a: THREE.Vector3,
  b: THREE.Vector3,
  radius: number,
  mat: THREE.Material = frameMat(PALETTE.frameSteelLight),
): THREE.Mesh {
  const len = Math.max(a.distanceTo(b), 0.02)
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, len, 8), mat)
  mesh.position.copy(a).add(b).multiplyScalar(0.5)
  mesh.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize())
  return mesh
}

/* ------------------------------------------------------------------ */
/* Reverse-joint leg                                                   */
/* ------------------------------------------------------------------ */

/**
 * One slim reverse-joint (chicken-walker) leg, built around a hip at local
 * (0,0,0) descending in -Y. The bend is deliberately exaggerated so it reads
 * from the side: knee well FORWARD, ankle tucked BACK, talon foot forward.
 */
function buildLeg(side: -1 | 1): THREE.Group {
  const g = new THREE.Group()
  g.name = side < 0 ? 'leg-left' : 'leg-right'

  // Joint chain (side view): hip → knee(forward) → ankle(back) → toe(forward).
  const hip = new THREE.Vector3(0, 0, 0)
  const knee = new THREE.Vector3(0, -0.95, 0.62)
  const ankle = new THREE.Vector3(0, -1.95, -0.28)
  const toe = new THREE.Vector3(0, -2.30, 0.42)

  /* ---- Hip ---- */
  const hipBall = joint(0.23)
  hipBall.position.copy(hip)
  g.add(hipBall)
  const hipCap = plate(0.48, 0.46, 0.52, armorMat(PALETTE.armorMid))
  hipCap.position.set(side * 0.05, 0.02, 0.0)
  g.add(hipCap)
  const hipVent = ventSlats(2, 0.3, 0.24, { depth: 0.05 })
  hipVent.position.set(side * 0.26, 0.0, 0.12)
  hipVent.rotation.y = side * Math.PI / 2
  g.add(hipVent)

  /* ---- Thigh (hip → knee), angling down-and-forward ---- */
  g.add(limbSegment(hip, knee, 0.28, 0.32, frameMat()))
  const thighArmor = limbSegment(
    hip.clone().add(new THREE.Vector3(0, -0.05, 0.03)), knee, 0.44, 0.5, armorMat(),
  )
  g.add(thighArmor)
  // Overlapping upper-thigh plate with gold trim.
  const thighPanel = panelPlate(0.4, 0.6, 0.16, { inset: 0.09, raise: 0.04, trim: true })
  thighPanel.position.set(0, -0.4, 0.42)
  thighPanel.rotation.x = -0.55
  g.add(thighPanel)
  const thighVent = ventSlats(3, 0.26, 0.34, { depth: 0.05 })
  thighVent.position.set(side * 0.24, -0.45, 0.16)
  thighVent.rotation.y = side * Math.PI / 2
  g.add(thighVent)

  /* ---- Knee (juts forward) + exposed hydraulics ---- */
  const kneeBall = joint(0.2)
  kneeBall.position.copy(knee)
  g.add(kneeBall)
  const kneeGuard = plate(0.36, 0.44, 0.26, accentRedMat())
  kneeGuard.position.set(0, knee.y + 0.06, knee.z + 0.2)
  kneeGuard.rotation.x = -0.35
  g.add(kneeGuard)
  const kneeGuardTrim = edgeLine(0.34)
  kneeGuardTrim.position.set(0, knee.y + 0.24, knee.z + 0.26)
  kneeGuardTrim.rotation.z = Math.PI / 2
  kneeGuardTrim.rotation.x = -0.35
  g.add(kneeGuardTrim)

  // Twin extensor pistons + a dark cable crossing the back of the knee.
  const thighBack = new THREE.Vector3(0, -0.62, 0.18)
  const shinBack = new THREE.Vector3(0, -1.55, -0.12)
  for (const sx of [-1, 1] as const) {
    const off = new THREE.Vector3(sx * 0.13, 0, 0)
    g.add(strut(thighBack.clone().add(off), shinBack.clone().add(off), 0.045))
  }
  g.add(strut(
    new THREE.Vector3(0, -0.7, 0.06), new THREE.Vector3(0, -1.68, -0.2), 0.03,
    frameMat(PALETTE.frameSteel),
  ))
  const cable = strut(
    new THREE.Vector3(0, -0.55, 0.28), new THREE.Vector3(0, -1.72, -0.02), 0.028, ventMat(),
  )
  g.add(cable)

  /* ---- Shin (knee → ankle), sweeping down-and-back ---- */
  g.add(limbSegment(knee, ankle, 0.24, 0.4, frameMat()))
  const shinArmor = limbSegment(
    knee, ankle.clone().add(new THREE.Vector3(0, 0.03, 0)), 0.36, 0.5, armorMat(),
  )
  g.add(shinArmor)
  // Gold shin slash + a short red accent slash below it.
  const shinTrim = edgeLine(0.62)
  shinTrim.position.set(side * 0.16, -1.42, 0.12)
  shinTrim.rotation.set(-0.9, side * 0.3, Math.PI / 2)
  g.add(shinTrim)
  const shinSlash = plate(0.06, 0.4, 0.06, accentRedMat())
  shinSlash.position.set(-side * 0.16, -1.5, 0.1)
  shinSlash.rotation.set(-0.85, 0, side * 0.25)
  g.add(shinSlash)

  /* ---- Ankle + spur ---- */
  const ankleBall = joint(0.17)
  ankleBall.position.copy(ankle)
  g.add(ankleBall)
  g.add(strut(
    new THREE.Vector3(0, -1.7, -0.18), ankle.clone().add(new THREE.Vector3(0, 0.06, 0.06)), 0.035,
  ))

  /* ---- Bird-like talon foot ---- */
  // Metatarsal ankle → toe.
  g.add(limbSegment(ankle, toe, 0.22, 0.28, frameMat()))
  const footArmor = limbSegment(ankle, toe, 0.3, 0.36, armorMat())
  g.add(footArmor)
  // Rearward heel spur for a planted stance.
  const heelTip = new THREE.Vector3(0, -2.24, -0.62)
  g.add(strut(ankle, heelTip, 0.06, frameMat()))
  const heelClaw = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.26, 6), frameMat(PALETTE.frameSteelLight))
  heelClaw.position.set(0, -2.26, -0.72)
  heelClaw.rotation.x = -Math.PI / 2 - 0.3
  g.add(heelClaw)

  // Central toe pad on the ground.
  const toePad = plate(0.34, 0.14, 0.5, armorMat(PALETTE.armorMid))
  toePad.position.set(0, -2.31, toe.z + 0.12)
  g.add(toePad)
  const toeTrim = edgeLine(0.44)
  toeTrim.position.set(0, -2.24, toe.z + 0.2)
  toeTrim.rotation.y = Math.PI / 2
  g.add(toeTrim)
  // Three splayed forward talons gripping the ground.
  for (const tx of [-1, 0, 1] as const) {
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.34, 6), frameMat(PALETTE.frameSteelLight))
    claw.position.set(tx * 0.16, -2.32, toe.z + 0.38)
    claw.rotation.x = Math.PI / 2 + 0.42
    claw.rotation.z = tx * 0.28
    g.add(claw)
  }
  const footRivets = riveting(3, 0.12, { radius: 0.02 })
  footRivets.position.set(0, -2.24, toe.z + 0.02)
  g.add(footRivets)

  return g
}

/* ------------------------------------------------------------------ */
/* Head                                                                */
/* ------------------------------------------------------------------ */

/** Slim angular head with a single glowing amber optic in a dark visor recess. */
function buildHead(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'head'

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.2, 10), frameMat())
  neck.position.y = -0.17
  g.add(neck)

  // Narrow helmet wedge.
  const skull = plate(0.44, 0.4, 0.54, armorMat(), 0.06)
  g.add(skull)
  const crown = plate(0.36, 0.14, 0.4, armorMat(PALETTE.armorMid))
  crown.position.set(0, 0.2, -0.02)
  g.add(crown)
  const brow = plate(0.48, 0.12, 0.24, armorMat(PALETTE.armorMid))
  brow.position.set(0, 0.13, 0.2)
  brow.rotation.x = 0.28
  g.add(brow)

  // Dark visor recess with a single amber optic lens.
  const visorRecess = plate(0.42, 0.16, 0.06, ventMat())
  visorRecess.position.set(0, -0.01, 0.27)
  g.add(visorRecess)
  const optic = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 14), glowEyeMat())
  optic.rotation.x = Math.PI / 2
  optic.position.set(0, -0.01, 0.31)
  g.add(optic)
  const opticRing = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.018, 8, 16), frameMat(PALETTE.frameSteelLight))
  opticRing.position.set(0, -0.01, 0.31)
  g.add(opticRing)

  // Cheek vents.
  for (const sx of [-1, 1] as const) {
    const cheek = ventSlats(2, 0.1, 0.16, { depth: 0.04 })
    cheek.position.set(sx * 0.21, -0.05, 0.19)
    cheek.rotation.y = sx * 0.5
    g.add(cheek)
  }

  // Swept sensor crest + antenna.
  const crest = plate(0.05, 0.34, 0.09, accentRedMat())
  crest.position.set(-0.12, 0.32, -0.08)
  crest.rotation.x = -0.5
  g.add(crest)
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.02, 0.44, 6), frameMat(PALETTE.frameSteelLight))
  antenna.position.set(0.15, 0.36, -0.04)
  antenna.rotation.x = -0.35
  g.add(antenna)

  return g
}

/* ------------------------------------------------------------------ */
/* Arms + weapons                                                      */
/* ------------------------------------------------------------------ */

/** Right arm: shoulder, upper/forearm, and a slim blade-rifle pointing +Z. */
function buildRifleArm(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'arm-right'

  const shoulder = new THREE.Vector3(0, 0, 0)
  const elbow = new THREE.Vector3(-0.04, -0.66, 0.2)
  const wrist = new THREE.Vector3(-0.02, -1.02, 0.36)

  const pauldron = panelPlate(0.56, 0.5, 0.56, { inset: 0.1, raise: 0.05, trim: true })
  pauldron.position.set(0.06, 0.14, 0)
  pauldron.rotation.z = -0.14
  g.add(pauldron)
  const shoulderBall = joint(0.19)
  shoulderBall.position.copy(shoulder)
  g.add(shoulderBall)

  g.add(limbSegment(shoulder, elbow, 0.24, 0.28, frameMat()))
  const upperArmor = limbSegment(shoulder.clone().add(new THREE.Vector3(0, -0.06, 0)), elbow, 0.32, 0.36, armorMat())
  g.add(upperArmor)
  const elbowBall = joint(0.15)
  elbowBall.position.copy(elbow)
  g.add(elbowBall)

  g.add(limbSegment(elbow, wrist, 0.22, 0.26, frameMat()))
  const foreArmor = limbSegment(elbow, wrist, 0.3, 0.32, armorMat())
  g.add(foreArmor)
  const wristBall = joint(0.13)
  wristBall.position.copy(wrist)
  g.add(wristBall)

  // Rifle receiver in the hand.
  const receiver = plate(0.28, 0.3, 0.5, armorMat(PALETTE.armorMid))
  receiver.position.set(wrist.x, wrist.y - 0.06, wrist.z + 0.22)
  g.add(receiver)
  const receiverVent = ventSlats(3, 0.2, 0.22, { depth: 0.04, horizontal: true })
  receiverVent.position.set(wrist.x + 0.16, wrist.y - 0.06, wrist.z + 0.22)
  receiverVent.rotation.y = Math.PI / 2
  g.add(receiverVent)

  // Long slim barrel pointing +Z.
  const barZ0 = wrist.z + 0.44
  const barLen = 0.98
  const barCz = barZ0 + barLen / 2
  const barrel = plate(0.16, 0.18, barLen, frameMat(PALETTE.frameSteelLight))
  barrel.position.set(wrist.x, wrist.y - 0.02, barCz)
  g.add(barrel)
  const barrelTrim = edgeLine(barLen, { thickness: 0.018 })
  barrelTrim.position.set(wrist.x, wrist.y + 0.08, barCz)
  barrelTrim.rotation.y = Math.PI / 2
  g.add(barrelTrim)
  const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.2, 8), frameMat())
  muzzle.rotation.x = Math.PI / 2
  muzzle.position.set(wrist.x, wrist.y - 0.02, barZ0 + barLen + 0.04)
  g.add(muzzle)
  // Amber charge glow at the breach.
  const breach = plate(0.12, 0.12, 0.1, glowEyeMat())
  breach.position.set(wrist.x, wrist.y - 0.02, barZ0 + 0.04)
  g.add(breach)

  // Under-barrel mono-blade (the "blade" of the blade-rifle).
  const blade = new THREE.Group()
  blade.name = 'blade'
  blade.position.set(wrist.x, wrist.y - 0.2, wrist.z + 0.3)
  const bladeBody = plate(0.08, 0.34, 0.9, frameMat(PALETTE.frameSteelLight), 0.025)
  bladeBody.position.z = 0.45
  blade.add(bladeBody)
  const bladeTip = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.42, 4), frameMat(PALETTE.frameSteelLight))
  bladeTip.rotation.set(Math.PI / 2, Math.PI / 4, 0)
  bladeTip.scale.set(1, 1, 0.4)
  bladeTip.position.z = 1.06
  blade.add(bladeTip)
  const bladeEdge = edgeLine(0.9, { thickness: 0.024 })
  bladeEdge.position.set(0, -0.17, 0.45)
  bladeEdge.rotation.y = Math.PI / 2
  blade.add(bladeEdge)
  g.add(blade)

  return g
}

/** Left arm: shoulder, upper/forearm, and a compact gripping hand + guard. */
function buildLeftArm(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'arm-left'

  const shoulder = new THREE.Vector3(0, 0, 0)
  const elbow = new THREE.Vector3(0.04, -0.66, 0.18)
  const wrist = new THREE.Vector3(0.02, -1.04, 0.28)

  const pauldron = panelPlate(0.56, 0.5, 0.56, { inset: 0.1, raise: 0.05 })
  pauldron.position.set(-0.06, 0.14, 0)
  pauldron.rotation.z = 0.14
  g.add(pauldron)
  const shoulderBall = joint(0.19)
  shoulderBall.position.copy(shoulder)
  g.add(shoulderBall)

  g.add(limbSegment(shoulder, elbow, 0.24, 0.28, frameMat()))
  const upperArmor = limbSegment(shoulder.clone().add(new THREE.Vector3(0, -0.06, 0)), elbow, 0.32, 0.36, armorMat())
  g.add(upperArmor)
  const elbowBall = joint(0.15)
  elbowBall.position.copy(elbow)
  g.add(elbowBall)

  g.add(limbSegment(elbow, wrist, 0.22, 0.26, frameMat()))
  const foreArmor = limbSegment(elbow, wrist, 0.3, 0.32, armorMat())
  g.add(foreArmor)
  // Small forearm guard plate with red slash.
  const guard = plate(0.34, 0.4, 0.12, accentRedMat())
  guard.position.set(-0.14, -0.86, 0.24)
  guard.rotation.y = 0.3
  g.add(guard)
  const wristBall = joint(0.13)
  wristBall.position.copy(wrist)
  g.add(wristBall)

  // Blocky gripping hand.
  const palm = plate(0.24, 0.2, 0.24, frameMat(PALETTE.frameSteel))
  palm.position.set(wrist.x, wrist.y - 0.16, wrist.z + 0.04)
  g.add(palm)
  for (const fx of [-1, 0, 1] as const) {
    const finger = plate(0.05, 0.16, 0.06, frameMat(PALETTE.frameSteelLight))
    finger.position.set(wrist.x + fx * 0.07, wrist.y - 0.28, wrist.z + 0.1)
    finger.rotation.x = 0.5
    g.add(finger)
  }

  return g
}

/** Shoulder-mounted multi-tube missile pod (sits above the left shoulder). */
function buildMissilePod(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'pod-left'

  const housing = plate(0.56, 0.5, 0.66, armorMat())
  g.add(housing)
  const housingTrim = trimStripe(0.5, 0.44, { thickness: 0.02 })
  housingTrim.position.set(0, 0, 0.34)
  g.add(housingTrim)
  // Red hazard slash on the flank.
  const slash = plate(0.1, 0.4, 0.04, accentRedMat())
  slash.position.set(-0.29, 0, 0.05)
  slash.rotation.z = 0.5
  g.add(slash)
  const podRivets = riveting(3, 0.16, { radius: 0.022 })
  podRivets.position.set(0, 0.2, 0.34)
  g.add(podRivets)

  // 2x3 grid of forward-facing launch tubes with amber glow cores.
  for (const cx of [-1, 0, 1] as const) {
    for (const cy of [-1, 1] as const) {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.12, 10), ventMat())
      tube.rotation.x = Math.PI / 2
      tube.position.set(cx * 0.16, cy * 0.12, 0.36)
      g.add(tube)
      const core = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 8), glowEyeMat())
      core.rotation.x = Math.PI / 2
      core.position.set(cx * 0.16, cy * 0.12, 0.4)
      g.add(core)
    }
  }

  // Rear exhaust vent.
  const exhaust = ventSlats(3, 0.44, 0.34, { depth: 0.05 })
  exhaust.position.set(0, 0, -0.34)
  exhaust.rotation.y = Math.PI
  g.add(exhaust)

  return g
}

/** Back booster pack: two small angled thrusters with amber nozzle glow. */
function buildBoosterPack(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'thrusters'

  const pack = plate(0.66, 0.72, 0.3, armorMat())
  g.add(pack)
  const packVent = ventSlats(4, 0.46, 0.46, { depth: 0.05 })
  packVent.position.set(0, 0.06, -0.17)
  packVent.rotation.y = Math.PI
  g.add(packVent)
  const packTrim = edgeLine(0.5)
  packTrim.position.set(0, 0.3, 0.16)
  g.add(packTrim)

  for (const sx of [-1, 1] as const) {
    const boost = new THREE.Group()
    boost.name = sx < 0 ? 'booster-left' : 'booster-right'
    boost.position.set(sx * 0.28, -0.26, -0.12)
    boost.rotation.set(0.4, 0, sx * 0.1)

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.5, 12), armorMat(PALETTE.armorMid))
    boost.add(body)
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.13, 0.2, 12), frameMat())
    nozzle.position.y = -0.32
    boost.add(nozzle)
    const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.07, 12), glowEyeMat())
    glow.position.y = -0.42
    boost.add(glow)

    g.add(boost)
  }

  return g
}

/* ------------------------------------------------------------------ */
/* Torso                                                               */
/* ------------------------------------------------------------------ */

/** Compact forward-pitched torso; mounts head, arms, pod and boosters. */
function buildTorso(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'torso'
  g.position.set(0, 2.5, 0.02)
  g.rotation.x = 0.14 // predatory forward pitch

  // Angular chest.
  const chest = plate(1.28, 0.92, 0.72, armorMat())
  chest.position.set(0, 0.46, 0.02)
  g.add(chest)
  const sternum = panelPlate(0.78, 0.72, 0.18, { inset: 0.13, raise: 0.05, trim: true })
  sternum.position.set(0, 0.48, 0.4)
  g.add(sternum)
  // Red chest intake.
  const intake = ventSlats(4, 0.5, 0.36, { depth: 0.06 })
  intake.position.set(0, 0.16, 0.44)
  g.add(intake)

  // Collar / cowl.
  const collar = plate(1.08, 0.34, 0.6, armorMat(PALETTE.armorMid))
  collar.position.set(0, 1.0, 0.03)
  g.add(collar)
  const collarRivets = riveting(5, 0.18, { radius: 0.02 })
  collarRivets.position.set(0, 1.08, 0.33)
  g.add(collarRivets)

  // Waist / ab.
  const waist = plate(0.78, 0.46, 0.54, frameMat())
  waist.position.set(0, -0.14, 0)
  g.add(waist)
  const abGuard = plate(0.54, 0.4, 0.44, accentRedMat())
  abGuard.position.set(0, -0.12, 0.24)
  g.add(abGuard)

  // Head.
  const head = buildHead()
  head.position.set(0, 1.42, 0.14)
  g.add(head)

  // Arms.
  const rifleArm = buildRifleArm()
  rifleArm.position.set(1.02, 1.08, 0.02)
  g.add(rifleArm)
  const leftArm = buildLeftArm()
  leftArm.position.set(-1.02, 1.08, 0.02)
  g.add(leftArm)

  // Missile pod above the left shoulder.
  const pod = buildMissilePod()
  pod.position.set(-1.02, 1.5, -0.06)
  pod.rotation.y = 0.12
  g.add(pod)

  // Back boosters.
  const boosters = buildBoosterPack()
  boosters.position.set(0, 0.6, -0.42)
  g.add(boosters)

  return g
}

/* ------------------------------------------------------------------ */
/* Root assembly                                                       */
/* ------------------------------------------------------------------ */

/**
 * Assemble the complete Harrier mech. Returns a root Group standing on y=0,
 * centered on x/z, facing +Z.
 */
export function createHarrierMech(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'harrier-mech'

  // Pelvis block (does not lean; the legs hang from it).
  const pelvis = new THREE.Group()
  pelvis.name = 'pelvis'
  pelvis.position.set(0, 2.34, -0.02)
  const pelvisBlock = plate(0.92, 0.46, 0.6, armorMat())
  pelvis.add(pelvisBlock)
  const pelvisGuard = plate(0.62, 0.3, 0.46, frameMat())
  pelvisGuard.position.set(0, -0.06, 0.26)
  pelvis.add(pelvisGuard)
  const pelvisGlow = plate(0.2, 0.08, 0.06, glowEyeMat())
  pelvisGlow.position.set(0, -0.04, 0.5)
  pelvis.add(pelvisGlow)
  // Hip flare skirts.
  for (const sx of [-1, 1] as const) {
    const skirt = plate(0.3, 0.42, 0.36, armorMat(PALETTE.armorMid))
    skirt.position.set(sx * 0.52, -0.1, 0.04)
    skirt.rotation.z = sx * 0.32
    pelvis.add(skirt)
  }
  root.add(pelvis)

  // Reverse-joint legs, feet a bit apart.
  const legL = buildLeg(-1)
  legL.position.set(-0.55, 2.34, 0)
  root.add(legL)
  const legR = buildLeg(1)
  legR.position.set(0.55, 2.34, 0)
  root.add(legR)

  // Torso (with head, arms, pod, boosters).
  root.add(buildTorso())

  // Guarantee every mesh casts and receives shadows (helper sub-meshes too).
  root.traverse((obj: THREE.Object3D) => {
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = true
      obj.receiveShadow = true
    }
  })

  return root
}
