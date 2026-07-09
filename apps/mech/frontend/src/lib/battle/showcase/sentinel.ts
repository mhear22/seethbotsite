/**
 * SENTINEL — a knightly guardian mech.
 *
 * A tall, noble war-knight: upright posture, broad stable legs, a crested
 * helm with a glowing T-visor, a heavy tower-shield locked to the left arm
 * and a long ceremonial lance couched upright in the right. Heraldic gold
 * piping runs the border of nearly every charcoal plate.
 *
 * Built entirely from the shared procedural art toolkit so it stays on-model
 * with the rest of the roster (charcoal armor, steel frame, red + gold accents,
 * amber glow). Faces +Z, stands on y=0, centered on x=0/z=0.
 */

import * as THREE from 'three'
import {
  PALETTE, armorMat, frameMat, accentRedMat, trimGoldMat, glowEyeMat, ventMat,
  chamferBox, panelPlate, trimStripe, edgeLine, ventSlats, bolt, riveting,
} from '../procedural/detailing'

/** Convenience: a chamfered armor plate as a ready Mesh. */
function plate(w: number, h: number, d: number, mat: THREE.Material, bevel?: number): THREE.Mesh {
  return new THREE.Mesh(chamferBox(w, h, d, bevel), mat)
}

/**
 * One broad, planted leg. `side` = -1 for the mech's left (-X), +1 for right.
 * Local origin at the hip socket; the foot reaches down to y≈0.
 */
function buildLeg(side: number): THREE.Group {
  const g = new THREE.Group()
  g.name = side < 0 ? 'leg-left' : 'leg-right'

  const armorMid: THREE.Material = armorMat(PALETTE.armorMid)

  // Hip actuator block (steel frame) at the socket.
  const hip = plate(0.72, 0.6, 0.72, frameMat(), 0.08)
  hip.position.y = -0.1
  g.add(hip)
  // Hip pivot cylinder cap facing outward.
  const hipCap = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.42, 14), frameMat(PALETTE.frameSteelLight))
  hipCap.rotation.z = Math.PI / 2
  hipCap.position.set(side * 0.4, -0.05, 0)
  g.add(hipCap)

  // Thigh armor (layered plate, gold-trimmed).
  const thigh = panelPlate(0.78, 1.0, 0.7, { topMat: armorMid, trim: true, inset: 0.14, raise: 0.05 })
  thigh.position.y = -0.75
  g.add(thigh)
  const thighRivets = riveting(3, 0.18, { radius: 0.028 })
  thighRivets.position.set(0, -0.4, 0.37)
  g.add(thighRivets)

  // Knee joint + heraldic knee guard.
  const knee = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.52, 14), frameMat())
  knee.rotation.z = Math.PI / 2
  knee.position.y = -1.35
  g.add(knee)
  const kneeGuard = plate(0.6, 0.5, 0.34, armorMat(), 0.07)
  kneeGuard.position.set(0, -1.34, 0.32)
  g.add(kneeGuard)
  const kneeTrim = trimStripe(0.5, 0.4, { thickness: 0.02 })
  kneeTrim.position.set(0, -1.34, 0.5)
  g.add(kneeTrim)
  const kneeStud = bolt(0.06, { mat: trimGoldMat() })
  kneeStud.position.set(0, -1.34, 0.52)
  g.add(kneeStud)

  // Shin armor (broad, tapering) with a cooling vent.
  const shin = panelPlate(0.72, 1.05, 0.66, { topMat: armorMid, trim: true, inset: 0.13 })
  shin.position.y = -2.0
  g.add(shin)
  const shinVent = ventSlats(4, 0.42, 0.5, { slatMat: accentRedMat() })
  shinVent.position.set(0, -1.95, 0.34)
  g.add(shinVent)

  // Ankle joint.
  const ankle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.4, 12), frameMat(PALETTE.frameSteelLight))
  ankle.rotation.z = Math.PI / 2
  ankle.position.y = -2.6
  g.add(ankle)

  // Broad planted foot: heel block + forward toe, gold toe-cap line.
  const foot = new THREE.Group()
  foot.name = side < 0 ? 'foot-left' : 'foot-right'
  foot.position.y = -2.9
  const heel = plate(0.78, 0.34, 0.7, armorMat(), 0.06)
  heel.position.set(0, 0.12, -0.2)
  foot.add(heel)
  const toe = plate(0.82, 0.28, 0.72, armorMid, 0.06)
  toe.position.set(0, 0.05, 0.42)
  foot.add(toe)
  const toeCap = plate(0.7, 0.12, 0.18, trimGoldMat(), 0.03)
  toeCap.position.set(0, 0.08, 0.78)
  foot.add(toeCap)
  const footRivets = riveting(3, 0.2, { radius: 0.03 })
  footRivets.position.set(0, 0.2, 0.35)
  footRivets.rotation.x = -Math.PI / 2
  foot.add(footRivets)
  g.add(foot)

  return g
}

