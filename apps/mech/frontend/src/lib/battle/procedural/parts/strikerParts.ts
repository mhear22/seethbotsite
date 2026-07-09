/**
 * STRIKER modular parts — the bespoke showcase Striker (a fast, aggressive
 * skirmisher) decomposed into the game's slot system so its pieces interoperate
 * with the rest of the catalogue.
 *
 * Each builder is authored in its slot's local frame (placed at the shared
 * MODEL_ATTACH_POINTS.<slot>) so it drops straight onto the standard skeleton:
 *   - legs : group at (0,0,0); pivots 'leg-left'/'leg-right' at the hips
 *            (world y≈2.6), geometry hanging BELOW to feet at world y≈0.
 *   - core : group at (0,2.8,0); slim forward-leaning torso around origin.
 *   - head : group at (0,4.8,0); narrow angular single-visor head around origin.
 *   - arm  : two variants (long rail-cannon + compact blade), each hanging DOWN
 *            from a shoulder origin, near-centred on x so they mirror.
 *   - rack : group at (0,4.2,-0.5); swept-back thruster fins around origin.
 *
 * The silhouette (lean torso, digitigrade legs, rail-cannon + mono-blade, swept
 * fins) is re-authored per slot from showcase/striker.ts. Deliberately slim and
 * lanky — part diversity is the point.
 */

import * as THREE from 'three'
import {
  PALETTE, armorMat, frameMat, accentRedMat, glowEyeMat, ventMat,
  chamferBox, panelPlate, edgeLine, ventSlats, riveting,
} from '../detailing'

/* ------------------------------------------------------------------ */
/* Local build helpers                                                 */
/* ------------------------------------------------------------------ */

const UP = new THREE.Vector3(0, 1, 0)

/** Chamfered-box mesh with a material. */
function plate(w: number, h: number, d: number, mat: THREE.Material, bevel?: number): THREE.Mesh {
  return new THREE.Mesh(chamferBox(w, h, d, bevel), mat)
}

/** A metallic joint ball. */
function joint(radius: number, mat: THREE.Material = frameMat()): THREE.Mesh {
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 14, 10), mat)
}

/**
 * A tapered limb segment spanning from point `a` to point `b` in local space.
 * The chamfer box's long (Y) axis is rotated onto the a→b direction, so limbs
 * can be posed just by listing joint positions.
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
  const dir = b.clone().sub(a).normalize()
  mesh.quaternion.setFromUnitVectors(UP, dir)
  return mesh
}

/* ------------------------------------------------------------------ */
/* LEGS — slim reverse-knee digitigrade                                */
/* ------------------------------------------------------------------ */

/** Hip pivot height in the legs-slot local frame (matches the stock frame). */
const HIP_Y = 2.6
/** Lateral hip offset — a narrow, quick stance. */
const HIP_X = 0.5

/**
 * One slim digitigrade leg. Returned group's origin is the HIP; +Z is forward.
 * Chain: hip (0,0,0) → knee (down & FORWARD) → ankle (tucked BACK) → long toe
 * reaching forward to the ground. All geometry hangs below the hip so
 * MechEntity.animateWalk can swing rotation.x for the stride; the toe pad sole
 * rests at local y≈-2.6 → world y≈0.
 */
