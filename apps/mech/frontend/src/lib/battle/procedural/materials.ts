import * as THREE from 'three'

/**
 * Material presets for different manufacturers
 */
export const MATERIALS = {
  // ArmsCore - Military industrial look
  armsCore: new THREE.MeshStandardMaterial({
    color: 0x4a4a4a,
    metalness: 0.7,
    roughness: 0.4,
  }),

  // VoltTech - High-tech energy company
  voltTech: new THREE.MeshStandardMaterial({
    color: 0x3366cc,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x1144aa,
    emissiveIntensity: 0.3,
  }),

  // TitanForge - Heavy industrial
  titanForge: new THREE.MeshStandardMaterial({
    color: 0x5a4a3a,
    metalness: 0.6,
    roughness: 0.6,
  }),

  // InfernoTech - Fire/heat themed
  infernoTech: new THREE.MeshStandardMaterial({
    color: 0x8b2500,
    metalness: 0.5,
    roughness: 0.3,
    emissive: 0xff4400,
    emissiveIntensity: 0.4,
  }),

  // PowerGen - Standard power systems
  powerGen: new THREE.MeshStandardMaterial({
    color: 0x556b2f,
    metalness: 0.5,
    roughness: 0.5,
  }),

  // SwiftDrive - Fast, lightweight
  swiftDrive: new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    metalness: 0.9,
    roughness: 0.1,
  }),

  // GenMech - General purpose
  genMech: new THREE.MeshStandardMaterial({
    color: 0x696969,
    metalness: 0.5,
    roughness: 0.5,
  }),

  // ArmorWorks - Heavy armor specialist
  armorWorks: new THREE.MeshStandardMaterial({
    color: 0x2f4f4f,
    metalness: 0.7,
    roughness: 0.4,
  }),

  // TacticalSys - Tactical equipment
  tacticalSys: new THREE.MeshStandardMaterial({
    color: 0x556b2f,
    metalness: 0.4,
    roughness: 0.6,
  }),
}

/**
 * Energy glow material for weapon effects
 */
export const createEnergyMaterial = (color: number): THREE.MeshStandardMaterial => {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.2,
    roughness: 0.1,
    emissive: color,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.9,
  })
}
