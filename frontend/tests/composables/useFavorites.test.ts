/**
 * Tests for useFavorites composable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFavorites } from '../../composables/useFavorites'

describe('useFavorites', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Re-import to get fresh instance
    vi.resetModules()
  })

  describe('initialization', () => {
    it('should initialize with empty favorites', () => {
      const { favorites, favoritesCount } = useFavorites()

      expect(favorites.value).toEqual([])
      expect(favoritesCount.value).toBe(0)
    })

    it('should load favorites from localStorage', () => {
      const storedFavorites = [
        {
          id: 'cat-1',
          type: 'cat',
          data: { url: 'http://example.com/cat.jpg' },
          createdAt: Date.now(),
        },
      ]
      localStorage.setItem('seethbot-favorites', JSON.stringify(storedFavorites))

      const { favorites, favoritesCount } = useFavorites()

      expect(favorites.value).toEqual(storedFavorites)
      expect(favoritesCount.value).toBe(1)
    })
  })

  describe('addFavorite', () => {
    it('should add a cat favorite', () => {
      const { favorites, favoritesCount, addFavorite } = useFavorites()

      const catData = { url: 'http://example.com/cat.jpg', id: 'cat1' }
      const result = addFavorite('cat', catData)

      expect(result).toBe(true)
      expect(favoritesCount.value).toBe(1)
      expect(favorites.value[0]).toMatchObject({
        type: 'cat',
        data: catData,
      })
    })

    it('should add a ranking favorite', () => {
      const { favorites, addFavorite } = useFavorites()

      const rankingData = { id: 'rank1', name: 'User 1' }
      const result = addFavorite('ranking', rankingData)

      expect(result).toBe(true)
      expect(favorites.value[0]).toMatchObject({
        type: 'ranking',
        data: rankingData,
      })
    })

    it('should not add duplicate ranking favorites', () => {
      const { favorites, favoritesCount, addFavorite } = useFavorites()

      const rankingData = { id: 'rank1', name: 'User 1' }
      addFavorite('ranking', rankingData)
      const result = addFavorite('ranking', rankingData)

      expect(result).toBe(false)
      expect(favoritesCount.value).toBe(1)
    })

    it('should not add duplicate ticket favorites', () => {
      const { favorites, favoritesCount, addFavorite } = useFavorites()

      const ticketData = { id: 123, title: 'Test Ticket' }
      addFavorite('ticket', ticketData)
      const result = addFavorite('ticket', ticketData)

      expect(result).toBe(false)
      expect(favoritesCount.value).toBe(1)
    })

    it('should not add duplicate quote favorites', () => {
      const { favorites, favoritesCount, addFavorite } = useFavorites()

      const quoteData = { text: 'Test quote', author: 'Test Author' }
      addFavorite('quote', quoteData)
      const result = addFavorite('quote', quoteData)

      expect(result).toBe(false)
      expect(favoritesCount.value).toBe(1)
    })

    it('should save to localStorage when adding favorite', () => {
      const { addFavorite } = useFavorites()

      const catData = { url: 'http://example.com/cat.jpg' }
      addFavorite('cat', catData)

      const stored = localStorage.getItem('seethbot-favorites')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].type).toBe('cat')
    })
  })

  describe('removeFavorite', () => {
    it('should remove a favorite by id', () => {
      const { favorites, favoritesCount, addFavorite, removeFavorite } = useFavorites()

      const catData = { url: 'http://example.com/cat.jpg' }
      addFavorite('cat', catData)

      const favoriteId = favorites.value[0].id
      const result = removeFavorite(favoriteId)

      expect(result).toBe(true)
      expect(favoritesCount.value).toBe(0)
    })

    it('should return false when removing non-existent favorite', () => {
      const { favoritesCount, removeFavorite } = useFavorites()

      const result = removeFavorite('non-existent-id')

      expect(result).toBe(false)
      expect(favoritesCount.value).toBe(0)
    })

    it('should save to localStorage when removing favorite', () => {
      const { favorites, addFavorite, removeFavorite } = useFavorites()

      const catData = { url: 'http://example.com/cat.jpg' }
      addFavorite('cat', catData)

      // Get the id of the favorite we just added
      const favoriteId = favorites.value[0].id
      removeFavorite(favoriteId)

      // Verify localStorage is updated (should be empty array now)
      const stored = localStorage.getItem('seethbot-favorites')
      expect(stored).toBeDefined()
      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(0)
    })
  })

  describe('isFavorite', () => {
    it('should return true for favorited cat', () => {
      const { addFavorite, isFavorite } = useFavorites()

      const catData = { url: 'http://example.com/cat.jpg' }
      addFavorite('cat', catData)

      expect(isFavorite('cat', catData)).toBe(true)
    })

    it('should return false for non-favorited cat', () => {
      const { isFavorite } = useFavorites()

      const catData = { url: 'http://example.com/cat.jpg' }
      expect(isFavorite('cat', catData)).toBe(false)
    })

    it('should return true for favorited ranking', () => {
      const { addFavorite, isFavorite } = useFavorites()

      const rankingData = { id: 'rank1', name: 'User 1' }
      addFavorite('ranking', rankingData)

      expect(isFavorite('ranking', rankingData)).toBe(true)
    })

    it('should return true for favorited ticket', () => {
      const { addFavorite, isFavorite } = useFavorites()

      const ticketData = { id: 123, title: 'Test Ticket' }
      addFavorite('ticket', ticketData)

      expect(isFavorite('ticket', ticketData)).toBe(true)
    })

    it('should return true for favorited quote', () => {
      const { addFavorite, isFavorite } = useFavorites()

      const quoteData = { text: 'Test quote', author: 'Test Author' }
      addFavorite('quote', quoteData)

      expect(isFavorite('quote', quoteData)).toBe(true)
    })

    it('should check by url for cat type', () => {
      const { addFavorite, isFavorite } = useFavorites()

      const catData1 = { url: 'http://example.com/cat1.jpg' }
      const catData2 = { url: 'http://example.com/cat2.jpg' }

      addFavorite('cat', catData1)

      expect(isFavorite('cat', catData1)).toBe(true)
      expect(isFavorite('cat', catData2)).toBe(false)
    })

    it('should check by id for ranking type', () => {
      const { addFavorite, isFavorite } = useFavorites()

      const rankingData1 = { id: 'rank1', name: 'User 1' }
      const rankingData2 = { id: 'rank2', name: 'User 2' }

      addFavorite('ranking', rankingData1)

      expect(isFavorite('ranking', rankingData1)).toBe(true)
      expect(isFavorite('ranking', rankingData2)).toBe(false)
    })
  })

  describe('toggleFavorite', () => {
    it('should add favorite if not already favorited', () => {
      const { favoritesCount, toggleFavorite, isFavorite } = useFavorites()

      const catData = { url: 'http://example.com/cat.jpg' }
      toggleFavorite('cat', catData)

      expect(favoritesCount.value).toBe(1)
      expect(isFavorite('cat', catData)).toBe(true)
    })

    it('should remove favorite if already favorited', () => {
      const { favoritesCount, toggleFavorite, isFavorite } = useFavorites()

      const catData = { url: 'http://example.com/cat.jpg' }
      toggleFavorite('cat', catData)

      expect(favoritesCount.value).toBe(1)

      toggleFavorite('cat', catData)

      expect(favoritesCount.value).toBe(0)
      expect(isFavorite('cat', catData)).toBe(false)
    })
  })

  describe('getFavoritesByType', () => {
    it('should return favorites filtered by type', () => {
      const { addFavorite, getFavoritesByType } = useFavorites()

      addFavorite('cat', { url: 'http://example.com/cat1.jpg' })
      addFavorite('cat', { url: 'http://example.com/cat2.jpg' })
      addFavorite('ranking', { id: 'rank1', name: 'User 1' })

      const catFavorites = getFavoritesByType('cat')

      expect(catFavorites.value).toHaveLength(2)
      expect(catFavorites.value.every(fav => fav.type === 'cat')).toBe(true)
    })

    it('should return empty array for type with no favorites', () => {
      const { getFavoritesByType } = useFavorites()

      const rankingFavorites = getFavoritesByType('ranking')

      expect(rankingFavorites.value).toEqual([])
    })
  })

  describe('allFavorites', () => {
    it('should return all favorites sorted by creation date (newest first)', () => {
      const { addFavorite, allFavorites } = useFavorites()

      const catData1 = { url: 'http://example.com/cat1.jpg' }
      const catData2 = { url: 'http://example.com/cat2.jpg' }

      addFavorite('cat', catData1)
      // Small delay to ensure different timestamps
      setTimeout(() => {
        addFavorite('cat', catData2)

        expect(allFavorites.value).toHaveLength(2)
        expect(allFavorites.value[0].createdAt).toBeGreaterThanOrEqual(allFavorites.value[1].createdAt)
      }, 10)
    })
  })

  describe('clearFavorites', () => {
    it('should clear all favorites', () => {
      const { favorites, favoritesCount, addFavorite, clearFavorites } = useFavorites()

      addFavorite('cat', { url: 'http://example.com/cat1.jpg' })
      addFavorite('ranking', { id: 'rank1', name: 'User 1' })

      expect(favoritesCount.value).toBe(2)

      clearFavorites()

      expect(favorites.value).toEqual([])
      expect(favoritesCount.value).toBe(0)
    })

    it('should clear localStorage', () => {
      const { addFavorite, clearFavorites } = useFavorites()

      addFavorite('cat', { url: 'http://example.com/cat1.jpg' })
      clearFavorites()

      const stored = localStorage.getItem('seethbot-favorites')
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed).toEqual([])
    })
  })

  describe('saveFavorites', () => {
    it('should manually save favorites to localStorage', () => {
      const { favorites, saveFavorites } = useFavorites()

      favorites.value.push({
        id: 'test-1',
        type: 'cat',
        data: { url: 'http://example.com/cat.jpg' },
        createdAt: Date.now(),
      })

      saveFavorites()

      const stored = localStorage.getItem('seethbot-favorites')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].id).toBe('test-1')
    })
  })
})
