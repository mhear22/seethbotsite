/**
 * Tests for useLanguage composable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('useLanguage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  describe('initialization', () => {
    it('should default to US language', async () => {
      const { useLanguage } = await import('../../composables/useLanguage')
      const { languageRegion } = useLanguage()

      expect(languageRegion.value).toBe('US')
    })

    it('should load AU from localStorage', async () => {
      localStorage.setItem('languageRegion', 'AU')

      const { useLanguage } = await import('../../composables/useLanguage')
      const { languageRegion } = useLanguage()

      expect(languageRegion.value).toBe('AU')
    })
  })

  describe('applyLanguage', () => {
    it('should return text unchanged for US region', async () => {
      const { applyLanguage } = await import('../../composables/useLanguage')
      const result = applyLanguage('My favorite color', 'US')

      expect(result).toBe('My favorite color')
    })

    it('should replace color with colour for AU region', async () => {
      const { applyLanguage } = await import('../../composables/useLanguage')
      const result = applyLanguage('The color is red', 'AU')

      expect(result).toBe('The colour is red')
    })

    it('should replace favorite with favourite for AU region', async () => {
      const { applyLanguage } = await import('../../composables/useLanguage')
      const result = applyLanguage('This is my favorite', 'AU')

      expect(result).toBe('This is my favourite')
    })

    it('should use word boundaries and not replace partial words like colorado', async () => {
      const { applyLanguage } = await import('../../composables/useLanguage')
      const result = applyLanguage('I visited colorado', 'AU')

      // 'colorado' should not have 'color' replaced because word boundary
      // regex \bcolor\b will not match inside 'colorado'
      expect(result).toBe('I visited colorado')
    })
  })

  describe('setLanguageRegion', () => {
    it('should save language region to localStorage', async () => {
      const { setLanguageRegion } = await import('../../composables/useLanguage')
      setLanguageRegion('AU')

      expect(localStorage.getItem('languageRegion')).toBe('AU')
    })
  })

  describe('toggleLanguage', () => {
    it('should toggle from US to AU', async () => {
      const { useLanguage } = await import('../../composables/useLanguage')
      const { languageRegion, toggleLanguage } = useLanguage()

      expect(languageRegion.value).toBe('US')
      toggleLanguage()
      expect(languageRegion.value).toBe('AU')
    })

    it('should toggle from AU to US', async () => {
      localStorage.setItem('languageRegion', 'AU')

      const { useLanguage } = await import('../../composables/useLanguage')
      const { languageRegion, toggleLanguage } = useLanguage()

      expect(languageRegion.value).toBe('AU')
      toggleLanguage()
      expect(languageRegion.value).toBe('US')
    })
  })

  describe('isAustralian', () => {
    it('should be true when language region is AU', async () => {
      localStorage.setItem('languageRegion', 'AU')

      const { useLanguage } = await import('../../composables/useLanguage')
      const { isAustralian } = useLanguage()

      expect(isAustralian.value).toBe(true)
    })

    it('should be false when language region is US', async () => {
      const { useLanguage } = await import('../../composables/useLanguage')
      const { isAustralian } = useLanguage()

      expect(isAustralian.value).toBe(false)
    })
  })
})