/** The crested helm head with its glowing T-visor. Local origin at neck top. */
function buildHead(): THREE.Group {
  const head = new THREE.Group()
  head.name = 'head'

  // Skull / helm shell.
  const shell = plate(0.68, 0.62, 0.68, armorMat(PALETTE.armorMid), 0.1)
  shell.position.y = 0.34
  head.add(shell)

  // Brow band (gold heraldic trim).
  const brow = plate(0.6, 0.1, 0.12, trimGoldMat(), 0.03)
  brow.position.set(0, 0.5, 0.32)
  head.add(brow)

  // Faceplate recess (dark) with the emissive T-visor.
  const face = plate(0.5, 0.44, 0.1, ventMat(), 0.04)
  face.position.set(0, 0.32, 0.34)
  head.add(face)
  const visorH = plate(0.42, 0.1, 0.06, glowEyeMat())
  visorH.position.set(0, 0.42, 0.4)
  head.add(visorH)
  const visorV = plate(0.11, 0.34, 0.06, glowEyeMat())
  visorV.position.set(0, 0.24, 0.4)
  head.add(visorV)

  // Cheek guards.
  for (const s of [-1, 1] as const) {
    const cheek = plate(0.12, 0.4, 0.4, armorMat(), 0.03)
    cheek.position.set(s * 0.31, 0.3, 0.2)
    head.add(cheek)
  }

  // Tall knightly crest fin (runs front-to-back over the crown).
  const crest = new THREE.Group()
  crest.name = 'crest'
  crest.position.y = 0.62
  const finShape = plate(0.08, 0.34, 0.66, accentRedMat(), 0.03)
  finShape.position.y = 0.14
  crest.add(finShape)
  const finTrim = plate(0.05, 0.06, 0.6, trimGoldMat(), 0.02)
  finTrim.position.y = 0.32
  crest.add(finTrim)
  // Forward crest horn.
  const horn = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 8), trimGoldMat())
  horn.position.set(0, 0.18, 0.36)
  horn.rotation.x = Math.PI / 2.4
  crest.add(horn)
  head.add(crest)

  return head
}

/**
 * The left arm carrying a heavy tower shield. Local origin at the shoulder.
 * `side` is -1 (this is the mech's left).
 */
function buildShieldArm(side: number): THREE.Group {
  const arm = new THREE.Group()
  arm.name = 'arm-left'

  // Pauldron (rounded shoulder guard) with gold trim.
  const pauldron = panelPlate(0.9, 0.72, 0.8, { topMat: armorMat(PALETTE.armorMid), trim: true, inset: 0.14 })
  pauldron.position.set(side * 0.1, 0.05, 0)
  arm.add(pauldron)
  const pauldronStud = bolt(0.07, { mat: trimGoldMat() })
  pauldronStud.position.set(side * 0.1, 0.05, 0.44)
  arm.add(pauldronStud)

  // Upper arm frame.
  const upper = plate(0.42, 0.7, 0.42, frameMat(), 0.06)
  upper.position.set(side * 0.12, -0.6, 0)
  arm.add(upper)

  // Elbow + forearm.
  const elbow = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.42, 12), frameMat(PALETTE.frameSteelLight))
  elbow.rotation.z = Math.PI / 2
  elbow.position.set(side * 0.12, -1.0, 0)
  arm.add(elbow)
  const forearm = plate(0.46, 0.72, 0.46, armorMat(), 0.06)
  forearm.position.set(side * 0.12, -1.42, 0.02)
  arm.add(forearm)

  // TOWER SHIELD — tall, layered, mounted to the forearm on the outer face.
  const shield = new THREE.Group()
  shield.name = 'tower-shield'
  shield.position.set(side * 0.5, -0.75, 0.35)

  // Main shield body (large chamfered plate).
  const body = plate(1.0, 2.3, 0.16, armorMat(PALETTE.armorMid), 0.08)
  shield.add(body)
  // Raised central boss column.
  const spine = plate(0.34, 2.0, 0.14, armorMat(), 0.05)
  spine.position.z = 0.12
  shield.add(spine)
  // Full heraldic gold border + inner border.
  const border = trimStripe(0.92, 2.2, { thickness: 0.05, depth: 0.05 })
  border.position.z = 0.1
  shield.add(border)
  const innerBorder = trimStripe(0.6, 1.7, { thickness: 0.03, depth: 0.04 })
  innerBorder.position.z = 0.12
  shield.add(innerBorder)
  // Central emblem: red diamond boss with a gold stud.
  const emblem = plate(0.3, 0.5, 0.1, accentRedMat(), 0.04)
  emblem.position.z = 0.2
  emblem.rotation.z = Math.PI / 4
  shield.add(emblem)
  const emblemStud = bolt(0.09, { mat: trimGoldMat() })
  emblemStud.position.z = 0.3
  shield.add(emblemStud)
  // Corner rivets.
  for (const sx of [-1, 1] as const) {
    for (const sy of [-1, 1] as const) {
      const r = bolt(0.05, { mat: frameMat(PALETTE.frameSteelLight) })
      r.position.set(sx * 0.4, sy * 1.0, 0.11)
      shield.add(r)
    }
  }
  // Pointed lower tip of the tower shield.
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.5, 4), armorMat(PALETTE.armorMid))
  tip.rotation.x = Math.PI
  tip.rotation.y = Math.PI / 4
  tip.position.y = -1.4
  shield.add(tip)

  arm.add(shield)
  return arm
}

