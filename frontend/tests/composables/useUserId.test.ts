/**
 * Tests for useUserId composable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('useUserId', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  it('should generate a userId when none exists in localStorage', async () => {
    const { useUserId } = await import('../../composables/useUserId')
    const { userId } = useUserId()

    expect(userId.value).toBeTruthy()
    expect(userId.value.length).toBeGreaterThan(0)
  })

  it('should return stored userId from localStorage', async () => {
    localStorage.setItem('userId', 'user_existing_abc123')

    const { useUserId } = await import('../../composables/useUserId')
    const { userId } = useUserId()

    expect(userId.value).toBe('user_existing_abc123')
  })

  it('should return the same instance on multiple calls (singleton)', async () => {
    const { useUserId } = await import('../../composables/useUserId')
    const first = useUserId()
    const second = useUserId()

    expect(first.userId).toBe(second.userId)
    expect(first.userId.value).toBe(second.userId.value)
  })

  it('should generate id following user_* format', async () => {
    const { useUserId } = await import('../../composables/useUserId')
    const { userId } = useUserId()

    expect(userId.value).toMatch(/^user_\d+_[a-z0-9]+$/)
  })

  it('resetUserId should generate a new id', async () => {
    const { useUserId } = await import('../../composables/useUserId')
    const { userId, resetUserId } = useUserId()

    const originalId = userId.value
    resetUserId()

    expect(userId.value).not.toBe(originalId)
    expect(userId.value).toMatch(/^user_\d+_[a-z0-9]+$/)
  })

  it('resetUserId should save new id to localStorage', async () => {
    const { useUserId } = await import('../../composables/useUserId')
    const { userId, resetUserId } = useUserId()

    resetUserId()

    const stored = localStorage.getItem('userId')
    expect(stored).toBe(userId.value)
  })
})
