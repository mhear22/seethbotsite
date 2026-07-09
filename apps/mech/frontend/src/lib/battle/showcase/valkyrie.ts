import * as THREE from 'three'
import {
  PALETTE, armorMat, frameMat, accentRedMat, trimGoldMat, glowEyeMat, ventMat,
  chamferBox, panelPlate, trimStripe, edgeLine, ventSlats, bolt, riveting,
} from '../procedural/detailing'

/**
 * VALKYRIE — an aerospace interceptor mech.
 *
 * Swept, flight-inspired silhouette: a jet-canopy head, a sleek chest intake,
 * large angled wing/thruster units on the back, calf thruster fins, and feet
 * built as downward hover pods. A poised, hover-ready stance. Amber nozzle
 * glows are the only emissive accents so the form reads as a war machine that
 * belongs in the sky.
 *
 * Facing +Z, standing on y≈0, centred on x=0/z=0. Height ≈ 4.6 units.
 */
export function createValkyrieMech(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'valkyrie'

  // Shared cached materials (never mutated in place).
  const armor = armorMat()
  const armorLite = armorMat(PALETTE.armorMid)
  const frame = frameMat()
  const frameLite = frameMat(PALETTE.frameSteelLight)
  const red = accentRedMat()
  const gold = trimGoldMat()
  const glow = glowEyeMat()
  const vent = ventMat()

  // Canopy glass — custom dark cockpit tint (not a cached factory colour).
  const canopyGlass: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a2733,
    metalness: 0.3,
    roughness: 0.18,
    emissive: 0x0a1420,
    emissiveIntensity: 0.25,
  })

  /* -------------------------------------------------------------- */
  /* small builders                                                 */
  /* -------------------------------------------------------------- */

  /** A flared thruster nozzle whose glowing exit faces local +Z. */
  function nozzle(r: number, len: number): THREE.Group {
    const g = new THREE.Group()
    g.name = 'nozzle'

    const shell = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 1.32, r * 0.82, len, 14, 1, true),
      frameLite
    )
    shell.rotation.x = Math.PI / 2 // axis -> Z, flared top at +Z
    g.add(shell)

    const throat = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 1.02, r * 0.62, len * 0.7, 14, 1, true),
      vent
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

  /* -------------------------------------------------------------- */
  /* LEGS  (feet = downward hover pods, calves carry thruster fins)  */
  /* -------------------------------------------------------------- */

  function buildLeg(side: 1 | -1): THREE.Group {
    const leg = new THREE.Group()
    leg.name = side > 0 ? 'leg-right' : 'leg-left'
    leg.position.set(side * 0.62, 0, 0)

    // Hover-pod foot: a fat downward thruster canister.
    const foot = new THREE.Group()
    foot.name = 'foot'
    foot.position.set(0, 0.42, 0.08)

    const pod = new THREE.Mesh(chamferBox(0.62, 0.5, 0.92, 0.1), armor)
    foot.add(pod)
    const podPlate = panelPlate(0.5, 0.34, 0.2, { trim: true, raise: 0.04 })
    podPlate.rotation.x = Math.PI / 2
    podPlate.position.set(0, 0.26, 0.02)
    foot.add(podPlate)
    // toe splitter
    const toe = new THREE.Mesh(chamferBox(0.5, 0.24, 0.4, 0.07), armorLite)
    toe.position.set(0, -0.06, 0.5)
    foot.add(toe)
    const redSlash = new THREE.Mesh(chamferBox(0.5, 0.06, 0.16, 0.02), red)
    redSlash.position.set(0, 0.02, 0.66)
    foot.add(redSlash)
    // downward hover jets under the pod
    const jetA = nozzle(0.17, 0.3)
    jetA.rotation.x = -Math.PI / 2 // exit -> down
    jetA.position.set(-0.15, -0.2, -0.02)
    foot.add(jetA)
    const jetB = nozzle(0.17, 0.3)
    jetB.rotation.x = -Math.PI / 2
    jetB.position.set(0.15, -0.2, -0.02)
    foot.add(jetB)
    leg.add(foot)

    // Ankle joint
    const ankle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.34, 12), frame)
    ankle.rotation.z = Math.PI / 2
    ankle.position.set(0, 0.74, 0.02)
    leg.add(ankle)

    // Calf — swept slightly forward, armoured shin.
    const calf = new THREE.Group()
    calf.name = 'calf'
    calf.position.set(0, 1.15, 0.02)

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

    // Calf thruster fin — angled swept blade off the outer-rear of the shin,
    // tipped with an amber nozzle. Signature Valkyrie flourish.
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

    // Knee guard
    const knee = new THREE.Mesh(chamferBox(0.42, 0.36, 0.4, 0.08), armorLite)
    knee.position.set(0, 1.66, 0.14)
    leg.add(knee)
    const kneeRed = new THREE.Mesh(chamferBox(0.3, 0.1, 0.1, 0.03), red)
    kneeRed.position.set(0, 1.66, 0.36)
    leg.add(kneeRed)

    // Thigh — piston + armour, tucked slightly inward toward the hips.
    const thighPiston = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 10), frameLite)
    thighPiston.position.set(0, 1.9, -0.14)
    leg.add(thighPiston)
    const thigh = new THREE.Mesh(chamferBox(0.5, 0.66, 0.5, 0.09), armor)
    thigh.position.set(side * -0.02, 2.02, 0.04)
    leg.add(thigh)
    const thighPlate = panelPlate(0.3, 0.4, 0.1, {})
    thighPlate.position.set(side * -0.02, 2.04, 0.3)
    leg.add(thighPlate)

    return leg
  }

  root.add(buildLeg(1), buildLeg(-1))

  /* -------------------------------------------------------------- */
  /* PELVIS                                                          */
  /* -------------------------------------------------------------- */

  const pelvis = new THREE.Group()
  pelvis.name = 'pelvis'
  pelvis.position.set(0, 2.32, 0.02)

  const hipBlock = new THREE.Mesh(chamferBox(1.18, 0.44, 0.7, 0.1), frame)
  pelvis.add(hipBlock)
  const hipArmorL = new THREE.Mesh(chamferBox(0.42, 0.5, 0.5, 0.08), armor)
  hipArmorL.position.set(-0.5, -0.02, 0.06)
  pelvis.add(hipArmorL)
  const hipArmorR = new THREE.Mesh(chamferBox(0.42, 0.5, 0.5, 0.08), armor)
  hipArmorR.position.set(0.5, -0.02, 0.06)
  pelvis.add(hipArmorR)
  // groin crest
  const crest = new THREE.Mesh(chamferBox(0.34, 0.5, 0.26, 0.06), armorLite)
  crest.position.set(0, -0.18, 0.34)
  pelvis.add(crest)
  const crestGold = new THREE.Mesh(chamferBox(0.14, 0.34, 0.06, 0.02), red)
  crestGold.position.set(0, -0.16, 0.5)
  pelvis.add(crestGold)
  root.add(pelvis)

  /* -------------------------------------------------------------- */
  /* TORSO  (sleek chest intake, swept pauldrons)                    */
  /* -------------------------------------------------------------- */

  const torso = new THREE.Group()
  torso.name = 'torso'
  torso.position.set(0, 2.98, 0.02)

  // Waist
  const waist = new THREE.Mesh(chamferBox(0.7, 0.4, 0.56, 0.08), frame)
  waist.position.set(0, -0.42, 0)
  torso.add(waist)

  // Main chest — a tapered aerodynamic breastplate, wider at the shoulders.
  const chest = new THREE.Mesh(chamferBox(1.5, 0.9, 0.86, 0.12), armor)
  chest.position.set(0, 0.06, 0)
  torso.add(chest)

  // Central sleek intake — a recessed grille angled into the chest.
  const intakeHousing = new THREE.Mesh(chamferBox(0.62, 0.5, 0.2, 0.06), armorLite)
  intakeHousing.position.set(0, 0.12, 0.44)
  intakeHousing.rotation.x = -0.14
  torso.add(intakeHousing)
  const intake = ventSlats(5, 0.5, 0.4, { horizontal: false, slatMat: frameLite })
  intake.position.set(0, 0.12, 0.55)
  intake.rotation.x = -0.14
  torso.add(intake)
  const intakeTrim = trimStripe(0.56, 0.46, { thickness: 0.02, mat: gold })
  intakeTrim.position.set(0, 0.12, 0.57)
  intakeTrim.rotation.x = -0.14
  torso.add(intakeTrim)

  // Collarbone red slashes flanking the intake.
  const slashL = new THREE.Mesh(chamferBox(0.34, 0.1, 0.12, 0.03), red)
  slashL.position.set(-0.5, 0.34, 0.42)
  slashL.rotation.z = 0.3
  torso.add(slashL)
  const slashR = new THREE.Mesh(chamferBox(0.34, 0.1, 0.12, 0.03), red)
  slashR.position.set(0.5, 0.34, 0.42)
  slashR.rotation.z = -0.3
  torso.add(slashR)

  // Side chest cooling ducts.
  const ductL = ventSlats(4, 0.16, 0.44, { horizontal: false })
  ductL.position.set(-0.72, 0.06, 0.32)
  torso.add(ductL)
  const ductR = ventSlats(4, 0.16, 0.44, { horizontal: false })
  ductR.position.set(0.72, 0.06, 0.32)
  torso.add(ductR)

  // Neck.
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.24, 12), frame)
  neck.position.set(0, 0.6, -0.02)
  torso.add(neck)

  /* -------------------------------------------------------------- */
  /* HEAD  (jet canopy)                                             */
  /* -------------------------------------------------------------- */

  const head = new THREE.Group()
  head.name = 'head'
  head.position.set(0, 0.86, 0.02)

  const skull = new THREE.Mesh(chamferBox(0.42, 0.36, 0.5, 0.08), armor)
  head.add(skull)
  // Swept canopy — tinted glass wedge sloping down toward the nose.
  const canopy = new THREE.Mesh(chamferBox(0.34, 0.24, 0.42, 0.06), canopyGlass)
  canopy.position.set(0, 0.06, 0.2)
  canopy.rotation.x = -0.4
  head.add(canopy)
  // Amber sensor visor glowing under the canopy lip.
  const visor = new THREE.Mesh(chamferBox(0.3, 0.05, 0.06, 0.015), glow)
  visor.position.set(0, 0.02, 0.34)
  head.add(visor)
  // Nose fin / pitot.
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.26, 8), frameLite)
  nose.rotation.x = Math.PI / 2
  nose.position.set(0, -0.06, 0.4)
  head.add(nose)
  // Rear crest fin.
  const crestFin = new THREE.Mesh(chamferBox(0.05, 0.22, 0.34, 0.02), armorLite)
  crestFin.position.set(0, 0.18, -0.14)
  crestFin.rotation.x = 0.35
  head.add(crestFin)
  // Cheek intakes.
  const cheekL = new THREE.Mesh(chamferBox(0.08, 0.16, 0.2, 0.03), frame)
  cheekL.position.set(-0.24, -0.02, 0.06)
  head.add(cheekL)
  const cheekR = new THREE.Mesh(chamferBox(0.08, 0.16, 0.2, 0.03), frame)
  cheekR.position.set(0.24, -0.02, 0.06)
  head.add(cheekR)

  torso.add(head)

  /* -------------------------------------------------------------- */
  /* SHOULDERS + ARMS  (arm-mounted beam pods)                      */
  /* -------------------------------------------------------------- */

  function buildArm(side: 1 | -1): THREE.Group {
    const arm = new THREE.Group()
    arm.name = side > 0 ? 'arm-right' : 'arm-left'
    arm.position.set(side * 0.9, 0.28, 0)

    // Swept pauldron — angled aero shoulder guard.
    const pauldron = new THREE.Group()
    pauldron.name = 'pauldron'
    const pauldronPlate = new THREE.Mesh(chamferBox(0.6, 0.5, 0.72, 0.1), armor)
    pauldron.add(pauldronPlate)
    // wing-like upper sweep
    const sweep = new THREE.Mesh(chamferBox(0.5, 0.16, 0.6, 0.05), armorLite)
    sweep.position.set(side * 0.12, 0.3, -0.02)
    sweep.rotation.z = side * -0.4
    pauldron.add(sweep)
    const sweepEdge = edgeLine(0.56, { thickness: 0.028, mat: gold })
    sweepEdge.rotation.z = Math.PI / 2 + side * -0.4
    sweepEdge.position.set(side * 0.22, 0.34, 0.28)
    pauldron.add(sweepEdge)
    const pauldronBolts = riveting(3, 0.14, { radius: 0.03 })
    pauldronBolts.position.set(0, -0.12, 0.37)
    pauldron.add(pauldronBolts)
    arm.add(pauldron)

    // Shoulder ball.
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 12), frame)
    ball.position.set(0, -0.32, 0)
    arm.add(ball)

    // Upper arm.
    const upper = new THREE.Mesh(chamferBox(0.36, 0.56, 0.4, 0.07), armor)
    upper.position.set(0, -0.62, 0)
    arm.add(upper)

    // Elbow.
    const elbow = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.34, 12), frameLite)
    elbow.rotation.z = Math.PI / 2
    elbow.position.set(0, -0.94, 0)
    arm.add(elbow)

    // Forearm + arm-mounted beam pod.
    const forearm = new THREE.Group()
    forearm.name = 'forearm'
    forearm.position.set(0, -1.32, 0.02)

    const foreArmor = new THREE.Mesh(chamferBox(0.4, 0.66, 0.44, 0.08), armor)
    forearm.add(foreArmor)
    const forePlate = panelPlate(0.24, 0.44, 0.1, { trim: true })
    forePlate.position.set(0, 0, 0.24)
    forearm.add(forePlate)

    // Beam pod — cylindrical emitter slung on the outer forearm.
    const pod = new THREE.Group()
    pod.name = 'beam-pod'
    pod.position.set(side * 0.32, -0.02, 0.12)
    const podBody = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.72, 14), frame)
    podBody.rotation.x = Math.PI / 2
    pod.add(podBody)
    const podArmor = new THREE.Mesh(chamferBox(0.24, 0.24, 0.5, 0.05), armorLite)
    podArmor.position.set(0, 0.02, -0.04)
    pod.add(podArmor)
    const podRing = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.14, 14, 1, true), frameLite)
    podRing.rotation.x = Math.PI / 2
    podRing.position.z = 0.36
    pod.add(podRing)
    const muzzle = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), glow)
    muzzle.position.z = 0.42
    pod.add(muzzle)
    const podVent = ventSlats(3, 0.16, 0.24, { horizontal: true })
    podVent.rotation.y = side * Math.PI / 2
    podVent.position.set(side * -0.13, 0, -0.1)
    pod.add(podVent)
    forearm.add(pod)

    // Hand.
    const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 10), frameLite)
    wrist.position.set(0, -0.4, 0)
    forearm.add(wrist)
    const hand = new THREE.Mesh(chamferBox(0.28, 0.22, 0.3, 0.05), frame)
    hand.position.set(0, -0.54, 0.02)
    forearm.add(hand)
    const knuckles = new THREE.Mesh(chamferBox(0.26, 0.1, 0.16, 0.03), armorLite)
    knuckles.position.set(0, -0.6, 0.16)
    forearm.add(knuckles)

    arm.add(forearm)
    return arm
  }

  torso.add(buildArm(1), buildArm(-1))

  /* -------------------------------------------------------------- */
  /* BACK — large swept wing / thruster units (the signature)       */
  /* -------------------------------------------------------------- */

  const pack = new THREE.Group()
  pack.name = 'thruster-pack'
  pack.position.set(0, 0.14, -0.48)

  // Central spine housing.
  const spine = new THREE.Mesh(chamferBox(0.6, 0.9, 0.4, 0.09), frame)
  spine.position.set(0, 0.1, 0)
  pack.add(spine)
  const spinePlate = panelPlate(0.42, 0.7, 0.12, { trim: true })
  spinePlate.rotation.y = Math.PI // face rear
  spinePlate.position.set(0, 0.1, -0.24)
  pack.add(spinePlate)
  // twin main thrusters exiting straight back.
  const mainL = nozzle(0.19, 0.44)
  mainL.rotation.y = Math.PI // exit -> -Z
  mainL.position.set(-0.2, -0.2, -0.28)
  pack.add(mainL)
  const mainR = nozzle(0.19, 0.44)
  mainR.rotation.y = Math.PI
  mainR.position.set(0.2, -0.2, -0.28)
  pack.add(mainR)

  function buildWing(side: 1 | -1): THREE.Group {
    const wing = new THREE.Group()
    wing.name = side > 0 ? 'wing-right' : 'wing-left'
    wing.position.set(side * 0.34, 0.42, -0.12)
    // sweep up and outward and rake back
    wing.rotation.set(0.22, side * 0.5, side * -0.62)

    // main wing blade
    const blade = new THREE.Mesh(chamferBox(0.34, 1.7, 0.5, 0.08), armor)
    blade.position.set(0, 0.7, 0)
    wing.add(blade)
    // tapered outer tip
    const tip = new THREE.Mesh(chamferBox(0.2, 0.6, 0.3, 0.05), armorLite)
    tip.position.set(0, 1.62, -0.06)
    tip.rotation.x = 0.2
    wing.add(tip)
    // gold leading edge
    const lead = edgeLine(1.6, { thickness: 0.035, mat: gold })
    lead.rotation.z = Math.PI / 2
    lead.position.set(side * 0.18, 0.7, 0.22)
    wing.add(lead)
    // red aileron slash near root
    const aileron = new THREE.Mesh(chamferBox(0.28, 0.14, 0.1, 0.03), red)
    aileron.position.set(0, 0.18, 0.26)
    wing.add(aileron)
    // rivet run down the spar
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
  torso.add(pack)

  root.add(torso)

  /* -------------------------------------------------------------- */
  /* finalise — enforce shadow flags on every mesh                  */
  /* -------------------------------------------------------------- */

  root.traverse((obj: THREE.Object3D) => {
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = true
      obj.receiveShadow = true
    }
  })

  return root
}
