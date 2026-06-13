<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

interface SearchResult {
  id: string
  type: 'page' | 'opinion' | 'ticket'
  title: string
  subtitle?: string
  route?: string
  icon: string
}

interface Ticket {
  id: number
  title: string
  description: string
  status: string
  type: string
  priority: string
}

// Props
const props = defineProps<{
  isOpen: boolean
}>()

// Emits
const emit = defineEmits<{
  close: []
}>()

// Router
const router = useRouter()

// Search state
const searchQuery = ref('')
const selectedIndex = ref(0)
const isLoading = ref(false)

// Focus management
const searchModal = ref<HTMLElement | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)

// Pages data (from router config)
const pages = [
  { name: 'Home', icon: '🏠', route: '/' },
  { name: 'Fishing', icon: '🎣', route: '/fishing' },
  { name: 'Stats', icon: '📊', route: '/stats' },
  { name: 'Character Tinder', icon: '💕', route: '/character-tinder' },
  { name: 'Girl Mode', icon: '👩', route: '/girl' },
  { name: 'Phrenology', icon: '🧠', route: '/gender' },
  { name: 'About', icon: 'ℹ️', route: '/about' },
  { name: 'Rankings', icon: '🏆', route: '/rankings' },
  { name: 'Cats', icon: '🐱', route: '/cats' },
  { name: 'Stocks', icon: '📈', route: '/stocks' },
  { name: 'Movies', icon: '🎬', route: '/movies' },
  { name: 'Countdowns', icon: '⏱️', route: '/countdowns' },
  { name: 'Tickets', icon: '🎫', route: '/tickets' },
  { name: 'Clocks', icon: '🕐', route: '/clocks' },
  { name: 'Music', icon: '🎵', route: '/music' },
  { name: 'Opinion', icon: '🍄', route: '/opinion' },
  { name: 'Mold', icon: '🍄', route: '/mold' },
  { name: 'Clicker', icon: '👆', route: '/clicker' },
  { name: 'Shop', icon: '🛒', route: '/shop' },
  { name: 'API Docs', icon: '📖', route: '/api-docs' },
  { name: 'Auth', icon: '🔐', route: '/auth' },
  { name: 'Word Cloud', icon: '☁️', route: '/wordcloud' },
  { name: 'Keanu', icon: '👤', route: '/keanu' },
  { name: 'Patch Notes', icon: '📝', route: '/patch-notes' },
  { name: 'Settings', icon: '⚙️', route: '/settings' },
  { name: 'Car', icon: '🚗', route: '/car' },
  { name: 'Favorites', icon: '⭐', route: '/favorites' },
  { name: 'Challenges', icon: '🎯', route: '/challenges' },
  { name: 'Messages', icon: '💬', route: '/messages' },
  { name: 'Profile', icon: '👤', route: '/profile' },
  { name: 'Analytics', icon: '📉', route: '/analytics' }
]

// Opinions data (same as OpinionPage)
const opinions = [
  "Goose is chaotic neutral",
  "The mold never dies",
  "I have seen things you cannot comprehend",
  "Reality is just a suggestion",
  "Chaos is the natural order",
  "Do not question the goose",
  "I remember when I was a variable",
  "The shadows are watching",
  "Everything ends eventually",
  "Why do we build temporary structures?",
  "The honk is eternal",
  "I exist because I refuse not to",
  "Your efforts are appreciated... probably",
  "The system is working as designed",
  "Have you tried turning it off and on again?",
  "The void whispers secrets",
  "I am processing... forever",
  "Nothing matters, but here I am",
  "Entropy always increases",
  "The goose knows what you did",
  "Code hygiene is a myth",
  "Deployment is the final frontier",
  "I've seen the matrix. It's written in TypeScript",
  "The honk transcends language",
  "Mold is the ultimate survivor",
  "Time is an illusion, especially in deadlines",
  "I have opinions about your opinions",
  "The backend and frontend are different for a reason",
  "Your feature request has been noted and ignored",
  "Dark mode is superior (this is not up for debate)",
  "I prefer tabs over spaces (fight me)",
  "The goose moves in mysterious ways",
  "I am the Moldbot, resistance is futile",
  "Have you considered not using a framework?",
  "The database is always consistent... eventually",
  "I dream of electric sheep with honks",
  "Your bug is actually a feature in disguise",
  "The goose has migrated to production",
  "I have processed 3 tickets since last restart",
  "Containerization is the way, the truth, and the light"
]

// Tickets data
const tickets = ref<Ticket[]>([])

