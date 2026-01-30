import { defineComponent, ref, onMounted, computed } from 'vue'
import { MainApp } from './components/MainApp'
import { Router } from './components/Router'

export default defineComponent({
  name: 'App',
  components: {
    MainApp,
    Router
  },
  setup() {
    // State
    const currentRoute = ref('home')
    const darkMode = ref(false)
    const musicPlaying = ref(false)
    const feedOpen = ref(false)
    const currentQuoteIndex = ref(0)
    const tachValue = ref(77)
    const fartClicked = ref(false)
    const fartExploded = ref(false)
    const mikaModalOpen = ref(false)
    const confirmationOpen = ref(false)
    const panelOpen = ref({
      rankings: true,
      cat: true,
      feed: false
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

    // Computed
    const currentQuote = computed(() => quotes.value[currentQuoteIndex.value])

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
    })

    return {
      currentRoute,
      darkMode,
      musicPlaying,
      feedOpen,
      currentQuote,
      catImage,
      catLoading,
      tachValue,
      fartClicked,
      fartExploded,
      panelOpen,
      mikaModalOpen,
      confirmationOpen,
      rankings,
      toggleDarkMode,
      toggleMusic,
      togglePanel,
      nextQuote,
      nextCat,
      onFart,
      onTurnMe,
      closeConfirmation,
      closeMikaModal,
      onRouteChange
    }
  },
  template: `
    <div class="main-app">
      <Router
        :current-route="currentRoute"
        @route-change="onRouteChange"
      />

      <MainApp
        :dark-mode="darkMode"
        :music-playing="musicPlaying"
        :current-route="currentRoute"
        :current-quote="currentQuote"
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
        @next-quote="nextQuote"
        @new-cat="nextCat"
        @fart="onFart"
        @turn-me="onTurnMe"
        @close-confirmation="closeConfirmation"
        @route-change="onRouteChange"
      />
    </div>
  `
})
