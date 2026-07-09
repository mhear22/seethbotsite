/**
 * JUGGERNAUT modular parts — the bespoke hulking heavy-assault mech
 * (showcase/juggernaut.ts) decomposed into the game's slot system so its brutal,
 * top-heavy mass interoperates with the rest of the catalogue.
 *
 * Every builder is authored in its slot's LOCAL frame so it drops straight onto
 * the shared skeleton:
 *   - LEGS  placed at (0,0,0): 'leg-left'/'leg-right' pivots at the hip
 *     (local y≈2.6), all geometry hanging BELOW to a broad sole at y≈-2.6.
 *   - CORE  placed at (0,2.8,0): waist at local -0.3, shoulders at +1.05,
 *     neck at +1.6.
 *   - HEAD  placed at (0,4.8,0): small recessed skull around origin.
 *   - ARM   placed at (±1.3,3.8,0): hangs DOWN from the shoulder joint at the
 *     local origin to a weapon/fist at ≈-1.7. Two variants (fist + cannon).
 *   - RACK  placed at (0,4.2,-0.5): twin back-mounted missile pods.
 *
 * The Juggernaut reads as oversized and blocky: thick tiered chest with a big
 * red central vent, massive layered pauldrons, stubby broad-footed legs.
 */

import * as THREE from 'three'
import {
  PALETTE, armorMat, frameMat, accentRedMat, glowEyeMat, ventMat,
  chamferBox, panelPlate, trimStripe, edgeLine, ventSlats, riveting,
} from '../detailing'

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
/* LEGS — stubby, broad clawed feet                                    */
/* ------------------------------------------------------------------ */

/** Hip pivot height in the legs-slot local frame (matches the stock frame). */
const HIP_Y = 2.6
/** Lateral hip offset — a wide, planted stance for the heavy frame. */
const HIP_X = 0.6

/**
 * One stubby heavy leg. Returned group's origin is the HIP; +Z is forward.
 * ALL geometry hangs below the pivot down to a broad clawed sole at y≈-2.6
 * (world 0) so MechEntity.animateWalk can swing rotation.x for the stride.
 */