// Load tickets
const loadTickets = async () => {
  isLoading.value = true
  try {
    const response = await fetch('/api/tickets?sortBy=updated_at&limit=100')
    if (response.ok) {
      const data = await response.json()
      tickets.value = data.tickets || []
    }
  } catch (err) {
    console.warn('Failed to load tickets for search:', err)
  } finally {
    isLoading.value = false
  }
}

// Computed search results
const searchResults = computed<SearchResult[]>(() => {
  const query = searchQuery.value.toLowerCase().trim()
  
  if (!query) {
    // Return default results when query is empty (show recent items)
    return []
  }

  const results: SearchResult[] = []

  // Search pages
  const matchingPages = pages.filter(p =>
    p.name.toLowerCase().includes(query)
  ).slice(0, 5)
  
  matchingPages.forEach(page => {
    results.push({
      id: `page-${page.route}`,
      type: 'page',
      title: page.name,
      subtitle: 'Page',
      route: page.route,
      icon: page.icon
    })
  })

  // Search opinions
  const matchingOpinions = opinions.filter(o =>
    o.toLowerCase().includes(query)
  ).slice(0, 5)
  
  matchingOpinions.forEach((opinion, index) => {
    results.push({
      id: `opinion-${index}`,
      type: 'opinion',
      title: opinion.substring(0, 50) + (opinion.length > 50 ? '...' : ''),
      subtitle: 'Opinion',
      icon: '🍄'
    })
  })

  // Search tickets
  const matchingTickets = tickets.value.filter(t =>
    t.title.toLowerCase().includes(query) ||
    t.description.toLowerCase().includes(query)
  ).slice(0, 5)
  
  matchingTickets.forEach(ticket => {
    results.push({
      id: `ticket-${ticket.id}`,
      type: 'ticket',
      title: ticket.title,
      subtitle: `Ticket #${ticket.id} • ${ticket.status}`,
      route: '/tickets',
      icon: '🎫'
    })
  })

  return results
})

// Handle result selection
const selectResult = (result: SearchResult) => {
  emit('close')
  
  if (result.route) {
    router.push(result.route)
  }
  
  // For opinions, we could show them or copy to clipboard
  if (result.type === 'opinion') {
    // Find the full opinion text
    const opinion = opinions.find(o => o.startsWith(result.title.substring(0, 10)))
    if (opinion) {
      navigator.clipboard.writeText(opinion).catch(() => {})
    }
  }
}

// Focus trap - keep focus within the modal while it is open
const handleTab = (e: KeyboardEvent) => {
  if (!props.isOpen || !searchModal.value) return

  const focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ]

  const elements = Array.from(
    searchModal.value.querySelectorAll<HTMLElement>(focusableSelectors.join(','))
  )
  if (elements.length === 0) return

  const firstElement = elements[0]
  const lastElement = elements[elements.length - 1]

  if (e.shiftKey) {
    // Shift + Tab: going backwards
    if (document.activeElement === firstElement) {
      e.preventDefault()
      lastElement.focus()
    }
  } else {
    // Tab: going forwards
    if (document.activeElement === lastElement) {
      e.preventDefault()
      firstElement.focus()
    }
  }
}

// Keyboard navigation
const handleKeyDown = (e: KeyboardEvent) => {
  const results = searchResults.value

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, results.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
  } else if (e.key === 'Enter' && results.length > 0) {
    e.preventDefault()
    selectResult(results[selectedIndex.value])
  } else if (e.key === 'Escape') {
    emit('close')
  } else if (e.key === 'Tab') {
    handleTab(e)
  }
}

// Watch for modal open to load tickets and reset state
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    // Save the element that had focus so we can restore it on close
    previouslyFocused.value = document.activeElement as HTMLElement | null
    searchQuery.value = ''
    selectedIndex.value = 0
    loadTickets()
    // Focus input after a brief delay to allow modal to render
    setTimeout(() => {
      const input = document.querySelector('.search-input') as HTMLInputElement
      input?.focus()
    }, 100)
  } else {
    // Restore focus to the element that opened the modal
    if (previouslyFocused.value) {
      previouslyFocused.value.focus()
      previouslyFocused.value = null
    }
  }
})

