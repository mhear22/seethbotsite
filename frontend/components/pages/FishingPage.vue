<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { statsRepository } from '../../repositories/stats.repository'

const container = ref<HTMLElement | null>(null)
const gameActive = ref(false)
const score = ref(0)
const caughtFish = ref<string[]>([])
const scene = shallowRef<THREE.Scene | null>(null)
const camera = shallowRef<THREE.PerspectiveCamera | null>(null)
const renderer = shallowRef<THREE.WebGLRenderer | null>(null)
let animationId: number | null = null

// Struggle mechanics
const isStruggling = ref(false)
const struggleProgress = ref(0)
const fishStrength = ref(0)
const struggleTimeRemaining = ref(0)
const lastKeyPressTime = ref(0)
const requiredPresses = ref(0)
const currentPresses = ref(0)

// Combo system
const comboCount = ref(0)
const comboMultiplier = computed(() => {
  if (comboCount.value >= 10) return 3.0
  if (comboCount.value >= 5) return 2.0
  if (comboCount.value >= 3) return 1.5
  if (comboCount.value >= 2) return 1.25
  return 1.0
})
const maxCombo = ref(0)

// Depth selection
const selectedDepth = ref<'shallow' | 'medium' | 'deep'>('medium')

// Bait system
interface BaitType {
  id: string
  name: string
  icon: string
  attractsDepth: 'shallow' | 'medium' | 'deep' | 'all'
  bonusMultiplier: number
  cost: number
}

const baitTypes: BaitType[] = [
  { id: 'worm', name: 'Worm', icon: '🪱', attractsDepth: 'shallow', bonusMultiplier: 1.0, cost: 0 },
  { id: 'shrimp', name: 'Shrimp', icon: '🦐', attractsDepth: 'medium', bonusMultiplier: 1.2, cost: 10 },
  { id: 'squid', name: 'Squid', icon: '🦑', attractsDepth: 'deep', bonusMultiplier: 1.5, cost: 25 },
  { id: 'legendary', name: 'Golden Lure', icon: '✨', attractsDepth: 'all', bonusMultiplier: 2.0, cost: 50 }
]

const selectedBait = ref<BaitType>(baitTypes[0])
const baitInventory = ref<Record<string, number>>({
  worm: Infinity,
  shrimp: 5,
  squid: 2,
  legendary: 1
})

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
        combo: comboCount.value,
        comboMultiplier: comboMultiplier.value,
        baitUsed: selectedBait.value.id,
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
          maxCombo: maxCombo.value,
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
let fishes: THREE.Group[] = []
let fishVelocities: { x: number; z: number }[] = []
let fishTimeouts: number[] = []

interface FishUserData {
  color: number
  name: string
  points: number
  size: number
  rare?: boolean
  id: number
  depth: 'shallow' | 'medium' | 'deep'
  speed: 'slow' | 'normal' | 'fast'
  behavior: 'random' | 'circle' | 'zigzag'
  behaviorOffset?: number
}

interface FishType {
  color: number
  name: string
  points: number
  size: number
  rare?: boolean
  depth: 'shallow' | 'medium' | 'deep'
  speed: 'slow' | 'normal' | 'fast'
  behavior: 'random' | 'circle' | 'zigzag'
}

const fishTypes: FishType[] = [
  // Shallow zone (easy - depths -1 to -3)
  { color: 0xff6b6b, name: 'Minnow', points: 5, size: 0.6, depth: 'shallow', speed: 'fast', behavior: 'random' },
  { color: 0x4ecdc4, name: 'Coral Fish', points: 10, size: 0.8, depth: 'shallow', speed: 'normal', behavior: 'random' },
  { color: 0xffe66d, name: 'Sunfish', points: 15, size: 0.9, depth: 'shallow', speed: 'slow', behavior: 'circle' },

  // Medium zone (moderate - depths -3 to -5)
  { color: 0x95e1d3, name: 'Jellyfish', points: 25, size: 1.0, depth: 'medium', speed: 'slow', behavior: 'zigzag' },
  { color: 0xdda0dd, name: 'Tropical Fish', points: 30, size: 1.1, depth: 'medium', speed: 'normal', behavior: 'circle' },
  { color: 0xff4757, name: 'Clownfish', points: 35, size: 0.9, depth: 'medium', speed: 'fast', behavior: 'random' },

  // Deep zone (hard - depths -5 to -7)
  { color: 0x2ed573, name: 'Angelfish', points: 50, size: 1.3, depth: 'deep', speed: 'normal', behavior: 'zigzag' },
  { color: 0x3742fa, name: 'Blue Tang', points: 60, size: 1.2, depth: 'deep', speed: 'fast', behavior: 'circle' },
  { color: 0xff6348, name: 'Salmon', points: 75, size: 1.4, depth: 'deep', speed: 'fast', behavior: 'zigzag' },

  // Legendary (very deep - depths -6 to -8)
  { color: 0xffd700, name: 'Legendary Goldfish', points: 150, size: 0.8, depth: 'deep', speed: 'fast', behavior: 'circle', rare: true },
  { color: 0x9b59b6, name: 'Ancient Coelacanth', points: 200, size: 1.8, depth: 'deep', speed: 'slow', behavior: 'random', rare: true }
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
    new THREE.Vector3(0, 2, 0)
  ])
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 2 })
  fishingLine = new THREE.Line(lineGeometry, lineMaterial)
  scene.value.add(fishingLine)
}

