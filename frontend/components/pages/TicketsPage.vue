<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import Modal from '../shared/ui/Modal.vue'
import TicketForm from '../shared/ui/TicketForm.vue'

interface Ticket {
  id: number
  title: string
  description: string
  status: 'pending' | 'needs-info' | 'completed' | 'declined'
  type: 'feature' | 'bug' | 'feedback'
  priority: 'high' | 'medium' | 'low'
  response?: string
  creator_id?: string
  created_at: string
  updated_at: string
}

const tickets = ref<Ticket[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showNewTicketModal = ref(false)
const ignoreMode = ref(false)
const lastCollection = ref<string | null>(null)
const notification = ref<{ show: boolean; message: string; type: 'success' | 'error' }>({
  show: false,
  message: '',
  type: 'success'
})

// Filter state
const filterStatus = ref('all')
const filterType = ref('all')
const filterPriority = ref('all')

// Admin state
const apiKey = ref<string>('')
const showAdminPanel = ref(false)
const closingTicket = ref<Ticket | null>(null)
const showForm = ref(false)
const closeForm = ref({
  status: 'completed' as 'completed' | 'declined',
  response: ''
})

// User/Creator state
const creatorId = ref<string>('')

// New ticket form state
const newTicket = ref({
  title: '',
  description: '',
  type: 'feature' as 'feature' | 'bug' | 'feedback', // Kept for backend compatibility
  priority: 'medium' as 'high' | 'medium' | 'low' // Kept for backend compatibility
})

// Edit ticket modal state
const showEditModal = ref(false)
const editingTicket = ref<Ticket | null>(null)
const editForm = ref({
  title: '',
  description: '',
  type: 'feature' as 'feature' | 'bug' | 'feedback',
  priority: 'medium' as 'high' | 'medium' | 'low'
})

// Status colors
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
  'needs-info': 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700',
  completed: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
  declined: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700'
}

const statusLabels = {
  pending: '⏳ Pending',
  'needs-info': '🔄 In Progress',
  completed: '✅ Complete',
  declined: '❌ Declined'
}

// Filter options
const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: '⏳ Pending' },
  { value: 'in-progress', label: '🔄 In Progress' },
  { value: 'completed', label: '✅ Complete' }
]

const typeOptions = [
  { value: 'all', label: 'All' },
  { value: 'feature', label: '✨ Feature' },
  { value: 'bug', label: '🐛 Bug' },
  { value: 'feedback', label: '💬 Feedback' }
]

const priorityOptions = [
  { value: 'all', label: 'All' },
  { value: 'high', label: '🔴 High' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'low', label: '🟢 Low' }
]

// Computed property for filtered tickets
const filteredTickets = computed(() => {
  let result = tickets.value

  if (filterStatus.value !== 'all') {
    const statusFilter = filterStatus.value === 'in-progress' ? 'needs-info' : filterStatus.value
    result = result.filter(t => t.status === statusFilter)
  }

  if (filterType.value !== 'all') {
    result = result.filter(t => t.type === filterType.value)
  }

  if (filterPriority.value !== 'all') {
    result = result.filter(t => t.priority === filterPriority.value)
  }

  return result
})

// Generate or get creator ID
const getOrCreateCreatorId = (): string => {
  let id = localStorage.getItem('tickets-creator-id')
  if (!id) {
    // Generate a random ID
    id = 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('tickets-creator-id', id)
  }
  return id
}

// Check if a ticket belongs to the current user
const isOwnTicket = (ticket: Ticket): boolean => {
  return !!(ticket.creator_id && ticket.creator_id === creatorId.value)
}

// Load tickets
const loadTickets = async () => {
  loading.value = true
  error.value = null
  try {
    const params = new URLSearchParams()
    if (filterStatus.value !== 'all') {
      const statusParam = filterStatus.value === 'in-progress' ? 'needs-info' : filterStatus.value
      params.append('status', statusParam)
    }

    const response = await fetch(`/api/tickets?${params.toString()}`)
    if (!response.ok) throw new Error('Failed to load tickets')
    const data = await response.json()
    tickets.value = data.tickets || []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load tickets'
  } finally {
    loading.value = false
  }
}

// Watch for filter changes and reload tickets
watch([filterStatus], () => {
  loadTickets()
})

