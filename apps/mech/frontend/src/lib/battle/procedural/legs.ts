/**
 * Procedural Leg Part Models
 * Max dimensions: 2.5 x 3.0 x 2.0 units
 * Origin at ground level, models extend upward to ~2.8
 *
 * Leg sub-groups are named for animation:
 * - 'leg-left' / 'leg-right' for bipedal (pivot at hip y=2.6)
 * - 'leg-fl' / 'leg-fr' / 'leg-bl' / 'leg-br' for quad (pivot at hip y=2.3)
 * - 'wheel-*' for tracked (spin on move)
 * - 'thruster-*' for hover (glow on move)
 *
 * Built to the shared art-bible toolkit (see detailing.ts): charcoal armor
 * dominates, steel frame only on joints/pistons, sparse red knee/shin/foot
 * accents, thin gold edge piping, amber glow on sensors and thrusters.
 *
 * Fidelity pass: plates are sloped/tapered and overlap in tiers for a sharper
 * silhouette; knee guards carry a red insert plus an amber sensor dot; shin
 * fronts are forward-canted with twin yellow edge lines; feet are chunky and
 * angular with splayed toe/heel and rivet detail. Local extents and hip-pivot
 * origins are unchanged from the previous revision so nothing floats/clips.
 */

import * as THREE from 'three'
import { MATERIALS, createEnergyMaterial } from './materials'
import {
  PALETTE,
  armorMat,
  frameMat,
  accentRedMat,
  trimGoldMat,
  glowEyeMat,
  chamferBox,
  panelPlate,
  trimStripe,
  edgeLine,
  ventSlats,
  riveting,
  bolt,
} from './detailing'

