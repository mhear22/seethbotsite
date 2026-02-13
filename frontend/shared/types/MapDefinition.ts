/**
 * Declarative map definition types for multi-map battle system
 * Shared between frontend and backend - pure data, no engine imports
 */

// ============================================================================
// Top-level Map Definition
// ============================================================================

export interface MapDefinition {
  id: string;
  name: string;
  arena: ArenaDimensions;
  spawnPoints: SpawnPoint[];
  staticGeometry: StaticGeometry[];
  dynamicElements: DynamicElement[];
  hazardZones: HazardZone[];
  environment: EnvironmentDef;
}

export interface ArenaDimensions {
  width: number;
  depth: number;
  floorY: number;
  ceilingY: number;
}

export interface SpawnPoint {
  position: [number, number, number];
  facingAngle: number; // radians
  playerSlot: number; // 0 = player1, 1 = player2
}

// ============================================================================
// Static Geometry
// ============================================================================

export type StaticGeometry = BoxGeometry | CylinderGeometry | RampGeometry | PlaneGeometry;

interface BaseGeometry {
  id: string;
  position: [number, number, number];
  rotation?: [number, number, number]; // euler angles in radians
  material: MaterialDef;
  collision: boolean; // whether to include in physics collision
  castShadow?: boolean;
  receiveShadow?: boolean;
  tags?: string[]; // e.g. ['window', 'wall', 'floor']
}

export interface BoxGeometry extends BaseGeometry {
  type: 'box';
  size: [number, number, number]; // width, height, depth
}

export interface CylinderGeometry extends BaseGeometry {
  type: 'cylinder';
  radiusTop: number;
  radiusBottom: number;
  height: number;
  segments?: number;
}

export interface RampGeometry extends BaseGeometry {
  type: 'ramp';
  width: number;
  height: number;
  depth: number;
  // Ramp goes from ground level at -depth/2 to full height at +depth/2 (in local space)
}

export interface PlaneGeometry extends BaseGeometry {
  type: 'plane';
  width: number;
  height: number;
}

// ============================================================================
// Dynamic Elements (deterministic timing)
// ============================================================================

export type DynamicElement = ConveyorBelt | RotatingElement | PistonElement;

interface BaseDynamicElement {
  id: string;
  position: [number, number, number];
  rotation?: [number, number, number];
}

export interface ConveyorBelt extends BaseDynamicElement {
  type: 'conveyor';
  size: [number, number, number]; // width, thickness, length
  pushDirection: [number, number, number]; // normalized direction
  pushSpeed: number; // units/s
  material: MaterialDef;
}

export interface RotatingElement extends BaseDynamicElement {
  type: 'rotating';
  shape: 'box' | 'cylinder';
  size: [number, number, number]; // width, height, length (for box) or radiusTop, height, radiusBottom (for cylinder)
  rotationAxis: 'x' | 'y' | 'z';
  rotationSpeed: number; // radians/s
  contactDamage: number; // damage on contact per tick
  material: MaterialDef;
}

export interface PistonElement extends BaseDynamicElement {
  type: 'piston';
  size: [number, number, number]; // width, height, depth of piston head
  direction: [number, number, number]; // slam direction (normalized)
  restPosition: [number, number, number]; // starting position
  extendDistance: number; // how far it extends
  cycleDuration: number; // seconds for full cycle
  extendedFraction: number; // fraction of cycle spent extended (0-1)
  slamDamage: number;
  material: MaterialDef;
}

// ============================================================================
// Hazard Zones
// ============================================================================

export interface HazardZone {
  id: string;
  shape: 'sphere' | 'cylinder' | 'box';
  position: [number, number, number];
  radius?: number; // for sphere/cylinder
  size?: [number, number, number]; // for box
  height?: number; // for cylinder
  damage: number; // per activation
  period: number; // seconds between pulses (0 = constant)
  activeDuration: number; // seconds the hazard is active per pulse
  warningDuration: number; // seconds of warning before activation
  damageType: 'radiation' | 'fire' | 'electric' | 'crushing';
}

// ============================================================================
// Environment
// ============================================================================

export interface EnvironmentDef {
  skyType: 'procedural_stars' | 'solid_color' | 'none';
  skyColor?: string; // hex color for solid_color sky
  ambientLightColor: string;
  ambientLightIntensity: number;
  lights: LightDef[];
  floorMaterial: MaterialDef;
  fog?: FogDef;
  showGrid: boolean;
  gridSize?: number;
  showBoundaryWalls: boolean;
}

export type LightDef = DirectionalLightDef | PointLightDef | HemisphereLightDef;

interface BaseLightDef {
  color: string;
  intensity: number;
  castShadow?: boolean;
}

export interface DirectionalLightDef extends BaseLightDef {
  type: 'directional';
  position: [number, number, number];
}

export interface PointLightDef extends BaseLightDef {
  type: 'point';
  position: [number, number, number];
  distance?: number;
  decay?: number;
}

export interface HemisphereLightDef extends BaseLightDef {
  type: 'hemisphere';
  groundColor: string;
}

export interface FogDef {
  color: string;
  near: number;
  far: number;
}

// ============================================================================
// Materials
// ============================================================================

export interface MaterialDef {
  color: string; // hex color
  roughness?: number;
  metalness?: number;
  emissive?: string; // hex color
  emissiveIntensity?: number;
  edgeColor?: string; // hex color for edge highlights
  opacity?: number;
  transparent?: boolean;
}

