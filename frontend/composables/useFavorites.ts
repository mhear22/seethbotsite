import { ref, computed } from 'vue'

export interface FavoriteItem {
  id: string
  type: 'cat' | 'ranking' | 'ticket' | 'quote'
  data: any
  createdAt: number
}

export function useFavorites() {
  const STORAGE_KEY = 'seethbot-favorites'

  const favorites = ref<FavoriteItem[]>([])

  // Load favorites from localStorage
  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        favorites.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load favorites:', error)
      favorites.value = []
    }
  }

  // Save favorites to localStorage
  const saveFavorites = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.value))
    } catch (error) {
      console.error('Failed to save favorites:', error)
    }
  }

  // Add a favorite
  const addFavorite = (type: FavoriteItem['type'], data: any) => {
    const id = `${type}-${Date.now()}`

    // Check if already favorited (for items that shouldn't be duplicated)
    if (type === 'ranking' || type === 'ticket') {
      const exists = favorites.value.some(
        fav => fav.type === type && fav.data.id === data.id
      )
      if (exists) return false
    } else if (type === 'quote') {
      const exists = favorites.value.some(
        fav => fav.type === type && fav.data.text === data.text
      )
      if (exists) return false
    }

    favorites.value.push({
      id,
      type,
      data,
      createdAt: Date.now()
    })
    saveFavorites()
    return true
  }

  // Remove a favorite
  const removeFavorite = (id: string) => {
    const index = favorites.value.findIndex(fav => fav.id === id)
    if (index > -1) {
      favorites.value.splice(index, 1)
      saveFavorites()
      return true
    }
    return false
  }

  // Check if an item is favorited
  const isFavorite = (type: FavoriteItem['type'], data: any) => {
    return favorites.value.some(fav => {
      if (fav.type !== type) return false

      if (type === 'ranking' || type === 'ticket') {
        return fav.data.id === data.id
      } else if (type === 'quote') {
        return fav.data.text === data.text
      } else if (type === 'cat') {
        return fav.data.url === data.url
      }
      return false
    })
  }

  // Toggle favorite status
  const toggleFavorite = (type: FavoriteItem['type'], data: any) => {
    if (isFavorite(type, data)) {
      // Find and remove
      const fav = favorites.value.find(fav => {
        if (fav.type !== type) return false

        if (type === 'ranking' || type === 'ticket') {
          return fav.data.id === data.id
        } else if (type === 'quote') {
          return fav.data.text === data.text
        } else if (type === 'cat') {
          return fav.data.url === data.url
        }
        return false
      })

      if (fav) {
        removeFavorite(fav.id)
        return false
      }
    } else {
      return addFavorite(type, data)
    }
    return false
  }

  // Get favorites by type
  const getFavoritesByType = (type: FavoriteItem['type']) => {
    return computed(() => favorites.value.filter(fav => fav.type === type))
  }

  // Get all favorites sorted by creation date (newest first)
  const allFavorites = computed(() => {
    return [...favorites.value].sort((a, b) => b.createdAt - a.createdAt)
  })

  // Count of favorites
  const favoritesCount = computed(() => favorites.value.length)

  // Clear all favorites
  const clearFavorites = () => {
    favorites.value = []
    saveFavorites()
  }

  // Load favorites on init
  loadFavorites()

  return {
    favorites,
    allFavorites,
    favoritesCount,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    getFavoritesByType,
    clearFavorites,
    saveFavorites
  }
}
