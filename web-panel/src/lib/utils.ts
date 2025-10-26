// Utility functions for 48 Hauling Web Panel

/**
 * Format a date consistently across the application
 */
export function formatDate(date: Date | string | null | undefined, options?: {
  includeTime?: boolean
  includeSeconds?: boolean
  relative?: boolean
}): string {
  if (!date) return 'N/A'

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) return 'Invalid date'

  const {includeTime = false, includeSeconds = false, relative = false} = options || {}

  // Relative time formatting (e.g., "2 hours ago")
  if (relative) {
    const now = new Date()
    const diff = now.getTime() - dateObj.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    if (seconds < 60) return 'Just now'
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
    if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`
    return `${years} year${years > 1 ? 's' : ''} ago`
  }

  // Standard formatting
  if (includeTime) {
    if (includeSeconds) {
      return dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format time only
 */
export function formatTime(date: Date | string | null | undefined, includeSeconds = false): string {
  if (!date) return 'N/A'

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) return 'Invalid time'

  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds && {second: '2-digit'})
  })
}

/**
 * Get status color classes for consistent styling
 */
export function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'resolved':
    case 'active':
    case 'online':
      return 'bg-green-900/30 text-green-500 border-green-700'
    case 'in_progress':
    case 'assigned':
    case 'pending':
      return 'bg-yellow-900/30 text-yellow-500 border-yellow-700'
    case 'cancelled':
    case 'failed':
    case 'offline':
      return 'bg-red-900/30 text-red-500 border-red-700'
    case 'new':
      return 'bg-blue-900/30 text-blue-500 border-blue-700'
    default:
      return 'bg-gray-900/30 text-gray-400 border-gray-700'
  }
}

/**
 * Get severity color classes
 */
export function getSeverityColor(severity: string): string {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return 'bg-red-900/30 text-red-500 border-red-700'
    case 'high':
      return 'bg-orange-900/30 text-orange-500 border-orange-700'
    case 'medium':
      return 'bg-yellow-900/30 text-yellow-500 border-yellow-700'
    case 'low':
      return 'bg-gray-900/30 text-gray-400 border-gray-700'
    default:
      return 'bg-gray-900/30 text-gray-400 border-gray-700'
  }
}

/**
 * Get priority color classes
 */
export function getPriorityColor(priority?: string): string {
  switch (priority?.toLowerCase()) {
    case 'urgent':
    case 'critical':
      return 'bg-red-900/30 text-red-500 border-red-700'
    case 'high':
      return 'bg-orange-900/30 text-orange-500 border-orange-700'
    case 'normal':
    case 'medium':
      return 'bg-yellow-900/30 text-yellow-500 border-yellow-700'
    case 'low':
      return 'bg-gray-900/30 text-gray-400 border-gray-700'
    default:
      return 'bg-gray-900/30 text-gray-400 border-gray-700'
  }
}

/**
 * Properly escape CSV data to prevent corruption
 */
export function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return ''

  const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)

  // If the value contains commas, quotes, or newlines, wrap in quotes and escape existing quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Export data to CSV with proper escaping
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => escapeCSV(row[header])).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for rate limiting
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Generate a random ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
