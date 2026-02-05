<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '../../stores/useAppStore'

const appStore = useAppStore()

interface Word {
  text: string
  weight: number
  color: string
  x: number
  y: number
  rotation: number
}

const words = ref<Word[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Word bank with themes
const wordThemes = {
  technology: [
    { text: 'AI', weight: 10 },
    { text: 'Code', weight: 9 },
    { text: 'Robot', weight: 8 },
    { text: 'Data', weight: 7 },
    { text: 'Cloud', weight: 6 },
    { text: 'App', weight: 5 },
    { text: 'Web', weight: 4 },
    { text: 'Tech', weight: 3 },
    { text: 'Software', weight: 2 },
    { text: 'Digital', weight: 1 }
  ],
  nature: [
    { text: 'Ocean', weight: 10 },
    { text: 'Forest', weight: 9 },
    { text: 'Mountain', weight: 8 },
    { text: 'River', weight: 7 },
    { text: 'Cloud', weight: 6 },
    { text: 'Sun', weight: 5 },
    { text: 'Moon', weight: 4 },
    { text: 'Star', weight: 3 },
    { text: 'Tree', weight: 2 },
    { text: 'Flower', weight: 1 }
  ],
  animals: [
    { text: 'Elephant', weight: 10 },
    { text: 'Tiger', weight: 9 },
    { text: 'Dolphin', weight: 8 },
    { text: 'Eagle', weight: 7 },
    { text: 'Wolf', weight: 6 },
    { text: 'Fox', weight: 5 },
    { text: 'Bear', weight: 4 },
    { text: 'Lion', weight: 3 },
    { text: 'Cat', weight: 2 },
    { text: 'Dog', weight: 1 }
  ],
  music: [
    { text: 'Melody', weight: 10 },
    { text: 'Rhythm', weight: 9 },
    { text: 'Harmony', weight: 8 },
    { text: 'Beat', weight: 7 },
    { text: 'Tempo', weight: 6 },
    { text: 'Note', weight: 5 },
    { text: 'Chord', weight: 4 },
    { text: 'Sound', weight: 3 },
    { text: 'Song', weight: 2 },
    { text: 'Music', weight: 1 }
  ]
}

const colors = [
  '#ff6b9d',
  '#ff8a80',
  '#ffd89b',
  '#87ceeb',
  '#a0e7e5',
  '#b4f8c8',
  '#fbc2eb',
  '#a6c1ee',
  '#d4a5a5',
  '#f5f5dc'
]

let currentTheme: string = 'technology'

const generateWordCloud = () => {
  loading.value = true
  error.value = null

  try {
    const theme = wordThemes[currentTheme as keyof typeof wordThemes]
    const generatedWords: Word[] = []

    // Generate words with random positions and colors
    theme.forEach((wordData, index) => {
      const word: Word = {
        text: wordData.text,
        weight: wordData.weight,
        color: colors[Math.floor(Math.random() * colors.length)],
        x: Math.random() * 80 + 10, // 10-90% position
        y: Math.random() * 80 + 10, // 10-90% position
        rotation: Math.random() * 30 - 15 // -15 to 15 degrees
      }
      generatedWords.push(word)
    })

    // Add some duplicates for visual interest
    const duplicates = generatedWords.slice(0, 3)
    duplicates.forEach(word => {
      generatedWords.push({
        ...word,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        rotation: Math.random() * 30 - 15
      })
    })

    words.value = generatedWords.sort((a, b) => b.weight - a.weight)
  } catch (err) {
    error.value = 'Failed to generate word cloud'
    console.error('Error generating word cloud:', err)
  } finally {
    loading.value = false
  }
}

const changeTheme = (theme: string) => {
  currentTheme = theme
  generateWordCloud()
}

onMounted(() => {
  generateWordCloud()
})

const getWordStyle = (word: Word) => {
  const fontSize = Math.max(1.5, word.weight * 0.8)
  return {
    fontSize: `${fontSize}rem`,
    color: word.color,
    left: `${word.x}%`,
    top: `${word.y}%`,
    transform: `rotate(${word.rotation}deg)`,
    opacity: word.weight / 10 + 0.2
  }
}
</script>

<template>
  <div class="wordcloud-page" :class="{ dark: appStore.darkMode }">
    <div class="wordcloud-header">
      <h1>☁️ Word Cloud</h1>
      <p class="subtitle">Visualize words in a beautiful cloud format</p>
    </div>

    <!-- Theme selector -->
    <div class="theme-selector">
      <button
        v-for="(theme, themeName) in wordThemes"
        :key="themeName"
        class="theme-button"
        :class="{ active: currentTheme === themeName }"
        @click="changeTheme(themeName)"
      >
        {{ themeName.charAt(0).toUpperCase() + themeName.slice(1) }}
      </button>
    </div>

    <!-- Regenerate button -->
    <div class="regenerate-section">
      <button class="regenerate-button" @click="generateWordCloud" :disabled="loading">
        🔄 {{ loading ? 'Generating...' : 'Regenerate Cloud' }}
      </button>
    </div>

    <!-- Word cloud visualization -->
    <div v-if="loading" class="wordcloud-loading">
      <span class="loading-spinner">⏳</span>
      <p>Generating word cloud...</p>
    </div>

    <div v-else-if="error" class="wordcloud-error">
      <span class="error-icon">⚠️</span>
      <p>{{ error }}</p>
      <button class="retry-button" @click="generateWordCloud">🔄 Try Again</button>
    </div>

    <div v-else class="wordcloud-container">
      <div class="wordcloud">
        <div
          v-for="(word, index) in words"
          :key="index"
          class="word"
          :style="getWordStyle(word)"
        >
          {{ word.text }}
        </div>
      </div>
    </div>

    <div class="footer-note">
      <p>💡 Click on different themes to see word clouds for various topics</p>
      <p>🎨 Word size and opacity based on importance weight</p>
    </div>
  </div>
</template>

<style scoped>
.wordcloud-page {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  transition: background 0.5s ease;
}

.wordcloud-page.dark {
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #5b21b6 100%);
}

.wordcloud-header {
  text-align: center;
  margin-bottom: 30px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.wordcloud-header h1 {
  font-size: 2.5rem;
  color: #ff6b9d;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #ff6b9d, #ff8a80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  margin: 0;
}

.dark .subtitle {
  color: #a0a0a0;
}

.theme-selector {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.theme-button {
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid #ff6b9d;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dark .theme-button {
  background: rgba(40, 44, 52, 0.8);
  color: #e2e8f0;
  border-color: #ffb6c1;
}

.theme-button:hover {
  background: #ff6b9d;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 107, 157, 0.3);
}

.theme-button.active {
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8a80 100%);
  color: white;
  border-color: #ff6b9d;
}

.regenerate-section {
  text-align: center;
  margin-bottom: 30px;
}

.regenerate-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.regenerate-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.regenerate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.wordcloud-loading,
.wordcloud-error {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner,
.error-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 15px;
}

.wordcloud-loading p,
.wordcloud-error p {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.dark .wordcloud-loading p,
.dark .wordcloud-error p {
  color: #a0a0a0;
}

.retry-button {
  margin-top: 20px;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8a80 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 107, 157, 0.3);
}

.wordcloud-container {
  max-width: 800px;
  margin: 0 auto 40px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.dark .wordcloud-container {
  background: rgba(40, 44, 52, 0.95);
}

.wordcloud {
  position: relative;
  min-height: 400px;
  height: 500px;
  overflow: hidden;
  border-radius: 15px;
  background: linear-gradient(135deg, #fff5f8 0%, #fff 100%);
}

.dark .wordcloud {
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.1) 0%, rgba(40, 44, 52, 1) 100%);
}

.word {
  position: absolute;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s ease, filter 0.3s ease;
  user-select: none;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.word:hover {
  transform: scale(1.2) !important;
  filter: brightness(1.1);
  z-index: 100;
}

.footer-note {
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  max-width: 800px;
  margin: 0 auto;
}

.dark .footer-note {
  background: rgba(40, 44, 52, 0.8);
}

.footer-note p {
  color: #666;
  font-size: 0.9rem;
  margin: 5px 0;
}

.dark .footer-note p {
  color: #a0a0a0;
}

@media (max-width: 768px) {
  .wordcloud-header h1 {
    font-size: 2rem;
  }

  .wordcloud-container {
    margin: 0 10px 30px;
    padding: 20px 15px;
  }

  .wordcloud {
    min-height: 300px;
    height: 400px;
  }

  .theme-selector {
    gap: 8px;
  }

  .theme-button {
    padding: 8px 16px;
    font-size: 0.9rem;
  }
}
</style>
