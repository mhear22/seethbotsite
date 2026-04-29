/**
 * Auth Store
 *
 * Pinia store for global authentication state.
 * Handles user authentication, session management, and profile operations.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useProfile, type User } from '../composables/useProfile'
import { useSettingsPersistence } from '../composables/useSettingsPersistence'

const API_BASE = '/api'
const TOKEN_KEY = 'auth_token'
const REFRESH_TIMER_KEY = 'auth_refresh_timer'

export interface Session {
  id: number
  user_id: number
  device_name: string | null
  device_type: string | null
  token: string
  expires_at: string
  created_at: string
  last_used_at: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const sessions = ref<Session[]>([])

  let initialized = false
  let refreshTimer: ReturnType<typeof setTimeout> | null = null
  let refreshRetryTimer: ReturnType<typeof setTimeout> | null = null

  // Composables
  const profile = useProfile(() => token.value)
  const settingsPersistence = useSettingsPersistence()

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isInitialized = computed(() => initialized)

  /**
   * Initialize auth state from localStorage
   */
  const init = async () => {
    if (initialized) return

    const savedToken = localStorage.getItem(TOKEN_KEY)
    if (savedToken) {
      token.value = savedToken
      await validateToken()

      // Only mark as initialized if validation succeeded or explicitly failed (not network error)
      initialized = true
    } else {
      // No token found, mark as initialized immediately
      initialized = true
    }

    // Initialize settings persistence watcher
    settingsPersistence.watchSettings()
  }

  /**
   * Fetch current user data from server
   */
  const fetchUser = async (): Promise<boolean> => {
    const fetchedUser = await profile.fetchUser()
    if (fetchedUser) {
      user.value = fetchedUser
      return true
    }
    return false
  }

  /**
   * Validate current token with server
   */
  const validateToken = async (): Promise<boolean> => {
    if (!token.value) return false

    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const nextUser = data?.user
        const nextExpiry = data?.session?.expires_at
        if (!nextUser || typeof nextExpiry !== 'string') {
          console.error('Token validation failed: malformed /auth/me response')
          clearAuth()
          return false
        }
        user.value = nextUser

        // Start automatic token refresh
        startTokenRefresh(nextExpiry)

        // Load user settings
        await loadSettings()

        return true
      } else if (response.status === 401 || response.status === 403) {
        // Token is invalid or expired - clear auth
        console.error('Token validation failed: Invalid or expired token')
        clearAuth()
        return false
      } else {
        // Server error (5xx) or other error - keep token for retry
        console.error('Token validation failed with status:', response.status)
        return false
      }
    } catch (error) {
      // Network error - keep token for retry
      console.error('Token validation error (network issue):', error)
      return false
    }
  }

  /**
   * Start automatic token refresh 30s before expiry
   */
  const startTokenRefresh = (expiresAt: string) => {
    // Clear existing timer
    if (refreshTimer) {
      clearTimeout(refreshTimer)
    }

    const expiryDate = new Date(expiresAt)
    const now = new Date()
    const timeUntilExpiry = expiryDate.getTime() - now.getTime()

    // Refresh 30 seconds before expiry
    const refreshDelay = 
    Math.min(2147483646, Math.max(1000, timeUntilExpiry - 30000))

    refreshTimer = setTimeout(async () => {
      console.log('Refreshing token...')
      await refreshToken()
    }, refreshDelay)

    // Store timer reference for cleanup
    localStorage.setItem(REFRESH_TIMER_KEY, Date.now().toString())
  }

  /**
   * Refresh token (extends session)
   */
  const refreshToken = async (): Promise<boolean> => {
    if (!token.value) {
      return false
    }

    try {
      // Simply call /auth/me to refresh the session
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const nextUser = data?.user
        const nextExpiry = data?.session?.expires_at
        if (!nextUser || typeof nextExpiry !== 'string') {
          console.error('Token refresh failed: malformed /auth/me response')
          clearAuth()
          return false
        }
        user.value = nextUser

        // Clear any existing retry timer
        if (refreshRetryTimer) {
          clearTimeout(refreshRetryTimer)
          refreshRetryTimer = null
        }

        // Restart refresh timer
        startTokenRefresh(nextExpiry)

        console.log('Token refreshed successfully')
        return true
      } else if (response.status === 401 || response.status === 403) {
        // Token is invalid or expired - clear auth
        console.error('Token refresh failed: Invalid or expired token')
        clearAuth()
        return false
      } else {
        // Server error - try again later
        console.error('Token refresh failed with status:', response.status)
        // Clear any existing retry timer before setting new one
        if (refreshRetryTimer) {
          clearTimeout(refreshRetryTimer)
        }
        refreshRetryTimer = setTimeout(() => refreshToken(), 5 * 60 * 1000)
        return false
      }
    } catch (err) {
      // Network error - try again later
      console.error('Token refresh error (network issue):', err)
      // Clear any existing retry timer before setting new one
      if (refreshRetryTimer) {
        clearTimeout(refreshRetryTimer)
      }
      refreshRetryTimer = setTimeout(() => refreshToken(), 5 * 60 * 1000)
      return false
    }
  }

  /**
   * Register a new user
   */
  const register = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          displayName: displayName || null,
          deviceName: detectDeviceName(),
          deviceType: detectDeviceType()
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setAuth(data.token, data.user)
        return { success: true, user: data.user }
      } else {
        error.value = data.error || 'Registration failed'
        return { success: false, error: error.value }
      }
    } catch (err) {
      console.error('Registration failed:', err)
      error.value = 'Registration failed. Please try again.'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Login with existing credentials
   */
  const login = async (
    email: string,
    password: string
  ) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          deviceName: detectDeviceName(),
          deviceType: detectDeviceType()
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setAuth(data.token, data.user)
        return { success: true, user: data.user }
      } else {
        error.value = data.error || 'Login failed'
        return { success: false, error: error.value }
      }
    } catch (err) {
      console.error('Login failed:', err)
      error.value = 'Login failed. Please try again.'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout from current device
   */
  const logout = async () => {
    if (!token.value) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })

      clearAuth()
      return { success: true }
    } catch (err) {
      console.error('Logout failed:', err)
      clearAuth()
      return { success: true }
    }
  }

  /**
   * Update user profile (delegates to useProfile composable)
   */
  const updateProfile = async (displayName: string) => {
    // Validate input
    const validation = profile.validateProfileData(displayName)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const result = await profile.updateProfile(displayName)

    if (result.success && result.user) {
      user.value = result.user
    }

    return result
  }

  /**
   * Change password
   */
  const changePassword = async (
    oldPassword: string,
    newPassword: string
  ) => {
    if (!token.value) {
      return { success: false, error: 'Not authenticated' }
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE}/auth/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Password changed successfully, all sessions invalidated
        clearAuth()
        return { success: true }
      } else {
        error.value = data.error || 'Password change failed'
        return { success: false, error: error.value }
      }
    } catch (err) {
      console.error('Password change failed:', err)
      error.value = 'Password change failed. Please try again.'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete account
   */
  const deleteAccount = async (password: string) => {
    if (!token.value) {
      return { success: false, error: 'Not authenticated' }
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE}/auth/account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify({ password })
      })

      if (response.ok) {
        clearAuth()
        return { success: true }
      } else {
        const data = await response.json()
        error.value = data.error || 'Account deletion failed. Please try again.'
        return { success: false, error: error.value }
      }
    } catch (err) {
      console.error('Account deletion failed:', err)
      error.value = 'Account deletion failed. Please try again.'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Get all sessions
   */
  const getSessions = async (): Promise<Session[]> => {
    if (!token.value) {
      return []
    }

    try {
      const response = await fetch(`${API_BASE}/auth/sessions`, {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        sessions.value = Array.isArray(data?.sessions) ? data.sessions : []
        return sessions.value
      } else {
        console.error('Failed to fetch sessions', response.status)
        return []
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
      return []
    }
  }

  /**
   * Logout from a specific session
   */
  const logoutSession = async (sessionId: number) => {
    if (!token.value) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const response = await fetch(`${API_BASE}/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })

      if (response.ok) {
        // Refresh sessions list
        await getSessions()
        return { success: true }
      } else {
        error.value = 'Failed to delete session'
        return { success: false, error: error.value }
      }
    } catch (err) {
      console.error('Failed to delete session', err)
      error.value = 'Failed to delete session'
      return { success: false, error: error.value }
    }
  }

  /**
   * Logout from all devices
   */
  const logoutAll = async () => {
    if (!token.value) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const response = await fetch(`${API_BASE}/auth/sessions/all`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })

      if (response.ok) {
        clearAuth()
        return { success: true }
      } else {
        error.value = 'Failed to logout from all devices'
        return { success: false, error: error.value }
      }
    } catch (err) {
      console.error('Failed to logout from all devices', err)
      error.value = 'Failed to logout from all devices'
      return { success: false, error: error.value }
    }
  }

  /**
   * Load user settings (delegates to useSettingsPersistence composable)
   */
  const loadSettings = async (): Promise<void> => {
    if (!token.value || !user.value) {
      return
    }

    try {
      // Load settings from localStorage via composable
      settingsPersistence.loadAllSettings()
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }

  /**
   * Save user settings (delegates to useSettingsPersistence composable)
   */
  const saveSettings = async (settings: Record<string, any>): Promise<boolean> => {
    return settingsPersistence.saveSettings(settings)
  }

  /**
   * Set authentication state
   */
  const setAuth = (newToken: string, newUser: User) => {
    user.value = newUser
    token.value = newToken
    localStorage.setItem(TOKEN_KEY, newToken)
  }

  /**
   * Clear authentication state
   */
  const clearAuth = () => {
    user.value = null
    token.value = null
    sessions.value = []

    // Clear refresh timer
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
    
    // Clear refresh retry timer
    if (refreshRetryTimer) {
      clearTimeout(refreshRetryTimer)
      refreshRetryTimer = null
    }
    
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TIMER_KEY)
  }

  /**
   * Detect device name
   */
  const detectDeviceName = (): string => {
    const ua = navigator.userAgent
    let browser = 'Unknown'
    let os = 'Unknown'

    // Browser detection
    if (ua.includes('Chrome')) browser = 'Chrome'
    else if (ua.includes('Firefox')) browser = 'Firefox'
    else if (ua.includes('Safari')) browser = 'Safari'
    else if (ua.includes('Edge')) browser = 'Edge'

    // OS detection
    if (ua.includes('Windows')) os = 'Windows'
    else if (ua.includes('Mac')) os = 'macOS'
    else if (ua.includes('Linux')) os = 'Linux'
    else if (ua.includes('Android')) os = 'Android'
    else if (ua.includes('iOS')) os = 'iOS'

    return `${browser} on ${os}`
  }

  /**
   * Detect device type
   */
  const detectDeviceType = (): string => {
    const ua = navigator.userAgent

    if (/Mobile|Android|iP(hone|od|ad)|BlackBerry|IEMobile|Kindle/.test(ua)) {
      return 'mobile'
    }

    if (/Tablet|iPad/.test(ua)) {
      return 'tablet'
    }

    return 'desktop'
  }

  /**
   * Fetch with auth headers
   */
  const fetchWithAuth = async (url: string, options?: RequestInit) => {
    const headers = new Headers(options?.headers)

    if (token.value) {
      headers.set('Authorization', `Bearer ${token.value}`)
    }

    return fetch(url, {
      ...options,
      headers
    })
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    sessions,

    // Getters
    isAuthenticated,
    isInitialized,

    // Expose composables for advanced use
    profile,
    settingsPersistence,

    // Actions
    init,
    validateToken,
    fetchUser,
    refreshToken,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    deleteAccount,
    getSessions,
    logoutSession,
    logoutAll,
    loadSettings,
    saveSettings,
    clearAuth,
    fetchWithAuth
  }
})