// Show notification
const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notification.value = {
    show: true,
    message,
    type
  }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// Hide notification
const hideNotification = () => {
  notification.value.show = false
}

// Submit new ticket
const submitTicket = async () => {
  if (!newTicket.value.title.trim()) {
    error.value = 'Title is required'
    return
  }

  loading.value = true
  error.value = null
  try {
    const response = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTicket.value.title.trim(),
        description: newTicket.value.description.trim() || null,
        creator_id: creatorId.value
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to submit ticket')
    }

    // Reset form and close modal
    newTicket.value = {
      title: '',
      description: '',
      type: 'feature',
      priority: 'medium'
    }
    showNewTicketModal.value = false

    // Show success notification
    showNotification('Ticket submitted successfully!')

    // Reload tickets
    await loadTickets()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to submit ticket'
  } finally {
    loading.value = false
  }
}

// Start editing a ticket
const startEdit = (ticket: Ticket) => {
  editingTicket.value = ticket
  editForm.value = {
    title: ticket.title,
    description: ticket.description,
    type: ticket.type,
    priority: ticket.priority
  }
  showEditModal.value = true
}

// Cancel editing
const cancelEdit = () => {
  editingTicket.value = null
  showEditModal.value = false
  editForm.value = {
    title: '',
    description: '',
    type: 'feature',
    priority: 'medium'
  }
}

