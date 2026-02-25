<template>
  <div class="solar-cycle-preview" aria-label="Solar panel day and night charge cycle preview">
    <canvas ref="canvasRef" class="preview-canvas"></canvas>

    <div class="preview-overlay">
      <div class="status-pill" :class="{ day: isDaytime, night: !isDaytime }">
        {{ isDaytime ? 'Day: charging' : 'Night: discharging' }}
      </div>
      <div class="power-readout">{{ powerFlowLabel }}</div>
      <div class="bank-readout">{{ batteryBankLabel }}</div>
    </div>

    <div class="charge-meter">
      <div class="charge-header">
        <span>Battery Bank</span>
        <span>{{ Math.round(chargePercent) }}%</span>
      </div>
      <div class="charge-track">
        <div class="charge-fill" :style="{ width: `${Math.max(4, chargePercent)}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import * as THREE from 'three'
import type { Panel, Point } from '../../../composables/useSolarCalculator'

interface PreviewProps {
  roofVertices?: Point[]
  panelLayout?: Panel[]
  batteryCount?: number
}

const props = withDefaults(defineProps<PreviewProps>(), {
  roofVertices: () => [],
  panelLayout: () => [],
  batteryCount: 0,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const chargePercent = ref(38)
const sunlight = ref(0)

const roofPanelCount = computed(() => props.panelLayout.length)
const batteryUnits = computed(() => Math.max(0, Math.floor(props.batteryCount ?? 0)))
const isDaytime = computed(() => sunlight.value > 0.08)

const batteryBankLabel = computed(() => `${batteryUnits.value} battery unit${batteryUnits.value === 1 ? '' : 's'}`)

const powerFlowLabel = computed(() => {
  if (isDaytime.value) {
    const watts = Math.round(900 + sunlight.value * 2000 + roofPanelCount.value * 24)
    return `+${watts}W`
  }

  const watts = Math.round(350 + (1 - sunlight.value) * 420 + batteryUnits.value * 28)
  return `-${watts}W`
})

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animationFrameId: number | null = null

let panelMaterials: THREE.MeshStandardMaterial[] = []
let batteryFillMaterials: THREE.MeshStandardMaterial[] = []
let batteryFillMeshes: THREE.Mesh[] = []

let sunLight: THREE.PointLight | null = null
let moonLight: THREE.DirectionalLight | null = null
let ambientLight: THREE.AmbientLight | null = null
let sunMesh: THREE.Mesh | null = null
let moonMesh: THREE.Mesh | null = null

let structureGroup: THREE.Group | null = null
let batteryGroup: THREE.Group | null = null
let treeGroup: THREE.Group | null = null

let modelRadius = 2.2

const nightSky = new THREE.Color(0x0a1530)
const dawnSky = new THREE.Color(0xf08d63)
const daySky = new THREE.Color(0x90cbff)
const lowChargeColor = new THREE.Color(0xef4444)
const highChargeColor = new THREE.Color(0x22c55e)
const workingSkyColor = new THREE.Color()
const workingBatteryColor = new THREE.Color()

const fallbackRoof: Point[] = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 8 },
  { x: 0, y: 8 },
]

interface RoofLayout {
  shape: THREE.Shape
  centerX: number
  centerY: number
  scale: number
  radius: number
  points: THREE.Vector2[]
}

function disposeObject3D(object: THREE.Object3D) {
  const disposeMaterial = (material: THREE.Material) => {
    const textureFields = material as THREE.Material & {
      map?: THREE.Texture | null
      alphaMap?: THREE.Texture | null
      emissiveMap?: THREE.Texture | null
      aoMap?: THREE.Texture | null
      roughnessMap?: THREE.Texture | null
      metalnessMap?: THREE.Texture | null
      normalMap?: THREE.Texture | null
    }

    const maps = [
      textureFields.map,
      textureFields.alphaMap,
      textureFields.emissiveMap,
      textureFields.aoMap,
      textureFields.roughnessMap,
      textureFields.metalnessMap,
      textureFields.normalMap,
    ]
    maps.forEach((map) => map?.dispose())
    material.dispose()
  }

  object.traverse((child) => {
    const mesh = child as THREE.Mesh

    if (mesh.geometry) {
      mesh.geometry.dispose()
    }

    const material = mesh.material as THREE.Material | THREE.Material[] | undefined
    if (Array.isArray(material)) {
      material.forEach((item) => disposeMaterial(item))
    } else if (material) {
      disposeMaterial(material)
    }
  })
}

