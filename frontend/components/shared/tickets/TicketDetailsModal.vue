<script setup lang="ts">
import { computed } from 'vue'

interface Ticket {
  id: number
  title: string
  description: string
  status: 'pending' | 'needs-info' | 'completed' | 'declined' | 'unresolved'
  type: 'feature' | 'bug' | 'feedback'
  priority: 'high' | 'medium' | 'low'
  tags?: string
  category?: string
  response?: string
  creator_id?: string
  created_at: string
  updated_at: string
}

interface TicketDetailsModalProps {
  isOpen: boolean
  ticket: Ticket | null
}

const props = defineProps<TicketDetailsModalProps>()

const emit = defineEmits<{
  close: []
}>()

// Status colors
const statusColors = computed(() => ({
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
  'needs-info': 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700',
  completed: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
  declined: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
  unresolved: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700'
}))

const statusLabels = computed(() => ({
  pending: '⏳ Pending',
  'needs-info': '🔄 In Progress',
  completed: '✅ Complete',
  declined: '❌ Declined',
  unresolved: '⚠️ Unresolved'
}))

// Type labels and colors
const typeLabels = computed(() => ({
  feature: '✨ Feature',
  bug: '🐛 Bug',
  feedback: '💬 Feedback'
}))

const typeColors = computed(() => ({
  feature: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
  bug: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
  feedback: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700'
}))

// Priority labels and colors
const priorityLabels = computed(() => ({
  high: '🔴 High',
  medium: '🟡 Medium',
  low: '🟢 Low'
}))

const priorityColors = computed(() => ({
  high: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
  medium: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700',
  low: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700'
}))

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Parse tags
const parseTags = (tags: string | undefined): string[] => {
  if (!tags) return []
  return tags.split(',').map(t => t.trim()).filter(t => t)
}

const close = () => {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen && ticket" class="modal-overlay" @click.self="close" role="dialog" aria-modal="true" :aria-labelledby="modal-title">
      <div class="modal-container">
        <!-- Modal Header -->
        <div class="modal-header">
          <h2 id="modal-title" class="modal-title">Ticket #{{ ticket.id }}</h2>
          <button class="modal-close-btn" @click="close" aria-label="Close modal">&times;</button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <!-- Ticket Title -->
          <h3 class="ticket-title">{{ ticket.title }}</h3>

          <!-- Status Badges -->
          <div class="ticket-badges">
            <span class="ticket-status" :class="statusColors[ticket.status]">
              {{ statusLabels[ticket.status] }}
            </span>
            <span class="ticket-type" :class="typeColors[ticket.type]">
              {{ typeLabels[ticket.type] }}
            </span>
            <span class="ticket-priority" :class="priorityColors[ticket.priority]">
              {{ priorityLabels[ticket.priority] }}
            </span>
          </div>

          <!-- Ticket Metadata -->
          <div class="ticket-metadata">
            <div class="metadata-item">
              <span class="metadata-label">Created:</span>
              <span class="metadata-value">{{ formatDate(ticket.created_at) }}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Updated:</span>
              <span class="metadata-value">{{ formatDate(ticket.updated_at) }}</span>
            </div>
          </div>

          <!-- Tags and Category -->
          <div v-if="ticket.tags || ticket.category" class="ticket-tags-category">
            <div v-if="ticket.tags" class="ticket-tags">
              <span
                v-for="tag in parseTags(ticket.tags)"
                :key="tag"
                class="tag-chip"
              >
                🏷️ {{ tag }}
              </span>
            </div>
            <div v-if="ticket.category" class="ticket-category">
              <span class="category-chip">📁 {{ ticket.category }}</span>
            </div>
          </div>

          <!-- Description Section -->
          <div class="section">
            <h4 class="section-title">Description</h4>
            <div class="section-content description-content">
              {{ ticket.description || 'No description provided.' }}
            </div>
          </div>

          <!-- Response Section -->
          <div v-if="ticket.response" class="section response-section">
            <h4 class="section-title">Response</h4>
            <div class="section-content response-content">
              {{ ticket.response }}
            </div>
          </div>

          <!-- History Section (Placeholder for future implementation) -->
          <div class="section history-section">
            <h4 class="section-title">History</h4>
            <div class="section-content history-content">
              <p class="history-placeholder">
                Ticket history tracking coming soon. This will show status changes, updates, and comments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.modal-title {
  margin: 0;
  font-size: 1.4rem;
  color: white;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.modal-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 28px;
  line-height: 1;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.ticket-title {
  margin: 0 0 16px 0;
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.3;
}

.ticket-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.ticket-status,
.ticket-type,
.ticket-priority {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid;
}

.ticket-metadata {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metadata-label {
  font-size: 13px;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metadata-value {
  font-size: 13px;
  font-weight: 500;
  color: #4a5568;
}

.ticket-tags-category {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 20px;
}

.ticket-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-chip {
  display: inline-block;
  padding: 4px 10px;
  background: #ebf8ff;
  color: #2b6cb0;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #bee3f8;
}

.ticket-category {
  display: flex;
  align-items: center;
}

.category-chip {
  display: inline-block;
  padding: 4px 10px;
  background: #faf5ff;
  color: #6b46c1;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #d6bcfa;
}

.section {
  margin-bottom: 24px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 700;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.section-content {
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.description-content {
  color: #2d3748;
  line-height: 1.7;
  font-size: 15px;
  white-space: pre-wrap;
  word-break: break-word;
}

.response-section {
  background: linear-gradient(135deg, #ebf8ff 0%, #f0fff4 100%);
}

.response-section .section-title {
  color: #2b6cb0;
  border-bottom-color: #bee3f8;
}

.response-content {
  background: white;
  color: #2d3748;
  line-height: 1.7;
  font-size: 15px;
  border-left: 4px solid #4299e1;
  font-style: italic;
}

.history-section {
  opacity: 0.7;
}

.history-placeholder {
  color: #718096;
  font-style: italic;
  text-align: center;
  padding: 20px;
  margin: 0;
  font-size: 14px;
}

/* Dark mode */
.modal-container {
  background: #2d3748;
}

.modal-body {
  scrollbar-width: thin;
  scrollbar-color: #4a5568 #2d3748;
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #1a202c;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #718096;
}

.ticket-title {
  color: #e2e8f0;
}

.ticket-metadata {
  background: #1a202c;
  border-color: #4a5568;
}

.metadata-label {
  color: #a0aec0;
}

.metadata-value {
  color: #cbd5e0;
}

.section-title {
  color: #cbd5e0;
  border-bottom-color: #4a5568;
}

.section-content {
  background: #1a202c;
  border-color: #4a5568;
}

.description-content {
  color: #e2e8f0;
}

.response-section {
  background: linear-gradient(135deg, #2a4365 0%, #22543d 100%);
}

.response-section .section-title {
  color: #90cdf4;
  border-bottom-color: #4a6fa5;
}

.response-content {
  background: #2d3748;
  color: #e2e8f0;
  border-left-color: #4299e1;
}

.history-placeholder {
  color: #718096;
}

.tag-chip {
  background: #2c5282;
  color: #bee3f8;
  border-color: #2b6cb0;
}

.category-chip {
  background: #44337a;
  color: #d6bcfa;
  border-color: #6b46c1;
}
</style>
