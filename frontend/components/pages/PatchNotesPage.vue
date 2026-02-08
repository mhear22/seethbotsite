<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../../stores/useAppStore'
import { formatTimeAgo } from '../../utils/format'

const appStore = useAppStore()

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
const loading = ref(true)
const error = ref<string | null>(null)

const loadPatchNotes = async () => {
  try {
    loading.value = true
    const response = await fetch('/api/patch-notes')
    if (!response.ok) {
      throw new Error('Failed to load patch notes')
    }
    patchNotes.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load patch notes'
    console.error('Error loading patch notes:', err)
  } finally {
    loading.value = false
  }
}

const changeTypes = {
  added: { icon: '✨', label: 'Added', color: '#48bb78' },
  improved: { icon: '🚀', label: 'Improved', color: '#4299e1' },
  fixed: { icon: '🔧', label: 'Fixed', color: '#ed8936' },
  removed: { icon: '🗑️', label: 'Removed', color: '#f56565' }
}

onMounted(() => {
  loadPatchNotes()
})
</script>

<template>
  <div class="patch-notes-page" :class="{ dark: appStore.darkMode }">
    <div class="patch-notes-header">
      <h1>📝 Patch Notes</h1>
      <p class="subtitle">Track all changes and updates</p>
    </div>

    <div class="patch-notes-container">
      <div v-if="loading" class="loading-message">Loading patch notes...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else v-for="(note, index) in patchNotes" :key="note.id" class="patch-note">
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
      </div>
    </div>

    <div class="footer-note">
      <p>💡 Check back regularly for updates!</p>
      <p>🔗 View API documentation at <a href="/api-docs" target="_blank">/api-docs</a></p>
    </div>
  </div>
</template>

<style scoped>
.patch-notes-page {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  transition: background 0.5s ease;
}

.patch-notes-page.dark {
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #5b21b6 100%);
}

.patch-notes-header {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.patch-notes-header h1 {
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
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.dark .subtitle {
  color: #a0a0a0;
}

.patch-notes-container {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.loading-message,
.error-message {
  text-align: center;
  padding: 20px;
  font-size: 1.1rem;
  color: #666;
}

.dark .loading-message,
.dark .error-message {
  color: #a0a0a0;
}

.error-message {
  color: #f56565;
}

.dark .error-message {
  color: #fc8181;
}

.patch-note {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.dark .patch-note {
  background: rgba(40, 44, 52, 0.95);
}

.patch-note:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
}

.patch-note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.version-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1rem;
}

.patch-date {
  color: #666;
  font-size: 0.9rem;
}

.dark .patch-date {
  color: #a0a0a0;
}

.build-info {
  color: #666;
  font-size: 0.85rem;
  font-weight: 500;
}

.dark .build-info {
  color: #a0a0a0;
}

.patch-title {
  font-size: 1.8rem;
  color: #333;
  margin: 0 0 20px 0;
  font-weight: bold;
}

.dark .patch-title {
  color: #e2e8f0;
}

.changes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.change-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  background: #f7fafc;
  transition: all 0.2s ease;
}

.dark .change-item {
  background: rgba(30, 30, 46, 0.8);
}

.change-item:hover {
  transform: translateX(5px);
}

.change-icon {
  font-size: 1.2rem;
  min-width: 28px;
}

.change-label {
  font-weight: 600;
  font-size: 0.9rem;
  min-width: 70px;
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
  font-size: 0.95rem;
  flex: 1;
}

.dark .change-description {
  color: #cbd5e0;
}

.footer-note {
  text-align: center;
  margin-top: 60px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
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

.footer-note a {
  color: #3182ce;
  text-decoration: none;
  font-weight: 600;
}

.footer-note a:hover {
  text-decoration: underline;
}

.dark .footer-note a {
  color: #63b3ed;
}

@media (max-width: 768px) {
  .patch-notes-header h1 {
    font-size: 2rem;
  }

  .patch-note {
    padding: 20px;
  }

  .patch-title {
    font-size: 1.4rem;
  }

  .change-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .change-label {
    min-width: auto;
  }
}
</style>
