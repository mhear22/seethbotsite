/**
 * WRAITH — a tall, eerie stealth-sniper mech.
 *
 * Gaunt elongated frame, hunched narrow shoulders draped in a cloak of layered
 * back plates, spindly reverse-jointed raptor legs, a long shoulder-braced
 * sniper rail on the right, and — most unsettling — a second sensor "head" of
 * amber lenses craned forward on a thin neck above the main gaunt skull.
 *
 * Built entirely from the shared procedural detailing toolkit so it stays on
 * the game's gritty-industrial art bible. Faces +Z, feet at y=0, centred on
 * x=0 / z=0.
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
/* small local builders                                                */
/* ------------------------------------------------------------------ */

const V = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z)
const UP = new THREE.Vector3(0, 1, 0)

/** A chamfered box mesh placed/rotated in one call. */
function mk(
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  pos?: [number, number, number],
  rot?: [number, number, number]
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat)
  if (pos) m.position.set(pos[0], pos[1], pos[2])
  if (rot) m.rotation.set(rot[0], rot[1], rot[2])
  return m
}

/** An armour "bone" segment spanning two points, its long axis along the run. */
function bone(from: THREE.Vector3, to: THREE.Vector3, w: number, d: number, mat: THREE.Material): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(to, from)
  const len = dir.length()
  const mesh = new THREE.Mesh(chamferBox(w, len, d, Math.min(w, d) * 0.24), mat)
  mesh.position.copy(from).addScaledVector(dir, 0.5)
  mesh.quaternion.setFromUnitVectors(UP, dir.clone().normalize())
  return mesh
}

/** A cylindrical strut / piston / barrel spanning two points. */
function strut(from: THREE.Vector3, to: THREE.Vector3, r: number, mat: THREE.Material): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(to, from)
  const len = dir.length()
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), mat)
  mesh.position.copy(from).addScaledVector(dir, 0.5)
  mesh.quaternion.setFromUnitVectors(UP, dir.clone().normalize())
  return mesh
}

/** A small round amber sensor lens facing +Z. */
function lens(r: number): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, r * 0.5, 12), glowEyeMat())
  m.rotation.x = Math.PI / 2
  return m
}

/* ------------------------------------------------------------------ */
/* legs — spindly reverse-jointed raptor legs                          */
/* ------------------------------------------------------------------ */

function buildLeg(): THREE.Group {
  const g = new THREE.Group()

  // Reverse (digitigrade) joint: knee juts backward, ankle kicks forward.
  const hip = V(0, 2.7, -0.12)
  const knee = V(0, 1.62, -0.62)
  const ankle = V(0, 0.58, 0.14)

  // Hip ball joint.
  g.add(mk(new THREE.SphereGeometry(0.24, 14, 12), frameMat(), [hip.x, hip.y, hip.z]))

  // Thigh: charcoal shell + steel hydraulic behind it.
  g.add(bone(hip, knee, 0.34, 0.44, armorMat()))
  const thighPlate = panelPlate(0.3, 0.7, 0.1, { trim: false })
  thighPlate.position.set(0.02, 2.18, 0.12)
  thighPlate.rotation.x = 0.42
  g.add(thighPlate)
  g.add(strut(V(0.17, 2.55, -0.02), V(0.15, 1.78, -0.5), 0.05, frameMat(PALETTE.frameSteelLight)))
  g.add(strut(V(-0.17, 2.55, -0.02), V(-0.15, 1.78, -0.5), 0.05, frameMat(PALETTE.frameSteelLight)))

  // Knee: back-jutting guard plate + front actuator across the joint.
  g.add(mk(new THREE.SphereGeometry(0.2, 12, 10), frameMat(), [knee.x, knee.y, knee.z]))
  g.add(mk(chamferBox(0.36, 0.42, 0.24, 0.05), armorMat(PALETTE.armorMid), [0, 1.6, -0.74], [0.35, 0, 0]))
  g.add(strut(V(0, 1.9, -0.28), V(0, 1.34, -0.28), 0.055, frameMat(PALETTE.frameSteelLight)))

  // Shin: thinner shell + red slash accent + gold edge.
  g.add(bone(knee, ankle, 0.3, 0.36, armorMat()))
  const shinSlash = mk(chamferBox(0.16, 0.55, 0.04, 0.02), accentRedMat(), [0, 1.05, 0.16], [-0.62, 0, 0])
  g.add(shinSlash)
  const shinEdge = edgeLine(0.55)
  shinEdge.rotation.set(-0.62, 0, Math.PI / 2)
  shinEdge.position.set(0.13, 1.05, 0.16)
  g.add(shinEdge)

  // Ankle + talon foot.
  g.add(mk(new THREE.SphereGeometry(0.17, 12, 10), frameMat(), [ankle.x, ankle.y, ankle.z]))
  const foot = new THREE.Group()
  foot.name = 'foot'
  foot.add(mk(chamferBox(0.4, 0.16, 0.5, 0.05), armorMat(PALETTE.armorMid), [0, 0.11, 0.26]))
  // three forward talons + one rear spur
  foot.add(bone(V(0, 0.14, 0.46), V(0, 0.02, 0.68), 0.11, 0.14, frameMat()))
  foot.add(bone(V(-0.13, 0.14, 0.42), V(-0.2, 0.02, 0.6), 0.09, 0.12, frameMat()))
  foot.add(bone(V(0.13, 0.14, 0.42), V(0.2, 0.02, 0.6), 0.09, 0.12, frameMat()))
  foot.add(bone(V(0, 0.14, 0.03), V(0, 0.03, -0.26), 0.1, 0.13, frameMat()))
  foot.position.set(ankle.x, 0, ankle.z - 0.06)
  g.add(foot)

  // ankle actuator
  g.add(strut(V(0, 0.95, -0.18), V(0, 0.55, 0.02), 0.05, frameMat(PALETTE.frameSteelLight)))

  const rivets = riveting(3, 0.12)
  rivets.rotation.x = 0.42
  rivets.position.set(0, 2.35, 0.2)
  g.add(rivets)

  return g
}

