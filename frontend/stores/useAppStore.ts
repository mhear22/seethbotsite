import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAudio } from '../composables/useAudio'
import { useCat } from '../composables/useCat'
import { useRankings } from '../composables/useRankings'
import { usePanels } from '../composables/usePanels'

export const useAppStore = defineStore('app', () => {
  // Composables
  const audio = useAudio()
  const cat = useCat()
  const rankingsStore = useRankings()
  const panels = usePanels()

  // Load dark mode preference from localStorage
  const savedDarkMode = localStorage.getItem('darkMode')
  const darkMode = ref(savedDarkMode === 'true')
  const musicPlaying = ref(false)
  const currentQuoteIndex = ref(0)
  const tachValue = ref(50)
  const mikaModalOpen = ref(false)
  const confirmationOpen = ref(false)
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

  // Getters
  const currentQuote = computed(() => quotes.value[currentQuoteIndex.value])

  // Actions
  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value
    localStorage.setItem('darkMode', darkMode.value.toString())
    document.body.classList.toggle('dark', darkMode.value)
  }

  const toggleMusic = () => {
    musicPlaying.value = !musicPlaying.value
    audio.toggleMusic(musicPlaying.value)
  }

  const nextQuote = () => {
    currentQuoteIndex.value = (currentQuoteIndex.value + 1) % quotes.value.length
  }

  const onFart = () => {
    const randomValue = Math.floor(Math.random() * 100)
    const volume = randomValue / 50

    audio.playFart(volume)

    setTimeout(() => {
      confirmationOpen.value = true
    }, 300)

    tachValue.value = randomValue
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

  const onRouteChange = (route: string) => {
    currentRoute.value = route
  }

  const createHeart = () => {
    const heart = document.createElement('div')
    heart.className = 'heart'
    heart.innerHTML = ['💖', '💕', '💗', '💓', '❤️'][Math.floor(Math.random() * 5)]
    heart.style.left = Math.random() * 100 + 'vw'
    heart.style.animationDuration = (Math.random() * 3 + 3) + 's'
    document.body.appendChild(heart)
    setTimeout(() => heart.remove(), 6000)
  }

  return {
    // State
    darkMode,
    musicPlaying,
    currentQuoteIndex,
    tachValue,
    mikaModalOpen,
    confirmationOpen,
    currentRoute,
    quotes,

    // Getters
    currentQuote,

    // Composables (expose directly)
    panels: panels.panels,
    catImage: cat.catImage,
    catLoading: cat.catLoading,
    rankings: rankingsStore.rankings,
    rankingsLoading: rankingsStore.loading,

    // Actions
    toggleDarkMode,
    toggleMusic,
    togglePanel: panels.togglePanel,
    nextQuote,
    nextCat: cat.fetchNewCat,
    onFart,
    onTurnMe,
    closeConfirmation,
    closeMikaModal,
    onRouteChange,
    loadRankings: rankingsStore.loadRankings,
    createHeart,
    getTrendClass: rankingsStore.getTrendClass
  }
})