function createTreeTexture(seed: number): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 192
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return new THREE.Texture()
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const wobble = (Math.sin(seed * 8.91) + 1) * 0.5

  ctx.fillStyle = '#5b3b2a'
  ctx.beginPath()
  ctx.roundRect(84 + wobble * 8, 158, 24, 80, 8)
  ctx.fill()

  const canopyBaseY = 124 - wobble * 10
  const canopyColors = ['#2f8f46', '#3ca85a', '#2c7a3d']
  canopyColors.forEach((color, index) => {
    const radius = 56 - index * 11
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(96 + (index - 1) * 16 + wobble * 6, canopyBaseY + index * 12, radius, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.beginPath()
  ctx.arc(78 + wobble * 6, canopyBaseY - 10, 22, 0, Math.PI * 2)
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function buildTreeBillboards() {
  if (!scene) return

  if (treeGroup) {
    scene.remove(treeGroup)
    disposeObject3D(treeGroup)
  }

  treeGroup = new THREE.Group()
  scene.add(treeGroup)

  const treeCount = 16
  const ringRadius = Math.max(42, modelRadius + 30)

  for (let index = 0; index < treeCount; index += 1) {
    const angle = (index / treeCount) * Math.PI * 2
    const jitter = Math.sin(index * 9.73) * 0.7
    const radius = ringRadius + jitter
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius

    const texture = createTreeTexture(index * 0.37 + 0.2)
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      alphaTest: 0.12,
    })

    const sprite = new THREE.Sprite(material)
    const height = 5 + (Math.sin(index * 4.2) + 1) * 0.65
    const width = height * 0.72
    sprite.position.set(x, height * 0.5 - 0.02, z)
    sprite.scale.set(width, height, 1)
    treeGroup.add(sprite)
  }
}

function buildRoofLayout(): RoofLayout {
  const sourceVertices = props.roofVertices.length >= 3 ? props.roofVertices : fallbackRoof

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  sourceVertices.forEach((point) => {
    minX = Math.min(minX, point.x)
    minY = Math.min(minY, point.y)
    maxX = Math.max(maxX, point.x)
    maxY = Math.max(maxY, point.y)
  })

  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const maxDimension = Math.max(maxX - minX, maxY - minY, 1)
  const scale = 4.6 / maxDimension

  const points = sourceVertices.map((point) =>
    new THREE.Vector2((point.x - centerX) * scale, (point.y - centerY) * scale)
  )

  const shape = new THREE.Shape()
  shape.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i += 1) {
    shape.lineTo(points[i].x, points[i].y)
  }
  shape.closePath()

  const radius = points.reduce((max, point) => {
    const distance = Math.sqrt(point.x * point.x + point.y * point.y)
    return Math.max(max, distance)
  }, 1)

  return {
    shape,
    centerX,
    centerY,
    scale,
    radius,
    points,
  }
}