/* ------------------------------------------------------------------ */
/* torso — gaunt ribcage                                               */
/* ------------------------------------------------------------------ */

function buildTorso(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'torso'
  g.position.set(0, 3.3, 0)

  // Lower chest (pulled back) and upper chest (leaned forward = hunch).
  g.add(mk(chamferBox(0.86, 0.66, 0.56, 0.08), armorMat(), [0, -0.36, -0.02]))
  g.add(mk(chamferBox(0.98, 0.62, 0.6, 0.08), armorMat(PALETTE.armorMid), [0, 0.34, 0.06]))

  // Front sternum panel + recessed red vent + gold trim.
  const sternum = panelPlate(0.5, 0.9, 0.12, { trim: true })
  sternum.position.set(0, 0.02, 0.3)
  g.add(sternum)
  const vent = ventSlats(4, 0.4, 0.34)
  vent.position.set(0, -0.28, 0.36)
  g.add(vent)

  // Gaunt exposed frame ribs down each flank.
  for (let s = -1; s <= 1; s += 2) {
    for (let i = 0; i < 3; i++) {
      g.add(mk(chamferBox(0.07, 0.5, 0.44, 0.02), frameMat(), [s * 0.44, 0.12 - i * 0.28, 0], [0, 0, s * -0.12]))
    }
  }

  // Collar / neck base.
  g.add(mk(chamferBox(0.5, 0.24, 0.44, 0.06), frameMat(), [0, 0.62, 0.08]))
  g.add(riveting(4, 0.16, { radius: 0.03 }))

  return g
}

/* ------------------------------------------------------------------ */
/* cloak — layered tattered back plates                                */
/* ------------------------------------------------------------------ */

function buildCloak(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'back-cloak'
  g.position.set(0, 3.55, -0.38)

  // Upper mantle across the shoulders.
  const mantle = mk(chamferBox(1.15, 0.5, 0.1, 0.05), armorMat(PALETTE.armorMid), [0, 0.2, 0], [-0.18, 0, 0])
  g.add(mantle)
  const mantleTrim = trimStripe(1.05, 0.42)
  mantleTrim.position.set(0, 0.2, -0.09)
  mantleTrim.rotation.x = -0.18
  g.add(mantleTrim)

  // Tattered hanging panels of unequal length (the "cloak").
  const panelLen = [1.55, 1.35, 1.45, 1.2]
  const panelX = [-0.42, -0.14, 0.14, 0.42]
  const panelW = [0.32, 0.3, 0.3, 0.32]
  for (let i = 0; i < panelX.length; i++) {
    const len = panelLen[i]
    const p = mk(
      chamferBox(panelW[i], len, 0.07, 0.03),
      armorMat(i % 2 === 0 ? PALETTE.armorDark : PALETTE.armorMid),
      [panelX[i], -0.1 - len / 2, -0.02 - i * 0.008],
      [0.06, panelX[i] * 0.18, panelX[i] * 0.05]
    )
    g.add(p)
  }

  // A spine ridge of vertebrae segments over the panels.
  for (let i = 0; i < 5; i++) {
    g.add(mk(chamferBox(0.14, 0.16, 0.14, 0.03), frameMat(PALETTE.frameSteelLight), [0, 0.1 - i * 0.24, 0.05]))
  }

  return g
}