function buildLeg(side: 1 | -1): THREE.Group {
  const leg = new THREE.Group()
  leg.name = side < 0 ? 'leg-left' : 'leg-right'
  leg.position.set(side * HIP_X, HIP_Y, 0)

  const armor = armorMat()
  const armorLt = armorMat(PALETTE.armorMid)
  const frame = frameMat()

  // Hip ball joint (exposed steel).
  const hip = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 10), frame)
  hip.position.y = -0.02
  leg.add(hip)

  // Thigh — thick tapered block.
  const thigh = plate(0.92, 0.9, 1.0, armor)
  thigh.position.y = -0.52
  leg.add(thigh)
  // Outer thigh guard plate, canted outward for bulk.
  const thighGuard = plate(0.38, 0.78, 0.9, armorLt)
  thighGuard.position.set(side * 0.52, -0.52, 0)
  thighGuard.rotation.z = side * -0.12
  leg.add(thighGuard)
  const thighRivets = riveting(3, 0.2, { radius: 0.03 })
  thighRivets.position.set(0, -0.52, 0.5)
  leg.add(thighRivets)

  // Knee — steel piston joint + red knee guard.
  const knee = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.94, 12), frame)
  knee.rotation.z = Math.PI / 2
  knee.position.y = -1.06
  leg.add(knee)
  const kneeGuard = plate(0.62, 0.44, 0.3, accentRedMat())
  kneeGuard.position.set(0, -1.06, 0.54)
  leg.add(kneeGuard)
  const kneeTrim = trimStripe(0.5, 0.36, { thickness: 0.03 })
  kneeTrim.position.set(0, -1.06, 0.7)
  leg.add(kneeTrim)

  // Shin — flares wider toward the foot (two stacked tiers).
  const shinUpper = plate(0.94, 0.55, 1.0, armor)
  shinUpper.position.y = -1.46
  leg.add(shinUpper)
  const shinLower = plate(1.08, 0.5, 1.1, armorLt)
  shinLower.position.y = -1.84
  leg.add(shinLower)
  // Shin cooling vents (red intakes).
  const shinVent = ventSlats(4, 0.64, 0.36, { depth: 0.06 })
  shinVent.position.set(0, -1.52, 0.55)
  leg.add(shinVent)
  // Piston running down the back of the shin.
  const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.88, 8), frameMat(PALETTE.frameSteelLight))
  piston.position.set(side * 0.3, -1.6, -0.52)
  leg.add(piston)

  // Ankle joint.
  const ankle = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), frame)
  ankle.position.y = -2.16
  leg.add(ankle)

  // Broad clawed foot. Group at y=-2.6 → sole bottom rests on the ground.
  const foot = new THREE.Group()
  foot.name = leg.name + '-foot'
  foot.position.y = -2.6
  const sole = plate(1.2, 0.24, 1.54, armor, 0.05)
  sole.position.set(0, 0.12, 0.12)
  foot.add(sole)
  const toeGuard = plate(1.12, 0.3, 0.5, armorLt)
  toeGuard.position.set(0, 0.2, 0.78)
  foot.add(toeGuard)
  // Three forward claws + one rear spur.
  for (const cx of [-0.37, 0, 0.37]) {
    const c = claw(0.13, 0.5)
    c.position.set(cx, 0.1, 1.04)
    foot.add(c)
  }
  const heel = claw(0.11, 0.36)
  heel.position.set(0, 0.1, -0.62)
  heel.rotation.x = -Math.PI / 2 // rear-facing
  foot.add(heel)
  const footRivets = riveting(4, 0.22, { radius: 0.028 })
  footRivets.position.set(0, 0.26, 0.5)
  foot.add(footRivets)
  leg.add(foot)

  // Amber sensor dot on the outer ankle (emissive accent).
  const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), glowEyeMat())
  sensor.position.set(side * 0.22, -2.06, 0.14)
  leg.add(sensor)

  return leg
}

/** Stubby broad-footed heavy legs (id: legs-juggernaut-heavy). */
export function createJuggernautLegs(): THREE.Group {
  const legs = new THREE.Group()

  // Pelvis / hip yoke bridging the two legs, just under the core attach (2.8).
  const pelvis = plate(1.7, 0.58, 1.1, armorMat(PALETTE.armorMid))
  pelvis.position.set(0, HIP_Y + 0.04, 0)
  legs.add(pelvis)
  const codpiece = plate(0.5, 0.5, 0.5, armorMat())
  codpiece.position.set(0, HIP_Y - 0.14, 0.52)
  legs.add(codpiece)
  const beltTrim = trimStripe(1.5, 0.4, { thickness: 0.035 })
  beltTrim.position.set(0, HIP_Y + 0.06, 0.56)
  legs.add(beltTrim)

  legs.add(buildLeg(-1))
  legs.add(buildLeg(1))
  return legs
}

/* ------------------------------------------------------------------ */
/* CORE — thick tiered chest, big red central vent, layered pauldrons  */
/* ------------------------------------------------------------------ */

