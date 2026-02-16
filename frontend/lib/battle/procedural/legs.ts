/**
 * Procedural Leg Part Models
 * Max dimensions: 2.0 x 2.0 x 2.0 units
 */

import * as THREE from 'three'
import { MATERIALS, createEnergyMaterial } from './materials'

export function createBipedalLegs(): THREE.Group {
  const group = new THREE.Group()

  // Two detailed legs
  for (let side of [-1, 1]) {
    // Hip joint (ball joint)
    const hipJointGeom = new THREE.SphereGeometry(0.18, 12, 12)
    const hipJoint = new THREE.Mesh(hipJointGeom, new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.9,
      roughness: 0.2,
    }))
    hipJoint.position.set(side * 0.7, 1.7, 0)
    group.add(hipJoint)

    // Upper leg armor plates
    const upperOuterGeom = new THREE.BoxGeometry(0.35, 0.8, 0.35)
    const upperOuter = new THREE.Mesh(upperOuterGeom, MATERIALS.genMech)
    upperOuter.position.set(side * 0.7, 1.25, 0.1)
    group.add(upperOuter)

    // Upper leg inner mechanism
    const upperInnerGeom = new THREE.CylinderGeometry(0.15, 0.18, 0.7, 8)
    const upperInner = new THREE.Mesh(upperInnerGeom, new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.7,
      roughness: 0.4,
    }))
    upperInner.position.set(side * 0.7, 1.2, -0.05)
    group.add(upperInner)

    // Hydraulic pistons (front and back)
    for (let pos of [0.15, -0.15]) {
      const pistonGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.75, 6)
      const piston = new THREE.Mesh(pistonGeom, new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.9,
        roughness: 0.1,
      }))
      piston.position.set(side * 0.7, 1.22, pos)
      group.add(piston)
    }

    // Knee joint (detailed)
    const kneeGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.25, 12)
    const knee = new THREE.Mesh(kneeGeom, new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.9,
      roughness: 0.2,
    }))
    knee.rotation.z = Math.PI / 2
    knee.position.set(side * 0.7, 0.8, 0)
    group.add(knee)

    // Knee cap armor
    const kneeCapGeom = new THREE.BoxGeometry(0.2, 0.2, 0.25)
    const kneeCap = new THREE.Mesh(kneeCapGeom, MATERIALS.genMech)
    kneeCap.position.set(side * 0.7, 0.8, 0.2)
    group.add(kneeCap)

    // Lower leg armor (angled)
    const lowerGeom = new THREE.BoxGeometry(0.3, 0.7, 0.32)
    const lower = new THREE.Mesh(lowerGeom, MATERIALS.genMech)
    lower.position.set(side * 0.7, 0.4, 0.08)
    lower.rotation.x = 0.1
    group.add(lower)

    // Lower leg actuator
    const actuatorGeom = new THREE.CylinderGeometry(0.12, 0.1, 0.65, 8)
    const actuator = new THREE.Mesh(actuatorGeom, new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.7,
    }))
    actuator.position.set(side * 0.7, 0.38, -0.08)
    group.add(actuator)

    // Ankle joint
    const ankleGeom = new THREE.SphereGeometry(0.12, 8, 8)
    const ankle = new THREE.Mesh(ankleGeom, new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.9,
    }))
    ankle.position.set(side * 0.7, 0.05, 0.05)
    group.add(ankle)

    // Foot (detailed with toe)
    const footGeom = new THREE.BoxGeometry(0.45, 0.12, 0.7)
    const foot = new THREE.Mesh(footGeom, MATERIALS.genMech)
    foot.position.set(side * 0.7, -0.02, 0.15)
    group.add(foot)

    // Foot toe section (articulated)
    const toeGeom = new THREE.BoxGeometry(0.4, 0.1, 0.2)
    const toe = new THREE.Mesh(toeGeom, MATERIALS.genMech)
    toe.position.set(side * 0.7, -0.03, 0.5)
    group.add(toe)

    // Heel
    const heelGeom = new THREE.BoxGeometry(0.35, 0.1, 0.15)
    const heel = new THREE.Mesh(heelGeom, MATERIALS.genMech)
    heel.position.set(side * 0.7, -0.03, -0.18)
    group.add(heel)
  }

  // Hip assembly (detailed)
  const hipGeom = new THREE.BoxGeometry(1.8, 0.35, 0.7)
  const hip = new THREE.Mesh(hipGeom, MATERIALS.genMech)
  hip.position.set(0, 1.75, 0)
  group.add(hip)

  // Hip armor plates
  for (let side of [-1, 1]) {
    const plateGeom = new THREE.BoxGeometry(0.35, 0.45, 0.55)
    const plate = new THREE.Mesh(plateGeom, MATERIALS.genMech)
    plate.position.set(side * 0.95, 1.65, 0)
    group.add(plate)
  }

  // Central pelvis detail
  const pelvisGeom = new THREE.BoxGeometry(0.8, 0.4, 0.5)
  const pelvis = new THREE.Mesh(pelvisGeom, new THREE.MeshStandardMaterial({
    color: 0x444444,
    metalness: 0.8,
  }))
  pelvis.position.set(0, 1.55, 0)
  group.add(pelvis)

  return group
}

