<template>
  <div class="map-preview-3d">
    <canvas ref="canvasRef" class="preview-canvas"></canvas>
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span>Loading map...</span>
    </div>
    <div class="preview-controls">
      <button @click="toggleAutoRotate" :class="{ active: autoRotate }" title="Toggle auto-rotate">
        <span class="icon-btn">&#x21BB;</span>
      </button>
      <button @click="resetCamera" title="Reset view">
        <span class="icon-btn">&#x2699;</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, markRaw } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { MapDefinition } from '@shared/types/MapDefinition'

const props = defineProps<{
  mapId: string
}>()

const emit = defineEmits<{
  (e: 'loaded'): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const isLoading = ref(true)
const autoRotate = ref(true)

// Three.js objects
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let controls: OrbitControls | null = null
let mapGroup: THREE.Group | null = null
let animationFrameId: number | null = null
let startTime = 0

// Store references for cleanup
const meshes: THREE.Mesh[] = []
const materials: THREE.Material[] = []
const geometries: THREE.BufferGeometry[] = []

async function loadMapDefinition(mapId: string): Promise<MapDefinition | null> {
  try {
    const maps = await import('@shared/maps')
    return maps.getMapById(mapId) ?? null
  } catch (error) {
    console.error('Failed to load map definition:', error)
    return null
  }
}

function createMaterial(def: { color: string; roughness?: number; metalness?: number; emissive?: string; emissiveIntensity?: number }) {
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(def.color),
    roughness: def.roughness ?? 0.5,
    metalness: def.metalness ?? 0.5,
    emissive: def.emissive ? new THREE.Color(def.emissive) : undefined,
    emissiveIntensity: def.emissiveIntensity ?? 0,
  })
  materials.push(mat)
  return mat
}

function createMapPreview(mapDef: MapDefinition): THREE.Group {
  const group = new THREE.Group()

  // Create floor
  const floorGeo = new THREE.PlaneGeometry(mapDef.arena.width, mapDef.arena.depth)
  geometries.push(floorGeo)
  const floorMat = createMaterial(mapDef.environment.floorMaterial)
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  group.add(floor)
  meshes.push(floor)

  // Create grid
  if (mapDef.environment.showGrid) {
    const gridSize = mapDef.environment.gridSize ?? mapDef.arena.width
    const gridHelper = new THREE.GridHelper(gridSize, gridSize / 10, 0x4a5568, 0x374151)
    gridHelper.position.y = 0.01
    group.add(gridHelper)
  }

  // Create static geometry
  for (const geom of mapDef.staticGeometry) {
    let threeGeom: THREE.BufferGeometry
    let width = 0, height = 0, depth = 0

    switch (geom.type) {
      case 'box': {
        [width, height, depth] = geom.size
        threeGeom = new THREE.BoxGeometry(width, height, depth)
        break
      }
      case 'cylinder': {
        const segments = geom.segments ?? 16
        threeGeom = new THREE.CylinderGeometry(geom.radiusTop, geom.radiusBottom, geom.height, segments)
        width = Math.max(geom.radiusTop, geom.radiusBottom) * 2
        height = geom.height
        depth = width
        break
      }
      case 'ramp': {
        width = geom.width
        height = geom.height
        depth = geom.depth
        threeGeom = new THREE.BoxGeometry(width, height, depth)
        break
      }
      case 'plane': {
        threeGeom = new THREE.PlaneGeometry(geom.width, geom.height)
        width = geom.width
        height = geom.height
        depth = 0.1
        break
      }
      default:
        continue
    }

    geometries.push(threeGeom)
    const mat = createMaterial(geom.material)
    const mesh = new THREE.Mesh(threeGeom, mat)
    mesh.position.set(geom.position[0], geom.position[1], geom.position[2])

    if (geom.rotation) {
      mesh.rotation.set(geom.rotation[0], geom.rotation[1], geom.rotation[2])
    }

    if (geom.castShadow) mesh.castShadow = true
    if (geom.receiveShadow) mesh.receiveShadow = true

    // Add edge highlights
    if (geom.material.edgeColor) {
      const edgeGeo = new THREE.EdgesGeometry(threeGeom)
      geometries.push(edgeGeo)
      const edgeMat = new THREE.LineBasicMaterial({ color: new THREE.Color(geom.material.edgeColor) })
      materials.push(edgeMat)
      const edges = new THREE.LineSegments(edgeGeo, edgeMat)
      mesh.add(edges)
    }

    group.add(mesh)
    meshes.push(mesh)
  }

  // Create spawn point markers
  for (const spawn of mapDef.spawnPoints) {
    // Player 0 = blue, Player 1 = red
    const color = spawn.playerSlot === 0 ? 0x3b82f6 : 0xef4444
    const markerGeo = new THREE.CylinderGeometry(3, 3, 0.5, 16)
    geometries.push(markerGeo)
    const markerMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.8,
    })
    materials.push(markerMat)
    const marker = new THREE.Mesh(markerGeo, markerMat)
    marker.position.set(spawn.position[0], 0.25, spawn.position[2])
    marker.castShadow = true
    group.add(marker)
    meshes.push(marker)

    // Direction indicator
    const arrowLength = 8
    const arrowGeo = new THREE.ConeGeometry(1.5, 4, 8)
    geometries.push(arrowGeo)
    const arrowMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.3,
    })
    materials.push(arrowMat)
    const arrow = new THREE.Mesh(arrowGeo, arrowMat)
    arrow.position.set(
      spawn.position[0] + Math.sin(spawn.facingAngle) * arrowLength,
      2,
      spawn.position[2] + Math.cos(spawn.facingAngle) * arrowLength
    )
    arrow.rotation.x = Math.PI / 2
    arrow.rotation.z = -spawn.facingAngle
    arrow.castShadow = true
    group.add(arrow)
    meshes.push(arrow)
  }

  return group
}