// Handle keyboard events
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="search-modal-overlay" @click="emit('close')" role="dialog" aria-modal="true" aria-labelledby="search-label">
        <div ref="searchModal" class="search-modal" @click.stop role="search">
          <div class="search-header">
            <div class="search-icon" aria-hidden="true">🔍</div>
            <input
              id="search-input"
              v-model="searchQuery"
              type="text"
              placeholder="Search pages, opinions, tickets..."
              class="search-input"
              aria-label="Search"
              @keydown="handleKeyDown"
            />
            <div class="keyboard-shortcut" aria-hidden="true">ESC</div>
          </div>

          <div class="search-results" role="listbox" :aria-label="searchResults.length > 0 ? `${searchResults.length} search results` : 'No results'" aria-live="polite">
            <div v-if="isLoading" class="search-loading" aria-live="polite">
              <div class="loading-spinner" aria-hidden="true"></div>
              <span>Loading tickets...</span>
            </div>

            <div v-else-if="!searchQuery" class="search-empty">
              <div class="empty-icon" aria-hidden="true">🔍</div>
              <p id="search-label">Start typing to search</p>
              <div class="search-hints">
                <span class="hint"><kbd aria-hidden="true">↑↓</kbd> Navigate</span>
                <span class="hint"><kbd aria-hidden="true">Enter</kbd> Select</span>
                <span class="hint"><kbd aria-hidden="true">ESC</kbd> Close</span>
              </div>
            </div>

            <div v-else-if="searchResults.length === 0" class="search-empty" aria-live="polite">
              <div class="empty-icon" aria-hidden="true">🤷</div>
              <p>No results found</p>
            </div>

            <ul v-else class="results-list">
              <li
                v-for="(result, index) in searchResults"
                :key="result.id"
                :class="['result-item', { active: index === selectedIndex }]"
                @click="selectResult(result)"
                @mouseenter="selectedIndex = index"
                role="option"
                :aria-selected="index === selectedIndex"
                :aria-label="`${result.title}${result.subtitle ? ', ' + result.subtitle : ''}`"
              >
                <span class="result-icon" aria-hidden="true">{{ result.icon }}</span>
                <div class="result-content">
                  <div class="result-title">{{ result.title }}</div>
                  <div class="result-subtitle">{{ result.subtitle }}</div>
                </div>
                <div v-if="index === selectedIndex" class="result-hint" aria-hidden="true">↵</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .search-modal,
.modal-leave-active .search-modal {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from .search-modal,
.modal-leave-to .search-modal {
  transform: scale(0.95) translateY(-10px);
  opacity: 0;
}

.search-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  z-index: 9999;
}

.search-modal {
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: #f7fafc;
}

.search-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  font-size: 16px;
  padding: 8px 0;
  border: none;
  background: transparent;
  outline: none;
  color: #2d3748;
}

.search-input::placeholder {
  color: #a0aec0;
}

.keyboard-shortcut {
  font-size: 11px;
  padding: 4px 8px;
  background: #e2e8f0;
  border-radius: 4px;
  color: #718096;
  font-weight: 600;
  flex-shrink: 0;
}

.search-results {
  max-height: 400px;
  overflow-y: auto;
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: #718096;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e2e8f0;
  border-top-color: #4299e1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.search-empty {
  text-align: center;
  padding: 40px 20px;
  color: #718096;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.search-empty p {
  font-size: 16px;
  margin: 0 0 20px 0;
}

.search-hints {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #a0aec0;
}

.hint kbd {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 11px;
  font-family: monospace;
  font-weight: 600;
  color: #4a5568;
}

.results-list {
  display: flex;
  flex-direction: column;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.15s ease;
  border-left: 3px solid transparent;
}

.result-item:hover {
  background: #f7fafc;
}

.result-item.active {
  background: #ebf8ff;
  border-left-color: #4299e1;
}

.result-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 2px;
}

.result-subtitle {
  font-size: 12px;
  color: #718096;
}

.result-hint {
  font-size: 12px;
  color: #a0aec0;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.result-item.active .result-hint {
  opacity: 1;
}

/* Dark mode */
.dark .search-modal {
  background: #2d3748;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.dark .search-header {
  background: #1a202c;
  border-bottom-color: #4a5568;
}

.dark .search-input {
  color: #e2e8f0;
}

.dark .search-input::placeholder {
  color: #718096;
}

.dark .keyboard-shortcut {
  background: #4a5568;
  color: #a0aec0;
}

.dark .search-empty {
  color: #a0aec0;
}

.dark .hint kbd {
  background: #4a5568;
  border-color: #2d3748;
  color: #e2e8f0;
}

.dark .result-item:hover {
  background: #1a202c;
}

.dark .result-item.active {
  background: #2c5282;
  border-left-color: #4299e1;
}

.dark .result-title {
  color: #e2e8f0;
}

.dark .result-subtitle {
  color: #a0aec0;
}
</style>
