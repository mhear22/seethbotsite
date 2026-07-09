/**
 * HARRIER modular parts — decomposed from the bespoke showcase Harrier into the
 * game's slot system so its pieces interoperate with the rest of the catalogue.
 *
 * Harrier is an Armored-Core-style reverse-joint ("RJ" / chicken-walker)
 * lightweight raider: EXAGGERATED digitigrade legs (knee-forward / ankle-back /
 * splayed talon feet with exposed pistons), a compact forward-pitched torso, a
 * slim single-amber-optic visored head, a blade-rifle arm + a shoulder-missile-
 * pod arm, and a twin-booster back rack with amber nozzles.
 *
 * Every builder is authored in its slot's LOCAL frame so it drops straight onto
 * the shared skeleton (see the slot connection points below and wraith.ts for
 * the reference reverse-joint legs). Pure procedural three.js (r182), built only
 * from the shared detailing toolkit so it stays on-model.
 */

import * as THREE from 'three'
import {
  PALETTE, armorMat, frameMat, accentRedMat, glowEyeMat, ventMat,
  chamferBox, panelPlate, trimStripe, edgeLine, ventSlats, riveting,
} from '../detailing'

/* ------------------------------------------------------------------ */
/* Local build helpers                                                 */
/* ------------------------------------------------------------------ */

const UP = new THREE.Vector3(0, 1, 0)

/** A chamfered-box plate mesh. */
function plate(w: number, h: number, d: number, mat: THREE.Material, bevel?: number): THREE.Mesh {
  return new THREE.Mesh(chamferBox(w, h, d, bevel), mat)
}

/** A metallic joint ball / actuator. */
function joint(radius: number, mat: THREE.Material = frameMat()): THREE.Mesh {
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 14, 10), mat)
}

/** A tapered chamfer-box limb segment spanning `a`→`b`, long axis on that dir. */
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

/** Tag every mesh in a group for shadows before returning it. */
function finalize(g: THREE.Group): THREE.Group {
  g.traverse((obj: THREE.Object3D) => {
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = true
      obj.receiveShadow = true
    }
  })
  return g
}

/* ------------------------------------------------------------------ */
/* LEGS — exaggerated reverse-joint chicken-walker                     */
/* ------------------------------------------------------------------ */

/** Hip pivot height in the legs-slot local frame (matches the stock frame). */
const HIP_Y = 2.6
/** Lateral hip offset — a planted, slightly wider raider stance. */
const HIP_X = 0.5

/**
 * One slim reverse-joint leg. Returned group is the animation PIVOT (named
 * 'leg-left' / 'leg-right') placed at the hip; all geometry hangs BELOW it in
 * -Y so MechEntity.animateWalk can swing rotation.x for the stride. The bend is
 * deliberately exaggerated so it reads from the side: knee well FORWARD, ankle
 * tucked BACK, splayed talon foot forward. Sole rests at local y≈-2.6 (world 0).
 */
