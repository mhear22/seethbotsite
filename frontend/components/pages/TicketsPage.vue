<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import Modal from '../shared/ui/Modal.vue'
import TicketForm from '../shared/ui/TicketForm.vue'
import { useFavorites } from '../../composables/useFavorites'

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

interface TicketStats {
  totalTickets: number
  byStatus: { [key: string]: number }
  oldestTicket: { id: number; title: string; created_at: string }
  newestTicket: { id: number; title: string; created_at: string }
  dates: {
    oldestCreated: string
    newestCreated: string
    oldestCompleted: string | null
    newestCompleted: string | null
  } | null
}

const tickets = ref<Ticket[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const ticketStats = ref<TicketStats | null>(null)
const showNewTicketModal = ref(false)
const ignoreMode = ref(false)
const lastCollection = ref<string | null>(null)
const estimatedWaitTime = ref<{ minutes: number | null; sampleSize: number } | null>(null)
const notification = ref<{ show: boolean; message: string; type: 'success' | 'error' }>({
  show: false,
  message: '',
  type: 'success'
})

// Filter state (default to pending per ticket #151)
const filterStatus = ref('pending')
const filterType = ref('')
const filterPriority = ref('')
const filterTag = ref('')
const filterCategory = ref('')

// Search state
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)

// Favorites composable
const { toggleFavorite, isFavorite } = useFavorites()

// Admin state
const showAdminPanel = ref(false)
const closingTicket = ref<Ticket | null>(null)
const showForm = ref(false)
const closeForm = ref({
  status: 'completed' as 'completed' | 'declined',
  response: ''
})

// Expanded descriptions state (Set of ticket IDs that are expanded)
const expandedTicketIds = ref<Set<number>>(new Set())

// Ticket completion confirmation state
const confirmingTicket = ref<Ticket | null>(null)
const showConfirmModal = ref(false)
const unresolvedForm = ref({
  reason: ''
})

// User/Creator state
const creatorId = ref<string>('')

// New ticket form state
const newTicket = ref({
  title: '',
  description: '',
  type: 'feature' as 'feature' | 'bug' | 'feedback', // Kept for backend compatibility
  priority: 'medium' as 'high' | 'medium' | 'low', // Kept for backend compatibility
  tags: '',
  category: ''
})

// Edit ticket modal state
const showEditModal = ref(false)
const editingTicket = ref<Ticket | null>(null)
const editForm = ref({
  title: '',
  description: '',
  type: 'feature' as 'feature' | 'bug' | 'feedback',
  priority: 'medium' as 'high' | 'medium' | 'low',
  tags: '',
  category: ''
})

// Status colors
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

// Filter options (no "all" option per ticket #151)
const statusOptions = [
  { value: 'pending', label: '⏳ Pending' },
  { value: 'in-progress', label: '🔄 In Progress' },
  { value: 'completed', label: '✅ Complete' }
]

const typeOptions = [
  { value: 'feature', label: '✨ Feature' },
  { value: 'bug', label: '🐛 Bug' },
  { value: 'feedback', label: '💬 Feedback' }
]

const priorityOptions = [
  { value: 'high', label: '🔴 High' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'low', label: '🟢 Low' }
]

// Computed property for filtered tickets
const filteredTickets = computed(() => {
  let result = tickets.value

  if (filterStatus.value) {
    const statusFilter = filterStatus.value === 'in-progress' ? 'needs-info' : filterStatus.value
    result = result.filter(t => t.status === statusFilter)
  }

  if (filterType.value) {
    result = result.filter(t => t.type === filterType.value)
  }

  if (filterPriority.value) {
    result = result.filter(t => t.priority === filterPriority.value)
  }

  // Filter by tag
  if (filterTag.value) {
    const tag = filterTag.value.toLowerCase().trim()
    result = result.filter(t => 
      t.tags && t.tags.toLowerCase().includes(tag)
    )
  }

  // Filter by category
  if (filterCategory.value) {
    const category = filterCategory.value.toLowerCase().trim()
    result = result.filter(t => 
      t.category && t.category.toLowerCase() === category
    )
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter(t => 
      t.title.toLowerCase().includes(query) || 
      t.description.toLowerCase().includes(query)
    )
  }

  return result
})

