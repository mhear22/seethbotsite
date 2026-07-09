/**
 * MANTIS — an insectoid raptor war-mech.
 *
 * A forward-pitched thorax-like carapace slung low over sharp digitigrade
 * legs, a small mandibled head with a cluster of amber glow-eyes, two huge
 * raised scythe/blade arms folded like a praying mantis, and a pair of thin
 * lower manipulator arms. Built entirely from the shared gritty-industrial
 * detailing toolkit — no reuse of the stock part builders.
 *
 * Coordinate frame: stands on y=0, centered on x=0/z=0, faces +Z. Up is +Y.
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
} from '../procedural/detailing'

/* ------------------------------------------------------------------ */
/* small local helpers                                                 */
/* ------------------------------------------------------------------ */

const Y_AXIS = new THREE.Vector3(0, 1, 0)

/** A chamfered-box mesh placed at a point. */
function plate(
  w: number,
  h: number,
  d: number,
  mat: THREE.Material,
  bevel?: number
): THREE.Mesh {
  return new THREE.Mesh(chamferBox(w, h, d, bevel), mat)
}

/**
 * A tapered/chamfered strut spanning two points in local space, its long axis
 * aligned from `a` to `b`. Used for every limb segment so the silhouette reads
 * as jointed steel rather than stacked cubes.
 */
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

/** A knuckle / knee ball of exposed frame at a joint. */
function joint(radius: number): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.IcosahedronGeometry(radius, 1),
    frameMat(PALETTE.frameSteelLight)
  )
}

/** A sharp four-sided pyramid claw/spike, base at origin, tip along +Y. */
function spike(baseR: number, length: number, mat: THREE.Material): THREE.Mesh {
  const geo = new THREE.ConeGeometry(baseR, length, 4, 1)
  geo.translate(0, length / 2, 0)
  return new THREE.Mesh(geo, mat)
}

/* ------------------------------------------------------------------ */
/* DIGITIGRADE LEG                                                     */
/* ------------------------------------------------------------------ */

/**
 * A reverse-jointed raptor leg. `side` = +1 for the mech's right (+X).
 * Local origin sits at the hip; the toe claws land near local y = -2.0 so the
 * leg fills the gap down to the ground once positioned at hip height 2.0.
 */