/* ------------------------------------------------------------------ */
/* shoulders — hunched angular pauldrons                               */
/* ------------------------------------------------------------------ */

function buildShoulder(bulky: boolean): THREE.Group {
  const g = new THREE.Group()

  // Layered pauldron, tilted so the outer edge peaks up (hunched).
  const w = bulky ? 0.62 : 0.54
  const pad = panelPlate(w, 0.5, 0.5, { trim: true })
  pad.rotation.z = -0.5
  g.add(pad)

  // Under-shell.
  g.add(mk(chamferBox(w * 0.7, 0.34, 0.42, 0.05), armorMat(), [-0.02, -0.22, 0], [0, 0, -0.5]))

  // Outer crest spike.
  g.add(mk(chamferBox(0.12, 0.4, 0.2, 0.04), frameMat(), [0.34, 0.28, 0], [0, 0, -0.7]))

  // Red rank stripe + rivets.
  g.add(mk(chamferBox(0.04, 0.34, 0.02, 0.01), accentRedMat(), [0.1, 0.12, 0.27], [0, 0, -0.5]))
  const rv = riveting(3, 0.1, { radius: 0.022 })
  rv.rotation.z = -0.5
  rv.position.set(-0.05, -0.05, 0.26)
  g.add(rv)

  if (bulky) {
    // Rail mount saddle on top of the right shoulder.
    g.add(mk(chamferBox(0.34, 0.18, 0.7, 0.05), frameMat(), [0.02, 0.34, 0.06]))
  }

  return g
}

/* ------------------------------------------------------------------ */
/* heads — gaunt skull + craned sensor cluster                         */
/* ------------------------------------------------------------------ */

function buildHead(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'head'
  g.position.set(0, 3.98, 0.14)
  g.rotation.x = 0.12 // slight forward hunch

  // Narrow gaunt skull.
  g.add(mk(chamferBox(0.42, 0.5, 0.5, 0.06), armorMat(PALETTE.armorMid), [0, 0, 0]))
  // Brow / cowl.
  g.add(mk(chamferBox(0.46, 0.16, 0.3, 0.05), armorMat(), [0, 0.18, 0.16], [0.35, 0, 0]))
  // Single amber visor slit.
  g.add(mk(chamferBox(0.32, 0.05, 0.05, 0.02), glowEyeMat(), [0, -0.02, 0.26]))
  // Recessed cheek vents.
  const cheekL = ventSlats(3, 0.1, 0.24, { slatMat: ventMat(), horizontal: false })
  cheekL.position.set(-0.19, -0.08, 0.16)
  cheekL.rotation.y = 0.5
  g.add(cheekL)
  const cheekR = ventSlats(3, 0.1, 0.24, { slatMat: ventMat(), horizontal: false })
  cheekR.position.set(0.19, -0.08, 0.16)
  cheekR.rotation.y = -0.5
  g.add(cheekR)
  // Rear crest fin + antenna.
  g.add(mk(chamferBox(0.06, 0.34, 0.26, 0.02), frameMat(), [0, 0.16, -0.16]))
  g.add(strut(V(0.14, 0.2, -0.1), V(0.28, 0.62, -0.24), 0.015, frameMat(PALETTE.frameSteelLight)))

  return g
}

