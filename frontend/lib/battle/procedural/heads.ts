/**
 * Procedural Head Part Models
 * Max dimensions: 1.5 x 1.5 x 1.5 units
 */

import * as THREE from 'three'
import { MATERIALS, createEnergyMaterial } from './materials'

export function createStandardOptics(): THREE.Group {
  const group = new THREE.Group()

  // Neck base
  const neckGeom = new THREE.CylinderGeometry(0.25, 0.3, 0.3, 8)
  const neck = new THREE.Mesh(neckGeom, new THREE.MeshStandardMaterial({
    color: 0x555555,
    metalness: 0.8,
  }))
  neck.position.set(0, 0.15, 0)
  group.add(neck)

  // Main head structure
  const headGeom = new THREE.BoxGeometry(0.95, 0.75, 0.9)
  const head = new THREE.Mesh(headGeom, MATERIALS.genMech)
  head.position.set(0, 0.55, 0)
  group.add(head)

  // Forehead armor plate
  const foreheadGeom = new THREE.BoxGeometry(0.9, 0.25, 0.3)
  const forehead = new THREE.Mesh(foreheadGeom, MATERIALS.genMech)
  forehead.position.set(0, 0.85, 0.35)
  forehead.rotation.x = -0.3
  group.add(forehead)

  // Central visor (angled, glowing)
  const visorGeom = new THREE.BoxGeometry(0.75, 0.22, 0.12)
  const visorMat = new THREE.MeshStandardMaterial({
    color: 0x004444,
    metalness: 0.3,
    roughness: 0.1,
    transparent: true,
    opacity: 0.8,
    emissive: 0x003333,
    emissiveIntensity: 0.5,
  })
  const visor = new THREE.Mesh(visorGeom, visorMat)
  visor.position.set(0, 0.55, 0.5)
  visor.rotation.x = 0.15
  group.add(visor)

  // Visor frame
  const frameGeom = new THREE.BoxGeometry(0.85, 0.28, 0.08)
  const frame = new THREE.Mesh(frameGeom, new THREE.MeshStandardMaterial({
    color: 0x444444,
    metalness: 0.9,
  }))
  frame.position.set(0, 0.55, 0.52)
  frame.rotation.x = 0.15
  group.add(frame)

  // Eye sensors (twin optics)
  for (let side of [-1, 1]) {
    const eyeGeom = new THREE.SphereGeometry(0.08, 8, 8)
    const eye = new THREE.Mesh(eyeGeom, createEnergyMaterial(0x00ffff))
    eye.position.set(side * 0.25, 0.55, 0.52)
    group.add(eye)
  }

  // Side sensor pods
  for (let side of [-1, 1]) {
    const podGeom = new THREE.BoxGeometry(0.15, 0.35, 0.5)
    const pod = new THREE.Mesh(podGeom, MATERIALS.genMech)
    pod.position.set(side * 0.55, 0.55, 0)
    group.add(pod)

    // Side sensor lens
    const lensGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.05, 8)
    const lens = new THREE.Mesh(lensGeom, createEnergyMaterial(0x00ff00))
    lens.rotation.z = Math.PI / 2
    lens.position.set(side * 0.63, 0.55, 0)
    group.add(lens)
  }

  // Antenna array (back)
  const antGeom = new THREE.CylinderGeometry(0.025, 0.02, 0.5, 6)
  const antenna = new THREE.Mesh(antGeom, new THREE.MeshStandardMaterial({
    color: 0x666666,
    metalness: 0.8,
  }))
  antenna.position.set(0.15, 1.0, -0.2)
  group.add(antenna)

  // Chin detail
  const chinGeom = new THREE.BoxGeometry(0.6, 0.15, 0.4)
  const chin = new THREE.Mesh(chinGeom, MATERIALS.genMech)
  chin.position.set(0, 0.25, 0.25)
  group.add(chin)

  return group
}

