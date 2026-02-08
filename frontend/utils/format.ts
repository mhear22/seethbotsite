/**
 * Shared date formatting utility functions
 * Provides consistent date formatting across all components
 */

/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string or timestamp
 * @param includeTime - Whether to include time in the output (default: false)
 * @param monthFormat - Month format: 'short' (Jan) or 'long' (January) (default: 'short')
 * @param includeWeekday - Whether to include weekday in the output (default: false)
 * @returns Formatted date string (e.g., "Jan 5, 2026", "Monday, Jan 5, 2026" or "January 5, 2026, 2:30 PM")
 */
export function formatDate(
  dateString: string | number,
  includeTime: boolean = false,
  monthFormat: 'short' | 'long' = 'short',
  includeWeekday: boolean = false
): string {
  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: monthFormat,
    year: 'numeric'
  }

  if (includeWeekday) {
    options.weekday = 'long'
  }

  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }

  return date.toLocaleDateString(undefined, options)
}

/**
 * Format a date as relative time (e.g., "2h ago", "5d ago")
 * @param dateString - ISO date string or timestamp
 * @returns Relative time string
 */
export function formatTimeAgo(dateString: string | number): string {
  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateString)
}

/**
 * Format a date for history display (alias for formatTimeAgo)
 * Use this for historical/timeline displays where relative time is preferred
 * @param dateString - ISO date string or timestamp
 * @returns Relative time string or formatted date
 */
export function formatHistoryTime(dateString: string | number): string {
  return formatTimeAgo(dateString)
}

/**
 * Format a date for timezone-specific display
 * @param timezone - IANA timezone string (e.g., 'America/New_York')
 * @returns Formatted date string in the specified timezone
 */
export function formatDateForTimezone(timezone: string): string {
  const now = new Date()
  return now.toLocaleDateString('en-US', {
    timeZone: timezone,
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Format a date for message/chat display with "Today" and "Yesterday" logic
 * @param dateString - ISO date string or timestamp
 * @returns Formatted date string (e.g., "Today", "Yesterday", or "Jan 5")
 */
export function formatDateForMessage(dateString: string | number): string {
  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }

  const today = new Date()

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/**
 * Format only the time portion of a date (hours and minutes)
 * @param dateString - ISO date string or timestamp
 * @param locale - Optional locale string (default: undefined, uses browser locale)
 * @returns Formatted time string (e.g., "2:30 PM" or "14:30")
 */
export function formatTime(dateString: string | number, locale?: string): string {
  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return 'Invalid time'
  }

  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

