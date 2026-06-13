import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIEffectsStore = defineStore('uiEffects', () => {
  // Detect if on mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768
  }

  // Load preferences from localStorage
  const savedChaosMode = localStorage.getItem('chaosMode')
  const savedMoldMode = localStorage.getItem('moldMode')
  const savedPerformanceMode = localStorage.getItem('performanceMode')
  const savedShowHearts = localStorage.getItem('showHearts')

  const chaosMode = ref(savedChaosMode === 'true')
  const moldMode = ref(savedMoldMode !== null
    ? savedMoldMode === 'true'
    : !isMobileDevice() // Default to false on mobile, true on desktop
  )
  const performanceMode = ref(savedPerformanceMode !== null ? savedPerformanceMode === 'true' : true)
  const showHearts = ref(savedShowHearts !== 'false')

  // Mobile-friendly heart settings: fewer hearts, slower spawn rate
  const maxHearts = ref(parseInt(localStorage.getItem('maxHearts') || (isMobileDevice() ? '5' : '20')))
  const heartSpawnRate = ref(parseInt(localStorage.getItem('heartSpawnRate') || (isMobileDevice() ? '1000' : '125')))

  // Tachikawa value (mold level)
  const tachValue = ref(50)

  // Track active mold circles
  let moldCircles: HTMLElement[] = []
  let moldSpawnerTimeout: ReturnType<typeof setTimeout> | null = null
  const MAX_MOLD_CIRCLES = 27
  const MIN_START_CIRCLES = 5
  const MAX_START_CIRCLES = 10

  // Chaos mode effects
  let chaosIntervals: NodeJS.Timeout[] = []
  const chaosParticles: HTMLElement[] = []

  // Track mold circle growth intervals for cleanup
  let moldGrowthIntervals: NodeJS.Timeout[] = []

  /**
   * Toggle chaos mode
   */
  const toggleChaosMode = () => {
    if (performanceMode.value) {
      console.log('Chaos mode is disabled in performance mode')
      return
    }

    chaosMode.value = !chaosMode.value
    localStorage.setItem('chaosMode', chaosMode.value.toString())
    document.body.classList.toggle('chaos', chaosMode.value)

    if (chaosMode.value) {
      startChaosEffects()
    } else {
      stopChaosEffects()
    }
  }

  /**
   * Start chaos effects
   */
  const startChaosEffects = () => {
    // Random color changes on body
    const colorInterval = setInterval(() => {
      const hue = Math.random() * 360
      document.body.style.filter = `hue-rotate(${hue}deg) saturate(${1 + Math.random()})`
    }, 2000)
    chaosIntervals.push(colorInterval)

    // Spawn chaos particles
    const particleInterval = setInterval(() => {
      spawnChaosParticle()
    }, 1500)
    chaosIntervals.push(particleInterval)

    // Random CSS transforms
    const transformInterval = setInterval(() => {
      const elements = document.querySelectorAll('.main-app > *')
      elements.forEach((el, index) => {
        if (Math.random() < 0.3 && el instanceof HTMLElement) {
          const rotate = (Math.random() - 0.5) * 5
          const scale = 0.95 + Math.random() * 0.1
          el.style.transition = 'transform 0.5s ease'
          el.style.transform = `rotate(${rotate}deg) scale(${scale})`
        }
      })
    }, 3000)
    chaosIntervals.push(transformInterval)

    // Random background flashes
    const flashInterval = setInterval(() => {
      if (Math.random() < 0.2) {
        const colors = ['rgba(255,0,0,0.1)', 'rgba(0,255,0,0.1)', 'rgba(0,0,255,0.1)', 'rgba(255,255,0,0.1)']
        const flash = document.createElement('div')
        flash.style.position = 'fixed'
        flash.style.top = '0'
        flash.style.left = '0'
        flash.style.width = '100%'
        flash.style.height = '100%'
        flash.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
        flash.style.pointerEvents = 'none'
        flash.style.zIndex = '9997'
        flash.style.transition = 'opacity 0.3s'
        flash.style.opacity = '1'
        document.body.appendChild(flash)

        setTimeout(() => {
          flash.style.opacity = '0'
          setTimeout(() => flash.remove(), 300)
        }, 100)
      }
    }, 5000)
    chaosIntervals.push(flashInterval)
  }

  /**
   * Stop chaos effects and clean up all intervals
   */
  const stopChaosEffects = () => {
    // Clear all intervals
    chaosIntervals.forEach(interval => clearInterval(interval))
    chaosIntervals = []

    // Remove all chaos particles
    chaosParticles.forEach(particle => particle.remove())
    chaosParticles.length = 0

    // Reset body styles
    document.body.style.filter = ''
    document.body.style.backgroundColor = ''

    // Reset element transforms
    const elements = document.querySelectorAll('.main-app > *')
    elements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.transform = ''
      }
    })
  }

  /**
   * Spawn chaos particle
   */
  const spawnChaosParticle = () => {
    const emojis = ['💥', '✨', '🌟', '⭐', '🔮', '🎪', '🎭', '🎨', '🎯', '🎲']
    const particle = document.createElement('div')
    particle.className = 'chaos-particle'
    particle.innerHTML = emojis[Math.floor(Math.random() * emojis.length)]
    particle.style.position = 'fixed'
    particle.style.left = Math.random() * 100 + 'vw'
    particle.style.top = Math.random() * 100 + 'vh'
    particle.style.fontSize = (Math.random() * 20 + 20) + 'px'
    particle.style.pointerEvents = 'none'
    particle.style.zIndex = '9998'
    particle.style.transition = 'all 2s ease'
    particle.style.opacity = '0'

    document.body.appendChild(particle)
    chaosParticles.push(particle)

    setTimeout(() => {
      particle.style.opacity = '0.8'
      particle.style.transform = `scale(${1 + Math.random()}) rotate(${Math.random() * 360}deg)`
    }, 50)

    setTimeout(() => {
      particle.style.opacity = '0'
      particle.style.transform = `scale(0) rotate(${Math.random() * 720}deg)`
      setTimeout(() => {
        particle.remove()
        const index = chaosParticles.indexOf(particle)
        if (index > -1) chaosParticles.splice(index, 1)
      }, 2000)
    }, 2000)
  }

  /**
   * Toggle performance mode
   */
  const togglePerformanceMode = () => {
    performanceMode.value = !performanceMode.value
    localStorage.setItem('performanceMode', performanceMode.value.toString())
    document.body.classList.toggle('performance-mode', performanceMode.value)

    // When performance mode is enabled, disable resource-intensive effects
    if (performanceMode.value) {
      if (chaosMode.value) {
        chaosMode.value = false
        localStorage.setItem('chaosMode', 'false')
        document.body.classList.remove('chaos')
        stopChaosEffects()
      }
      if (moldMode.value) {
        moldMode.value = false
        localStorage.setItem('moldMode', 'false')
        stopMoldSpawner()
        clearMoldCircles()
      }
    }
  }

  /**
   * Create heart animation
   */
  const createHeart = () => {
    if (!showHearts.value) return

    const MAX_HEARTS = maxHearts.value
    const currentHearts = document.querySelectorAll('.heart')
    if (currentHearts.length >= MAX_HEARTS) {
      return
    }

    const heart = document.createElement('div')
    heart.className = 'heart'

    // Replace heart emojis with mold emojis when mold level is high (> 60%)
    const moldLevel = tachValue.value
    if (moldLevel > 60 && Math.random() < ((moldLevel - 50) / 50)) {
      const moldEmojis = ['🍄', '🦠', '🟢', '🟢', '🥬', '🌿']
      heart.innerHTML = moldEmojis[Math.floor(Math.random() * moldEmojis.length)]
    } else if (Math.random() < 0.15) {
      heart.innerHTML = '🥚'
    } else {
      heart.innerHTML = ['💖', '💕', '💗', '💓', '❤️'][Math.floor(Math.random() * 5)]
    }
    heart.style.left = Math.random() * 100 + 'vw'
    heart.style.animationDuration = (Math.random() * 3 + 3) + 's'

    const currentSize = (window as any).heartSize || 20
    heart.style.fontSize = currentSize + 'px'
    ;(window as any).heartSize = Math.min(currentSize + 1, 60)

    // Mega heart logic
    const isMegaHeart = Math.random() < 0.002
    if (isMegaHeart) {
      heart.classList.add('mega-heart')
      let hasTransformed = false
      const checkPosition = () => {
        if (!heart.parentNode) return
        const rect = heart.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        if (rect.top < viewportHeight * 0.2 && !hasTransformed) {
          hasTransformed = true
          heart.style.transition = 'font-size 0.5s ease, transform 0.5s ease'
          heart.style.fontSize = '750px'
          heart.style.zIndex = '9999'
          return
        }
        if (rect.top > viewportHeight && hasTransformed) {
          return
        }
        requestAnimationFrame(checkPosition)
      }
      requestAnimationFrame(checkPosition)
    }

    document.body.appendChild(heart)

    heart.addEventListener('animationend', () => {
      heart.remove()
    })
  }

  /**
   * Create mold visual effects
   */
  const createMoldCircle = () => {
    const currentCircles = document.querySelectorAll('.mold-circle')
    if (currentCircles.length >= MAX_MOLD_CIRCLES) {
      return
    }

    const circle = document.createElement('div')
    circle.className = 'mold-circle'

    const size = Math.random() * 150 + 50
    circle.style.width = size + 'px'
    circle.style.height = size + 'px'

    circle.style.position = 'absolute'
    circle.style.left = Math.random() * 100 + '%'
    circle.style.top = Math.random() * 100 + '%'
    circle.style.transform = 'translate(-50%, -50%)'
    circle.style.pointerEvents = 'none'
    circle.style.userSelect = 'none'

    const blurAmount = Math.random() * 3 + 2
    circle.style.filter = `blur(${blurAmount}px)`

    const colors = ['white', 'pale grey', 'pale green', 'pastel green', 'desaturated dark green', 'desaturated dark blue']
    const baseOpacity = Math.random() * 0.09 + 0.03

    const color1Color = colors[Math.floor(Math.random() * colors.length)]
    const color2Color = colors[Math.floor(Math.random() * colors.length)]

    const colorComponents: Record<string, {r: number, g: number, b: number}> = {
      'white': {r: 255, g: 255, b: 255},
      'pale grey': {r: 220, g: 220, b: 220},
      'pale green': {r: 200, g: 230, b: 200},
      'pastel green': {r: 168, g: 224, b: 99},
      'desaturated dark green': {r: 86, g: 171, b: 47},
      'desaturated dark blue': {r: 70, g: 100, b: 130}
    }

    const color1 = colorComponents[color1Color]
    const color2 = colorComponents[color2Color]

    const updateOpacity = (currentSize: number, fadeInProgress: number) => {
      const fiftyVw = window.innerWidth / 2
      const sizeBasedOpacity = baseOpacity * Math.max(0, 1 - (currentSize / fiftyVw))
      const finalOpacity = sizeBasedOpacity * fadeInProgress
      return finalOpacity
    }

    const updateBackground = (currentSize: number, fadeInProgress: number) => {
      const opacity = updateOpacity(currentSize, fadeInProgress)
      circle.style.background = `radial-gradient(circle, rgba(${color1.r}, ${color1.g}, ${color1.b}, ${opacity}) 0%, rgba(${color2.r}, ${color2.g}, ${color2.b}, ${opacity}) 100%)`
    }

    const fadeInDuration = Math.random() * 10000 + 10000
    let fadeInProgress = 0
    let fadeStartTime = Date.now()

    updateBackground(size, 0)
    circle.style.opacity = '0'

    document.body.appendChild(circle)

    const fadeInInterval = setInterval(() => {
      const elapsed = Date.now() - fadeStartTime
      fadeInProgress = Math.min(1, elapsed / fadeInDuration)
      circle.style.opacity = fadeInProgress.toString()
      updateBackground(size, fadeInProgress)

      if (fadeInProgress >= 1) {
        clearInterval(fadeInInterval)
      }
    }, 100)

    let currentSize = size
    const growthRate = Math.random() * 1.5 + 0.2
    const growthInterval = setInterval(() => {
      currentSize += growthRate
      circle.style.width = currentSize + 'px'
      circle.style.height = currentSize + 'px'

      if (fadeInProgress >= 1) {
        updateBackground(currentSize, 1)
      }

      const fiftyVw = window.innerWidth / 2
      if (currentSize >= fiftyVw) {
        clearInterval(growthInterval)
        clearInterval(fadeInInterval)
        // Remove from tracking array
        const growthIndex = moldGrowthIntervals.indexOf(growthInterval)
        if (growthIndex > -1) moldGrowthIntervals.splice(growthIndex, 1)
        if (circle.parentNode) {
          circle.remove()
          createMoldCircle()
        }
      }
    }, 100)
    
    // Track growth interval for cleanup
    moldGrowthIntervals.push(growthInterval)
  }

  /**
   * Initialize mold circles
   */
  const initMoldCircles = () => {
    const numCircles = Math.floor(Math.random() * (MAX_START_CIRCLES - MIN_START_CIRCLES + 1)) + MIN_START_CIRCLES
    for (let i = 0; i < numCircles; i++) {
      setTimeout(() => createMoldCircle(), i * 200)
    }
  }

  /**
   * Spawn new mold circles periodically
   */
  const startMoldSpawner = () => {
    const spawnMold = () => {
      if (!moldMode.value) return
      createMoldCircle()
      const delay = Math.random() * 15000 + 5000
      moldSpawnerTimeout = setTimeout(spawnMold, delay)
    }
    setTimeout(spawnMold, 2000)
  }

  /**
   * Stop spawning mold circles
   */
  const stopMoldSpawner = () => {
    if (moldSpawnerTimeout) {
      clearTimeout(moldSpawnerTimeout)
      moldSpawnerTimeout = null
    }
  }

  /**
   * Clear all existing mold circles and their intervals
   */
  const clearMoldCircles = () => {
    // Clear all tracked growth intervals
    moldGrowthIntervals.forEach(interval => clearInterval(interval))
    moldGrowthIntervals = []
    
    // Remove all mold circle elements
    const circles = document.querySelectorAll('.mold-circle')
    circles.forEach(circle => circle.remove())
  }

  /**
   * Toggle mold mode
   */
  const toggleMoldMode = () => {
    if (performanceMode.value) {
      console.log('Mold mode is disabled in performance mode')
      return
    }

    moldMode.value = !moldMode.value
    localStorage.setItem('moldMode', moldMode.value.toString())

    if (moldMode.value) {
      startMoldSpawner()
    } else {
      stopMoldSpawner()
      clearMoldCircles()
    }
  }

  /**
   * Update mold visual effects based on level
   */
  const updateMoldEffects = () => {
    const moldLevel = tachValue.value
    const greenTinge = Math.min(0.3, moldLevel / 100 * 0.3)
    document.body.style.backgroundColor = `rgba(168, 224, 99, ${greenTinge})`
    ;(window as any).moldLevel = moldLevel
  }

  /**
   * Cleanup all intervals and effects (call on component unmount)
   */
  const cleanup = () => {
    // Stop chaos effects and clear intervals
    if (chaosMode.value) {
      stopChaosEffects()
    }
    
    // Stop mold spawner and clear all circles with their intervals
    stopMoldSpawner()
    clearMoldCircles()
  }

  return {
    // State
    chaosMode,
    moldMode,
    performanceMode,
    showHearts,
    maxHearts,
    heartSpawnRate,
    tachValue,

    // Actions
    toggleChaosMode,
    togglePerformanceMode,
    toggleMoldMode,
    createHeart,
    initMoldCircles,
    createMoldCircle,
    startMoldSpawner,
    stopMoldSpawner,
    clearMoldCircles,
    updateMoldEffects,
    cleanup
  }
})
