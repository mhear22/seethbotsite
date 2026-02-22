/**
 * Procedural Rack Part Models
 * Max dimensions: 1.0 x 1.0 x 0.5 units
 */

import * as THREE from 'three'
import { MATERIALS, createEnergyMaterial } from './materials'

export function createSmokeLauncher(): THREE.Group {
  const group = new THREE.Group()

  // Launcher tubes (3 tubes)
  for (let i = 0; i < 3; i++) {
    const tubeGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8)
    const tube = new THREE.Mesh(tubeGeom, MATERIALS.tacticalSys)
    tube.rotation.x = Math.PI / 2
    tube.position.set((i - 1) * 0.25, 0, 0)
    group.add(tube)
  }

  // Housing
  const housingGeom = new THREE.BoxGeometry(0.9, 0.25, 0.3)
  const housing = new THREE.Mesh(housingGeom, MATERIALS.tacticalSys)
  housing.position.set(0, 0, -0.15)
  group.add(housing)

  return group
}

export function createAmmoFeed(): THREE.Group {
  const group = new THREE.Group()

  // Ammo canister
  const canGeom = new THREE.BoxGeometry(0.6, 0.8, 0.35)
  const can = new THREE.Mesh(canGeom, MATERIALS.armsCore)
  can.position.set(0, 0.4, 0)
  group.add(can)

  // Feed chute
  const chuteGeom = new THREE.CylinderGeometry(0.08, 0.1, 0.5, 8)
  const chute = new THREE.Mesh(chuteGeom, MATERIALS.armsCore)
  chute.position.set(0.3, 0.6, 0.1)
  chute.rotation.z = Math.PI / 4
  group.add(chute)

  // Ammo indicator
  const indGeom = new THREE.BoxGeometry(0.1, 0.3, 0.05)
  const ind = new THREE.Mesh(indGeom, createEnergyMaterial(0x00ff00))
  ind.position.set(0.35, 0.5, 0.18)
  group.add(ind)

  return group
}

export function createJumpJets(): THREE.Group {
  const group = new THREE.Group()

  // Jet pods (2)
  for (let side of [-1, 1]) {
    const podGeom = new THREE.CylinderGeometry(0.2, 0.25, 0.6, 8)
    const pod = new THREE.Mesh(podGeom, MATERIALS.swiftDrive)
    pod.position.set(side * 0.35, 0.3, 0)
    group.add(pod)

    // Thrust nozzle
    const nozzleGeom = new THREE.ConeGeometry(0.15, 0.2, 8)
    const nozzle = new THREE.Mesh(nozzleGeom, createEnergyMaterial(0xff4400))
    nozzle.rotation.x = Math.PI
    nozzle.position.set(side * 0.35, -0.1, 0)
    group.add(nozzle)
  }

  // Fuel tank
  const tankGeom = new THREE.CapsuleGeometry(0.15, 0.5, 8, 12)
  const tank = new THREE.Mesh(tankGeom, MATERIALS.swiftDrive)
  tank.position.set(0, 0.35, 0)
  group.add(tank)

  return group
}

export function createRepairDrone(): THREE.Group {
  const group = new THREE.Group()

  // Drone bay housing
  const bayGeom = new THREE.BoxGeometry(0.7, 0.3, 0.4)
  const bay = new THREE.Mesh(bayGeom, MATERIALS.genMech)
  bay.position.set(0, 0.15, 0)
  group.add(bay)

  // Drone (sitting in bay)
  const droneGeom = new THREE.BoxGeometry(0.3, 0.15, 0.3)
  const drone = new THREE.Mesh(droneGeom, MATERIALS.genMech)
  drone.position.set(0, 0.38, 0)
  group.add(drone)

  // Repair arms
  for (let side of [-1, 1]) {
    const armGeom = new THREE.BoxGeometry(0.08, 0.3, 0.05)
    const arm = new THREE.Mesh(armGeom, new THREE.MeshStandardMaterial({
      color: 0x888888,
    }))
    arm.position.set(side * 0.22, 0.35, 0.15)
    arm.rotation.x = Math.PI / 4
    group.add(arm)
  }

  // Status light
  const lightGeom = new THREE.SphereGeometry(0.04, 8, 8)
  const light = new THREE.Mesh(lightGeom, createEnergyMaterial(0x00ff00))
  light.position.set(0.3, 0.2, 0.21)
  group.add(light)

  return group
}
