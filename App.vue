<script setup lang="ts">
import { ref, onMounted, computed, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainApp from './components/MainApp.vue'
import Router from './components/Router.vue'

// Router
const router = useRouter()

// State
const darkMode = ref(false)
const musicPlaying = ref(false)
const feedOpen = ref(false)
const currentQuoteIndex = ref(0)
const tachValue = ref(50)
const fartClicked = ref(false)
const fartExploded = ref(false)
const mikaModalOpen = ref(false)
const confirmationOpen = ref(false)
const currentRoute = ref('home')
const panelOpen = ref({
  rankings: true,
  cat: true,
  feed: false,
  digitalGoose: true,
  coolnessPanel: true
})

// Data
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

const catImage = ref('https://cataas.com/cat')
const catLoading = ref(false)
const rankings = ref([])

// Methods
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  document.body.classList.toggle('dark', darkMode.value)
}

const toggleMusic = () => {
  musicPlaying.value = !musicPlaying.value
  const music = document.getElementById('newMusic') as HTMLAudioElement
  if (musicPlaying.value) {
    music.play()
  } else {
    music.pause()
  }
}

const togglePanel = (panelName: keyof typeof panelOpen.value) => {
  panelOpen.value[panelName] = !panelOpen.value[panelName]
}

const nextQuote = () => {
  currentQuoteIndex.value = (currentQuoteIndex.value + 1) % quotes.value.length
}

const nextCat = async () => {
  try {
    catLoading.value = true
    const response = await fetch('https://cataas.com/cat')
    if (!response.ok) {
      console.error('Failed to fetch cat:', response.status)
      return
    }

    const blob = await response.blob()
    const imageUrl = URL.createObjectURL(blob)
    catImage.value = imageUrl
  } catch (error) {
    console.error('Error fetching cat:', error)
  } finally {
    catLoading.value = false
  }
}

const onFart = () => {
  if (fartClicked.value) return
  fartClicked.value = true

  const fart = document.getElementById('fartSound') as HTMLAudioElement
  if (fart) {
    fart.currentTime = 0
    fart.play()
  }

  setTimeout(() => {
    confirmationOpen.value = true
  }, 300)

  fartExploded.value = true
  setTimeout(() => {
    fartExploded.value = false
    fartClicked.value = false
  }, 500)

  tachValue.value = Math.floor(Math.random() * 100)
}

const onTurnMe = () => {
  const fart = document.getElementById('fartSound') as HTMLAudioElement
  if (fart) {
    fart.currentTime = 0
    fart.play()
  }

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
  router.push(`/${route}`)
}

const loadRankings = async () => {
  try {
    const response = await fetch('/api/rankings')
    const data = await response.json()
    rankings.value = data
  } catch (err) {
    console.error('Failed to load rankings:', err)
  }
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

// Provide shared state to child components
provide('darkMode', darkMode)
provide('musicPlaying', musicPlaying)
provide('panelOpen', panelOpen)
provide('rankings', rankings)
provide('currentQuote', computed(() => quotes.value[currentQuoteIndex.value]))
provide('catImage', catImage)
provide('catLoading', catLoading)
provide('tachValue', tachValue)
provide('fartClicked', fartClicked)
provide('fartExploded', fartExploded)
provide('mikaModalOpen', mikaModalOpen)
provide('confirmationOpen', confirmationOpen)

// Provide methods
provide('toggleDarkMode', toggleDarkMode)
provide('toggleMusic', toggleMusic)
provide('togglePanel', togglePanel)
provide('nextQuote', nextQuote)
provide('nextCat', nextCat)
provide('onFart', onFart)
provide('onTurnMe', onTurnMe)
provide('closeConfirmation', closeConfirmation)
provide('closeMikaModal', closeMikaModal)

// Lifecycle
onMounted(() => {
  document.body.classList.toggle('dark', darkMode.value)
  setInterval(createHeart, 500)

  // Load initial rankings from API
  fetch('/api/rankings')
    .then(res => res.json())
    .then(data => {
      rankings.value = data
    })
    .catch(err => console.error('Failed to load rankings:', err))

  // Riddle answer for Orlando 🍆
  console.log('🩺 Riddle Answer: The surgeon is his mother.')

  // Refresh rankings every 30 seconds
  setInterval(loadRankings, 30000)
})

</script>

<template>
  <MainApp
    :dark-mode="darkMode"
    :music-playing="musicPlaying"
    :current-route="currentRoute"
    :current-quote="quotes[currentQuoteIndex]"
    :current-cat-image="catImage"
    :tach-value="tachValue"
    :fart-clicked="fartClicked"
    :fart-exploded="fartExploded"
    :rankings="rankings"
    :panels="panelOpen"
    :mika-modal-open="mikaModalOpen"
    :confirmation-open="confirmationOpen"
    @toggle-dark-mode="toggleDarkMode"
    @toggle-music="toggleMusic"
    @toggle-panel="togglePanel"
    @route-change="onRouteChange"
    @mika-close="closeMikaModal"
    @close-confirmation="closeConfirmation"
    @next-quote="nextQuote"
    @new-cat="nextCat"
    @fart="onFart"
    @turn-me="onTurnMe"
  />
</template>