/**
 * The right arm couching a long knightly lance. Local origin at the shoulder.
 * `side` is +1 (the mech's right).
 */
function buildLanceArm(side: number): THREE.Group {
  const arm = new THREE.Group()
  arm.name = 'arm-right'

  // Pauldron.
  const pauldron = panelPlate(0.9, 0.72, 0.8, { topMat: armorMat(PALETTE.armorMid), trim: true, inset: 0.14 })
  pauldron.position.set(side * 0.1, 0.05, 0)
  arm.add(pauldron)
  const pauldronStud = bolt(0.07, { mat: trimGoldMat() })
  pauldronStud.position.set(side * 0.1, 0.05, 0.44)
  arm.add(pauldronStud)

  // Upper arm.
  const upper = plate(0.42, 0.7, 0.42, frameMat(), 0.06)
  upper.position.set(side * 0.12, -0.6, 0)
  arm.add(upper)

  // Elbow + forearm gripping the lance.
  const elbow = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.42, 12), frameMat(PALETTE.frameSteelLight))
  elbow.rotation.z = Math.PI / 2
  elbow.position.set(side * 0.12, -1.0, 0)
  arm.add(elbow)
  const forearm = plate(0.46, 0.72, 0.46, armorMat(), 0.06)
  forearm.position.set(side * 0.12, -1.42, 0.05)
  arm.add(forearm)
  // Gauntlet fist around the lance grip.
  const fist = plate(0.4, 0.34, 0.5, frameMat(), 0.05)
  fist.position.set(side * 0.12, -1.85, 0.12)
  arm.add(fist)

  // LANCE — long shaft held upright just forward of the fist.
  const lance = new THREE.Group()
  lance.name = 'lance'
  lance.position.set(side * 0.16, 0, 0.28)

  const shaftMat: THREE.Material = frameMat(PALETTE.frameSteel)
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 4.4, 12), shaftMat)
  shaft.position.y = -0.4
  lance.add(shaft)

  // Gold binding rings along the shaft.
  for (let i = 0; i < 4; i++) {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.09, 12), trimGoldMat())
    ring.position.y = -1.5 + i * 0.9
    lance.add(ring)
  }

  // Vamplate (conical hand guard) above the grip.
  const vamplate = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.42, 14, 1, true), armorMat(PALETTE.armorMid))
  vamplate.position.y = -1.55
  lance.add(vamplate)
  const vampTrim = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 8, 16), trimGoldMat())
  vampTrim.rotation.x = Math.PI / 2
  vampTrim.position.y = -1.72
  lance.add(vampTrim)

  // Fluted spear head at the top: collar + long tapered tip.
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.11, 0.28, 12), trimGoldMat())
  collar.position.y = 1.9
  lance.add(collar)
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.85, 4), frameMat(PALETTE.frameSteelLight))
  head.position.y = 2.5
  head.rotation.y = Math.PI / 4
  lance.add(head)
  // Small amber pommel glow at the base.
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), glowEyeMat())
  pommel.position.y = -2.65
  lance.add(pommel)

  arm.add(lance)
  return arm
}