function buildLeg(side: -1 | 1): THREE.Group {
  const g = new THREE.Group()
  g.name = side < 0 ? 'leg-left' : 'leg-right'
  g.position.set(side * HIP_X, HIP_Y, 0)

  const hip = new THREE.Vector3(0, 0, 0)
  const knee = new THREE.Vector3(0, -0.9, 0.34)
  const ankle = new THREE.Vector3(0, -1.82, -0.18)
  const toe = new THREE.Vector3(0, -2.5, 0.34)

  // Hip actuator + armour cap.
  const hipBall = joint(0.22)
  hipBall.position.copy(hip)
  g.add(hipBall)
  const hipCap = plate(0.46, 0.46, 0.46, armorMat(PALETTE.armorMid))
  hipCap.position.set(side * 0.05, 0.02, 0)
  g.add(hipCap)

  // Thigh (hip → knee): thin frame core showing behind a slim armour plate.
  g.add(limbSegment(hip, knee, 0.26, 0.3, frameMat()))
  const thighArmor = limbSegment(
    hip.clone().add(new THREE.Vector3(0, -0.04, 0.02)), knee, 0.38, 0.44, armorMat(),
  )
  g.add(thighArmor)
  const thighVent = ventSlats(2, 0.24, 0.3, { depth: 0.05 })
  thighVent.position.set(side * 0.2, -0.42, 0.12)
  thighVent.rotation.y = side * Math.PI / 2
  g.add(thighVent)

  // Knee joint (forward-most point — the reverse-joint signature).
  const kneeBall = joint(0.18)
  kneeBall.position.copy(knee)
  g.add(kneeBall)
  const kneeGuard = plate(0.3, 0.4, 0.24, accentRedMat())
  kneeGuard.position.set(0, knee.y + 0.04, knee.z + 0.2)
  kneeGuard.rotation.x = -0.4
  g.add(kneeGuard)

  // Shin (knee → ankle): slim and blade-like, angling down and BACK.
  g.add(limbSegment(knee, ankle, 0.22, 0.36, frameMat()))
  const shinArmor = limbSegment(
    knee, ankle.clone().add(new THREE.Vector3(0, 0.02, 0)), 0.3, 0.44, armorMat(),
  )
  g.add(shinArmor)
  const shinTrim = edgeLine(0.72)
  shinTrim.position.set(0, (knee.y + ankle.y) / 2, 0.02)
  shinTrim.rotation.set(-1.15, 0, Math.PI / 2)
  g.add(shinTrim)

  // Ankle actuator.
  const ankleBall = joint(0.15)
  ankleBall.position.copy(ankle)
  g.add(ankleBall)

  // Long metatarsal (ankle → toe) bridging to the ground so the foot never
  // floats, plus a rearward heel spur for stance.
  g.add(limbSegment(ankle, toe, 0.22, 0.28, frameMat()))
  const footArmor = limbSegment(ankle, toe, 0.28, 0.34, armorMat())
  g.add(footArmor)
  const heel = limbSegment(ankle, new THREE.Vector3(0, -2.42, -0.36), 0.18, 0.2, frameMat())
  g.add(heel)

  // Fore toe pad on the ground (sole ≈ local y -2.6 → world 0).
  const toePad = plate(0.34, 0.14, 0.58, armorMat(PALETTE.armorMid))
  toePad.position.set(0, -2.53, toe.z + 0.12)
  g.add(toePad)
  const clawTip = plate(0.26, 0.11, 0.22, frameMat())
  clawTip.position.set(0, -2.55, toe.z + 0.4)
  clawTip.rotation.x = 0.3
  g.add(clawTip)

  // Amber sensor dot on the outer ankle.
  const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), glowEyeMat())
  sensor.position.set(side * 0.12, ankle.y + 0.12, ankle.z + 0.14)
  g.add(sensor)

  return g
}

/** Slim reverse-knee legs slot part (id: legs-striker-skirmisher). */
export function createStrikerLegs(): THREE.Group {
  const legs = new THREE.Group()

  // Pelvis / hip yoke just under the core attach.
  const pelvis = plate(0.94, 0.5, 0.6, armorMat())
  pelvis.position.set(0, HIP_Y + 0.05, 0)
  legs.add(pelvis)
  const pelvisGuard = plate(0.66, 0.32, 0.46, frameMat())
  pelvisGuard.position.set(0, HIP_Y - 0.02, 0.26)
  legs.add(pelvisGuard)
  const pelvisTrim = edgeLine(0.8, { thickness: 0.024, mat: accentRedMat() })
  pelvisTrim.rotation.z = Math.PI / 2
  pelvisTrim.position.set(0, HIP_Y + 0.24, 0.31)
  legs.add(pelvisTrim)
  // Hip flare skirts.
  for (const sx of [-1, 1] as const) {
    const skirt = plate(0.28, 0.42, 0.38, armorMat(PALETTE.armorMid))
    skirt.position.set(sx * 0.54, HIP_Y - 0.1, 0.06)
    skirt.rotation.z = sx * 0.3
    legs.add(skirt)
  }

  legs.add(buildLeg(-1))
  legs.add(buildLeg(1))
  return legs
}

