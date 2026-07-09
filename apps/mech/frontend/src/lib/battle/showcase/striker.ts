/**
 * STRIKER — a fast, aggressive skirmisher mech.
 *
 * Sleek forward-leaning torso, slim digitigrade (reverse-knee) legs built for
 * speed, a narrow angular head with a single glowing visor-slit, a long slim
 * rail-cannon on the left arm and a compact blade on the right, plus swept
 * back-mounted thruster fins with a small amber glow. Lean and predatory.
 *
 * Pure procedural three.js geometry built only from the shared art toolkit so
 * it matches the game's gritty-industrial look. Faces +Z, stands on y=0,
 * centered on x=0/z=0.
 */

import * as THREE from 'three'
import {
  PALETTE, armorMat, frameMat, accentRedMat, trimGoldMat, glowEyeMat, ventMat,
  chamferBox, panelPlate, trimStripe, edgeLine, ventSlats, bolt, riveting,
} from '../procedural/detailing'

/* ------------------------------------------------------------------ */
/* Local build helpers                                                 */
/* ------------------------------------------------------------------ */

/** Build a chamfered-box mesh with a material (shadows are set globally later). */
function plate(w: number, h: number, d: number, mat: THREE.Material, bevel?: number): THREE.Mesh {
  return new THREE.Mesh(chamferBox(w, h, d, bevel), mat)
}

/** A metallic joint ball. */
function joint(radius: number, mat: THREE.Material = frameMat()): THREE.Mesh {
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 14, 10), mat)
}

const UP = new THREE.Vector3(0, 1, 0)

/**
 * A tapered limb segment spanning from point `a` to point `b` in local space.
 * The chamfer box's long (Y) axis is rotated to align with the a→b direction,
 * so limbs can be posed just by listing joint positions.
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
/* Sub-assemblies                                                      */
/* ------------------------------------------------------------------ */

/**
 * One slim digitigrade leg, built around a hip origin at local (0,0,0) with the
 * chain descending in -Y. Reverse-knee: the knee kicks forward (+Z), the ankle
 * tucks back (-Z), and a long toe reaches forward to the ground.
 */
function buildLeg(side: -1 | 1): THREE.Group {
  const g = new THREE.Group()
  g.name = side < 0 ? 'leg-left' : 'leg-right'

  const hip = new THREE.Vector3(0, 0, 0)
  const knee = new THREE.Vector3(0, -0.72, 0.30)
  const ankle = new THREE.Vector3(0, -1.46, -0.16)
  const toe = new THREE.Vector3(0, -2.12, 0.30)

  // Hip actuator + armor cap.
  const hipBall = joint(0.24)
  hipBall.position.copy(hip)
  g.add(hipBall)
  const hipCap = plate(0.5, 0.5, 0.5, armorMat(PALETTE.armorMid))
  hipCap.position.set(side * 0.05, 0.04, 0.0)
  g.add(hipCap)

  // Thigh (hip -> knee) with a thin frame core showing behind the plate.
  g.add(limbSegment(hip, knee, 0.30, 0.34, frameMat()))
  const thighArmor = limbSegment(hip.clone().add(new THREE.Vector3(0, -0.04, 0.02)), knee, 0.44, 0.5, armorMat())
  g.add(thighArmor)
  // Thigh side vent.
  const thighVent = ventSlats(2, 0.28, 0.34, { depth: 0.05 })
  thighVent.position.set(side * 0.24, -0.34, 0.14)
  thighVent.rotation.y = side * Math.PI / 2
  g.add(thighVent)

  // Knee guard + actuator.
  const kneeBall = joint(0.2)
  kneeBall.position.copy(knee)
  g.add(kneeBall)
  const kneeGuard = plate(0.34, 0.42, 0.26, accentRedMat())
  kneeGuard.position.set(0, knee.y + 0.04, knee.z + 0.22)
  kneeGuard.rotation.x = -0.4
  g.add(kneeGuard)

  // Shin (knee -> ankle), slim and blade-like.
  g.add(limbSegment(knee, ankle, 0.26, 0.42, frameMat()))
  const shinArmor = limbSegment(knee, ankle.clone().add(new THREE.Vector3(0, 0.02, 0)), 0.34, 0.5, armorMat())
  g.add(shinArmor)
  // Gold shin slash.
  const shinTrim = edgeLine(0.6)
  shinTrim.position.set(0, knee.y - 0.4, 0.02)
  shinTrim.rotation.set(-1.15, 0, Math.PI / 2)
  g.add(shinTrim)

  // Ankle actuator.
  const ankleBall = joint(0.17)
  ankleBall.position.copy(ankle)
  g.add(ankleBall)

  // Long metatarsal (ankle -> toe) + a rearward heel spur for stance.
  g.add(limbSegment(ankle, toe, 0.24, 0.30, frameMat()))
  const footArmor = limbSegment(ankle, toe, 0.30, 0.36, armorMat())
  g.add(footArmor)
  const heel = limbSegment(ankle, new THREE.Vector3(0, -2.05, -0.34), 0.2, 0.22, frameMat())
  g.add(heel)

  // Fore toe pad on the ground.
  const toePad = plate(0.36, 0.16, 0.6, armorMat(PALETTE.armorMid))
  toePad.position.set(0, -2.12, toe.z + 0.14)
  g.add(toePad)
  const clawTip = plate(0.28, 0.12, 0.24, frameMat())
  clawTip.position.set(0, -2.14, toe.z + 0.42)
  clawTip.rotation.x = 0.3
  g.add(clawTip)

  return g
}

