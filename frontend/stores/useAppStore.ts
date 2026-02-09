import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAudio } from '../composables/useAudio'
import { useCat } from '../composables/useCat'
import { usePanels } from '../composables/usePanels'
import { useLanguage } from '../composables/useLanguage'
import { useAuthStore } from './useAuthStore'
import { useRankingsStore } from './useRankingsStore'

export const useAppStore = defineStore('app', () => {
  // Composables
  const audio = useAudio()
  const cat = useCat()
  const panels = usePanels()
  const language = useLanguage()

  // Stores (global state)
  const authStore = useAuthStore()
  const rankingsStore = useRankingsStore()

  // Detect if on mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768
  }

  // Load dark mode preference from localStorage
  const savedDarkMode = localStorage.getItem('darkMode')
  const savedDarkerMode = localStorage.getItem('darkerMode')
  const savedChaosMode = localStorage.getItem('chaosMode')
  const savedMoldMode = localStorage.getItem('moldMode')
  const darkMode = ref(savedDarkMode === 'true')
  const darkerMode = ref(savedDarkerMode === 'true')
  const chaosMode = ref(savedChaosMode === 'true')

  // Mobile-friendly defaults: disable mold mode on mobile by default
  const moldMode = ref(savedMoldMode !== null
    ? savedMoldMode === 'true'
    : !isMobileDevice() // Default to false on mobile, true on desktop
  )

  const showHearts = ref(localStorage.getItem('showHearts') !== 'false')

  // Mobile-friendly heart settings: fewer hearts, slower spawn rate
  const maxHearts = ref(parseInt(localStorage.getItem('maxHearts') || (isMobileDevice() ? '5' : '20')))
  const heartSpawnRate = ref(parseInt(localStorage.getItem('heartSpawnRate') || (isMobileDevice() ? '1000' : '125')))
  const musicPlaying = ref(false)
  const isMuted = ref(false) // Mute state (Ticket #172)
  const currentQuoteIndex = ref(0)
  const tachValue = ref(50)
  const mikaModalOpen = ref(false)
  const confirmationOpen = ref(false)
  const searchModalOpen = ref(false)
  const currentRoute = ref('home')
  const showBreadcrumb = ref(localStorage.getItem('showBreadcrumb') !== 'false')

  const quotes = ref([
    'Stay curious, keep asking questions.',
    'The best way to predict future is to create it.',
    'Every moment is a fresh beginning.',
    'Chaos is just order waiting to be discovered.',
    'Your potential is endless.',
    'Keep being weird.',
    'Normal is overrated.',
    'Be energy you want to see in world.'
  ])

  // Temer3-specific light-hearted insults (Ticket #176)
  const temer3Quotes = ref([
    "Temer3 couldn't code his way out of a wet paper bag 🌧️",
    "Temer3's debugging skills are legendary... for all the wrong reasons 🐛",
    "Temer3 thinks CSS stands for 'Can't Style Stuff' 💅",
    "Temer3 commits faster than he thinks about the consequences 🚀",
    "Temer3's code is like a box of chocolates - you never know what's gonna break 🍫",
    "Temer3 once forgot to push his changes... three times in a row 📤",
    "Temer3's pull requests are basically puzzles for everyone else 🧩",
    "Temer3 writes code that makes AI question its existence 🤖",
    "Temer3 tested the 'delete node_modules' theory once... and lived to tell the tale 🗑️",
    "Temer3's Git history is a fascinating archaeological dig 🏺"
  ])

  // Advice slips cache
  const adviceSlips = ref<string[]>([])

  // Helper function to check if current user is Temer3
  const isTemer3 = computed(() => {
    if (!authStore.user) return false
    const displayName = authStore.user.display_name || ''
    const email = authStore.user.email || ''
    return displayName.toLowerCase().includes('temer3') || email.toLowerCase().includes('temer3')
  })

  // Getters
  const currentQuote = computed(() => {
    if (isTemer3.value) {
      return temer3Quotes.value[currentQuoteIndex.value % temer3Quotes.value.length]
    }
    return quotes.value[currentQuoteIndex.value]
  })

  // Preload advice slips on startup
  const preloadAdvice = async () => {
    // Fetch 3-5 advice slips on startup
    const numToFetch = Math.floor(Math.random() * 3) + 3
    for (let i = 0; i < numToFetch; i++) {
      await fetchAdvice()
    }
  }

  // Actions
  const toggleDarkMode = () => {
    // Cycle through: light → dark → darker → light
    if (!darkMode.value && !darkerMode.value) {
      // light → dark
      darkMode.value = true
      darkerMode.value = false
    } else if (darkMode.value && !darkerMode.value) {
      // dark → darker
      darkMode.value = true
      darkerMode.value = true
    } else {
      // darker → light
      darkMode.value = false
      darkerMode.value = false
    }

    localStorage.setItem('darkMode', darkMode.value.toString())
    localStorage.setItem('darkerMode', darkerMode.value.toString())
    document.body.classList.toggle('dark', darkMode.value)
    document.body.classList.toggle('darker', darkerMode.value)
  }

  const toggleDarkerMode = () => {
    darkerMode.value = !darkerMode.value
    // If darker mode is enabled, dark mode must also be enabled
    if (darkerMode.value) {
      darkMode.value = true
    }
    localStorage.setItem('darkMode', darkMode.value.toString())
    localStorage.setItem('darkerMode', darkerMode.value.toString())
    document.body.classList.toggle('dark', darkMode.value)
    document.body.classList.toggle('darker', darkerMode.value)
  }

  const toggleChaosMode = () => {
    chaosMode.value = !chaosMode.value
    localStorage.setItem('chaosMode', chaosMode.value.toString())
    document.body.classList.toggle('chaos', chaosMode.value)

    if (chaosMode.value) {
      startChaosEffects()
    } else {
      stopChaosEffects()
    }
  }

  // Chaos mode effects (Ticket #88)
  let chaosIntervals: NodeJS.Timeout[] = []
  const chaosParticles: HTMLElement[] = []

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

  const stopChaosEffects = () => {
    // Clear all chaos intervals
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

    // Animate in
    setTimeout(() => {
      particle.style.opacity = '0.8'
      particle.style.transform = `scale(${1 + Math.random()}) rotate(${Math.random() * 360}deg)`
    }, 50)

    // Animate out and remove
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

  const toggleMusic = () => {
    musicPlaying.value = !musicPlaying.value
    audio.toggleMusic(musicPlaying.value)
    if (!isMuted.value) audio.playButtonClick()
  }

  // Toggle mute state (Ticket #172)
  const toggleMute = () => {
    isMuted.value = !isMuted.value
    if (isMuted.value) {
      audio.muteAll()
    } else {
      audio.unmuteAll()
      // Resume music if it was playing before mute
      if (musicPlaying.value) {
        audio.toggleMusic(true)
      }
    }
  }

  const fetchAdvice = async () => {
    try {
      const response = await fetch('https://api.adviceslip.com/advice')
      const data = await response.json()
      if (data.slip && data.slip.advice) {
        const advice = data.slip.advice
        // Check if this advice is already cached
        if (!adviceSlips.value.includes(advice)) {
          adviceSlips.value.push(advice)
          // Add to quotes array
          quotes.value.push(advice)
        }
        return advice
      }
    } catch (error) {
      console.error('Failed to fetch advice:', error)
    }
    return null
  }

  const nextQuote = async () => {
    // Don't fetch advice for Temer3 - they get their special collection
    if (!isTemer3.value) {
      // 30% chance to fetch new advice from API
      if (Math.random() < 0.3) {
        const advice = await fetchAdvice()
        if (advice) {
          currentQuoteIndex.value = quotes.value.length - 1
          return
        }
      }
      currentQuoteIndex.value = (currentQuoteIndex.value + 1) % quotes.value.length
    } else {
      // For Temer3, just cycle through his special collection
      currentQuoteIndex.value = (currentQuoteIndex.value + 1) % temer3Quotes.value.length
    }
  }

  const onFart = () => {
    const randomValue = Math.floor(Math.random() * 100)
    const volume = randomValue / 50

    audio.playFart(volume)

    setTimeout(() => {
      confirmationOpen.value = true
    }, 300)

    tachValue.value = randomValue
    audio.playGooseHonk()
  }

  const onTurnMe = () => {
    audio.playFart(1.0)
    setTimeout(() => {
      confirmationOpen.value = true
    }, 300)
  }

  const closeConfirmation = () => {
    confirmationOpen.value = false
  }

  const closeMikaModal = () => {
    mikaModalOpen.value = false
  }

  const toggleSearchModal = () => {
    searchModalOpen.value = !searchModalOpen.value
  }

  const onRouteChange = (route: string) => {
    currentRoute.value = route
  }

  const createHeart = () => {
    if (!showHearts.value) return

    // Limit hearts on screen (configurable via settings page)
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
      // Higher mold level = more mold emojis
      const moldEmojis = ['🍄', '🦠', '🟢', '🟢', '🥬', '🌿']
      heart.innerHTML = moldEmojis[Math.floor(Math.random() * moldEmojis.length)]
    } else if (Math.random() < 0.15) {
      heart.innerHTML = '🥚'
    } else {
      heart.innerHTML = ['💖', '💕', '💗', '💓', '❤️'][Math.floor(Math.random() * 5)]
    }
    heart.style.left = Math.random() * 100 + 'vw'
    heart.style.animationDuration = (Math.random() * 3 + 3) + 's'

    // Each heart is 1px bigger than the previous one
    const currentSize = (window as any).heartSize || 20
    heart.style.fontSize = currentSize + 'px'
    ;(window as any).heartSize = currentSize + 1

    // Mega heart logic (Ticket #189): 0.2% chance to enlarge to 750px at top
    const isMegaHeart = Math.random() < 0.002
    if (isMegaHeart) {
      heart.classList.add('mega-heart')
      // Track heart for mega transformation at top
      let hasTransformed = false
      const checkPosition = () => {
        if (!heart.parentNode) {
          // Heart removed, stop checking
          return
        }
        const rect = heart.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        // When heart reaches top 20% of viewport
        if (rect.top < viewportHeight * 0.2 && !hasTransformed) {
          hasTransformed = true
          // Enlarge to 750px
          heart.style.transition = 'font-size 0.5s ease, transform 0.5s ease'
          heart.style.fontSize = '750px'
          heart.style.zIndex = '9999'
          // Remove position checker
          return
        }
        // Check if heart reached bottom (after transformation)
        if (rect.top > viewportHeight && hasTransformed) {
          // Reset size (already handled by removal)
          return
        }
        requestAnimationFrame(checkPosition)
      }
      requestAnimationFrame(checkPosition)
    }

    document.body.appendChild(heart)

    // Remove heart only after animation completes, ensuring it stays within viewport
    heart.addEventListener('animationend', () => {
      heart.remove()
    })
  }

  // Track active mold circles
  let moldCircles: HTMLElement[] = []
  let moldSpawnerTimeout: ReturnType<typeof setTimeout> | null = null
  const MAX_MOLD_CIRCLES = 27 // Random between 25-30, using midpoint
  const MIN_START_CIRCLES = 5
  const MAX_START_CIRCLES = 10

  // Create mold visual effects (Ticket #32)
  const createMoldCircle = () => {
    // Check if we've hit the limit
    const currentCircles = document.querySelectorAll('.mold-circle')
    if (currentCircles.length >= MAX_MOLD_CIRCLES) {
      return
    }

    const circle = document.createElement('div')
    circle.className = 'mold-circle'

    // Random size between 50px and 200px
    const size = Math.random() * 150 + 50
    circle.style.width = size + 'px'
    circle.style.height = size + 'px'

    // Random position (centered growth)
    circle.style.position = 'absolute'
    circle.style.left = Math.random() * 100 + '%'
    circle.style.top = Math.random() * 100 + '%'
    circle.style.transform = 'translate(-50%, -50%)'
    circle.style.pointerEvents = 'none'
    circle.style.userSelect = 'none'

    // Random Gaussian blur of 2-5px (Ticket #108)
    const blurAmount = Math.random() * 3 + 2
    circle.style.filter = `blur(${blurAmount}px)`

    // Random radial gradient colors from the specified palette
    const colors = ['white', 'pale grey', 'pale green', 'pastel green', 'desaturated dark green', 'desaturated dark blue']
    // Random opacity between 3-12% (base opacity) - wider range for variety
    const baseOpacity = Math.random() * 0.09 + 0.03

    const color1Color = colors[Math.floor(Math.random() * colors.length)]
    const color2Color = colors[Math.floor(Math.random() * colors.length)]

    // Get color components (will update dynamically)
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

    // Function to update opacity based on current size
    const updateOpacity = (currentSize: number, fadeInProgress: number) => {
      const fiftyVw = window.innerWidth / 2
      const sizeBasedOpacity = baseOpacity * Math.max(0, 1 - (currentSize / fiftyVw))
      // Apply fade-in effect (start at 0% and gradually increase)
      const finalOpacity = sizeBasedOpacity * fadeInProgress
      return finalOpacity
    }

    // Function to update background with new opacity
    const updateBackground = (currentSize: number, fadeInProgress: number) => {
      const opacity = updateOpacity(currentSize, fadeInProgress)
      circle.style.background = `radial-gradient(circle, rgba(${color1.r}, ${color1.g}, ${color1.b}, ${opacity}) 0%, rgba(${color2.r}, ${color2.g}, ${color2.b}, ${opacity}) 100%)`
    }

    // Fade-in from 0% to 100% over 10-20 seconds (Ticket #108)
    const fadeInDuration = Math.random() * 10000 + 10000 // 10-20 seconds in ms
    let fadeInProgress = 0
    let fadeStartTime = Date.now()

    // Start at 0% opacity
    updateBackground(size, 0)
    circle.style.opacity = '0'

    document.body.appendChild(circle)

    // Fade-in interval
    const fadeInInterval = setInterval(() => {
      const elapsed = Date.now() - fadeStartTime
      fadeInProgress = Math.min(1, elapsed / fadeInDuration)
      circle.style.opacity = fadeInProgress.toString()
      updateBackground(size, fadeInProgress)

      if (fadeInProgress >= 1) {
        clearInterval(fadeInInterval)
      }
    }, 100)

    // Slowly increase size over time with random growth rate (Ticket #106)
    let currentSize = size
    const growthRate = Math.random() * 1.5 + 0.2 // Random between 0.2px and 1.7px per tick
    const growthInterval = setInterval(() => {
      currentSize += growthRate
      circle.style.width = currentSize + 'px'
      circle.style.height = currentSize + 'px'

      // Update opacity as it grows (after fade-in is complete)
      if (fadeInProgress >= 1) {
        updateBackground(currentSize, 1)
      }

      // Remove when it reaches 50vw (faded to 0%)
      const fiftyVw = window.innerWidth / 2
      if (currentSize >= fiftyVw) {
        clearInterval(growthInterval)
        clearInterval(fadeInInterval)
        if (circle.parentNode) {
          circle.remove()
          // Spawn replacement mold (Ticket #106)
          createMoldCircle()
        }
      }
    }, 100)
  }

  // Initialize mold circles (create 5-10 initially) (Ticket #108)
  const initMoldCircles = () => {
    const numCircles = Math.floor(Math.random() * (MAX_START_CIRCLES - MIN_START_CIRCLES + 1)) + MIN_START_CIRCLES
    for (let i = 0; i < numCircles; i++) {
      setTimeout(() => createMoldCircle(), i * 200)
    }
  }

  // Spawn new mold circles periodically (Ticket #108)
  const startMoldSpawner = () => {
    const spawnMold = () => {
      // Only spawn if mold mode is enabled
      if (!moldMode.value) {
        return
      }
      createMoldCircle()
      // Random delay for next spawn (5-20 seconds)
      // Keep spawning even if limit is reached - circles will die and free up space
      const delay = Math.random() * 15000 + 5000
      moldSpawnerTimeout = setTimeout(spawnMold, delay)
    }
    // Start spawning after initial circles are created
    setTimeout(spawnMold, 2000)
  }

  // Stop spawning mold circles (Ticket #112)
  const stopMoldSpawner = () => {
    if (moldSpawnerTimeout) {
      clearTimeout(moldSpawnerTimeout)
      moldSpawnerTimeout = null
    }
  }

  // Clear all existing mold circles (Ticket #112)
  const clearMoldCircles = () => {
    const circles = document.querySelectorAll('.mold-circle')
    circles.forEach(circle => circle.remove())
  }

  // Toggle mold mode (Ticket #112)
  const toggleMoldMode = () => {
    moldMode.value = !moldMode.value
    localStorage.setItem('moldMode', moldMode.value.toString())

    if (moldMode.value) {
      // Enable mold: start spawning
      startMoldSpawner()
    } else {
      // Disable mold: stop spawning and clear existing circles
      stopMoldSpawner()
      clearMoldCircles()
    }
  }

  const toggleBreadcrumb = () => {
    showBreadcrumb.value = !showBreadcrumb.value
    localStorage.setItem('showBreadcrumb', showBreadcrumb.value.toString())
  }

  // Update mold visual effects based on level (Ticket #74)
  const updateMoldEffects = () => {
    const moldLevel = tachValue.value

    // Apply green tinge to body based on mold level
    const greenTinge = Math.min(0.3, moldLevel / 100 * 0.3)
    document.body.style.backgroundColor = `rgba(168, 224, 99, ${greenTinge})`

    // Store mold level for use in other components
    ;(window as any).moldLevel = moldLevel
  }

  return {
    // State
    darkMode,
    darkerMode,
    chaosMode,
    moldMode,
    performanceMode,
    showHearts,
    maxHearts,
    heartSpawnRate,
    musicPlaying,
    isMuted,
    currentQuoteIndex,
    tachValue,
    mikaModalOpen,
    confirmationOpen,
    searchModalOpen,
    currentRoute,
    showBreadcrumb,
    quotes,
    temer3Quotes,
    adviceSlips,

    // Getters
    currentQuote,
    isTemer3,

    // Composables (expose directly)
    panels: panels.panels,
    catImage: cat.catImage,
    catLoading: cat.catLoading,

    // Stores (expose for backward compatibility)
    auth: authStore,
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    authLoading: authStore.loading,
    rankings: rankingsStore.rankings,
    rankingsLoading: rankingsStore.loading,
    rankingsError: rankingsStore.error,

    // Language (Ticket #95)
    languageRegion: language.languageRegion,
    toggleLanguage: language.toggleLanguage,
    applyLanguage: language.applyLanguage,
    isAustralian: language.isAustralian,

    // Actions
    toggleDarkMode,
    toggleDarkerMode,
    toggleChaosMode,
    toggleMoldMode,
    toggleBreadcrumb,
    togglePerformanceMode,
    toggleMusic,
    toggleMute,
    togglePanel: panels.togglePanel,
    nextQuote,
    preloadAdvice,
    nextCat: cat.fetchNewCat,
    onFart,
    onTurnMe,
    closeConfirmation,
    closeMikaModal,
    toggleSearchModal,
    onRouteChange,
    loadRankings: rankingsStore.loadRankings,
    createHeart,
    initMoldCircles,
    createMoldCircle,
    startMoldSpawner,
    stopMoldSpawner,
    clearMoldCircles,
    updateMoldEffects,
    getTrendClass: rankingsStore.getTrendClass,

    // Auth actions (for backward compatibility)
    login: authStore.login,
    logout: authStore.logout,
    register: authStore.register,
    updateProfile: authStore.updateProfile
  }
})