function buildStructure() {
  if (!scene) return

  if (structureGroup) {
    scene.remove(structureGroup)
    disposeObject3D(structureGroup)
  }

  structureGroup = new THREE.Group()
  scene.add(structureGroup)

  const layout = buildRoofLayout()
  modelRadius = Math.max(1.8, layout.radius)

  const wallHeight = 1.35
  const roofTop = wallHeight + 0.02

  const wallGeometry = new THREE.ExtrudeGeometry(layout.shape, {
    depth: wallHeight,
    bevelEnabled: false,
    curveSegments: 18,
  })
  wallGeometry.rotateX(-Math.PI / 2)

  const walls = new THREE.Mesh(
    wallGeometry,
    new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 })
  )
  walls.castShadow = true
  walls.receiveShadow = true
  structureGroup.add(walls)

  const roofGeometry = new THREE.ShapeGeometry(layout.shape)
  roofGeometry.rotateX(-Math.PI / 2)

  const roof = new THREE.Mesh(
    roofGeometry,
    new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.7, metalness: 0.1 })
  )
  roof.position.y = roofTop
  roof.castShadow = true
  roof.receiveShadow = true
  structureGroup.add(roof)

  const outlinePoints = [...layout.points, layout.points[0]].map((point) => new THREE.Vector3(point.x, roofTop + 0.01, -point.y))
  const roofOutline = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(outlinePoints),
    new THREE.LineBasicMaterial({ color: 0x9ca3af })
  )
  structureGroup.add(roofOutline)

  panelMaterials = []
  const panels = props.panelLayout.slice(0, 320)

  panels.forEach((panel) => {
    const material = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.32,
      metalness: 0.48,
      emissive: 0x60a5fa,
      emissiveIntensity: 0.15,
    })

    const panelWidth = Math.max(0.08, panel.width * layout.scale * 0.9)
    const panelDepth = Math.max(0.08, panel.height * layout.scale * 0.9)

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(panelWidth, 0.04, panelDepth),
      material
    )

    mesh.position.set(
      ((panel.x + panel.width / 2) - layout.centerX) * layout.scale,
      roofTop + 0.03,
      -((panel.y + panel.height / 2) - layout.centerY) * layout.scale
    )
    mesh.castShadow = true
    mesh.receiveShadow = true

    panelMaterials.push(material)
    structureGroup?.add(mesh)
  })

  const ground = scene.getObjectByName('solar-preview-ground')
  if (ground) {
    const groundScale = Math.max(380, modelRadius + 80)
    ground.scale.set(groundScale, 1, groundScale)
  }

  const horizon = scene.getObjectByName('solar-preview-horizon')
  if (horizon) {
    const horizonScale = Math.max(390, modelRadius + 90)
    horizon.scale.set(horizonScale, 1, horizonScale)
  }

  buildTreeBillboards()
}

function buildBatteryBank() {
  if (!scene) return

  if (batteryGroup) {
    scene.remove(batteryGroup)
    disposeObject3D(batteryGroup)
  }

  batteryFillMaterials = []
  batteryFillMeshes = []

  batteryGroup = new THREE.Group()
  batteryGroup.position.set(modelRadius + 1.15, 0.42, 0)
  scene.add(batteryGroup)

  const count = Math.max(0, Math.floor(props.batteryCount ?? 0))
  const displayCount = Math.min(count, 42)
  if (displayCount === 0) return

  const columns = Math.min(7, Math.max(2, Math.ceil(Math.sqrt(displayCount))))
  const rows = Math.ceil(displayCount / columns)
  const spacingX = 0.34
  const spacingZ = 0.3

  for (let index = 0; index < displayCount; index += 1) {
    const row = Math.floor(index / columns)
    const col = index % columns

    const x = (col - (columns - 1) / 2) * spacingX
    const z = (row - (rows - 1) / 2) * spacingZ

    const unit = new THREE.Group()
    unit.position.set(x, 0, z)

    const shell = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.72, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.42, metalness: 0.2 })
    )
    shell.castShadow = true
    shell.receiveShadow = true
    unit.add(shell)

    const fillMaterial = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x16a34a,
      emissiveIntensity: 0.2,
    })

    const fillMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.56, 0.1),
      fillMaterial
    )
    fillMesh.castShadow = true
    fillMesh.receiveShadow = true

    unit.add(fillMesh)
    batteryFillMaterials.push(fillMaterial)
    batteryFillMeshes.push(fillMesh)

    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.06, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.55 })
    )
    cap.position.y = 0.39
    cap.castShadow = true
    cap.receiveShadow = true
    unit.add(cap)

    batteryGroup.add(unit)
  }

  updateBatteryVisuals()
}

