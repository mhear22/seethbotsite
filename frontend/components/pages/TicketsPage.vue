<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import Modal from '../shared/ui/Modal.vue'
import TicketForm from '../shared/ui/TicketForm.vue'
import TicketFilters from '../shared/ui/TicketFilters.vue'
import TicketDetailsModal from '../shared/tickets/TicketDetailsModal.vue'
import TicketStatistics from '../tickets/TicketStatistics.vue'
import TicketCard from '../tickets/TicketCard.vue'
import { useFavorites } from '../../composables/useFavorites'
import { useTicketsStore, type Ticket } from '../../stores/useTicketsStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useNotification } from '../../composables/useNotification'
import { useFilterState } from '../../composables/useFilterState'
import { useTicketOperations } from '../../composables/useTicketOperations'
import { useTicketUI } from '../../composables/useTicketUI'
import { useTicketSettings } from '../../composables/useTicketSettings'
import { formatDate } from '../../utils/format'

// Stores
const ticketsStore = useTicketsStore()
const authStore = useAuthStore()

// Composables
const { notification, showNotification, hideNotification } = useNotification()
const { toggleFavorite, isFavorite } = useFavorites()
const settings = useTicketSettings()
const ui = useTicketUI()
const operations = useTicketOperations(settings.creatorId)

// Filter configuration
const filterConfig = useFilterState<Ticket>({
  items: computed(() => ticketsStore.tickets),
  filterFn: (ticket, filters) => {
    // Status filter
    if (filters.filterStatus) {
      const statusFilter = filters.filterStatus === 'in-progress' ? 'needs-info' : filters.filterStatus
      if (ticket.status !== statusFilter) return false
    }

    // Type filter
    if (filters.filterType && ticket.type !== filters.filterType) return false

    // Priority filter
    if (filters.filterPriority && ticket.priority !== filters.filterPriority) return false

    // Tag filter
    if (filters.filterTag) {
      const tag = filters.filterTag.toLowerCase().trim()
      if (!ticket.tags || !ticket.tags.toLowerCase().includes(tag)) return false
    }

    // Category filter
    if (filters.filterCategory) {
      const category = filters.filterCategory.toLowerCase().trim()
      if (!ticket.category || ticket.category.toLowerCase() !== category) return false
    }

    return true
  },
  searchFn: (ticket, query) => {
    const lowerQuery = query.toLowerCase().trim()
    return ticket.title.toLowerCase().includes(lowerQuery) ||
           ticket.description.toLowerCase().includes(lowerQuery)
  }
})

// Filter state refs for TicketFilters component
const filterStatus = ref('pending')
const filterType = ref('')
const filterPriority = ref('')
const filterTag = ref('')
const filterCategory = ref('')
const searchQuery = ref('')
const ticketFiltersRef = ref<InstanceType<typeof TicketFilters> | null>(null)

// Combined filters object for TicketFilters component
const filters = computed({
  get: () => ({
    searchQuery: searchQuery.value,
    filterStatus: filterStatus.value,
    filterType: filterType.value,
    filterPriority: filterPriority.value,
    filterTag: filterTag.value,
    filterCategory: filterCategory.value
  }),
  set: (value) => {
    searchQuery.value = value.searchQuery
    filterStatus.value = value.filterStatus
    filterType.value = value.filterType
    filterPriority.value = value.filterPriority
    filterTag.value = value.filterTag
    filterCategory.value = value.filterCategory

    // Sync with filterConfig
    filterConfig.searchQuery.value = value.searchQuery
    filterConfig.setFilters({
      filterStatus: value.filterStatus,
      filterType: value.filterType,
      filterPriority: value.filterPriority,
      filterTag: value.filterTag,
      filterCategory: value.filterCategory
    })
  }
})

// Viewing ticket for details modal
const viewingTicket = ref<Ticket | null>(null)

// Status colors and labels
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
  'needs-info': 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700',
  completed: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
  declined: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
  unresolved: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700'
}

const statusLabels = {
  pending: '⏳ Pending',
  'needs-info': '🔄 In Progress',
  completed: '✅ Complete',
  declined: '❌ Declined',
  unresolved: '⚠️ Unresolved'
}

// Helper functions
const isOwnTicket = (ticket: Ticket): boolean => {
  return !!(ticket.creator_id && ticket.creator_id === settings.creatorId.value)
}

const handleTicketFavorite = (ticket: Ticket, e: Event) => {
  e.stopPropagation()
  toggleFavorite('ticket', ticket)
}