// Save edited ticket
const saveEdit = async () => {
  if (!editingTicket.value) return
  if (!editForm.value.title.trim()) {
    error.value = 'Title is required'
    return
  }

  loading.value = true
  error.value = null
  try {
    const response = await fetch(`/api/tickets/${editingTicket.value.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editForm.value.title.trim(),
        description: editForm.value.description.trim() || null
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to update ticket')
    }

    // Reset edit state and close modal
    editingTicket.value = null
    showEditModal.value = false
    editForm.value = {
      title: '',
      description: '',
      type: 'feature',
      priority: 'medium'
    }

    // Show success notification
    showNotification('Ticket updated successfully!')

    // Reload tickets
    await loadTickets()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update ticket'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Toggle ignore mode
const toggleIgnoreMode = async () => {
  const newValue = !ignoreMode.value

  // Save to localStorage for quick UI response
  localStorage.setItem('tickets-ignore-mode', String(newValue))
  ignoreMode.value = newValue

  // Sync with backend (don't wait for it to succeed for UI)
  try {
    await fetch('/api/tickets/settings/ignore-mode', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ignoreMode: newValue })
    })
  } catch (err) {
    console.error('Failed to sync ignore mode with backend:', err)
    // UI already updated, so no action needed
  }
}

// Load ignore mode from backend
const loadIgnoreMode = async () => {
  try {
    const response = await fetch('/api/tickets/settings/ignore-mode')
    if (response.ok) {
      const data = await response.json()
      ignoreMode.value = data.ignoreMode
      localStorage.setItem('tickets-ignore-mode', String(data.ignoreMode))
    }
  } catch (err) {
    // Fallback to localStorage if backend fails
    console.warn('Failed to load ignore mode from backend, using localStorage')
    const savedIgnoreMode = localStorage.getItem('tickets-ignore-mode')
    if (savedIgnoreMode) {
      ignoreMode.value = savedIgnoreMode === 'true'
    }
  }
}

// Load last collection timestamp
const loadLastCollection = async () => {
  try {
    const response = await fetch('/api/tickets/settings/last-collection')
    if (response.ok) {
      const data = await response.json()
      lastCollection.value = data.lastCollection
    }
  } catch (err) {
    console.warn('Failed to load last collection from backend:', err)
  }
}

// Load API key from localStorage
const loadApiKey = () => {
  const saved = localStorage.getItem('tickets-admin-api-key')
  if (saved) {
    apiKey.value = saved
  }
}

// Save API key to localStorage
const saveApiKey = () => {
  if (apiKey.value) {
    localStorage.setItem('tickets-admin-api-key', apiKey.value)
  } else {
    localStorage.removeItem('tickets-admin-api-key')
  }
}

// Start closing a ticket
const startCloseTicket = (ticket: Ticket) => {
  closingTicket.value = ticket
  closeForm.value = {
    status: 'completed',
    response: ''
  }
  showForm.value = false
}

// Cancel closing ticket
const cancelCloseTicket = () => {
  closingTicket.value = null
  closeForm.value = {
    status: 'completed',
    response: ''
  }
}

// Close ticket (admin)
const closeTicket = async () => {
  if (!closingTicket.value) return

  if (!apiKey.value.trim()) {
    error.value = 'API key is required to close tickets'
    return
  }

  loading.value = true
  error.value = null
  try {
    const response = await fetch(`/api/tickets/${closingTicket.value.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey.value.trim()
      },
      body: JSON.stringify({
        status: closeForm.value.status,
        response: closeForm.value.response
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to close ticket')
    }

    // Reset form
    closingTicket.value = null
    closeForm.value = {
      status: 'completed',
      response: ''
    }

    // Show success notification
    showNotification('Ticket closed successfully!')

    // Reload tickets
    await loadTickets()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to close ticket'
  } finally {
    loading.value = false
  }
}

// Close own ticket (user)
const closeOwnTicket = async (ticket: Ticket) => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`/api/tickets/${ticket.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'completed',
        creator_id: creatorId.value
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to close ticket')
    }

    // Show success notification
    showNotification('Ticket closed successfully!')

    // Reload tickets
    await loadTickets()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to close ticket'
  } finally {
    loading.value = false
  }
}

// Delete own ticket (user)
const deleteOwnTicket = async (ticket: Ticket) => {
  if (!confirm(`Are you sure you want to delete "${ticket.title}"?`)) {
    return
  }

  loading.value = true
  error.value = null
  try {
    const response = await fetch(`/api/tickets/${ticket.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Creator-ID': creatorId.value
      },
      body: JSON.stringify({
        creator_id: creatorId.value
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to delete ticket')
    }

    // Reload tickets
    await loadTickets()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete ticket'
  } finally {
    loading.value = false
  }
}

// Load on mount
onMounted(() => {
  // Initialize creator ID
  creatorId.value = getOrCreateCreatorId()
  loadIgnoreMode()
  loadLastCollection()
  loadApiKey()
  loadTickets()
})
</script>

<template>
  <div class="tickets-page">
    <div class="tickets-container">
      <!-- Header -->
      <div class="tickets-header">
        <h1>🎫 Tickets & Feedback</h1>
        <p>Submit requests, report bugs, or share your ideas</p>

        <!-- Last Collection Display -->
        <div v-if="lastCollection" class="last-collection">
          <span class="collection-icon">🕐</span>
          <span class="collection-text">Last collected: {{ formatDate(lastCollection) }}</span>
        </div>

        <!-- Ignore Mode Toggle -->
        <div class="ignore-mode-toggle">
          <label class="toggle-switch">
            <input
              type="checkbox"
              :checked="ignoreMode"
              @change="toggleIgnoreMode"
            />
            <span class="toggle-slider"></span>
          </label>
          <span class="toggle-label">
            {{ ignoreMode ? '🚫 Paused - Ignoring all tickets' : '✅ Active - Processing tickets' }}
          </span>
        </div>
      </div>

      <!-- Notification Toast -->
      <div v-if="notification.show" class="notification" :class="`notification-${notification.type}`">
        <span class="notification-icon">{{ notification.type === 'success' ? '✅' : '❌' }}</span>
        <span class="notification-message">{{ notification.message }}</span>
        <button @click="hideNotification" class="notification-close">&times;</button>
      </div>

      <button
        @click="showNewTicketModal = true"
        class="new-ticket-btn"
      >
        + New Ticket
      </button>

      <!-- Filter Chips -->
      <div class="filter-section">
        <div class="filter-group">
          <span class="filter-label">Status:</span>
          <div class="filter-chips">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              @click="filterStatus = option.value"
              class="filter-chip"
              :class="{ active: filterStatus === option.value }"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        <!-- Type and Priority filters removed per ticket #65 -->
      </div>

      <!-- Tickets List -->
      <div class="tickets-list">
        <div v-if="loading" class="loading-state">
          Loading tickets...
        </div>
        <div v-else-if="tickets.length === 0" class="empty-state">
          <template v-if="filterStatus === 'all'">
            No tickets yet. Be the first to share an idea! 💡
          </template>
          <template v-else>
            No tickets match your filters. Try adjusting them to see more results.
          </template>
        </div>
        <div
          v-for="ticket in filteredTickets"
          :key="ticket.id"
          class="ticket-card"
        >
          <div class="ticket-header">
            <h3 class="ticket-title">{{ ticket.title }}</h3>
            <div class="ticket-badges">
              <span class="ticket-status" :class="statusColors[ticket.status]">
                {{ statusLabels[ticket.status] }}
              </span>
            </div>
          </div>
          <div class="ticket-description">{{ ticket.description }}</div>
          <div class="ticket-meta">
            <span class="ticket-date">Created: {{ formatDate(ticket.created_at) }}</span>
            <div class="ticket-actions">
              <button
                v-if="ticket.status === 'needs-info'"
                @click="startEdit(ticket)"
                class="edit-ticket-btn"
                :disabled="loading"
              >
                ✏️ Edit
              </button>
              <button
                v-if="isOwnTicket(ticket) && ticket.status === 'pending'"
                @click="closeOwnTicket(ticket)"
                class="close-ticket-btn"
                :disabled="loading"
              >
                ✅ Close
              </button>
              <button
                v-if="isOwnTicket(ticket) && (ticket.status === 'pending' || ticket.status === 'needs-info')"
                @click="deleteOwnTicket(ticket)"
                class="delete-ticket-btn"
                :disabled="loading"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
          <div v-if="ticket.response" class="ticket-response">
            <div class="response-label">Response:</div>
            <div class="response-text">{{ ticket.response }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Ticket Modal -->
    <Modal
      :is-open="showNewTicketModal"
      title="Create New Ticket"
      @close="showNewTicketModal = false"
    >
      <TicketForm
        v-model:title="newTicket.title"
        v-model:description="newTicket.description"
        :is-editing="false"
        :loading="loading"
        @submit="submitTicket"
        @cancel="showNewTicketModal = false"
      />
    </Modal>

    <!-- Edit Ticket Modal -->
    <Modal
      :is-open="showEditModal"
      title="Edit Ticket"
      @close="cancelEdit"
    >
      <TicketForm
        v-model:title="editForm.title"
        v-model:description="editForm.description"
        :is-editing="true"
        :loading="loading"
        @submit="saveEdit"
        @cancel="cancelEdit"
      />
    </Modal>
  </div>
</template>

<style scoped>
.tickets-page {
  min-height: 100vh;
  padding: 100px 20px 40px;
}

.tickets-container {
  max-width: 800px;
  margin: 0 auto;
}

.tickets-header {
  text-align: center;
  margin-bottom: 40px;
}

.tickets-header h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  color: #2d3748;
}

.tickets-header p {
  color: #718096;
  margin: 0;
}

.ignore-mode-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px 16px;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e0;
  transition: 0.3s;
  border-radius: 28px;
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #e53e3e;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.toggle-label {
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

.last-collection {
  margin-top: 12px;
  padding: 8px 12px;
  background: #ebf8ff;
  border-radius: 6px;
  border: 1px solid #bee3f8;
  display: flex;
  align-items: center;
  gap: 8px;
}

.collection-icon {
  font-size: 16px;
}

.collection-text {
  font-size: 13px;
  color: #2c5282;
}

.error-message {
  background: #feb2b2;
  color: #c53030;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #fc8181;
}

.notification {
  position: fixed;
  top: 100px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  animation: slideIn 0.3s ease;
  max-width: 400px;
}

.notification-success {
  border-left: 4px solid #48bb78;
}

.notification-error {
  border-left: 4px solid #f56565;
}

.notification-icon {
  font-size: 20px;
}

.notification-message {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
}

.notification-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #a0aec0;
  line-height: 1;
  padding: 0;
  min-width: 24px;
}

