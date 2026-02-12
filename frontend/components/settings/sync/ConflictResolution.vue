<script setup lang="ts">
interface Conflict {
  id: string
  type: string
  timestamp: string
  local_version: any
  remote_version: any
}

interface Props {
  conflicts: Conflict[]
}

interface Emits {
  (e: 'resolve', conflictId: string, resolution: 'local' | 'remote' | 'merge'): void
  (e: 'clear'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Handle conflict resolution
 */
const resolveConflict = (conflictId: string, resolution: 'local' | 'remote' | 'merge') => {
  emit('resolve', conflictId, resolution)
}

/**
 * Format timestamp
 */
const formatTimestamp = (timestamp: string | null) => {
  if (!timestamp) return 'Never'
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return date.toLocaleDateString()
}
</script>

<template>
  <div v-if="conflicts.length > 0" class="conflicts-section">
    <h2 class="section-title">⚠️ Sync Conflicts</h2>

    <div class="conflicts-list">
      <div
        v-for="conflict in conflicts"
        :key="conflict.id"
        class="conflict-item"
      >
        <div class="conflict-header">
          <span class="conflict-type">{{ conflict.type }}</span>
          <span class="conflict-time">{{ formatTimestamp(conflict.timestamp) }}</span>
        </div>
        <div class="conflict-details">
          <div class="conflict-side">
            <strong>Local:</strong> {{ JSON.stringify(conflict.local_version).substring(0, 50) }}...
          </div>
          <div class="conflict-side">
            <strong>Remote:</strong> {{ JSON.stringify(conflict.remote_version).substring(0, 50) }}...
          </div>
        </div>
        <div class="conflict-actions">
          <button
            @click="resolveConflict(conflict.id, 'local')"
            class="conflict-btn local"
          >
            Keep Local
          </button>
          <button
            @click="resolveConflict(conflict.id, 'remote')"
            class="conflict-btn remote"
          >
            Keep Remote
          </button>
          <button
            @click="resolveConflict(conflict.id, 'merge')"
            class="conflict-btn merge"
          >
            Merge
          </button>
        </div>
      </div>
    </div>

    <button @click="emit('clear')" class="clear-conflicts-btn">
      Dismiss All
    </button>
  </div>
</template>

<style scoped>
.conflicts-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid #ed8936;
}

.dark .conflicts-section {
  background: rgba(40, 44, 52, 0.95);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #ff6b9d;
}

.dark .section-title {
  color: #ffb6c1;
}

.conflicts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.conflict-item {
  padding: 1.5rem;
  background: linear-gradient(135deg, #fffaf0 0%, #fbd38d 0.2);
  border-radius: 12px;
  border: 1px solid #ed8936;
}

.dark .conflict-item {
  background: rgba(237, 137, 54, 0.1);
  border-color: #ed8936;
}

.conflict-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.conflict-type {
  font-weight: 600;
  color: #ed8936;
  text-transform: capitalize;
}

.conflict-time {
  font-size: 0.85rem;
  color: #718096;
}

.conflict-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.conflict-side {
  font-size: 0.9rem;
  color: #2d3748;
  word-break: break-all;
}

.dark .conflict-side {
  color: #e2e8f0;
}

.conflict-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.conflict-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.conflict-btn.local {
  background: #48bb78;
  color: white;
}

.conflict-btn.local:hover {
  background: #38a169;
}

.conflict-btn.remote {
  background: #4299e1;
  color: white;
}

.conflict-btn.remote:hover {
  background: #3182ce;
}

.conflict-btn.merge {
  background: #9f7aea;
  color: white;
}

.conflict-btn.merge:hover {
  background: #805ad5;
}

.clear-conflicts-btn {
  width: 100%;
  padding: 0.75rem;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.2s ease;
}

.clear-conflicts-btn:hover {
  background: #c53030;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .conflict-actions {
    flex-direction: column;
  }

  .conflict-btn {
    width: 100%;
  }
}
</style>
