/**
 * VALKYRIE modular parts — the bespoke aerospace-interceptor showcase
 * (../showcase/valkyrie.ts) decomposed into the game's slot system so its pieces
 * interoperate with the rest of the catalogue.
 *
 * Every builder is authored in its slot's LOCAL frame so it drops straight onto
 * the shared skeleton:
 *   - LEGS  placed at (0,0,0): hip pivots 'leg-left'/'leg-right' at world y≈2.6,
 *           all geometry hanging BELOW down to the hover-pod soles at world y≈0.
 *   - CORE  placed at (0,2.8,0): waist at local y≈-0.3, shoulders at +1.05.
 *   - HEAD  placed at (0,4.8,0): a compact jet canopy around the origin.
 *   - ARM   placed at (±1.3,3.8,0): hangs down from the shoulder joint, beam pod
 *           on the forearm; kept centred on x so it mirrors onto either side.
 *   - RACK  placed at (0,4.2,-0.5): swept wing / thruster pack behind the torso.
 *
 * Signature Valkyrie cues carried across every part: sleek chamfered aero armour,
 * gold leading-edge piping, and amber thruster nozzles as the only emissive glow.
 */

import * as THREE from 'three'
import {
  PALETTE, armorMat, frameMat, accentRedMat, trimGoldMat, glowEyeMat, ventMat,
  chamferBox, panelPlate, trimStripe, edgeLine, ventSlats, riveting,
} from '../detailing'

/* ------------------------------------------------------------------ */
/* shared builders                                                     */
/* ------------------------------------------------------------------ */

/** A flared thruster nozzle whose glowing amber exit faces local +Z. */
function nozzle(r: number, len: number): THREE.Group {
  const g = new THREE.Group()
  g.name = 'nozzle'
  const frameLite = frameMat(PALETTE.frameSteelLight)
  const vent = ventMat()
  const glow = glowEyeMat()

  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 1.32, r * 0.82, len, 14, 1, true),
    frameLite,
  )
  shell.rotation.x = Math.PI / 2 // axis -> Z, flared mouth at +Z
  g.add(shell)

  const throat = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 1.02, r * 0.62, len * 0.7, 14, 1, true),
    vent,
  )
  throat.rotation.x = Math.PI / 2
  throat.position.z = len * 0.08
  g.add(throat)

  const core = new THREE.Mesh(new THREE.CircleGeometry(r * 0.86, 16), glow)
  core.position.z = len * 0.36
  g.add(core)

  // collar bolts round the intake root
  const collar = riveting(6, 0.001, { radius: r * 0.14, mat: frameLite })
  collar.children.forEach((b: THREE.Object3D, i: number) => {
    const a = (i / 6) * Math.PI * 2
    b.position.set(Math.cos(a) * r * 1.15, Math.sin(a) * r * 1.15, -len * 0.42)
  })
  g.add(collar)

  return g
}

/** Enforce shadow flags on every mesh in a finished part group. */
function finalize(group: THREE.Group): THREE.Group {
  group.traverse((obj: THREE.Object3D) => {
    const mesh = obj as THREE.Mesh
    if (mesh.isMesh) {
      mesh.castShadow = true
      mesh.receiveShadow = true
    }
  })
  return group
}

/* ================================================================== */
/* LEGS — thruster-pod feet, calf thruster fins, amber nozzles         */
/* ================================================================== */

/** Hip pivot height in the legs-slot local frame (matches the stock frame). */
const HIP_Y = 2.6
/** Lateral hip offset — a planted interceptor stance. */
const HIP_X = 0.58

/**
 * One leg. Origin is the HIP pivot; +Z is forward; ALL geometry hangs below the
 * pivot down to the hover-pod sole at local y≈-2.6 (world 0). MechEntity swings
 * this group on rotation.x for the stride.
 */