function buildLeg(side: number): THREE.Group {
  const g = new THREE.Group()
  g.name = side > 0 ? 'leg-right' : 'leg-left'

  const hip = new THREE.Vector3(0, 0, 0)
  const knee = new THREE.Vector3(0.12 * side, -0.82, 0.52)
  const ankle = new THREE.Vector3(0.06 * side, -1.55, -0.26)
  const toeBase = new THREE.Vector3(0.02 * side, -1.94, 0.34)

  // Hip housing — a chunky armored ball socket.
  const hipHousing = plate(0.5, 0.5, 0.5, armorMat(PALETTE.armorMid), 0.12)
  hipHousing.position.copy(hip)
  g.add(hipHousing)
  const hipJoint = joint(0.22)
  hipJoint.position.copy(hip)
  g.add(hipJoint)

  // Femur (thigh) — thick, drives forward to the knee.
  const femur = strut(hip, knee, 0.4, 0.36, armorMat(), 0.09)
  g.add(femur)
  // Overlapping thigh carapace plate.
  const thighPlate = panelPlate(0.34, 0.62, 0.1, { trim: true })
  thighPlate.position.copy(hip.clone().lerp(knee, 0.5))
  thighPlate.position.z += 0.24
  thighPlate.rotation.x = -0.5
  g.add(thighPlate)

  // Knee — exposed joint + a forward guard fin.
  const kneeJoint = joint(0.2)
  kneeJoint.position.copy(knee)
  g.add(kneeJoint)
  const kneeFin = plate(0.22, 0.34, 0.5, accentRedMat(), 0.06)
  kneeFin.position.copy(knee).add(new THREE.Vector3(0, 0.02, 0.22))
  kneeFin.rotation.x = 0.35
  g.add(kneeFin)

  // Tibia (shin) — sweeps back down to the raised heel/ankle.
  const tibia = strut(knee, ankle, 0.3, 0.3, armorMat(PALETTE.armorMid), 0.08)
  g.add(tibia)
  // A trio of piston lines running the shin (frame greeble).
  for (let i = -1; i <= 1; i++) {
    const piston = strut(
      knee.clone().add(new THREE.Vector3(0.09 * i, -0.02, -0.14)),
      ankle.clone().add(new THREE.Vector3(0.09 * i, 0.02, -0.14)),
      0.05,
      0.05,
      frameMat()
    )
    g.add(piston)
  }

  // Ankle joint.
  const ankleJoint = joint(0.17)
  ankleJoint.position.copy(ankle)
  g.add(ankleJoint)

  // Metatarsus — pitches forward to the toe base (the "foot bone").
  const meta = strut(ankle, toeBase, 0.26, 0.26, armorMat(), 0.07)
  g.add(meta)

  // Foot pad + splayed forward claws.
  const foot = new THREE.Group()
  foot.name = 'foot'
  foot.position.copy(toeBase)
  const pad = plate(0.42, 0.14, 0.5, armorMat(PALETTE.armorMid), 0.05)
  pad.position.set(0, -0.02, 0.08)
  foot.add(pad)
  const clawMat = frameMat(PALETTE.frameSteelLight)
  for (let i = -1; i <= 1; i++) {
    const claw = spike(0.075, 0.42, clawMat)
    claw.position.set(0.13 * i, -0.05, 0.28)
    // Rotate the +Y spike to point forward and down into the ground.
    claw.rotation.x = Math.PI * 0.62
    claw.rotation.z = -0.12 * i
    foot.add(claw)
  }
  // Rear dew-spur (killing claw), curls back and down.
  const spur = spike(0.07, 0.36, clawMat)
  spur.position.set(0, -0.02, -0.18)
  spur.rotation.x = Math.PI * 1.35
  foot.add(spur)
  g.add(foot)

  // A couple of rivet rows on the femur housing.
  const rivets = riveting(3, 0.12, { radius: 0.02 })
  rivets.position.copy(hip).add(new THREE.Vector3(0, -0.2, 0.26))
  rivets.rotation.x = -0.5
  g.add(rivets)

  return g
}

/* ------------------------------------------------------------------ */
/* THORAX / TORSO                                                      */
/* ------------------------------------------------------------------ */