function buildLeg(side: -1 | 1): THREE.Group {
  const g = new THREE.Group()
  g.name = side < 0 ? 'leg-left' : 'leg-right'
  g.position.set(side * HIP_X, HIP_Y, 0)

  // Joint chain (side view): hip → knee(forward) → ankle(back) → toe(forward).
  const hip = new THREE.Vector3(0, 0, 0)
  const knee = new THREE.Vector3(0, -1.02, 0.66)
  const ankle = new THREE.Vector3(0, -2.08, -0.32)
  const toe = new THREE.Vector3(0, -2.46, 0.44)

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
  const thighPanel = panelPlate(0.42, 0.64, 0.16, { inset: 0.09, raise: 0.04, trim: true })
  thighPanel.position.set(0, -0.42, 0.46)
  thighPanel.rotation.x = -0.56
  g.add(thighPanel)
  const thighVent = ventSlats(3, 0.26, 0.36, { depth: 0.05 })
  thighVent.position.set(side * 0.24, -0.48, 0.16)
  thighVent.rotation.y = side * Math.PI / 2
  g.add(thighVent)

  /* ---- Knee (juts forward) + exposed hydraulics ---- */
  const kneeBall = joint(0.2)
  kneeBall.position.copy(knee)
  g.add(kneeBall)
  const kneeGuard = plate(0.36, 0.46, 0.26, accentRedMat())
  kneeGuard.position.set(0, knee.y + 0.06, knee.z + 0.2)
  kneeGuard.rotation.x = -0.35
  g.add(kneeGuard)
  const kneeGuardTrim = edgeLine(0.34)
  kneeGuardTrim.position.set(0, knee.y + 0.25, knee.z + 0.26)
  kneeGuardTrim.rotation.z = Math.PI / 2
  kneeGuardTrim.rotation.x = -0.35
  g.add(kneeGuardTrim)

  // Twin extensor pistons + a dark cable crossing the back of the knee.
  const thighBack = new THREE.Vector3(0, -0.66, 0.2)
  const shinBack = new THREE.Vector3(0, -1.64, -0.16)
  for (const sx of [-1, 1] as const) {
    const off = new THREE.Vector3(sx * 0.13, 0, 0)
    g.add(strut(thighBack.clone().add(off), shinBack.clone().add(off), 0.045))
  }
  g.add(strut(
    new THREE.Vector3(0, -0.74, 0.06), new THREE.Vector3(0, -1.78, -0.24), 0.03,
    frameMat(PALETTE.frameSteel),
  ))
  g.add(strut(
    new THREE.Vector3(0, -0.58, 0.3), new THREE.Vector3(0, -1.82, -0.04), 0.028, ventMat(),
  ))

  /* ---- Shin (knee → ankle), sweeping down-and-back ---- */
  g.add(limbSegment(knee, ankle, 0.24, 0.4, frameMat()))
  const shinArmor = limbSegment(
    knee, ankle.clone().add(new THREE.Vector3(0, 0.03, 0)), 0.36, 0.5, armorMat(),
  )
  g.add(shinArmor)
  // Gold shin slash + a short red accent slash below it.
  const shinTrim = edgeLine(0.64)
  shinTrim.position.set(side * 0.16, -1.5, 0.1)
  shinTrim.rotation.set(-0.9, side * 0.3, Math.PI / 2)
  g.add(shinTrim)
  const shinSlash = plate(0.06, 0.42, 0.06, accentRedMat())
  shinSlash.position.set(-side * 0.16, -1.58, 0.08)
  shinSlash.rotation.set(-0.85, 0, side * 0.25)
  g.add(shinSlash)

  /* ---- Ankle + spur ---- */
  const ankleBall = joint(0.17)
  ankleBall.position.copy(ankle)
  g.add(ankleBall)
  g.add(strut(
    new THREE.Vector3(0, -1.82, -0.22), ankle.clone().add(new THREE.Vector3(0, 0.06, 0.06)), 0.035,
  ))

  /* ---- Bird-like talon foot ---- */
  g.add(limbSegment(ankle, toe, 0.22, 0.28, frameMat()))
  const footArmor = limbSegment(ankle, toe, 0.3, 0.36, armorMat())
  g.add(footArmor)
  // Rearward heel spur for a planted stance.
  const heelTip = new THREE.Vector3(0, -2.4, -0.66)
  g.add(strut(ankle, heelTip, 0.06, frameMat()))
  const heelClaw = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.26, 6), frameMat(PALETTE.frameSteelLight))
  heelClaw.position.set(0, -2.42, -0.76)
  heelClaw.rotation.x = -Math.PI / 2 - 0.3
  g.add(heelClaw)

  // Central toe pad on the ground (sole ~ y -2.58).
  const toePad = plate(0.34, 0.14, 0.5, armorMat(PALETTE.armorMid))
  toePad.position.set(0, -2.5, toe.z + 0.12)
  g.add(toePad)
  const toeTrim = edgeLine(0.44)
  toeTrim.position.set(0, -2.42, toe.z + 0.2)
  toeTrim.rotation.y = Math.PI / 2
  g.add(toeTrim)
  // Three splayed forward talons gripping the ground.
  for (const tx of [-1, 0, 1] as const) {
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.34, 6), frameMat(PALETTE.frameSteelLight))
    claw.position.set(tx * 0.16, -2.52, toe.z + 0.38)
    claw.rotation.x = Math.PI / 2 + 0.42
    claw.rotation.z = tx * 0.28
    g.add(claw)
  }
  const footRivets = riveting(3, 0.12, { radius: 0.02 })
  footRivets.position.set(0, -2.42, toe.z + 0.02)
  g.add(footRivets)

  // Amber sensor dot on the outer ankle.
  const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), glowEyeMat())
  sensor.position.set(side * 0.14, ankle.y + 0.12, ankle.z + 0.04)
  g.add(sensor)

  return g
}

