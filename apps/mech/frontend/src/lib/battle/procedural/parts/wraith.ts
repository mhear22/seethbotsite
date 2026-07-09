/**
 * WRAITH modular parts — decomposed from the bespoke showcase Wraith into the
 * game's slot system so they interoperate with the rest of the catalogue.
 *
 * This file currently ships the signature piece: a gaunt Armored-Core-style
 * REVERSE-JOINT (digitigrade / chicken-walker) leg set. It is authored in the
 * legs slot's local frame so it drops straight onto the standard skeleton:
 *   - the whole group is placed at MODEL_ATTACH_POINTS.legs = (0,0,0);
 *   - each leg is an animation pivot named 'leg-left' / 'leg-right' at the hip
 *     (world y≈2.6), with all geometry hanging BELOW it so MechEntity.animateWalk
 *     can swing rotation.x for the stride;
 *   - the foot sole rests at local y≈-2.6 → world y≈0 (feet on the ground).
 * Sizes deliberately differ from the stock bipedal frame (taller, thinner) —
 * part diversity is the point.
 */

import * as THREE from 'three'
import { armorMat, frameMat, accentRedMat, glowEyeMat, chamferBox, edgeLine } from '../detailing'

/** Hip pivot height in the legs-slot local frame (matches the stock frame). */
const HIP_Y = 2.6
/** Lateral hip offset — a slightly wider, planted stance for stability. */
const HIP_X = 0.52

/**
 * One reverse-joint leg. Returned group's origin is the HIP; +Z is forward.
 * Chain: hip → thigh (down & FORWARD) → knee (juts forward) → shin (down & BACK)
 * → ankle (behind the knee) → forward talon foot. Exposed pistons at the joints.
 */
