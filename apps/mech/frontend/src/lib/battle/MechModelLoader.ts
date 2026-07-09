import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { MechLoadout, MechPart, PartType } from '../../shared/types/MechTypes'
import { getProceduralModel } from './ProceduralModels'

/**
 * Cached model data structure
 */
interface CachedModel {
  scene: THREE.Group
  loadPromise?: Promise<THREE.Group>
}

/**
 * Model attachment points for assembling mech parts
 */
export const MODEL_ATTACH_POINTS = {
  head: new THREE.Vector3(0, 4.8, 0),
  core: new THREE.Vector3(0, 2.8, 0),
  leftArm: new THREE.Vector3(-1.3, 3.8, 0),
  rightArm: new THREE.Vector3(1.3, 3.8, 0),
  legs: new THREE.Vector3(0, 0, 0),
  rack: new THREE.Vector3(0, 4.2, -0.5),
} as const

/**
 * MechModelLoader - Handles loading, caching, and assembling 3D mech models
 *
 * This class provides:
 * - Async loading of GLTF/GLB models
 * - Model caching to prevent redundant loads
 * - Dynamic mech assembly from individual parts
 * - Fallback to procedural geometry when models aren't available
 */
export class MechModelLoader {
  private gltfLoader: GLTFLoader
  private modelCache: Map<string, CachedModel> = new Map()
  private baseModelPath: string
  // Session-cached "are any GLBs present?" probe. No .glb files ship by default,
  // so a naive assemble fires 6 guaranteed-404 fetches every time. We probe ONCE
  // (a single HEAD request) and, if nothing is there, go straight to procedural
  // for the rest of the session. If real GLBs are later dropped into
  // public/models (README workflow), a fresh loader / clearCache re-probes and
  // loading resumes — so the fallback behaviour still upgrades for free.
  private availabilityPromise: Promise<boolean> | null = null

  constructor(baseModelPath: string = '/models') {
    this.gltfLoader = new GLTFLoader()
    this.baseModelPath = baseModelPath
  }

  /** One cached HEAD probe per session for a sentinel GLB. */
  private checkModelsAvailable(): Promise<boolean> {
    if (!this.availabilityPromise) {
      this.availabilityPromise = this.probeModels()
    }
    return this.availabilityPromise
  }

  private async probeModels(): Promise<boolean> {
    if (typeof fetch !== 'function') return false
    try {
      // Sentinel = the first file the README lists. If it 200s, GLBs are present
      // and we let per-part loads (each with its own fallback) proceed.
      const sentinel = `${this.baseModelPath}/arms/autocannon.glb`
      const res = await fetch(sentinel, { method: 'HEAD' })
      return res.ok
    } catch {
      return false
    }
  }

  /**
   * Load a single model by path
   * Returns cached model if already loaded
   */
  async loadModel(modelPath: string): Promise<THREE.Group> {
    // Check cache first
    const cached = this.modelCache.get(modelPath)
    if (cached) {
      // If currently loading, wait for it
      if (cached.loadPromise) {
        return cached.loadPromise
      }
      // Return cloned scene so each mech has its own instance
      return cached.scene.clone()
    }

    // Start loading
    const loadPromise = this.gltfLoader.loadAsync(modelPath)
      .then((gltf) => {
        const scene = gltf.scene as THREE.Group
        // Cache the original
        this.modelCache.set(modelPath, { scene })
        // Return a clone
        return scene.clone()
      })
      .catch((error) => {
        console.warn(`Failed to load model: ${modelPath}`, error)
        // Remove failed entry from cache
        this.modelCache.delete(modelPath)
        throw error
      })

    // Cache the loading promise
    this.modelCache.set(modelPath, { scene: new THREE.Group(), loadPromise })

    return loadPromise
  }

  /**
   * Check if a part has a model path defined
   */
  hasModel(part: MechPart | null): boolean {
    return part !== null && typeof part.modelPath === 'string' && part.modelPath.length > 0
  }

  /**
   * Load a model for a specific part
   * Falls back to null if no model defined or load fails
   */
  async loadPartModel(part: MechPart | null): Promise<THREE.Group | null> {
    if (!part || !this.hasModel(part)) return null

    // Skip the fetch entirely if this session has confirmed no GLBs are present.
    if (!(await this.checkModelsAvailable())) return null

    try {
      const fullPath = part.modelPath.startsWith('/')
        ? part.modelPath
        : `${this.baseModelPath}/${part.modelPath}`

      return await this.loadModel(fullPath)
    } catch {
      return null
    }
  }

  /**
   * Assemble a complete mech from its loadout
   * Uses 3D models when available, falls back to procedural geometry
   */
  async assembleMech(loadout: MechLoadout, teamColor: number): Promise<THREE.Group> {
    const group = new THREE.Group()

    // Load all parts in parallel
    const [
      headModel,
      coreModel,
      leftArmModel,
      rightArmModel,
      legsModel,
      rackModel,
    ] = await Promise.all([
      this.loadPartModel(loadout.head),
      this.loadPartModel(loadout.core),
      this.loadPartModel(loadout.leftArm),
      this.loadPartModel(loadout.rightArm),
      this.loadPartModel(loadout.legs),
      this.loadPartModel(loadout.rack),
    ])

    // Add each part, using model or fallback
    group.add(headModel ?? this.createFallbackPart('head', teamColor, loadout.head))
    group.add(coreModel ?? this.createFallbackPart('core', teamColor, loadout.core))
    group.add(leftArmModel ?? this.createFallbackPart('leftArm', teamColor, loadout.leftArm))
    group.add(rightArmModel ?? this.createFallbackPart('rightArm', teamColor, loadout.rightArm))
    group.add(legsModel ?? this.createFallbackPart('legs', teamColor, loadout.legs))
    group.add(rackModel ?? this.createFallbackPart('rack', teamColor, loadout.rack))

    return group
  }