function buildTorso(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'torso'
  // Sling the carapace low and pitch it forward over the legs.
  g.position.set(0, 2.18, -0.18)
  g.rotation.x = 0.3

  // Rear abdomen — the heaviest segment, tapers toward the tail.
  const abdomen = plate(1.02, 0.72, 0.86, armorMat(), 0.14)
  abdomen.position.set(0, -0.02, -0.66)
  g.add(abdomen)
  const abdomenTail = plate(0.68, 0.5, 0.5, armorMat(PALETTE.armorMid), 0.1)
  abdomenTail.position.set(0, -0.06, -1.12)
  g.add(abdomenTail)

  // Rear thruster vents (small amber glow through dark slats).
  const rearVent = ventSlats(4, 0.6, 0.4, {
    slatMat: glowEyeMat(),
    frameMat: ventMat(),
    depth: 0.06,
  })
  rearVent.position.set(0, 0.02, -1.37)
  rearVent.rotation.y = Math.PI
  g.add(rearVent)

  // Mid thorax — broadest, carries the shoulder mounts.
  const thorax = plate(1.14, 0.84, 0.82, armorMat(PALETTE.armorMid), 0.14)
  thorax.position.set(0, 0.05, 0.14)
  g.add(thorax)

  // Front pronotum / neck-base collar.
  const pronotum = plate(0.82, 0.66, 0.62, armorMat(), 0.12)
  pronotum.position.set(0, 0.02, 0.78)
  g.add(pronotum)

  // Dorsal ridge — a row of overlapping angular carapace scutes along the top.
  const ridgeMat = armorMat(PALETTE.armorMid)
  const ridgeZ = [-1.0, -0.6, -0.2, 0.2, 0.6]
  ridgeZ.forEach((z: number, i: number) => {
    const scute = plate(0.5 - i * 0.03, 0.14, 0.34, ridgeMat, 0.05)
    scute.position.set(0, 0.42 - i * 0.015, z)
    scute.rotation.x = -0.32
    g.add(scute)
    // A little gold spine crest along the very top of each scute.
    const crest = edgeLine(0.32, { thickness: 0.03, mat: trimGoldMat() })
    crest.rotation.y = Math.PI / 2
    crest.position.set(0, 0.52 - i * 0.015, z)
    g.add(crest)
  })

  // Dorsal sensor strip — the one long glow line down the spine.
  const spineStrip = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.02, 1.5),
    glowEyeMat()
  )
  spineStrip.position.set(0, 0.5, -0.2)
  g.add(spineStrip)

  // Ventral sternum plate with a red intake grille (the "chest").
  const sternum = panelPlate(0.7, 0.6, 0.16, { trim: true })
  sternum.position.set(0, -0.28, 0.7)
  sternum.rotation.x = 0.25
  g.add(sternum)
  const intake = ventSlats(4, 0.5, 0.34, { depth: 0.05 })
  intake.position.set(0, -0.42, 0.82)
  intake.rotation.x = 0.25
  g.add(intake)

  // Side flank plates with rivet rows for a segmented, layered look.
  for (const side of [-1, 1]) {
    const flank = plate(0.14, 0.62, 0.9, armorMat(), 0.06)
    flank.position.set(0.6 * side, -0.02, 0.05)
    g.add(flank)
    const flankRivets = riveting(4, 0.18, { radius: 0.022 })
    flankRivets.rotation.y = Math.PI / 2
    flankRivets.position.set(0.68 * side, -0.02, 0.05)
    flankRivets.rotation.z = 0
    g.add(flankRivets)
    // Gold trim seam where flank meets dorsal armor.
    const seam = trimStripe(0.9, 0.5, { thickness: 0.02, depth: 0.02 })
    seam.rotation.y = Math.PI / 2
    seam.position.set(0.66 * side, 0.06, 0.05)
    g.add(seam)
  }

  return g
}

/* ------------------------------------------------------------------ */
/* HEAD                                                                */
/* ------------------------------------------------------------------ */

function buildHead(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'head'
  // Small head slung low and forward off the pronotum.
  g.position.set(0, 2.46, 1.12)
  g.rotation.x = 0.34

  // Neck stalk connecting to the thorax.
  const neck = strut(
    new THREE.Vector3(0, 0.18, -0.42),
    new THREE.Vector3(0, -0.02, 0.0),
    0.18,
    0.18,
    frameMat()
  )
  g.add(neck)

  // Angular skull carapace.
  const skull = plate(0.5, 0.4, 0.52, armorMat(PALETTE.armorMid), 0.08)
  g.add(skull)
  // Brow / crest plate.
  const brow = plate(0.44, 0.12, 0.3, armorMat(), 0.04)
  brow.position.set(0, 0.22, 0.06)
  brow.rotation.x = -0.4
  g.add(brow)

  // Clustered compound glow-eyes: several small amber facets on the face.
  const eyeMat = glowEyeMat()
  const eyeGeo = new THREE.IcosahedronGeometry(0.06, 0)
  const eyePositions: [number, number, number][] = [
    [-0.14, 0.04, 0.26],
    [0.14, 0.04, 0.26],
    [-0.1, -0.06, 0.27],
    [0.1, -0.06, 0.27],
    [0, 0.1, 0.26],
    [0, -0.02, 0.29],
  ]
  eyePositions.forEach((p: [number, number, number]) => {
    const eye = new THREE.Mesh(eyeGeo, eyeMat)
    eye.position.set(p[0], p[1], p[2])
    g.add(eye)
  })
  // Dark socket recess behind the eye cluster to make them pop.
  const socket = plate(0.4, 0.28, 0.06, ventMat(), 0.04)
  socket.position.set(0, 0.0, 0.24)
  g.add(socket)

  // Mandibles — two hooked jaw plates jutting forward-down at the mouth.
  const mandMat = frameMat(PALETTE.frameSteelLight)
  for (const side of [-1, 1]) {
    const mandible = strut(
      new THREE.Vector3(0.12 * side, -0.14, 0.24),
      new THREE.Vector3(0.2 * side, -0.34, 0.5),
      0.09,
      0.09,
      mandMat
    )
    g.add(mandible)
    const tip = spike(0.05, 0.16, accentRedMat())
    tip.position.set(0.2 * side, -0.34, 0.5)
    tip.rotation.x = Math.PI * 0.75
    tip.rotation.z = 0.3 * side
    g.add(tip)
  }

  // Twin antennae sweeping up and back.
  for (const side of [-1, 1]) {
    const ant = strut(
      new THREE.Vector3(0.12 * side, 0.2, 0.02),
      new THREE.Vector3(0.26 * side, 0.6, -0.2),
      0.03,
      0.03,
      frameMat()
    )
    g.add(ant)
    const antTip = new THREE.Mesh(new THREE.IcosahedronGeometry(0.04, 0), glowEyeMat())
    antTip.position.set(0.26 * side, 0.6, -0.2)
    g.add(antTip)
  }

  return g
}

