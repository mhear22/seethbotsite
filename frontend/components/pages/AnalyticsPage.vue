<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { formatTimeAgo } from '../../utils/format'

interface AnalyticsSummary {
  totalClicks: number
  activeUsers: number
  timestamp: string
}

interface TopPage {
  path: string
  views: number
}

interface TopPagesResponse {
  pages: TopPage[]
  timestamp: string
}

const summary = ref<AnalyticsSummary | null>(null)
const topPages = ref<TopPage[]>([])
const summaryLoading = ref(true)
const pagesLoading = ref(true)
const error = ref<string | null>(null)

let refreshInterval: number | null = null

const loadSummary = async () => {
  try {
    summaryLoading.value = true
    const response = await fetch('/api/analytics/summary')
    if (!response.ok) {
      throw new Error('Failed to load analytics summary')
    }
    summary.value = await response.json()
  } catch (err) {
    console.error('Error loading analytics summary:', err)
    error.value = 'Failed to load analytics data'
  } finally {
    summaryLoading.value = false
  }
}

const loadTopPages = async () => {
  try {
    pagesLoading.value = true
    const response = await fetch('/api/analytics/top-pages?limit=10')
    if (!response.ok) {
      throw new Error('Failed to load top pages')
    }
    const data: TopPagesResponse = await response.json()
    topPages.value = data.pages
  } catch (err) {
    console.error('Error loading top pages:', err)
    error.value = 'Failed to load top pages'
  } finally {
    pagesLoading.value = false
  }
}

const refreshData = () => {
  loadSummary()
  loadTopPages()
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatPath = (path: string): string => {
  if (path === '/') return 'Home'
  return path.replace(/^\//, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

onMounted(() => {
  refreshData()
  // Refresh data every 30 seconds
  refreshInterval = window.setInterval(refreshData, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<template>
  <div class="page analytics-page">
    <div class="page-header">
      <h1 class="page-title">📊 Analytics Dashboard</h1>
      <p class="page-subtitle">Monitor site activity and user engagement</p>
      <button class="refresh-btn" @click="refreshData" :disabled="summaryLoading || pagesLoading">
        {{ summaryLoading || pagesLoading ? 'Refreshing...' : '🔄 Refresh' }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Summary Cards -->
    <section class="summary-section">
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-icon">🖱️</div>
          <div class="card-content">
            <h3 class="card-title">Total Clicks</h3>
            <p class="card-value">
              {{ summaryLoading ? 'Loading...' : formatNumber(summary?.totalClicks || 0) }}
            </p>
            <p class="card-description">All time page views</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon active-users">👥</div>
          <div class="card-content">
            <h3 class="card-title">Active Users</h3>
            <p class="card-value">
              {{ summaryLoading ? 'Loading...' : summary?.activeUsers || 0 }}
            </p>
            <p class="card-description">Currently online (15 min)</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Top Pages Section -->
    <section class="top-pages-section">
      <h2 class="section-title">Most Visited Pages</h2>
      <div v-if="pagesLoading" class="loading-message">Loading top pages...</div>
      <div v-else-if="topPages.length === 0" class="empty-message">No page views recorded yet</div>
      <div v-else class="top-pages-list">
        <div
          v-for="(page, index) in topPages"
          :key="page.path"
          class="top-page-item"
          :class="{ 'top-3': index < 3 }"
        >
          <div class="page-rank">{{ index + 1 }}</div>
          <div class="page-info">
            <div class="page-path">{{ formatPath(page.path) }}</div>
            <div class="page-raw-path">{{ page.path }}</div>
          </div>
          <div class="page-views">
            <span class="views-number">{{ formatNumber(page.views) }}</span>
            <span class="views-label">views</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Last Updated -->
    <section class="last-updated">
      <p class="updated-text">
        Last updated: {{ summary?.timestamp ? formatTimeAgo(summary.timestamp) : 'N/A' }}
      </p>
    </section>
  </div>
</template>

<style scoped>
/* Page Container */
.page.analytics-page {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Page Header */
.page-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ff91a4;
  margin: 0 0 0.5rem 0;
}

.dark .page-title {
  color: #ffb6c1;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #666;
  margin: 0 0 1.5rem 0;
}

.dark .page-subtitle {
  color: #aaa;
}

.refresh-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Error Message */
.error-message {
  background: rgba(255, 107, 107, 0.1);
  border: 2px solid rgba(255, 107, 107, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  color: #ff6b6b;
  font-weight: 600;
  margin-bottom: 2rem;
}

/* Summary Section */
.summary-section {
  margin-bottom: 3rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.summary-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.dark .summary-card {
  background: rgba(40, 44, 52, 0.9);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(255, 182, 193, 0.2);
}

.dark .summary-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.card-icon {
  font-size: 3rem;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  flex-shrink: 0;
}

.card-icon.active-users {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dark .card-title {
  color: #aaa;
}

.card-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.25rem 0;
  line-height: 1;
}

.dark .card-value {
  color: #eee;
}

.card-description {
  font-size: 0.85rem;
  color: #999;
  margin: 0;
}

.dark .card-description {
  color: #777;
}

/* Top Pages Section */
.top-pages-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8px);
}

.dark .top-pages-section {
  background: rgba(40, 44, 52, 0.9);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 1.5rem 0;
}

.dark .section-title {
  color: #eee;
}

.loading-message,
.empty-message {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 2rem;
}

.top-pages-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.top-page-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  transition: all 0.2s ease;
  border-left: 3px solid #ddd;
}

.dark .top-page-item {
  background: rgba(255, 255, 255, 0.05);
  border-left-color: #555;
}

.top-page-item.top-3 {
  background: rgba(255, 182, 193, 0.15);
  border-left-color: #ff91a4;
}

.dark .top-page-item.top-3 {
  background: rgba(255, 182, 193, 0.1);
  border-left-color: #ffb6c1;
}

.top-page-item:hover {
  transform: translateX(4px);
  background: rgba(255, 182, 193, 0.2);
}

.dark .top-page-item:hover {
  background: rgba(255, 182, 193, 0.15);
}

.page-rank {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff91a4;
  min-width: 40px;
  text-align: center;
}

.dark .page-rank {
  color: #ffb6c1;
}

.page-info {
  flex: 1;
}

.page-path {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.dark .page-path {
  color: #eee;
}

.page-raw-path {
  font-size: 0.85rem;
  color: #999;
  font-family: 'Courier New', monospace;
}

.dark .page-raw-path {
  color: #777;
}

.page-views {
  text-align: right;
  flex-shrink: 0;
}

.views-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff91a4;
  line-height: 1;
}

.dark .views-number {
  color: #ffb6c1;
}

.views-label {
  font-size: 0.75rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Last Updated Section */
.last-updated {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 182, 193, 0.2);
}

.dark .last-updated {
  border-top-color: rgba(255, 182, 193, 0.1);
}

.updated-text {
  font-size: 0.9rem;
  color: #999;
  margin: 0;
}

.dark .updated-text {
  color: #777;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page.analytics-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .summary-card {
    padding: 1.5rem;
  }

  .card-icon {
    font-size: 2.5rem;
    width: 60px;
    height: 60px;
  }

  .card-value {
    font-size: 2rem;
  }

  .top-pages-section {
    padding: 1.5rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .top-page-item {
    padding: 0.75rem;
    flex-wrap: wrap;
  }

  .page-views {
    text-align: left;
    width: 100%;
  }
}
</style>
