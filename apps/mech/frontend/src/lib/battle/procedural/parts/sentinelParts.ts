/**
 * SENTINEL modular parts — the bespoke knightly guardian (see
 * ../../showcase/sentinel.ts) decomposed into the game's slot system so its
 * pieces interoperate with the rest of the catalogue.
 *
 * Every builder is authored in its slot's LOCAL frame so it drops straight onto
 * the shared skeleton at MODEL_ATTACH_POINTS.<slot>:
 *   - legs  → group at (0,0,0); hip pivots 'leg-left'/'leg-right' at y≈2.6,
 *             geometry hangs below to a planted sole at local y≈-2.6 (world 0);
 *   - core  → group at (0,2.8,0); waist ~-0.3, shoulders ~+1.05, neck ~+1.55;
 *   - head  → group at (0,4.8,0); crested helm centred on the origin;
 *   - arms  → group at (±1.3,3.8,0); origin at the shoulder, hanging down;
 *   - rack  → group at (0,4.2,-0.5); back banner + booster pack.
 *
 * Signature look: broad stable stance, heraldic charcoal plate edged with lots
 * of thin gold piping, a red-field-and-gold-cross crest, a glowing amber T-visor,
 * a tower-shield arm and a couched-lance arm, a heraldic banner on the back.
 */

import * as THREE from 'three'
import {
  PALETTE, armorMat, frameMat, accentRedMat, trimGoldMat, glowEyeMat, ventMat,
  chamferBox, panelPlate, trimStripe, ventSlats, bolt, riveting,
} from '../detailing'

/** Convenience: a chamfered armor plate as a ready Mesh. */
function plate(w: number, h: number, d: number, mat: THREE.Material, bevel?: number): THREE.Mesh {
  return new THREE.Mesh(chamferBox(w, h, d, bevel), mat)
}

/** Hip pivot height in the legs-slot local frame (matches the stock frame). */
const HIP_Y = 2.6
/** Lateral hip offset — a broad, planted knightly stance. */
const HIP_X = 0.55

/* ------------------------------------------------------------------ */
/* LEGS                                                                */
/* ------------------------------------------------------------------ */

/**
 * One broad, planted leg. Returned group's origin is the HIP pivot; all
 * geometry hangs BELOW it (negative y) so MechEntity.animateWalk can swing
 * rotation.x. The foot sole rests at local y≈-2.6 → world y≈0.
 */