function buildSensorNeck(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'sensor-cluster'
  g.position.set(0, 3.72, 0.22)

  // Thin neck craning forward and slightly down.
  const base = V(0, 0, 0)
  const tip = V(0, -0.16, 0.72)
  g.add(strut(base, tip, 0.06, frameMat(PALETTE.frameSteelLight)))
  g.add(strut(V(0.05, 0.02, 0.02), V(0.05, -0.14, 0.7), 0.03, frameMat()))

  // Sensor pod at the end of the neck.
  const pod = new THREE.Group()
  pod.position.copy(tip).add(V(0, -0.04, 0.08))
  pod.rotation.x = -0.2
  pod.add(mk(chamferBox(0.34, 0.28, 0.3, 0.05), armorMat(PALETTE.armorMid), [0, 0, 0]))
  pod.add(mk(chamferBox(0.3, 0.24, 0.06, 0.02), ventMat(), [0, 0, 0.16]))
  // cluster of small amber lenses of varying size (unsettling compound eye)
  const lensSpec: Array<[number, number, number]> = [
    [0, 0.05, 0.055],
    [-0.09, -0.02, 0.04],
    [0.09, -0.02, 0.04],
    [-0.03, -0.08, 0.03],
    [0.05, -0.07, 0.035],
  ]
  for (const [lx, ly, lr] of lensSpec) {
    const l = lens(lr)
    l.position.set(lx, ly, 0.19)
    pod.add(l)
  }
  // whisker antennae
  pod.add(strut(V(-0.14, 0.08, 0.05), V(-0.34, 0.26, -0.08), 0.012, frameMat(PALETTE.frameSteelLight)))
  pod.add(strut(V(0.14, 0.08, 0.05), V(0.34, 0.26, -0.08), 0.012, frameMat(PALETTE.frameSteelLight)))
  g.add(pod)

  return g
}

/* ------------------------------------------------------------------ */
/* arms                                                                */
/* ------------------------------------------------------------------ */

function buildLeftArm(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'arm-left'
  g.position.set(-0.82, 3.62, 0.02)

  const shoulder = V(0, 0, 0)
  const elbow = V(-0.16, -0.72, 0.06)
  const wrist = V(-0.06, -1.3, 0.18)

  g.add(mk(new THREE.SphereGeometry(0.19, 12, 10), frameMat(), [0, 0, 0]))
  g.add(bone(shoulder, elbow, 0.24, 0.28, armorMat()))
  g.add(mk(new THREE.SphereGeometry(0.14, 10, 8), frameMat(), [elbow.x, elbow.y, elbow.z]))
  g.add(bone(elbow, wrist, 0.2, 0.24, armorMat(PALETTE.armorMid)))
  g.add(mk(chamferBox(0.04, 0.4, 0.02, 0.01), accentRedMat(), [-0.13, -1.0, 0.14]))

  // Talon hand.
  const hand = new THREE.Group()
  hand.name = 'hand-left'
  hand.position.copy(wrist)
  hand.add(mk(chamferBox(0.2, 0.18, 0.2, 0.04), frameMat(), [0, -0.08, 0.02]))
  for (let i = -1; i <= 1; i++) {
    hand.add(bone(V(i * 0.07, -0.16, 0.06), V(i * 0.1, -0.34, 0.16), 0.05, 0.06, frameMat(PALETTE.frameSteelLight)))
  }
  hand.add(bone(V(0.1, -0.12, -0.02), V(0.18, -0.24, -0.06), 0.05, 0.06, frameMat(PALETTE.frameSteelLight)))
  g.add(hand)

  return g
}

function buildRightArm(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'arm-right'
  g.position.set(0.82, 3.58, 0.06)

  const shoulder = V(0, 0, 0)
  const elbow = V(0.02, -0.6, 0.16)
  const grip = V(0.0, -0.18, 0.6) // raised forward to brace the rail

  g.add(mk(new THREE.SphereGeometry(0.19, 12, 10), frameMat(), [0, 0, 0]))
  g.add(bone(shoulder, elbow, 0.24, 0.28, armorMat()))
  g.add(mk(new THREE.SphereGeometry(0.14, 10, 8), frameMat(), [elbow.x, elbow.y, elbow.z]))
  g.add(bone(elbow, grip, 0.2, 0.24, armorMat(PALETTE.armorMid)))

  // Gripping hand wrapping under the barrel.
  const hand = new THREE.Group()
  hand.name = 'hand-right'
  hand.position.copy(grip)
  hand.add(mk(chamferBox(0.2, 0.16, 0.2, 0.04), frameMat(), [0, 0.08, 0.04]))
  for (let i = -1; i <= 1; i++) {
    hand.add(bone(V(i * 0.07, 0.16, 0.06), V(i * 0.08, 0.34, 0.02), 0.05, 0.06, frameMat(PALETTE.frameSteelLight)))
  }
  g.add(hand)

  return g
}

/* ------------------------------------------------------------------ */
/* sniper rail — long-barrelled, shoulder-braced                       */
/* ------------------------------------------------------------------ */