const createFish = (targetDepth: 'shallow' | 'medium' | 'deep' = 'medium') => {
  if (!scene.value) return

  // Filter fish by target depth
  const availableFish = fishTypes.filter(f => f.depth === targetDepth)

  // Select fish type with rarity check
  let fishType: FishType
  const rand = Math.random()
  if (rand > 0.95) {
    const rareFishes = availableFish.filter(f => f.rare)
    fishType = rareFishes.length > 0
      ? rareFishes[Math.floor(Math.random() * rareFishes.length)]
      : availableFish[Math.floor(Math.random() * availableFish.length)]
  } else {
    const regularFishes = availableFish.filter(f => !f.rare)
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

  // Position fish based on depth zone
  const depthRanges = {
    shallow: { min: -1, max: -3 },
    medium: { min: -3, max: -5 },
    deep: { min: -5, max: -7 }
  }
  const depthRange = depthRanges[fishType.depth]

  fishGroup.position.set(
    (Math.random() - 0.5) * 20,
    depthRange.min - Math.random() * (depthRange.max - depthRange.min),
    (Math.random() - 0.5) * 15
  )
  fishGroup.rotation.y = Math.random() * Math.PI * 2

  // Set velocity based on speed
  const speedMultipliers = { slow: 0.5, normal: 1.0, fast: 1.8 }
  const speedMult = speedMultipliers[fishType.speed]

  // Store fish type as userData with behavior
  const userData: FishUserData = {
    ...fishType,
    id: fishes.length,
    behaviorOffset: Math.random() * Math.PI * 2
  }
  fishGroup.userData = userData

  scene.value.add(fishGroup)
  fishes.push(fishGroup)
  fishVelocities.push({
    x: (Math.random() - 0.5) * 0.02 * speedMult,
    z: (Math.random() - 0.5) * 0.02 * speedMult
  })
}

const animate = () => {
  if (!scene.value || !camera.value || !renderer.value || !hook) return

  animationId = requestAnimationFrame(animate)

  // Animate fishes
  fishes.forEach((fish, index) => {
    const userData = fish.userData as FishUserData
    const behavior = userData.behavior
    const time = Date.now() * 0.001

    if (behavior === 'circle') {
      // Circular swimming pattern
      const radius = 3
      const angle = time * 0.5 + (userData.behaviorOffset || 0)
      fish.position.x = Math.cos(angle) * radius
      fish.position.z = Math.sin(angle) * radius
      fish.rotation.y = angle + Math.PI / 2
    } else if (behavior === 'zigzag') {
      // Zigzag pattern
      fish.position.x += fishVelocities[index].x
      fish.position.z += Math.sin(time * 2 + (userData.behaviorOffset || 0)) * 0.05

      if (Math.abs(fish.position.x) > 10) fishVelocities[index].x *= -1
    } else {
      // Random movement (existing code)
      fish.position.x += fishVelocities[index].x
      fish.position.z += fishVelocities[index].z

      if (Math.abs(fish.position.x) > 10) fishVelocities[index].x *= -1
      if (Math.abs(fish.position.z) > 8) fishVelocities[index].z *= -1
    }

    // Swim animation
    fish.rotation.z = Math.sin(Date.now() * 0.005 + index) * 0.2
  })

  // Update fishing line
  if (fishingLine && hook && hook.position) {
    const hookPos = hook.position
    const posAttr = fishingLine.geometry.getAttribute('position') as THREE.BufferAttribute
    const positions = posAttr.array as Float32Array
    positions[3] = hookPos.x
    positions[4] = hookPos.y
    positions[5] = hookPos.z
    posAttr.needsUpdate = true
  }

  renderer.value.render(scene.value, camera.value)
}

const startStruggleMiniGame = (fishItem: THREE.Group, fishData: FishUserData) => {
  const struggleStartTime = Date.now()
  const maxDuration = struggleTimeRemaining.value * 1000

  const struggleLoop = () => {
    if (!isStruggling.value) return

    const elapsed = Date.now() - struggleStartTime
    struggleTimeRemaining.value = Math.max(0, (maxDuration - elapsed) / 1000)

    // Fish fights back - decreases progress over time
    struggleProgress.value = Math.max(0, struggleProgress.value - 0.5)

    // Check win condition
    if (struggleProgress.value >= 100 || currentPresses.value >= requiredPresses.value) {
      // Success! Catch the fish
      completeCatch(fishItem, fishData)
      return
    }

    // Check lose condition
    if (struggleTimeRemaining.value <= 0) {
      // Fish escapes!
      fishEscapes(fishItem)
      return
    }

    // Animate fish struggling (shake/pull)
    if (hook && fishItem) {
      const shake = Math.sin(Date.now() * 0.02) * 0.3
      hook.position.x = shake
      fishItem.rotation.y += 0.05
    }

    requestAnimationFrame(struggleLoop)
  }

  struggleLoop()
}

const completeCatch = (fishItem: THREE.Group, fishData: FishUserData) => {
  isStruggling.value = false

  // Apply combo and bait multipliers
  const finalPoints = Math.floor(
    fishData.points *
    comboMultiplier.value *
    selectedBait.value.bonusMultiplier
  )

  score.value += finalPoints
  caughtFish.value.push(fishData.name)

  // Record stats
  recordFishCaught(fishData.name, finalPoints)
  updateHighScore()

  // Remove fish and create new one
  scene.value?.remove(fishItem)
  const caughtIndex = fishes.indexOf(fishItem)
  if (caughtIndex > -1) {
    fishes.splice(caughtIndex, 1)
    fishVelocities.splice(caughtIndex, 1)
  }

  const timeoutId = window.setTimeout(() => {
    if (scene.value) createFish(selectedDepth.value)
    const idx = fishTimeouts.indexOf(timeoutId)
    if (idx > -1) fishTimeouts.splice(idx, 1)
  }, 2000)
  fishTimeouts.push(timeoutId)

  // Increment combo
  comboCount.value++
  if (comboCount.value > maxCombo.value) {
    maxCombo.value = comboCount.value
  }

  // Reel in
  if (hook) {
    hook.position.x = 0 // Reset shake
    reelIn(2)
  }
}

const fishEscapes = (fishItem: THREE.Group) => {
  isStruggling.value = false

  // Reset combo
  comboCount.value = 0

  // Fish swims away
  const escapeAnim = () => {
    if (!fishItem) return
    fishItem.position.x += (fishItem.position.x > 0 ? 0.5 : -0.5)
    fishItem.position.z += (fishItem.position.z > 0 ? 0.5 : -0.5)

    if (Math.abs(fishItem.position.x) < 15) {
      requestAnimationFrame(escapeAnim)
    } else {
      scene.value?.remove(fishItem)
      fishes = fishes.filter(f => f !== fishItem)
    }
  }
  escapeAnim()

  if (hook) {
    hook.position.x = 0 // Reset shake
    reelIn(2)
  }
}

const castLine = (depth: 'shallow' | 'medium' | 'deep' = selectedDepth.value) => {
  if (!hook) return

  gameActive.value = true

  // Phase 1: Drop hook
  const startY = hook.position.y
  const depthTargets = { shallow: -2.5, medium: -4, deep: -6 }
  const targetY = depthTargets[depth]
  let progress = 0

  const dropHook = () => {
    if (!hook) return

    progress += 0.05
    hook.position.y = startY - (startY - targetY) * progress

    if (progress < 1) {
      requestAnimationFrame(dropHook)
    } else {
      // Phase 2: Wait for bite (3-8 seconds)
      const waitTime = 3000 + Math.random() * 5000

      setTimeout(() => {
        checkForBite()
      }, waitTime)
    }
  }

  const checkForBite = () => {
    // Fish collision detection
    const caughtIndex = fishes.findIndex(fish => {
      if (!hook || !fish || !fish.position) return false

      const dx = hook.position.x - fish.position.x
      const dy = hook.position.y - fish.position.y
      const dz = hook.position.z - fish.position.z
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
      const fishData = fish.userData as FishUserData
      const catchRadius = 0.6 + (fishData.size * 0.3)

      // Check if bait attracts this fish
      const baitMatch = selectedBait.value.attractsDepth === 'all' ||
                       selectedBait.value.attractsDepth === fishData.depth

      // Higher catch chance with matching bait
      const catchChance = baitMatch ? 0.7 : 0.2

      return distance < catchRadius && Math.random() < catchChance
    })

    if (caughtIndex !== -1) {
      // Fish hooked! Start struggle phase
      const caughtFishItem = fishes[caughtIndex]
      const fishData = caughtFishItem.userData as FishUserData

      // Set struggle parameters based on fish
      isStruggling.value = true
      fishStrength.value = fishData.points
      requiredPresses.value = Math.ceil(fishData.points / 5)
      currentPresses.value = 0
      struggleProgress.value = 0
      struggleTimeRemaining.value = 3 + (fishData.points / 50)

      // Start struggle timer
      startStruggleMiniGame(caughtFishItem, fishData)
    } else {
      // No fish - reel back empty
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
    if (!hook) return

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

const selectBait = (bait: BaitType) => {
  if (gameActive.value) return
  if (bait.cost > 0 && baitInventory.value[bait.id] === 0) return
  selectedBait.value = bait
}

const handleStruggleKeyPress = (e: KeyboardEvent) => {
  // Guard against triggering during text input
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
    return
  }

  if (!isStruggling.value) return

  // Spacebar for struggle
  if (e.key === ' ' || e.code === 'Space') {
    e.preventDefault()

    const now = Date.now()
    const timeSinceLastPress = now - lastKeyPressTime.value

    // Prevent spam (minimum 100ms between presses)
    if (timeSinceLastPress < 100) return

    lastKeyPressTime.value = now
    currentPresses.value++

    // Increase progress based on press timing
    struggleProgress.value += 10

    // Visual feedback - pulse hook
    if (hook) {
      hook.scale.set(1.2, 1.2, 1.2)
      setTimeout(() => {
        if (hook) hook.scale.set(1, 1, 1)
      }, 100)
    }
  }
}

onMounted(() => {
  // Initialize user ID
  userId.value = getOrCreateUserId()

  initThreeJS()
  animate()

  // Add keyboard event listener
  window.addEventListener('keydown', handleStruggleKeyPress)
})

onUnmounted(() => {
  // Cancel animation frame
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
    animationId = null
  }

  // Clear all pending fish creation timeouts
  fishTimeouts.forEach(timeoutId => clearTimeout(timeoutId))
  fishTimeouts = []

  // Cleanup event listeners
  window.removeEventListener('resize', onWindowResize)
  window.removeEventListener('keydown', handleStruggleKeyPress)

  // Dispose Three.js resources to prevent memory leaks
  if (scene.value) {
    scene.value.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry?.dispose()
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      }
    })
  }

  // Dispose renderer
  renderer.value?.dispose()

  // Clear references
  hook = null
  fishingLine = null
  fishes = []
  fishVelocities = []

  // Update final high score before unmount
  updateHighScore()
})
</script>