const isTicketFavorite = (ticket: Ticket): boolean => {
  return isFavorite('ticket', ticket)
}

const toggleTicketDescription = (ticketId: number, e: Event) => {
  e.stopPropagation()
  ui.toggleDescription(ticketId)
}

const isTicketDescriptionExpanded = (ticketId: number): boolean => {
  return ui.isExpanded(ticketId)
}

const openTicketDetails = (ticket: Ticket, e: Event) => {
  e.stopPropagation()
  viewingTicket.value = ticket
  ui.detailsModal.open(ticket)
}

const closeTicketDetails = () => {
  ui.detailsModal.close()
  viewingTicket.value = null
}

// Wrapped operations with modal management
const handleSubmitTicket = async () => {
  const success = await operations.submitTicket()
  if (success) {
    ui.newTicketModal.close()
  }
}

const handleStartEdit = (ticket: Ticket) => {
  operations.startEdit(ticket)
  ui.editModal.open(ticket)
}

const handleCancelEdit = () => {
  operations.cancelEdit()
  ui.editModal.close()
}

const handleSaveEdit = async () => {
  const success = await operations.saveEdit()
  if (success) {
    ui.editModal.close()
  }
}

const handleStartConfirmTicket = (ticket: Ticket) => {
  operations.startConfirmTicket(ticket)
  ui.confirmModal.open(ticket)
}

const handleCancelConfirmTicket = () => {
  operations.cancelConfirmTicket()
  ui.confirmModal.close()
}

const handleConfirmTicket = async () => {
  const success = await operations.confirmTicket()
  if (success) {
    ui.confirmModal.close()
  }
}

const handleMarkUnresolved = async () => {
  const success = await operations.markUnresolved()
  if (success) {
    ui.confirmModal.close()
  }
}

// Load data on mount
onMounted(async () => {
  await authStore.init()
  settings.initCreatorId()
  await settings.loadSettings()
  await ticketsStore.loadTickets()
  await ticketsStore.loadTicketStats()

  // Keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    // Don't trigger if user is typing in an input/textarea
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    // 'n' or 'c' to create new ticket
    if ((e.key === 'n' || e.key === 'c' || e.key === 'N' || e.key === 'C') && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      ui.newTicketModal.open()
    }

    // '/' to focus search
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      ticketFiltersRef.value?.searchInputRef?.focus()
    }
  }

  window.addEventListener('keydown', handleKeyDown)

  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
})
</script>

