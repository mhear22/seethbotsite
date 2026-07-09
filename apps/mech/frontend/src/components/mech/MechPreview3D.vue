<template>
  <div class="mech-preview-3d">
    <canvas ref="canvasRef" class="preview-canvas"></canvas>
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span>Loading model...</span>
    </div>
    <div class="preview-controls">
      <button @click="toggleAutoRotate" :class="{ active: autoRotate }" title="Toggle auto-rotate">
        <MechIcons icon="speed" :size="20" />
      </button>
      <button @click="resetCamera" title="Reset view">
        <MechIcons icon="target" :size="20" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, markRaw } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { getMechModelLoader } from '../../lib/battle/MechModelLoader'
import { buildProceduralMechGroup, disposeMechGroup } from '../../lib/battle/mechThumbnail'
import type { MechLoadout } from '../../shared/types/MechTypes'
import MechIcons from './MechIcons.vue'

const props = defineProps<{
  loadout: MechLoadout
  teamColor?: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const isLoading = ref(true)
const autoRotate = ref(true)

// Three.js objects
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let controls: OrbitControls | null = null
let mechGroup: THREE.Group | null = null
let animationFrameId: number | null = null

// Default team color (blue)
const TEAM_COLOR = props.teamColor ?? 0x3b82f6

async function loadModelsAsync() {
  if (!mechGroup) return

  try {
    const loader = getMechModelLoader()
    const modelGroup = await loader.assembleMech(props.loadout, TEAM_COLOR)

    // Replace procedural with loaded model
    if (mechGroup && scene) {
      scene.remove(mechGroup)
      disposeMechGroup(mechGroup)
      mechGroup = markRaw(modelGroup)
      scene.add(mechGroup)
    }
  } catch (error) {
    console.warn('Failed to load models, using procedural preview:', error)
  } finally {
    isLoading.value = false
  }
}

function initScene() {
  if (!canvasRef.value) return

  const container = canvasRef.value.parentElement
  const width = container?.clientWidth || 400
  const height = container?.clientHeight || 400

  // Scene setup
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a202c) // Dark background

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.set(8, 5, 8)
  camera.lookAt(0, 2, 0)

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
  mainLight.position.set(10, 20, 10)
  mainLight.castShadow = true
  mainLight.shadow.mapSize.width = 1024
  mainLight.shadow.mapSize.height = 1024
  scene.add(mainLight)

  const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3)
  fillLight.position.set(-10, 10, -10)
  scene.add(fillLight)

  const rimLight = new THREE.DirectionalLight(0xff8844, 0.2)
  rimLight.position.set(0, 5, -15)
  scene.add(rimLight)

  // Ground plane (subtle grid)
  const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x333333)
  gridHelper.position.y = -0.01
  scene.add(gridHelper)

  // Ground plane for shadows
  const groundGeometry = new THREE.PlaneGeometry(30, 30)
  const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 2, 0)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 5
  controls.maxDistance = 20
  controls.maxPolarAngle = Math.PI / 2 + 0.3
  controls.autoRotate = autoRotate.value
  controls.autoRotateSpeed = 1.5
  controls.update()

  // Create procedural preview first (fast)
  mechGroup = markRaw(buildProceduralMechGroup(props.loadout, TEAM_COLOR))
  scene.add(mechGroup)

  // Start async model loading
  loadModelsAsync()

  // Start animation loop
  animate()
}

function animate() {
  // Pause the render loop while the tab is hidden; visibilitychange resumes it.
  if (document.hidden) {
    animationFrameId = null
    return
  }
  animationFrameId = requestAnimationFrame(animate)

  if (controls) {
    controls.autoRotate = autoRotate.value
    controls.update()
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

function handleVisibilityChange() {
  if (!document.hidden && animationFrameId === null && renderer) {
    animate()
  }
}

function handleResize() {
  if (!canvasRef.value || !camera || !renderer) return

  const container = canvasRef.value.parentElement
  const width = container?.clientWidth || 400
  const height = container?.clientHeight || 400

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function toggleAutoRotate() {
  autoRotate.value = !autoRotate.value
}

function resetCamera() {
  if (camera && controls) {
    camera.position.set(8, 5, 8)
    controls.target.set(0, 2, 0)
    controls.update()
  }
}

function cleanup() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  if (mechGroup) {
    disposeMechGroup(mechGroup)
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
  mechGroup = null
}

// Watch for loadout changes
watch(
  () => props.loadout,
  async () => {
    if (!scene) return

    isLoading.value = true

    // Remove existing mech
    if (mechGroup) {
      scene.remove(mechGroup)
      disposeMechGroup(mechGroup)
    }

    // Create new procedural preview
    mechGroup = markRaw(buildProceduralMechGroup(props.loadout, TEAM_COLOR))
    scene.add(mechGroup)

    // Load models async
    await loadModelsAsync()
  },
  { deep: true }
)

onMounted(() => {
  initScene()
  window.addEventListener('resize', handleResize)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  cleanup()
})
</script>

<style scoped>
.mech-preview-3d {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
  border-radius: 12px;
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
  gap: 12px;
  background: rgba(26, 32, 44, 0.8);
  color: #e2e8f0;
  font-size: 14px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #4a5568;
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
  bottom: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
}

.preview-controls button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(45, 55, 72, 0.9);
  border: 1px solid #4a5568;
  border-radius: 8px;
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
</style>
