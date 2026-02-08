<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../../stores/useAppStore'
import { formatDate, formatTimeAgo } from '../../utils/format'

const appStore = useAppStore()

// Tab management
const activeTab = ref<'opinions' | 'patch-notes' | 'rankings'>('opinions')

// Opinions data
interface Opinion {
  id: string
  text: string
  type: 'random' | 'build'
  createdAt: string
}

const opinions = ref<Opinion[]>([])
const opinionsLoading = ref(true)
const opinionsError = ref<string | null>(null)

// Patch notes data
interface PatchNote {
  id: string
  version: string
  buildNumber: number
  buildTime: string
  title: string
  changes: {
    type: 'added' | 'improved' | 'fixed' | 'removed'
    description: string
  }[]
  createdAt: string
}

const patchNotes = ref<PatchNote[]>([])
const patchNotesLoading = ref(true)
const patchNotesError = ref<string | null>(null)

// Rankings snapshots data
interface RankingsSnapshot {
  id: string
  timestamp: string
  rankings: {
    avatar: string
    name: string
    score: number
    isCurrentUser?: boolean
  }[]
}

const rankingsSnapshots = ref<RankingsSnapshot[]>([])
const rankingsLoading = ref(true)
const rankingsError = ref<string | null>(null)

const opinionsFilter = ref<'all' | 'random' | 'build'>('all')
const rankingsLimit = ref(20)

const changeTypes = {
  added: { icon: '✨', label: 'Added', color: '#48bb78' },
  improved: { icon: '🚀', label: 'Improved', color: '#4299e1' },
  fixed: { icon: '🔧', label: 'Fixed', color: '#ed8936' },
  removed: { icon: '🗑️', label: 'Removed', color: '#f56565' }
}

const filteredOpinions = computed(() => {
  if (opinionsFilter.value === 'all') {
    return opinions.value
  }
  return opinions.value.filter(o => o.type === opinionsFilter.value)
})

const loadOpinions = async () => {
  try {
    opinionsLoading.value = true
    const typeParam = opinionsFilter.value === 'all' ? '' : `?type=${opinionsFilter.value}`
    const response = await fetch(`/api/archive/opinions?limit=100${typeParam}`)
    if (!response.ok) {
      throw new Error('Failed to load opinions')
    }
    const data = await response.json()
    opinions.value = data.opinions || []
  } catch (err) {
    opinionsError.value = err instanceof Error ? err.message : 'Failed to load opinions'
    console.error('Error loading opinions:', err)
  } finally {
    opinionsLoading.value = false
  }
}

const loadPatchNotes = async () => {
  try {
    patchNotesLoading.value = true
    const response = await fetch('/api/patch-notes')
    if (!response.ok) {
      throw new Error('Failed to load patch notes')
    }
    patchNotes.value = await response.json()
  } catch (err) {
    patchNotesError.value = err instanceof Error ? err.message : 'Failed to load patch notes'
    console.error('Error loading patch notes:', err)
  } finally {
    patchNotesLoading.value = false
  }
}

const loadRankingsSnapshots = async () => {
  try {
    rankingsLoading.value = true
    const response = await fetch(`/api/archive/rankings?limit=${rankingsLimit.value}`)
    if (!response.ok) {
      throw new Error('Failed to load rankings snapshots')
    }
    const data = await response.json()
    rankingsSnapshots.value = data.snapshots || []
  } catch (err) {
    rankingsError.value = err instanceof Error ? err.message : 'Failed to load rankings snapshots'
    console.error('Error loading rankings snapshots:', err)
  } finally {
    rankingsLoading.value = false
  }
}

const changeOpinionsFilter = () => {
  loadOpinions()
}

const loadMoreRankings = () => {
  rankingsLimit.value += 20
  loadRankingsSnapshots()
}

onMounted(() => {
  loadOpinions()
  loadPatchNotes()
  loadRankingsSnapshots()
})
</script>