function buildLeg(side: -1 | 1): THREE.Group {
  const leg = new THREE.Group()
  leg.name = side === -1 ? 'leg-left' : 'leg-right'
  leg.position.set(side * HIP_X, HIP_Y, 0)

  const armorMid: THREE.Material = armorMat(PALETTE.armorMid)

  // Hip actuator block + outward pivot cap.
  const hip = plate(0.68, 0.56, 0.68, frameMat(), 0.08)
  hip.position.y = -0.12
  leg.add(hip)
  const hipCap = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.4, 14), frameMat(PALETTE.frameSteelLight))
  hipCap.rotation.z = Math.PI / 2
  hipCap.position.set(side * 0.36, -0.08, 0)
  leg.add(hipCap)
  // Small amber running light on the outer hip.
  const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), glowEyeMat())
  sensor.position.set(side * 0.34, -0.1, 0.28)
  leg.add(sensor)

  // Thigh armor (layered plate, gold-trimmed).
  const thigh = panelPlate(0.74, 0.92, 0.66, { topMat: armorMid, trim: true, inset: 0.14, raise: 0.05 })
  thigh.position.y = -0.72
  leg.add(thigh)
  const thighRivets = riveting(3, 0.16, { radius: 0.026 })
  thighRivets.position.set(0, -0.42, 0.35)
  leg.add(thighRivets)

  // Knee joint + heraldic knee guard.
  const knee = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.48, 14), frameMat())
  knee.rotation.z = Math.PI / 2
  knee.position.y = -1.24
  leg.add(knee)
  const kneeGuard = plate(0.56, 0.46, 0.32, armorMat(), 0.07)
  kneeGuard.position.set(0, -1.24, 0.3)
  leg.add(kneeGuard)
  const kneeTrim = trimStripe(0.46, 0.36, { thickness: 0.02 })
  kneeTrim.position.set(0, -1.24, 0.47)
  leg.add(kneeTrim)
  const kneeStud = bolt(0.055, { mat: trimGoldMat() })
  kneeStud.position.set(0, -1.24, 0.49)
  leg.add(kneeStud)

  // Shin armor (broad, tapering) with a red cooling vent.
  const shin = panelPlate(0.68, 0.98, 0.62, { topMat: armorMid, trim: true, inset: 0.13 })
  shin.position.y = -1.86
  leg.add(shin)
  const shinVent = ventSlats(4, 0.4, 0.46, { slatMat: accentRedMat() })
  shinVent.position.set(0, -1.82, 0.32)
  leg.add(shinVent)

  // Ankle joint.
  const ankle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.36, 12), frameMat(PALETTE.frameSteelLight))
  ankle.rotation.z = Math.PI / 2
  ankle.position.y = -2.34
  leg.add(ankle)

  // Broad planted foot — sole sits at local y≈-2.6 (world 0).
  const foot = new THREE.Group()
  foot.name = side === -1 ? 'foot-left' : 'foot-right'
  foot.position.y = -2.6
  const heel = plate(0.72, 0.3, 0.64, armorMat(), 0.06)
  heel.position.set(0, 0.14, -0.18)
  foot.add(heel)
  const toe = plate(0.76, 0.24, 0.66, armorMid, 0.06)
  toe.position.set(0, 0.1, 0.4)
  foot.add(toe)
  const toeCap = plate(0.64, 0.1, 0.16, trimGoldMat(), 0.03)
  toeCap.position.set(0, 0.12, 0.72)
  foot.add(toeCap)
  const footRivets = riveting(3, 0.18, { radius: 0.028 })
  footRivets.position.set(0, 0.22, 0.32)
  footRivets.rotation.x = -Math.PI / 2
  foot.add(footRivets)
  leg.add(foot)

  return leg
}

/** Broad, stable knightly legs slot part (id: legs-sentinel-guardian). */
export function createSentinelLegs(): THREE.Group {
  const legs = new THREE.Group()
  const armorMid: THREE.Material = armorMat(PALETTE.armorMid)

  // Pelvis / hip yoke just under the core attach (world 2.8), with tassets.
  const pelvis = new THREE.Group()
  pelvis.name = 'pelvis'
  pelvis.position.y = HIP_Y - 0.05
  const hipBlock = plate(1.4, 0.58, 0.86, frameMat(), 0.08)
  pelvis.add(hipBlock)
  const frontTasset = panelPlate(0.66, 0.66, 0.22, { trim: true, inset: 0.1 })
  frontTasset.position.set(0, -0.18, 0.48)
  pelvis.add(frontTasset)
  for (const s of [-1, 1] as const) {
    const sideSkirt = plate(0.32, 0.66, 0.56, armorMid, 0.05)
    sideSkirt.position.set(s * 0.8, -0.14, 0.04)
    pelvis.add(sideSkirt)
    const skirtTrim = trimStripe(0.22, 0.56, { thickness: 0.02 })
    skirtTrim.rotation.y = s * Math.PI / 2
    skirtTrim.position.set(s * 0.97, -0.14, 0.04)
    pelvis.add(skirtTrim)
  }
  legs.add(pelvis)

  legs.add(buildLeg(-1))
  legs.add(buildLeg(1))
  return legs
}

/* ------------------------------------------------------------------ */
/* CORE                                                                */
/* ------------------------------------------------------------------ */