<template>
  <div class="fishing-page">
    <div class="fishing-header">
      <h1>🎣 Fishing Mini Game</h1>
      <div class="stats-row">
        <div class="score-display">
          <span class="score-label">Score:</span>
          <span class="score-value">{{ score }}</span>
        </div>
        <div v-if="comboCount > 1" class="combo-display">
          <span class="combo-label">Combo:</span>
          <span class="combo-value">{{ comboCount }}x</span>
          <span class="combo-multiplier">({{ comboMultiplier.toFixed(2) }}x pts)</span>
        </div>
        <div class="max-combo-display">
          <span class="max-combo-label">Max Combo:</span>
          <span class="max-combo-value">{{ maxCombo }}x</span>
        </div>
      </div>
    </div>

    <div class="fishing-container">
      <div ref="container" class="game-container">
        <!-- Waiting Indicator -->
        <div v-if="gameActive && !isStruggling" class="waiting-indicator">
          <div class="waiting-text">Waiting for bite...</div>
          <div class="waiting-spinner">🎣</div>
        </div>
      </div>

      <!-- Fishing Controls -->
      <div class="fishing-controls">
        <!-- Depth Selection -->
        <div class="depth-selector">
          <h3>🌊 Depth</h3>
          <div class="depth-buttons">
            <button
              v-for="depth in ['shallow', 'medium', 'deep']"
              :key="depth"
              @click="selectedDepth = depth as 'shallow' | 'medium' | 'deep'"
              :class="['depth-btn', { active: selectedDepth === depth }]"
              :disabled="gameActive"
            >
              {{ depth.charAt(0).toUpperCase() + depth.slice(1) }}
            </button>
          </div>
        </div>

        <!-- Bait Selection -->
        <div class="bait-selector">
          <h3>🎣 Bait</h3>
          <div class="bait-buttons">
            <button
              v-for="bait in baitTypes"
              :key="bait.id"
              @click="selectBait(bait)"
              :class="['bait-btn', { active: selectedBait.id === bait.id }]"
              :disabled="gameActive || (baitInventory[bait.id] === 0 && bait.cost > 0)"
            >
              <span class="bait-icon">{{ bait.icon }}</span>
              <span class="bait-name">{{ bait.name }}</span>
              <span v-if="bait.cost > 0" class="bait-count">
                {{ baitInventory[bait.id] }}
              </span>
            </button>
          </div>
        </div>
      </div>

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

    <!-- Struggle Mini-Game Overlay -->
    <div v-if="isStruggling" class="struggle-overlay">
      <div class="struggle-container">
        <div class="struggle-header">
          <h3>🎣 REEL IT IN!</h3>
          <div class="struggle-timer">
            Time: {{ struggleTimeRemaining.toFixed(1) }}s
          </div>
        </div>

        <div class="struggle-bar-container">
          <div class="struggle-bar">
            <div
              class="struggle-progress"
              :style="{ width: `${struggleProgress}%` }"
            ></div>
            <div class="struggle-target" style="left: 100%"></div>
          </div>
        </div>

        <div class="struggle-instructions">
          <div class="press-counter">
            {{ currentPresses }} / {{ requiredPresses }} presses
          </div>
          <div class="key-hint">
            Press <kbd>SPACE</kbd> rapidly!
          </div>
        </div>

        <div class="fish-strength">
          Fish Strength: {{ fishStrength }}
        </div>
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

