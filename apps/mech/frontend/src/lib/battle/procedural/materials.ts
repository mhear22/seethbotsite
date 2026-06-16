import * as THREE from 'three'

/**
 * Material presets for different manufacturers.
 *
 * Recolored toward the shared "charcoal / steel / red / gold" art-bible palette
 * (see detailing.ts PALETTE). Every manufacturer now reads as a variant of the
 * same heroic real-robot family rather than wildly different color schemes:
 *  - Armor-y brands skew dark charcoal/gunmetal (matte-ish metal).
 *  - Frame/tech brands skew lighter steel grey (more metallic).
 *  - "Themed" brands keep a hint of their identity via emissive accents only.
 *
 * NOTE: keys are intentionally unchanged so existing part files keep working.
 */
export const MATERIALS = {
  // ArmsCore - Military industrial look -> dark charcoal armor
  armsCore: new THREE.MeshStandardMaterial({
    color: 0x2b2e33,
    metalness: 0.65,
    roughness: 0.55,
  }),

  // VoltTech - High-tech energy company -> steel frame with faint amber glow
  voltTech: new THREE.MeshStandardMaterial({
    color: 0x6f757e,
    metalness: 0.85,
    roughness: 0.3,
    emissive: 0x3a2a08,
    emissiveIntensity: 0.25,
  }),

  // TitanForge - Heavy industrial -> warm gunmetal charcoal
  titanForge: new THREE.MeshStandardMaterial({
    color: 0x34373d,
    metalness: 0.6,
    roughness: 0.6,
  }),

  // InfernoTech - Fire/heat themed -> charcoal armor with hot red emissive
  infernoTech: new THREE.MeshStandardMaterial({
    color: 0x3a2a28,
    metalness: 0.55,
    roughness: 0.4,
    emissive: 0xc2362f,
    emissiveIntensity: 0.45,
  }),

  // PowerGen - Standard power systems -> mid gunmetal
  powerGen: new THREE.MeshStandardMaterial({
    color: 0x3a3f47,
    metalness: 0.55,
    roughness: 0.5,
  }),

  // SwiftDrive - Fast, lightweight -> bright polished steel
  swiftDrive: new THREE.MeshStandardMaterial({
    color: 0x828892,
    metalness: 0.9,
    roughness: 0.18,
  }),

  // GenMech - General purpose -> neutral charcoal-steel
  genMech: new THREE.MeshStandardMaterial({
    color: 0x3a3f47,
    metalness: 0.55,
    roughness: 0.5,
  }),

  // ArmorWorks - Heavy armor specialist -> darkest charcoal plate
  armorWorks: new THREE.MeshStandardMaterial({
    color: 0x2b2e33,
    metalness: 0.7,
    roughness: 0.45,
  }),

  // TacticalSys - Tactical equipment -> matte gunmetal
  tacticalSys: new THREE.MeshStandardMaterial({
    color: 0x33373d,
    metalness: 0.45,
    roughness: 0.62,
  }),
}

/**
 * Energy glow material for weapon effects.
 *
 * Unchanged signature/behavior so existing call sites keep working. For the
 * art-bible amber sensor/eye glow, pass PALETTE.glowAmber (0xffc234).
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