/* ------------------------------------------------------------------ */
/* UPPER SCYTHE ARMS                                                   */
/* ------------------------------------------------------------------ */

/**
 * A raptorial scythe arm, raised and folded like a praying mantis. `side` = +1
 * for the mech's right (+X). Local origin sits at the shoulder mount.
 */
function buildScythe(side: number): THREE.Group {
  const g = new THREE.Group()
  g.name = side > 0 ? 'arm-right' : 'arm-left'
  g.position.set(0.82 * side, 2.86, 0.32)

  // Shoulder — heavy coxa housing + exposed pivot.
  const shoulder = plate(0.44, 0.44, 0.44, armorMat(PALETTE.armorMid), 0.1)
  g.add(shoulder)
  const shoulderJoint = joint(0.2)
  g.add(shoulderJoint)

  // Femur (upper arm) — raised up and outward to a high elbow.
  const elbow = new THREE.Vector3(0.42 * side, 0.82, 0.16)
  const femur = strut(new THREE.Vector3(0, 0, 0), elbow, 0.32, 0.3, armorMat(), 0.08)
  g.add(femur)
  // Femur spine plates — a row of small teeth along the inner edge.
  for (let i = 0; i < 3; i++) {
    const t = 0.28 + i * 0.22
    const p = new THREE.Vector3(0, 0, 0).lerp(elbow, t)
    const tooth = spike(0.05, 0.16, frameMat(PALETTE.frameSteelLight))
    tooth.position.copy(p).add(new THREE.Vector3(-0.14 * side, 0.02, 0.16))
    tooth.rotation.z = Math.PI * 0.5 * side
    tooth.rotation.x = -0.3
    g.add(tooth)
  }

  // Elbow joint.
  const elbowJoint = joint(0.18)
  elbowJoint.position.copy(elbow)
  g.add(elbowJoint)

  // Tibia (the great blade) — folds up and forward, tapering to a hooked tip.
  const bladeTip = elbow.clone().add(new THREE.Vector3(-0.24 * side, 0.86, 0.68))
  const bladeMid = elbow.clone().lerp(bladeTip, 0.5)
  const bladeMat = armorMat(PALETTE.armorMid)

  // Blade body, built as a flat wide plate along the elbow->tip axis.
  const bladeDir = new THREE.Vector3().subVectors(bladeTip, elbow)
  const bladeLen = bladeDir.length()
  const blade = new THREE.Mesh(chamferBox(0.14, bladeLen, 0.42, 0.05), bladeMat)
  blade.position.copy(bladeMid)
  blade.quaternion.setFromUnitVectors(Y_AXIS, bladeDir.clone().normalize())
  g.add(blade)

  // Cutting edge — a bright frame lip along the forward side of the blade.
  const edge = new THREE.Mesh(chamferBox(0.05, bladeLen * 0.94, 0.06, 0.02), frameMat(PALETTE.frameSteelLight))
  edge.position.copy(bladeMid).add(new THREE.Vector3(0, 0, 0.24))
  edge.quaternion.copy(blade.quaternion)
  g.add(edge)

  // Red war-stripe down the blade flat.
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.06, bladeLen * 0.8, 0.02), accentRedMat())
  stripe.position.copy(bladeMid).add(new THREE.Vector3(0.08 * side, 0, 0.0))
  stripe.quaternion.copy(blade.quaternion)
  g.add(stripe)

  // Serrated inner teeth along the blade — the mantis "grasping spines".
  const nTeeth = 5
  for (let i = 0; i < nTeeth; i++) {
    const t = 0.12 + (i / (nTeeth - 1)) * 0.76
    const p = elbow.clone().lerp(bladeTip, t)
    const tooth = spike(0.045, 0.2 - i * 0.02, accentRedMat())
    tooth.position.copy(p).add(new THREE.Vector3(0, 0, 0.24))
    tooth.rotation.x = Math.PI * 0.5
    g.add(tooth)
  }

  // Hooked tip claw.
  const hook = spike(0.09, 0.36, frameMat(PALETTE.frameSteelLight))
  hook.position.copy(bladeTip)
  hook.quaternion.copy(blade.quaternion)
  hook.rotateX(-0.5)
  g.add(hook)

  // Elbow back-spur (mantis outer spike).
  const backSpur = spike(0.07, 0.3, armorMat())
  backSpur.position.copy(elbow).add(new THREE.Vector3(0.12 * side, -0.02, -0.18))
  backSpur.rotation.x = Math.PI * 1.15
  g.add(backSpur)

  return g
}