/** Heraldic gold-trimmed torso (id: core-sentinel-heraldic). Origin at (0,0,0). */
export function createSentinelCore(): THREE.Group {
  const core = new THREE.Group()
  const armorMid: THREE.Material = armorMat(PALETTE.armorMid)

  // Lower belly frame — waist at local y≈-0.3 (world 2.5, meets the pelvis).
  const belly = plate(1.2, 0.5, 0.8, frameMat(), 0.06)
  belly.position.y = -0.3
  core.add(belly)

  // Main breastplate — broad, layered, heraldic.
  const chest = panelPlate(1.9, 1.1, 1.0, { topMat: armorMid, trim: true, inset: 0.16, raise: 0.06 })
  chest.position.y = 0.35
  core.add(chest)

  // Central heraldic crest: red field, gold cross, amber core glow.
  const crestField = plate(0.46, 0.64, 0.1, accentRedMat(), 0.04)
  crestField.position.set(0, 0.4, 0.56)
  core.add(crestField)
  const crossV = plate(0.09, 0.52, 0.06, trimGoldMat())
  crossV.position.set(0, 0.4, 0.62)
  core.add(crossV)
  const crossH = plate(0.36, 0.09, 0.06, trimGoldMat())
  crossH.position.set(0, 0.5, 0.62)
  core.add(crossH)
  const coreGlow = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), glowEyeMat())
  coreGlow.position.set(0, 0.24, 0.64)
  core.add(coreGlow)

  // Shoulder intake vents flanking the chest.
  for (const s of [-1, 1] as const) {
    const vent = ventSlats(3, 0.34, 0.4, { horizontal: true, slatMat: accentRedMat() })
    vent.position.set(s * 0.72, 0.9, 0.42)
    core.add(vent)
  }

  // Collar / gorget under the head with gold trim.
  const gorget = plate(0.9, 0.34, 0.72, armorMat(), 0.06)
  gorget.position.set(0, 1.15, 0.08)
  core.add(gorget)
  const gorgetTrim = trimStripe(0.8, 0.26, { thickness: 0.02 })
  gorgetTrim.position.set(0, 1.15, 0.46)
  core.add(gorgetTrim)

  // Neck stub (top, world ≈4.35 — the head sits just above at 4.8).
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.4, 12), frameMat(PALETTE.frameSteelLight))
  neck.position.y = 1.55
  core.add(neck)

  // Shoulder mount pads where the arms attach (local +1.0 → world 3.8).
  for (const s of [-1, 1] as const) {
    const shoulder = plate(0.5, 0.5, 0.6, armorMid, 0.06)
    shoulder.position.set(s * 0.95, 1.0, 0)
    core.add(shoulder)
  }

  // Back / spine block anchoring the shoulders and back rack.
  const spineBlock = plate(1.4, 0.9, 0.5, frameMat(), 0.06)
  spineBlock.position.set(0, 0.45, -0.5)
  core.add(spineBlock)

  return core
}

/* ------------------------------------------------------------------ */
/* HEAD                                                                */
/* ------------------------------------------------------------------ */

/** Crested helm with a glowing T-visor (id: head-sentinel-helm). */
export function createSentinelHead(): THREE.Group {
  const head = new THREE.Group()

  // Helm shell centred on the origin.
  const shell = plate(0.66, 0.6, 0.66, armorMat(PALETTE.armorMid), 0.1)
  head.add(shell)

  // Brow band (gold heraldic trim).
  const brow = plate(0.58, 0.1, 0.12, trimGoldMat(), 0.03)
  brow.position.set(0, 0.16, 0.3)
  head.add(brow)

  // Dark faceplate recess with the emissive amber T-visor.
  const face = plate(0.48, 0.42, 0.1, ventMat(), 0.04)
  face.position.set(0, -0.02, 0.32)
  head.add(face)
  const visorH = plate(0.4, 0.1, 0.06, glowEyeMat())
  visorH.position.set(0, 0.08, 0.38)
  head.add(visorH)
  const visorV = plate(0.11, 0.32, 0.06, glowEyeMat())
  visorV.position.set(0, -0.1, 0.38)
  head.add(visorV)

  // Cheek guards.
  for (const s of [-1, 1] as const) {
    const cheek = plate(0.12, 0.38, 0.38, armorMat(), 0.03)
    cheek.position.set(s * 0.3, -0.04, 0.18)
    head.add(cheek)
  }

  // Tall knightly crest fin over the crown, gold-capped, with a forward horn.
  const crest = new THREE.Group()
  crest.name = 'crest'
  crest.position.y = 0.3
  const fin = plate(0.08, 0.34, 0.64, accentRedMat(), 0.03)
  fin.position.y = 0.16
  crest.add(fin)
  const finTrim = plate(0.05, 0.06, 0.58, trimGoldMat(), 0.02)
  finTrim.position.y = 0.34
  crest.add(finTrim)
  const horn = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 8), trimGoldMat())
  horn.position.set(0, 0.2, 0.34)
  horn.rotation.x = Math.PI / 2.4
  crest.add(horn)
  head.add(crest)

  return head
}

