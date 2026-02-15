import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { MechLoadout, MechPart, PartType } from '../../shared/types/MechTypes'

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
  head: new THREE.Vector3(0, 3.5, 0),
  core: new THREE.Vector3(0, 1.5, 0),
  leftArm: new THREE.Vector3(-1.4, 2, 0),
  rightArm: new THREE.Vector3(1.4, 2, 0),
  legs: new THREE.Vector3(0, 0.75, 0),
  rack: new THREE.Vector3(0, 2.5, -0.5),
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

  constructor(baseModelPath: string = '/models') {
    this.gltfLoader = new GLTFLoader()
    this.baseModelPath = baseModelPath
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
    group.add(headModel ?? this.createFallbackPart('head', teamColor))
    group.add(coreModel ?? this.createFallbackPart('core', teamColor))
    group.add(leftArmModel ?? this.createFallbackPart('leftArm', teamColor))
    group.add(rightArmModel ?? this.createFallbackPart('rightArm', teamColor))
    group.add(legsModel ?? this.createFallbackPart('legs', teamColor))
    group.add(rackModel ?? this.createFallbackPart('rack', teamColor))

    return group
  }

  /**
   * Create procedural fallback geometry for a part type
   */
  createFallbackPart(partType: PartType | 'leftArm' | 'rightArm', color: number): THREE.Mesh {
    let geometry: THREE.BoxGeometry
    let position: THREE.Vector3

    switch (partType) {
      case 'head':
        geometry = new THREE.BoxGeometry(1, 1, 1)
        position = MODEL_ATTACH_POINTS.head.clone()
        break
      case 'core':
        geometry = new THREE.BoxGeometry(2, 3, 2)
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
        geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5)
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
