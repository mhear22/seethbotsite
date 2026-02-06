<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { statsRepository } from '../../repositories/stats.repository'

const container = ref<HTMLElement | null>(null)
const gameActive = ref(false)
const score = ref(0)
const caughtFish = ref<string[]>([])
const scene = ref<THREE.Scene | null>(null)
const camera = ref<THREE.PerspectiveCamera | null>(null)
const renderer = ref<THREE.WebGLRenderer | null>(null)
let animationId: number | null = null

// User ID for tracking
const userId = ref('')
let lastRecordedScore = 0

const getOrCreateUserId = (): string => {
  let id = localStorage.getItem('stats-user-id')
  if (!id) {
    id = 'user_' + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('stats-user-id', id)
  }
  return id
}

// Record fish caught stat
const recordFishCaught = async (fishName: string, points: number) => {
  try {
    await statsRepository.recordStat({
      userId: userId.value,
      userName: localStorage.getItem('user-name') || undefined,
      gameType: 'fishing',
      statType: 'fish_caught',
      value: 1,
      metadata: {
        fishName,
        points,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error recording fish caught:', error)
  }
}

// Update high score for fishing
const updateHighScore = async () => {
  if (score.value > lastRecordedScore) {
    try {
      await statsRepository.updateHighScore({
        userId: userId.value,
        userName: localStorage.getItem('user-name') || undefined,
        gameType: 'fishing',
        score: score.value,
        details: {
          fishCaught: caughtFish.value.length,
          timestamp: new Date().toISOString()
        }
      })
      lastRecordedScore = score.value
    } catch (error) {
      console.error('Error updating high score:', error)
    }
  }
}

let hook: THREE.Mesh | null = null
let fishingLine: THREE.Line | null = null
let fishes: THREE.Mesh[] = []
let fishVelocities: { x: number; z: number }[] = []

const fishTypes = [
  { color: 0xff6b6b, name: 'Red Snapper', points: 10, size: 1 },
  { color: 0x4ecdc4, name: 'Coral Fish', points: 15, size: 0.9 },
  { color: 0xffe66d, name: 'Golden Fish', points: 20, size: 1.1 },
  { color: 0x95e1d3, name: 'Jellyfish', points: 25, size: 1.2 },
  { color: 0xdda0dd, name: 'Tropical Fish', points: 30, size: 0.8 },
  { color: 0xff4757, name: 'Clownfish', points: 35, size: 0.7 },
  { color: 0x2ed573, name: 'Angelfish', points: 40, size: 1.3 },
  { color: 0x3742fa, name: 'Blue Tang', points: 45, size: 0.9 },
  { color: 0xff6348, name: 'Salmon', points: 50, size: 1.4 },
  { color: 0xffd700, name: 'Legendary Goldfish', points: 100, size: 0.6, rare: true }
]

const initThreeJS = () => {
  if (!container.value) return

  // Scene
  scene.value = new THREE.Scene()
  scene.value.background = new THREE.Color(0x0077be)
  scene.value.fog = new THREE.Fog(0x0077be, 10, 50)

  // Camera
  camera.value = new THREE.PerspectiveCamera(75, container.value.clientWidth / container.value.clientHeight, 0.1, 1000)
  camera.value.position.set(0, 5, 10)
  camera.value.lookAt(0, 0, 0)

  // Renderer
  renderer.value = new THREE.WebGLRenderer({ antialias: true })
  renderer.value.setSize(container.value.clientWidth, container.value.clientHeight)
  renderer.value.setPixelRatio(window.devicePixelRatio)
  container.value.appendChild(renderer.value.domElement)

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.value.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 10, 5)
  scene.value.add(directionalLight)

  // Water surface
  const waterGeometry = new THREE.PlaneGeometry(50, 50, 32, 32)
  const waterMaterial = new THREE.MeshPhongMaterial({
    color: 0x006994,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide
  })
  const water = new THREE.Mesh(waterGeometry, waterMaterial)
  water.rotation.x = -Math.PI / 2
  water.position.y = -0.5
  scene.value.add(water)

  // Fishing line
  createFishingLine()

  // Create fishes
  for (let i = 0; i < 8; i++) {
    createFish()
  }

  // Handle resize
  window.addEventListener('resize', onWindowResize)
}

const createFishingLine = () => {
  if (!scene.value) return

  // Hook
  const hookGeometry = new THREE.TorusGeometry(0.2, 0.05, 8, 16)
  const hookMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 })
  hook = new THREE.Mesh(hookGeometry, hookMaterial)
  hook.position.set(0, 2, 0)
  scene.value.add(hook)

  // Fishing line (visual only)
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 5, 0),
    hook.position
  ])
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 2 })
  fishingLine = new THREE.Line(lineGeometry, lineMaterial)
  scene.value.add(fishingLine)
}

