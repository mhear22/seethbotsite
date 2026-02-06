/**
 * Tests for useAppStore Pinia store
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Mock all composable dependencies
const mockPlayButtonClick = vi.fn()
const mockToggleMusic = vi.fn()
const mockPlayFart = vi.fn()
const mockPlayGooseHonk = vi.fn()
const mockMuteAll = vi.fn()
const mockUnmuteAll = vi.fn()

vi.mock('../../composables/useAudio', () => ({
  useAudio: () => ({
    playSound: vi.fn(),
    playButtonClick: mockPlayButtonClick,
    toggleMusic: mockToggleMusic,
    playFart: mockPlayFart,
    playGooseHonk: mockPlayGooseHonk,
    muteAll: mockMuteAll,
    unmuteAll: mockUnmuteAll,
  }),
}))

const mockFetchNewCat = vi.fn()
vi.mock('../../composables/useCat', () => ({
  useCat: () => ({
    catImage: { value: 'https://cat.jpg' },
    catLoading: { value: false },
    fetchNewCat: mockFetchNewCat,
  }),
}))

const mockLoadRankings = vi.fn()
const mockGetTrendClass = vi.fn(() => 'trend-up')
vi.mock('../../composables/useRankings', () => ({
  useRankings: () => ({
    rankings: { value: [] },
    loading: { value: false },
    loadRankings: mockLoadRankings,
    getTrendClass: mockGetTrendClass,
  }),
}))

const mockTogglePanel = vi.fn()
vi.mock('../../composables/usePanels', () => ({
  usePanels: () => ({
    panels: { value: { rankings: false, cat: false } },
    togglePanel: mockTogglePanel,
    openPanel: vi.fn(),
    closePanel: vi.fn(),
  }),
}))

const mockToggleLanguage = vi.fn()
const mockApplyLanguage = vi.fn((text: string) => text)
vi.mock('../../composables/useLanguage', () => ({
  useLanguage: () => ({
    languageRegion: { value: 'US' },
    toggleLanguage: mockToggleLanguage,
    applyLanguage: mockApplyLanguage,
    isAustralian: { value: false },
    setLanguageRegion: vi.fn(),
  }),
}))

vi.mock('../../composables/useAuth', () => ({
  useAuth: () => ({
    user: { value: null },
    token: { value: null },
    isAuthenticated: { value: false },
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}))

import { useAppStore } from '../../stores/useAppStore'

describe('useAppStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    localStorage.clear()
    document.body.className = ''
    document.body.style.filter = ''
    document.body.style.backgroundColor = ''
  })

  describe('initial state', () => {
    it('initializes with default values', () => {
      const store = useAppStore()

      expect(store.darkMode).toBe(false)
      expect(store.darkerMode).toBe(false)
      expect(store.chaosMode).toBe(false)
      expect(store.musicPlaying).toBe(false)
      expect(store.isMuted).toBe(false)
      expect(store.currentQuoteIndex).toBe(0)
      expect(store.mikaModalOpen).toBe(false)
      expect(store.confirmationOpen).toBe(false)
      expect(store.searchModalOpen).toBe(false)
    })

    it('loads dark mode from localStorage', () => {
      localStorage.setItem('darkMode', 'true')
      const store = useAppStore()

      expect(store.darkMode).toBe(true)
    })

    it('loads chaos mode from localStorage', () => {
      localStorage.setItem('chaosMode', 'true')
      const store = useAppStore()

      expect(store.chaosMode).toBe(true)
    })

    it('mold mode defaults to true when not in localStorage', () => {
      const store = useAppStore()

      expect(store.moldMode).toBe(true)
    })

    it('loads mold mode false from localStorage', () => {
      localStorage.setItem('moldMode', 'false')
      const store = useAppStore()

      expect(store.moldMode).toBe(false)
    })
  })

  describe('toggleDarkMode', () => {
    it('cycles light -> dark', () => {
      const store = useAppStore()

      store.toggleDarkMode()

      expect(store.darkMode).toBe(true)
      expect(store.darkerMode).toBe(false)
      expect(mockPlayButtonClick).toHaveBeenCalled()
    })

    it('cycles dark -> darker', () => {
      localStorage.setItem('darkMode', 'true')
      const store = useAppStore()

      store.toggleDarkMode()

      expect(store.darkMode).toBe(true)
      expect(store.darkerMode).toBe(true)
    })

    it('cycles darker -> light', () => {
      localStorage.setItem('darkMode', 'true')
      localStorage.setItem('darkerMode', 'true')
      const store = useAppStore()

      store.toggleDarkMode()

      expect(store.darkMode).toBe(false)
      expect(store.darkerMode).toBe(false)
    })

    it('saves to localStorage', () => {
      const store = useAppStore()

      store.toggleDarkMode()

      expect(localStorage.getItem('darkMode')).toBe('true')
      expect(localStorage.getItem('darkerMode')).toBe('false')
    })
  })

  describe('toggleChaosMode', () => {
    it('toggles chaos mode on', () => {
      const store = useAppStore()

      store.toggleChaosMode()

      expect(store.chaosMode).toBe(true)
      expect(localStorage.getItem('chaosMode')).toBe('true')
    })

    it('toggles chaos mode off', () => {
      localStorage.setItem('chaosMode', 'true')
      const store = useAppStore()

      store.toggleChaosMode()

      expect(store.chaosMode).toBe(false)
      expect(localStorage.getItem('chaosMode')).toBe('false')
    })
  })

  describe('toggleMoldMode', () => {
    it('toggles mold mode off when on', () => {
      const store = useAppStore()
      expect(store.moldMode).toBe(true)

      store.toggleMoldMode()

      expect(store.moldMode).toBe(false)
      expect(localStorage.getItem('moldMode')).toBe('false')
    })

    it('toggles mold mode on when off', () => {
      localStorage.setItem('moldMode', 'false')
      const store = useAppStore()

      store.toggleMoldMode()

      expect(store.moldMode).toBe(true)
      expect(localStorage.getItem('moldMode')).toBe('true')
    })
  })

  describe('toggleMusic', () => {
    it('toggles music playing and calls audio', () => {
      const store = useAppStore()

      store.toggleMusic()

      expect(store.musicPlaying).toBe(true)
      expect(mockToggleMusic).toHaveBeenCalledWith(true)
      expect(mockPlayButtonClick).toHaveBeenCalled()
    })
  })

  describe('toggleMute', () => {
    it('mutes all audio when toggled on', () => {
      const store = useAppStore()

      store.toggleMute()

      expect(store.isMuted).toBe(true)
      expect(mockMuteAll).toHaveBeenCalled()
    })

    it('unmutes all audio when toggled off', () => {
      const store = useAppStore()
      store.toggleMute() // mute
      vi.clearAllMocks()

      store.toggleMute() // unmute

      expect(store.isMuted).toBe(false)
      expect(mockUnmuteAll).toHaveBeenCalled()
      expect(mockPlayButtonClick).toHaveBeenCalled()
    })
  })

  describe('quotes', () => {
    it('currentQuote returns quote at current index', () => {
      const store = useAppStore()

      expect(store.currentQuote).toBe(store.quotes[0])
    })

    it('nextQuote advances the index', async () => {
      // Math.random >= 0.3 skips the advice fetch path
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
      const store = useAppStore()

      await store.nextQuote()

      expect(store.currentQuoteIndex).toBe(1)
      vi.spyOn(Math, 'random').mockRestore()
    })
  })

  describe('isTemer3', () => {
    it('returns false when no user', () => {
      const store = useAppStore()

      expect(store.isTemer3).toBe(false)
    })
  })

  describe('modal actions', () => {
    it('closeConfirmation sets confirmationOpen to false', () => {
      const store = useAppStore()
      store.confirmationOpen = true

      store.closeConfirmation()

      expect(store.confirmationOpen).toBe(false)
    })

    it('closeMikaModal sets mikaModalOpen to false', () => {
      const store = useAppStore()
      store.mikaModalOpen = true

      store.closeMikaModal()

      expect(store.mikaModalOpen).toBe(false)
    })

    it('toggleSearchModal toggles search modal', () => {
      const store = useAppStore()

      store.toggleSearchModal()
      expect(store.searchModalOpen).toBe(true)

      store.toggleSearchModal()
      expect(store.searchModalOpen).toBe(false)
    })
  })

  describe('onRouteChange', () => {
    it('updates currentRoute', () => {
      const store = useAppStore()

      store.onRouteChange('fishing')

      expect(store.currentRoute).toBe('fishing')
    })
  })

  describe('composable delegation', () => {
    it('exposes togglePanel from panels composable', () => {
      const store = useAppStore()

      store.togglePanel('rankings')

      expect(mockTogglePanel).toHaveBeenCalledWith('rankings')
    })

    it('exposes loadRankings from rankings composable', () => {
      const store = useAppStore()

      store.loadRankings()

      expect(mockLoadRankings).toHaveBeenCalled()
    })

    it('exposes nextCat from cat composable', () => {
      const store = useAppStore()

      store.nextCat()

      expect(mockFetchNewCat).toHaveBeenCalled()
    })

    it('exposes toggleLanguage from language composable', () => {
      const store = useAppStore()

      store.toggleLanguage()

      expect(mockToggleLanguage).toHaveBeenCalled()
    })

    it('exposes applyLanguage from language composable', () => {
      const store = useAppStore()

      store.applyLanguage('hello')

      expect(mockApplyLanguage).toHaveBeenCalledWith('hello')
    })
  })
})