function buildLeg(side: -1 | 1): THREE.Group {
  const leg = new THREE.Group()
  leg.name = side === -1 ? 'leg-left' : 'leg-right'
  leg.position.set(side * HIP_X, HIP_Y, 0)

  const armor = armorMat()
  const frame = frameMat()
  const red = accentRedMat()

  // Hip joint — exposed steel ball + collar.
  const hip = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 12), frame)
  leg.add(hip)
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 6, 14), frame)
  collar.rotation.y = Math.PI / 2
  leg.add(collar)

  // --- Thigh: hip (0,0,0) → knee (0,-0.82,+0.34). Angles down-and-forward. ---
  const kneePos = new THREE.Vector3(0, -0.82, 0.34)
  const thigh = new THREE.Mesh(chamferBox(0.26, 0.98, 0.3, 0.06), armor)
  thigh.position.set(0, -0.41, 0.17)
  thigh.rotation.x = -Math.atan2(kneePos.z, -kneePos.y) // lean forward toward the knee
  leg.add(thigh)
  // Thin gold/red edge accent down the thigh face.
  const thighTrim = edgeLine(0.8, { thickness: 0.02, mat: red })
  thighTrim.rotation.z = Math.PI / 2
  thighTrim.rotation.x = thigh.rotation.x
  thighTrim.position.set(0, -0.41, 0.33)
  leg.add(thighTrim)

  // Knee joint (forward-most point of the leg — the reverse-joint signature).
  const knee = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.26, 12), frame)
  knee.rotation.z = Math.PI / 2
  knee.position.copy(kneePos)
  leg.add(knee)
  const kneeGuard = new THREE.Mesh(chamferBox(0.24, 0.3, 0.2, 0.05), armor)
  kneeGuard.position.set(0, kneePos.y + 0.02, kneePos.z + 0.14)
  leg.add(kneeGuard)

  // --- Shin: knee (0,-0.82,+0.34) → ankle (0,-1.86,-0.06). Angles down-and-BACK. ---
  const anklePos = new THREE.Vector3(0, -1.86, -0.06)
  const shinVec = anklePos.clone().sub(kneePos)
  const shinMid = kneePos.clone().add(anklePos).multiplyScalar(0.5)
  const shin = new THREE.Mesh(chamferBox(0.22, shinVec.length(), 0.24, 0.05), armor)
  shin.position.copy(shinMid)
  shin.rotation.x = -Math.atan2(shinVec.z, -shinVec.y) // lean back toward the ankle
  leg.add(shin)
  // Red slash accent on the shin (Wraith signature).
  const shinRed = new THREE.Mesh(chamferBox(0.1, 0.6, 0.12, 0.03), red)
  shinRed.position.set(side * 0.09, shinMid.y, shinMid.z + 0.13)
  shinRed.rotation.x = shin.rotation.x
  leg.add(shinRed)
  // Exposed piston bridging knee → ankle behind the shin.
  const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, shinVec.length() * 0.9, 8), frame)
  piston.position.set(0, shinMid.y, shinMid.z - 0.16)
  piston.rotation.x = shin.rotation.x
  leg.add(piston)

  // Ankle joint.
  const ankle = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), frame)
  ankle.position.copy(anklePos)
  leg.add(ankle)

  // --- Lower leg / pastern: ankle (0,-1.86,-0.06) → foot top (0,-2.5,+0.04). ---
  // Bridges the ankle down to the talon so the foot never floats free. Slight
  // forward cant carries the mass back over the toes (digitigrade stance).
  const footTop = new THREE.Vector3(0, -2.5, 0.04)
  const pasternVec = footTop.clone().sub(anklePos)
  const pasternMid = anklePos.clone().add(footTop).multiplyScalar(0.5)
  const pastern = new THREE.Mesh(chamferBox(0.16, pasternVec.length() + 0.12, 0.18, 0.04), armor)
  pastern.position.copy(pasternMid)
  pastern.rotation.x = -Math.atan2(pasternVec.z, -pasternVec.y)
  leg.add(pastern)
  const pasternPiston = new THREE.Mesh(
    new THREE.CylinderGeometry(0.038, 0.038, pasternVec.length(), 8), frame,
  )
  pasternPiston.position.set(0, pasternMid.y, pasternMid.z - 0.11)
  pasternPiston.rotation.x = pastern.rotation.x
  leg.add(pasternPiston)

  // --- Foot: forward-splayed bird talon. Sole sits at local y≈-2.6 (world 0). ---
  const foot = new THREE.Group()
  foot.name = 'foot'
  foot.position.set(0, -2.56, 0.04)
  leg.add(foot)
  const heel = new THREE.Mesh(chamferBox(0.22, 0.16, 0.26, 0.05), armor)
  heel.position.set(0, 0.02, -0.16)
  foot.add(heel)
  // Three forward toe-claws.
  for (let i = -1; i <= 1; i++) {
    const toe = new THREE.Mesh(chamferBox(0.08, 0.1, 0.42, 0.03), frame)
    toe.position.set(i * 0.08, -0.02, 0.24)
    toe.rotation.x = 0.12
    foot.add(toe)
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.14, 6), frame)
    claw.rotation.x = Math.PI / 2 + 0.2
    claw.position.set(i * 0.08, -0.05, 0.46)
    foot.add(claw)
  }
  // Small amber sensor dot on the outer ankle.
  const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), glowEyeMat())
  sensor.position.set(side * 0.13, anklePos.y + 0.1, anklePos.z + 0.02)
  leg.add(sensor)

  return leg
}

/** Reverse-joint legs slot part (id: legs-wraith-rj). */
export function createWraithLegs(): THREE.Group {
  const legs = new THREE.Group()

  // Pelvis / hip yoke connecting the two legs, just under the core attach (2.8).
  const pelvis = new THREE.Mesh(chamferBox(0.9, 0.5, 0.6, 0.1), armorMat())
  pelvis.position.set(0, HIP_Y + 0.05, 0)
  legs.add(pelvis)
  const pelvisTrim = edgeLine(0.86, { thickness: 0.025, mat: accentRedMat() })
  pelvisTrim.rotation.z = Math.PI / 2
  pelvisTrim.position.set(0, HIP_Y + 0.28, 0.31)
  legs.add(pelvisTrim)

  legs.add(buildLeg(-1))
  legs.add(buildLeg(1))
  return legs
}
