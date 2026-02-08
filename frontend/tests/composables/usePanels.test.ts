/**
 * Tests for usePanels composable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { usePanels } from '../../composables/usePanels'

describe('usePanels', () => {
  let originalInnerWidth: number

  beforeEach(() => {
    localStorage.clear()
    originalInnerWidth = window.innerWidth
  })

  afterEach(() => {
    // Restore original innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
  })

  const setMobile = () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })
  }

  const setDesktop = () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  }

  describe('initialization', () => {
    it('should initialize with default panel state', () => {
      const { panels } = usePanels()

      expect(panels.value).toEqual({
        rankings: true,
        cat: false,
        feed: false,
        digitalGoose: true,
        tachometer: true,
        coolnessPanel: true,
        mining: false,
        activeUsers: true,
      })
    })

    it('should load saved panels from localStorage', () => {
      const savedState = {
        rankings: false,
        cat: true,
        feed: true,
        digitalGoose: false,
        tachometer: false,
        coolnessPanel: false,
        mining: true,
      }
      localStorage.setItem('panels', JSON.stringify(savedState))

      const { panels } = usePanels()

      expect(panels.value.rankings).toBe(false)
      expect(panels.value.cat).toBe(true)
      expect(panels.value.feed).toBe(true)
      expect(panels.value.mining).toBe(true)
    })
  })

  describe('togglePanel', () => {
    it('should open a closed panel', () => {
      const { panels, togglePanel } = usePanels()

      expect(panels.value.cat).toBe(false)
      togglePanel('cat')
      expect(panels.value.cat).toBe(true)
    })

    it('should close an open panel', () => {
      const { panels, togglePanel } = usePanels()

      expect(panels.value.rankings).toBe(true)
      togglePanel('rankings')
      expect(panels.value.rankings).toBe(false)
    })
  })

  describe('closePanel', () => {
    it('should close a panel', () => {
      const { panels, closePanel } = usePanels()

      expect(panels.value.rankings).toBe(true)
      closePanel('rankings')
      expect(panels.value.rankings).toBe(false)
    })
  })

  describe('openPanel', () => {
    it('should open a panel', () => {
      const { panels, openPanel } = usePanels()

      expect(panels.value.cat).toBe(false)
      openPanel('cat')
      expect(panels.value.cat).toBe(true)
    })
  })

  describe('mobile panel exclusivity', () => {
    it('should close cat when opening rankings on mobile', () => {
      setMobile()

      const { panels, openPanel } = usePanels()

      // First open cat
      openPanel('cat')
      expect(panels.value.cat).toBe(true)

      // Opening rankings should close cat
      openPanel('rankings')
      expect(panels.value.rankings).toBe(true)
      expect(panels.value.cat).toBe(false)
    })

    it('should close rankings when opening cat on mobile', () => {
      setMobile()

      const { panels, openPanel } = usePanels()

      // On mobile, rankings defaults to false, so open it first
      openPanel('rankings')
      expect(panels.value.rankings).toBe(true)

      // Opening cat should close rankings
      openPanel('cat')
      expect(panels.value.cat).toBe(true)
      expect(panels.value.rankings).toBe(false)
    })

    it('should not close cat when opening rankings on desktop', () => {
      setDesktop()

      const { panels, openPanel } = usePanels()

      // First open cat
      openPanel('cat')
      expect(panels.value.cat).toBe(true)

      // On desktop, opening rankings should NOT close cat
      openPanel('rankings')
      expect(panels.value.rankings).toBe(true)
      expect(panels.value.cat).toBe(true)
    })
  })

  describe('localStorage persistence', () => {
    it('should save panel state to localStorage on change', async () => {
      const { panels, togglePanel } = usePanels()

      togglePanel('cat')

      // The watcher is async, so we need to wait a tick
      await new Promise(resolve => setTimeout(resolve, 0))

      const stored = localStorage.getItem('panels')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.cat).toBe(true)
    })
  })
})
