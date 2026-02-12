import { ref, type Ref } from 'vue'
import { useModal } from './useModal'
import type { Ticket } from '../stores/useTicketsStore'

export function useTicketUI() {
  // Expanded ticket descriptions (Set of ticket IDs)
  const expandedTicketIds: Ref<Set<number>> = ref(new Set())

  // Modal management
  const newTicketModal = useModal()
  const editModal = useModal<Ticket>()
  const confirmModal = useModal<Ticket>()
  const detailsModal = useModal<Ticket>()
  const closeModal = useModal<Ticket>()
  const adminPanel = useModal()

  /**
   * Toggle ticket description expansion
   */
  const toggleDescription = (ticketId: number) => {
    if (expandedTicketIds.value.has(ticketId)) {
      expandedTicketIds.value.delete(ticketId)
    } else {
      expandedTicketIds.value.add(ticketId)
    }
  }

  /**
   * Check if a ticket is expanded
   */
  const isExpanded = (ticketId: number): boolean => {
    return expandedTicketIds.value.has(ticketId)
  }

  /**
   * Collapse all ticket descriptions
   */
  const collapseAll = () => {
    expandedTicketIds.value.clear()
  }

  /**
   * Expand all ticket descriptions
   */
  const expandAll = (ticketIds: number[]) => {
    expandedTicketIds.value = new Set(ticketIds)
  }

  /**
   * Close all modals
   */
  const closeAllModals = () => {
    newTicketModal.close()
    editModal.close()
    confirmModal.close()
    detailsModal.close()
    closeModal.close()
    adminPanel.close()
  }

  return {
    // Expanded tickets
    expandedTicketIds,
    toggleDescription,
    isExpanded,
    collapseAll,
    expandAll,

    // Modals
    newTicketModal,
    editModal,
    confirmModal,
    detailsModal,
    closeModal,
    adminPanel,
    closeAllModals
  }
}