const createFish = () => {
  if (!scene.value) return

  // Select fish type based on rarity
  let fishType
  const rand = Math.random()
  if (rand > 0.95) {
    // 5% chance for rare fish
    const rareFishes = fishTypes.filter(f => f.rare)
    fishType = rareFishes[Math.floor(Math.random() * rareFishes.length)]
  } else {
    // 95% chance for regular fish
    const regularFishes = fishTypes.filter(f => !f.rare)
    fishType = regularFishes[Math.floor(Math.random() * regularFishes.length)]
  }

  // Fish body
  const fishGroup = new THREE.Group()
  const bodyGeometry = new THREE.ConeGeometry(0.3 * fishType.size, 1 * fishType.size, 8)
  bodyGeometry.rotateZ(Math.PI / 2)
  const bodyMaterial = new THREE.MeshPhongMaterial({ color: fishType.color })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  fishGroup.add(body)

  // Fish tail
  const tailGeometry = new THREE.ConeGeometry(0.2 * fishType.size, 0.3 * fishType.size, 4)
  tailGeometry.rotateZ(-Math.PI / 2)
  const tail = new THREE.Mesh(tailGeometry, bodyMaterial)
  tail.position.x = -0.6 * fishType.size
  fishGroup.add(tail)

  // Add eyes for better fish
  const eyeGeometry = new THREE.SphereGeometry(0.05 * fishType.size, 8, 8)
  const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 })
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
  leftEye.position.set(0.5 * fishType.size, 0.1 * fishType.size, 0.15 * fishType.size)
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
  rightEye.position.set(0.5 * fishType.size, 0.1 * fishType.size, -0.15 * fishType.size)
  fishGroup.add(leftEye)
  fishGroup.add(rightEye)

  // Add fin for better fish
  const finGeometry = new THREE.ConeGeometry(0.1 * fishType.size, 0.3 * fishType.size, 4)
  const fin = new THREE.Mesh(finGeometry, bodyMaterial)
  fin.position.set(0, 0.2 * fishType.size, 0)
  fin.rotation.x = Math.PI / 4
  fishGroup.add(fin)

  // Position fish
  fishGroup.position.set(
    (Math.random() - 0.5) * 20,
    -2 - Math.random() * 3,
    (Math.random() - 0.5) * 15
  )
  fishGroup.rotation.y = Math.random() * Math.PI * 2

  // Store fish type as userData
  fishGroup.userData = { ...fishType, id: fishes.length }

  scene.value.add(fishGroup)
  fishes.push(fishGroup)
  fishVelocities.push({
    x: (Math.random() - 0.5) * 0.02,
    z: (Math.random() - 0.5) * 0.02
  })
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  if (!scene.value || !camera.value || !renderer.value || !hook) return

  // Animate fishes
  fishes.forEach((fish, index) => {
    fish.position.x += fishVelocities[index].x
    fish.position.z += fishVelocities[index].z

    // Bounce off walls
    if (Math.abs(fish.position.x) > 10) fishVelocities[index].x *= -1
    if (Math.abs(fish.position.z) > 8) fishVelocities[index].z *= -1

    // Swim animation
    fish.rotation.z = Math.sin(Date.now() * 0.005 + index) * 0.2
  })

  // Update fishing line
  if (fishingLine) {
    const positions = (fishingLine.geometry as THREE.BufferGeometry).attributes.position.array as Float32Array
    positions[3] = hook.position.x
    positions[4] = hook.position.y
    positions[5] = hook.position.z
    (fishingLine.geometry as THREE.BufferGeometry).attributes.position.needsUpdate = true
  }

  renderer.value.render(scene.value, camera.value)
}