/* ------------------------------------------------------------------ */
/* CORE — slim forward-leaning torso                                   */
/* ------------------------------------------------------------------ */

/**
 * Striker torso slot part (id: core-striker-lean). Built around local origin
 * (0,0,0) → world (0,2.8,0): waist at local y≈-0.3 (world 2.5, meets the legs'
 * pelvis), shoulders at local y≈+1.05 (world 3.85, arm attach), neck stub at
 * local y≈+1.6 (world 4.4). Slim and canted forward for a predatory read; the
 * neck stub and shoulder mounts stay square so mixed loadouts still line up.
 */
export function createStrikerCore(): THREE.Group {
  const g = new THREE.Group()

  // Main chest plate, canted forward for the predatory lean.
  const chest = plate(1.5, 1.0, 0.78, armorMat())
  chest.position.set(0, 0.4, 0.04)
  chest.rotation.x = 0.12
  g.add(chest)
  // Raised sternum plate with gold trim.
  const sternum = panelPlate(0.86, 0.76, 0.2, { inset: 0.14, raise: 0.05, trim: true })
  sternum.position.set(0, 0.44, 0.44)
  sternum.rotation.x = 0.12
  g.add(sternum)
  // Red chest intake.
  const intake = ventSlats(3, 0.54, 0.38, { depth: 0.06 })
  intake.position.set(0, 0.08, 0.48)
  intake.rotation.x = 0.12
  g.add(intake)

  // Collar / cowl at the shoulders.
  const collar = plate(1.24, 0.34, 0.62, armorMat(PALETTE.armorMid))
  collar.position.set(0, 1.02, 0.02)
  g.add(collar)
  const collarRivets = riveting(3, 0.28, { radius: 0.022 })
  collarRivets.position.set(0, 1.08, 0.32)
  g.add(collarRivets)

  // Square shoulder mounts at world 3.85 (arm attach line).
  for (const sx of [-1, 1] as const) {
    const shoulder = plate(0.4, 0.34, 0.5, armorMat())
    shoulder.position.set(sx * 0.74, 1.05, 0)
    g.add(shoulder)
    const shoulderBall = joint(0.16)
    shoulderBall.position.set(sx * 0.86, 1.02, 0)
    g.add(shoulderBall)
  }

  // Neck stub at the top (world ≈4.4), square and vertical for the head.
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.34, 10), frameMat())
  neck.position.set(0, 1.48, 0.02)
  g.add(neck)

  // Slim waist taper down to the pelvis.
  const waist = plate(0.82, 0.5, 0.56, frameMat())
  waist.position.set(0, -0.3, 0)
  g.add(waist)
  const abGuard = plate(0.56, 0.4, 0.46, accentRedMat())
  abGuard.position.set(0, -0.26, 0.24)
  g.add(abGuard)

  return g
}

/* ------------------------------------------------------------------ */
/* HEAD — narrow angular single-visor                                  */
/* ------------------------------------------------------------------ */

/** Narrow angular head with a single glowing visor slit (id: head-striker-visor). */
export function createStrikerHead(): THREE.Group {
  const g = new THREE.Group()

  // Neck connector down onto the core's neck stub.
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.24, 10), frameMat())
  neck.position.y = -0.36
  g.add(neck)

  // Angular helmet wedge (slightly narrower at the back).
  const skull = plate(0.46, 0.44, 0.56, armorMat(), 0.06)
  g.add(skull)
  const brow = plate(0.5, 0.14, 0.3, armorMat(PALETTE.armorMid))
  brow.position.set(0, 0.18, 0.16)
  brow.rotation.x = 0.2
  g.add(brow)
  // Cheek vents.
  for (const sx of [-1, 1] as const) {
    const cheek = ventSlats(2, 0.12, 0.2, { depth: 0.04 })
    cheek.position.set(sx * 0.22, -0.04, 0.2)
    cheek.rotation.y = sx * 0.5
    g.add(cheek)
  }

  // Single glowing visor slit across the front.
  const visorFrame = plate(0.46, 0.13, 0.05, ventMat())
  visorFrame.position.set(0, 0.02, 0.27)
  g.add(visorFrame)
  const visor = plate(0.42, 0.07, 0.06, glowEyeMat())
  visor.position.set(0, 0.02, 0.29)
  g.add(visor)

  // Swept sensor crest + antenna.
  const crest = plate(0.06, 0.4, 0.1, accentRedMat())
  crest.position.set(-0.14, 0.34, -0.06)
  crest.rotation.x = -0.5
  g.add(crest)
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.02, 0.42, 6), frameMat(PALETTE.frameSteelLight))
  antenna.position.set(0.16, 0.36, -0.02)
  antenna.rotation.x = -0.35
  g.add(antenna)

  return g
}

