/**
 * Default Arena - preserves the original hardcoded 300x300 layout
 */
import type { MapDefinition } from '../types/MapDefinition';

export const defaultArena: MapDefinition = {
  id: 'default_arena',
  name: 'Training Grounds',
  arena: {
    width: 300,
    depth: 300,
    floorY: 0,
    ceilingY: 100,
  },
  spawnPoints: [
    { position: [0, 0, 100], facingAngle: Math.PI, playerSlot: 0 },
    { position: [0, 0, -100], facingAngle: 0, playerSlot: 1 },
  ],
  staticGeometry: [
    // Cluster 1: Northwest
    { id: 'nw1', type: 'box', position: [-80, 4, -80], size: [12, 8, 12], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },
    { id: 'nw2', type: 'box', position: [-65, 6, -95], size: [8, 12, 8], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },
    { id: 'nw3', type: 'box', position: [-100, 3, -70], size: [10, 6, 10], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },

    // Cluster 2: Northeast
    { id: 'ne1', type: 'box', position: [75, 5, -85], size: [15, 10, 15], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },
    { id: 'ne2', type: 'box', position: [90, 7, -70], size: [8, 14, 8], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },
    { id: 'ne3', type: 'box', position: [85, 3.5, -105], size: [10, 7, 10], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },

    // Cluster 3: Southwest
    { id: 'sw1', type: 'box', position: [-90, 4.5, 80], size: [10, 9, 10], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },
    { id: 'sw2', type: 'box', position: [-70, 5.5, 95], size: [12, 11, 12], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },
    { id: 'sw3', type: 'box', position: [-105, 3, 90], size: [8, 6, 8], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },

    // Cluster 4: Southeast
    { id: 'se1', type: 'box', position: [80, 4, 75], size: [14, 8, 14], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },
    { id: 'se2', type: 'box', position: [95, 6.5, 90], size: [9, 13, 9], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },
    { id: 'se3', type: 'box', position: [70, 3.5, 100], size: [11, 7, 11], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },

    // Mid-range buildings (ring around center)
    { id: 'mid_w', type: 'box', position: [-50, 5, 0], size: [8, 10, 8], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },
    { id: 'mid_e', type: 'box', position: [50, 5, 0], size: [8, 10, 8], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },
    { id: 'mid_n', type: 'box', position: [0, 5, -50], size: [8, 10, 8], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },
    { id: 'mid_s', type: 'box', position: [0, 5, 50], size: [8, 10, 8], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },

    // Corner pillars
    { id: 'cp_nw', type: 'box', position: [-120, 7.5, -120], size: [6, 15, 6], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },
    { id: 'cp_ne', type: 'box', position: [120, 7.5, -120], size: [6, 15, 6], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },
    { id: 'cp_sw', type: 'box', position: [-120, 7.5, 120], size: [6, 15, 6], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },
    { id: 'cp_se', type: 'box', position: [120, 7.5, 120], size: [6, 15, 6], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },

    // Scattered obstacles
    { id: 'obs1', type: 'box', position: [-30, 2.5, -70], size: [7, 5, 7], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },
    { id: 'obs2', type: 'box', position: [30, 2.5, 70], size: [7, 5, 7], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },
    { id: 'obs3', type: 'box', position: [-70, 2.5, 30], size: [7, 5, 7], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },
    { id: 'obs4', type: 'box', position: [70, 2.5, -30], size: [7, 5, 7], collision: true, castShadow: true, receiveShadow: true,
      material: { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' } },

    // === LAMP POSTS - corner pillars get a floodlight head ===
    // Corner lamp heads (emissive disc sitting atop each corner pillar)
    { id: 'lamp_nw', type: 'cylinder', position: [-120, 16.5, -120], radiusTop: 2.5, radiusBottom: 2.5, height: 1, segments: 16,
      collision: false, castShadow: false,
      material: { color: '#b0c8ff', roughness: 0.1, metalness: 0.6, emissive: '#88aaff', emissiveIntensity: 3.0 } },
    { id: 'lamp_ne', type: 'cylinder', position: [120, 16.5, -120], radiusTop: 2.5, radiusBottom: 2.5, height: 1, segments: 16,
      collision: false, castShadow: false,
      material: { color: '#b0c8ff', roughness: 0.1, metalness: 0.6, emissive: '#88aaff', emissiveIntensity: 3.0 } },
    { id: 'lamp_sw', type: 'cylinder', position: [-120, 16.5, 120], radiusTop: 2.5, radiusBottom: 2.5, height: 1, segments: 16,
      collision: false, castShadow: false,
      material: { color: '#b0c8ff', roughness: 0.1, metalness: 0.6, emissive: '#88aaff', emissiveIntensity: 3.0 } },
    { id: 'lamp_se', type: 'cylinder', position: [120, 16.5, 120], radiusTop: 2.5, radiusBottom: 2.5, height: 1, segments: 16,
      collision: false, castShadow: false,
      material: { color: '#b0c8ff', roughness: 0.1, metalness: 0.6, emissive: '#88aaff', emissiveIntensity: 3.0 } },

    // Mid-building beacon lights (small glowing box on top of each mid building)
    { id: 'beacon_mw', type: 'box', position: [-50, 11.5, 0], size: [2, 1.5, 2],
      collision: false, castShadow: false,
      material: { color: '#ffffff', roughness: 0.1, metalness: 0.5, emissive: '#aaccff', emissiveIntensity: 4.0 } },
    { id: 'beacon_me', type: 'box', position: [50, 11.5, 0], size: [2, 1.5, 2],
      collision: false, castShadow: false,
      material: { color: '#ffffff', roughness: 0.1, metalness: 0.5, emissive: '#aaccff', emissiveIntensity: 4.0 } },
    { id: 'beacon_mn', type: 'box', position: [0, 11.5, -50], size: [2, 1.5, 2],
      collision: false, castShadow: false,
      material: { color: '#ffffff', roughness: 0.1, metalness: 0.5, emissive: '#aaccff', emissiveIntensity: 4.0 } },
    { id: 'beacon_ms', type: 'box', position: [0, 11.5, 50], size: [2, 1.5, 2],
      collision: false, castShadow: false,
      material: { color: '#ffffff', roughness: 0.1, metalness: 0.5, emissive: '#aaccff', emissiveIntensity: 4.0 } },
  ],
  dynamicElements: [],
  hazardZones: [],
  environment: {
    skyType: 'procedural_stars',
    ambientLightColor: '#ffffff',
    ambientLightIntensity: 0.5,
    lights: [
      { type: 'directional', color: '#ffffff', intensity: 0.8, position: [50, 80, 50], castShadow: true },
      { type: 'hemisphere', color: '#87ceeb', intensity: 0.3, groundColor: '#2d3748' },
      // Two diagonal corner floods for a hint of blue rim on the cluster. Reduced
      // from 8 point lights to 2: the floor fills the screen and every real-time
      // point light shades every covered fragment, so 8 of them dominated the
      // frame. The lamp/beacon discs are emissive and stay visibly lit on their
      // own; only the soft additive wash on nearby faces is trimmed. Corner
      // intensity nudged up (2.5→3.0) to partly cover for the dropped fills.
      { type: 'point', color: '#88aaff', intensity: 3.0, position: [-120, 16, -120], distance: 90, decay: 2 },
      { type: 'point', color: '#88aaff', intensity: 3.0, position: [120, 16, 120], distance: 90, decay: 2 },
    ],
    floorMaterial: { color: '#2d3748', roughness: 0.8, metalness: 0.2 },
    showGrid: true,
    gridSize: 300,
    showBoundaryWalls: true,
  },
};
