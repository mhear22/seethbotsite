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
 */

import * as THREE from 'three'
import { MATERIALS, createEnergyMaterial } from './materials'

function createBipedalLeg(side: -1 | 1): THREE.Group {
  // Pivot at hip joint position — all child positions relative to hip
  const leg = new THREE.Group()
  leg.name = side === -1 ? 'leg-left' : 'leg-right'
  leg.position.set(side * 0.55, 2.6, 0) // hip pivot in world space

  // Hip joint ball
  const hipJointGeom = new THREE.SphereGeometry(0.2, 12, 12)
  const hipJoint = new THREE.Mesh(hipJointGeom, new THREE.MeshStandardMaterial({
    color: 0x555555, metalness: 0.9, roughness: 0.2,
  }))
  leg.add(hipJoint)

  // Upper leg armor (thigh)
  const upperArmorGeom = new THREE.BoxGeometry(0.4, 1.0, 0.4)
  const upperArmor = new THREE.Mesh(upperArmorGeom, MATERIALS.genMech)
  upperArmor.position.set(0, -0.6, 0.05)
  leg.add(upperArmor)

  // Upper leg inner piston
  const upperPistonGeom = new THREE.CylinderGeometry(0.12, 0.15, 1.0, 8)
  const upperPiston = new THREE.Mesh(upperPistonGeom, new THREE.MeshStandardMaterial({
    color: 0x444444, metalness: 0.7, roughness: 0.4,
  }))
  upperPiston.position.set(0, -0.6, -0.1)
  leg.add(upperPiston)

  // Hydraulic lines
  for (const pos of [0.18, -0.18]) {
    const lineGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6)
    const line = new THREE.Mesh(lineGeom, new THREE.MeshStandardMaterial({
      color: 0x888888, metalness: 0.9, roughness: 0.1,
    }))
    line.position.set(0, -0.6, pos)
    leg.add(line)
  }

  // Knee joint
  const kneeGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.3, 12)
  const knee = new THREE.Mesh(kneeGeom, new THREE.MeshStandardMaterial({
    color: 0x555555, metalness: 0.9, roughness: 0.2,
  }))
  knee.rotation.z = Math.PI / 2
  knee.position.set(0, -1.15, 0.1)
  leg.add(knee)

  // Knee cap
  const kneeCapGeom = new THREE.BoxGeometry(0.25, 0.3, 0.2)
  const kneeCap = new THREE.Mesh(kneeCapGeom, MATERIALS.genMech)
  kneeCap.position.set(0, -1.15, 0.25)
  leg.add(kneeCap)

  // Lower leg (shin)
  const lowerArmorGeom = new THREE.BoxGeometry(0.35, 1.1, 0.35)
  const lowerArmor = new THREE.Mesh(lowerArmorGeom, MATERIALS.genMech)
  lowerArmor.position.set(0, -1.8, -0.05)
  lowerArmor.rotation.x = 0.08
  leg.add(lowerArmor)

  // Lower leg rear actuator
  const actuatorGeom = new THREE.CylinderGeometry(0.1, 0.08, 1.0, 8)
  const actuator = new THREE.Mesh(actuatorGeom, new THREE.MeshStandardMaterial({
    color: 0x444444, metalness: 0.7,
  }))
  actuator.position.set(0, -1.8, -0.2)
  leg.add(actuator)

  // Ankle joint
  const ankleGeom = new THREE.SphereGeometry(0.12, 8, 8)
  const ankle = new THREE.Mesh(ankleGeom, new THREE.MeshStandardMaterial({
    color: 0x555555, metalness: 0.9,
  }))
  ankle.position.set(0, -2.42, 0)
  leg.add(ankle)

  // Foot
  const footGeom = new THREE.BoxGeometry(0.5, 0.12, 0.75)
  const foot = new THREE.Mesh(footGeom, MATERIALS.genMech)
  foot.position.set(0, -2.54, 0.1)
  leg.add(foot)

  // Toe claw
  const toeGeom = new THREE.BoxGeometry(0.4, 0.08, 0.2)
  const toe = new THREE.Mesh(toeGeom, MATERIALS.genMech)
  toe.position.set(0, -2.56, 0.5)
  leg.add(toe)

  // Heel spur
  const heelGeom = new THREE.BoxGeometry(0.3, 0.08, 0.18)
  const heel = new THREE.Mesh(heelGeom, MATERIALS.genMech)
  heel.position.set(0, -2.56, -0.25)
  leg.add(heel)

  return leg
}