async function initScene() {
  if (!canvasRef.value) return

  const container = canvasRef.value.parentElement
  const width = container?.clientWidth || 300
  const height = container?.clientHeight || 200

  // Scene setup
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a202c)

  // Camera - positioned to see the whole map
  camera = new THREE.PerspectiveCamera(50, width / height, 1, 2000)
  camera.position.set(200, 150, 200)
  camera.lookAt(0, 0, 0)

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
    alpha: true,
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  const mainLight = new THREE.DirectionalLight(0xffffff, 1)
  mainLight.position.set(100, 200, 100)
  mainLight.castShadow = true
  mainLight.shadow.mapSize.width = 2048
  mainLight.shadow.mapSize.height = 2048
  mainLight.shadow.camera.left = -200
  mainLight.shadow.camera.right = 200
  mainLight.shadow.camera.top = 200
  mainLight.shadow.camera.bottom = -200
  scene.add(mainLight)

  const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3)
  fillLight.position.set(-100, 100, -100)
  scene.add(fillLight)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 0, 0)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 50
  controls.maxDistance = 500
  controls.maxPolarAngle = Math.PI / 2 - 0.1
  controls.autoRotate = autoRotate.value
  controls.autoRotateSpeed = 0.5
  controls.update()

  // Load map definition
  const mapDef = await loadMapDefinition(props.mapId)
  if (mapDef && scene) {
    mapGroup = markRaw(createMapPreview(mapDef))
    scene.add(mapGroup)

    // Adjust camera based on map size
    const maxDim = Math.max(mapDef.arena.width, mapDef.arena.depth)
    const distance = maxDim * 0.8
    camera.position.set(distance * 0.7, distance * 0.5, distance * 0.7)
    camera.lookAt(0, 0, 0)
    controls.target.set(0, 0, 0)
    controls.update()
  }

  isLoading.value = false
  emit('loaded')
  startTime = performance.now()

  // Start animation loop
  animate()
}

function animate() {
  animationFrameId = requestAnimationFrame(animate)

  if (controls) {
    controls.autoRotate = autoRotate.value
    controls.update()
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

function handleResize() {
  if (!canvasRef.value || !camera || !renderer) return

  const container = canvasRef.value.parentElement
  const width = container?.clientWidth || 300
  const height = container?.clientHeight || 200

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function toggleAutoRotate() {
  autoRotate.value = !autoRotate.value
}

function resetCamera() {
  if (camera && controls) {
    camera.position.set(200, 150, 200)
    controls.target.set(0, 0, 0)
    controls.update()
  }
}

function cleanup() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  // Dispose geometries
  for (const geo of geometries) {
    geo.dispose()
  }
  geometries.length = 0

  // Dispose materials
  for (const mat of materials) {
    mat.dispose()
  }
  materials.length = 0

  // Clear meshes array
  meshes.length = 0

  if (mapGroup && scene) {
    scene.remove(mapGroup)
  }

  if (renderer) {
    renderer.dispose()
    renderer = null
  }

  if (controls) {
    controls.dispose()
    controls = null
  }

  scene = null
  camera = null
  mapGroup = null
}

// Watch for mapId changes
watch(
  () => props.mapId,
  async (newMapId) => {
    if (!scene) return

    isLoading.value = true

    // Remove existing map
    if (mapGroup) {
      scene.remove(mapGroup)
    }

    // Clear previous resources
    for (const geo of geometries) geo.dispose()
    geometries.length = 0
    for (const mat of materials) mat.dispose()
    materials.length = 0
    meshes.length = 0

    // Load new map
    const mapDef = await loadMapDefinition(newMapId)
    if (mapDef && scene) {
      mapGroup = markRaw(createMapPreview(mapDef))
      scene.add(mapGroup)

      // Adjust camera based on map size
      if (camera && controls) {
        const maxDim = Math.max(mapDef.arena.width, mapDef.arena.depth)
        const distance = maxDim * 0.8
        camera.position.set(distance * 0.7, distance * 0.5, distance * 0.7)
        controls.target.set(0, 0, 0)
        controls.update()
      }
    }

    isLoading.value = false
    emit('loaded')
  }
)

onMounted(() => {
  initScene()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  cleanup()
})
</script>

<style scoped>
.map-preview-3d {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 180px;
  border-radius: 8px;
  overflow: hidden;
  background: #1a202c;
}

.preview-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(26, 32, 44, 0.9);
  color: #e2e8f0;
  font-size: 12px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #4a5568;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.preview-controls {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
}

.preview-controls button {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(45, 55, 72, 0.9);
  border: 1px solid #4a5568;
  border-radius: 6px;
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
}

.preview-controls button:hover {
  background: rgba(74, 85, 104, 0.9);
  border-color: #718096;
}

.preview-controls button.active {
  background: rgba(59, 130, 246, 0.3);
  border-color: #3b82f6;
  color: #3b82f6;
}

.icon-btn {
  font-size: 14px;
  line-height: 1;
}
</style>
