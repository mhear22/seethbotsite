<template>
  <div class="solar-cycle-preview" aria-label="Solar panel day and night charge cycle preview">
    <canvas ref="canvasRef" class="preview-canvas"></canvas>

    <div class="preview-overlay">
      <div class="status-pill" :class="{ day: isDaytime, night: !isDaytime }">
        {{ isDaytime ? 'Day: charging' : 'Night: discharging' }}
      </div>
      <div class="power-readout">
        {{ powerFlowLabel }}
      </div>
    </div>

    <div class="charge-meter">
      <div class="charge-header">
        <span>Battery</span>
        <span>{{ Math.round(chargePercent) }}%</span>
      </div>
      <div class="charge-track">
        <div class="charge-fill" :style="{ width: `${Math.max(4, chargePercent)}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const chargePercent = ref(38)
const sunlight = ref(0)

const isDaytime = computed(() => sunlight.value > 0.08)

const powerFlowLabel = computed(() => {
  if (isDaytime.value) {
    const watts = Math.round(1100 + sunlight.value * 2400)
    return `+${watts}W`
  }

  const watts = Math.round(450 + (1 - sunlight.value) * 500)
  return `-${watts}W`
})

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animationFrameId: number | null = null
let panelMaterials: THREE.MeshStandardMaterial[] = []
let sunLight: THREE.DirectionalLight | null = null
let moonLight: THREE.DirectionalLight | null = null
let ambientLight: THREE.AmbientLight | null = null
let sunMesh: THREE.Mesh | null = null
let moonMesh: THREE.Mesh | null = null
let batteryFillMaterial: THREE.MeshStandardMaterial | null = null
let batteryFillMesh: THREE.Mesh | null = null

const nightSky = new THREE.Color(0x0a1530)
const dawnSky = new THREE.Color(0xf08d63)
const daySky = new THREE.Color(0x90cbff)
const lowChargeColor = new THREE.Color(0xef4444)
const highChargeColor = new THREE.Color(0x22c55e)
const workingSkyColor = new THREE.Color()
const workingBatteryColor = new THREE.Color()

function createScene() {
  if (!canvasRef.value) return

  const width = canvasRef.value.clientWidth || 600
  const height = canvasRef.value.clientHeight || 240

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100)
  camera.position.set(5.2, 2.8, 5.8)
  camera.lookAt(0, 0.9, 0)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)

  ambientLight = new THREE.AmbientLight(0xffffff, 0.35)
  scene.add(ambientLight)

  sunLight = new THREE.DirectionalLight(0xfff2c4, 1.2)
  sunLight.position.set(5, 8, 4)
  scene.add(sunLight)

  moonLight = new THREE.DirectionalLight(0x8bb5ff, 0.25)
  moonLight.position.set(-5, 4, -5)
  scene.add(moonLight)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 1 })
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.02
  scene.add(ground)

  const houseBody = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 1.6, 2.7),
    new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 })
  )
  houseBody.position.y = 0.8
  scene.add(houseBody)

  const roofGroup = new THREE.Group()
  roofGroup.position.y = 1.65
  roofGroup.rotation.x = -0.42
  scene.add(roofGroup)

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.2, 3),
    new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.8 })
  )
  roofGroup.add(roof)

  panelMaterials = []
  const panelRows = 2
  const panelCols = 3

  for (let row = 0; row < panelRows; row += 1) {
    for (let col = 0; col < panelCols; col += 1) {
      const material = new THREE.MeshStandardMaterial({
        color: 0x1d4ed8,
        roughness: 0.35,
        metalness: 0.45,
        emissive: 0x60a5fa,
        emissiveIntensity: 0.15,
      })
      panelMaterials.push(material)

      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(1.08, 0.05, 0.62),
        material
      )

      panel.position.set(-1.2 + col * 1.2, 0.14, -0.5 + row * 1)
      roofGroup.add(panel)
    }
  }

  const batteryGroup = new THREE.Group()
  batteryGroup.position.set(2.8, 1.2, 0)
  scene.add(batteryGroup)

  const batteryShell = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 1.35, 0.38),
    new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4, metalness: 0.2 })
  )
  batteryGroup.add(batteryShell)

  batteryFillMaterial = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x16a34a,
    emissiveIntensity: 0.18,
  })

  batteryFillMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 1, 0.24),
    batteryFillMaterial
  )
  batteryFillMesh.position.y = -0.5 + chargePercent.value / 200
  batteryFillMesh.scale.y = chargePercent.value / 100
  batteryGroup.add(batteryFillMesh)

  const batteryCap = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.1, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.5 })
  )
  batteryCap.position.y = 0.72
  batteryGroup.add(batteryCap)

  sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xfacc15 })
  )
  scene.add(sunMesh)

  moonMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xdbeafe })
  )
  scene.add(moonMesh)
}

function handleResize() {
  if (!canvasRef.value || !renderer || !camera) return

  const width = canvasRef.value.clientWidth || 600
  const height = canvasRef.value.clientHeight || 240

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function updateBatteryVisuals() {
  if (!batteryFillMesh || !batteryFillMaterial) return

  const fill = THREE.MathUtils.clamp(chargePercent.value / 100, 0.03, 1)
  batteryFillMesh.scale.y = fill
  batteryFillMesh.position.y = -0.5 + fill / 2

  workingBatteryColor.copy(lowChargeColor).lerp(highChargeColor, fill)
  batteryFillMaterial.color.copy(workingBatteryColor)
  batteryFillMaterial.emissive.copy(workingBatteryColor)
}

function disposeScene() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  if (scene) {
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (mesh.geometry) {
        mesh.geometry.dispose()
      }

      const material = mesh.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(material)) {
        material.forEach((m) => m.dispose())
      } else if (material) {
        material.dispose()
      }
    })
  }

  panelMaterials = []
  sunLight = null
  moonLight = null
  ambientLight = null
  sunMesh = null
  moonMesh = null
  batteryFillMaterial = null
  batteryFillMesh = null

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

    sunLight.intensity = 0.2 + dayFactor * 1.3
    moonLight.intensity = 0.15 + (1 - dayFactor) * 0.5
    ambientLight.intensity = 0.2 + twilightFactor * 0.45

    if (dayFactor > 0.06) {
      chargePercent.value = Math.min(100, chargePercent.value + (2.8 + dayFactor * 6.2) * delta)
    } else {
      chargePercent.value = Math.max(4, chargePercent.value - 6.8 * delta)
    }

    updateBatteryVisuals()

    workingSkyColor.copy(nightSky).lerp(dawnSky, twilightFactor).lerp(daySky, dayFactor)
    renderer.setClearColor(workingSkyColor)

    const panelGlow = 0.1 + dayFactor * 0.9
    panelMaterials.forEach((material) => {
      material.emissiveIntensity = panelGlow
    })

    renderer.render(scene, camera)
    animationFrameId = requestAnimationFrame(animate)
  }

  animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
  createScene()
  handleResize()
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
  height: 240px;
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
  justify-content: space-between;
  gap: 8px;
  pointer-events: none;
}

.status-pill,
.power-readout {
  background: rgba(15, 23, 42, 0.72);
  color: #e2e8f0;
  font-size: 0.78rem;
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
    height: 210px;
  }

  .status-pill,
  .power-readout {
    font-size: 0.7rem;
    padding: 5px 8px;
  }
}
</style>
