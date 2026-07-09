/**
 * Baked procedural part cache (perf).
 *
 * The procedural part builders assemble every plate, rivet, trim bar and vent
 * slat as an individual THREE.Mesh — ~450 meshes (= ~450 draw calls) per
 * assembled mech, ~2,700 for a full story wave. Vertex count is trivial; the
 * cost is per-draw CPU overhead. This module collapses each built part ONCE
 * and then hands out cheap clones:
 *
 *  1. bakeZone(): within each rigid subtree, sibling meshes that share a
 *     material are merged into a single mesh (transforms baked into the
 *     geometry relative to the subtree's frame), so a 30-115 mesh part
 *     renders in a handful of draws.
 *  2. getBakedPart(): module-level cache keyed by part id. Object3D.clone()
 *     shares BufferGeometry by reference, so every mech using the same part
 *     renders from the same GPU buffers and a mid-wave spawn is a cheap clone
 *     instead of ~380 tessellations + uploads.
 *
 * Animation / lookup contract (MechEntity.animateWalk, blackenSlotMesh,
 * findChildByName): any NAMED node is never merged away.
 *  - Named groups ('leg-*', 'track-*', 'thruster-*') stay intact as rigid
 *    boundaries and are baked recursively, so leg swings and track transforms
 *    keep moving their merged contents correctly.
 *  - Named meshes ('wheel-*', 'sprocket-*', 'idler-*', 'thrust-glow') keep
 *    their own transforms and materials for per-frame spins / emissive pulses.
 *
 * Shared geometries are flagged via userData so per-mech disposal paths can
 * skip them (see MechEntity.disposeMeshGroup) — disposing one clone must not
 * evict the GPU buffers under every other live mech.
 */

import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * BufferGeometry.userData flag marking geometry owned by the module-level part
 * cache. Disposal paths must skip flagged geometry (other clones still use it).
 */
export const SHARED_GEOMETRY_FLAG = 'sharedBakedGeometry'

/** Cached baked part templates, keyed by part id. Never handed out directly. */
const bakedPartCache = new Map<string, THREE.Group>()

/**
 * Any named node is an animation target or name-lookup anchor (wheels, legs,
 * thrust glow, muzzle/attach points) and must survive the bake untouched.
 */
function isPreserved(node: THREE.Object3D): boolean {
  return node.name.length > 0
}

/**
 * Merge all unnamed descendant meshes of `zone` (one rigid subtree) into one
 * mesh per shared material, baking each mesh's transform relative to the
 * zone's own frame. Named child groups are recursed as their own zones; named
 * meshes are left exactly as authored.
 */
function bakeZone(zone: THREE.Object3D): void {
  const buckets = new Map<THREE.Material, { geoms: THREE.BufferGeometry[]; meshes: THREE.Mesh[] }>()

  const collect = (node: THREE.Object3D, parentMatrix: THREE.Matrix4) => {
    for (const child of node.children) {
      child.updateMatrix()
      const matrix = new THREE.Matrix4().multiplyMatrices(parentMatrix, child.matrix)

      if (isPreserved(child)) {
        // Named group -> rigid boundary, baked in its own frame. Named mesh ->
        // individually animated (wheel spin, thrust-glow pulse), keep as-is.
        if (!(child instanceof THREE.Mesh)) bakeZone(child)
        continue
      }

      if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
        // toNonIndexed() normalises mixed inputs for mergeGeometries (Extrude
        // geometries are non-indexed, Box/Cylinder/Sphere/... are indexed).
        const geom = child.geometry.index ? child.geometry.toNonIndexed() : child.geometry.clone()
        geom.applyMatrix4(matrix)
        let bucket = buckets.get(child.material)
        if (!bucket) {
          bucket = { geoms: [], meshes: [] }
          buckets.set(child.material, bucket)
        }
        bucket.geoms.push(geom)
        bucket.meshes.push(child)
      } else {
        // Unnamed group (panelPlate / trimStripe / riveting wrappers) — its
        // children are rigid with this zone, so keep accumulating transforms.
        collect(child, matrix)
      }
    }
  }
  collect(zone, new THREE.Matrix4())

  for (const [material, bucket] of buckets) {
    const merged = bucket.geoms.length === 1 ? bucket.geoms[0] : mergeGeometries(bucket.geoms, false)
    if (!merged) continue // incompatible attributes — leave those meshes unmerged
    for (const mesh of bucket.meshes) mesh.removeFromParent()
    zone.add(new THREE.Mesh(merged, material))
  }

  pruneEmptyGroups(zone)
}

/** Drop unnamed groups emptied by the merge so scene-graph traversal stays lean. */
function pruneEmptyGroups(node: THREE.Object3D): void {
  for (const child of [...node.children]) {
    if (isPreserved(child)) continue
    if (child instanceof THREE.Group) {
      pruneEmptyGroups(child)
      if (child.children.length === 0) node.remove(child)
    }
  }
}

/**
 * Build (once), bake and cache the part model for `partId`, then return a
 * clone. The clone has its own Object3D hierarchy (safe to animate/reposition)
 * but shares geometry and source materials with every other clone — callers
 * that mutate materials (team tint, damage flash) must clone them per mech,
 * which is exactly what MechModelLoader.createFallbackPart does.
 */
export function getBakedPart(partId: string, build: () => THREE.Group): THREE.Group {
  let baked = bakedPartCache.get(partId)
  if (!baked) {
    baked = build()
    bakeZone(baked)
    baked.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.userData[SHARED_GEOMETRY_FLAG] = true
      }
    })
    bakedPartCache.set(partId, baked)
  }
  return baked.clone()
}