function createBipedalLeg(side: -1 | 1): THREE.Group {
  // Pivot at hip joint position — all child positions relative to hip
  const leg = new THREE.Group()
  leg.name = side === -1 ? 'leg-left' : 'leg-right'
  leg.position.set(side * 0.55, 2.6, 0) // hip pivot in world space

  // Shared materials reused across this leg's meshes.
  const armor = armorMat()
  const armorTier = armorMat(PALETTE.armorMid)
  const steel = frameMat()
  const steelLight = frameMat(PALETTE.frameSteelLight)
  const red = accentRedMat()
  const gold = trimGoldMat()
  const amber = glowEyeMat()

  // Hip joint ball (exposed steel mechanical) + collar ring.
  const hipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), steel)
  leg.add(hipJoint)
  const hipCollar = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 6, 16), steelLight)
  hipCollar.rotation.y = Math.PI / 2
  leg.add(hipCollar)

  // Upper leg armor (thigh) — layered chamfered plate, tapered toward the knee.
  const thigh = panelPlate(0.48, 1.0, 0.44, {
    baseMat: armor,
    topMat: armorTier,
    inset: 0.1,
    raise: 0.05,
  })
  thigh.position.set(0, -0.6, 0.05)
  // Slight inward taper so the thigh narrows toward the knee.
  thigh.scale.set(0.82, 1, 0.85)
  leg.add(thigh)
  // Untapered upper block keeps the hip end full-width (overlap layering).
  const thighUpper = new THREE.Mesh(chamferBox(0.5, 0.34, 0.46, 0.06), armor)
  thighUpper.position.set(0, -0.24, 0.04)
  leg.add(thighUpper)

  // Outer thigh side plate, splayed and sloped for a sharper silhouette.
  const thighSide = new THREE.Mesh(chamferBox(0.18, 0.74, 0.42, 0.05), armorTier)
  thighSide.position.set(side * 0.31, -0.55, 0.02)
  thighSide.rotation.z = side * 0.14
  leg.add(thighSide)
  // Gold edge line tracing the outer thigh plate.
  const thighSideTrim = edgeLine(0.66, { thickness: 0.02, mat: gold })
  thighSideTrim.rotation.z = Math.PI / 2 + side * 0.14
  thighSideTrim.position.set(side * 0.41, -0.55, 0.03)
  leg.add(thighSideTrim)

  // Thin gold edge line down the front centre of the thigh.
  const thighTrim = edgeLine(0.82, { thickness: 0.022, mat: gold })
  thighTrim.rotation.z = Math.PI / 2
  thighTrim.position.set(0.0, -0.6, 0.3)
  leg.add(thighTrim)

  // Upper leg inner piston (exposed steel mechanical, behind armor)
  const upperPiston = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.15, 1.0, 8),
    steelLight
  )
  upperPiston.position.set(0, -0.6, -0.12)
  leg.add(upperPiston)

  // Hydraulic lines (thin steel)
  for (const pos of [0.18, -0.18]) {
    const line = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), steel)
    line.position.set(0, -0.6, pos - 0.02)
    leg.add(line)
  }

  // Knee joint (steel cylinder pivot) with end caps.
  const knee = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.3, 12), steel)
  knee.rotation.z = Math.PI / 2
  knee.position.set(0, -1.15, 0.08)
  leg.add(knee)
  for (const cx of [-1, 1]) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.04, 12), steelLight)
    cap.rotation.z = Math.PI / 2
    cap.position.set(cx * 0.15, -1.15, 0.08)
    leg.add(cap)
  }

  // Knee guard — angular charcoal cap (layered base + raised tier), red accent.
  const kneeCap = new THREE.Mesh(chamferBox(0.3, 0.34, 0.2, 0.05), armor)
  kneeCap.position.set(0, -1.13, 0.26)
  kneeCap.rotation.x = -0.14
  leg.add(kneeCap)
  const kneeTier = new THREE.Mesh(chamferBox(0.22, 0.24, 0.1, 0.04), armorTier)
  kneeTier.position.set(0, -1.13, 0.37)
  kneeTier.rotation.x = -0.14
  leg.add(kneeTier)
  // Gold trim framing the raised knee tier.
  const kneeTrim = trimStripe(0.24, 0.26, { thickness: 0.018, mat: gold })
  kneeTrim.position.set(0, -1.13, 0.43)
  kneeTrim.rotation.x = -0.14
  leg.add(kneeTrim)

  // Red knee accent slat set into the guard front.
  const kneeRed = ventSlats(2, 0.16, 0.16, { depth: 0.04, slatMat: red })
  kneeRed.position.set(0, -1.13, 0.44)
  kneeRed.rotation.x = -0.14
  leg.add(kneeRed)
  // Amber sensor dot centred on the knee guard.
  const kneeSensor = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 10), amber)
  kneeSensor.rotation.x = Math.PI / 2 - 0.14
  kneeSensor.position.set(0, -1.05, 0.47)
  leg.add(kneeSensor)

  // Lower leg (shin) — forward-sloped layered plate.
  const shin = panelPlate(0.42, 1.1, 0.38, {
    baseMat: armor,
    topMat: armorTier,
    inset: 0.09,
    raise: 0.04,
  })
  shin.position.set(0, -1.8, -0.03)
  shin.rotation.x = 0.1
  leg.add(shin)

  // Forward-sloped shin front plate (canted out at the toe) with twin edge lines.
  const shinFront = new THREE.Mesh(chamferBox(0.36, 0.88, 0.12, 0.04), armorTier)
  shinFront.position.set(0, -1.78, 0.21)
  shinFront.rotation.x = 0.24
  leg.add(shinFront)
  // Twin thin yellow edge lines running down the shin front.
  for (const lx of [-1, 1]) {
    const line = edgeLine(0.82, { thickness: 0.018, mat: gold })
    line.rotation.z = Math.PI / 2
    line.rotation.x = 0.24
    line.position.set(lx * 0.13, -1.78, 0.28)
    leg.add(line)
  }

  // Small red slash near the bottom of the shin.
  const shinRed = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.04), red)
  shinRed.position.set(0, -2.16, 0.27)
  shinRed.rotation.x = 0.24
  leg.add(shinRed)
  // Side panel-line rivets on the shin.
  const shinRivets = riveting(3, 0.22, { mat: steelLight })
  shinRivets.rotation.y = Math.PI / 2
  shinRivets.position.set(side * 0.21, -1.8, -0.02)
  leg.add(shinRivets)

  // Lower leg rear actuator (exposed steel)
  const actuator = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.08, 1.0, 8),
    steelLight
  )
  actuator.position.set(0, -1.8, -0.22)
  leg.add(actuator)

  // Ankle joint (steel)
  const ankle = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), steel)
  ankle.position.set(0, -2.42, 0)
  leg.add(ankle)
  // Ankle armor cuff over the joint.
  const ankleCuff = new THREE.Mesh(chamferBox(0.3, 0.16, 0.3, 0.04), armorTier)
  ankleCuff.position.set(0, -2.36, 0.02)
  leg.add(ankleCuff)

  // Foot — chunky angular chamfered block, widening toward the toe.
  const foot = new THREE.Mesh(chamferBox(0.54, 0.16, 0.8, 0.05), armor)
  foot.position.set(0, -2.52, 0.1)
  leg.add(foot)

  // Foot top tier plate for layered overlap.
  const footTop = new THREE.Mesh(chamferBox(0.42, 0.1, 0.52, 0.04), armorTier)
  footTop.position.set(0, -2.42, 0.05)
  leg.add(footTop)

  // Red slash across the toe.
  const footRed = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.05, 0.08), red)
  footRed.position.set(0, -2.5, 0.46)
  leg.add(footRed)
  // Gold edge line above the toe slash.
  const footTrim = edgeLine(0.4, { thickness: 0.018, mat: gold })
  footTrim.position.set(0, -2.43, 0.49)
  leg.add(footTrim)

  // Toe claw (angular, splayed down)
  const toe = new THREE.Mesh(chamferBox(0.44, 0.12, 0.24, 0.03), armor)
  toe.position.set(0, -2.56, 0.51)
  toe.rotation.x = 0.18
  leg.add(toe)

  // Heel spur (angular, kicked back)
  const heel = new THREE.Mesh(chamferBox(0.34, 0.12, 0.22, 0.03), armor)
  heel.position.set(0, -2.55, -0.26)
  heel.rotation.x = -0.2
  leg.add(heel)

  // Rivets along the foot side for weathered detail.
  const footRivets = riveting(3, 0.18, { mat: steelLight })
  footRivets.rotation.y = Math.PI / 2
  footRivets.position.set(side * 0.27, -2.5, 0.1)
  leg.add(footRivets)

  return leg
}