const castLine = () => {
  if (!hook || !gameActive.value) return

  gameActive.value = true

  // Animate hook going down
  const startY = hook.position.y
  const targetY = -4
  let progress = 0

  const dropHook = () => {
    progress += 0.05
    hook.position.y = startY - (startY - targetY) * progress

    // Check for fish collision (dynamic based on fish size)
    const caughtIndex = fishes.findIndex(fish => {
      const distance = hook.position.distanceTo(fish.position)
      const catchRadius = 0.6 + (fish.userData.size * 0.3)
      return distance < catchRadius
    })

    if (caughtIndex !== -1) {
      // Caught a fish!
      const caughtFishItem = fishes[caughtIndex]
      score.value += caughtFishItem.userData.points
      caughtFish.value.push(caughtFishItem.userData.name)

      // Record the fish caught stat
      recordFishCaught(caughtFishItem.userData.name, caughtFishItem.userData.points)

      // Update high score
      updateHighScore()

      // Remove fish from scene
      scene.value?.remove(caughtFishItem)
      fishes.splice(caughtIndex, 1)
      fishVelocities.splice(caughtIndex, 1)

      // Create new fish after delay
      setTimeout(() => createFish(), 2000)

      // Reel in
      reelIn(startY)
      return
    }

    if (progress < 1) {
      requestAnimationFrame(dropHook)
    } else {
      // Missed, reel back up
      reelIn(startY)
    }
  }

  dropHook()
}

const reelIn = (targetY: number) => {
  if (!hook) return

  let progress = 0
  const startY = hook.position.y

  const pullUp = () => {
    progress += 0.08
    hook.position.y = startY + (targetY - startY) * progress

    if (progress < 1) {
      requestAnimationFrame(pullUp)
    } else {
      gameActive.value = false
    }
  }

  pullUp()
}

const onWindowResize = () => {
  if (!camera.value || !renderer.value || !container.value) return

  camera.value.aspect = container.value.clientWidth / container.value.clientHeight
  camera.value.updateProjectionMatrix()
  renderer.value.setSize(container.value.clientWidth, container.value.clientHeight)
}

const startGame = () => {
  if (!gameActive.value) {
    castLine()
  }
}

onMounted(() => {
  // Initialize user ID
  userId.value = getOrCreateUserId()

  initThreeJS()
  animate()
})

onUnmounted(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', onWindowResize)
  renderer.value?.dispose()

  // Update final high score before unmount
  updateHighScore()
})
</script>

<template>
  <div class="fishing-page">
    <div class="fishing-header">
      <h1>🎣 Fishing Mini Game</h1>
      <div class="score-display">
        <span class="score-label">Score:</span>
        <span class="score-value">{{ score }}</span>
      </div>
    </div>

    <div class="fishing-container">
      <div ref="container" class="game-container"></div>
      <div class="game-controls">
        <button
          @click="startGame"
          :disabled="gameActive"
          class="cast-button"
          :class="{ active: gameActive }"
        >
          {{ gameActive ? '🎣 Fishing...' : '🎣 Cast Line' }}
        </button>
      </div>
    </div>

    <div class="caught-fish">
      <h2>Caught Fish 🐟</h2>
      <div v-if="caughtFish.length === 0" class="empty-catch">
        No fish caught yet. Cast your line!
      </div>
      <div v-else class="fish-list">
        <div v-for="(fish, index) in caughtFish" :key="index" class="fish-item">
          🐟 {{ fish }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fishing-page {
  min-height: 100vh;
  padding: 100px 20px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.fishing-header {
  text-align: center;
  margin-bottom: 30px;
}

.fishing-header h1 {
  font-size: 2.5rem;
  margin: 0 0 20px 0;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.score-display {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 10px 20px;
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.score-label {
  font-size: 1.2rem;
  color: white;
  font-weight: 600;
}

.score-value {
  font-size: 1.8rem;
  color: #ffe66d;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.fishing-container {
  max-width: 800px;
  margin: 0 auto 30px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.game-container {
  width: 100%;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  background: #0077be;
}

.game-controls {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.cast-button {
  padding: 16px 40px;
  font-size: 1.3rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.cast-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.cast-button:active:not(:disabled) {
  transform: translateY(0);
}

.cast-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cast-button.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.caught-fish {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.caught-fish h2 {
  margin: 0 0 15px 0;
  color: white;
  text-align: center;
  font-size: 1.5rem;
}

.empty-catch {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
  padding: 20px;
}

.fish-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.fish-item {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Dark mode support */
.dark .fishing-page {
  background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
}

.dark .fishing-container,
.dark .caught-fish {
  background: rgba(45, 55, 72, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark .fishing-header h1,
.dark .caught-fish h2 {
  color: #e2e8f0;
}

.dark .empty-catch {
  color: #a0aec0;
}

.dark .fish-item {
  background: rgba(255, 107, 157, 0.2);
  border-color: rgba(255, 107, 157, 0.3);
}
</style>