export function createTargetingArray(): THREE.Group {
  const group = new THREE.Group()

  // Neck base
  const neckGeom = new THREE.CylinderGeometry(0.25, 0.3, 0.3, 8)
  const neck = new THREE.Mesh(neckGeom, new THREE.MeshStandardMaterial({
    color: 0x555555,
    metalness: 0.8,
  }))
  neck.position.set(0, 0.15, 0)
  group.add(neck)

  // Main head housing (angular)
  const headGeom = new THREE.BoxGeometry(1.0, 0.7, 0.85)
  const head = new THREE.Mesh(headGeom, MATERIALS.voltTech)
  head.position.set(0, 0.55, 0)
  group.add(head)

  // Central sensor dome
  const domeGeom = new THREE.SphereGeometry(0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2)
  const dome = new THREE.Mesh(domeGeom, MATERIALS.voltTech)
  dome.position.set(0, 0.9, 0.1)
  group.add(dome)

  // Main targeting array (front-mounted dish)
  const dishGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16)
  const dish = new THREE.Mesh(dishGeom, createEnergyMaterial(0x00aaff))
  dish.position.set(0, 0.55, 0.55)
  dish.rotation.x = Math.PI / 2
  group.add(dish)

  // Dish frame
  const dframeGeom = new THREE.TorusGeometry(0.38, 0.03, 8, 16)
  const dframe = new THREE.Mesh(dframeGeom, MATERIALS.voltTech)
  dframe.position.set(0, 0.55, 0.55)
  group.add(dframe)

  // Side sensor pods (detailed)
  for (let side of [-1, 1]) {
    const podGeom = new THREE.BoxGeometry(0.25, 0.5, 0.6)
    const pod = new THREE.Mesh(podGeom, MATERIALS.voltTech)
    pod.position.set(side * 0.65, 0.55, 0.05)
    group.add(pod)

    // Sensor lens array (3 lenses)
    for (let i = 0; i < 3; i++) {
      const lensGeom = new THREE.SphereGeometry(0.05, 8, 8)
      const lens = new THREE.Mesh(lensGeom, createEnergyMaterial(0x00ff00))
      lens.position.set(side * 0.78, 0.35 + i * 0.2, 0.2)
      group.add(lens)
    }

    // Side antenna
    const antGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6)
    const ant = new THREE.Mesh(antGeom, new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.8,
    }))
    ant.position.set(side * 0.75, 0.95, -0.1)
    ant.rotation.z = side * 0.3
    group.add(ant)
  }

  // Top sensor fin
  const finGeom = new THREE.BoxGeometry(0.08, 0.3, 0.5)
  const fin = new THREE.Mesh(finGeom, MATERIALS.voltTech)
  fin.position.set(0, 1.1, 0)
  group.add(fin)

  // Central processor unit (back of head)
  const procGeom = new THREE.BoxGeometry(0.7, 0.5, 0.35)
  const proc = new THREE.Mesh(procGeom, MATERIALS.voltTech)
  proc.position.set(0, 0.55, -0.45)
  group.add(proc)

  // Processor cooling vents
  for (let i = 0; i < 3; i++) {
    const ventGeom = new THREE.BoxGeometry(0.5, 0.08, 0.05)
    const vent = new THREE.Mesh(ventGeom, new THREE.MeshStandardMaterial({
      color: 0x222222,
    }))
    vent.position.set(0, 0.35 + i * 0.2, -0.6)
    group.add(vent)
  }

  // Status lights
  for (let i = 0; i < 2; i++) {
    const lightGeom = new THREE.SphereGeometry(0.04, 8, 8)
    const light = new THREE.Mesh(lightGeom, createEnergyMaterial(0x00ff00))
    light.position.set(-0.3 + i * 0.6, 0.8, 0.55)
    group.add(light)
  }

  return group
}

export function createReinforcedPod(): THREE.Group {
  const group = new THREE.Group()

  // Heavy armor shell
  const shellGeom = new THREE.BoxGeometry(1.2, 1.0, 1.0)
  const shell = new THREE.Mesh(shellGeom, MATERIALS.armorWorks)
  shell.position.set(0, 0.5, 0)
  group.add(shell)

  // Armor plating (slanted)
  const plateGeom = new THREE.BoxGeometry(1.1, 0.3, 0.8)
  const plate = new THREE.Mesh(plateGeom, MATERIALS.armorWorks)
  plate.position.set(0, 0.85, 0.15)
  plate.rotation.x = -Math.PI / 8
  group.add(plate)

  // Reinforced visor slit
  const slitGeom = new THREE.BoxGeometry(0.7, 0.08, 0.15)
  const slit = new THREE.Mesh(slitGeom, new THREE.MeshStandardMaterial({
    color: 0x003333,
    metalness: 0.3,
    transparent: true,
    opacity: 0.8,
  }))
  slit.position.set(0, 0.5, 0.55)
  group.add(slit)

  // Armor rivets
  for (let x of [-0.4, 0, 0.4]) {
    for (let y of [0.3, 0.7]) {
      const rivetGeom = new THREE.SphereGeometry(0.04, 6, 6)
      const rivet = new THREE.Mesh(rivetGeom, new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.9,
      }))
      rivet.position.set(x, y, 0.55)
      group.add(rivet)
    }
  }

  return group
}

export function createScoutSuite(): THREE.Group {
  const group = new THREE.Group()

  // Lightweight frame
  const frameGeom = new THREE.BoxGeometry(0.6, 0.4, 0.5)
  const frame = new THREE.Mesh(frameGeom, MATERIALS.swiftDrive)
  frame.position.set(0, 0.2, 0)
  group.add(frame)

  // Long-range sensor array (dish)
  const dishGeom = new THREE.ConeGeometry(0.5, 0.4, 12, 1, true)
  const dish = new THREE.Mesh(dishGeom, MATERIALS.swiftDrive)
  dish.rotation.x = Math.PI / 2
  dish.position.set(0, 0.4, 0.4)
  group.add(dish)

  // Multi-spectrum cameras
  for (let i = 0; i < 3; i++) {
    const camGeom = new THREE.CylinderGeometry(0.08, 0.06, 0.2, 8)
    const cam = new THREE.Mesh(camGeom, MATERIALS.swiftDrive)
    cam.rotation.x = Math.PI / 2
    cam.position.set((i - 1) * 0.2, 0.3, 0.6)
    group.add(cam)

    // Lens
    const lensGeom = new THREE.SphereGeometry(0.05, 8, 8)
    const lens = new THREE.Mesh(lensGeom, createEnergyMaterial(0xff0000))
    lens.position.set((i - 1) * 0.2, 0.3, 0.72)
    group.add(lens)
  }

  // Communication antennas (2)
  for (let side of [-1, 1]) {
    const antGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.6, 6)
    const ant = new THREE.Mesh(antGeom, new THREE.MeshStandardMaterial({
      color: 0x888888,
    }))
    ant.position.set(side * 0.25, 0.7, 0)
    group.add(ant)
  }

  return group
}