<template>
  <div class="tickets-page">
    <div class="tickets-container">
      <!-- Header -->
      <div class="tickets-header">
        <h1>🎫 Tickets & Feedback</h1>
        <p>Submit requests, report bugs, or share your ideas</p>
        <div class="keyboard-hints">
          <span class="hint"><kbd>N</kbd> New ticket</span>
          <span class="hint"><kbd>/</kbd> Search</span>
        </div>

        <!-- Last Collection Display -->
        <div v-if="ticketsStore.lastCollection" class="last-collection">
          <span class="collection-icon">🕐</span>
          <span class="collection-text">Last collected: {{ formatDate(ticketsStore.lastCollection, true) }}</span>
        </div>

        <!-- Ignore Mode Toggle -->
        <div class="ignore-mode-toggle">
          <label class="toggle-switch">
            <input
              type="checkbox"
              :checked="ticketsStore.ignoreMode"
              @change="settings.toggleIgnoreMode"
            />
            <span class="toggle-slider"></span>
          </label>
          <span class="toggle-label">
            {{ ticketsStore.ignoreMode ? '🚫 Paused - Ignoring all tickets' : '✅ Active - Processing tickets' }}
          </span>
        </div>
      </div>

      <!-- Ticket Statistics -->
      <TicketStatistics :ticket-stats="ticketsStore.ticketStats" />

      <!-- Notification Toast -->
      <div v-if="notification.show" class="notification" :class="`notification-${notification.type}`" role="status" aria-live="polite">
        <span class="notification-icon" aria-hidden="true">{{ notification.type === 'success' ? '✅' : '❌' }}</span>
        <span class="notification-message">{{ notification.message }}</span>
        <button @click="hideNotification" class="notification-close" aria-label="Close notification">&times;</button>
      </div>

      <!-- Error Message Display -->
      <div v-if="ticketsStore.error" class="error-message" role="alert" aria-live="assertive">
        <span class="error-icon" aria-hidden="true">❌</span>
        <span class="error-text">{{ ticketsStore.error }}</span>
        <button @click="ticketsStore.error = null" class="error-close" aria-label="Close error">&times;</button>
      </div>

      <button
        @click="ui.newTicketModal.open()"
        class="new-ticket-btn"
      >
        + New Ticket
      </button>

      <!-- Filter Chips -->
      <TicketFilters ref="ticketFiltersRef" v-model="filters" />

      <!-- Filtered Tickets List -->
      <div class="tickets-list">
        <div v-if="ticketsStore.loading" class="loading-state" aria-live="polite" aria-busy="true">
          <div class="loading-spinner" aria-hidden="true"></div>
          <span>Loading tickets...</span>
        </div>
        <div v-else-if="filterConfig.filtered.value.length === 0" class="empty-state" role="status">
          No tickets match your filters.
        </div>
        <TicketCard
          v-for="ticket in filterConfig.filtered.value"
          :key="ticket.id"
          :ticket="ticket"
          :status-colors="statusColors"
          :status-labels="statusLabels"
          :is-own-ticket="isOwnTicket"
          :is-ticket-favorite="isTicketFavorite"
          :is-ticket-description-expanded="isTicketDescriptionExpanded"
          :loading="ticketsStore.loading"
          @favorite="handleTicketFavorite"
          @toggle-description="toggleTicketDescription"
          @view-details="openTicketDetails"
          @edit="handleStartEdit"
          @close="operations.closeOwnTicket"
          @delete="operations.deleteOwnTicket"
        />
      </div>
    </div>

    <!-- New Ticket Modal -->
    <Modal
      :is-open="ui.newTicketModal.isOpen.value"
      title="Create New Ticket"
      @close="ui.newTicketModal.close()"
    >
      <TicketForm
        v-model:title="operations.newTicketForm.formData.value.title"
        v-model:description="operations.newTicketForm.formData.value.description"
        v-model:tags="operations.newTicketForm.formData.value.tags"
        v-model:category="operations.newTicketForm.formData.value.category"
        :is-editing="false"
        :loading="ticketsStore.loading"
        :estimated-wait-time-minutes="ticketsStore.estimatedWaitTime?.minutes ?? null"
        :sample-size="ticketsStore.estimatedWaitTime?.sampleSize ?? 0"
        @submit="handleSubmitTicket"
        @cancel="ui.newTicketModal.close()"
      />
    </Modal>

    <!-- Edit Ticket Modal -->
    <Modal
      :is-open="ui.editModal.isOpen.value"
      title="Edit Ticket"
      @close="handleCancelEdit"
    >
      <TicketForm
        v-model:title="operations.editTicketForm.formData.value.title"
        v-model:description="operations.editTicketForm.formData.value.description"
        v-model:tags="operations.editTicketForm.formData.value.tags"
        v-model:category="operations.editTicketForm.formData.value.category"
        :is-editing="true"
        :loading="ticketsStore.loading"
        @submit="handleSaveEdit"
        @cancel="handleCancelEdit"
      />
    </Modal>

    <!-- Confirm Ticket Modal -->
    <Modal
      :is-open="ui.confirmModal.isOpen.value"
      :title="operations.confirmingTicket.value ? `Review Ticket #${operations.confirmingTicket.value.id}` : 'Review Ticket'"
      @close="handleCancelConfirmTicket"
    >
      <div v-if="operations.confirmingTicket.value" class="confirm-modal-content">
        <div class="ticket-preview">
          <h3>{{ operations.confirmingTicket.value.title }}</h3>
          <p>{{ operations.confirmingTicket.value.description }}</p>
          <div v-if="operations.confirmingTicket.value.response" class="existing-response">
            <strong>Current Response:</strong>
            <p>{{ operations.confirmingTicket.value.response }}</p>
          </div>
        </div>

        <div class="confirm-actions">
          <div class="action-buttons">
            <button
              @click="handleConfirmTicket"
              class="btn-confirm"
              :disabled="ticketsStore.loading"
            >
              ✅ Confirm Completion
            </button>

            <div class="unresolved-section">
              <label for="unresolved-reason">Or mark as unresolved:</label>
              <textarea
                id="unresolved-reason"
                v-model="operations.unresolvedForm.formData.value.reason"
                placeholder="Explain why this ticket is not properly completed..."
                class="input-field textarea-field"
                rows="3"
              ></textarea>
              <button
                @click="handleMarkUnresolved"
                class="btn-unresolved"
                :disabled="ticketsStore.loading || !operations.unresolvedForm.formData.value.reason.trim()"
              >
                ⚠️ Mark as Unresolved
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Ticket Details Modal -->
    <TicketDetailsModal
      :is-open="ui.detailsModal.isOpen.value"
      :ticket="viewingTicket"
      @close="closeTicketDetails"
    />
  </div>
