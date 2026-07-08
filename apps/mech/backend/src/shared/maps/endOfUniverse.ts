/**
 * End of Universe - Two black holes tear the cosmos apart while mechs battle
 * on a mirrored obsidian floor reflecting the dying stars above.
 */
import type { MapDefinition } from '../types/MapDefinition';

export const endOfUniverse: MapDefinition = {
  id: 'end_of_universe',
  name: 'End of Universe',
  arena: {
    width: 320,
    depth: 320,
    floorY: 0,
    ceilingY: 120,
  },
  spawnPoints: [
    { position: [0, 0, 110], facingAngle: Math.PI, playerSlot: 0 },
    { position: [0, 0, -110], facingAngle: 0, playerSlot: 1 },
  ],
  staticGeometry: [
    // === Central obelisk cluster - collapsed remnants ===
    {
      id: 'obelisk_c', type: 'cylinder', position: [0, 20, 0],
      radiusTop: 1.5, radiusBottom: 3, height: 40, segments: 6,
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#0a0a12', roughness: 0.1, metalness: 0.95, edgeColor: '#ff6600' },
    },
    {
      id: 'obelisk_c_top', type: 'cylinder', position: [0, 42, 0],
      radiusTop: 0.1, radiusBottom: 1.5, height: 4, segments: 6,
      collision: false, castShadow: false, receiveShadow: false,
      material: { color: '#ff4400', roughness: 0.0, metalness: 1.0, emissive: '#ff2200', emissiveIntensity: 2.0 },
    },

    // === West side debris - crushed architecture ===
    {
      id: 'w_slab1', type: 'box', position: [-70, 4, -20], size: [18, 8, 12],
      rotation: [0, 0.3, 0],
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#0d0d18', roughness: 0.2, metalness: 0.8, edgeColor: '#4400ff' },
    },
    {
      id: 'w_slab2', type: 'box', position: [-90, 6, 30], size: [14, 12, 10],
      rotation: [0, -0.2, 0.05],
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#0d0d18', roughness: 0.2, metalness: 0.8, edgeColor: '#4400ff' },
    },
    {
      id: 'w_pillar1', type: 'cylinder', position: [-55, 8, 60],
      radiusTop: 2, radiusBottom: 3.5, height: 16, segments: 8,
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#0a0a14', roughness: 0.15, metalness: 0.9, edgeColor: '#440088' },
    },
    {
      id: 'w_pillar2', type: 'cylinder', position: [-110, 5, -60],
      radiusTop: 1, radiusBottom: 4, height: 10, segments: 8,
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#0a0a14', roughness: 0.15, metalness: 0.9, edgeColor: '#440088' },
    },

    // === East side debris ===
    {
      id: 'e_slab1', type: 'box', position: [70, 5, 20], size: [16, 10, 14],
      rotation: [0, -0.25, 0],
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#0d0d18', roughness: 0.2, metalness: 0.8, edgeColor: '#4400ff' },
    },
    {
      id: 'e_slab2', type: 'box', position: [95, 7, -35], size: [12, 14, 10],
      rotation: [0, 0.15, -0.03],
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#0d0d18', roughness: 0.2, metalness: 0.8, edgeColor: '#4400ff' },
    },
    {
      id: 'e_pillar1', type: 'cylinder', position: [55, 7, -65],
      radiusTop: 2.5, radiusBottom: 3, height: 14, segments: 8,
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#0a0a14', roughness: 0.15, metalness: 0.9, edgeColor: '#440088' },
    },
    {
      id: 'e_pillar2', type: 'cylinder', position: [115, 4, 55],
      radiusTop: 1.5, radiusBottom: 3.5, height: 8, segments: 8,
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#0a0a14', roughness: 0.15, metalness: 0.9, edgeColor: '#440088' },
    },

    // === Scattered cover rocks / compressed matter ===
    {
      id: 'rock_nw', type: 'box', position: [-45, 3, -80], size: [10, 6, 8],
      rotation: [0.1, 0.4, 0],
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#080810', roughness: 0.5, metalness: 0.6, edgeColor: '#220044' },
    },
    {
      id: 'rock_ne', type: 'box', position: [50, 2.5, -90], size: [9, 5, 9],
      rotation: [0, 0.6, 0],
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#080810', roughness: 0.5, metalness: 0.6, edgeColor: '#220044' },
    },
    {
      id: 'rock_sw', type: 'box', position: [-40, 3, 85], size: [11, 6, 7],
      rotation: [0, -0.3, 0],
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#080810', roughness: 0.5, metalness: 0.6, edgeColor: '#220044' },
    },
    {
      id: 'rock_se', type: 'box', position: [45, 2.5, 88], size: [8, 5, 10],
      rotation: [0.05, 0.5, 0],
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#080810', roughness: 0.5, metalness: 0.6, edgeColor: '#220044' },
    },
    {
      id: 'rock_mid_w', type: 'box', position: [-28, 2, -35], size: [7, 4, 7],
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#080810', roughness: 0.5, metalness: 0.6, edgeColor: '#220044' },
    },
    {
      id: 'rock_mid_e', type: 'box', position: [28, 2, 35], size: [7, 4, 7],
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#080810', roughness: 0.5, metalness: 0.6, edgeColor: '#220044' },
    },

    // === Glowing accretion matter on the ground (decorative, no collision) ===
    {
      id: 'glow_ring1', type: 'cylinder', position: [0, 0.1, 0],
      radiusTop: 25, radiusBottom: 25, height: 0.2, segments: 64,
      collision: false, castShadow: false, receiveShadow: false,
      material: { color: '#ff4400', roughness: 1.0, metalness: 0.0, emissive: '#ff2200', emissiveIntensity: 0.5, transparent: true, opacity: 0.25 },
    },
    {
      id: 'glow_ring2', type: 'cylinder', position: [0, 0.1, 0],
      radiusTop: 60, radiusBottom: 60, height: 0.2, segments: 64,
      collision: false, castShadow: false, receiveShadow: false,
      material: { color: '#660022', roughness: 1.0, metalness: 0.0, emissive: '#440011', emissiveIntensity: 0.3, transparent: true, opacity: 0.15 },
    },
  ],
  dynamicElements: [
    // Slowly rotating crushed matter disk - draws toward the black holes
    {
      id: 'debris_orbit1',
      type: 'rotating',
      position: [35, 2, 35],
      shape: 'box',
      size: [8, 2, 3],
      rotationAxis: 'y',
      rotationSpeed: 0.4,
      contactDamage: 5,
      material: { color: '#1a0a00', roughness: 0.3, metalness: 0.9, edgeColor: '#ff4400' },
    },
    {
      id: 'debris_orbit2',
      type: 'rotating',
      position: [-35, 2, -35],
      shape: 'box',
      size: [6, 2, 4],
      rotationAxis: 'y',
      rotationSpeed: -0.35,
      contactDamage: 5,
      material: { color: '#1a0a00', roughness: 0.3, metalness: 0.9, edgeColor: '#ff4400' },
    },
    {
      id: 'debris_orbit3',
      type: 'rotating',
      position: [0, 3, 0],
      shape: 'cylinder',
      size: [1.5, 4, 1.5],
      rotationAxis: 'y',
      rotationSpeed: 0.9,
      contactDamage: 3,
      material: { color: '#200a00', roughness: 0.2, metalness: 1.0, edgeColor: '#ff6600' },
    },
  ],
  hazardZones: [
    // Tidal force zone near center - gravitational crushing
    {
      id: 'tidal_center',
      shape: 'cylinder',
      position: [0, 0, 0],
      radius: 12,
      height: 30,
      damage: 8,
      period: 5,
      activeDuration: 1.5,
      warningDuration: 2.0,
      damageType: 'crushing',
    },
    // North gravitational pull zone (toward BH1 / +Z)
    {
      id: 'tidal_north',
      shape: 'box',
      position: [0, 5, 130],
      size: [80, 10, 20],
      damage: 12,
      period: 8,
      activeDuration: 2.0,
      warningDuration: 2.5,
      damageType: 'crushing',
    },
    // South gravitational pull zone (toward BH2 / -Z)
    {
      id: 'tidal_south',
      shape: 'box',
      position: [0, 5, -130],
      size: [80, 10, 20],
      damage: 12,
      period: 8,
      activeDuration: 2.0,
      warningDuration: 2.5,
      damageType: 'crushing',
    },
  ],
  environment: {
    skyType: 'end_of_universe',
    ambientLightColor: '#110508',
    ambientLightIntensity: 0.15,
    lights: [
      // Dim reddish light from "BH1" direction (+Z)
      {
        type: 'point',
        color: '#ff3300',
        intensity: 80,
        position: [0, 30, 160],
        distance: 350,
        decay: 2,
      },
      // Dim reddish light from "BH2" direction (-Z)
      {
        type: 'point',
        color: '#cc2200',
        intensity: 80,
        position: [0, 30, -160],
        distance: 350,
        decay: 2,
      },
      // Faint purple point at the central obelisk
      {
        type: 'point',
        color: '#8800ff',
        intensity: 40,
        position: [0, 45, 0],
        distance: 120,
        decay: 2,
      },
      // Very dim directional fill
      {
        type: 'directional',
        color: '#220011',
        intensity: 0.3,
        position: [0, 100, 0],
        castShadow: true,
      },
    ],
    floorMaterial: { color: '#050508', roughness: 0.0, metalness: 1.0 },
    reflectiveFloor: true,
    fog: { color: '#080008', near: 180, far: 420 },
    showGrid: false,
    showBoundaryWalls: false,
  },
};