/** Left arm: shoulder, upper arm, and a long slim rail-cannon forearm. */
function buildCannonArm(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'arm-left'

  const shoulder = new THREE.Vector3(0, 0, 0)
  const elbow = new THREE.Vector3(0.05, -0.7, 0.24)

  // Layered pauldron over the shoulder.
  const pauldron = panelPlate(0.6, 0.52, 0.6, { inset: 0.1, raise: 0.05 })
  pauldron.position.set(-0.06, 0.14, 0)
  pauldron.rotation.z = 0.12
  g.add(pauldron)
  const shoulderBall = joint(0.2)
  shoulderBall.position.copy(shoulder)
  g.add(shoulderBall)

  // Upper arm.
  g.add(limbSegment(shoulder, elbow, 0.26, 0.3, frameMat()))
  const upperArmor = limbSegment(shoulder.clone().add(new THREE.Vector3(0, -0.06, 0)), elbow, 0.34, 0.38, armorMat())
  g.add(upperArmor)
  const elbowBall = joint(0.16)
  elbowBall.position.copy(elbow)
  g.add(elbowBall)

  // Forearm weapon housing, cantilevered forward.
  const housing = plate(0.4, 0.42, 0.72, armorMat())
  housing.position.set(0.02, elbow.y - 0.06, elbow.z + 0.42)
  g.add(housing)
  const housingVent = ventSlats(2, 0.3, 0.3, { depth: 0.05, horizontal: true })
  housingVent.position.set(0.22, elbow.y - 0.06, elbow.z + 0.42)
  housingVent.rotation.y = Math.PI / 2
  g.add(housingVent)

  // Rail-cannon barrel: long slim spine pointing +Z.
  const barZ0 = elbow.z + 0.5
  const barLen = 1.12
  const barCz = barZ0 + barLen / 2
  const barrel = plate(0.3, 0.3, barLen, frameMat(PALETTE.frameSteelLight))
  barrel.position.set(0.02, elbow.y + 0.02, barCz)
  g.add(barrel)
  // Twin accelerator rails riding the barrel.
  for (const sx of [-1, 1] as const) {
    const rail = plate(0.05, 0.09, barLen + 0.1, accentRedMat())
    rail.position.set(0.02 + sx * 0.17, elbow.y + 0.02, barCz)
    g.add(rail)
  }
  // Gold trim line along the barrel top.
  const barrelTrim = edgeLine(barLen)
  barrelTrim.position.set(0.02, elbow.y + 0.17, barCz)
  barrelTrim.rotation.y = Math.PI / 2
  g.add(barrelTrim)
  // Muzzle brake ring.
  const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.22, 8), frameMat())
  muzzle.rotation.x = Math.PI / 2
  muzzle.position.set(0.02, elbow.y + 0.02, barZ0 + barLen + 0.05)
  g.add(muzzle)
  // Small amber charge glow at the breach.
  const breach = plate(0.16, 0.16, 0.1, glowEyeMat())
  breach.position.set(0.02, elbow.y + 0.02, barZ0 + 0.02)
  g.add(breach)

  return g
}