  /**
   * Create procedural fallback geometry for a part type
   * Uses detailed procedural models when available, falls back to simple boxes
   */
  createFallbackPart(partType: PartType | 'leftArm' | 'rightArm', color: number, part?: MechPart | null): THREE.Group | THREE.Mesh {
    // If we have a specific part, try to use its procedural model
    if (part && part.id) {
      const proceduralModelFn = getProceduralModel(part.id)
      if (proceduralModelFn) {
        const model = proceduralModelFn()

        // Position the model at the correct attachment point
        const attachPoint = this.getAttachPoint(partType)
        model.position.copy(attachPoint)

        // Apply team color tint to all meshes in the group. Baked parts share
        // one source material across many merged meshes (and across mechs via
        // the module cache), so clone once per unique source material rather
        // than per mesh. Clones stay private to this part — damage flash and
        // limb blackening mutate them, so they must never be shared across
        // mechs or slots.
        const tint = new THREE.Color(color)
        const tintedMaterials = new Map<THREE.MeshStandardMaterial, THREE.MeshStandardMaterial>()
        model.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            // Lightly tint with team color while preserving material identity.
            if (child.name === 'thrust-glow') {
              // Per-frame emissive animation target (MechEntity.animateWalk) —
              // give it its own instance so pulsing never leaks to sensors
              // sharing the same source glow material.
              child.material = child.material.clone()
              child.material.color.lerp(tint, 0.2)
              return
            }
            let tinted = tintedMaterials.get(child.material)
            if (!tinted) {
              tinted = child.material.clone()
              tinted.color.lerp(tint, 0.2)
              tintedMaterials.set(child.material, tinted)
            }
            child.material = tinted
          }
        })

        model.name = partType
        return model
      }
    }

    // Fall back to simple box geometry if no procedural model exists
    let geometry: THREE.BoxGeometry
    let position: THREE.Vector3

    switch (partType) {
      case 'head':
        geometry = new THREE.BoxGeometry(1, 1, 1)
        position = MODEL_ATTACH_POINTS.head.clone()
        break
      case 'core':
        geometry = new THREE.BoxGeometry(2, 2, 1.5)
        position = MODEL_ATTACH_POINTS.core.clone()
        break
      case 'leftArm':
        geometry = new THREE.BoxGeometry(0.8, 2, 0.8)
        position = MODEL_ATTACH_POINTS.leftArm.clone()
        break
      case 'rightArm':
        geometry = new THREE.BoxGeometry(0.8, 2, 0.8)
        position = MODEL_ATTACH_POINTS.rightArm.clone()
        break
      case 'legs':
        geometry = new THREE.BoxGeometry(1.8, 2.8, 1.5)
        position = MODEL_ATTACH_POINTS.legs.clone()
        break
      case 'rack':
        geometry = new THREE.BoxGeometry(0.5, 0.5, 0.3)
        position = MODEL_ATTACH_POINTS.rack.clone()
        break
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1)
        position = new THREE.Vector3(0, 0, 0)
    }

    const material = new THREE.MeshStandardMaterial({ color })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.copy(position)
    mesh.name = partType

    return mesh
  }

  /**
   * Get the attachment point for a part type
   */
  private getAttachPoint(partType: PartType | 'leftArm' | 'rightArm'): THREE.Vector3 {
    switch (partType) {
      case 'head':
        return MODEL_ATTACH_POINTS.head.clone()
      case 'core':
        return MODEL_ATTACH_POINTS.core.clone()
      case 'leftArm':
        return MODEL_ATTACH_POINTS.leftArm.clone()
      case 'rightArm':
        return MODEL_ATTACH_POINTS.rightArm.clone()
      case 'legs':
        return MODEL_ATTACH_POINTS.legs.clone()
      case 'rack':
        return MODEL_ATTACH_POINTS.rack.clone()
      default:
        return new THREE.Vector3(0, 0, 0)
    }
  }

  /**
   * Preload all models for a loadout
   * Useful for loading screen scenarios
   */
  async preloadLoadoutModels(loadout: MechLoadout): Promise<void> {
    const parts = [
      loadout.head,
      loadout.core,
      loadout.leftArm,
      loadout.rightArm,
      loadout.legs,
      loadout.rack,
    ]

    await Promise.all(
      parts
        .filter((part) => this.hasModel(part))
        .map((part) => this.loadPartModel(part))
    )
  }

  /**
   * Clear the model cache
   * Call this when switching scenes or to free memory
   */
  clearCache(): void {
    this.modelCache.forEach((cached) => {
      cached.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (child.material instanceof THREE.Material) {
            child.material.dispose()
          }
        }
      })
    })
    this.modelCache.clear()
    // Re-probe next assemble so newly-added GLBs are picked up (README workflow).
    this.availabilityPromise = null
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; paths: string[] } {
    return {
      size: this.modelCache.size,
      paths: Array.from(this.modelCache.keys()),
    }
  }
}

// Singleton instance for convenience
let loaderInstance: MechModelLoader | null = null

/**
 * Get the global MechModelLoader instance
 */
export function getMechModelLoader(basePath?: string): MechModelLoader {
  if (!loaderInstance) {
    loaderInstance = new MechModelLoader(basePath)
  }
  return loaderInstance
}