function buildLeg(side: 1 | -1): THREE.Group {
  const leg = new THREE.Group()
  leg.name = side > 0 ? 'leg-right' : 'leg-left'
  leg.position.set(side * HIP_X, HIP_Y, 0)

  const armor = armorMat()
  const armorLite = armorMat(PALETTE.armorMid)
  const frame = frameMat()
  const frameLite = frameMat(PALETTE.frameSteelLight)
  const red = accentRedMat()
  const gold = trimGoldMat()

  // Hip ball.
  const hip = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 12), frame)
  leg.add(hip)

  // --- Thigh (top of the chain, just below the hip). ---
  const thighPiston = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 10), frameLite)
  thighPiston.position.set(0, -0.7, -0.14)
  leg.add(thighPiston)
  const thigh = new THREE.Mesh(chamferBox(0.5, 0.66, 0.5, 0.09), armor)
  thigh.position.set(side * -0.02, -0.58, 0.04)
  leg.add(thigh)
  const thighPlate = panelPlate(0.3, 0.4, 0.1, {})
  thighPlate.position.set(side * -0.02, -0.56, 0.3)
  leg.add(thighPlate)

  // --- Knee guard. ---
  const knee = new THREE.Mesh(chamferBox(0.42, 0.36, 0.4, 0.08), armorLite)
  knee.position.set(0, -0.94, 0.14)
  leg.add(knee)
  const kneeRed = new THREE.Mesh(chamferBox(0.3, 0.1, 0.1, 0.03), red)
  kneeRed.position.set(0, -0.94, 0.36)
  leg.add(kneeRed)

  // --- Calf — armoured shin carrying the swept thruster fin. ---
  const calf = new THREE.Group()
  calf.name = 'calf'
  calf.position.set(0, -1.45, 0.02)

  const shin = new THREE.Mesh(chamferBox(0.5, 0.86, 0.56, 0.09), armor)
  shin.rotation.x = -0.12
  calf.add(shin)
  const shinPlate = panelPlate(0.34, 0.6, 0.12, { trim: true })
  shinPlate.position.set(0, 0.02, 0.3)
  shinPlate.rotation.x = -0.12
  calf.add(shinPlate)
  const shinRivets = riveting(4, 0.12, { radius: 0.026 })
  shinRivets.position.set(0, -0.3, 0.31)
  calf.add(shinRivets)

  // Calf thruster fin — swept blade off the outer-rear, tipped with amber nozzle.
  const fin = new THREE.Group()
  fin.name = 'calf-fin'
  fin.position.set(side * 0.24, 0.14, -0.28)
  fin.rotation.set(0.35, side * -0.32, side * 0.18)
  const finBlade = new THREE.Mesh(chamferBox(0.16, 0.72, 0.34, 0.05), armorLite)
  fin.add(finBlade)
  const finEdge = edgeLine(0.66, { thickness: 0.03, mat: gold })
  finEdge.rotation.z = Math.PI / 2
  finEdge.position.set(side * 0.09, 0, 0.17)
  fin.add(finEdge)
  const finJet = nozzle(0.12, 0.26)
  finJet.rotation.x = Math.PI // exit -> -Z (rear)
  finJet.position.set(0, -0.4, -0.02)
  fin.add(finJet)
  calf.add(fin)
  leg.add(calf)

  // --- Ankle. ---
  const ankle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.34, 12), frame)
  ankle.rotation.z = Math.PI / 2
  ankle.position.set(0, -1.86, 0.02)
  leg.add(ankle)

  // --- Foot: a fat downward hover-pod canister; sole sits at world y≈0. ---
  const foot = new THREE.Group()
  foot.name = 'foot'
  foot.position.set(0, -2.18, 0.08)
  const pod = new THREE.Mesh(chamferBox(0.62, 0.5, 0.92, 0.1), armor)
  foot.add(pod)
  const podPlate = panelPlate(0.5, 0.34, 0.2, { trim: true, raise: 0.04 })
  podPlate.rotation.x = Math.PI / 2
  podPlate.position.set(0, 0.26, 0.02)
  foot.add(podPlate)
  const toe = new THREE.Mesh(chamferBox(0.5, 0.24, 0.4, 0.07), armorLite)
  toe.position.set(0, -0.06, 0.5)
  foot.add(toe)
  const redSlash = new THREE.Mesh(chamferBox(0.5, 0.06, 0.16, 0.02), red)
  redSlash.position.set(0, 0.02, 0.66)
  foot.add(redSlash)
  // downward hover jets under the pod (reach the ground plane)
  const jetA = nozzle(0.17, 0.3)
  jetA.rotation.x = -Math.PI / 2 // exit -> down
  jetA.position.set(-0.15, -0.2, -0.02)
  foot.add(jetA)
  const jetB = nozzle(0.17, 0.3)
  jetB.rotation.x = -Math.PI / 2
  jetB.position.set(0.15, -0.2, -0.02)
  foot.add(jetB)
  leg.add(foot)

  return leg
}