/* ------------------------------------------------------------------ */
/* ARMS — rail-cannon + blade (hang DOWN from the shoulder origin)     */
/* ------------------------------------------------------------------ */

/**
 * Long slim rail-cannon arm (id: arm-striker-railcannon). Origin is the
 * shoulder joint; the arm hangs down to the elbow and cantilevers a long rail
 * barrel forward (+Z). Near-centred on x so it mirrors onto either shoulder.
 */
export function createStrikerRailArm(): THREE.Group {
  const g = new THREE.Group()

  const shoulder = new THREE.Vector3(0, 0, 0)
  const elbow = new THREE.Vector3(0.04, -0.72, 0.24)

  // Layered pauldron over the shoulder.
  const pauldron = panelPlate(0.58, 0.5, 0.58, { inset: 0.1, raise: 0.05 })
  pauldron.position.set(-0.04, 0.12, 0)
  g.add(pauldron)
  const shoulderBall = joint(0.19)
  shoulderBall.position.copy(shoulder)
  g.add(shoulderBall)

  // Upper arm.
  g.add(limbSegment(shoulder, elbow, 0.24, 0.28, frameMat()))
  const upperArmor = limbSegment(
    shoulder.clone().add(new THREE.Vector3(0, -0.06, 0)), elbow, 0.32, 0.36, armorMat(),
  )
  g.add(upperArmor)
  const elbowBall = joint(0.15)
  elbowBall.position.copy(elbow)
  g.add(elbowBall)

  // Forearm weapon housing, cantilevered forward.
  const housing = plate(0.38, 0.4, 0.7, armorMat())
  housing.position.set(0.02, elbow.y - 0.06, elbow.z + 0.4)
  g.add(housing)
  const housingVent = ventSlats(2, 0.28, 0.28, { depth: 0.05, horizontal: true })
  housingVent.position.set(0.2, elbow.y - 0.06, elbow.z + 0.4)
  housingVent.rotation.y = Math.PI / 2
  g.add(housingVent)

  // Rail-cannon barrel: long slim spine pointing +Z.
  const barZ0 = elbow.z + 0.48
  const barLen = 1.1
  const barCz = barZ0 + barLen / 2
  const barrel = plate(0.28, 0.28, barLen, frameMat(PALETTE.frameSteelLight))
  barrel.position.set(0.02, elbow.y + 0.02, barCz)
  g.add(barrel)
  // Twin accelerator rails riding the barrel.
  for (const sx of [-1, 1] as const) {
    const rail = plate(0.05, 0.09, barLen + 0.1, accentRedMat())
    rail.position.set(0.02 + sx * 0.16, elbow.y + 0.02, barCz)
    g.add(rail)
  }
  // Gold trim line along the barrel top.
  const barrelTrim = edgeLine(barLen)
  barrelTrim.position.set(0.02, elbow.y + 0.16, barCz)
  barrelTrim.rotation.y = Math.PI / 2
  g.add(barrelTrim)
  // Muzzle brake ring.
  const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.16, 0.22, 8), frameMat())
  muzzle.rotation.x = Math.PI / 2
  muzzle.position.set(0.02, elbow.y + 0.02, barZ0 + barLen + 0.05)
  g.add(muzzle)
  // Amber charge glow at the breach.
  const breach = plate(0.16, 0.16, 0.1, glowEyeMat())
  breach.position.set(0.02, elbow.y + 0.02, barZ0 + 0.02)
  g.add(breach)

  return g
}

/**
 * Compact blade arm (id: arm-striker-blade). Origin is the shoulder joint; the
 * arm hangs down through an elbow and wrist to a long swept mono-blade pointing
 * forward. Near-centred on x so it mirrors onto either shoulder.
 */
