<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Types
interface SearchResult {
  type: 'movie' | 'shop_item' | 'quote' | 'advice'
  id: string
  title?: string
  description?: string
  relevance: number
  metadata?: Record<string, any>
}

interface SearchResponse {
  query: string
  results: SearchResult[]
  count: number
  timestamp: string
}

// State
const query = ref('')
const selectedTypes = ref<string[]>(['movie', 'shop_item', 'quote', 'advice'])
const isLoading = ref(false)
const searchResults = ref<SearchResult[]>([])
const lastQuery = ref('')
const totalCount = ref(0)
const searchTime = ref<number | null>(null)

const availableTypes = [
  { id: 'movie', label: 'Movies', icon: '🎬' },
  { id: 'shop_item', label: 'Shop Items', icon: '🛒' },
  { id: 'quote', label: 'Quotes', icon: '💬' },
  { id: 'advice', label: 'Advice', icon: '💡' }
]

// Computed
const hasResults = computed(() => searchResults.value.length > 0)
const hasQuery = computed(() => query.value.trim().length > 0)

// Group results by type
const groupedResults = computed(() => {
  const groups: Record<string, SearchResult[]> = {}
  for (const result of searchResults.value) {
    if (!groups[result.type]) {
      groups[result.type] = []
    }
    groups[result.type].push(result)
  }
  return groups
})