/** Reverse-joint chicken-walker legs slot part (id: legs-harrier-rj). */
export function createHarrierLegs(): THREE.Group {
  const legs = new THREE.Group()

  // Pelvis / hip yoke connecting the two legs, just under the core attach (2.8).
  const pelvis = plate(0.92, 0.48, 0.6, armorMat())
  pelvis.position.set(0, HIP_Y + 0.06, -0.02)
  legs.add(pelvis)
  const pelvisGuard = plate(0.62, 0.3, 0.46, frameMat())
  pelvisGuard.position.set(0, HIP_Y - 0.06, 0.26)
  legs.add(pelvisGuard)
  const pelvisGlow = plate(0.2, 0.08, 0.06, glowEyeMat())
  pelvisGlow.position.set(0, HIP_Y - 0.04, 0.5)
  legs.add(pelvisGlow)
  // Hip flare skirts over each thigh.
  for (const sx of [-1, 1] as const) {
    const skirt = plate(0.3, 0.44, 0.36, armorMat(PALETTE.armorMid))
    skirt.position.set(sx * 0.54, HIP_Y - 0.1, 0.04)
    skirt.rotation.z = sx * 0.32
    legs.add(skirt)
  }

  legs.add(buildLeg(-1))
  legs.add(buildLeg(1))
  return finalize(legs)
}

/* ------------------------------------------------------------------ */
/* CORE — compact forward-pitched torso                               */
/* ------------------------------------------------------------------ */

/**
 * Compact raider torso built around the core origin (0,0,0): waist meets the
 * pelvis at local y≈-0.3, shoulders at y≈+1.05, neck stub at the top (y≈+1.6).
 * Given a slight predatory forward pitch. (id: core-harrier-raider)
 */
export function createHarrierCore(): THREE.Group {
  const g = new THREE.Group()

  // A leaning inner group so the pitch does not shift the waist/shoulder anchors.
  const body = new THREE.Group()
  body.rotation.x = 0.12
  g.add(body)

  // Angular chest.
  const chest = plate(1.34, 0.94, 0.74, armorMat())
  chest.position.set(0, 0.5, 0.02)
  body.add(chest)
  const sternum = panelPlate(0.8, 0.74, 0.18, { inset: 0.13, raise: 0.05, trim: true })
  sternum.position.set(0, 0.52, 0.42)
  body.add(sternum)
  // Red chest intake.
  const intake = ventSlats(4, 0.52, 0.36, { depth: 0.06 })
  intake.position.set(0, 0.2, 0.46)
  body.add(intake)

  // Shoulder yoke where the arms bolt on (local y≈+1.05).
  const yoke = plate(1.44, 0.34, 0.66, armorMat(PALETTE.armorMid))
  yoke.position.set(0, 1.0, 0.0)
  body.add(yoke)
  for (const sx of [-1, 1] as const) {
    const socket = joint(0.2)
    socket.position.set(sx * 0.62, 1.02, 0.02)
    body.add(socket)
  }
  const collarRivets = riveting(5, 0.2, { radius: 0.02 })
  collarRivets.position.set(0, 1.14, 0.3)
  body.add(collarRivets)

  // Neck stub at the top (world ≈ 4.4, where the head sits above).
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.22, 0.28, 12), frameMat())
  neck.position.set(0, 1.5, 0.02)
  body.add(neck)

  // Waist / ab meeting the pelvis (local y≈-0.3).
  const waist = plate(0.8, 0.5, 0.56, frameMat())
  waist.position.set(0, -0.2, 0)
  body.add(waist)
  const abGuard = plate(0.56, 0.42, 0.44, accentRedMat())
  abGuard.position.set(0, -0.18, 0.26)
  body.add(abGuard)
  const abGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 12), glowEyeMat())
  abGlow.rotation.x = Math.PI / 2
  abGlow.position.set(0, -0.1, 0.5)
  body.add(abGlow)

  return finalize(g)
}

/* ------------------------------------------------------------------ */
/* HEAD — slim single-amber-optic visored head                        */
/* ------------------------------------------------------------------ */

/**
 * Slim angular head with a single glowing amber optic in a dark visor recess,
 * built around the head-slot origin sitting just above the neck.
 * (id: head-harrier-visor)
 */
export function createHarrierHead(): THREE.Group {
  const g = new THREE.Group()

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.2, 10), frameMat())
  neck.position.y = -0.34
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

  return finalize(g)
}

/* ------------------------------------------------------------------ */
/* ARM A — blade-rifle                                                 */
/* ------------------------------------------------------------------ */

/** Shared upper arm structure for both variants: shoulder→elbow→wrist chain. */
function buildArmBase(g: THREE.Group, trimPauldron: boolean): {
  shoulder: THREE.Vector3
  wrist: THREE.Vector3
} {
  const shoulder = new THREE.Vector3(0, 0, 0)
  const elbow = new THREE.Vector3(0, -0.68, 0.2)
  const wrist = new THREE.Vector3(0, -1.06, 0.36)

  const pauldron = panelPlate(0.58, 0.52, 0.58, { inset: 0.1, raise: 0.05, trim: trimPauldron })
  pauldron.position.set(0, 0.14, 0)
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

  return { shoulder, wrist }
}