export function createBipedalLegs(): THREE.Group {
  const group = new THREE.Group()

  // Left and right legs as separate animatable groups
  group.add(createBipedalLeg(-1))
  group.add(createBipedalLeg(1))

  const armor = armorMat()
  const armorTier = armorMat(PALETTE.armorMid)
  const steel = frameMat()
  const red = accentRedMat()

  // Hip assembly / pelvis frame (static) — chamfered.
  const hip = new THREE.Mesh(chamferBox(1.5, 0.3, 0.6, 0.07), armor)
  hip.position.set(0, 2.7, 0)
  group.add(hip)

  // Hip armor skirts — angular sloped layered plates with gold trim.
  for (const side of [-1, 1] as const) {
    const skirt = panelPlate(0.38, 0.52, 0.5, {
      baseMat: armor,
      topMat: armorTier,
      inset: 0.08,
      raise: 0.04,
      trim: true,
    })
    skirt.position.set(side * 0.76, 2.48, 0.04)
    skirt.rotation.z = side * 0.1
    skirt.rotation.x = 0.06
    group.add(skirt)
    // Red accent slat on the front face of each skirt.
    const skirtRed = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.04), red)
    skirtRed.position.set(side * 0.76, 2.48, 0.32)
    group.add(skirtRed)
  }

  // Central pelvis detail (steel frame)
  const pelvis = new THREE.Mesh(chamferBox(0.7, 0.35, 0.45, 0.05), steel)
  pelvis.position.set(0, 2.55, 0)
  group.add(pelvis)
  // Front pelvis red accent slat.
  const pelvisRed = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.04), red)
  pelvisRed.position.set(0, 2.55, 0.24)
  group.add(pelvisRed)

  return group
}