/* ------------------------------------------------------------------ */
/* LOWER MANIPULATOR ARMS                                              */
/* ------------------------------------------------------------------ */

/** Thin secondary manipulator arm ending in a small pincer. `side` = +1 → +X. */
function buildManipulator(side: number): THREE.Group {
  const g = new THREE.Group()
  g.name = side > 0 ? 'manip-right' : 'manip-left'
  g.position.set(0.46 * side, 2.42, 0.66)

  const shoulder = joint(0.12)
  g.add(shoulder)

  // Upper segment reaches forward and down.
  const mid = new THREE.Vector3(0.24 * side, -0.42, 0.34)
  const upper = strut(new THREE.Vector3(0, 0, 0), mid, 0.14, 0.14, frameMat())
  g.add(upper)
  const midJoint = joint(0.09)
  midJoint.position.copy(mid)
  g.add(midJoint)

  // Forearm continues forward to the wrist.
  const wrist = mid.clone().add(new THREE.Vector3(-0.06 * side, -0.36, 0.42))
  const fore = strut(mid, wrist, 0.11, 0.11, armorMat(PALETTE.armorMid), 0.03)
  g.add(fore)

  // Two-finger pincer at the wrist.
  const pincerMat = frameMat(PALETTE.frameSteelLight)
  for (const s of [-1, 1]) {
    const finger = strut(
      wrist.clone(),
      wrist.clone().add(new THREE.Vector3(0.09 * s, -0.16, 0.16)),
      0.05,
      0.05,
      pincerMat
    )
    g.add(finger)
  }
  const wristGlow = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 0), glowEyeMat())
  wristGlow.position.copy(mid)
  g.add(wristGlow)

  return g
}

/* ------------------------------------------------------------------ */
/* ROOT ASSEMBLY                                                       */
/* ------------------------------------------------------------------ */

export function createMantisMech(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'mantis-mech'

  // Legs (positioned at hip height; local geometry drops to the ground).
  const legR = buildLeg(1)
  legR.position.set(0.64, 2.0, -0.14)
  const legL = buildLeg(-1)
  legL.position.set(-0.64, 2.0, -0.14)
  root.add(legR, legL)

  // Pelvis block tying the hips together under the abdomen.
  const pelvis = plate(1.1, 0.5, 0.7, armorMat(PALETTE.armorMid), 0.12)
  pelvis.position.set(0, 2.05, -0.35)
  pelvis.rotation.x = 0.2
  root.add(pelvis)

  // Torso, head, arms.
  root.add(buildTorso())
  root.add(buildHead())
  root.add(buildScythe(1))
  root.add(buildScythe(-1))
  root.add(buildManipulator(1))
  root.add(buildManipulator(-1))

  // Guarantee every mesh casts and receives shadows (covers helper sub-groups).
  root.traverse((obj: THREE.Object3D) => {
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = true
      obj.receiveShadow = true
    }
  })

  return root
}