/** Thruster-pod legs slot part (id: legs-valkyrie-thruster). */
export function createValkyrieLegs(): THREE.Group {
  const legs = new THREE.Group()

  // Pelvis / hip yoke just under the core attach.
  const pelvis = new THREE.Mesh(chamferBox(1.18, 0.44, 0.7, 0.1), frameMat())
  pelvis.position.set(0, HIP_Y - 0.08, 0.02)
  legs.add(pelvis)
  const hipArmorL = new THREE.Mesh(chamferBox(0.42, 0.5, 0.5, 0.08), armorMat())
  hipArmorL.position.set(-0.5, HIP_Y - 0.1, 0.08)
  legs.add(hipArmorL)
  const hipArmorR = new THREE.Mesh(chamferBox(0.42, 0.5, 0.5, 0.08), armorMat())
  hipArmorR.position.set(0.5, HIP_Y - 0.1, 0.08)
  legs.add(hipArmorR)
  const crest = new THREE.Mesh(chamferBox(0.34, 0.5, 0.26, 0.06), armorMat(PALETTE.armorMid))
  crest.position.set(0, HIP_Y - 0.26, 0.36)
  legs.add(crest)
  const crestRed = new THREE.Mesh(chamferBox(0.14, 0.34, 0.06, 0.02), accentRedMat())
  crestRed.position.set(0, HIP_Y - 0.24, 0.52)
  legs.add(crestRed)

  legs.add(buildLeg(1), buildLeg(-1))
  return finalize(legs)
}

/* ================================================================== */
/* CORE — sleek intake breastplate, side cooling ducts                 */
/* ================================================================== */

/** Intake-torso core slot part (id: core-valkyrie-intake). */
export function createValkyrieCore(): THREE.Group {
  const torso = new THREE.Group()

  const armor = armorMat()
  const armorLite = armorMat(PALETTE.armorMid)
  const frame = frameMat()
  const frameLite = frameMat(PALETTE.frameSteelLight)
  const red = accentRedMat()
  const gold = trimGoldMat()

  // Waist — meets the legs' pelvis top (world ≈ 2.5).
  const waist = new THREE.Mesh(chamferBox(0.8, 0.44, 0.62, 0.08), frame)
  waist.position.set(0, -0.32, 0)
  torso.add(waist)

  // Main chest — a tapered aerodynamic breastplate, wide at the shoulders.
  const chest = new THREE.Mesh(chamferBox(1.82, 1.1, 0.96, 0.13), armor)
  chest.position.set(0, 0.42, 0)
  torso.add(chest)
  // Upper shoulder yoke bringing width out to the arm attach points.
  const yoke = new THREE.Mesh(chamferBox(2.1, 0.4, 0.78, 0.1), armorLite)
  yoke.position.set(0, 1.0, -0.02)
  torso.add(yoke)

  // Central sleek intake — recessed grille angled into the chest.
  const intakeHousing = new THREE.Mesh(chamferBox(0.72, 0.6, 0.22, 0.06), armorLite)
  intakeHousing.position.set(0, 0.44, 0.48)
  intakeHousing.rotation.x = -0.14
  torso.add(intakeHousing)
  const intake = ventSlats(5, 0.58, 0.48, { horizontal: false, slatMat: frameLite })
  intake.position.set(0, 0.44, 0.6)
  intake.rotation.x = -0.14
  torso.add(intake)
  const intakeTrim = trimStripe(0.66, 0.54, { thickness: 0.02, mat: gold })
  intakeTrim.position.set(0, 0.44, 0.62)
  intakeTrim.rotation.x = -0.14
  torso.add(intakeTrim)

  // Collarbone red slashes flanking the intake.
  const slashL = new THREE.Mesh(chamferBox(0.36, 0.1, 0.12, 0.03), red)
  slashL.position.set(-0.56, 0.74, 0.46)
  slashL.rotation.z = 0.3
  torso.add(slashL)
  const slashR = new THREE.Mesh(chamferBox(0.36, 0.1, 0.12, 0.03), red)
  slashR.position.set(0.56, 0.74, 0.46)
  slashR.rotation.z = -0.3
  torso.add(slashR)

  // Side chest cooling ducts.
  const ductL = ventSlats(4, 0.16, 0.5, { horizontal: false })
  ductL.position.set(-0.86, 0.4, 0.36)
  torso.add(ductL)
  const ductR = ventSlats(4, 0.16, 0.5, { horizontal: false })
  ductR.position.set(0.86, 0.4, 0.36)
  torso.add(ductR)

  // Lower chamfer trim + belly rivets.
  const bellyTrim = edgeLine(1.2, { thickness: 0.03, mat: gold })
  bellyTrim.position.set(0, -0.08, 0.5)
  torso.add(bellyTrim)
  const bellyRivets = riveting(5, 0.18, { radius: 0.026 })
  bellyRivets.position.set(0, -0.3, 0.32)
  torso.add(bellyRivets)

  // Neck stub (top, world ≈ 4.4).
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.3, 12), frame)
  neck.position.set(0, 1.5, -0.02)
  torso.add(neck)

  return finalize(torso)
}