</template>

<style scoped>
.tickets-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.tickets-container {
  max-width: 1000px;
  margin: 0 auto;
}

.tickets-header {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  text-align: center;
}

.tickets-header h1 {
  margin: 0 0 8px 0;
  color: #2d3748;
  font-size: 32px;
  font-weight: 700;
}

.tickets-header p {
  margin: 0 0 16px 0;
  color: #718096;
  font-size: 16px;
}

.keyboard-hints {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
}

.hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #718096;
}

.hint kbd {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 2px 8px;
  font-family: monospace;
  font-size: 12px;
  font-weight: 600;
  color: #2d3748;
}

.ignore-mode-toggle {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
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
  display: flex;
  align-items: center;
  gap: 12px;
}

.error-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.error-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #c53030;
  line-height: 1;
  padding: 0;
  min-width: 24px;
}

.error-close:hover {
  color: #9b2c2c;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.new-ticket-btn:hover {
  background: #3182ce;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.new-ticket-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loading-state,
.empty-state {
  background: white;
  padding: 40px 20px;
  border-radius: 12px;
  text-align: center;
  color: #718096;
  font-size: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #4299e1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.confirm-modal-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ticket-preview {
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.ticket-preview h3 {
  margin: 0 0 8px 0;
  color: #2d3748;
  font-size: 18px;
  font-weight: 600;
}

.ticket-preview p {
  margin: 0;
  color: #4a5568;
  font-size: 14px;
  line-height: 1.6;
}

.existing-response {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.existing-response strong {
  display: block;
  margin-bottom: 6px;
  color: #2d3748;
  font-size: 14px;
}

.existing-response p {
  color: #718096;
  font-size: 13px;
}

.confirm-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn-confirm,
.btn-unresolved {
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm {
  background: #48bb78;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #38a169;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(72, 187, 120, 0.3);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-unresolved {
  background: #ed8936;
  color: white;
}

.btn-unresolved:hover:not(:disabled) {
  background: #dd6b20;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(237, 137, 54, 0.3);
}

.btn-unresolved:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.unresolved-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #fffaf0;
  border-radius: 8px;
  border: 1px solid #feebc8;
}

.unresolved-section label {
  font-size: 14px;
  font-weight: 600;
  color: #744210;
}

.input-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.textarea-field {
  resize: vertical;
  min-height: 80px;
}

.dark .tickets-header {
  background: #2d3748;
}

.dark .tickets-header h1 {
  color: #e2e8f0;
}

.dark .tickets-header p {
  color: #cbd5e0;
}

.dark .hint {
  color: #cbd5e0;
}

.dark .hint kbd {
  background: #4a5568;
  border-color: #718096;
  color: #e2e8f0;
}

.dark .toggle-label {
  color: #cbd5e0;
}

.dark .last-collection {
  background: #2c5282;
  border-color: #2b6cb0;
}

.dark .collection-text {
  color: #90cdf4;
}

.dark .error-message {
  background: #742a2a;
  color: #feb2b2;
  border-color: #9b2c2c;
}

.dark .error-close {
  color: #feb2b2;
}

.dark .error-close:hover {
  color: #fc8181;
}

.dark .loading-state,
.dark .empty-state {
  background: #2d3748;
  color: #cbd5e0;
}

.dark .loading-spinner {
  border-color: #4a5568;
  border-top-color: #4299e1;
}

.dark .ticket-preview {
  background: #1a202c;
  border-color: #4a5568;
}

.dark .ticket-preview h3 {
  color: #e2e8f0;
}

.dark .ticket-preview p {
  color: #cbd5e0;
}

.dark .existing-response {
  border-top-color: #4a5568;
}

.dark .existing-response strong {
  color: #e2e8f0;
}

.dark .existing-response p {
  color: #a0aec0;
}

.dark .unresolved-section {
  background: #744210;
  border-color: #975a16;
}

.dark .unresolved-section label {
  color: #feebc8;
}

.dark .input-field {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e8f0;
}

.dark .input-field:focus {
  border-color: #4299e1;
}
</style>