<template>
  <div class="archive-history-page" :class="{ dark: appStore.darkMode }">
    <div class="archive-header">
      <h1>📜 Archive & History</h1>
      <p class="subtitle">View past opinions, patch notes, and rankings snapshots</p>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button
        @click="activeTab = 'opinions'"
        :class="['tab-button', { active: activeTab === 'opinions' }]"
      >
        🍄 Opinions
      </button>
      <button
        @click="activeTab = 'patch-notes'"
        :class="['tab-button', { active: activeTab === 'patch-notes' }]"
      >
        📝 Patch Notes
      </button>
      <button
        @click="activeTab = 'rankings'"
        :class="['tab-button', { active: activeTab === 'rankings' }]"
      >
        👻 Rankings
      </button>
    </div>

    <!-- Opinions Tab -->
    <div v-show="activeTab === 'opinions'" class="tab-content">
      <div class="tab-toolbar">
        <div class="filter-group">
          <label>Filter:</label>
          <select v-model="opinionsFilter" @change="changeOpinionsFilter">
            <option value="all">All Opinions</option>
            <option value="random">Random Generated</option>
            <option value="build">Build Opinions</option>
          </select>
        </div>
        <div class="stats-badge">
          {{ opinions.length }} opinions
        </div>
      </div>

      <div v-if="opinionsLoading" class="loading-message">Loading opinions...</div>
      <div v-else-if="opinionsError" class="error-message">{{ opinionsError }}</div>
      <div v-else-if="filteredOpinions.length === 0" class="empty-message">
        No opinions found in the archive
      </div>
      <div v-else class="opinions-grid">
        <div
          v-for="opinion in filteredOpinions"
          :key="opinion.id"
          class="opinion-card"
          :class="`opinion-${opinion.type}`"
        >
          <div class="opinion-header">
            <span class="opinion-type">
              {{ opinion.type === 'build' ? '🏗️ Build' : '🎲 Random' }}
            </span>
            <span class="opinion-date">{{ formatTimeAgo(opinion.createdAt) }}</span>
          </div>
          <p class="opinion-text">{{ opinion.text }}</p>
          <div class="opinion-footer">
            <span class="opinion-full-date">{{ formatDate(opinion.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Patch Notes Tab -->
    <div v-show="activeTab === 'patch-notes'" class="tab-content">
      <div class="tab-toolbar">
        <div class="stats-badge">
          {{ patchNotes.length }} patch notes
        </div>
      </div>

      <div v-if="patchNotesLoading" class="loading-message">Loading patch notes...</div>
      <div v-else-if="patchNotesError" class="error-message">{{ patchNotesError }}</div>
      <div v-else-if="patchNotes.length === 0" class="empty-message">
        No patch notes found
      </div>
      <div v-else class="patch-notes-list">
        <div
          v-for="note in patchNotes"
          :key="note.id"
          class="patch-note-card"
        >
          <div class="patch-note-header">
            <div class="version-badge">v{{ note.version }}</div>
            <div class="build-info">Build #{{ note.buildNumber }} • {{ formatTimeAgo(note.buildTime) }}</div>
          </div>

          <h2 class="patch-title">{{ note.title }}</h2>

          <div class="changes-list">
            <div
              v-for="(change, changeIndex) in note.changes"
              :key="changeIndex"
              class="change-item"
              :class="`change-${change.type}`"
            >
              <span class="change-icon">{{ changeTypes[change.type].icon }}</span>
              <span class="change-label">{{ changeTypes[change.type].label }}</span>
              <span class="change-description">{{ change.description }}</span>
            </div>
          </div>

          <div class="patch-footer">
            Created: {{ formatDate(note.createdAt) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Rankings Tab -->
    <div v-show="activeTab === 'rankings'" class="tab-content">
      <div class="tab-toolbar">
        <div class="stats-badge">
          {{ rankingsSnapshots.length }} snapshots
        </div>
        <button
          v-if="rankingsSnapshots.length >= rankingsLimit"
          @click="loadMoreRankings"
          class="btn btn-secondary"
        >
          Load More
        </button>
      </div>

      <div v-if="rankingsLoading" class="loading-message">Loading rankings snapshots...</div>
      <div v-else-if="rankingsError" class="error-message">{{ rankingsError }}</div>
      <div v-else-if="rankingsSnapshots.length === 0" class="empty-message">
        No rankings snapshots found in the archive
      </div>
      <div v-else class="rankings-snapshots-list">
        <div
          v-for="snapshot in rankingsSnapshots"
          :key="snapshot.id"
          class="rankings-snapshot"
        >
          <div class="snapshot-header">
            <span class="snapshot-title">👻 Rankings Snapshot</span>
            <span class="snapshot-date">{{ formatDate(snapshot.timestamp) }}</span>
          </div>
          <div class="snapshot-content">
            <div class="rankings-table">
              <div class="table-header">
                <span class="col-rank">#</span>
                <span class="col-avatar">Avatar</span>
                <span class="col-name">Name</span>
                <span class="col-score">Score</span>
              </div>
              <div
                v-for="(rank, index) in snapshot.rankings"
                :key="index"
                class="table-row"
                :class="{ 'current-user': rank.isCurrentUser }"
              >
                <span class="col-rank">{{ index + 1 }}</span>
                <span class="col-avatar">{{ rank.avatar }}</span>
                <span class="col-name">{{ rank.name }}</span>
                <span class="col-score">{{ rank.score }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.archive-history-page {
  min-height: 100vh;
  padding: 100px 20px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: background 0.5s ease;
}

.archive-history-page.dark {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
}

.archive-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.archive-header h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.tab-button {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.tab-button.active {
  background: white;
  color: #764ba2;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* Tab Content */
.tab-content {
  max-width: 1200px;
  margin: 0 auto;
}

.tab-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.dark .tab-toolbar {
  background: rgba(40, 44, 52, 0.95);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 600;
  color: #333;
}

.dark .filter-group label {
  color: #e2e8f0;
}

.filter-group select {
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.dark .filter-group select {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e8f0;
}

.stats-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.loading-message,
.error-message,
.empty-message {
  text-align: center;
  padding: 40px 20px;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  color: #666;
}

.dark .loading-message,
.dark .error-message,
.dark .empty-message {
  background: rgba(40, 44, 52, 0.95);
  color: #a0aec0;
}

.error-message {
  color: #f56565;
}

.dark .error-message {
  color: #fc8181;
}

/* Opinions Grid */
.opinions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.opinion-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  border-left: 4px solid #667eea;
}

.dark .opinion-card {
  background: rgba(40, 44, 52, 0.95);
}

.opinion-card.opinion-build {
  border-left-color: #48bb78;
}

.opinion-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.opinion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.dark .opinion-header {
  border-bottom-color: #4a5568;
}

.opinion-type {
  font-weight: 600;
  font-size: 0.85rem;
  padding: 4px 10px;
  border-radius: 12px;
  background: #edf2f7;
}

.dark .opinion-type {
  background: #4a5568;
}

.opinion-date {
  font-size: 0.8rem;
  color: #718096;
}

.dark .opinion-date {
  color: #a0aec0;
}

.opinion-text {
  color: #2d3748;
  font-size: 1.05rem;
  line-height: 1.6;
  margin: 0 0 15px 0;
  min-height: 60px;
}

.dark .opinion-text {
  color: #e2e8f0;
}

.opinion-footer {
  display: flex;
  justify-content: flex-end;
}

.opinion-full-date {
  font-size: 0.75rem;
  color: #a0aec0;
}

.dark .opinion-full-date {
  color: #718096;
}

/* Patch Notes List */
.patch-notes-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.patch-note-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.dark .patch-note-card {
  background: rgba(40, 44, 52, 0.95);
}

.patch-note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.version-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.95rem;
}

.build-info {
  color: #718096;
  font-size: 0.85rem;
  font-weight: 500;
}

.dark .build-info {
  color: #a0aec0;
}

.patch-title {
  font-size: 1.5rem;
  color: #2d3748;
  margin: 0 0 15px 0;
  font-weight: bold;
}

.dark .patch-title {
  color: #e2e8f0;
}

.changes-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.change-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #f7fafc;
}

.dark .change-item {
  background: rgba(30, 30, 46, 0.8);
}

.change-icon {
  font-size: 1.1rem;
  min-width: 24px;
}

.change-label {
  font-weight: 600;
  font-size: 0.85rem;
  min-width: 65px;
}

.change-added .change-label { color: #48bb78; }
.change-improved .change-label { color: #4299e1; }
.change-fixed .change-label { color: #ed8936; }
.change-removed .change-label { color: #f56565; }

.dark .change-added .change-label { color: #68d391; }
.dark .change-improved .change-label { color: #63b3ed; }
.dark .change-fixed .change-label { color: #f6ad55; }
.dark .change-removed .change-label { color: #fc8181; }

.change-description {
  color: #4a5568;
  font-size: 0.9rem;
  flex: 1;
}

.dark .change-description {
  color: #cbd5e0;
}

.patch-footer {
  font-size: 0.8rem;
  color: #a0aec0;
  padding-top: 15px;
  border-top: 1px solid #e2e8f0;
}

.dark .patch-footer {
  border-top-color: #4a5568;
  color: #718096;
}

/* Rankings Snapshots List */
.rankings-snapshots-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.rankings-snapshot {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.dark .rankings-snapshot {
  background: rgba(40, 44, 52, 0.95);
}

.snapshot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e2e8f0;
}

.dark .snapshot-header {
  border-bottom-color: #4a5568;
}

.snapshot-title {
  font-weight: bold;
  font-size: 1.2rem;
  color: #2d3748;
}

.dark .snapshot-title {
  color: #e2e8f0;
}

.snapshot-date {
  font-size: 0.85rem;
  color: #718096;
}

.dark .snapshot-date {
  color: #a0aec0;
}

.rankings-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.table-header {
  display: grid;
  grid-template-columns: 40px 50px 1fr auto;
  gap: 10px;
  padding: 10px;
  background: #f7fafc;
  border-radius: 8px;
  font-weight: bold;
  font-size: 0.85rem;
  color: #718096;
}

.dark .table-header {
  background: rgba(30, 30, 46, 0.8);
  color: #a0aec0;
}

.table-row {
  display: grid;
  grid-template-columns: 40px 50px 1fr auto;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  transition: background 0.2s;
}

.dark .table-row {
  background: rgba(255, 255, 255, 0.05);
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.8);
}

.dark .table-row:hover {
  background: rgba(255, 255, 255, 0.1);
}

.table-row.current-user {
  background: rgba(72, 187, 120, 0.2);
  border: 2px solid #48bb78;
}

.col-rank {
  text-align: center;
  font-weight: bold;
  color: #718096;
}

.dark .col-rank {
  color: #a0aec0;
}

.col-avatar {
  text-align: center;
  font-size: 1.5rem;
}

.col-name {
  font-weight: 500;
  color: #2d3748;
}

.dark .col-name {
  color: #e2e8f0;
}

.col-score {
  font-weight: bold;
  color: #48bb78;
  text-align: right;
}

.dark .col-score {
  color: #68d391;
}

/* Button Styles */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary {
  background: #f7fafc;
  color: #2d3748;
  border: 2px solid #e2e8f0;
}

.dark .btn-secondary {
  background: #4a5568;
  color: #e2e8f0;
  border-color: #718096;
}

.btn-secondary:hover {
  background: #edf2f7;
  transform: translateY(-2px);
}

.dark .btn-secondary:hover {
  background: #718096;
}

/* Responsive */
@media (max-width: 768px) {
  .archive-header h1 {
    font-size: 2rem;
  }

  .opinions-grid {
    grid-template-columns: 1fr;
  }

  .table-header,
  .table-row {
    grid-template-columns: 30px 40px 1fr auto;
    gap: 8px;
    font-size: 0.85rem;
  }

  .col-avatar {
    font-size: 1.2rem;
  }
}
</style>