export function createBipedalLegs(): THREE.Group {
  const group = new THREE.Group()

  // Left and right legs as separate animatable groups
  group.add(createBipedalLeg(-1))
  group.add(createBipedalLeg(1))

  // Hip assembly / pelvis frame (static)
  const hipGeom = new THREE.BoxGeometry(1.5, 0.3, 0.6)
  const hip = new THREE.Mesh(hipGeom, MATERIALS.genMech)
  hip.position.set(0, 2.7, 0)
  group.add(hip)

  // Hip armor skirts
  for (const side of [-1, 1]) {
    const skirtGeom = new THREE.BoxGeometry(0.35, 0.5, 0.5)
    const skirt = new THREE.Mesh(skirtGeom, MATERIALS.genMech)
    skirt.position.set(side * 0.75, 2.5, 0)
    group.add(skirt)
  }

  // Central pelvis detail
  const pelvisGeom = new THREE.BoxGeometry(0.7, 0.35, 0.45)
  const pelvis = new THREE.Mesh(pelvisGeom, new THREE.MeshStandardMaterial({
    color: 0x444444, metalness: 0.8,
  }))
  pelvis.position.set(0, 2.55, 0)
  group.add(pelvis)

  return group
}

export function createTrackedLegs(): THREE.Group {
  const group = new THREE.Group()

  // Two track assemblies
  for (const side of [-1, 1] as const) {
    const trackGroup = new THREE.Group()
    trackGroup.name = side === -1 ? 'track-left' : 'track-right'

    // Track housing
    const trackGeom = new THREE.BoxGeometry(0.6, 0.9, 2.0)
    const track = new THREE.Mesh(trackGeom, MATERIALS.armorWorks)
    track.position.set(side * 0.9, 0.45, 0)
    trackGroup.add(track)

    // Track skirts
    const skirtGeom = new THREE.BoxGeometry(0.65, 0.15, 2.1)
    const skirt = new THREE.Mesh(skirtGeom, MATERIALS.armorWorks)
    skirt.position.set(side * 0.9, 0.95, 0)
    trackGroup.add(skirt)

    // Road wheels (named for spin animation)
    for (let i = 0; i < 5; i++) {
      const wheelGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 12)
      const wheel = new THREE.Mesh(wheelGeom, new THREE.MeshStandardMaterial({
        color: 0x222222, metalness: 0.9,
      }))
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(side * 0.9, 0.3, (i - 2) * 0.45)
      wheel.name = `wheel-${side === -1 ? 'l' : 'r'}-${i}`
      trackGroup.add(wheel)
    }

    // Drive sprocket
    const sprocketGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.12, 8)
    const sprocket = new THREE.Mesh(sprocketGeom, MATERIALS.armorWorks)
    sprocket.rotation.z = Math.PI / 2
    sprocket.position.set(side * 0.9, 0.6, -0.95)
    sprocket.name = `sprocket-${side === -1 ? 'l' : 'r'}`
    trackGroup.add(sprocket)

    // Idler wheel
    const idlerGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.12, 8)
    const idler = new THREE.Mesh(idlerGeom, MATERIALS.armorWorks)
    idler.rotation.z = Math.PI / 2
    idler.position.set(side * 0.9, 0.6, 0.95)
    idler.name = `idler-${side === -1 ? 'l' : 'r'}`
    trackGroup.add(idler)

    group.add(trackGroup)
  }

  // Suspension struts
  for (const side of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      const strutGeom = new THREE.BoxGeometry(0.15, 1.2, 0.2)
      const strut = new THREE.Mesh(strutGeom, new THREE.MeshStandardMaterial({
        color: 0x444444, metalness: 0.7,
      }))
      strut.position.set(side * 0.65, 1.6, (i - 0.5) * 1.0)
      group.add(strut)
    }
  }

  // Upper platform
  const platformGeom = new THREE.BoxGeometry(2.2, 0.4, 1.8)
  const platform = new THREE.Mesh(platformGeom, MATERIALS.armorWorks)
  platform.position.set(0, 2.4, 0)
  group.add(platform)

  // Hull front detail
  const hullFrontGeom = new THREE.BoxGeometry(1.8, 0.35, 0.3)
  const hullFront = new THREE.Mesh(hullFrontGeom, MATERIALS.armorWorks)
  hullFront.position.set(0, 2.3, 1.0)
  hullFront.rotation.x = -0.3
  group.add(hullFront)

  return group
}