export function createStrikerBladeArm(): THREE.Group {
  const g = new THREE.Group()

  const shoulder = new THREE.Vector3(0, 0, 0)
  const elbow = new THREE.Vector3(-0.04, -0.72, 0.2)
  const wrist = new THREE.Vector3(-0.02, -1.12, 0.42)

  const pauldron = panelPlate(0.56, 0.48, 0.56, { inset: 0.1, raise: 0.05 })
  pauldron.position.set(0.04, 0.12, 0)
  g.add(pauldron)
  const shoulderBall = joint(0.19)
  shoulderBall.position.copy(shoulder)
  g.add(shoulderBall)

  g.add(limbSegment(shoulder, elbow, 0.24, 0.28, frameMat()))
  const upperArmor = limbSegment(
    shoulder.clone().add(new THREE.Vector3(0, -0.06, 0)), elbow, 0.32, 0.36, armorMat(),
  )
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

  // Blade emitter housing on the wrist.
  const hilt = plate(0.26, 0.22, 0.32, armorMat(PALETTE.armorMid))
  hilt.position.set(wrist.x, wrist.y - 0.08, wrist.z + 0.16)
  g.add(hilt)
  const hiltGlow = plate(0.1, 0.1, 0.12, glowEyeMat())
  hiltGlow.position.set(wrist.x, wrist.y - 0.08, wrist.z + 0.3)
  g.add(hiltGlow)

  // Long swept mono-blade pointing forward and slightly down.
  const blade = new THREE.Group()
  blade.name = 'blade'
  blade.position.set(wrist.x, wrist.y - 0.12, wrist.z + 0.3)
  blade.rotation.x = 0.3
  const bladeBody = plate(0.1, 0.5, 1.2, frameMat(PALETTE.frameSteelLight), 0.03)
  bladeBody.position.z = 0.6
  blade.add(bladeBody)
  const bladeTip = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.5, 4), frameMat(PALETTE.frameSteelLight))
  bladeTip.rotation.set(Math.PI / 2, Math.PI / 4, 0)
  bladeTip.scale.set(1, 1, 0.42)
  bladeTip.position.z = 1.45
  blade.add(bladeTip)
  const edge = edgeLine(1.2, { thickness: 0.03 })
  edge.position.set(0, 0.25, 0.6)
  edge.rotation.y = Math.PI / 2
  blade.add(edge)
  g.add(blade)

  return g
}

/* ------------------------------------------------------------------ */
/* RACK — swept-back thruster fins                                     */
/* ------------------------------------------------------------------ */

/**
 * Back-mounted thruster pack with two swept fins and amber nozzle glow
 * (id: rack-striker-thrusterfins). Built around origin → placed behind the
 * torso at (0,4.2,-0.5); fins sweep up and back for a fast, aggressive read.
 */
export function createStrikerRack(): THREE.Group {
  const g = new THREE.Group()

  // Central pack block.
  const pack = plate(0.7, 0.82, 0.32, armorMat())
  g.add(pack)
  const packVent = ventSlats(3, 0.5, 0.5, { depth: 0.05 })
  packVent.position.set(0, 0.05, -0.18)
  packVent.rotation.y = Math.PI
  g.add(packVent)

  for (const sx of [-1, 1] as const) {
    const fin = new THREE.Group()
    fin.name = sx < 0 ? 'fin-left' : 'fin-right'
    fin.position.set(sx * 0.32, 0.28, -0.1)
    fin.rotation.set(-0.34, sx * 0.16, sx * 0.14)

    const finBody = plate(0.22, 1.05, 0.14, armorMat(PALETTE.armorMid), 0.04)
    finBody.position.y = 0.4
    fin.add(finBody)
    const finTrim = edgeLine(0.95)
    finTrim.position.set(0, 0.45, 0.08)
    finTrim.rotation.z = Math.PI / 2
    fin.add(finTrim)

    // Nozzle at the fin base with an amber thruster glow.
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 0.22, 10), frameMat())
    nozzle.position.set(0, -0.12, 0)
    fin.add(nozzle)
    const nozzleGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 10), glowEyeMat())
    nozzleGlow.position.set(0, -0.24, 0)
    fin.add(nozzleGlow)

    g.add(fin)
  }

  return g
}
