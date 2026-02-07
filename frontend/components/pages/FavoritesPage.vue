<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavorites, type FavoriteItem } from '../../composables/useFavorites'
import { useAppStore } from '../../stores/useAppStore'
import EmojiRenderer from '../shared/ui/EmojiRenderer.vue'

const router = useRouter()
const appStore = useAppStore()
const {
  allFavorites,
  getFavoritesByType,
  toggleFavorite,
  clearFavorites,
  favoritesCount
} = useFavorites()

// Get favorites grouped by type
const catFavorites = getFavoritesByType('cat')
const rankingFavorites = getFavoritesByType('ranking')
const ticketFavorites = getFavoritesByType('ticket')
const quoteFavorites = getFavoritesByType('quote')

// Computed for sections that have items
const hasFavorites = computed(() => favoritesCount.value > 0)

const navigateToCat = () => {
  router.push('/cats')
}

const navigateToRankings = () => {
  router.push('/rankings')
}

const navigateToTickets = () => {
  router.push('/tickets')
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const handleClearAll = () => {
  if (confirm('Are you sure you want to clear all favorites?')) {
    clearFavorites()
  }
}
</script>

<template>
  <div class="favorites-page">
    <div class="favorites-container">
      <div class="favorites-header">
        <h1>⭐ Favorites</h1>
        <p class="subtitle">Your favorite content from across the site</p>
        <div v-if="hasFavorites" class="favorites-count">
          {{ favoritesCount }} favorite{{ favoritesCount !== 1 ? 's' : '' }}
        </div>
      </div>

      <div v-if="!hasFavorites" class="empty-state">
        <div class="empty-icon">⭐</div>
        <h2>No favorites yet</h2>
        <p>Start adding items to your favorites by clicking the star icon on any cat, ranking, ticket, or quote!</p>
        <div class="suggestion-links">
          <button @click="navigateToCat" class="suggestion-btn">🐱 Browse Cats</button>
          <button @click="navigateToRankings" class="suggestion-btn">👻 View Rankings</button>
          <button @click="navigateToTickets" class="suggestion-btn">🎫 Check Tickets</button>
        </div>
      </div>

      <div v-else class="favorites-content">
        <div class="actions-bar">
          <button @click="handleClearAll" class="clear-all-btn">
            🗑️ Clear All Favorites
          </button>
        </div>

        <!-- Cat Favorites -->
        <section v-if="catFavorites.length > 0" class="favorites-section">
          <div class="section-header">
            <h2>🐱 Cats</h2>
            <span class="count-badge">{{ catFavorites.length }}</span>
          </div>
          <div class="cards-grid">
            <div
              v-for="fav in catFavorites"
              :key="fav.id"
              class="favorite-card cat-card"
            >
              <img
                :src="fav.data.url"
                :alt="`Favorite cat photo, added on ${formatDate(fav.createdAt)}`"
                class="cat-image"
                @click="navigateToCat"
              />
              <button
                @click="toggleFavorite('cat', fav.data)"
                class="remove-btn"
                title="Remove from favorites"
              >
                ⭐
              </button>
              <div class="card-meta">
                <span class="added-date">Added: {{ formatDate(fav.createdAt) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Ranking Favorites -->
        <section v-if="rankingFavorites.length > 0" class="favorites-section">
          <div class="section-header">
            <h2>👻 Rankings</h2>
            <span class="count-badge">{{ rankingFavorites.length }}</span>
          </div>
          <div class="cards-grid">
            <div
              v-for="fav in rankingFavorites"
              :key="fav.id"
              class="favorite-card ranking-card"
            >
              <div class="ranking-content" @click="navigateToRankings">
                <div class="rank-avatar">
                  <EmojiRenderer :emoji="fav.data.avatar" :size="48" />
                </div>
                <div class="rank-info">
                  <div class="rank-name">{{ fav.data.name }}</div>
                  <div class="rank-score">{{ fav.data.score }} pts</div>
                </div>
              </div>
              <button
                @click="toggleFavorite('ranking', fav.data)"
                class="remove-btn"
                title="Remove from favorites"
              >
                ⭐
              </button>
              <div class="card-meta">
                <span class="added-date">Added: {{ formatDate(fav.createdAt) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Ticket Favorites -->
        <section v-if="ticketFavorites.length > 0" class="favorites-section">
          <div class="section-header">
            <h2>🎫 Tickets</h2>
            <span class="count-badge">{{ ticketFavorites.length }}</span>
          </div>
          <div class="cards-grid">
            <div
              v-for="fav in ticketFavorites"
              :key="fav.id"
              class="favorite-card ticket-card"
            >
              <div class="ticket-content" @click="navigateToTickets">
                <div class="ticket-title">{{ fav.data.title }}</div>
                <div class="ticket-description">{{ fav.data.description }}</div>
                <div class="ticket-meta">
                  <span class="ticket-status" :class="`status-${fav.data.status}`">
                    {{ fav.data.status }}
                  </span>
                  <span class="ticket-id">#{{ fav.data.id }}</span>
                </div>
              </div>
              <button
                @click="toggleFavorite('ticket', fav.data)"
                class="remove-btn"
                title="Remove from favorites"
              >
                ⭐
              </button>
              <div class="card-meta">
                <span class="added-date">Added: {{ formatDate(fav.createdAt) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Quote Favorites -->
        <section v-if="quoteFavorites.length > 0" class="favorites-section">
          <div class="section-header">
            <h2>💬 Quotes</h2>
            <span class="count-badge">{{ quoteFavorites.length }}</span>
          </div>
          <div class="cards-grid">
            <div
              v-for="fav in quoteFavorites"
              :key="fav.id"
              class="favorite-card quote-card"
            >
              <div class="quote-content">
                <div class="quote-text">"{{ fav.data.text }}"</div>
              </div>
              <button
                @click="toggleFavorite('quote', fav.data)"
                class="remove-btn"
                title="Remove from favorites"
              >
                ⭐
              </button>
              <div class="card-meta">
                <span class="added-date">Added: {{ formatDate(fav.createdAt) }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.favorites-page {
  min-height: 100vh;
  padding: 100px 20px 85px;
}

.favorites-container {
  max-width: 1000px;
  margin: 0 auto;
}

.favorites-header {
  text-align: center;
  margin-bottom: 40px;
}

.favorites-header h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #718096;
  margin: 0 0 16px 0;
  font-size: 1.1rem;
}

.favorites-count {
  display: inline-block;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 80px 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

.dark .empty-state {
  background: rgba(40, 44, 52, 0.95);
  border-color: #4a5568;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h2 {
  font-size: 1.75rem;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.dark .empty-state h2 {
  color: #e2e8f0;
}

.empty-state p {
  color: #718096;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0 0 30px 0;
}

.dark .empty-state p {
  color: #a0aec0;
}

.suggestion-links {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.suggestion-btn {
  padding: 12px 24px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-btn:hover {
  background: #3182ce;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
}

.actions-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
}

.clear-all-btn {
  padding: 10px 20px;
  background: #f56565;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-all-btn:hover {
  background: #e53e3e;
  transform: translateY(-1px);
}

.favorites-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.dark .section-header {
  border-bottom-color: #4a5568;
}

.section-header h2 {
  font-size: 1.5rem;
  margin: 0;
  color: #2d3748;
}

.dark .section-header h2 {
  color: #e2e8f0;
}

.count-badge {
  background: #4299e1;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.favorite-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  position: relative;
}

.dark .favorite-card {
  background: #2d3748;
  border-color: #4a5568;
}

.favorite-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.remove-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #f6d365;
  color: #f6d365;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}

.remove-btn:hover {
  background: #f6d365;
  color: white;
  transform: scale(1.1);
}

.dark .remove-btn {
  background: rgba(45, 55, 72, 0.95);
}

.card-meta {
  padding: 12px;
  border-top: 1px solid #e2e8f0;
}

.dark .card-meta {
  border-top-color: #4a5568;
}

.added-date {
  font-size: 0.8rem;
  color: #a0aec0;
}

/* Cat Card */
.cat-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s;
}

.cat-image:hover {
  transform: scale(1.05);
}

/* Ranking Card */
.ranking-content {
  padding: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 16px;
}

.rank-avatar {
  flex-shrink: 0;
}

.rank-info {
  flex: 1;
}

.rank-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.dark .rank-name {
  color: #e2e8f0;
}

.rank-score {
  font-size: 0.95rem;
  color: #48bb78;
  font-weight: 600;
}

/* Ticket Card */
.ticket-content {
  padding: 20px;
  cursor: pointer;
}

.ticket-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
  line-height: 1.4;
}

.dark .ticket-title {
  color: #e2e8f0;
}

.ticket-description {
  color: #718096;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dark .ticket-description {
  color: #a0aec0;
}

.ticket-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.ticket-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-completed {
  background: #d1fae5;
  color: #059669;
}

.status-needs-info {
  background: #fed7aa;
  color: #ea580c;
}

.status-declined {
  background: #fee2e2;
  color: #dc2626;
}

.ticket-id {
  font-size: 0.8rem;
  color: #a0aec0;
  font-weight: 600;
}

/* Quote Card */
.quote-content {
  padding: 24px 20px 16px;
}

.quote-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #2d3748;
  font-style: italic;
}

.dark .quote-text {
  color: #e2e8f0;
}
</style>