export function createTrackedLegs(): THREE.Group {
  const group = new THREE.Group()

  const armor = armorMat()
  const armorTier = armorMat(PALETTE.armorMid)
  const steel = frameMat()
  const steelLight = frameMat(PALETTE.frameSteelLight)
  const wheelMat = frameMat(0x222428)
  const gold = trimGoldMat()
  const red = accentRedMat()
  const amber = glowEyeMat()

  // Two track assemblies
  for (const side of [-1, 1] as const) {
    const trackGroup = new THREE.Group()
    trackGroup.name = side === -1 ? 'track-left' : 'track-right'

    // Track housing — chamfered charcoal plate.
    const track = new THREE.Mesh(chamferBox(0.6, 0.9, 2.0, 0.08), armor)
    track.position.set(side * 0.9, 0.45, 0)
    trackGroup.add(track)

    // Sloped lower track guard (sharpens the silhouette at the bottom edge).
    const lowerGuard = new THREE.Mesh(chamferBox(0.5, 0.2, 1.9, 0.05), armorTier)
    lowerGuard.position.set(side * 0.93, 0.05, 0)
    lowerGuard.rotation.z = side * 0.14
    trackGroup.add(lowerGuard)

    // Track fender skirt (layered tier) sloped over the top.
    const skirt = new THREE.Mesh(chamferBox(0.66, 0.16, 2.1, 0.05), armorTier)
    skirt.position.set(side * 0.9, 0.96, 0)
    skirt.rotation.z = side * 0.08
    trackGroup.add(skirt)

    // Gold edge line along the top of the track skirt.
    const skirtTrim = edgeLine(2.0, { thickness: 0.022, mat: gold })
    skirtTrim.rotation.y = Math.PI / 2
    skirtTrim.position.set(side * 0.9 - side * 0.33, 0.97, 0)
    trackGroup.add(skirtTrim)

    // Red intake slats on the outer track housing.
    const intake = ventSlats(4, 0.32, 0.6, { slatMat: red })
    intake.rotation.y = side * (Math.PI / 2)
    intake.position.set(side * 1.21, 0.45, 0.4)
    trackGroup.add(intake)

    // Amber running-light sensor on the outer housing.
    const runLight = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 10), amber)
    runLight.rotation.z = side * (Math.PI / 2)
    runLight.position.set(side * 1.21, 0.7, -0.6)
    trackGroup.add(runLight)

    // Road wheels (named for spin animation)
    for (let i = 0; i < 5; i++) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.1, 12),
        wheelMat
      )
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(side * 0.9, 0.3, (i - 2) * 0.45)
      wheel.name = `wheel-${side === -1 ? 'l' : 'r'}-${i}`
      trackGroup.add(wheel)
      // Steel hub cap so spinning wheels read mechanical.
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 8), steelLight)
      hub.rotation.z = Math.PI / 2
      hub.position.set(side * 0.9, 0.3, (i - 2) * 0.45)
      hub.name = `wheel-${side === -1 ? 'l' : 'r'}-${i}-hub`
      trackGroup.add(hub)
    }

    // Drive sprocket
    const sprocket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.12, 8),
      steel
    )
    sprocket.rotation.z = Math.PI / 2
    sprocket.position.set(side * 0.9, 0.6, -0.95)
    sprocket.name = `sprocket-${side === -1 ? 'l' : 'r'}`
    trackGroup.add(sprocket)

    // Idler wheel
    const idler = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.12, 8),
      steel
    )
    idler.rotation.z = Math.PI / 2
    idler.position.set(side * 0.9, 0.6, 0.95)
    idler.name = `idler-${side === -1 ? 'l' : 'r'}`
    trackGroup.add(idler)

    group.add(trackGroup)
  }

  // Suspension struts (exposed steel)
  for (const side of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.2, 0.2), steel)
      strut.position.set(side * 0.65, 1.6, (i - 0.5) * 1.0)
      group.add(strut)
    }
  }

  // Upper platform — chamfered armor.
  const platform = new THREE.Mesh(chamferBox(2.2, 0.4, 1.8, 0.08), armor)
  platform.position.set(0, 2.4, 0)
  group.add(platform)

  // Platform edge piping.
  const platTrim = trimStripe(2.1, 1.7, { thickness: 0.022, mat: gold })
  platTrim.rotation.x = -Math.PI / 2
  platTrim.position.set(0, 2.61, 0)
  group.add(platTrim)

  // Hull front detail — forward-sloped chamfered glacis with a red slash.
  const hullFront = new THREE.Mesh(chamferBox(1.8, 0.35, 0.3, 0.05), armorTier)
  hullFront.position.set(0, 2.3, 1.0)
  hullFront.rotation.x = -0.3
  group.add(hullFront)
  const glacisRed = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.05), red)
  glacisRed.position.set(0, 2.36, 1.12)
  glacisRed.rotation.x = -0.3
  group.add(glacisRed)
  // Twin amber sensor eyes on the glacis.
  for (const ex of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), amber)
    eye.position.set(ex * 0.35, 2.3, 1.16)
    group.add(eye)
  }

  return group
}