/* ================================================================== */
/* HEAD — jet canopy with amber sensor visor                           */
/* ================================================================== */

/** Jet-canopy head slot part (id: head-valkyrie-canopy). */
export function createValkyrieHead(): THREE.Group {
  const head = new THREE.Group()

  const armor = armorMat()
  const armorLite = armorMat(PALETTE.armorMid)
  const frame = frameMat()
  const frameLite = frameMat(PALETTE.frameSteelLight)
  const glow = glowEyeMat()

  // Canopy glass — custom dark cockpit tint (new material, not a cached factory).
  const canopyGlass = new THREE.MeshStandardMaterial({
    color: 0x1a2733,
    metalness: 0.3,
    roughness: 0.18,
    emissive: 0x0a1420,
    emissiveIntensity: 0.25,
  })

  const skull = new THREE.Mesh(chamferBox(0.5, 0.44, 0.6, 0.09), armor)
  head.add(skull)
  // Swept canopy — tinted glass wedge sloping down toward the nose.
  const canopy = new THREE.Mesh(chamferBox(0.4, 0.28, 0.5, 0.07), canopyGlass)
  canopy.position.set(0, 0.08, 0.24)
  canopy.rotation.x = -0.4
  head.add(canopy)
  // Amber sensor visor glowing under the canopy lip.
  const visor = new THREE.Mesh(chamferBox(0.36, 0.06, 0.06, 0.015), glow)
  visor.position.set(0, 0.02, 0.4)
  head.add(visor)
  // Nose fin / pitot.
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 8), frameLite)
  nose.rotation.x = Math.PI / 2
  nose.position.set(0, -0.08, 0.48)
  head.add(nose)
  // Rear crest fin.
  const crestFin = new THREE.Mesh(chamferBox(0.06, 0.26, 0.4, 0.02), armorLite)
  crestFin.position.set(0, 0.22, -0.16)
  crestFin.rotation.x = 0.35
  head.add(crestFin)
  // Cheek intakes.
  const cheekL = new THREE.Mesh(chamferBox(0.09, 0.18, 0.24, 0.03), frame)
  cheekL.position.set(-0.28, -0.02, 0.08)
  head.add(cheekL)
  const cheekR = new THREE.Mesh(chamferBox(0.09, 0.18, 0.24, 0.03), frame)
  cheekR.position.set(0.28, -0.02, 0.08)
  head.add(cheekR)

  return finalize(head)
}

