/**
 * Tickets Store
 *
 * Pinia store for global tickets state.
 * Handles fetching, creating, updating, and deleting tickets across the application.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ticketsRepository } from '../repositories/tickets.repository'

export interface Ticket {
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

export interface TicketStats {
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

export const useTicketsStore = defineStore('tickets', () => {
  // State
  const tickets = ref<Ticket[]>([])
  const ticketStats = ref<TicketStats | null>(null)
  const ignoreMode = ref(false)
  const lastCollection = ref<string | null>(null)
  const estimatedWaitTime = ref<{ minutes: number | null; sampleSize: number } | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const pendingTickets = computed(() => tickets.value.filter(t => t.status === 'pending'))
  const inProgressTickets = computed(() => tickets.value.filter(t => t.status === 'needs-info'))
  const completedTickets = computed(() => tickets.value.filter(t => t.status === 'completed'))
  const declinedTickets = computed(() => tickets.value.filter(t => t.status === 'declined'))

  /**
   * Load all tickets
   */
  const loadTickets = async () => {
    loading.value = true
    error.value = null

    try {
      const allTickets = await ticketsRepository.getTickets()
      tickets.value = allTickets.sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load tickets'
      console.error('Failed to load tickets:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new ticket
   */
  const createTicket = async (ticket: {
    title: string
    description?: string
    type?: 'feature' | 'bug' | 'feedback'
    priority?: 'high' | 'medium' | 'low'
    tags?: string
    category?: string
    creator_id?: string
  }) => {
    loading.value = true
    error.value = null

    try {
      const newTicket = await ticketsRepository.createTicket(
        ticket.title,
        ticket.description || '',
        ticket.creator_id
      )

      if (newTicket) {
        tickets.value.unshift(newTicket)
      }

      return newTicket
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create ticket'
      console.error('Failed to create ticket:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing ticket
   */
  const updateTicket = async (
    id: number,
    updates: {
      title?: string
      description?: string
      status?: 'pending' | 'needs-info' | 'completed' | 'declined' | 'unresolved'
      response?: string
      tags?: string
      category?: string
      type?: 'feature' | 'bug' | 'feedback'
      priority?: 'high' | 'medium' | 'low'
    }
  ) => {
    loading.value = true
    error.value = null

    try {
      const updatedTicket = await ticketsRepository.updateTicket(id, updates)

      if (updatedTicket) {
        const index = tickets.value.findIndex(t => t.id === id)
        if (index > -1) {
          tickets.value[index] = updatedTicket
        }
      }

      return updatedTicket
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update ticket'
      console.error('Failed to update ticket:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a ticket
   */
  const deleteTicket = async (id: number, creatorId?: string) => {
    loading.value = true
    error.value = null

    try {
      await ticketsRepository.deleteTicket(id, creatorId)
      tickets.value = tickets.value.filter(t => t.id !== id)
      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete ticket'
      console.error('Failed to delete ticket:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Load ticket statistics
   */
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

  /**
   * Load ignore mode status
   */
  const loadIgnoreMode = async () => {
    try {
      const ignore = await ticketsRepository.getIgnoreMode()
      ignoreMode.value = ignore
      localStorage.setItem('tickets-ignore-mode', String(ignore))
    } catch (err) {
      console.warn('Failed to load ignore mode:', err)
      // Fallback to localStorage
      const savedIgnoreMode = localStorage.getItem('tickets-ignore-mode')
      if (savedIgnoreMode) {
        ignoreMode.value = savedIgnoreMode === 'true'
      }
    }
  }

  /**
   * Set ignore mode
   */
  const setIgnoreMode = async (ignore: boolean) => {
    try {
      await ticketsRepository.setIgnoreMode(ignore)
      ignoreMode.value = ignore
      localStorage.setItem('tickets-ignore-mode', String(ignore))
    } catch (err) {
      console.error('Failed to set ignore mode:', err)
      // Update local state anyway for better UX
      ignoreMode.value = ignore
      localStorage.setItem('tickets-ignore-mode', String(ignore))
    }
  }

  /**
   * Load last collection timestamp
   */
  const loadLastCollection = async () => {
    try {
      const lastCol = await ticketsRepository.getLastCollection()
      lastCollection.value = lastCol
    } catch (err) {
      console.warn('Failed to load last collection:', err)
    }
  }

  /**
   * Load estimated wait time
   */
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
      console.warn('Failed to load estimated wait time:', err)
    }
  }

  /**
   * Clear all tickets state
   */
  const clearTickets = () => {
    tickets.value = []
    ticketStats.value = null
    error.value = null
  }

  /**
   * Format date for display
   */
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

  return {
    // State
    tickets,
    ticketStats,
    ignoreMode,
    lastCollection,
    estimatedWaitTime,
    loading,
    error,

    // Getters
    pendingTickets,
    inProgressTickets,
    completedTickets,
    declinedTickets,

    // Actions
    loadTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    loadTicketStats,
    loadIgnoreMode,
    setIgnoreMode,
    loadLastCollection,
    loadEstimatedWaitTime,
    clearTickets,
    formatDate
  }
})
