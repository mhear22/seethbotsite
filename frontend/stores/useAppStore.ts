import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAudio } from '../composables/useAudio'
import { useCat } from '../composables/useCat'
import { usePanels } from '../composables/usePanels'
import { useLanguage } from '../composables/useLanguage'
import { useAuthStore } from './useAuthStore'
import { useRankingsStore } from './useRankingsStore'
import { useUIEffectsStore } from './useUIEffectsStore'

export const useAppStore = defineStore('app', () => {
  // Composables
  const audio = useAudio()
  const cat = useCat()
  const panels = usePanels()
  const language = useLanguage()

  // Stores (global state)
  const authStore = useAuthStore()
  const rankingsStore = useRankingsStore()
  const uiEffectsStore = useUIEffectsStore()

  // Load dark mode preference from localStorage
  const savedDarkMode = localStorage.getItem('darkMode')
  const savedDarkerMode = localStorage.getItem('darkerMode')
  const savedShowBreadcrumb = localStorage.getItem('showBreadcrumb')
  const darkMode = ref(savedDarkMode === 'true')
  const darkerMode = ref(savedDarkerMode === 'true')

  const showBreadcrumb = ref(savedShowBreadcrumb !== 'false')

  const musicPlaying = ref(false)
  const isMuted = ref(false)
  const currentQuoteIndex = ref(0)
  const mikaModalOpen = ref(false)
  const confirmationOpen = ref(false)
  const searchModalOpen = ref(false)
  const currentRoute = ref('home')

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
    const numToFetch = Math.floor(Math.random() * 3) + 3
    for (let i = 0; i < numToFetch; i++) {
      await fetchAdvice()
    }
  }

  // Actions
  const toggleDarkMode = () => {
    // Cycle through: light → dark → darker → light
    if (!darkMode.value && !darkerMode.value) {
      darkMode.value = true
      darkerMode.value = false
    } else if (darkMode.value && !darkerMode.value) {
      darkMode.value = true
      darkerMode.value = true
    } else {
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
    if (darkerMode.value) {
      darkMode.value = true
    }
    localStorage.setItem('darkMode', darkMode.value.toString())
    localStorage.setItem('darkerMode', darkerMode.value.toString())
    document.body.classList.toggle('dark', darkMode.value)
    document.body.classList.toggle('darker', darkerMode.value)
  }

  const toggleMusic = () => {
    musicPlaying.value = !musicPlaying.value
    audio.toggleMusic(musicPlaying.value)
    if (!isMuted.value) audio.playButtonClick()
  }

  const toggleMute = () => {
    isMuted.value = !isMuted.value
    if (isMuted.value) {
      audio.muteAll()
    } else {
      audio.unmuteAll()
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
        if (!adviceSlips.value.includes(advice)) {
          adviceSlips.value.push(advice)
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
    if (!isTemer3.value) {
      if (Math.random() < 0.3) {
        const advice = await fetchAdvice()
        if (advice) {
          currentQuoteIndex.value = quotes.value.length - 1
          return
        }
      }
      currentQuoteIndex.value = (currentQuoteIndex.value + 1) % quotes.value.length
    } else {
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

    uiEffectsStore.tachValue = randomValue
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

  const toggleBreadcrumb = () => {
    showBreadcrumb.value = !showBreadcrumb.value
    localStorage.setItem('showBreadcrumb', showBreadcrumb.value.toString())
  }

  return {
    // State
    darkMode,
    darkerMode,
    musicPlaying,
    isMuted,
    currentQuoteIndex,
    mikaModalOpen,
    confirmationOpen,
    searchModalOpen,
    currentRoute,
    showBreadcrumb,
    quotes,
    temer3Quotes,
    adviceSlips,
    tachValue: uiEffectsStore.tachValue,

    // Getters
    currentQuote,
    isTemer3,

    // Composables (expose directly)
    panels: panels.panels,
    catImage: cat.catImage,
    catLoading: cat.catLoading,

    // UI Effects (delegated to uiEffectsStore)
    chaosMode: uiEffectsStore.chaosMode,
    moldMode: uiEffectsStore.moldMode,
    performanceMode: uiEffectsStore.performanceMode,
    showHearts: uiEffectsStore.showHearts,
    maxHearts: uiEffectsStore.maxHearts,
    heartSpawnRate: uiEffectsStore.heartSpawnRate,

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
    toggleBreadcrumb,
    toggleMusic,
    toggleMute,
    togglePanel: panels.togglePanel,
    toggleChaosMode: uiEffectsStore.toggleChaosMode,
    toggleMoldMode: uiEffectsStore.toggleMoldMode,
    togglePerformanceMode: uiEffectsStore.togglePerformanceMode,
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
    createHeart: uiEffectsStore.createHeart,
    initMoldCircles: uiEffectsStore.initMoldCircles,
    createMoldCircle: uiEffectsStore.createMoldCircle,
    startMoldSpawner: uiEffectsStore.startMoldSpawner,
    stopMoldSpawner: uiEffectsStore.stopMoldSpawner,
    clearMoldCircles: uiEffectsStore.clearMoldCircles,
    updateMoldEffects: uiEffectsStore.updateMoldEffects,
    getTrendClass: rankingsStore.getTrendClass,

    // Auth actions (for backward compatibility)
    login: authStore.login,
    logout: authStore.logout,
    register: authStore.register,
    updateProfile: authStore.updateProfile
  }
})