function createScene() {
  if (!canvasRef.value) return

  const width = canvasRef.value.clientWidth || 700
  const height = canvasRef.value.clientHeight || 260

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100)
  camera.position.set(6.4, 3.2, 6.8)
  camera.lookAt(0, 1, 0)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  ambientLight = new THREE.AmbientLight(0xffffff, 0.35)
  scene.add(ambientLight)

  sunLight = new THREE.PointLight(0xfff2c4, 1.9, 60, 1.3)
  sunLight.castShadow = true
  sunLight.shadow.mapSize.width = 1024
  sunLight.shadow.mapSize.height = 1024
  sunLight.shadow.camera.near = 0.4
  sunLight.shadow.camera.far = 60
  sunLight.shadow.bias = -0.0008
  scene.add(sunLight)

  moonLight = new THREE.DirectionalLight(0x8bb5ff, 0.25)
  scene.add(moonLight)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 1 })
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -1000
  ground.name = 'solar-preview-ground'
  ground.receiveShadow = true
  scene.add(ground)

  // Distant ring to establish a visible ground horizon.
  const horizon = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 0.85, 72, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x2b3f5f,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide,
    })
  )
  horizon.name = 'solar-preview-horizon'
  horizon.position.y = 0.38
  scene.add(horizon)

  sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xfacc15 })
  )
  scene.add(sunMesh)

  moonMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xdbeafe })
  )
  scene.add(moonMesh)

  buildStructure()
  buildBatteryBank()
}

function handleResize() {
  if (!canvasRef.value || !renderer || !camera) return

  const width = canvasRef.value.clientWidth || 700
  const height = canvasRef.value.clientHeight || 260

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function syncEnvironmentToCamera() {
  if (!scene || !camera) return

  const ground = scene.getObjectByName('solar-preview-ground')
  if (ground) {
    ground.position.x = camera.position.x
    ground.position.z = camera.position.z
  }

  const horizon = scene.getObjectByName('solar-preview-horizon')
  if (horizon) {
    horizon.position.x = camera.position.x
    horizon.position.z = camera.position.z
  }

  if (treeGroup) {
    treeGroup.position.x = camera.position.x
    treeGroup.position.z = camera.position.z
  }
}

function updateBatteryVisuals() {
  const fillLevel = THREE.MathUtils.clamp(chargePercent.value / 100, 0.03, 1)

  workingBatteryColor.copy(lowChargeColor).lerp(highChargeColor, fillLevel)

  for (let index = 0; index < batteryFillMeshes.length; index += 1) {
    const mesh = batteryFillMeshes[index]
    const material = batteryFillMaterials[index]

    mesh.scale.y = fillLevel
    mesh.position.y = -0.28 + (0.56 * fillLevel) / 2

    material.color.copy(workingBatteryColor)
    material.emissive.copy(workingBatteryColor)
  }
}

function disposeScene() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  if (scene) {
    disposeObject3D(scene)
  }

  panelMaterials = []
  batteryFillMaterials = []
  batteryFillMeshes = []
  sunLight = null
  moonLight = null
  ambientLight = null
  sunMesh = null
  moonMesh = null
  structureGroup = null
  batteryGroup = null
  treeGroup = null

  if (renderer) {
    renderer.dispose()
    renderer = null
  }

  scene = null
  camera = null
}