// Kanban columns
const kanbanColumns = computed(() => {
  return {
    pending: tickets.value.filter(t => t.status === 'pending'),
    inProgress: tickets.value.filter(t => t.status === 'needs-info'),
    completed: tickets.value.filter(t => t.status === 'completed')
  }
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

// Favorite helpers
const handleTicketFavorite = (ticket: Ticket, e: Event) => {
  e.stopPropagation()
  toggleFavorite('ticket', ticket)
}

const isTicketFavorite = (ticket: Ticket): boolean => {
  return isFavorite('ticket', ticket)
}

// Expand/collapse ticket description
const toggleTicketDescription = (ticketId: number, e: Event) => {
  e.stopPropagation()
  if (expandedTicketIds.value.has(ticketId)) {
    expandedTicketIds.value.delete(ticketId)
  } else {
    expandedTicketIds.value.add(ticketId)
  }
  // Force reactivity by creating a new Set
  expandedTicketIds.value = new Set(expandedTicketIds.value)
}

const isTicketDescriptionExpanded = (ticketId: number): boolean => {
  return expandedTicketIds.value.has(ticketId)
}

// Load tickets
const loadTickets = async () => {
  loading.value = true
  error.value = null
  try {
    // Always load all tickets and filter client-side for consistency
    // Sort by updated_at descending to show most recent tickets first
    const response = await fetch('/api/tickets?sortBy=updated_at')
    if (!response.ok) throw new Error('Failed to load tickets')
    const data = await response.json()
    tickets.value = data.tickets || []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load tickets'
  } finally {
    loading.value = false
  }
}

// Load ticket statistics
const loadTicketStats = async () => {
  try {
    const response = await fetch('/api/tickets/stats')
    if (!response.ok) throw new Error('Failed to load ticket stats')
    const stats = await response.json()
    ticketStats.value = stats
  } catch (err) {
    console.warn('Failed to load ticket stats:', err)
  }
}

// Watch for filter changes and reload tickets
// Note: We don't need to reload on filter changes anymore since we filter client-side
// This is handled by the filteredTickets computed property

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
        type: newTicket.value.type,
        priority: newTicket.value.priority,
        tags: newTicket.value.tags.trim() || null,
        category: newTicket.value.category.trim() || null,
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
      priority: 'medium',
      tags: '',
      category: ''
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
  error.value = null
  editingTicket.value = ticket
  editForm.value = {
    title: ticket.title,
    description: ticket.description,
    type: ticket.type,
    priority: ticket.priority,
    tags: ticket.tags || '',
    category: ticket.category || ''
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
    priority: 'medium',
    tags: '',
    category: ''
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
        description: editForm.value.description.trim() || null,
        type: editForm.value.type,
        priority: editForm.value.priority,
        tags: editForm.value.tags.trim() || null,
        category: editForm.value.category.trim() || null
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
      priority: 'medium',
      tags: '',
      category: ''
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
  return date.toLocaleDateString(undefined, {
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

// Load estimated wait time
const loadEstimatedWaitTime = async () => {
  try {
    const response = await fetch('/api/tickets/estimated-wait-time')
    if (response.ok) {
      const data = await response.json()
      if (data.estimatedWaitTimeMinutes !== null) {
        estimatedWaitTime.value = {
          minutes: data.estimatedWaitTimeMinutes,
          sampleSize: data.sampleSize
        }
      }
    }
  } catch (err) {
    console.warn('Failed to load estimated wait time from backend:', err)
  }
}

// Start closing a ticket
const startCloseTicket = (ticket: Ticket) => {
  error.value = null
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

// Close ticket
const closeTicket = async () => {
  if (!closingTicket.value) return

  loading.value = true
  error.value = null
  try {
    const response = await fetch(`/api/tickets/${closingTicket.value.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
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

// Start confirming a ticket
const startConfirmTicket = (ticket: Ticket) => {
  error.value = null
  confirmingTicket.value = ticket
  showConfirmModal.value = true
}

// Cancel confirming ticket
const cancelConfirmTicket = () => {
  confirmingTicket.value = null
  showConfirmModal.value = false
  unresolvedForm.value = {
    reason: ''
  }
}

// Confirm ticket completion
const confirmTicket = async () => {
  if (!confirmingTicket.value) return

  loading.value = true
  error.value = null
  try {
    const response = await fetch(`/api/tickets/${confirmingTicket.value.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'completed',
        response: confirmingTicket.value.response || (unresolvedForm.value.reason ? `Confirmed: ${unresolvedForm.value.reason}` : 'Confirmed by human reviewer')
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to confirm ticket')
    }

    // Reset form
    confirmingTicket.value = null
    showConfirmModal.value = false
    unresolvedForm.value = {
      reason: ''
    }

    // Show success notification
    showNotification('Ticket confirmed successfully!')

    // Reload tickets
    await loadTickets()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to confirm ticket'
  } finally {
    loading.value = false
  }
}

// Mark ticket as unresolved
const markUnresolved = async () => {
  if (!confirmingTicket.value) return
  if (!unresolvedForm.value.reason.trim()) {
    error.value = 'Reason is required to mark ticket as unresolved'
    return
  }

  loading.value = true
  error.value = null
  try {
    const response = await fetch(`/api/tickets/${confirmingTicket.value.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'unresolved',
        response: `Unresolved: ${unresolvedForm.value.reason}`
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to mark ticket as unresolved')
    }

    // Reset form
    confirmingTicket.value = null
    showConfirmModal.value = false
    unresolvedForm.value = {
      reason: ''
    }

    // Show success notification
    showNotification('Ticket marked as unresolved!')

    // Reload tickets
    await loadTickets()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to mark ticket as unresolved'
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
  loadEstimatedWaitTime()
  loadTickets()
  loadTicketStats()

  // Keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    // Don't trigger if user is typing in an input/textarea
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    // 'n' or 'c' to create new ticket
    if ((e.key === 'n' || e.key === 'c' || e.key === 'N' || e.key === 'C') && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      showNewTicketModal.value = true
    }

    // '/' to focus search
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      searchInputRef.value?.focus()
    }
  }

  window.addEventListener('keydown', handleKeyDown)
})

// Cleanup keyboard shortcuts
onUnmounted(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }
    if ((e.key === 'n' || e.key === 'c' || e.key === 'N' || e.key === 'C') && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      showNewTicketModal.value = true
    }
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      searchInputRef.value?.focus()
    }
  }
  window.removeEventListener('keydown', handleKeyDown)
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

      <!-- Ticket Statistics -->
      <div v-if="ticketStats" class="ticket-stats-section">
        <div class="stats-header">
          <span class="stats-icon">📊</span>
          <h3 class="stats-title">Ticket Statistics</h3>
        </div>
        <div class="stats-grid">
          <!-- Total Tickets Card -->
          <div class="stat-card stat-primary">
            <div class="stat-icon stat-icon-primary">🎫</div>
            <div class="stat-content">
              <span class="stat-label">Total Tickets</span>
              <span class="stat-value">{{ ticketStats.totalTickets }}</span>
            </div>
          </div>

          <!-- Status Breakdown Card -->
          <div class="stat-card stat-status">
            <div class="stat-icon stat-icon-status">📋</div>
            <div class="stat-content">
              <span class="stat-label">By Status</span>
              <div class="status-breakdown">
                <span :class="['status-badge', statusColors.pending]">
                  ⏳ {{ ticketStats.byStatus.pending || 0 }}
                </span>
                <span :class="['status-badge', statusColors['needs-info']]">
                  🔄 {{ ticketStats.byStatus['needs-info'] || 0 }}
                </span>
                <span :class="['status-badge', statusColors.completed]">
                  ✅ {{ ticketStats.byStatus.completed || 0 }}
                </span>
                <span :class="['status-badge', statusColors.declined]">
                  ❌ {{ ticketStats.byStatus.declined || 0 }}
                </span>
                <span v-if="ticketStats.byStatus.unresolved" :class="['status-badge', statusColors.unresolved]">
                  ⚠️ {{ ticketStats.byStatus.unresolved }}
                </span>
              </div>
            </div>
          </div>

          <!-- Oldest Ticket Card -->
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
              <span class="stat-label">Oldest Ticket</span>
              <div class="ticket-info">
                <span class="ticket-id">#{{ ticketStats.oldestTicket.id }}</span>
                <span class="ticket-title">{{ ticketStats.oldestTicket.title }}</span>
              </div>
              <span class="ticket-date">{{ formatDate(ticketStats.oldestTicket.created_at) }}</span>
            </div>
          </div>

          <!-- Newest Ticket Card -->
          <div class="stat-card">
            <div class="stat-icon">✨</div>
            <div class="stat-content">
              <span class="stat-label">Newest Ticket</span>
              <div class="ticket-info">
                <span class="ticket-id">#{{ ticketStats.newestTicket.id }}</span>
                <span class="ticket-title">{{ ticketStats.newestTicket.title }}</span>
              </div>
              <span class="ticket-date">{{ formatDate(ticketStats.newestTicket.created_at) }}</span>
            </div>
          </div>

          <!-- Date Range Card -->
          <div class="stat-card">
            <div class="stat-icon">📈</div>
            <div class="stat-content">
              <span class="stat-label">Date Range</span>
              <div class="date-range">
                <div class="date-row">
                  <span class="date-label">Created:</span>
                  <span class="date-value">{{ formatDate(ticketStats.dates.oldestCreated) }}</span>
                  <span class="date-separator">→</span>
                  <span class="date-value">{{ formatDate(ticketStats.dates.newestCreated) }}</span>
                </div>
                <div v-if="ticketStats.dates.oldestCompleted" class="date-row completed-date">
                  <span class="date-label">Completed:</span>
                  <span class="date-value">{{ formatDate(ticketStats.dates.oldestCompleted) }}</span>
                  <span class="date-separator">→</span>
                  <span class="date-value">{{ formatDate(ticketStats.dates.newestCompleted) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Toast -->
      <div v-if="notification.show" class="notification" :class="`notification-${notification.type}`">
        <span class="notification-icon">{{ notification.type === 'success' ? '✅' : '❌' }}</span>
        <span class="notification-message">{{ notification.message }}</span>
        <button @click="hideNotification" class="notification-close">&times;</button>
      </div>

      <!-- Error Message Display -->
      <div v-if="error" class="error-message">
        <span class="error-icon">❌</span>
        <span class="error-text">{{ error }}</span>
        <button @click="error = null" class="error-close">&times;</button>
      </div>

      <button
        @click="showNewTicketModal = true"
        class="new-ticket-btn"
      >
        + New Ticket
      </button>

      <!-- Filter Chips (buttons instead of dropdown per ticket #151) -->
      <div class="filter-section">
        <div class="search-box">
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="🔍 Search tickets... (press / to focus)"
            class="search-input"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="search-clear"
            title="Clear search"
          >
            ✕
          </button>
        </div>
        <div class="filter-group-title">Status</div>
        <div class="filter-chips">
          <button
            v-for="option in statusOptions"
            :key="option.value"
            @click="filterStatus = option.value"
            :class="['filter-chip', { active: filterStatus === option.value }]"
          >
            {{ option.label }}
          </button>
        </div>
        <div class="filter-group-title">Type</div>
        <div class="filter-chips">
          <button
            v-for="option in typeOptions"
            :key="option.value"
            @click="filterType = filterType === option.value ? '' : option.value"
            :class="['filter-chip', { active: filterType === option.value }]"
          >
            {{ option.label }}
          </button>
        </div>
        <div class="filter-group-title">Priority</div>
        <div class="filter-chips">
          <button
            v-for="option in priorityOptions"
            :key="option.value"
            @click="filterPriority = filterPriority === option.value ? '' : option.value"
            :class="['filter-chip', { active: filterPriority === option.value }]"
          >
            {{ option.label }}
          </button>
        </div>
        <div class="filter-group-title">Tags</div>
        <div class="filter-chips">
          <input
            v-model="filterTag"
            type="text"
            placeholder="🏷️ Filter by tag..."
            class="filter-input"
          />
          <button
            v-if="filterTag"
            @click="filterTag = ''"
            class="filter-clear"
            title="Clear tag filter"
          >
            ✕
          </button>
        </div>
        <div class="filter-group-title">Category</div>
        <div class="filter-chips">
          <input
            v-model="filterCategory"
            type="text"
            placeholder="📁 Filter by category..."
            class="filter-input"
          />
          <button
            v-if="filterCategory"
            @click="filterCategory = ''"
            class="filter-clear"
            title="Clear category filter"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Filtered Tickets List -->
      <div  class="tickets-list">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <span>Loading tickets...</span>
        </div>
        <div v-else-if="filteredTickets.length === 0" class="empty-state">
          No tickets match your filters.
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
              <button
                @click="handleTicketFavorite(ticket, $event)"
                :class="['ticket-favorite-btn', { favorited: isTicketFavorite(ticket) }]"
                :title="isTicketFavorite(ticket) ? 'Remove from favorites' : 'Add to favorites'"
              >
                ⭐
              </button>
            </div>
          </div>

          <!-- Expandable Description -->
          <button
            @click="toggleTicketDescription(ticket.id, $event)"
            class="ticket-expand-btn"
            :class="{ expanded: isTicketDescriptionExpanded(ticket.id) }"
          >
            <span class="expand-icon">{{ isTicketDescriptionExpanded(ticket.id) ? '▼' : '▶' }}</span>
            <span class="expand-text">
              {{ isTicketDescriptionExpanded(ticket.id) ? 'Show Less' : 'More Details' }}
            </span>
          </button>

          <div
            v-if="isTicketDescriptionExpanded(ticket.id)"
            class="ticket-description"
          >
            {{ ticket.description }}
          </div>

          <!-- Tags and Category -->
          <div v-if="ticket.tags || ticket.category" class="ticket-tags-category">
            <div v-if="ticket.tags" class="ticket-tags">
              <span
                v-for="tag in ticket.tags.split(',').map(t => t.trim()).filter(t => t)"
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

          <div class="ticket-meta">
            <span class="ticket-date">Created: {{ formatDate(ticket.created_at) }}</span>
            <div class="ticket-actions">
              <button
                v-if="ticket.status === 'pending'"
                @click="startEdit(ticket)"
                class="edit-ticket-btn"
                :disabled="loading"
                title="Edit ticket"
              >
                ✏️ Edit
              </button>
              <button
                v-if="isOwnTicket(ticket) && ticket.status === 'pending'"
                @click="closeOwnTicket(ticket)"
                class="close-ticket-btn"
                :disabled="loading"
                title="Mark as completed"
              >
                ✅ Close
              </button>
              <button
                v-if="isOwnTicket(ticket) && ticket.status === 'pending'"
                @click="deleteOwnTicket(ticket)"
                class="delete-ticket-btn"
                :disabled="loading"
                title="Delete ticket"
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
        v-model:tags="newTicket.tags"
        v-model:category="newTicket.category"
        :is-editing="false"
        :loading="loading"
        :estimated-wait-time-minutes="estimatedWaitTime?.minutes ?? null"
        :sample-size="estimatedWaitTime?.sampleSize ?? 0"
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
        v-model:tags="editForm.tags"
        v-model:category="editForm.category"
        :is-editing="true"
        :loading="loading"
        @submit="saveEdit"
        @cancel="cancelEdit"
      />
    </Modal>

    <!-- Confirm Ticket Modal -->
    <Modal
      :is-open="showConfirmModal"
      :title="confirmingTicket ? `Review Ticket #${confirmingTicket.id}` : 'Review Ticket'"
      @close="cancelConfirmTicket"
    >
      <div v-if="confirmingTicket" class="confirm-modal-content">
        <div class="ticket-preview">
          <h3>{{ confirmingTicket.title }}</h3>
          <p>{{ confirmingTicket.description }}</p>
          <div v-if="confirmingTicket.response" class="existing-response">
            <strong>Current Response:</strong>
            <p>{{ confirmingTicket.response }}</p>
          </div>
        </div>

        <div class="confirm-actions">
          <div class="action-buttons">
            <button
              @click="confirmTicket"
              class="btn-confirm"
              :disabled="loading"
            >
              ✅ Confirm Completion
            </button>

            <div class="unresolved-section">
              <label for="unresolved-reason">Or mark as unresolved:</label>
              <textarea
                id="unresolved-reason"
                v-model="unresolvedForm.reason"
                placeholder="Explain why this ticket is not properly completed..."
                class="input-field textarea-field"
                rows="3"
              ></textarea>
              <button
                @click="markUnresolved"
                class="btn-unresolved"
                :disabled="loading || !unresolvedForm.reason.trim()"
              >
                ⚠️ Mark as Unresolved
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.tickets-page {
  min-height: 100vh;
  padding: 100px 20px 85px; /* Add bottom padding for mobile-bottom-nav (70px + 15px) */
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
}

.tickets-header p {
  color: #718096;
  margin: 0;
}

/* Ticket Statistics Section */
.ticket-stats-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

.stats-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.stats-icon {
  font-size: 1.75rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.stats-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  letter-spacing: -0.02em;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-card.stat-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.stat-card.stat-status {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
}

.stat-icon {
  font-size: 2rem;
  flex-shrink: 0;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.stat-icon-primary,
.stat-icon-status {
  filter: brightness(1.3);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #718096;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-primary .stat-label {
  color: rgba(255, 255, 255, 0.85);
}

.stat-value {
  display: block;
  font-size: 2.5rem;
  font-weight: 800;
  color: #2d3748;
  line-height: 1;
}

.stat-primary .stat-value {
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.status-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.status-breakdown .status-badge {
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.ticket-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.ticket-id {
  font-size: 0.75rem;
  font-weight: 700;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ticket-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2d3748;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ticket-date {
  font-size: 0.8rem;
  color: #718096;
  font-weight: 500;
}

.date-range {
  font-size: 0.85rem;
  line-height: 1.7;
}

.date-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.date-label {
  font-weight: 600;
  color: #718096;
}

.date-value {
  font-weight: 600;
  color: #2d3748;
}

.date-separator {
  color: #cbd5e0;
  font-weight: 500;
}

.completed-date {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed #e2e8f0;
}

/* Dark mode ticket stats */
.dark .ticket-stats-section {
  background: rgba(40, 44, 52, 0.95);
  border-color: #4a5568;
}

.dark .stats-header .stats-title {
  color: #e2e8f0;
}

.dark .stat-card {
  background: #2d3748;
  border-color: #4a5568;
}

.dark .stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.dark .stat-card.stat-primary {
  background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%);
  border: none;
}

.dark .stat-card.stat-status {
  background: #1a202c;
  border-color: #4a5568;
}

.dark .stat-label {
  color: #a0aec0;
}

.dark .stat-primary .stat-label {
  color: rgba(255, 255, 255, 0.85);
}

.dark .stat-value {
  color: #e2e8f0;
}

.dark .stat-primary .stat-value {
  color: white;
}

.dark .ticket-id {
  color: #a0aec0;
}

.dark .ticket-title,
.dark .date-value {
  color: #cbd5e0;
}

.dark .ticket-date,
.dark .date-label {
  color: #718096;
}

.dark .date-separator {
  color: #4a5568;
}

.dark .completed-date {
  border-top-color: #4a5568;
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

.filter-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

.dark .filter-section {
  background: rgba(40, 44, 52, 0.95);
  border-color: #4a5568;
}

.filter-group {
  margin-bottom: 16px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-label {
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin-right: 12px;
}

.filter-dropdown {
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 150px;
}

.filter-dropdown:hover {
  border-color: #4299e1;
}

.filter-dropdown:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.dark .filter-dropdown {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e8f0;
}

.dark .filter-dropdown:hover {
  border-color: #4299e1;
}

.dark .filter-dropdown:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.dark .filter-label {
  color: #cbd5e0;
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

.kanban-board {
  width: 100%;
}

.kanban-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
}

.kanban-column {
  display: flex;
  flex-direction: column;
  background: #f7fafc;
  border-radius: 12px;
  padding: 16px;
  min-height: 400px;
  max-height: 800px;
  overflow-y: auto;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.column-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #2d3748;
}

.column-count {
  background: #e2e8f0;
  color: #4a5568;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
}

.column-tickets {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-column {
  text-align: center;
  padding: 40px 20px;
  color: #a0aec0;
  font-style: italic;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
  font-size: 18px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.keyboard-hints {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 12px;
  flex-wrap: wrap;
}

.hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #718096;
}

.hint kbd {
  background: white;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  color: #2d3748;
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

.ticket-favorite-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #cbd5e0;
  background: white;
  color: #cbd5e0;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
  flex-shrink: 0;
}

.ticket-favorite-btn:hover {
  transform: scale(1.1);
  border-color: #f6d365;
  color: #f6d365;
}

.ticket-favorite-btn.favorited {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  border-color: #f6d365;
  color: white;
  box-shadow: 0 2px 6px rgba(246, 211, 101, 0.3);
}

.ticket-favorite-btn.favorited:hover {
  transform: scale(1.15);
  box-shadow: 0 3px 8px rgba(246, 211, 101, 0.4);
}

.dark .ticket-favorite-btn {
  background: #2d3748;
  border-color: #4a5568;
  color: #718096;
}

.dark .ticket-favorite-btn:hover {
  border-color: #f6d365;
  color: #f6d365;
}

.dark .ticket-favorite-btn.favorited {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  border-color: #f6d365;
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

.ticket-expand-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #4a5568;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
}

.ticket-expand-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
  transform: translateY(-1px);
}

.ticket-expand-btn .expand-icon {
  font-size: 10px;
  transition: transform 0.2s;
}

.ticket-expand-btn.expanded {
  background: #ebf8ff;
  border-color: #bee3f8;
  color: #2b6cb0;
}

.ticket-expand-btn.expanded:hover {
  background: #e6fffa;
  border-color: #9ae6b4;
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

/* Dark mode h1 uses global gradient style */

.dark .tickets-header p {
  color: #a0aec0;
}

.dark .filter-section {
  background: #2d3748;
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

.dark .ticket-expand-btn {
  background: #2d3748;
  border-color: #4a5568;
  color: #cbd5e0;
}

.dark .ticket-expand-btn:hover {
  background: #4a5568;
  border-color: #718096;
}

.dark .ticket-expand-btn.expanded {
  background: #2a4365;
  border-color: #4a6fa5;
  color: #90cdf4;
}

.dark .ticket-expand-btn.expanded:hover {
  background: #285e61;
  border-color: #38b2ac;
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

/* Search box styles */
.search-box {
  position: relative;
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  background: white;
  color: #4a5568;
}

.search-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.search-input::placeholder {
  color: #a0aec0;
}

.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: #48bb78;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: white;
}

.search-clear:hover {
  background: #38a169;
  transform: translateY(-50%) scale(1.1);
}

.dark .search-input {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e8f0;
  font-weight: 500;
}

.dark .search-input:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.dark .search-input::placeholder {
  color: #718096;
}

.dark .search-clear {
  background: #38a169;
  color: white;
}

.dark .search-clear:hover {
  background: #48bb78;
}

/* Filter group title styles */
.filter-group-title {
  font-size: 13px;
  font-weight: 600;
  color: #718096;
  margin: 16px 0 8px 0;
}

.filter-group-title:first-of-type {
  margin-top: 0;
}

.dark .filter-group-title {
  color: #a0aec0;
}

/* Dark mode kanban styles */
.dark .kanban-column {
  background: #2d3748;
}

.dark .column-header {
  border-bottom-color: #4a5568;
}

.dark .column-header h3 {
  color: #e2e8f0;
}

.dark .column-count {
  background: #4a5568;
  color: #cbd5e0;
}

.dark .empty-column {
  color: #718096;
}

.dark .loading-spinner {
  border-color: #4a5568;
  border-top-color: #4299e1;
}

.dark .keyboard-hints {
  margin-top: 12px;
}

.dark .hint {
  color: #a0aec0;
}

.dark .hint kbd {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e8f0;
}

/* Confirm/Unresolved Modal Styles */
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
  margin-bottom: 16px;
}

.ticket-preview h3 {
  margin: 0 0 12px 0;
  color: #2d3748;
  font-size: 1.1rem;
}

.ticket-preview p {
  margin: 0 0 12px 0;
  color: #4a5568;
  line-height: 1.6;
}

.existing-response {
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.existing-response strong {
  display: block;
  margin-bottom: 8px;
  color: #2d3748;
  font-size: 14px;
}

.existing-response p {
  margin: 0;
  color: #718096;
  font-size: 13px;
  font-style: italic;
}

.confirm-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.api-key-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-field {
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
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

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn-confirm {
  width: 100%;
  padding: 14px 20px;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  background: #38a169;
  transform: translateY(-1px);
}

.btn-confirm:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
}

.unresolved-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #fff5f5;
  border-radius: 8px;
  border: 1px solid #fed7d7;
}

.unresolved-section label {
  font-size: 13px;
  font-weight: 600;
  color: #c53030;
}

.btn-unresolved {
  width: 100%;
  padding: 12px 16px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-unresolved:hover:not(:disabled) {
  background: #c53030;
  transform: translateY(-1px);
}

.btn-unresolved:disabled {
  background: #feb2b2;
  cursor: not-allowed;
  transform: none;
}

.review-ticket-btn {
  padding: 6px 14px;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: #805ad5;
}

.review-ticket-btn:hover:not(:disabled) {
  background: #6b46c1;
  transform: translateY(-1px);
}

.review-ticket-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
}

/* Dark mode confirm modal */
.dark .ticket-preview {
  background: #1a202c;
  border-color: #4a5568;
}

.dark .ticket-preview h3,
.dark .existing-response strong {
  color: #e2e8f0;
}

.dark .ticket-preview p,
.dark .existing-response p {
  color: #cbd5e0;
}

.dark .input-field {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e8f0;
}

.dark .input-field:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.dark .unresolved-section {
  background: #742a2a;
  border-color: #9b2c2c;
}

.dark .unresolved-section label {
  color: #fc8181;
}

/* Dark mode error message */
.dark .error-message {
  background: #742a2a;
  color: #fc8181;
  border-color: #9b2c2c;
}

.dark .error-close {
  color: #fc8181;
}

.dark .error-close:hover {
  color: #fff5f5;
}

/* Tags and Category Styles */
.ticket-tags-category {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
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

/* Filter Input Styles */
.filter-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #4a5568;
  background: white;
  min-width: 150px;
}

.filter-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.1);
}

.filter-clear {
  padding: 4px 8px;
  background: #cbd5e0;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-clear:hover {
  background: #a0aec0;
}

.dark .filter-input {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e8f0;
}

.dark .filter-input:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
}

.dark .filter-clear {
  background: #4a5568;
}

.dark .filter-clear:hover {
  background: #718096;
}

.dark .tag-chip {
  background: #2c5282;
  color: #bee3f8;
  border-color: #2b6cb0;
}

.dark .category-chip {
  background: #44337a;
  color: #d6bcfa;
  border-color: #6b46c1;
}
</style>