.notification-close:hover {
  color: #4a5568;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.dark .notification {
  background: #2d3748;
}

.dark .notification-message {
  color: #e2e8f0;
}

.dark .notification-close {
  color: #cbd5e0;
}

.dark .notification-close:hover {
  color: #e2e8f0;
}

.filter-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

.filter-group {
  margin-bottom: 16px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
}

.filter-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chip:hover {
  border-color: #4299e1;
  color: #2b6cb0;
  transform: translateY(-1px);
}

.filter-chip.active {
  background: #4299e1;
  border-color: #4299e1;
  color: white;
}

.new-ticket-btn {
  width: 100%;
  padding: 14px 20px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;
}

.new-ticket-btn:hover {
  background: #3182ce;
  transform: translateY(-1px);
}

.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
  font-size: 18px;
}

.ticket-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.ticket-title {
  margin: 0;
  color: #2d3748;
  font-size: 1.25rem;
  flex: 1;
}

.ticket-status {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid;
}

.ticket-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.ticket-type {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid;
}

.ticket-type.type-feature {
  background: #ebf8ff;
  color: #2b6cb0;
  border-color: #bee3f8;
}

.ticket-type.type-bug {
  background: #fff5f5;
  color: #c53030;
  border-color: #fc8181;
}

.ticket-type.type-feedback {
  background: #f7fafc;
  color: #4a5568;
  border-color: #cbd5e0;
}

