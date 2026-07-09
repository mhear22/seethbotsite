import * as THREE from 'three'
import { MODEL_ATTACH_POINTS } from './MechModelLoader'
import { getProceduralModel } from './ProceduralModels'
import { SHARED_GEOMETRY_FLAG } from './procedural/bakedParts'
import type { MechLoadout } from '../../shared/types/MechTypes'

export const DEFAULT_TEAM_COLOR = 0x3b82f6

/**
 * Assemble a procedural (no async GLB loading) mech group for a loadout.
 * Missing or unknown parts fall back to simple boxes so the silhouette is
 * always complete. Materials are cloned before tinting because baked parts
 * share materials across instances.
 */
export function buildProceduralMechGroup(loadout: MechLoadout, teamColor: number = DEFAULT_TEAM_COLOR): THREE.Group {
  const group = new THREE.Group()

  const addPart = (
    partType: 'head' | 'core' | 'leftArm' | 'rightArm' | 'legs' | 'rack',
    part: { id: string } | null
  ) => {
    if (part && part.id) {
      const proceduralFn = getProceduralModel(part.id)
      if (proceduralFn) {
        const model = proceduralFn()
        model.position.copy(MODEL_ATTACH_POINTS[partType])

        model.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material = child.material.clone()
            child.material.color.lerp(new THREE.Color(teamColor), 0.2)
          }
        })

        group.add(model)
        return
      }
    }

    const fallbacks: Record<string, [number, number, number]> = {
      head: [1, 1, 1],
      core: [2, 2, 1.5],
      leftArm: [0.8, 2, 0.8],
      rightArm: [0.8, 2, 0.8],
      legs: [1.8, 2.8, 1.5],
      rack: [0.5, 0.5, 0.3],
    }

    const size = fallbacks[partType]
    if (size) {
      const geometry = new THREE.BoxGeometry(...size)
      const material = new THREE.MeshStandardMaterial({ color: teamColor })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.copy(MODEL_ATTACH_POINTS[partType])
      mesh.name = partType
      group.add(mesh)
    }
  }

  addPart('head', loadout.head)
  addPart('core', loadout.core)
  addPart('leftArm', loadout.leftArm)
  addPart('rightArm', loadout.rightArm)
  addPart('legs', loadout.legs)
  addPart('rack', loadout.rack)

  return group
}

/**
 * Dispose a mech group's GPU resources, skipping geometry shared via the
 * baked-parts cache (disposing it would force a re-upload for every user).
 */
export function disposeMechGroup(group: THREE.Object3D) {
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (!child.geometry.userData[SHARED_GEOMETRY_FLAG]) {
        child.geometry.dispose()
      }
      if (child.material instanceof THREE.Material) {
        child.material.dispose()
      }
    }
  })
}

const THUMBNAIL_SIZE = 192

let thumbnailRenderer: THREE.WebGLRenderer | null = null
let thumbnailScene: THREE.Scene | null = null
let thumbnailCamera: THREE.PerspectiveCamera | null = null

const thumbnailCache = new Map<string, string>()

function loadoutCacheKey(loadout: MechLoadout, teamColor: number): string {
  return [
    loadout.head?.id,
    loadout.core?.id,
    loadout.leftArm?.id,
    loadout.rightArm?.id,
    loadout.legs?.id,
    loadout.rack?.id,
    teamColor,
  ].join('|')
}

function ensureThumbnailScene(): boolean {
  if (thumbnailRenderer) return true

  try {
    thumbnailRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    })
  } catch {
    return false
  }
  thumbnailRenderer.setSize(THUMBNAIL_SIZE, THUMBNAIL_SIZE)
  thumbnailRenderer.setPixelRatio(1)

  thumbnailScene = new THREE.Scene()

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  thumbnailScene.add(ambientLight)

  const mainLight = new THREE.DirectionalLight(0xffffff, 1)
  mainLight.position.set(10, 20, 10)
  thumbnailScene.add(mainLight)

  const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3)
  fillLight.position.set(-10, 10, -10)
  thumbnailScene.add(fillLight)

  thumbnailCamera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  thumbnailCamera.position.set(6.5, 5, 6.5)
  thumbnailCamera.lookAt(0, 2.6, 0)

  return true
}

/**
 * Render a loadout to a PNG data URL (192x192, transparent background) using
 * a single shared offscreen renderer. Results are cached by part ids, so
 * repeated calls for the same build are free. Returns null when WebGL is
 * unavailable.
 */
export function getMechThumbnail(loadout: MechLoadout, teamColor: number = DEFAULT_TEAM_COLOR): string | null {
  const key = loadoutCacheKey(loadout, teamColor)
  const cached = thumbnailCache.get(key)
  if (cached) return cached

  if (!ensureThumbnailScene() || !thumbnailRenderer || !thumbnailScene || !thumbnailCamera) {
    return null
  }

  const mechGroup = buildProceduralMechGroup(loadout, teamColor)
  thumbnailScene.add(mechGroup)
  thumbnailRenderer.render(thumbnailScene, thumbnailCamera)
  const dataUrl = thumbnailRenderer.domElement.toDataURL('image/png')
  thumbnailScene.remove(mechGroup)
  disposeMechGroup(mechGroup)

  thumbnailCache.set(key, dataUrl)
  return dataUrl
}
