import { ref, type Ref } from 'vue'

export interface ModalOptions {
  onOpen?: () => void
  onClose?: () => void
}

export function useModal<T = any>(options: ModalOptions = {}) {
  const isOpen = ref(false)
  const data: Ref<T | null> = ref(null)

  /**
   * Open the modal with optional data
   */
  const open = (modalData?: T) => {
    data.value = modalData ?? null
    isOpen.value = true

    if (options.onOpen) {
      options.onOpen()
    }
  }

  /**
   * Close the modal and clear data
   */
  const close = () => {
    isOpen.value = false

    if (options.onClose) {
      options.onClose()
    }

    // Defer clearing data until after transition
    setTimeout(() => {
      data.value = null
    }, 300)
  }

  /**
   * Toggle modal open/closed state
   */
  const toggle = (modalData?: T) => {
    if (isOpen.value) {
      close()
    } else {
      open(modalData)
    }
  }

  /**
   * Update modal data without closing
   */
  const updateData = (newData: T) => {
    data.value = newData
  }

  /**
   * Clear modal data without closing
   */
  const clearData = () => {
    data.value = null
  }

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
    updateData,
    clearData
  }
}

/**
 * Create multiple modals with a consistent interface
 * Useful when a component needs to manage several modals
 */
export function useModals<T extends Record<string, any>>(
  modalNames: (keyof T)[],
  options: Record<keyof T, ModalOptions> = {} as Record<keyof T, ModalOptions>
) {
  const modals = {} as Record<keyof T, ReturnType<typeof useModal>>

  modalNames.forEach(name => {
    modals[name] = useModal(options[name])
  })

  /**
   * Close all modals
   */
  const closeAll = () => {
    Object.values(modals).forEach(modal => modal.close())
  }

  /**
   * Check if any modal is open
   */
  const anyOpen = () => {
    return Object.values(modals).some(modal => modal.isOpen.value)
  }

  return {
    modals,
    closeAll,
    anyOpen
  }
}