/**
 * Assemble the full Sentinel mech.
 */
export function createSentinelMech(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'sentinel'

  const armorMid: THREE.Material = armorMat(PALETTE.armorMid)

  /* ---- Legs ---- */
  const legL = buildLeg(-1)
  legL.position.set(-0.72, 2.9, 0)
  root.add(legL)
  const legR = buildLeg(1)
  legR.position.set(0.72, 2.9, 0)
  root.add(legR)

  /* ---- Pelvis / hip skirt ---- */
  const pelvis = new THREE.Group()
  pelvis.name = 'pelvis'
  pelvis.position.y = 2.5
  const hipBlock = plate(1.5, 0.6, 0.9, frameMat(), 0.08)
  pelvis.add(hipBlock)
  // Front tasset (gold-trimmed codpiece skirt) and side skirts.
  const frontTasset = panelPlate(0.7, 0.7, 0.24, { trim: true, inset: 0.1 })
  frontTasset.position.set(0, -0.2, 0.5)
  pelvis.add(frontTasset)
  for (const s of [-1, 1] as const) {
    const sideSkirt = plate(0.34, 0.7, 0.6, armorMid, 0.05)
    sideSkirt.position.set(s * 0.86, -0.15, 0.05)
    pelvis.add(sideSkirt)
    const skirtTrim = trimStripe(0.24, 0.6, { thickness: 0.02 })
    skirtTrim.rotation.y = s * Math.PI / 2
    skirtTrim.position.set(s * 1.04, -0.15, 0.05)
    pelvis.add(skirtTrim)
  }
  root.add(pelvis)

  /* ---- Torso ---- */
  const torso = new THREE.Group()
  torso.name = 'torso'
  torso.position.y = 3.35

  // Lower belly frame.
  const belly = plate(1.2, 0.5, 0.8, frameMat(), 0.06)
  belly.position.y = -0.35
  torso.add(belly)

  // Main breastplate (broad, layered, heraldic).
  const chest = panelPlate(1.7, 1.1, 1.0, { topMat: armorMid, trim: true, inset: 0.16, raise: 0.06 })
  chest.position.y = 0.25
  torso.add(chest)

  // Central heraldic crest panel on the chest: red field, gold cross, amber core.
  const crestField = plate(0.44, 0.62, 0.1, accentRedMat(), 0.04)
  crestField.position.set(0, 0.3, 0.56)
  torso.add(crestField)
  const crossV = plate(0.09, 0.5, 0.06, trimGoldMat())
  crossV.position.set(0, 0.3, 0.62)
  torso.add(crossV)
  const crossH = plate(0.34, 0.09, 0.06, trimGoldMat())
  crossH.position.set(0, 0.4, 0.62)
  torso.add(crossH)
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), glowEyeMat())
  core.position.set(0, 0.16, 0.64)
  torso.add(core)

  // Collar / gorget under the head with gold trim.
  const gorget = plate(0.9, 0.34, 0.7, armorMat(), 0.06)
  gorget.position.set(0, 0.78, 0.1)
  torso.add(gorget)
  const gorgetTrim = trimStripe(0.8, 0.26, { thickness: 0.02 })
  gorgetTrim.position.set(0, 0.78, 0.46)
  torso.add(gorgetTrim)

  // Shoulder intake vents flanking the collar.
  for (const s of [-1, 1] as const) {
    const vent = ventSlats(3, 0.34, 0.4, { horizontal: true, slatMat: accentRedMat() })
    vent.position.set(s * 0.68, 0.55, 0.42)
    torso.add(vent)
  }

  // Back / spine block to anchor the shoulders.
  const spineBlock = plate(1.4, 0.9, 0.5, frameMat(PALETTE.frameSteel), 0.06)
  spineBlock.position.set(0, 0.35, -0.5)
  torso.add(spineBlock)

  root.add(torso)

  /* ---- Head ---- */
  const head = buildHead()
  head.position.y = 4.1
  root.add(head)

  /* ---- Arms ---- */
  const armL = buildShieldArm(-1)
  armL.position.set(-1.28, 3.85, 0)
  root.add(armL)
  const armR = buildLanceArm(1)
  armR.position.set(1.28, 3.85, 0)
  root.add(armR)

  /* ---- Finalize: enable shadows on every mesh ---- */
  root.traverse((obj: THREE.Object3D) => {
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = true
      obj.receiveShadow = true
    }
  })

  return root
}