.ticket-priority {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid;
}

.ticket-priority.priority-high {
  background: #fff5f5;
  color: #c53030;
  border-color: #fc8181;
}

.ticket-priority.priority-medium {
  background: #fffaf0;
  color: #c05621;
  border-color: #fbd38d;
}

.ticket-priority.priority-low {
  background: #f0fff4;
  color: #276749;
  border-color: #9ae6b4;
}

.ticket-description {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 12px;
}

.ticket-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 8px;
}

.ticket-date {
  font-size: 13px;
  color: #a0aec0;
}

.ticket-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.edit-ticket-btn,
.close-ticket-btn,
.delete-ticket-btn {
  padding: 6px 14px;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-ticket-btn {
  background: #ed8936;
}

.edit-ticket-btn:hover:not(:disabled) {
  background: #dd6b20;
  transform: translateY(-1px);
}

.close-ticket-btn {
  background: #48bb78;
}

.close-ticket-btn:hover:not(:disabled) {
  background: #38a169;
  transform: translateY(-1px);
}

.delete-ticket-btn {
  background: #f56565;
}

.delete-ticket-btn:hover:not(:disabled) {
  background: #e53e3e;
  transform: translateY(-1px);
}

.edit-ticket-btn:disabled,
.close-ticket-btn:disabled,
.delete-ticket-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
}

.ticket-response {
  margin-top: 16px;
  padding: 14px;
  background: #f7fafc;
  border-radius: 8px;
  border-left: 4px solid #4299e1;
}

.response-label {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 6px;
  font-size: 14px;
}

.response-text {
  color: #4a5568;
  line-height: 1.6;
  font-size: 14px;
}

/* Dark mode */
.dark .tickets-page {
  background: #1a202c;
}

.dark .tickets-header h1 {
  color: #e2e8f0;
}

.dark .tickets-header p {
  color: #a0aec0;
}

.dark .filter-section {
  background: rgba(40, 44, 52, 0.95);
  border-color: #4a5568;
}

.dark .ticket-card {
  background: #2d3748;
  border-color: #4a5568;
}

.dark .ticket-title,
.dark .response-label {
  color: #e2e8f0;
}

.dark .ticket-description,
.dark .ticket-response,
.dark .response-text {
  color: #cbd5e0;
}

.dark .ticket-meta {
  border-top-color: #4a5568;
}

.dark .ticket-response {
  background: #1a202c;
}

.dark .ignore-mode-toggle {
  background: #2d3748;
  border-color: #4a5568;
}

.dark .toggle-slider {
  background-color: #4a5568;
}

.dark .toggle-label {
  color: #cbd5e0;
}

.dark .last-collection {
  background: #2a4365;
  border-color: #4a6fa5;
}

.dark .collection-text {
  color: #90cdf4;
}

.dark .filter-label {
  color: #cbd5e0;
}

.dark .filter-chip {
  background: rgba(45, 55, 72, 0.95);
  border-color: #4a5568;
  color: #cbd5e0;
}

.dark .filter-chip:hover {
  border-color: #ff6b9d;
  color: #ffb6c1;
}

.dark .filter-chip.active {
  background: rgba(255, 107, 157, 0.3);
  border-color: rgba(255, 107, 157, 0.7);
  color: #ffb6c1;
}
</style>
