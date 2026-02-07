/**
 * Auth Store
 *
 * Pinia store for global authentication state.
 * Handles user authentication, session management, and profile operations.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_BASE = '/api'
const TOKEN_KEY = 'auth_token'

interface User {
  id: number
  email: string
  display_name: string | null
  created_at: string
  updated_at: string
}

interface Session {
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

  let initialized = false

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  /**
   * Initialize auth state from localStorage
   */
  const init = async () => {
    if (initialized) return

    const savedToken = localStorage.getItem(TOKEN_KEY)
    if (savedToken) {
      token.value = savedToken
      await validateToken()
    }

    initialized = true
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
        user.value = data.user
        return true
      } else {
        console.error('Token validation failed')
        clearAuth()
        return false
      }
    } catch (error) {
      console.error('Token validation error:', error)
      clearAuth()
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
        user.value = data.user
        return { success: true, user: data.user }
      } else {
        error.value = data.message || 'Registration failed'
        return { success: false, error: error.value }
      }
    } catch (error) {
      console.error('Registration failed:', error)
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
        error.value = data.message || 'Login failed'
        return { success: false, error: error.value }
      }
    } catch (error) {
      console.error('Login failed:', error)
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
      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })

      clearAuth()
      return { success: true }
    } catch (error) {
      console.error('Logout failed:', error)
      clearAuth()
      return { success: true }
    }
  }

  /**
   * Update user profile
   */
  const updateProfile = async (displayName: string) => {
    if (!token.value) {
      return { success: false, error: 'Not authenticated' }
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify({ displayName })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        user.value = data.user
        return { success: true, user: data.user }
      } else {
        error.value = data.message || 'Update failed'
        return { success: false, error: error.value }
      }
    } catch (error) {
      console.error('Update failed:', error)
      error.value = 'Update failed. Please try again.'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
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
        return { success: true }
      } else {
        error.value = data.message || 'Password change failed'
        return { success: false, error: error.value }
      }
    } catch (error) {
      console.error('Password change failed:', error)
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
        error.value = 'Account deletion failed. Please try again.'
        return { success: false, error: error.value }
      }
    } catch (error) {
      console.error('Account deletion failed:', error)
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
        return data || []
      } else {
        console.error('Failed to fetch sessions', response.status)
        return []
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
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

      return { success: true }
    } catch (error) {
      console.error('Failed to delete session', error)
      return { success: false, error: 'Failed to delete session' }
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
      const response = await fetch(`${API_BASE}/auth/sessions`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })

      clearAuth()
      return { success: true }
    } catch (error) {
      console.error('Failed to logout from all devices', error)
      return { success: false, error: 'Failed to logout from all devices' }
    }
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
    localStorage.removeItem(TOKEN_KEY)
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
    const headers: HeadersInit = {
      ...(options?.headers || {}),
    }

    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
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

    // Getters
    isAuthenticated,

    // Actions
    init,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    deleteAccount,
    getSessions,
    logoutSession,
    logoutAll,
    clearAuth,
    fetchWithAuth
  }
})