export function createHoverLegs(): THREE.Group {
  const group = new THREE.Group()

  const armor = armorMat()
  const armorTier = armorMat(PALETTE.armorMid)
  const steel = frameMat(PALETTE.frameSteelLight)
  const gold = trimGoldMat()
  const red = accentRedMat()
  const amber = glowEyeMat()

  // Central hover body — layered chamfered plate with gold edge trim.
  const body = panelPlate(1.6, 0.6, 1.4, {
    baseMat: armor,
    topMat: armorTier,
    inset: 0.14,
    raise: 0.05,
    bevel: 0.08,
    trim: true,
  })
  body.position.set(0, 2.2, 0)
  group.add(body)
  // Red intake slats on the body front.
  const bodyIntake = ventSlats(3, 0.5, 0.28, { slatMat: red, horizontal: true })
  bodyIntake.position.set(0, 2.2, 0.72)
  group.add(bodyIntake)

  // Hover nacelles (4, on struts)
  for (const x of [-1, 1]) {
    for (const z of [-1, 1]) {
      const nacelle = new THREE.Group()
      nacelle.name = `thruster-${x === -1 ? 'l' : 'r'}${z === -1 ? 'b' : 'f'}`

      const strut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 1.6, 6),
        steel
      )
      strut.position.set(x * 0.7, 1.3, z * 0.6)
      strut.rotation.z = x * 0.15
      nacelle.add(strut)

      // Thruster nacelle shell — chamfered charcoal pod.
      const thruster = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.38, 0.5, 12),
        armor
      )
      thruster.position.set(x * 0.85, 0.4, z * 0.7)
      nacelle.add(thruster)

      // Mid-band armor tier on the pod for layered detail.
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.36, 0.12, 12),
        armorTier
      )
      band.position.set(x * 0.85, 0.46, z * 0.7)
      nacelle.add(band)

      // Gold ring trim around the nacelle mouth.
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.32, 0.022, 6, 16),
        gold
      )
      ring.rotation.x = Math.PI / 2
      ring.position.set(x * 0.85, 0.18, z * 0.7)
      nacelle.add(ring)

      // Amber thruster glow.
      const glow = new THREE.Mesh(
        new THREE.ConeGeometry(0.25, 0.4, 8),
        createEnergyMaterial(PALETTE.glowAmber)
      )
      glow.rotation.x = Math.PI
      glow.position.set(x * 0.85, 0.05, z * 0.7)
      glow.name = 'thrust-glow'
      nacelle.add(glow)

      group.add(nacelle)
    }
  }

  // Stabilizer fins — angular sloped plates with amber tip sensors.
  for (const side of [-1, 1]) {
    const fin = new THREE.Mesh(chamferBox(0.08, 0.42, 0.82, 0.03), armorTier)
    fin.position.set(side * 1.1, 2.0, 0)
    fin.rotation.z = side * 0.2
    group.add(fin)
    const finTrim = edgeLine(0.78, { thickness: 0.016, mat: gold })
    finTrim.rotation.x = Math.PI / 2
    finTrim.rotation.z = side * 0.2
    finTrim.position.set(side * 1.16, 2.18, 0)
    group.add(finTrim)
    const finSensor = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), amber)
    finSensor.position.set(side * 1.18, 2.18, 0.38)
    group.add(finSensor)
  }

  // Top mounting plate (steel frame)
  const plate = new THREE.Mesh(chamferBox(1.4, 0.15, 1.2, 0.05), MATERIALS.swiftDrive)
  plate.position.set(0, 2.6, 0)
  group.add(plate)

  return group
}

