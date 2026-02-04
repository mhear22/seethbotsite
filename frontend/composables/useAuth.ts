import { ref, computed } from 'vue'

const API_BASE = '/api'

const TOKEN_KEY = 'auth_token'

// Interfaces
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

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

// State
const state = ref<AuthState>({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null
})

let initialized = false

/**
 * Load auth state from localStorage on initialization
 */
const initAuth = () => {
  if (initialized) return

  const savedToken = localStorage.getItem(TOKEN_KEY)
  if (savedToken) {
    state.value.token = savedToken
    state.value.isAuthenticated = true
    validateToken()
  }

  initialized = true
}

/**
 * Validate current token with server
 */
const validateToken = async (): Promise<boolean> => {
  if (!state.value.token) return false

  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${state.value.token}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      state.value.user = data
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
  state.value.loading = true
  state.value.error = null

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
      state.value.user = data.user
      return { success: true, user: data.user }
    } else {
      state.value.error = data.message || 'Registration failed'
      return { success: false, error: state.value.error }
    }
  } catch (error) {
    console.error('Registration failed:', error)
    state.value.error = 'Registration failed. Please try again.'
    return { success: false, error: state.value.error }
  } finally {
    state.value.loading = false
  }
}

/**
 * Login with existing credentials
 */
const login = async (
  email: string,
  password: string
) => {
  state.value.loading = true
  state.value.error = null

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
      state.value.error = data.message || 'Login failed'
      return { success: false, error: state.value.error }
    }
  } catch (error) {
    console.error('Login failed:', error)
    state.value.error = 'Login failed. Please try again.'
    return { success: false, error: state.value.error }
  } finally {
    state.value.loading = false
  }
}

/**
 * Logout from current device
 */
const logout = async () => {
  if (!state.value.token) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.value.token}`
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
  if (!state.value.token) {
    return { success: false, error: 'Not authenticated' }
  }

  state.value.loading = true
  state.value.error = null

  try {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.value.token}`
      },
      body: JSON.stringify({ displayName })
    })

    const data = await response.json()

    if (response.ok && data.success) {
      state.value.user = data.user
      return { success: true, user: data.user }
    } else {
      state.value.error = data.message || 'Update failed'
      return { success: false, error: state.value.error }
    }
  } catch (error) {
    console.error('Update failed:', error)
    state.value.error = 'Update failed. Please try again.'
    return { success: false, error: state.value.error }
  } finally {
    state.value.loading = false
  }
}

/**
 * Change password
 */
const changePassword = async (
  oldPassword: string,
  newPassword: string
) => {
  if (!state.value.token) {
    return { success: false, error: 'Not authenticated' }
  }

  state.value.loading = true
  state.value.error = null

  try {
    const response = await fetch(`${API_BASE}/auth/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.value.token}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    })

    const data = await response.json()

    if (response.ok && data.success) {
      return { success: true }
    } else {
      state.value.error = data.message || 'Password change failed'
      return { success: false, error: state.value.error }
    }
  } catch (error) {
    console.error('Password change failed:', error)
    state.value.error = 'Password change failed. Please try again.'
    return { success: false, error: state.value.error }
  } finally {
    state.value.loading = false
  }
}

/**
 * Delete account
 */
const deleteAccount = async (password: string) => {
  if (!state.value.token) {
    return { success: false, error: 'Not authenticated' }
  }

  state.value.loading = true
  state.value.error = null

  try {
    const response = await fetch(`${API_BASE}/auth/account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.value.token}`
      },
      body: JSON.stringify({ password })
    })

    if (response.ok) {
      clearAuth()
      return { success: true }
    } else {
      state.value.error = 'Account deletion failed. Please try again.'
      return { success: false, error: state.value.error }
    }
  } catch (error) {
    console.error('Account deletion failed:', error)
    state.value.error = 'Account deletion failed. Please try again.'
    return { success: false, error: state.value.error }
  } finally {
    state.value.loading = false
  }
}

/**
 * Get all sessions
 */
const getSessions = async (): Promise<Session[]> => {
  if (!state.value.token) {
    return []
  }

  try {
    const response = await fetch(`${API_BASE}/auth/sessions`, {
      headers: {
        'Authorization': `Bearer ${state.value.token}`
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
  if (!state.value.token) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    const response = await fetch(`${API_BASE}/auth/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${state.value.token}`
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
  if (!state.value.token) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    const response = await fetch(`${API_BASE}/auth/sessions`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${state.value.token}`
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
const setAuth = (token: string, user: User) => {
  state.value.user = user
  state.value.token = token
  state.value.isAuthenticated = true
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * Clear authentication state
 */
const clearAuth = () => {
  state.value.user = null
  state.value.token = null
  state.value.isAuthenticated = false
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

  if (state.value.token) {
    headers['Authorization'] = `Bearer ${state.value.token}`
  }

  return fetch(url, {
    ...options,
    headers
  })
}

// Initialize on module load
initAuth()

// Export composable
export function useAuth() {
  return {
    // State
    user: computed(() => state.value.user),
    token: computed(() => state.value.token),
    isAuthenticated: computed(() => state.value.isAuthenticated),
    loading: computed(() => state.value.loading),
    error: computed(() => state.value.error),

    // Actions
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    deleteAccount,
    getSessions,
    logoutSession,
    logoutAll,

    // Utilities
    fetchWithAuth
  }
}
