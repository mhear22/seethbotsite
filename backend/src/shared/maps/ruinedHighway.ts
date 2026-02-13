/**
 * Ruined Highway - Elevated diagonal road with collapsed sections
 * Two-layer combat: highway level (Y=25) + ground level
 * No dynamic elements or hazards - simplest new map
 */
import type { MapDefinition } from '../types/MapDefinition';

const BUILDING_MAT = { color: '#3b4252', roughness: 0.9, metalness: 0.1, edgeColor: '#5e81ac' };
const HIGHWAY_MAT = { color: '#6b7280', roughness: 0.85, metalness: 0.05, edgeColor: '#d4a017' };
const PILLAR_MAT = { color: '#4b5563', roughness: 0.7, metalness: 0.3, edgeColor: '#6b7280' };
const RAMP_MAT = { color: '#5a6577', roughness: 0.8, metalness: 0.1, edgeColor: '#d4a017' };

export const ruinedHighway: MapDefinition = {
  id: 'ruined_highway',
  name: 'Ruined Highway',
  arena: { width: 300, depth: 300, floorY: 0, ceilingY: 100 },
  spawnPoints: [
    { position: [-100, 0, -100], facingAngle: Math.PI / 4, playerSlot: 0 },
    { position: [100, 25, 100], facingAngle: -Math.PI * 3 / 4, playerSlot: 1 },
  ],
  staticGeometry: [
    // === HIGHWAY SEGMENTS (diagonal from SW to NE at Y=25, rotated 45deg) ===
    // Segment 1: SW start
    { id: 'hw1', type: 'box', position: [-90, 25, -90], size: [18, 2, 50],
      rotation: [0, Math.PI / 4, 0], collision: true, castShadow: true, material: HIGHWAY_MAT },
    // Segment 2
    { id: 'hw2', type: 'box', position: [-45, 25, -45], size: [18, 2, 55],
      rotation: [0, Math.PI / 4, 0], collision: true, castShadow: true, material: HIGHWAY_MAT },
    // Gap (collapsed section) between segment 2 and 3
    // Segment 3
    { id: 'hw3', type: 'box', position: [15, 25, 15], size: [18, 2, 40],
      rotation: [0, Math.PI / 4, 0], collision: true, castShadow: true, material: HIGHWAY_MAT },
    // Segment 4
    { id: 'hw4', type: 'box', position: [55, 25, 55], size: [18, 2, 45],
      rotation: [0, Math.PI / 4, 0], collision: true, castShadow: true, material: HIGHWAY_MAT },
    // Segment 5: NE end
    { id: 'hw5', type: 'box', position: [100, 25, 100], size: [18, 2, 50],
      rotation: [0, Math.PI / 4, 0], collision: true, castShadow: true, material: HIGHWAY_MAT },

    // Highway barriers (low walls along highway edges)
    { id: 'hwb1', type: 'box', position: [-90, 27, -90], size: [1, 2, 50],
      rotation: [0, Math.PI / 4, 0], collision: true, material: { color: '#9ca3af', roughness: 0.8, metalness: 0.2, edgeColor: '#d4a017' } },
    { id: 'hwb2', type: 'box', position: [-45, 27, -45], size: [1, 2, 55],
      rotation: [0, Math.PI / 4, 0], collision: true, material: { color: '#9ca3af', roughness: 0.8, metalness: 0.2, edgeColor: '#d4a017' } },

    // === RAMPS connecting ground to highway ===
    // SW ramp (ground up to highway start)
    { id: 'ramp_sw', type: 'ramp', position: [-115, 0, -115], width: 14, height: 25, depth: 35,
      rotation: [0, Math.PI / 4, 0], collision: true, material: RAMP_MAT },
    // Mid ramp at collapse point (shorter)
    { id: 'ramp_mid', type: 'ramp', position: [-15, 0, -15], width: 14, height: 25, depth: 35,
      rotation: [0, Math.PI / 4, 0], collision: true, material: RAMP_MAT },
    // NE ramp
    { id: 'ramp_ne', type: 'ramp', position: [130, 0, 130], width: 14, height: 25, depth: 35,
      rotation: [0, -Math.PI * 3 / 4, 0], collision: true, material: RAMP_MAT },

    // === SUPPORT PILLARS under intact highway sections ===
    { id: 'pil1', type: 'cylinder', position: [-100, 12.5, -100], radiusTop: 1.5, radiusBottom: 2, height: 25,
      collision: true, material: PILLAR_MAT },
    { id: 'pil2', type: 'cylinder', position: [-80, 12.5, -80], radiusTop: 1.5, radiusBottom: 2, height: 25,
      collision: true, material: PILLAR_MAT },
    { id: 'pil3', type: 'cylinder', position: [-55, 12.5, -55], radiusTop: 1.5, radiusBottom: 2, height: 25,
      collision: true, material: PILLAR_MAT },
    { id: 'pil4', type: 'cylinder', position: [-35, 12.5, -35], radiusTop: 1.5, radiusBottom: 2, height: 25,
      collision: true, material: PILLAR_MAT },
    { id: 'pil5', type: 'cylinder', position: [10, 12.5, 10], radiusTop: 1.5, radiusBottom: 2, height: 25,
      collision: true, material: PILLAR_MAT },
    { id: 'pil6', type: 'cylinder', position: [45, 12.5, 45], radiusTop: 1.5, radiusBottom: 2, height: 25,
      collision: true, material: PILLAR_MAT },
    { id: 'pil7', type: 'cylinder', position: [65, 12.5, 65], radiusTop: 1.5, radiusBottom: 2, height: 25,
      collision: true, material: PILLAR_MAT },
    { id: 'pil8', type: 'cylinder', position: [90, 12.5, 90], radiusTop: 1.5, radiusBottom: 2, height: 25,
      collision: true, material: PILLAR_MAT },
    { id: 'pil9', type: 'cylinder', position: [110, 12.5, 110], radiusTop: 1.5, radiusBottom: 2, height: 25,
      collision: true, material: PILLAR_MAT },

    // === COLLAPSED DEBRIS on ground (between gap) ===
    { id: 'deb1', type: 'box', position: [-10, 3, -5], size: [12, 6, 8],
      rotation: [0.15, 0.3, 0.1], collision: true, material: { ...HIGHWAY_MAT, color: '#555d66' } },
    { id: 'deb2', type: 'box', position: [0, 2, 5], size: [8, 4, 10],
      rotation: [-0.1, 0.5, -0.2], collision: true, material: { ...HIGHWAY_MAT, color: '#555d66' } },

    // === GROUND BUILDINGS clustered under highway ===
    // Under SW section
    { id: 'gb1', type: 'box', position: [-75, 5, -95], size: [10, 10, 10], collision: true, castShadow: true, material: BUILDING_MAT },
    { id: 'gb2', type: 'box', position: [-95, 4, -75], size: [8, 8, 8], collision: true, castShadow: true, material: BUILDING_MAT },
    // Under NE section
    { id: 'gb3', type: 'box', position: [80, 6, 70], size: [12, 12, 8], collision: true, castShadow: true, material: BUILDING_MAT },
    { id: 'gb4', type: 'box', position: [70, 4, 90], size: [8, 8, 10], collision: true, castShadow: true, material: BUILDING_MAT },

    // === PERIMETER BUILDING CLUSTERS ===
    // NW corner (away from highway)
    { id: 'pb1', type: 'box', position: [-110, 6, 80], size: [12, 12, 10], collision: true, castShadow: true, material: BUILDING_MAT },
    { id: 'pb2', type: 'box', position: [-95, 4, 100], size: [8, 8, 8], collision: true, castShadow: true, material: BUILDING_MAT },
    // SE corner
    { id: 'pb3', type: 'box', position: [100, 5, -90], size: [10, 10, 12], collision: true, castShadow: true, material: BUILDING_MAT },
    { id: 'pb4', type: 'box', position: [115, 7, -70], size: [8, 14, 8], collision: true, castShadow: true, material: BUILDING_MAT },
    // Mid-field cover
    { id: 'pb5', type: 'box', position: [50, 3, -60], size: [7, 6, 7], collision: true, castShadow: true, material: BUILDING_MAT },
    { id: 'pb6', type: 'box', position: [-60, 3, 50], size: [7, 6, 7], collision: true, castShadow: true, material: BUILDING_MAT },
  ],
  dynamicElements: [],
  hazardZones: [],
  environment: {
    skyType: 'procedural_stars',
    ambientLightColor: '#b0b8c8',
    ambientLightIntensity: 0.4,
    lights: [
      { type: 'directional', color: '#ffe4b5', intensity: 0.6, position: [80, 60, 40], castShadow: true },
      { type: 'hemisphere', color: '#4a5568', intensity: 0.3, groundColor: '#1a1a2e' },
    ],
    floorMaterial: { color: '#1f2937', roughness: 0.9, metalness: 0.05, edgeColor: '#374151' },
    fog: { color: '#1a1a2e', near: 100, far: 350 },
    showGrid: true,
    gridSize: 300,
    showBoundaryWalls: true,
  },
};