function buildSniperRail(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'sniper-rail'
  g.position.set(0.8, 3.98, 0)
  g.rotation.x = -0.03 // muzzle dips a hair

  // Breech / counterweight behind the shoulder (adds depth).
  g.add(mk(chamferBox(0.32, 0.36, 0.5, 0.06), armorMat(PALETTE.armorMid), [0, 0, -0.52]))
  g.add(riveting(3, 0.12, { radius: 0.026 }).translateZ(-0.52).translateY(0.19))

  // Receiver housing.
  g.add(mk(chamferBox(0.3, 0.32, 0.9, 0.06), armorMat(), [0, 0, 0.12]))

  // Long barrel + armoured shroud + heat vents.
  g.add(strut(V(0, 0.01, 0.4), V(0, 0.01, 2.05), 0.075, frameMat(PALETTE.frameSteelLight)))
  g.add(mk(chamferBox(0.22, 0.24, 1.15, 0.05), armorMat(PALETTE.armorMid), [0, 0.02, 1.0]))
  const heat = ventSlats(5, 0.16, 0.7, { slatMat: ventMat(), horizontal: true })
  heat.rotation.x = -Math.PI / 2
  heat.position.set(0, 0.15, 1.0)
  g.add(heat)

  // Muzzle brake with slots.
  g.add(mk(new THREE.CylinderGeometry(0.11, 0.11, 0.26, 12), frameMat(), [0, 0.01, 2.12], [Math.PI / 2, 0, 0]))
  g.add(mk(chamferBox(0.24, 0.06, 0.2, 0.02), ventMat(), [0, 0.01, 2.12]))

  // Scope on top with a glowing amber objective lens.
  g.add(mk(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 12), frameMat(), [0, 0.27, 0.25], [Math.PI / 2, 0, 0]))
  const objective = lens(0.09)
  objective.position.set(0, 0.27, 0.56)
  g.add(objective)
  g.add(mk(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 10), frameMat(PALETTE.frameSteelLight), [0, 0.27, -0.08], [Math.PI / 2, 0, 0]))

  // Gold trim line along the receiver.
  const trim = edgeLine(0.8)
  trim.rotation.y = Math.PI / 2
  trim.position.set(0.16, 0.14, 0.12)
  g.add(trim)

  // Brace strut from rail down to the shoulder saddle.
  g.add(strut(V(-0.14, -0.16, -0.2), V(-0.02, -0.34, -0.34), 0.05, frameMat()))
  g.add(strut(V(0.05, -0.16, 0.2), V(0.05, -0.36, 0.3), 0.045, frameMat()))

  return g
}

/* ------------------------------------------------------------------ */
/* assembly                                                            */
/* ------------------------------------------------------------------ */

export function createWraithMech(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'wraith'

  const legL = buildLeg()
  legL.name = 'leg-left'
  legL.position.set(-0.6, 0, 0)
  const legR = buildLeg()
  legR.name = 'leg-right'
  legR.position.set(0.6, 0, 0)
  root.add(legL, legR)

  // Pelvis bridging the hips.
  const pelvis = new THREE.Group()
  pelvis.name = 'pelvis'
  pelvis.position.set(0, 2.62, -0.06)
  pelvis.add(mk(chamferBox(0.92, 0.5, 0.54, 0.07), armorMat(), [0, 0, 0]))
  pelvis.add(mk(chamferBox(0.4, 0.3, 0.4, 0.05), frameMat(), [-0.42, -0.02, 0], [0, 0, 0.2]))
  pelvis.add(mk(chamferBox(0.4, 0.3, 0.4, 0.05), frameMat(), [0.42, -0.02, 0], [0, 0, -0.2]))
  pelvis.add(mk(chamferBox(0.3, 0.28, 0.06, 0.02), accentRedMat(), [0, -0.02, 0.28]))
  root.add(pelvis)

  root.add(buildTorso())
  root.add(buildCloak())

  const shL = buildShoulder(false)
  shL.name = 'shoulder-left'
  shL.position.set(-0.82, 3.78, 0.02)
  const shR = buildShoulder(true)
  shR.name = 'shoulder-right'
  shR.position.set(0.84, 3.8, 0.02)
  root.add(shL, shR)

  root.add(buildLeftArm())
  root.add(buildRightArm())
  root.add(buildHead())
  root.add(buildSensorNeck())
  root.add(buildSniperRail())

  // Enforce shadow flags on every mesh, including those inside toolkit groups.
  root.traverse((o: THREE.Object3D) => {
    if (o instanceof THREE.Mesh) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })

  return root
}