/** Right arm: shoulder, forearm, and a compact swept blade. */
function buildBladeArm(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'arm-right'

  const shoulder = new THREE.Vector3(0, 0, 0)
  const elbow = new THREE.Vector3(-0.05, -0.7, 0.2)
  const wrist = new THREE.Vector3(-0.02, -1.08, 0.42)

  const pauldron = panelPlate(0.58, 0.5, 0.58, { inset: 0.1, raise: 0.05 })
  pauldron.position.set(0.06, 0.14, 0)
  pauldron.rotation.z = -0.12
  g.add(pauldron)
  const shoulderBall = joint(0.2)
  shoulderBall.position.copy(shoulder)
  g.add(shoulderBall)

  g.add(limbSegment(shoulder, elbow, 0.26, 0.3, frameMat()))
  const upperArmor = limbSegment(shoulder.clone().add(new THREE.Vector3(0, -0.06, 0)), elbow, 0.34, 0.38, armorMat())
  g.add(upperArmor)
  const elbowBall = joint(0.16)
  elbowBall.position.copy(elbow)
  g.add(elbowBall)

  g.add(limbSegment(elbow, wrist, 0.24, 0.28, frameMat()))
  const foreArmor = limbSegment(elbow, wrist, 0.32, 0.34, armorMat())
  g.add(foreArmor)
  const wristBall = joint(0.14)
  wristBall.position.copy(wrist)
  g.add(wristBall)

  // Blade emitter housing on the wrist.
  const hilt = plate(0.28, 0.24, 0.34, armorMat(PALETTE.armorMid))
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
  // Tapered tip.
  const bladeTip = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.5, 4), frameMat(PALETTE.frameSteelLight))
  bladeTip.rotation.set(Math.PI / 2, Math.PI / 4, 0)
  bladeTip.scale.set(1, 1, 0.42)
  bladeTip.position.z = 1.45
  blade.add(bladeTip)
  // Gold cutting-edge line.
  const edge = edgeLine(1.2, { thickness: 0.03 })
  edge.position.set(0, 0.25, 0.6)
  edge.rotation.y = Math.PI / 2
  blade.add(edge)
  g.add(blade)

  return g
}

/** Backpack with two swept thruster fins and amber nozzle glow. */
function buildThrusterPack(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'thrusters'

  // Central pack block.
  const pack = plate(0.7, 0.8, 0.32, armorMat())
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

/** Narrow angular head with a single glowing visor slit. */
function buildHead(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'head'

  // Neck actuator.
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.2, 10), frameMat())
  neck.position.y = -0.18
  g.add(neck)

  // Angular helmet wedge (slightly narrower at the back).
  const skull = plate(0.46, 0.42, 0.56, armorMat(), 0.06)
  g.add(skull)
  const brow = plate(0.5, 0.14, 0.3, armorMat(PALETTE.armorMid))
  brow.position.set(0, 0.16, 0.16)
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
  const visor = plate(0.42, 0.07, 0.06, glowEyeMat())
  visor.position.set(0, 0.02, 0.29)
  g.add(visor)
  const visorFrame = plate(0.46, 0.13, 0.05, ventMat())
  visorFrame.position.set(0, 0.02, 0.27)
  g.add(visorFrame)

  // Swept sensor crest / antenna.
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