function startAnimation() {
  if (!renderer || !scene || !camera || !sunLight || !moonLight || !ambientLight || !sunMesh || !moonMesh) return

  const cycleSeconds = 22
  const orbitRadius = 8
  let previousTime = performance.now()

  const animate = (time: number) => {
    const delta = Math.min(0.05, (time - previousTime) / 1000)
    previousTime = time

    const cycle = (time / 1000) / cycleSeconds
    const angle = cycle * Math.PI * 2
    const sunHeight = Math.sin(angle)
    const dayFactor = THREE.MathUtils.clamp(sunHeight, 0, 1)
    const twilightFactor = THREE.MathUtils.clamp((sunHeight + 0.22) / 0.45, 0, 1)

    sunlight.value = dayFactor

    const sunX = Math.cos(angle) * orbitRadius
    const sunY = 2 + sunHeight * 5
    sunMesh.position.set(sunX, sunY, 0)
    sunLight.position.copy(sunMesh.position)

    const moonX = Math.cos(angle + Math.PI) * orbitRadius
    const moonY = 2 + Math.sin(angle + Math.PI) * 5
    moonMesh.position.set(moonX, moonY, 0)
    moonLight.position.copy(moonMesh.position)

    sunLight.intensity = 0.06 + dayFactor * 2.2
    moonLight.intensity = 0.15 + (1 - dayFactor) * 0.5
    ambientLight.intensity = 0.2 + twilightFactor * 0.45

    const batteryInertia = Math.max(1, Math.sqrt(Math.max(1, batteryUnits.value)))

    if (dayFactor > 0.06) {
      chargePercent.value = Math.min(100, chargePercent.value + ((2.8 + dayFactor * 6.2) * delta) / batteryInertia)
    } else {
      chargePercent.value = Math.max(4, chargePercent.value - ((6.8 - dayFactor * 1.2) * delta) / batteryInertia)
    }

    updateBatteryVisuals()

    workingSkyColor.copy(nightSky).lerp(dawnSky, twilightFactor).lerp(daySky, dayFactor)
    renderer.setClearColor(workingSkyColor)

    const panelGlow = 0.1 + dayFactor * 0.9
    panelMaterials.forEach((material) => {
      material.emissiveIntensity = panelGlow
    })

    if (structureGroup) {
      structureGroup.rotation.y += 0.08 * delta
    }

    if (batteryGroup) {
      batteryGroup.rotation.y += 0.1 * delta
    }

    syncEnvironmentToCamera()
    renderer.render(scene, camera)
    animationFrameId = requestAnimationFrame(animate)
  }

  animationFrameId = requestAnimationFrame(animate)
}

watch([() => props.roofVertices, () => props.panelLayout], () => {
  buildStructure()
  buildBatteryBank()
}, { deep: true })

watch(() => props.batteryCount, () => {
  buildBatteryBank()
})

onMounted(() => {
  createScene()
  handleResize()
  syncEnvironmentToCamera()
  startAnimation()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  disposeScene()
})
</script>

<style scoped>
.solar-cycle-preview {
  position: relative;
  width: 100%;
  height: 260px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: #0f172a;
}

.preview-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.preview-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  pointer-events: none;
}

.status-pill,
.power-readout,
.bank-readout {
  background: rgba(15, 23, 42, 0.72);
  color: #e2e8f0;
  font-size: 0.76rem;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.45);
  font-weight: 600;
  letter-spacing: 0.01em;
}

.status-pill.day {
  border-color: rgba(250, 204, 21, 0.7);
}

.status-pill.night {
  border-color: rgba(125, 211, 252, 0.7);
}

.charge-meter {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.74);
  border: 1px solid rgba(148, 163, 184, 0.45);
  color: #e2e8f0;
}

.charge-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-bottom: 6px;
  font-weight: 600;
}

.charge-track {
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(148, 163, 184, 0.3);
}

.charge-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #f97316, #facc15, #22c55e);
  transition: width 0.2s linear;
}

@media (max-width: 600px) {
  .solar-cycle-preview {
    height: 220px;
  }

  .status-pill,
  .power-readout,
  .bank-readout {
    font-size: 0.7rem;
    padding: 5px 8px;
  }
}
</style>