/* ------------------------------------------------------------------ */
/* ARMS                                                                */
/* ------------------------------------------------------------------ */

/**
 * Shared knightly arm base: pauldron + upper arm + elbow, hanging from the
 * shoulder origin. Kept roughly centred on x so it mirrors onto either side.
 */
function buildArmCommon(arm: THREE.Group): void {
  const armorMid: THREE.Material = armorMat(PALETTE.armorMid)

  // Pauldron (rounded shoulder guard) with gold trim.
  const pauldron = panelPlate(0.86, 0.68, 0.78, { topMat: armorMid, trim: true, inset: 0.14 })
  pauldron.position.set(0.06, 0.02, 0)
  arm.add(pauldron)
  const pauldronStud = bolt(0.07, { mat: trimGoldMat() })
  pauldronStud.position.set(0.06, 0.02, 0.42)
  arm.add(pauldronStud)

  // Upper arm frame.
  const upper = plate(0.4, 0.66, 0.4, frameMat(), 0.06)
  upper.position.set(0.05, -0.55, 0)
  arm.add(upper)

  // Elbow joint.
  const elbow = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.4, 12), frameMat(PALETTE.frameSteelLight))
  elbow.rotation.z = Math.PI / 2
  elbow.position.set(0.05, -0.95, 0)
  arm.add(elbow)
}

/** Tower-shield arm (id: arm-sentinel-tower-shield). Origin at the shoulder. */
export function createSentinelShieldArm(): THREE.Group {
  const arm = new THREE.Group()
  arm.name = 'arm-shield'
  buildArmCommon(arm)

  // Forearm + gauntlet.
  const forearm = plate(0.44, 0.7, 0.44, armorMat(), 0.06)
  forearm.position.set(0.05, -1.38, 0.02)
  arm.add(forearm)
  const gauntlet = plate(0.38, 0.3, 0.46, frameMat(), 0.05)
  gauntlet.position.set(0.05, -1.82, 0.08)
  arm.add(gauntlet)
  // Small amber sensor on the forearm.
  const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), glowEyeMat())
  sensor.position.set(0.05, -1.5, 0.26)
  arm.add(sensor)

  // TOWER SHIELD — tall, layered, heraldic; mounted forward of the forearm.
  const shield = new THREE.Group()
  shield.name = 'tower-shield'
  shield.position.set(0.02, -0.85, 0.4)

  const body = plate(0.96, 2.2, 0.16, armorMat(PALETTE.armorMid), 0.08)
  shield.add(body)
  const spine = plate(0.32, 1.9, 0.14, armorMat(), 0.05)
  spine.position.z = 0.12
  shield.add(spine)
  // Full heraldic gold border + inner border.
  const border = trimStripe(0.88, 2.1, { thickness: 0.05, depth: 0.05 })
  border.position.z = 0.1
  shield.add(border)
  const innerBorder = trimStripe(0.56, 1.6, { thickness: 0.03, depth: 0.04 })
  innerBorder.position.z = 0.12
  shield.add(innerBorder)
  // Central emblem: red diamond boss with a gold stud.
  const emblem = plate(0.3, 0.48, 0.1, accentRedMat(), 0.04)
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
      r.position.set(sx * 0.38, sy * 0.95, 0.11)
      shield.add(r)
    }
  }
  // Pointed lower tip.
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.5, 4), armorMat(PALETTE.armorMid))
  tip.rotation.x = Math.PI
  tip.rotation.y = Math.PI / 4
  tip.position.y = -1.35
  shield.add(tip)

  arm.add(shield)
  return arm
}