.stats-row {
  display: flex;
  gap: 15px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
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

.combo-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  padding: 10px 20px;
  border-radius: 20px;
  border: 2px solid rgba(255, 215, 0, 0.5);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.combo-label {
  font-size: 1rem;
  color: #333;
  font-weight: 600;
}

.combo-value {
  font-size: 1.5rem;
  color: #ff6b6b;
  font-weight: 700;
}

.combo-multiplier {
  font-size: 0.9rem;
  color: #666;
}

.max-combo-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 10px 15px;
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.max-combo-label {
  font-size: 0.9rem;
  color: white;
  font-weight: 600;
}

.max-combo-value {
  font-size: 1.3rem;
  color: #ffe66d;
  font-weight: 700;
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
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  background: #0077be;
}

.waiting-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  z-index: 10;
}

.waiting-text {
  font-size: 1.5rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  margin-bottom: 10px;
}

.waiting-spinner {
  font-size: 3rem;
  animation: bob 1s ease-in-out infinite;
}

@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.fishing-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.depth-selector h3,
.bait-selector h3 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  color: white;
  text-align: center;
}

.depth-buttons,
.bait-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.depth-btn,
.bait-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.depth-btn:hover:not(:disabled),
.bait-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.depth-btn.active,
.bait-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.depth-btn:disabled,
.bait-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bait-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  min-width: 80px;
}