/**
 * Arm variant A: a slim blade-rifle pointing +Z with an under-barrel mono-blade.
 * Built hanging DOWN from the shoulder origin, weapon at the bottom/front so it
 * mirrors onto either shoulder. (id: arm-harrier-blade-rifle)
 */
export function createHarrierArmBladeRifle(): THREE.Group {
  const g = new THREE.Group()
  const { wrist } = buildArmBase(g, true)

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

  return finalize(g)
}

/* ------------------------------------------------------------------ */
/* ARM B — shoulder missile pod                                        */
/* ------------------------------------------------------------------ */

/**
 * Arm variant B: a shoulder-mounted multi-tube missile pod above a compact
 * gripping hand. Built hanging DOWN from the shoulder origin so it mirrors onto
 * either shoulder. (id: arm-harrier-missile-pod)
 */
export function createHarrierArmMissilePod(): THREE.Group {
  const g = new THREE.Group()
  const { wrist } = buildArmBase(g, false)

  // Small forearm guard plate with red slash.
  const guard = plate(0.34, 0.4, 0.12, accentRedMat())
  guard.position.set(-0.14, -0.88, 0.24)
  guard.rotation.y = 0.3
  g.add(guard)

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

  // Shoulder-mounted missile pod, sitting above and slightly outboard.
  const pod = new THREE.Group()
  pod.name = 'missile-pod'
  pod.position.set(0.0, 0.46, -0.04)
  pod.rotation.y = 0.1

  const housing = plate(0.56, 0.5, 0.66, armorMat())
  pod.add(housing)
  const housingTrim = trimStripe(0.5, 0.44, { thickness: 0.02 })
  housingTrim.position.set(0, 0, 0.34)
  pod.add(housingTrim)
  const slash = plate(0.1, 0.4, 0.04, accentRedMat())
  slash.position.set(-0.29, 0, 0.05)
  slash.rotation.z = 0.5
  pod.add(slash)
  const podRivets = riveting(3, 0.16, { radius: 0.022 })
  podRivets.position.set(0, 0.2, 0.34)
  pod.add(podRivets)

  // 2x3 grid of forward-facing launch tubes with amber glow cores.
  for (const cx of [-1, 0, 1] as const) {
    for (const cy of [-1, 1] as const) {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.12, 10), ventMat())
      tube.rotation.x = Math.PI / 2
      tube.position.set(cx * 0.16, cy * 0.12, 0.36)
      pod.add(tube)
      const core = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 8), glowEyeMat())
      core.rotation.x = Math.PI / 2
      core.position.set(cx * 0.16, cy * 0.12, 0.4)
      pod.add(core)
    }
  }

  // Rear exhaust vent.
  const exhaust = ventSlats(3, 0.44, 0.34, { depth: 0.05 })
  exhaust.position.set(0, 0, -0.34)
  exhaust.rotation.y = Math.PI
  pod.add(exhaust)

  g.add(pod)

  return finalize(g)
}

/* ------------------------------------------------------------------ */
/* RACK — twin booster pack                                            */
/* ------------------------------------------------------------------ */

/**
 * Back-mounted twin-booster pack with amber nozzle glow, built around the rack
 * origin (placed behind the torso). (id: rack-harrier-boosters)
 */
export function createHarrierRack(): THREE.Group {
  const g = new THREE.Group()

  const pack = plate(0.7, 0.78, 0.32, armorMat())
  g.add(pack)
  const packVent = ventSlats(4, 0.48, 0.5, { depth: 0.05 })
  packVent.position.set(0, 0.06, -0.18)
  packVent.rotation.y = Math.PI
  g.add(packVent)
  const packTrim = edgeLine(0.52)
  packTrim.position.set(0, 0.32, 0.17)
  g.add(packTrim)
  const packRivets = riveting(4, 0.16, { radius: 0.02 })
  packRivets.position.set(0, -0.3, 0.17)
  g.add(packRivets)

  for (const sx of [-1, 1] as const) {
    const boost = new THREE.Group()
    boost.name = sx < 0 ? 'booster-left' : 'booster-right'
    boost.position.set(sx * 0.3, -0.28, -0.12)
    boost.rotation.set(0.42, 0, sx * 0.1)

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.52, 12), armorMat(PALETTE.armorMid))
    boost.add(body)
    const bodyTrim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.02, 8, 16), frameMat(PALETTE.frameSteelLight))
    bodyTrim.rotation.x = Math.PI / 2
    bodyTrim.position.y = 0.1
    boost.add(bodyTrim)
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.13, 0.2, 12), frameMat())
    nozzle.position.y = -0.34
    boost.add(nozzle)
    const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.07, 12), glowEyeMat())
    glow.position.y = -0.44
    boost.add(glow)

    g.add(boost)
  }

  return finalize(g)
}