/** A massive layered pauldron block canted outward from the shoulders. */
function buildPauldron(side: 1 | -1): THREE.Group {
  const p = new THREE.Group()
  p.name = side < 0 ? 'pauldron-left' : 'pauldron-right'

  // Three descending, outward-canted armor tiers.
  const tier1 = panelPlate(1.2, 0.6, 1.5, { inset: 0.16, raise: 0.05, trim: true })
  tier1.position.set(side * 0.2, 0.34, 0)
  tier1.rotation.z = side * -0.16
  p.add(tier1)

  const tier2 = plate(1.06, 0.46, 1.4, armorMat())
  tier2.position.set(side * 0.36, -0.02, 0)
  tier2.rotation.z = side * -0.22
  p.add(tier2)

  const tier3 = plate(0.86, 0.4, 1.24, armorMat(PALETTE.armorMid))
  tier3.position.set(side * 0.46, -0.36, 0)
  tier3.rotation.z = side * -0.26
  p.add(tier3)

  // Red slash accent + rivet line along the leading edge.
  const slash = plate(0.78, 0.14, 0.1, accentRedMat())
  slash.position.set(side * 0.24, 0.42, 0.74)
  slash.rotation.z = side * -0.16
  p.add(slash)
  const capRivets = riveting(4, 0.24, { radius: 0.032 })
  capRivets.position.set(side * 0.24, 0.56, 0.4)
  capRivets.rotation.z = side * -0.16
  p.add(capRivets)

  // Mount high and very wide, straddling the arm attach (core-local ±1.3,+1.0).
  p.position.set(side * 1.02, 0.92, 0)
  return p
}

/** Tiered-chest torso with red central vent and layered pauldrons
 *  (id: core-juggernaut-bastion). Origin at world (0,2.8,0). */
export function createJuggernautCore(): THREE.Group {
  const core = new THREE.Group()

  const armor = armorMat()
  const armorLt = armorMat(PALETTE.armorMid)

  // Waist block bridging the hips (local -0.35 → world 2.45).
  const waist = plate(1.8, 0.56, 1.14, armorLt)
  waist.position.y = -0.35
  core.add(waist)
  const beltTrim = trimStripe(1.6, 0.42, { thickness: 0.035 })
  beltTrim.position.set(0, -0.3, 0.6)
  core.add(beltTrim)

  // Lower chest tier.
  const chestLow = plate(2.0, 0.62, 1.26, armor)
  chestLow.position.y = 0.18
  core.add(chestLow)

  // Upper chest tier — wider, layered proud of the lower tier.
  const chestHigh = plate(2.26, 0.82, 1.44, armorLt)
  chestHigh.position.set(0, 0.78, 0.02)
  core.add(chestHigh)

  // Big red central intake vent, framed and recessed into the chest.
  const ventHousing = plate(0.88, 0.92, 0.24, frameMat())
  ventHousing.position.set(0, 0.32, 0.68)
  core.add(ventHousing)
  const centralVent = ventSlats(6, 0.68, 0.76, { depth: 0.1 })
  centralVent.position.set(0, 0.32, 0.8)
  core.add(centralVent)
  const ventTrim = trimStripe(0.84, 0.88, { thickness: 0.04 })
  ventTrim.position.set(0, 0.32, 0.82)
  core.add(ventTrim)
  // Twin amber glow slots flanking the vent (emissive accents).
  for (const gx of [-0.64, 0.64]) {
    const glow = plate(0.12, 0.5, 0.06, glowEyeMat())
    glow.position.set(gx, 0.32, 0.76)
    core.add(glow)
  }

  // Layered collar the head + pauldrons nest against (local +1.05 → shoulders).
  const collar = plate(1.5, 0.4, 1.2, armor)
  collar.position.set(0, 1.05, -0.02)
  core.add(collar)
  const collarRivets = riveting(5, 0.24, { radius: 0.03 })
  collarRivets.position.set(0, 1.05, 0.58)
  core.add(collarRivets)

  // Neck stub at the top (local +1.55 → world 4.35).
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 0.34, 12), frameMat())
  neck.position.y = 1.5
  core.add(neck)

  // Massive layered pauldrons over the shoulders.
  core.add(buildPauldron(-1))
  core.add(buildPauldron(1))

  // Back power spine / heat sink.
  const spine = plate(0.72, 1.3, 0.5, armorLt)
  spine.position.set(0, 0.35, -0.82)
  core.add(spine)
  const spineVent = ventSlats(5, 0.5, 0.9, { depth: 0.06, slatMat: frameMat(PALETTE.frameSteelLight) })
  spineVent.position.set(0, 0.35, -1.08)
  spineVent.rotation.y = Math.PI
  core.add(spineVent)

  return core
}

