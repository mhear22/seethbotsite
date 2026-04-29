<template>
  <div v-if="show && conflicts.length > 0" class="conflict-modal-overlay" @click.self="close">
    <div class="conflict-modal">
      <div class="modal-header">
        <h2>🔄 Sync Conflicts Detected</h2>
        <button @click="close" class="close-button">&times;</button>
      </div>

      <div class="modal-body">
        <p class="conflict-intro">
          {{ conflicts.length }} conflict(s) found. Please choose how to resolve each one:
        </p>

        <div v-for="(conflict, index) in conflicts" :key="conflict.id" class="conflict-item">
          <div class="conflict-header">
            <span class="conflict-number">#{{ index + 1 }}</span>
            <span class="conflict-type">{{ formatConflictType(conflict.type) }}</span>
            <span class="conflict-time">{{ formatTimestamp(conflict.timestamp) }}</span>
          </div>

          <div class="conflict-versions">
            <div class="version-box local">
              <div class="version-label">
                <span class="version-icon">💻</span>
                <span>Local Version</span>
              </div>
              <pre class="version-data">{{ formatData(conflict.local_version) }}</pre>
            </div>

            <div class="version-box remote">
              <div class="version-label">
                <span class="version-icon">☁️</span>
                <span>Remote Version</span>
              </div>
              <pre class="version-data">{{ formatData(conflict.remote_version) }}</pre>
            </div>
          </div>

          <div class="conflict-actions">
            <button 
              @click="resolveConflict(conflict.id, 'local')" 
              class="btn btn-local"
              :disabled="resolving.has(conflict.id)"
            >
              <span v-if="resolving.has(conflict.id)">⏳</span>
              <span v-else>💻</span>
              Keep Local
            </button>

            <button 
              @click="resolveConflict(conflict.id, 'remote')" 
              class="btn btn-remote"
              :disabled="resolving.has(conflict.id)"
            >
              <span v-if="resolving.has(conflict.id)">⏳</span>
              <span v-else>☁️</span>
              Use Remote
            </button>

            <button 
              @click="resolveConflict(conflict.id, 'merge')" 
              class="btn btn-merge"
              :disabled="resolving.has(conflict.id)"
            >
              <span v-if="resolving.has(conflict.id)">⏳</span>
              <span v-else>🔀</span>
              Merge
            </button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="resolveAll('local')" class="btn btn-secondary">
          Keep All Local
        </button>
        <button @click="resolveAll('remote')" class="btn btn-secondary">
          Use All Remote
        </button>
        <button @click="close" class="btn btn-primary">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface SyncConflict {
  id: string
  type: string
  local_version: any
  remote_version: any
  timestamp: string
}

const props = defineProps<{
  show: boolean
  conflicts: SyncConflict[]
}>()

const emit = defineEmits<{
  close: []
  resolve: [conflictId: string, resolution: 'local' | 'remote' | 'merge']
  resolveAll: [resolution: 'local' | 'remote' | 'merge']
}>()

const resolving = ref(new Set<string>())

function close() {
  emit('close')
}

async function resolveConflict(conflictId: string, resolution: 'local' | 'remote' | 'merge') {
  resolving.value.add(conflictId)
  try {
    emit('resolve', conflictId, resolution)
  } finally {
    resolving.value.delete(conflictId)
  }
}

function resolveAll(resolution: 'local' | 'remote' | 'merge') {
  emit('resolveAll', resolution)
}

function formatConflictType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

function formatData(data: any): string {
  if (typeof data === 'string') {
    return data
  }
  return JSON.stringify(data, null, 2)
}
</script>

<style scoped>
.conflict-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 2rem;
}

.conflict-modal {
  background: linear-gradient(135deg, rgba(30, 30, 50, 0.95), rgba(40, 40, 60, 0.95));
  border-radius: 16px;
  border: 1px solid rgba(99, 102, 241, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  max-width: 900px;
  width: 100%;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(99, 102, 241, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h2 {
  margin: 0;
  color: #fff;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  color: #a5b4fc;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
}

.close-button:hover {
  color: #fff;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.conflict-intro {
  color: #a5b4fc;
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
}

.conflict-item {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.conflict-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
}

.conflict-number {
  font-weight: bold;
  color: #6366f1;
  font-size: 1.1rem;
}

.conflict-type {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
}

.conflict-time {
  color: #6b7280;
  font-size: 0.85rem;
  margin-left: auto;
}

.conflict-versions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .conflict-versions {
    grid-template-columns: 1fr;
  }
}

.version-box {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.version-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
}

.version-icon {
  font-size: 1.2rem;
}

.version-data {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.75rem;
  border-radius: 6px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.8rem;
  color: #e5e7eb;
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 200px;
  overflow-y: auto;
}

.conflict-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-local {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-local:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
  transform: translateY(-2px);
}

.btn-remote {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.btn-remote:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

.btn-merge {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.btn-merge:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.3);
  transform: translateY(-2px);
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(99, 102, 241, 0.2);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-secondary {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.btn-secondary:hover {
  background: rgba(99, 102, 241, 0.3);
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover {
  background: #5558e3;
  transform: translateY(-2px);
}
</style>
