import { ref, shallowRef, type Ref } from 'vue'
import * as THREE from 'three'
import type { FishType, FishUserData } from './useFishingGame'
import { fishTypes } from './useFishingGame'

export function useFishingScene() {
  const container = ref<HTMLElement | null>(null)
  const scene = shallowRef<THREE.Scene | null>(null)
  const camera = shallowRef<THREE.PerspectiveCamera | null>(null)
  const renderer = shallowRef<THREE.WebGLRenderer | null>(null)

  let animationId: number | null = null
  let hook: THREE.Mesh | null = null
  let fishingLine: THREE.Line | null = null
  let fishes: THREE.Group[] = []
  let fishVelocities: { x: number; z: number }[] = []
  let fishTimeouts: number[] = []

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

    // Skip render work while the tab/page is hidden, but keep the loop alive
    if (document.hidden) {
      animationId = requestAnimationFrame(animate)
      return
    }

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

  const initThreeJS = (containerRef: Ref<HTMLElement | null>) => {
    container.value = containerRef.value
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

    // Start animation
    animate()
  }

  const onWindowResize = () => {
    if (!camera.value || !renderer.value || !container.value) return

    camera.value.aspect = container.value.clientWidth / container.value.clientHeight
    camera.value.updateProjectionMatrix()
    renderer.value.setSize(container.value.clientWidth, container.value.clientHeight)
  }

  const castLine = (depth: 'shallow' | 'medium' | 'deep', onCatch: (fish: THREE.Group, fishData: FishUserData) => void, onMiss: () => void, selectedBaitDepth: string) => {
    if (!hook) return

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
        const baitMatch = selectedBaitDepth === 'all' || selectedBaitDepth === fishData.depth

        // Higher catch chance with matching bait
        const catchChance = baitMatch ? 0.7 : 0.2

        return distance < catchRadius && Math.random() < catchChance
      })

      if (caughtIndex !== -1) {
        // Fish hooked! Start struggle phase
        const caughtFishItem = fishes[caughtIndex]
        const fishData = caughtFishItem.userData as FishUserData
        onCatch(caughtFishItem, fishData)
      } else {
        // No fish - reel back empty
        onMiss()
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
      }
    }

    pullUp()
  }

  const removeFish = (fishItem: THREE.Group, delayBeforeRespawn: number = 2000, respawnDepth?: 'shallow' | 'medium' | 'deep') => {
    scene.value?.remove(fishItem)
    const caughtIndex = fishes.indexOf(fishItem)
    if (caughtIndex > -1) {
      fishes.splice(caughtIndex, 1)
      fishVelocities.splice(caughtIndex, 1)
    }

    const timeoutId = window.setTimeout(() => {
      if (scene.value) createFish(respawnDepth)
      const idx = fishTimeouts.indexOf(timeoutId)
      if (idx > -1) fishTimeouts.splice(idx, 1)
    }, delayBeforeRespawn)
    fishTimeouts.push(timeoutId)
  }

  const animateFishEscape = (fishItem: THREE.Group) => {
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
  }

  const resetHookPosition = () => {
    if (hook) {
      hook.position.x = 0
      hook.scale.set(1, 1, 1)
    }
  }

  const pulseHook = () => {
    if (hook) {
      hook.scale.set(1.2, 1.2, 1.2)
      setTimeout(() => {
        if (hook) hook.scale.set(1, 1, 1)
      }, 100)
    }
  }

  const shakeHook = (fishItem: THREE.Group) => {
    if (hook && fishItem) {
      const shake = Math.sin(Date.now() * 0.02) * 0.3
      hook.position.x = shake
      fishItem.rotation.y += 0.05
    }
  }

  const cleanup = () => {
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
  }

  return {
    container,
    scene,
    camera,
    renderer,
    initThreeJS,
    castLine,
    reelIn,
    removeFish,
    animateFishEscape,
    resetHookPosition,
    pulseHook,
    shakeHook,
    cleanup
  }
}