/* ================================================================== */
/* ARM — forearm-mounted beam pod (mirror-safe, centred on x)          */
/* ================================================================== */

/**
 * One beam-pod arm. Origin is the shoulder joint; geometry hangs from y≈0 down
 * to the hand at y≈-1.9. Kept symmetric about x with the pod slung on the front
 * face so the same builder mirrors cleanly onto either shoulder.
 */
export function createValkyrieArm(): THREE.Group {
  const arm = new THREE.Group()

  const armor = armorMat()
  const armorLite = armorMat(PALETTE.armorMid)
  const frame = frameMat()
  const frameLite = frameMat(PALETTE.frameSteelLight)
  const gold = trimGoldMat()
  const glow = glowEyeMat()

  // Swept aero pauldron capping the shoulder — symmetric twin sweeps.
  const pauldron = new THREE.Group()
  pauldron.name = 'pauldron'
  const pauldronPlate = new THREE.Mesh(chamferBox(0.64, 0.52, 0.74, 0.1), armor)
  pauldronPlate.position.set(0, 0.06, 0)
  pauldron.add(pauldronPlate)
  for (const s of [1, -1] as const) {
    const sweep = new THREE.Mesh(chamferBox(0.42, 0.15, 0.6, 0.05), armorLite)
    sweep.position.set(s * 0.24, 0.3, -0.02)
    sweep.rotation.z = s * -0.4
    pauldron.add(sweep)
  }
  const sweepEdge = edgeLine(0.6, { thickness: 0.028, mat: gold })
  sweepEdge.rotation.z = Math.PI / 2
  sweepEdge.position.set(0, 0.36, 0.3)
  pauldron.add(sweepEdge)
  const pauldronBolts = riveting(3, 0.14, { radius: 0.03 })
  pauldronBolts.position.set(0, -0.14, 0.38)
  pauldron.add(pauldronBolts)
  arm.add(pauldron)

  // Shoulder ball.
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.21, 14, 12), frame)
  ball.position.set(0, -0.34, 0)
  arm.add(ball)

  // Upper arm.
  const upper = new THREE.Mesh(chamferBox(0.38, 0.58, 0.42, 0.07), armor)
  upper.position.set(0, -0.66, 0)
  arm.add(upper)

  // Elbow.
  const elbow = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.34, 12), frameLite)
  elbow.rotation.z = Math.PI / 2
  elbow.position.set(0, -0.98, 0)
  arm.add(elbow)

  // Forearm + arm-mounted beam pod.
  const forearm = new THREE.Group()
  forearm.name = 'forearm'
  forearm.position.set(0, -1.36, 0.02)

  const foreArmor = new THREE.Mesh(chamferBox(0.42, 0.68, 0.46, 0.08), armor)
  forearm.add(foreArmor)
  const forePlate = panelPlate(0.26, 0.46, 0.1, { trim: true })
  forePlate.position.set(0, 0, 0.25)
  forearm.add(forePlate)

  // Beam pod — cylindrical emitter slung on the FRONT of the forearm, muzzle +Z.
  const pod = new THREE.Group()
  pod.name = 'beam-pod'
  pod.position.set(0, -0.02, 0.36)
  const podBody = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.74, 14), frame)
  podBody.rotation.x = Math.PI / 2
  pod.add(podBody)
  const podArmor = new THREE.Mesh(chamferBox(0.26, 0.26, 0.52, 0.05), armorLite)
  podArmor.position.set(0, 0.02, -0.06)
  pod.add(podArmor)
  const podRing = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.14, 14, 1, true), frameLite)
  podRing.rotation.x = Math.PI / 2
  podRing.position.z = 0.36
  pod.add(podRing)
  const muzzle = new THREE.Mesh(new THREE.CircleGeometry(0.11, 16), glow)
  muzzle.position.z = 0.44
  pod.add(muzzle)
  const podVent = ventSlats(3, 0.18, 0.24, { horizontal: true })
  podVent.position.set(0, 0.14, -0.12)
  podVent.rotation.x = -Math.PI / 2
  pod.add(podVent)
  forearm.add(pod)

  // Hand.
  const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 10), frameLite)
  wrist.position.set(0, -0.42, 0)
  forearm.add(wrist)
  const hand = new THREE.Mesh(chamferBox(0.3, 0.24, 0.32, 0.05), frame)
  hand.position.set(0, -0.56, 0.02)
  forearm.add(hand)
  const knuckles = new THREE.Mesh(chamferBox(0.28, 0.1, 0.16, 0.03), armorLite)
  knuckles.position.set(0, -0.62, 0.18)
  forearm.add(knuckles)

  arm.add(forearm)
  return finalize(arm)
}