// ============================================================================
// Utility: compute AABB from static geometry (for server collision)
// ============================================================================

export interface AABB {
  minX: number; maxX: number;
  minY: number; maxY: number;
  minZ: number; maxZ: number;
}

export function computeAABB(geom: StaticGeometry): AABB | null {
  if (!geom.collision) return null;

  const [px, py, pz] = geom.position;

  switch (geom.type) {
    case 'box': {
      const [w, h, d] = geom.size;
      // For rotated boxes, compute an approximate AABB
      if (geom.rotation && (geom.rotation[0] !== 0 || geom.rotation[1] !== 0 || geom.rotation[2] !== 0)) {
        // Simplified: use the bounding sphere of the box as AABB
        const maxExtent = Math.sqrt((w/2)**2 + (d/2)**2);
        return {
          minX: px - maxExtent, maxX: px + maxExtent,
          minY: py - h/2, maxY: py + h/2,
          minZ: pz - maxExtent, maxZ: pz + maxExtent,
        };
      }
      return {
        minX: px - w/2, maxX: px + w/2,
        minY: py - h/2, maxY: py + h/2,
        minZ: pz - d/2, maxZ: pz + d/2,
      };
    }
    case 'cylinder': {
      const r = Math.max(geom.radiusTop, geom.radiusBottom);
      return {
        minX: px - r, maxX: px + r,
        minY: py - geom.height/2, maxY: py + geom.height/2,
        minZ: pz - r, maxZ: pz + r,
      };
    }
    case 'ramp': {
      const { width, height, depth } = geom;
      return {
        minX: px - width/2, maxX: px + width/2,
        minY: py, maxY: py + height,
        minZ: pz - depth/2, maxZ: pz + depth/2,
      };
    }
    case 'plane':
      return null; // Planes don't have collision volume
  }
}

/**
 * Compute position of a dynamic element at a given elapsed time
 */
export function getDynamicElementTransform(
  element: DynamicElement,
  elapsedTime: number
): { position: [number, number, number]; rotation: [number, number, number] } {
  const pos: [number, number, number] = [...element.position];
  const rot: [number, number, number] = element.rotation ? [...element.rotation] : [0, 0, 0];

  switch (element.type) {
    case 'conveyor':
      // Conveyors don't move, they push mechs
      break;

    case 'rotating': {
      const axisIndex = element.rotationAxis === 'x' ? 0 : element.rotationAxis === 'y' ? 1 : 2;
      rot[axisIndex] = (rot[axisIndex] + elapsedTime * element.rotationSpeed) % (Math.PI * 2);
      break;
    }

    case 'piston': {
      const cycleProgress = (elapsedTime % element.cycleDuration) / element.cycleDuration;
      let extensionFactor: number;

      if (cycleProgress < element.extendedFraction) {
        // Extended phase
        extensionFactor = 1.0;
      } else if (cycleProgress < element.extendedFraction + 0.1) {
        // Retracting phase (quick)
        extensionFactor = 1.0 - (cycleProgress - element.extendedFraction) / 0.1;
      } else if (cycleProgress > 0.9) {
        // Slamming phase (quick extend)
        extensionFactor = (cycleProgress - 0.9) / 0.1;
      } else {
        // Retracted/waiting phase
        extensionFactor = 0;
      }

      pos[0] = element.restPosition[0] + element.direction[0] * element.extendDistance * extensionFactor;
      pos[1] = element.restPosition[1] + element.direction[1] * element.extendDistance * extensionFactor;
      pos[2] = element.restPosition[2] + element.direction[2] * element.extendDistance * extensionFactor;
      break;
    }
  }

  return { position: pos, rotation: rot };
}

/**
 * Check if a hazard zone is active at a given elapsed time
 */
export function isHazardActive(hazard: HazardZone, elapsedTime: number): { active: boolean; warning: boolean } {
  if (hazard.period === 0) {
    return { active: true, warning: false };
  }

  const cycleTime = elapsedTime % hazard.period;
  const activateAt = hazard.period - hazard.activeDuration;
  const warningAt = activateAt - hazard.warningDuration;

  return {
    active: cycleTime >= activateAt,
    warning: cycleTime >= warningAt && cycleTime < activateAt,
  };
}

/**
 * Check if a point is within a hazard zone
 */
export function isPointInHazard(
  hazard: HazardZone,
  point: [number, number, number]
): boolean {
  const [hx, hy, hz] = hazard.position;
  const [px, py, pz] = point;

  switch (hazard.shape) {
    case 'sphere': {
      const r = hazard.radius ?? 0;
      const dx = px - hx, dy = py - hy, dz = pz - hz;
      return dx*dx + dy*dy + dz*dz <= r*r;
    }
    case 'cylinder': {
      const r = hazard.radius ?? 0;
      const h = hazard.height ?? Infinity;
      const dx = px - hx, dz = pz - hz;
      return dx*dx + dz*dz <= r*r && py >= hy && py <= hy + h;
    }
    case 'box': {
      const [w, h, d] = hazard.size ?? [0, 0, 0];
      return Math.abs(px - hx) <= w/2 && Math.abs(py - hy) <= h/2 && Math.abs(pz - hz) <= d/2;
    }
  }
}