/** Couched-lance arm (id: arm-sentinel-lance). Origin at the shoulder. */
export function createSentinelLanceArm(): THREE.Group {
  const arm = new THREE.Group()
  arm.name = 'arm-lance'
  buildArmCommon(arm)

  // Forearm + gauntlet fist gripping the lance.
  const forearm = plate(0.44, 0.7, 0.44, armorMat(), 0.06)
  forearm.position.set(0.05, -1.38, 0.04)
  arm.add(forearm)
  const fist = plate(0.38, 0.32, 0.48, frameMat(), 0.05)
  fist.position.set(0.05, -1.8, 0.12)
  arm.add(fist)

  // LANCE — long shaft couched upright, forward of the fist.
  const lance = new THREE.Group()
  lance.name = 'lance'
  lance.position.set(0.1, -0.9, 0.3)

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.085, 3.8, 12), frameMat())
  shaft.position.y = -0.2
  lance.add(shaft)
  // Gold binding rings along the shaft.
  for (let i = 0; i < 4; i++) {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.08, 12), trimGoldMat())
    ring.position.y = -1.2 + i * 0.8
    lance.add(ring)
  }
  // Vamplate (conical hand guard) + gold rim above the grip.
  const vamplate = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.4, 14, 1, true), armorMat(PALETTE.armorMid))
  vamplate.position.y = -1.3
  lance.add(vamplate)
  const vampTrim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 8, 16), trimGoldMat())
  vampTrim.rotation.x = Math.PI / 2
  vampTrim.position.y = -1.46
  lance.add(vampTrim)
  // Fluted spear head: gold collar + long tapered tip.
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.1, 0.26, 12), trimGoldMat())
  collar.position.y = 1.5
  lance.add(collar)
  const spearHead = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.8, 4), frameMat(PALETTE.frameSteelLight))
  spearHead.position.y = 2.05
  spearHead.rotation.y = Math.PI / 4
  lance.add(spearHead)
  // Amber pommel glow at the base.
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), glowEyeMat())
  pommel.position.y = -2.25
  lance.add(pommel)

  arm.add(lance)
  return arm
}

/* ------------------------------------------------------------------ */
/* RACK                                                                */
/* ------------------------------------------------------------------ */

/** Back banner + booster pack (id: rack-sentinel-banner). Origin at (0,0,0). */
export function createSentinelRack(): THREE.Group {
  const rack = new THREE.Group()
  const armorMid: THREE.Material = armorMat(PALETTE.armorMid)

  // Back-mounted pack block.
  const pack = plate(1.0, 0.9, 0.4, frameMat(), 0.06)
  rack.add(pack)
  const packPlate = panelPlate(0.78, 0.68, 0.2, { topMat: armorMid, trim: true, inset: 0.1 })
  packPlate.position.set(0, 0.05, 0.22)
  rack.add(packPlate)

  // Two banner poles rising up behind the shoulders, with gold finials.
  for (const s of [-1, 1] as const) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 10), frameMat(PALETTE.frameSteelLight))
    pole.position.set(s * 0.42, 0.9, -0.16)
    rack.add(pole)
    const finial = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 8), trimGoldMat())
    finial.position.set(s * 0.42, 2.1, -0.16)
    rack.add(finial)
  }

  // Heraldic banner cloth hanging between the poles (charcoal, gold border,
  // red field + gold cross) facing outward behind the mech (-Z).
  const cloth = plate(0.82, 1.6, 0.05, armorMat(PALETTE.armorMid), 0.02)
  cloth.position.set(0, 1.0, -0.18)
  rack.add(cloth)
  const clothBorder = trimStripe(0.76, 1.52, { thickness: 0.035, depth: 0.04 })
  clothBorder.position.set(0, 1.0, -0.22)
  rack.add(clothBorder)
  const field = plate(0.4, 0.72, 0.04, accentRedMat(), 0.03)
  field.position.set(0, 1.0, -0.22)
  rack.add(field)
  const bCrossV = plate(0.08, 0.58, 0.04, trimGoldMat())
  bCrossV.position.set(0, 1.0, -0.25)
  rack.add(bCrossV)
  const bCrossH = plate(0.3, 0.08, 0.04, trimGoldMat())
  bCrossH.position.set(0, 1.12, -0.25)
  rack.add(bCrossH)

  // Vernier thrusters under the pack with amber glow.
  for (const s of [-1, 1] as const) {
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.24, 12), frameMat())
    nozzle.position.set(s * 0.3, -0.55, 0.05)
    rack.add(nozzle)
    const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 12), glowEyeMat())
    glow.position.set(s * 0.3, -0.68, 0.05)
    rack.add(glow)
  }

  return rack
}