/* ================================================================== */
/* RACK — large swept wing / thruster pack                             */
/* ================================================================== */

/** Swept-wing thruster back rack (id: rack-valkyrie-wing). */
export function createValkyrieRack(): THREE.Group {
  const pack = new THREE.Group()

  const armor = armorMat()
  const armorLite = armorMat(PALETTE.armorMid)
  const frame = frameMat()
  const red = accentRedMat()
  const gold = trimGoldMat()

  // Central spine housing (sits behind the torso, origin at the mount).
  const spine = new THREE.Mesh(chamferBox(0.62, 0.94, 0.42, 0.09), frame)
  spine.position.set(0, -0.1, 0)
  pack.add(spine)
  const spinePlate = panelPlate(0.44, 0.72, 0.12, { trim: true })
  spinePlate.rotation.y = Math.PI // face rear
  spinePlate.position.set(0, -0.1, -0.25)
  pack.add(spinePlate)
  // twin main thrusters exiting straight back.
  const mainL = nozzle(0.2, 0.46)
  mainL.rotation.y = Math.PI // exit -> -Z
  mainL.position.set(-0.2, -0.42, -0.28)
  pack.add(mainL)
  const mainR = nozzle(0.2, 0.46)
  mainR.rotation.y = Math.PI
  mainR.position.set(0.2, -0.42, -0.28)
  pack.add(mainR)

  function buildWing(side: 1 | -1): THREE.Group {
    const wing = new THREE.Group()
    wing.name = side > 0 ? 'wing-right' : 'wing-left'
    wing.position.set(side * 0.34, 0.28, -0.1)
    // sweep up and outward and rake back
    wing.rotation.set(0.22, side * 0.5, side * -0.62)

    const blade = new THREE.Mesh(chamferBox(0.34, 1.7, 0.5, 0.08), armor)
    blade.position.set(0, 0.7, 0)
    wing.add(blade)
    const tip = new THREE.Mesh(chamferBox(0.2, 0.6, 0.3, 0.05), armorLite)
    tip.position.set(0, 1.62, -0.06)
    tip.rotation.x = 0.2
    wing.add(tip)
    const lead = edgeLine(1.6, { thickness: 0.035, mat: gold })
    lead.rotation.z = Math.PI / 2
    lead.position.set(side * 0.18, 0.7, 0.22)
    wing.add(lead)
    const aileron = new THREE.Mesh(chamferBox(0.28, 0.14, 0.1, 0.03), red)
    aileron.position.set(0, 0.18, 0.26)
    wing.add(aileron)
    const spar = riveting(6, 0.2, { radius: 0.025 })
    spar.rotation.z = Math.PI / 2
    spar.position.set(side * -0.1, 0.7, 0.24)
    wing.add(spar)

    // wing-root booster thrusters pointing down-and-back for hover lift
    const boostA = nozzle(0.13, 0.3)
    boostA.rotation.x = -Math.PI / 2 + 0.5
    boostA.position.set(0, -0.24, -0.1)
    wing.add(boostA)
    const boostB = nozzle(0.1, 0.24)
    boostB.rotation.x = -Math.PI / 2 + 0.5
    boostB.position.set(side * 0.16, 0.1, -0.12)
    wing.add(boostB)

    return wing
  }

  pack.add(buildWing(1), buildWing(-1))
  return finalize(pack)
}
