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
      material: { color: '#0a0a12', roughness: 0.1, metalness: 0.95, edgeColor: '#ff6600', emissive: '#220800', emissiveIntensity: 1.2 },
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
      material: { color: '#0d0d18', roughness: 0.2, metalness: 0.8, edgeColor: '#4400ff', emissive: '#110033', emissiveIntensity: 0.8 },
    },
    {
      id: 'w_slab2', type: 'box', position: [-90, 6, 30], size: [14, 12, 10],
      rotation: [0, -0.2, 0.05],
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#0d0d18', roughness: 0.2, metalness: 0.8, edgeColor: '#4400ff', emissive: '#0a001f', emissiveIntensity: 0.8 },
    },
    {
      id: 'w_pillar1', type: 'cylinder', position: [-55, 8, 60],
      radiusTop: 2, radiusBottom: 3.5, height: 16, segments: 8,
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#0a0a14', roughness: 0.15, metalness: 0.9, edgeColor: '#440088', emissive: '#1a0044', emissiveIntensity: 1.0 },
    },
    {
      id: 'w_pillar2', type: 'cylinder', position: [-110, 5, -60],
      radiusTop: 1, radiusBottom: 4, height: 10, segments: 8,
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#0a0a14', roughness: 0.15, metalness: 0.9, edgeColor: '#440088', emissive: '#120033', emissiveIntensity: 0.9 },
    },

    // === East side debris ===
    {
      id: 'e_slab1', type: 'box', position: [70, 5, 20], size: [16, 10, 14],
      rotation: [0, -0.25, 0],
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#0d0d18', roughness: 0.2, metalness: 0.8, edgeColor: '#4400ff', emissive: '#0d0033', emissiveIntensity: 0.8 },
    },
    {
      id: 'e_slab2', type: 'box', position: [95, 7, -35], size: [12, 14, 10],
      rotation: [0, 0.15, -0.03],
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#0d0d18', roughness: 0.2, metalness: 0.8, edgeColor: '#4400ff', emissive: '#110033', emissiveIntensity: 0.8 },
    },
    {
      id: 'e_pillar1', type: 'cylinder', position: [55, 7, -65],
      radiusTop: 2.5, radiusBottom: 3, height: 14, segments: 8,
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#0a0a14', roughness: 0.15, metalness: 0.9, edgeColor: '#440088', emissive: '#1a0044', emissiveIntensity: 1.0 },
    },
    {
      id: 'e_pillar2', type: 'cylinder', position: [115, 4, 55],
      radiusTop: 1.5, radiusBottom: 3.5, height: 8, segments: 8,
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#0a0a14', roughness: 0.15, metalness: 0.9, edgeColor: '#440088', emissive: '#150038', emissiveIntensity: 0.9 },
    },

    // === Scattered cover rocks / compressed matter ===
    {
      id: 'rock_nw', type: 'box', position: [-45, 3, -80], size: [10, 6, 8],
      rotation: [0.1, 0.4, 0],
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#080810', roughness: 0.5, metalness: 0.6, edgeColor: '#220044', emissive: '#1a0500', emissiveIntensity: 0.6 },
    },
    {
      id: 'rock_ne', type: 'box', position: [50, 2.5, -90], size: [9, 5, 9],
      rotation: [0, 0.6, 0],
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#080810', roughness: 0.5, metalness: 0.6, edgeColor: '#220044', emissive: '#1a0500', emissiveIntensity: 0.6 },
    },
    {
      id: 'rock_sw', type: 'box', position: [-40, 3, 85], size: [11, 6, 7],
      rotation: [0, -0.3, 0],
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#080810', roughness: 0.5, metalness: 0.6, edgeColor: '#220044', emissive: '#1a0500', emissiveIntensity: 0.6 },
    },
    {
      id: 'rock_se', type: 'box', position: [45, 2.5, 88], size: [8, 5, 10],
      rotation: [0.05, 0.5, 0],
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#080810', roughness: 0.5, metalness: 0.6, edgeColor: '#220044', emissive: '#1a0500', emissiveIntensity: 0.6 },
    },
    {
      id: 'rock_mid_w', type: 'box', position: [-28, 2, -35], size: [7, 4, 7],
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#080810', roughness: 0.5, metalness: 0.6, edgeColor: '#220044', emissive: '#1a0500', emissiveIntensity: 0.6 },
    },
    {
      id: 'rock_mid_e', type: 'box', position: [28, 2, 35], size: [7, 4, 7],
      collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#080810', roughness: 0.5, metalness: 0.6, edgeColor: '#220044', emissive: '#1a0500', emissiveIntensity: 0.6 },
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

    // === ENERGY VENT BEACONS — floating crystallized matter nodes that glow ===
    // Near west debris
    {
      id: 'vent_w1', type: 'cylinder', position: [-72, 12, -18], radiusTop: 1.0, radiusBottom: 1.5, height: 2.5, segments: 6,
      collision: false, castShadow: false, receiveShadow: false,
      material: { color: '#aa44ff', roughness: 0.0, metalness: 1.0, emissive: '#7700ff', emissiveIntensity: 5.0 },
    },
    {
      id: 'vent_w2', type: 'cylinder', position: [-55, 18, 60], radiusTop: 0.8, radiusBottom: 1.2, height: 2.0, segments: 6,
      collision: false, castShadow: false, receiveShadow: false,
      material: { color: '#ff6600', roughness: 0.0, metalness: 1.0, emissive: '#ff3300', emissiveIntensity: 5.0 },
    },
    // Near east debris
    {
      id: 'vent_e1', type: 'cylinder', position: [72, 14, 18], radiusTop: 1.0, radiusBottom: 1.5, height: 2.5, segments: 6,
      collision: false, castShadow: false, receiveShadow: false,
      material: { color: '#aa44ff', roughness: 0.0, metalness: 1.0, emissive: '#7700ff', emissiveIntensity: 5.0 },
    },
    {
      id: 'vent_e2', type: 'cylinder', position: [55, 16, -65], radiusTop: 0.8, radiusBottom: 1.2, height: 2.0, segments: 6,
      collision: false, castShadow: false, receiveShadow: false,
      material: { color: '#ff6600', roughness: 0.0, metalness: 1.0, emissive: '#ff3300', emissiveIntensity: 5.0 },
    },
    // Scattered mid-field vents (near cover rocks)
    {
      id: 'vent_nw', type: 'cylinder', position: [-43, 8, -78], radiusTop: 0.7, radiusBottom: 1.0, height: 1.8, segments: 6,
      collision: false, castShadow: false, receiveShadow: false,
      material: { color: '#ff4400', roughness: 0.0, metalness: 1.0, emissive: '#ff2200', emissiveIntensity: 6.0 },
    },
    {
      id: 'vent_se', type: 'cylinder', position: [44, 7, 86], radiusTop: 0.7, radiusBottom: 1.0, height: 1.8, segments: 6,
      collision: false, castShadow: false, receiveShadow: false,
      material: { color: '#ff4400', roughness: 0.0, metalness: 1.0, emissive: '#ff2200', emissiveIntensity: 6.0 },
    },
    // Obelisk crown flare (extra bright tip glow disc)
    {
      id: 'obelisk_flare', type: 'cylinder', position: [0, 44.5, 0], radiusTop: 3.0, radiusBottom: 3.0, height: 0.3, segments: 32,
      collision: false, castShadow: false, receiveShadow: false,
      material: { color: '#ff8800', roughness: 0.0, metalness: 1.0, emissive: '#ff5500', emissiveIntensity: 8.0, transparent: true, opacity: 0.85 },
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
    ambientLightColor: '#ffffff',
    ambientLightIntensity: 0.5,
    lights: [
      // Primary directional key light (matches training grounds intensity)
      {
        type: 'directional',
        color: '#ffffff',
        intensity: 0.8,
        position: [50, 80, 50],
        castShadow: true,
      },
      // Hemisphere fill — orange-tinted top (accretion glow), cool dark ground
      {
        type: 'hemisphere',
        color: '#ff8844',
        intensity: 0.5,
        groundColor: '#0a0010',
      },
      // Orange-red rim from BH1 direction (+Z)
      {
        type: 'point',
        color: '#ff4400',
        intensity: 120,
        position: [0, 25, 180],
        distance: 500,
        decay: 1.5,
      },
      // Orange-red rim from BH2 direction (-Z)
      {
        type: 'point',
        color: '#ff3300',
        intensity: 120,
        position: [0, 25, -180],
        distance: 500,
        decay: 1.5,
      },
      // Purple fill at the central obelisk
      {
        type: 'point',
        color: '#bb66ff',
        intensity: 60,
        position: [0, 30, 0],
        distance: 180,
        decay: 2,
      },
      // Energy vent fills — purple west, orange west2, purple east, orange east2
      { type: 'point', color: '#7700ff', intensity: 30, position: [-72, 12, -18], distance: 70, decay: 2 },
      { type: 'point', color: '#ff3300', intensity: 25, position: [-55, 18, 60], distance: 70, decay: 2 },
      { type: 'point', color: '#7700ff', intensity: 30, position: [72, 14, 18], distance: 70, decay: 2 },
      { type: 'point', color: '#ff3300', intensity: 25, position: [55, 16, -65], distance: 70, decay: 2 },
      // Cover rock vent fills
      { type: 'point', color: '#ff2200', intensity: 20, position: [-43, 8, -78], distance: 50, decay: 2 },
      { type: 'point', color: '#ff2200', intensity: 20, position: [44, 7, 86], distance: 50, decay: 2 },
      // Obelisk crown
      { type: 'point', color: '#ff5500', intensity: 50, position: [0, 44, 0], distance: 80, decay: 2 },
    ],
    floorMaterial: { color: '#090912', roughness: 0.0, metalness: 1.0 },
    reflectiveFloor: true,
    fog: { color: '#080008', near: 280, far: 600 },
    showGrid: false,
    showBoundaryWalls: false,
  },
};