/* ------------------------------------------------------------------ */
/* HEAD — small, recessed skull                                        */
/* ------------------------------------------------------------------ */

/** Small recessed skull with a single amber optic band
 *  (id: head-juggernaut-bunker). Origin at world (0,4.8,0). */
export function createJuggernautHead(): THREE.Group {
  const head = new THREE.Group()

  // Neck stub reaching down toward the core collar.
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.34, 10), frameMat())
  neck.position.y = -0.36
  head.add(neck)

  // Compact armored skull, cowl brow overhanging the visor.
  const skull = plate(0.64, 0.52, 0.62, armorMat())
  head.add(skull)
  const brow = plate(0.72, 0.2, 0.42, armorMat(PALETTE.armorMid))
  brow.position.set(0, 0.24, 0.22)
  brow.rotation.x = -0.25
  head.add(brow)

  // Single amber optic band under the brow (emissive accent).
  const visor = plate(0.48, 0.12, 0.1, glowEyeMat())
  visor.position.set(0, 0.03, 0.31)
  head.add(visor)
  const visorTrim = edgeLine(0.52, { thickness: 0.03 })
  visorTrim.position.set(0, -0.07, 0.33)
  head.add(visorTrim)

  // Side ear housings.
  for (const sx of [-1, 1]) {
    const ear = plate(0.12, 0.3, 0.34, frameMat())
    ear.position.set(sx * 0.38, 0, 0)
    head.add(ear)
  }

  return head
}

/* ------------------------------------------------------------------ */
/* ARMS — heavy, blocky, oversized                                     */
/* ------------------------------------------------------------------ */

/** Shared upper-arm chain (shoulder joint → upper armor → elbow) hanging from
 *  the shoulder at local origin. Returns the group so each variant appends. */
function buildArmBase(arm: THREE.Group): void {
  const shoulderJoint = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), frameMat())
  shoulderJoint.position.y = -0.05
  arm.add(shoulderJoint)

  const upper = plate(0.6, 0.82, 0.66, armorMat())
  upper.position.y = -0.42
  arm.add(upper)

  const elbow = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.68, 12), frameMat())
  elbow.rotation.z = Math.PI / 2
  elbow.position.y = -0.82
  arm.add(elbow)
}

/** Oversized blocky breacher-FIST arm (id: arm-juggernaut-breacher).
 *  Origin at the shoulder joint; fist hangs at the bottom/front. */
export function createJuggernautArm(): THREE.Group {
  const arm = new THREE.Group()
  arm.name = 'arm-juggernaut-breacher'
  buildArmBase(arm)

  // Forearm — bulky, wider than the upper arm.
  const forearm = plate(0.76, 0.94, 0.82, armorMat(PALETTE.armorMid))
  forearm.position.y = -1.24
  arm.add(forearm)
  const foreVent = ventSlats(3, 0.44, 0.42, { depth: 0.05 })
  foreVent.position.set(0, -1.18, 0.44)
  arm.add(foreVent)
  const foreRivets = riveting(3, 0.22, { radius: 0.03 })
  foreRivets.position.set(0, -1.02, 0.44)
  arm.add(foreRivets)

  // Oversized blocky fist / breacher knuckle.
  const fist = plate(0.82, 0.64, 0.9, armorMat())
  fist.position.y = -1.78
  arm.add(fist)
  // Knuckle spikes on the front of the fist.
  for (const kx of [-0.25, 0, 0.25]) {
    const spike = claw(0.11, 0.36)
    spike.position.set(kx, -1.78, 0.5)
    arm.add(spike)
  }
  const fistTrim = trimStripe(0.62, 0.46, { thickness: 0.03 })
  fistTrim.position.set(0, -1.78, 0.47)
  arm.add(fistTrim)

  return arm
}

