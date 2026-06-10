<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Video, Search } from 'lucide-vue-next'

interface VideoEntry {
  filename: string
  size: string
  title: string
}

const videos = ref<VideoEntry[]>([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const activeVideo = ref<string | null>(null)

const apiBaseUrl = (typeof window !== 'undefined' && window.__API_BASE_URL__) || ''

const filteredVideos = computed(() => {
  if (!search.value) return videos.value
  const q = search.value.toLowerCase()
  return videos.value.filter(v => v.title.toLowerCase().includes(q))
})

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

function playVideo(filename: string) {
  activeVideo.value = activeVideo.value === filename ? null : filename
}

function closeVideo() {
  activeVideo.value = null
}

onMounted(async () => {
  try {
    const res = await fetch(`${apiBaseUrl}/api/videos`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    videos.value = (data.videos || []).map((v: any) => ({
      filename: v.filename,
      size: formatSize(v.size),
      title: v.title,
    }))
  } catch (e: any) {
    error.value = e.message || 'Failed to load videos'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="videos-page">
    <div class="videos-header">
      <div class="header-title">
        <Video :size="32" />
        <h1>Videos</h1>
        <span class="badge">{{ filteredVideos.length }}</span>
      </div>
      <div class="search-box">
        <Search :size="18" />
        <input
          v-model="search"
          type="text"
          placeholder="Search videos..."
          class="search-input"
        />
      </div>
    </div>

    <!-- Active Video Player -->
    <div v-if="activeVideo" class="video-player-container">
      <div class="player-header">
        <h3>{{ videos.find(v => v.filename === activeVideo)?.title }}</h3>
        <button @click="closeVideo" class="close-btn">&times;</button>
      </div>
      <video
        controls
        :src="`${apiBaseUrl}/api/videos/${encodeURIComponent(activeVideo)}`"
        class="video-player"
        @ended="closeVideo"
      >
        Your browser does not support the video element.
      </video>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <p>Loading videos...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error">
      <p>Failed to load videos: {{ error }}</p>
    </div>

    <!-- Video List -->
    <div v-else class="video-grid">
      <div
        v-for="video in filteredVideos"
        :key="video.filename"
        class="video-card"
        :class="{ active: activeVideo === video.filename }"
        @click="playVideo(video.filename)"
      >
        <div class="video-card-icon">
          <Video :size="28" />
        </div>
        <div class="video-card-info">
          <h3>{{ video.title }}</h3>
          <span class="video-size">{{ video.size }}</span>
        </div>
      </div>
    </div>

    <div v-if="!loading && !error && filteredVideos.length === 0 && search" class="empty">
      <p>No videos match "{{ search }}"</p>
    </div>
  </div>
</template>

<style scoped>
.videos-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
}

.videos-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-title h1 {
  margin: 0;
  font-size: 1.75rem;
}

.badge {
  background: var(--color-primary, #4f46e5);
  color: white;
  padding: 0.15rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-surface, #1e1e2e);
  border: 1px solid var(--color-border, #333);
  border-radius: 8px;
  padding: 0.4rem 0.75rem;
}

.search-input {
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text, #e0e0e0);
  font-size: 0.9rem;
  width: 200px;
}

.search-input::placeholder {
  color: var(--color-text-muted, #888);
}

.video-player-container {
  background: var(--color-surface, #1e1e2e);
  border: 1px solid var(--color-border, #333);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.player-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.player-header h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text, #e0e0e0);
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-text-muted, #888);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0.25rem;
  line-height: 1;
}

.close-btn:hover {
  color: var(--color-text, #e0e0e0);
}

.video-player {
  width: 100%;
  border-radius: 8px;
  max-height: 70vh;
  background: #000;
}

.video-grid {
  display: grid;
  gap: 0.5rem;
}

.video-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--color-surface, #1e1e2e);
  border: 1px solid var(--color-border, #333);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.video-card:hover {
  border-color: var(--color-primary, #4f46e5);
  background: var(--color-surface-hover, #252535);
}

.video-card.active {
  border-color: var(--color-primary, #4f46e5);
  background: rgba(79, 70, 229, 0.1);
}

.video-card-icon {
  flex-shrink: 0;
  color: var(--color-text-muted, #888);
}

.video-card-info {
  min-width: 0;
  flex: 1;
}

.video-card-info h3 {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text, #e0e0e0);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-size {
  font-size: 0.8rem;
  color: var(--color-text-muted, #888);
}

.loading, .error, .empty {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted, #888);
}

.error {
  color: #ef4444;
}
</style>
