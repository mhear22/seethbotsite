/**
 * Favorites Store
 *
 * Pinia store for managing user favorites.
 * Syncs with backend API and provides quick access to favorited items.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Favorite {
  id: number
  user_id: number
  item_type: 'page' | 'panel' | 'feature'
  item_id: string
  display_name: string
  order_index: number
  created_at: string
  updated_at: string
}

// API base URL
const API_BASE = import.meta.env.VITE_API_URL || '/api'

/**
 * Helper to get auth token
 */
const getAuthToken = () => {
  const token = localStorage.getItem('seethbot-auth-token')
  return token || ''
}

/**
 * Helper to make authenticated API calls
 */
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken()
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
}

export const useFavoritesStore = defineStore('favorites', () => {
  // State
  const favorites = ref<Favorite[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Load favorites from the server
   */
  const loadFavorites = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await authenticatedFetch(`${API_BASE}/favorites`)
      if (!response.ok) {
        throw new Error('Failed to load favorites')
      }
      const data = await response.json()
      favorites.value = data.favorites || []
    } catch (err: any) {
      console.error('Failed to load favorites:', err)
      error.value = err.message || 'Failed to load favorites'
    } finally {
      loading.value = false
    }
  }

  /**
   * Add a favorite
   */
  const addFavorite = async (itemType: 'page' | 'panel' | 'feature', itemId: string, displayName: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await authenticatedFetch(`${API_BASE}/favorites`, {
        method: 'POST',
        body: JSON.stringify({
          item_type: itemType,
          item_id: itemId,
          display_name: displayName
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to add favorite')
      }

      const data = await response.json()
      favorites.value.push(data.favorite)

      // Sort by order_index
      favorites.value.sort((a, b) => a.order_index - b.order_index)

      return true
    } catch (err: any) {
      console.error('Failed to add favorite:', err)
      error.value = err.message || 'Failed to add favorite'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Remove a favorite by ID
   */
  const removeFavorite = async (favoriteId: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await authenticatedFetch(`${API_BASE}/favorites/${favoriteId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to remove favorite')
      }

      favorites.value = favorites.value.filter(fav => fav.id !== favoriteId)
      return true
    } catch (err: any) {
      console.error('Failed to remove favorite:', err)
      error.value = err.message || 'Failed to remove favorite'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Remove a favorite by item type and ID
   */
  const removeFavoriteByItem = async (itemType: string, itemId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await authenticatedFetch(`${API_BASE}/favorites/item`, {
        method: 'DELETE',
        body: JSON.stringify({
          item_type: itemType,
          item_id: itemId
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to remove favorite')
      }

      favorites.value = favorites.value.filter(
        fav => fav.item_type !== itemType || fav.item_id !== itemId
      )
      return true
    } catch (err: any) {
      console.error('Failed to remove favorite:', err)
      error.value = err.message || 'Failed to remove favorite'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Update a favorite
   */
  const updateFavorite = async (favoriteId: number, updates: { display_name?: string; order_index?: number }) => {
    loading.value = true
    error.value = null

    try {
      const response = await authenticatedFetch(`${API_BASE}/favorites/${favoriteId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to update favorite')
      }

      const data = await response.json()
      const index = favorites.value.findIndex(fav => fav.id === favoriteId)
      if (index !== -1) {
        favorites.value[index] = data.favorite
        // Sort by order_index
        favorites.value.sort((a, b) => a.order_index - b.order_index)
      }
      return true
    } catch (err: any) {
      console.error('Failed to update favorite:', err)
      error.value = err.message || 'Failed to update favorite'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Reorder favorites
   */
  const reorderFavorites = async (favoriteIds: number[]) => {
    loading.value = true
    error.value = null

    try {
      const response = await authenticatedFetch(`${API_BASE}/favorites/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ favorite_ids: favoriteIds })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to reorder favorites')
      }

      const data = await response.json()
      favorites.value = data.favorites || []
      return true
    } catch (err: any) {
      console.error('Failed to reorder favorites:', err)
      error.value = err.message || 'Failed to reorder favorites'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Check if an item is favorited
   */
  const isFavorited = (itemType: string, itemId: string): boolean => {
    return favorites.value.some(
      fav => fav.item_type === itemType && fav.item_id === itemId
    )
  }

  /**
   * Get favorites by type
   */
  const getFavoritesByType = (itemType: 'page' | 'panel' | 'feature') => {
    return computed(() =>
      favorites.value.filter(fav => fav.item_type === itemType)
    )
  }

  /**
   * Toggle favorite status
   */
  const toggleFavorite = async (itemType: 'page' | 'panel' | 'feature', itemId: string, displayName: string) => {
    if (isFavorited(itemType, itemId)) {
      return await removeFavoriteByItem(itemType, itemId)
    } else {
      return await addFavorite(itemType, itemId, displayName)
    }
  }

  /**
   * Clear all favorites from local state
   */
  const clearFavorites = () => {
    favorites.value = []
    error.value = null
  }

  return {
    // State
    favorites,
    loading,
    error,

    // Actions
    loadFavorites,
    addFavorite,
    removeFavorite,
    removeFavoriteByItem,
    updateFavorite,
    reorderFavorites,
    isFavorited,
    getFavoritesByType,
    toggleFavorite,
    clearFavorites
  }
})
