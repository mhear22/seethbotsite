import { ref, type Ref } from 'vue'
import { useTicketsStore, type Ticket } from '../stores/useTicketsStore'
import { useNotification } from './useNotification'
import { useFormState } from './useFormState'

export interface NewTicketForm {
  title: string
  description: string
  type: 'feature' | 'bug' | 'feedback'
  priority: 'high' | 'medium' | 'low'
  tags: string
  category: string
}

export interface EditTicketForm {
  title: string
  description: string
  type: 'feature' | 'bug' | 'feedback'
  priority: 'high' | 'medium' | 'low'
  tags: string
  category: string
}

export interface CloseTicketForm {
  status: 'completed' | 'declined'
  response: string
}

export interface UnresolvedForm {
  reason: string
}

export function useTicketOperations(creatorId: Ref<string>) {
  const ticketsStore = useTicketsStore()
  const { showNotification } = useNotification()

  // Form states
  const newTicketForm = useFormState<NewTicketForm>({
    title: '',
    description: '',
    type: 'feature',
    priority: 'medium',
    tags: '',
    category: ''
  })

  const editTicketForm = useFormState<EditTicketForm>({
    title: '',
    description: '',
    type: 'feature',
    priority: 'medium',
    tags: '',
    category: ''
  })

  const closeTicketForm = useFormState<CloseTicketForm>({
    status: 'completed',
    response: ''
  })

  const unresolvedForm = useFormState<UnresolvedForm>({
    reason: ''
  })

  // Currently editing ticket
  const editingTicket = ref<Ticket | null>(null)
  const closingTicket = ref<Ticket | null>(null)
  const confirmingTicket = ref<Ticket | null>(null)

  /**
   * Submit a new ticket
   */
  const submitTicket = async (): Promise<boolean> => {
    if (!newTicketForm.formData.value.title.trim()) {
      newTicketForm.setFieldError('title', 'Title is required')
      return false
    }

    try {
      await ticketsStore.createTicket({
        title: newTicketForm.formData.value.title.trim(),
        description: newTicketForm.formData.value.description.trim() || null,
        type: newTicketForm.formData.value.type,
        priority: newTicketForm.formData.value.priority,
        tags: newTicketForm.formData.value.tags.trim() || null,
        category: newTicketForm.formData.value.category.trim() || null,
        creator_id: creatorId.value
      })

      newTicketForm.reset()
      showNotification('Ticket submitted successfully!')
      await ticketsStore.loadTickets()
      return true
    } catch (err) {
      showNotification(ticketsStore.error || 'Failed to submit ticket', 'error')
      return false
    }
  }

  /**
   * Start editing a ticket
   */
  const startEdit = (ticket: Ticket) => {
    editingTicket.value = ticket
    editTicketForm.resetTo({
      title: ticket.title,
      description: ticket.description,
      type: ticket.type,
      priority: ticket.priority,
      tags: ticket.tags || '',
      category: ticket.category || ''
    })
  }

  /**
   * Cancel editing
   */
  const cancelEdit = () => {
    editingTicket.value = null
    editTicketForm.reset()
  }

  /**
   * Save edited ticket
   */
  const saveEdit = async (): Promise<boolean> => {
    if (!editingTicket.value) return false
    if (!editTicketForm.formData.value.title.trim()) {
      editTicketForm.setFieldError('title', 'Title is required')
      return false
    }

    try {
      await ticketsStore.updateTicket(editingTicket.value.id, {
        title: editTicketForm.formData.value.title.trim(),
        description: editTicketForm.formData.value.description.trim() || null,
        type: editTicketForm.formData.value.type,
        priority: editTicketForm.formData.value.priority,
        tags: editTicketForm.formData.value.tags.trim() || null,
        category: editTicketForm.formData.value.category.trim() || null
      })

      editingTicket.value = null
      editTicketForm.reset()
      showNotification('Ticket updated successfully!')
      await ticketsStore.loadTickets()
      return true
    } catch (err) {
      showNotification(ticketsStore.error || 'Failed to update ticket', 'error')
      return false
    }
  }

  /**
   * Start closing a ticket (admin)
   */
  const startCloseTicket = (ticket: Ticket) => {
    closingTicket.value = ticket
    closeTicketForm.reset()
  }

  /**
   * Cancel closing ticket
   */
  const cancelCloseTicket = () => {
    closingTicket.value = null
    closeTicketForm.reset()
  }

  /**
   * Close ticket (admin)
   */
  const closeTicket = async (): Promise<boolean> => {
    if (!closingTicket.value) return false

    try {
      await ticketsStore.updateTicket(closingTicket.value.id, {
        status: closeTicketForm.formData.value.status === 'completed' ? 'completed' : 'declined',
        response: closeTicketForm.formData.value.response
      })

      closingTicket.value = null
      closeTicketForm.reset()
      showNotification('Ticket closed successfully!')
      await ticketsStore.loadTickets()
      return true
    } catch (err) {
      showNotification(ticketsStore.error || 'Failed to close ticket', 'error')
      return false
    }
  }

  /**
   * Start confirming a ticket
   */
  const startConfirmTicket = (ticket: Ticket) => {
    confirmingTicket.value = ticket
    unresolvedForm.reset()
  }

  /**
   * Cancel confirming ticket
   */
  const cancelConfirmTicket = () => {
    confirmingTicket.value = null
    unresolvedForm.reset()
  }

  /**
   * Confirm ticket completion
   */
  const confirmTicket = async (): Promise<boolean> => {
    if (!confirmingTicket.value) return false

    try {
      await ticketsStore.updateTicket(confirmingTicket.value.id, {
        status: 'completed',
        response: confirmingTicket.value.response ||
          (unresolvedForm.formData.value.reason ? `Confirmed: ${unresolvedForm.formData.value.reason}` : 'Confirmed by human reviewer')
      })

      confirmingTicket.value = null
      unresolvedForm.reset()
      showNotification('Ticket confirmed successfully!')
      await ticketsStore.loadTickets()
      return true
    } catch (err) {
      showNotification(ticketsStore.error || 'Failed to confirm ticket', 'error')
      return false
    }
  }

  /**
   * Mark ticket as unresolved
   */
  const markUnresolved = async (): Promise<boolean> => {
    if (!confirmingTicket.value) return false
    if (!unresolvedForm.formData.value.reason.trim()) {
      unresolvedForm.setFieldError('reason', 'Reason is required to mark ticket as unresolved')
      return false
    }

    try {
      await ticketsStore.updateTicket(confirmingTicket.value.id, {
        status: 'unresolved',
        response: `Unresolved: ${unresolvedForm.formData.value.reason}`
      })

      confirmingTicket.value = null
      unresolvedForm.reset()
      showNotification('Ticket marked as unresolved!')
      await ticketsStore.loadTickets()
      return true
    } catch (err) {
      showNotification(ticketsStore.error || 'Failed to mark ticket as unresolved', 'error')
      return false
    }
  }

  /**
   * Close own ticket (user)
   */
  const closeOwnTicket = async (ticket: Ticket): Promise<boolean> => {
    try {
      await ticketsStore.updateTicket(ticket.id, {
        status: 'completed',
        creator_id: creatorId.value
      })

      showNotification('Ticket closed successfully!')
      await ticketsStore.loadTickets()
      return true
    } catch (err) {
      showNotification(ticketsStore.error || 'Failed to close ticket', 'error')
      return false
    }
  }

  /**
   * Delete own ticket (user)
   */
  const deleteOwnTicket = async (ticket: Ticket): Promise<boolean> => {
    if (!confirm(`Are you sure you want to delete "${ticket.title}"?`)) {
      return false
    }

    try {
      await ticketsStore.deleteTicket(ticket.id, creatorId.value)
      await ticketsStore.loadTickets()
      return true
    } catch (err) {
      showNotification(ticketsStore.error || 'Failed to delete ticket', 'error')
      return false
    }
  }

  return {
    // Form states
    newTicketForm,
    editTicketForm,
    closeTicketForm,
    unresolvedForm,

    // Currently editing
    editingTicket,
    closingTicket,
    confirmingTicket,

    // Operations
    submitTicket,
    startEdit,
    cancelEdit,
    saveEdit,
    startCloseTicket,
    cancelCloseTicket,
    closeTicket,
    startConfirmTicket,
    cancelConfirmTicket,
    confirmTicket,
    markUnresolved,
    closeOwnTicket,
    deleteOwnTicket
  }
}