export function createTrackedLegs(): THREE.Group {
  const group = new THREE.Group()

  // Two track assemblies
  for (let side of [-1, 1]) {
    // Track housing
    const trackGeom = new THREE.BoxGeometry(0.6, 1.2, 1.8)
    const track = new THREE.Mesh(trackGeom, MATERIALS.armorWorks)
    track.position.set(side * 1.0, 0.6, 0)
    group.add(track)

    // Road wheels
    for (let i = 0; i < 4; i++) {
      const wheelGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.1, 12)
      const wheel = new THREE.Mesh(wheelGeom, new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.9,
      }))
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(side * 1.0, 0.4, (i - 1.5) * 0.45)
      group.add(wheel)
    }

    // Drive sprocket
    const sprocketGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 8)
    const sprocket = new THREE.Mesh(sprocketGeom, MATERIALS.armorWorks)
    sprocket.rotation.z = Math.PI / 2
    sprocket.position.set(side * 1.0, 1.0, -0.8)
    group.add(sprocket)
  }

  // Body platform
  const platformGeom = new THREE.BoxGeometry(2.6, 0.4, 2.0)
  const platform = new THREE.Mesh(platformGeom, MATERIALS.armorWorks)
  platform.position.set(0, 1.4, 0)
  group.add(platform)

  return group
}

export function createHoverLegs(): THREE.Group {
  const group = new THREE.Group()

  // Central hover pod
  const podGeom = new THREE.CylinderGeometry(0.6, 0.8, 0.5, 16)
  const pod = new THREE.Mesh(podGeom, MATERIALS.swiftDrive)
  pod.position.set(0, 0.5, 0)
  group.add(pod)

  // Hover thrusters (4 corners)
  for (let x of [-1, 1]) {
    for (let z of [-1, 1]) {
      const thrusterGeom = new THREE.CylinderGeometry(0.25, 0.35, 0.4, 12)
      const thruster = new THREE.Mesh(thrusterGeom, MATERIALS.swiftDrive)
      thruster.position.set(x * 0.8, 0.2, z * 0.8)
      group.add(thruster)

      // Thrust glow
      const glowGeom = new THREE.ConeGeometry(0.2, 0.3, 8)
      const glow = new THREE.Mesh(glowGeom, createEnergyMaterial(0x00aaff))
      glow.rotation.x = Math.PI
      glow.position.set(x * 0.8, 0, z * 0.8)
      group.add(glow)
    }
  }

  // Stabilizers
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2
    const stabGeom = new THREE.BoxGeometry(0.1, 0.1, 0.8)
    const stab = new THREE.Mesh(stabGeom, MATERIALS.swiftDrive)
    stab.position.set(
      Math.cos(angle) * 1.2,
      0.8,
      Math.sin(angle) * 1.2
    )
    stab.rotation.y = angle
    group.add(stab)
  }

  return group
}

export function createQuadrupedalLegs(): THREE.Group {
  const group = new THREE.Group()

  // Four legs
  for (let x of [-1, 1]) {
    for (let z of [-1, 1]) {
      // Upper leg
      const upperGeom = new THREE.CapsuleGeometry(0.2, 0.5, 8, 12)
      const upper = new THREE.Mesh(upperGeom, MATERIALS.titanForge)
      upper.position.set(x * 0.8, 1.0, z * 0.8)
      group.add(upper)

      // Lower leg
      const lowerGeom = new THREE.CapsuleGeometry(0.15, 0.4, 8, 12)
      const lower = new THREE.Mesh(lowerGeom, MATERIALS.titanForge)
      lower.position.set(x * 0.8, 0.3, z * 0.8)
      group.add(lower)

      // Foot
      const footGeom = new THREE.BoxGeometry(0.3, 0.1, 0.4)
      const foot = new THREE.Mesh(footGeom, MATERIALS.titanForge)
      foot.position.set(x * 0.8, 0, z * 0.8)
      group.add(foot)

      // Knee
      const kneeGeom = new THREE.SphereGeometry(0.12, 8, 8)
      const knee = new THREE.Mesh(kneeGeom, new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.8,
      }))
      knee.position.set(x * 0.8, 0.6, z * 0.8)
      group.add(knee)
    }
  }

  // Central body frame
  const frameGeom = new THREE.BoxGeometry(2.0, 0.3, 2.0)
  const frame = new THREE.Mesh(frameGeom, MATERIALS.titanForge)
  frame.position.set(0, 1.3, 0)
  group.add(frame)

  return group
}