export function createHoverLegs(): THREE.Group {
  const group = new THREE.Group()

  // Central hover body
  const bodyGeom = new THREE.BoxGeometry(1.6, 0.6, 1.4)
  const body = new THREE.Mesh(bodyGeom, MATERIALS.swiftDrive)
  body.position.set(0, 2.2, 0)
  group.add(body)

  // Hover nacelles (4, on struts)
  for (const x of [-1, 1]) {
    for (const z of [-1, 1]) {
      const nacelle = new THREE.Group()
      nacelle.name = `thruster-${x === -1 ? 'l' : 'r'}${z === -1 ? 'b' : 'f'}`

      const strutGeom = new THREE.CylinderGeometry(0.06, 0.06, 1.6, 6)
      const strut = new THREE.Mesh(strutGeom, MATERIALS.swiftDrive)
      strut.position.set(x * 0.7, 1.3, z * 0.6)
      strut.rotation.z = x * 0.15
      nacelle.add(strut)

      const thrusterGeom = new THREE.CylinderGeometry(0.3, 0.38, 0.5, 12)
      const thruster = new THREE.Mesh(thrusterGeom, MATERIALS.swiftDrive)
      thruster.position.set(x * 0.85, 0.4, z * 0.7)
      nacelle.add(thruster)

      const glowGeom = new THREE.ConeGeometry(0.25, 0.4, 8)
      const glow = new THREE.Mesh(glowGeom, createEnergyMaterial(0x00aaff))
      glow.rotation.x = Math.PI
      glow.position.set(x * 0.85, 0.05, z * 0.7)
      glow.name = 'thrust-glow'
      nacelle.add(glow)

      group.add(nacelle)
    }
  }

  // Stabilizer fins
  for (const side of [-1, 1]) {
    const finGeom = new THREE.BoxGeometry(0.08, 0.4, 0.8)
    const fin = new THREE.Mesh(finGeom, MATERIALS.swiftDrive)
    fin.position.set(side * 1.1, 2.0, 0)
    group.add(fin)
  }

  // Top mounting plate
  const plateGeom = new THREE.BoxGeometry(1.4, 0.15, 1.2)
  const plate = new THREE.Mesh(plateGeom, MATERIALS.swiftDrive)
  plate.position.set(0, 2.6, 0)
  group.add(plate)

  return group
}

function createQuadLeg(x: -1 | 1, z: -1 | 1): THREE.Group {
  const label = `leg-${x === -1 ? 'l' : 'r'}${z === -1 ? 'b' : 'f'}`
  const leg = new THREE.Group()
  leg.name = label
  leg.position.set(x * 0.7, 2.3, z * 0.7) // pivot at hip

  // Hip joint
  const hipGeom = new THREE.SphereGeometry(0.15, 8, 8)
  const hip = new THREE.Mesh(hipGeom, new THREE.MeshStandardMaterial({
    color: 0x555555, metalness: 0.8,
  }))
  leg.add(hip)

  // Upper leg
  const upperGeom = new THREE.CapsuleGeometry(0.14, 0.8, 8, 12)
  const upper = new THREE.Mesh(upperGeom, MATERIALS.titanForge)
  upper.position.set(x * 0.1, -0.6, z * 0.1)
  upper.rotation.z = x * 0.15
  leg.add(upper)

  // Knee joint
  const kneeGeom = new THREE.SphereGeometry(0.12, 8, 8)
  const knee = new THREE.Mesh(kneeGeom, new THREE.MeshStandardMaterial({
    color: 0x444444, metalness: 0.8,
  }))
  knee.position.set(x * 0.2, -1.15, z * 0.2)
  leg.add(knee)

  // Lower leg
  const lowerGeom = new THREE.CapsuleGeometry(0.1, 0.7, 8, 12)
  const lower = new THREE.Mesh(lowerGeom, MATERIALS.titanForge)
  lower.position.set(x * 0.2, -1.7, z * 0.2)
  leg.add(lower)

  // Foot pad
  const footGeom = new THREE.CylinderGeometry(0.18, 0.2, 0.1, 8)
  const foot = new THREE.Mesh(footGeom, MATERIALS.titanForge)
  foot.position.set(x * 0.2, -2.25, z * 0.2)
  leg.add(foot)

  return leg
}

export function createQuadrupedalLegs(): THREE.Group {
  const group = new THREE.Group()

  // Four articulated legs as separate animatable groups
  group.add(createQuadLeg(-1, -1))
  group.add(createQuadLeg(-1, 1))
  group.add(createQuadLeg(1, -1))
  group.add(createQuadLeg(1, 1))

  // Central body frame / spine
  const frameGeom = new THREE.BoxGeometry(1.6, 0.35, 1.6)
  const frame = new THREE.Mesh(frameGeom, MATERIALS.titanForge)
  frame.position.set(0, 2.45, 0)
  group.add(frame)

  // Spine ridge
  const spineGeom = new THREE.BoxGeometry(0.3, 0.2, 1.4)
  const spine = new THREE.Mesh(spineGeom, MATERIALS.titanForge)
  spine.position.set(0, 2.7, 0)
  group.add(spine)

  return group
}