function createQuadLeg(x: -1 | 1, z: -1 | 1): THREE.Group {
  const label = `leg-${x === -1 ? 'l' : 'r'}${z === -1 ? 'b' : 'f'}`
  const leg = new THREE.Group()
  leg.name = label
  leg.position.set(x * 0.7, 2.3, z * 0.7) // pivot at hip

  const armor = armorMat()
  const armorTier = armorMat(PALETTE.armorMid)
  const steel = frameMat()
  const steelLight = frameMat(PALETTE.frameSteelLight)
  const red = accentRedMat()
  const gold = trimGoldMat()
  const amber = glowEyeMat()

  // Hip joint (exposed steel) + armor shoulder cap over it.
  const hip = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), steel)
  leg.add(hip)
  const hipCap = new THREE.Mesh(chamferBox(0.28, 0.24, 0.28, 0.05), armorTier)
  hipCap.position.set(x * 0.04, -0.06, z * 0.04)
  leg.add(hipCap)

  // Upper leg — steel inner limb wrapped in a chamfered, sloped armor shell.
  const upper = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.14, 0.8, 8, 12),
    steelLight
  )
  upper.position.set(x * 0.1, -0.6, z * 0.1)
  upper.rotation.z = x * 0.15
  upper.rotation.x = z * 0.12
  leg.add(upper)

  const upperArmor = new THREE.Mesh(chamferBox(0.26, 0.72, 0.26, 0.05), armor)
  upperArmor.position.set(x * 0.12, -0.58, z * 0.12)
  upperArmor.rotation.z = x * 0.15
  upperArmor.rotation.x = z * 0.12
  leg.add(upperArmor)
  // Outer gold edge line on the upper limb armor.
  const upperTrim = edgeLine(0.62, { thickness: 0.018, mat: gold })
  upperTrim.rotation.z = Math.PI / 2 + x * 0.15
  upperTrim.position.set(x * 0.24, -0.58, z * 0.12)
  leg.add(upperTrim)

  // Knee joint + layered red accent guard + amber sensor.
  const knee = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), steel)
  knee.position.set(x * 0.2, -1.15, z * 0.2)
  leg.add(knee)

  const kneeGuard = new THREE.Mesh(chamferBox(0.18, 0.2, 0.16, 0.03), armorTier)
  kneeGuard.position.set(x * 0.29, -1.15, z * 0.29)
  leg.add(kneeGuard)

  const kneeRed = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.05), red)
  kneeRed.position.set(x * 0.37, -1.15, z * 0.37)
  leg.add(kneeRed)
  const kneeSensor = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), amber)
  kneeSensor.position.set(x * 0.4, -1.08, z * 0.4)
  leg.add(kneeSensor)

  // Lower leg — steel limb + sloped armor plate with gold edge line.
  const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.7, 8, 12), steelLight)
  lower.position.set(x * 0.2, -1.7, z * 0.2)
  leg.add(lower)

  const lowerArmor = new THREE.Mesh(chamferBox(0.2, 0.62, 0.2, 0.04), armor)
  lowerArmor.position.set(x * 0.22, -1.7, z * 0.22)
  leg.add(lowerArmor)

  const lowerTrim = edgeLine(0.52, { thickness: 0.018, mat: gold })
  lowerTrim.rotation.z = Math.PI / 2
  lowerTrim.position.set(x * 0.32, -1.7, z * 0.22)
  leg.add(lowerTrim)

  // Foot pad — chunky angular hoof with a forward claw and rivet detail.
  const foot = new THREE.Mesh(chamferBox(0.36, 0.14, 0.38, 0.05), armor)
  foot.position.set(x * 0.2, -2.25, z * 0.2)
  leg.add(foot)
  const claw = new THREE.Mesh(chamferBox(0.3, 0.1, 0.16, 0.03), armorTier)
  claw.position.set(x * 0.2, -2.27, z * 0.42)
  claw.rotation.x = z * 0.2
  leg.add(claw)
  const footBolt = bolt(0.03, { mat: steelLight })
  footBolt.position.set(x * 0.2, -2.18, z * 0.36)
  leg.add(footBolt)

  return leg
}

export function createQuadrupedalLegs(): THREE.Group {
  const group = new THREE.Group()

  // Four articulated legs as separate animatable groups
  group.add(createQuadLeg(-1, -1))
  group.add(createQuadLeg(-1, 1))
  group.add(createQuadLeg(1, -1))
  group.add(createQuadLeg(1, 1))

  const armor = armorMat()
  const armorTier = armorMat(PALETTE.armorMid)
  const gold = trimGoldMat()
  const red = accentRedMat()
  const amber = glowEyeMat()

  // Central body frame / spine — layered chamfered plate.
  const frame = panelPlate(1.6, 0.35, 1.6, {
    baseMat: armor,
    topMat: armorTier,
    inset: 0.16,
    raise: 0.04,
    bevel: 0.06,
    trim: true,
  })
  frame.position.set(0, 2.45, 0)
  group.add(frame)

  // Spine ridge — angular charcoal with gold edge and a red accent slat.
  const spine = new THREE.Mesh(chamferBox(0.3, 0.2, 1.4, 0.05), armorTier)
  spine.position.set(0, 2.7, 0)
  group.add(spine)

  const spineTrim = edgeLine(1.3, { thickness: 0.02, mat: gold })
  spineTrim.rotation.y = Math.PI / 2
  spineTrim.position.set(0, 2.81, 0)
  group.add(spineTrim)

  const spineRed = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.4), red)
  spineRed.position.set(0, 2.81, 0)
  group.add(spineRed)

  // Amber sensor eyes at the front of the spine.
  for (const ex of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), amber)
    eye.position.set(ex * 0.1, 2.78, 0.68)
    group.add(eye)
  }

  return group
}