// Methods
async function performSearch() {
  const trimmedQuery = query.value.trim()
  if (!trimmedQuery) {
    searchResults.value = []
    lastQuery.value = ''
    totalCount.value = 0
    return
  }

  isLoading.value = true
  const startTime = performance.now()

  try {
    const typesParam = selectedTypes.value.join(',')
    const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}&types=${typesParam}`)
    const data: SearchResponse = await response.json()

    searchResults.value = data.results
    lastQuery.value = data.query
    totalCount.value = data.count
    searchTime.value = performance.now() - startTime
  } catch (error) {
    console.error('Search error:', error)
    searchResults.value = []
    totalCount.value = 0
  } finally {
    isLoading.value = false
  }
}

// Debounce search
let debounceTimer: NodeJS.Timeout | null = null

function onQueryInput() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    performSearch()
  }, 300)
}

function onTypeChange() {
  performSearch()
}

function getTypeLabel(type: string): string {
  const typeInfo = availableTypes.find(t => t.id === type)
  return typeInfo?.label || type
}

function getTypeIcon(type: string): string {
  const typeInfo = availableTypes.find(t => t.id === type)
  return typeInfo?.icon || '📄'
}

function getRelevanceColor(relevance: number): string {
  if (relevance >= 0.9) return '#10b981' // green
  if (relevance >= 0.7) return '#f59e0b' // amber
  return '#6b7280' // gray
}

function getResultLink(result: SearchResult): string {
  switch (result.type) {
    case 'movie':
      return '/movies'
    case 'shop_item':
      return '/shop'
    case 'quote':
    case 'advice':
      return '/#quotes'
    default:
      return '/'
  }
}
</script>

<template>
  <div class="search-page">
    <div class="search-container">
      <!-- Header -->
      <div class="search-header">
        <h1>🔍 Search</h1>
        <p class="subtitle">Find movies, shop items, quotes, and more</p>
      </div>

      <!-- Search Form -->
      <div class="search-form">
        <div class="search-input-wrapper">
          <input
            v-model="query"
            type="text"
            class="search-input"
            placeholder="What are you looking for?"
            @input="onQueryInput"
            @keyup.enter="performSearch"
          />
          <button
            v-if="query"
            class="clear-btn"
            @click="query = ''; searchResults = []"
            aria-label="Clear search"
          >
            ✕
          </button>
          <div v-if="isLoading" class="search-spinner"></div>
        </div>

        <!-- Type Filters -->
        <div class="type-filters">
          <label class="filter-label">Search in:</label>
          <div class="filter-options">
            <label
              v-for="type in availableTypes"
              :key="type.id"
              class="filter-checkbox"
            >
              <input
                v-model="selectedTypes"
                type="checkbox"
                :value="type.id"
                @change="onTypeChange"
              />
              <span class="filter-icon">{{ type.icon }}</span>
              <span class="filter-label-text">{{ type.label }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Results Stats -->
      <div v-if="lastQuery && !isLoading" class="search-stats">
        <span class="stat-text">
          Found <strong>{{ totalCount }}</strong> result{{ totalCount !== 1 ? 's' : '' }}
          for "<strong>{{ lastQuery }}</strong>"
        </span>
        <span v-if="searchTime" class="stat-time">
          {{ searchTime.toFixed(0) }}ms
        </span>
      </div>

      <!-- Results -->
      <div v-if="isLoading" class="search-loading">
        <div class="loading-spinner"></div>
        <p>Searching...</p>
      </div>

      <div v-else-if="hasResults" class="search-results">
        <div
          v-for="(results, type) in groupedResults"
          :key="type"
          class="result-group"
        >
          <h2 class="group-header">
            <span class="group-icon">{{ getTypeIcon(type) }}</span>
            {{ getTypeLabel(type) }}
            <span class="group-count">({{ results.length }})</span>
          </h2>

          <div class="result-list">
            <div
              v-for="result in results"
              :key="result.id"
              class="result-item"
            >
              <div class="result-main">
                <!-- Movie Result -->
                <template v-if="result.type === 'movie'">
                  <div class="result-header">
                    <h3 class="result-title">{{ result.title }}</h3>
                    <div
                      class="relevance-indicator"
                      :style="{ color: getRelevanceColor(result.relevance) }"
                    >
                      {{ Math.round(result.relevance * 100) }}%
                    </div>
                  </div>
                  <p class="result-description">{{ result.description }}</p>
                  <div v-if="result.metadata" class="result-meta">
                    <span v-if="result.metadata.year" class="meta-tag">{{ result.metadata.year }}</span>
                    <span v-if="result.metadata.genre" class="meta-tag">{{ result.metadata.genre }}</span>
                    <span v-if="result.metadata.suggestedBy" class="meta-tag">by {{ result.metadata.suggestedBy }}</span>
                  </div>
                </template>

                <!-- Shop Item Result -->
                <template v-else-if="result.type === 'shop_item'">
                  <div class="result-header">
                    <div class="shop-item-title">
                      <span class="shop-icon">{{ result.metadata?.icon }}</span>
                      <h3 class="result-title">{{ result.title }}</h3>
                    </div>
                    <div class="shop-item-meta">
                      <span class="shop-cost">{{ result.metadata?.cost }} pts</span>
                      <div
                        class="relevance-indicator"
                        :style="{ color: getRelevanceColor(result.relevance) }"
                      >
                        {{ Math.round(result.relevance * 100) }}%
                      </div>
                    </div>
                  </div>
                  <p class="result-description">{{ result.description }}</p>
                  <div v-if="result.metadata?.category" class="result-meta">
                    <span class="meta-tag">{{ result.metadata.category }}</span>
                  </div>
                </template>

                <!-- Quote/Advice Result -->
                <template v-else-if="result.type === 'quote' || result.type === 'advice'">
                  <div class="result-header">
                    <span class="quote-icon">{{ result.type === 'quote' ? '💬' : '💡' }}</span>
                    <div
                      class="relevance-indicator"
                      :style="{ color: getRelevanceColor(result.relevance) }"
                    >
                      {{ Math.round(result.relevance * 100) }}%
                    </div>
                  </div>
                  <p class="result-quote">"{{ result.description }}"</p>
                  <div class="result-meta">
                    <span class="meta-tag">{{ result.type === 'quote' ? 'Northernlion Quote' : 'Advice' }}</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty States -->
      <div v-else-if="hasQuery && !isLoading" class="search-empty">
        <div class="empty-icon">🔍</div>
        <h3>No results found</h3>
        <p>Try adjusting your search or filters</p>
      </div>

      <div v-else class="search-placeholder">
        <div class="placeholder-icon">🎯</div>
        <h3>Search across everything</h3>
        <p>Type something to search movies, shop items, quotes, and advice</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.search-container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

/* Header */
.search-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2.5rem 2rem;
  text-align: center;
}

.search-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

/* Search Form */
.search-form {
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.search-input-wrapper {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 1rem 3rem 1rem 1rem;
  font-size: 1.1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #9ca3af;
  padding: 0.25rem;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: #6b7280;
}

.search-spinner {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: translateY(-50%) rotate(360deg); }
}

/* Type Filters */
.type-filters {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-label {
  font-weight: 600;
  color: #374151;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.filter-checkbox:hover {
  background: #e5e7eb;
}

.filter-checkbox input {
  cursor: pointer;
}

.filter-icon {
  font-size: 1.2rem;
}

.filter-label-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}

/* Search Stats */
.search-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.stat-text {
  color: #6b7280;
  font-size: 0.9rem;
}

.stat-text strong {
  color: #374151;
}

.stat-time {
  color: #9ca3af;
  font-size: 0.8rem;
  background: #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

/* Search Results */
.search-results {
  padding: 2rem;
}

.result-group {
  margin-bottom: 2.5rem;
}

.result-group:last-child {
  margin-bottom: 0;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #374151;
}

.group-icon {
  font-size: 1.5rem;
}

.group-count {
  color: #9ca3af;
  font-size: 1rem;
  font-weight: normal;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-item {
  padding: 1.25rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.result-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.result-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

.result-description {
  margin: 0.5rem 0;
  color: #4b5563;
  line-height: 1.6;
}

.result-quote {
  margin: 0.75rem 0;
  font-style: italic;
  color: #374151;
  font-size: 1.05rem;
  line-height: 1.6;
}

.result-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.meta-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #e5e7eb;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #4b5563;
}

.relevance-indicator {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

/* Shop Item Specific */
.shop-item-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.shop-icon {
  font-size: 1.5rem;
}

.shop-item-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.shop-cost {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
}

/* Quote Specific */
.quote-icon {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

/* Loading State */
.search-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

.search-loading p {
  margin: 0;
}

/* Empty States */
.search-empty,
.search-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon,
.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.search-empty h3,
.search-placeholder h3 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 1.5rem;
}

.search-empty p,
.search-placeholder p {
  margin: 0;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 640px) {
  .search-page {
    padding: 1rem;
  }

  .search-header h1 {
    font-size: 1.8rem;
  }

  .search-form {
    padding: 1.5rem;
  }

  .search-results {
    padding: 1.5rem;
  }

  .filter-options {
    gap: 0.5rem;
  }

  .result-header {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