/** Forward-leaning torso with chest intake, plus mounts for head/arms/pack. */
function buildTorso(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'torso'
  g.position.set(0, 2.35, 0.02)
  g.rotation.x = 0.15 // predatory forward lean

  // Main chest plate.
  const chest = plate(1.44, 1.0, 0.82, armorMat())
  chest.position.set(0, 0.5, 0.02)
  g.add(chest)
  // Raised sternum plate with gold trim.
  const sternum = panelPlate(0.9, 0.8, 0.2, { inset: 0.14, raise: 0.05, trim: true })
  sternum.position.set(0, 0.5, 0.44)
  g.add(sternum)
  // Red chest intake.
  const intake = ventSlats(3, 0.56, 0.4, { depth: 0.06 })
  intake.position.set(0, 0.18, 0.5)
  g.add(intake)

  // Collar / cowl over the shoulders.
  const collar = plate(1.2, 0.36, 0.66, armorMat(PALETTE.armorMid))
  collar.position.set(0, 1.08, 0.04)
  g.add(collar)
  const collarRivets = riveting(3, 0.28, { radius: 0.022 })
  collarRivets.position.set(0, 1.16, 0.36)
  g.add(collarRivets)

  // Slim waist taper down to the pelvis.
  const waist = plate(0.86, 0.5, 0.6, frameMat())
  waist.position.set(0, -0.16, 0)
  g.add(waist)
  const abGuard = plate(0.6, 0.42, 0.5, accentRedMat())
  abGuard.position.set(0, -0.14, 0.26)
  g.add(abGuard)

  // Head, mounted on the collar (leans with the torso).
  const head = buildHead()
  head.position.set(0, 1.5, 0.16)
  g.add(head)

  // Shoulder mounts + arms.
  const cannonArm = buildCannonArm()
  cannonArm.position.set(-1.12, 1.18, 0.02)
  g.add(cannonArm)
  const bladeArm = buildBladeArm()
  bladeArm.position.set(1.12, 1.18, 0.02)
  g.add(bladeArm)

  // Thruster pack on the back.
  const pack = buildThrusterPack()
  pack.position.set(0, 0.66, -0.46)
  g.add(pack)

  return g
}

/* ------------------------------------------------------------------ */
/* Root assembly                                                       */
/* ------------------------------------------------------------------ */

/**
 * Assemble the complete Striker mech. Returns a root Group standing on y=0,
 * centered on x/z, facing +Z.
 */
export function createStrikerMech(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'striker-mech'

  // Pelvis block (does not lean; the legs hang from it).
  const pelvis = new THREE.Group()
  pelvis.name = 'pelvis'
  pelvis.position.set(0, 2.14, -0.02)
  const pelvisBlock = plate(1.02, 0.5, 0.66, armorMat())
  pelvis.add(pelvisBlock)
  const pelvisGuard = plate(0.7, 0.32, 0.5, frameMat())
  pelvisGuard.position.set(0, -0.06, 0.28)
  pelvis.add(pelvisGuard)
  // Small hip flare skirts.
  for (const sx of [-1, 1] as const) {
    const skirt = plate(0.3, 0.44, 0.4, armorMat(PALETTE.armorMid))
    skirt.position.set(sx * 0.56, -0.1, 0.06)
    skirt.rotation.z = sx * 0.3
    pelvis.add(skirt)
  }
  root.add(pelvis)

  // Legs.
  const legL = buildLeg(-1)
  legL.position.set(-0.5, 2.14, 0)
  root.add(legL)
  const legR = buildLeg(1)
  legR.position.set(0.5, 2.14, 0)
  root.add(legR)

  // Torso (with head, arms, thrusters).
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