/** Big boxy twin-barrel CANNON arm (id: arm-juggernaut-cannon).
 *  Origin at the shoulder joint; barrels aim forward from the bottom. */
export function createJuggernautArmCannon(): THREE.Group {
  const arm = new THREE.Group()
  arm.name = 'arm-juggernaut-cannon'
  buildArmBase(arm)

  // Boxy cannon housing in place of a forearm.
  const housing = plate(0.86, 0.96, 0.92, armorMat(PALETTE.armorMid))
  housing.position.y = -1.34
  arm.add(housing)
  const housingTrim = trimStripe(0.66, 0.7, { thickness: 0.03 })
  housingTrim.position.set(0, -1.34, 0.48)
  arm.add(housingTrim)
  // Rear cooling vent.
  const backVent = ventSlats(4, 0.6, 0.6, { depth: 0.06, slatMat: frameMat(PALETTE.frameSteelLight) })
  backVent.position.set(0, -1.34, -0.48)
  backVent.rotation.y = Math.PI
  arm.add(backVent)

  // Twin heavy forward barrels.
  for (const bx of [-0.22, 0.22]) {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 1.2, 12), frameMat())
    barrel.rotation.x = Math.PI / 2
    barrel.position.set(bx, -1.62, 0.66)
    arm.add(barrel)
    const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.18, 12), armorMat())
    muzzle.rotation.x = Math.PI / 2
    muzzle.position.set(bx, -1.62, 1.24)
    arm.add(muzzle)
    const bore = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 10), ventMat())
    bore.rotation.x = Math.PI / 2
    bore.position.set(bx, -1.62, 1.3)
    arm.add(bore)
  }
  // Amber charge indicator between the barrels (emissive accent).
  const charge = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), glowEyeMat())
  charge.position.set(0, -1.4, 0.5)
  arm.add(charge)

  return arm
}

/* ------------------------------------------------------------------ */
/* RACK — twin back-mounted missile pods                               */
/* ------------------------------------------------------------------ */

/** Boxy missile rack: a 3x2 grid of dark tubes in a framed housing. */
function buildMissilePod(): THREE.Group {
  const pod = new THREE.Group()

  const housing = plate(0.8, 0.68, 1.16, armorMat(PALETTE.armorMid))
  pod.add(housing)
  const housingTrim = trimStripe(0.66, 0.54, { thickness: 0.03 })
  housingTrim.position.set(0, 0, 0.58)
  pod.add(housingTrim)

  // Tube grid on the +Z face.
  for (const cx of [-0.2, 0.2]) {
    for (const ry of [-0.18, 0.0, 0.18]) {
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
  podRivets.position.set(0, -0.38, 0.2)
  pod.add(podRivets)

  return pod
}

/** Twin shoulder missile pods on a back bracket
 *  (id: rack-juggernaut-missile). Origin at world (0,4.2,-0.5). */
export function createJuggernautRack(): THREE.Group {
  const rack = new THREE.Group()

  // Central mounting bracket bolted to the back spine.
  const bracket = plate(1.4, 0.5, 0.44, armorMat())
  bracket.position.set(0, -0.1, -0.1)
  rack.add(bracket)
  const bracketRivets = riveting(4, 0.3, { radius: 0.032 })
  bracketRivets.position.set(0, -0.1, 0.13)
  rack.add(bracketRivets)

  // Twin pods flanking, canted outward and slightly up.
  for (const side of [-1, 1] as const) {
    const pod = buildMissilePod()
    pod.position.set(side * 0.78, 0.18, 0.08)
    pod.rotation.z = side * -0.14
    pod.rotation.y = side * -0.18
    rack.add(pod)
    // Amber targeting light on each pod (emissive accent).
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), glowEyeMat())
    eye.position.set(side * 0.78, 0.5, 0.5)
    rack.add(eye)
  }

  return rack
}
