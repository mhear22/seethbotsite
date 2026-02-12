/**
 * Profile Composable
 *
 * Handles user profile CRUD operations.
 * Separated from auth store for better modularity and testability.
 */

import { ref } from 'vue'

const API_BASE = '/api'

// Re-export User interface for use in other modules
export interface User {
  id: number
  email: string
  display_name: string | null
  avatar_url: string | null
  banner_url: string | null
  bio: string | null
  status: string | null
  show_email: number
  show_joined_date: number
  discord_id: string | null
  discord_username: string | null
  discord_discriminator: string | null
  discord_avatar: string | null
  created_at: string
  updated_at: string
}

export interface UpdateProfileResult {
  success: boolean
  user?: User
  error?: string
}

/**
 * Composable for profile operations
 */
export const useProfile = (token: () => string | null) => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch current user data from server
   */
  const fetchUser = async (): Promise<User | null> => {
    const currentToken = token()
    if (!currentToken) return null

    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        return data.user
      } else {
        console.error('Failed to fetch user')
        return null
      }
    } catch (err) {
      console.error('Fetch user error:', err)
      return null
    }
  }

  /**
   * Update user profile
   */
  const updateProfile = async (displayName: string): Promise<UpdateProfileResult> => {
    const currentToken = token()
    if (!currentToken) {
      return { success: false, error: 'Not authenticated' }
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ displayName })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return { success: true, user: data.user }
      } else {
        error.value = data.message || 'Update failed'
        return { success: false, error: error.value }
      }
    } catch (err) {
      console.error('Update failed:', err)
      error.value = 'Update failed. Please try again.'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Transform user data for display
   */
  const transformUserForDisplay = (user: User) => {
    return {
      id: user.id,
      displayName: user.display_name || 'Anonymous',
      email: user.email,
      avatar: user.avatar_url,
      banner: user.banner_url,
      bio: user.bio,
      status: user.status,
      showEmail: user.show_email === 1,
      showJoinedDate: user.show_joined_date === 1,
      discordId: user.discord_id,
      discordUsername: user.discord_username,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at)
    }
  }

  /**
   * Validate profile data
   */
  const validateProfileData = (displayName: string): { valid: boolean; error?: string } => {
    if (!displayName || displayName.trim().length === 0) {
      return { valid: false, error: 'Display name is required' }
    }

    if (displayName.length > 50) {
      return { valid: false, error: 'Display name must be 50 characters or less' }
    }

    return { valid: true }
  }

  return {
    // State
    loading,
    error,

    // Actions
    fetchUser,
    updateProfile,
    transformUserForDisplay,
    validateProfileData
  }
}