.bait-icon {
  font-size: 1.5rem;
}

.bait-name {
  font-size: 0.9rem;
}

.bait-count {
  font-size: 0.8rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 8px;
  border-radius: 10px;
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

/* Struggle Overlay */
.struggle-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.struggle-container {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.struggle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.struggle-header h3 {
  margin: 0;
  font-size: 1.8rem;
  color: #667eea;
}

.struggle-timer {
  font-size: 1.3rem;
  font-weight: bold;
  color: #ff6b6b;
}

.struggle-bar-container {
  margin: 20px 0;
}

.struggle-bar {
  position: relative;
  height: 40px;
  background: #e0e0e0;
  border-radius: 20px;
  overflow: hidden;
  border: 3px solid #667eea;
}

.struggle-progress {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.1s ease-out;
  border-radius: 20px 0 0 20px;
}

.struggle-instructions {
  text-align: center;
  margin-top: 20px;
}

.press-counter {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.key-hint {
  font-size: 1.1rem;
  color: #666;
}

.key-hint kbd {
  background: #f0f0f0;
  padding: 5px 15px;
  border-radius: 8px;
  border: 2px solid #ccc;
  font-weight: bold;
  font-family: monospace;
  font-size: 1.2rem;
}

.fish-strength {
  text-align: center;
  margin-top: 15px;
  font-size: 1rem;
  color: #999;
}

/* Responsive */
@media (max-width: 768px) {
  .fishing-controls {
    grid-template-columns: 1fr;
  }

  .stats-row {
    flex-direction: column;
    gap: 10px;
  }

  .struggle-container {
    padding: 30px 20px;
  }

  .struggle-header h3 {
    font-size: 1.5rem;
  }
}
</style>
