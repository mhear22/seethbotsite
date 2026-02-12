import { ref, type Ref } from 'vue'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface Notification {
  show: boolean
  message: string
  type: NotificationType
}

export interface NotificationOptions {
  duration?: number
  type?: NotificationType
}

export function useNotification() {
  const notification: Ref<Notification> = ref({
    show: false,
    message: '',
    type: 'success'
  })

  let timeoutId: ReturnType<typeof setTimeout> | null = null

  /**
   * Show a notification with the given message and type
   * @param message - The notification message to display
   * @param type - The type of notification ('success' | 'error' | 'info' | 'warning')
   * @param duration - How long to show the notification in milliseconds (default: 3000)
   */
  const showNotification = (
    message: string,
    type: NotificationType = 'success',
    duration: number = 3000
  ) => {
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    notification.value = {
      show: true,
      message,
      type
    }

    // Auto-dismiss after duration
    if (duration > 0) {
      timeoutId = setTimeout(() => {
        notification.value.show = false
        timeoutId = null
      }, duration)
    }
  }

  /**
   * Manually hide the current notification
   */
  const hideNotification = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    notification.value.show = false
  }

  /**
   * Show a success notification
   */
  const showSuccess = (message: string, duration?: number) => {
    showNotification(message, 'success', duration)
  }

  /**
   * Show an error notification
   */
  const showError = (message: string, duration?: number) => {
    showNotification(message, 'error', duration)
  }

  /**
   * Show an info notification
   */
  const showInfo = (message: string, duration?: number) => {
    showNotification(message, 'info', duration)
  }

  /**
   * Show a warning notification
   */
  const showWarning = (message: string, duration?: number) => {
    showNotification(message, 'warning', duration)
  }

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning
  }
}
