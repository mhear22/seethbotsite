/**
 * Tests for useAuthStore Pinia store
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../../stores/useAuthStore'

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.resetModules()
    mockFetch.mockReset()
  })

  afterEach(() => {
    mockFetch.mockReset()
  })

  describe('initialization', () => {
    it('should initialize with no auth when no token in localStorage', () => {
      const store = useAuthStore()

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should initialize with token from localStorage and validate it', async () => {
      localStorage.setItem('auth_token', 'saved-token-123')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            id: 1,
            email: 'test@example.com',
            display_name: 'Tester',
            created_at: '2025-01-01',
            updated_at: '2025-01-01'
          },
          session: {
            expires_at: new Date(Date.now() + 86400000).toISOString()
          }
        })
      })

      const store = useAuthStore()
      await store.init()

      expect(store.token).toBe('saved-token-123')
      expect(store.user).not.toBeNull()
      expect(store.isAuthenticated).toBe(true)
    })
  })

  describe('register', () => {
    it('should send correct request to /auth/register', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          token: 'new-token-abc',
          user: { id: 1, email: 'new@example.com', display_name: 'New User' }
        })
      })

      const store = useAuthStore()
      await store.register('new@example.com', 'password123', 'New User')

      const registerCall = mockFetch.mock.calls.find(
        (call: any[]) => call[0] === '/api/auth/register'
      )

      expect(registerCall).toBeDefined()
      const options = registerCall![1]
      expect(options.method).toBe('POST')
      const body = JSON.parse(options.body)
      expect(body.email).toBe('new@example.com')
      expect(body.password).toBe('password123')
      expect(body.displayName).toBe('New User')
    })

    it('should return success on ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          token: 'new-token',
          user: { id: 1, email: 'new@example.com', display_name: 'New User' }
        })
      })

      const store = useAuthStore()
      const result = await store.register('new@example.com', 'password123')

      expect(result.success).toBe(true)
      expect(result.user).toBeDefined()
      expect(result.user!.email).toBe('new@example.com')
      expect(store.token).toBe('new-token')
      expect(store.isAuthenticated).toBe(true)
    })

    it('should return error on failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Email already exists'
        })
      })

      const store = useAuthStore()
      const result = await store.register('existing@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email already exists')
    })
  })

  describe('login', () => {
    it('should send correct request to /auth/login', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          token: 'new-token-abc',
          user: { id: 1, email: 'user@example.com', display_name: 'User' }
        })
      })

      const store = useAuthStore()
      await store.login('user@example.com', 'mypassword')

      const loginCall = mockFetch.mock.calls.find(
        (call: any[]) => call[0] === '/api/auth/login'
      )

      expect(loginCall).toBeDefined()
      const options = loginCall![1]
      expect(options.method).toBe('POST')
      const body = JSON.parse(options.body)
      expect(body.email).toBe('user@example.com')
      expect(body.password).toBe('mypassword')
    })

    it('should store token on success', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          token: 'login-token-xyz',
          user: { id: 2, email: 'user@example.com', display_name: 'User' }
        })
      })

      const store = useAuthStore()
      const result = await store.login('user@example.com', 'password')

      expect(result.success).toBe(true)
      expect(store.token).toBe('login-token-xyz')
      expect(store.isAuthenticated).toBe(true)
      expect(localStorage.getItem('auth_token')).toBe('login-token-xyz')
    })

    it('should return error on failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Invalid credentials'
        })
      })

      const store = useAuthStore()
      const result = await store.login('user@example.com', 'wrongpassword')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
    })
  })

  describe('logout', () => {
    it('should clear auth state', async () => {
      mockFetch.mockResolvedValue({ ok: true })

      const store = useAuthStore()
      store.token = 'existing-token'
      store.user = { id: 1, email: 'test@example.com', display_name: 'Test' } as any

      await store.logout()

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(localStorage.getItem('auth_token')).toBeNull()
    })

    it('should call /auth/logout endpoint', async () => {
      mockFetch.mockResolvedValue({ ok: true })

      const store = useAuthStore()
      store.token = 'token-for-logout'

      await store.logout()

      const logoutCall = mockFetch.mock.calls.find(
        (call: any[]) => call[0] === '/api/auth/logout'
      )
      expect(logoutCall).toBeDefined()
      expect(logoutCall![1].method).toBe('POST')
    })
  })

  describe('updateProfile', () => {
    it('should send PATCH with displayName', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          user: { id: 1, email: 'test@example.com', display_name: 'New Name' }
        })
      })

      const store = useAuthStore()
      store.token = 'update-token'

      await store.updateProfile('New Name')

      const profileCall = mockFetch.mock.calls.find(
        (call: any[]) => call[0] === '/api/auth/profile'
      )
      expect(profileCall).toBeDefined()
      expect(profileCall![1].method).toBe('PATCH')
      const body = JSON.parse(profileCall![1].body)
      expect(body.displayName).toBe('New Name')
    })

    it('should update user on success', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          user: { id: 1, email: 'test@example.com', display_name: 'Updated Name' }
        })
      })

      const store = useAuthStore()
      store.token = 'update-token'

      const result = await store.updateProfile('Updated Name')

      expect(result.success).toBe(true)
      expect(store.user!.display_name).toBe('Updated Name')
    })
  })

  describe('changePassword', () => {
    it('should send correct request', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      })

      const store = useAuthStore()
      store.token = 'pw-token'

      const result = await store.changePassword('oldpass', 'newpass')

      const pwCall = mockFetch.mock.calls.find(
        (call: any[]) => call[0] === '/api/auth/password'
      )
      expect(pwCall).toBeDefined()
      expect(pwCall![1].method).toBe('PATCH')
      const body = JSON.parse(pwCall![1].body)
      expect(body.oldPassword).toBe('oldpass')
      expect(body.newPassword).toBe('newpass')
      expect(result.success).toBe(true)
    })

    it('should clear auth after password change', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      })

      const store = useAuthStore()
      store.token = 'pw-token'
      store.user = { id: 1, email: 'test@example.com' } as any

      await store.changePassword('oldpass', 'newpass')

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
    })
  })

  describe('deleteAccount', () => {
    it('should clear auth on success', async () => {
      mockFetch.mockResolvedValue({ ok: true })

      const store = useAuthStore()
      store.token = 'delete-token'
      store.user = { id: 1, email: 'test@example.com' } as any

      const result = await store.deleteAccount('mypassword')

      expect(result.success).toBe(true)
      expect(store.token).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(localStorage.getItem('auth_token')).toBeNull()
    })
  })

  describe('getSessions', () => {
    it('should return sessions array', async () => {
      const sessionsData = [
        { id: 1, user_id: 1, device_name: 'Chrome', token: 'tok1', expires_at: '', created_at: '', last_used_at: '' },
        { id: 2, user_id: 1, device_name: 'Firefox', token: 'tok2', expires_at: '', created_at: '', last_used_at: '' }
      ]
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ sessions: sessionsData })
      })

      const store = useAuthStore()
      store.token = 'sessions-token'

      const sessions = await store.getSessions()

      expect(sessions).toHaveLength(2)
      expect(sessions[0].device_name).toBe('Chrome')
      expect(sessions[1].device_name).toBe('Firefox')
    })

    it('should return empty array when no token', async () => {
      const store = useAuthStore()

      const sessions = await store.getSessions()

      expect(sessions).toEqual([])
    })
  })

  describe('logoutSession', () => {
    it('should send DELETE to /auth/sessions/:id', async () => {
      mockFetch.mockResolvedValue({ ok: true })

      const store = useAuthStore()
      store.token = 'session-token'

      const result = await store.logoutSession(42)

      const deleteCall = mockFetch.mock.calls.find(
        (call: any[]) => call[0] === '/api/auth/sessions/42'
      )
      expect(deleteCall).toBeDefined()
      expect(deleteCall![1].method).toBe('DELETE')
      expect(result.success).toBe(true)
    })
  })

  describe('logoutAll', () => {
    it('should clear auth after deleting all sessions', async () => {
      mockFetch.mockResolvedValue({ ok: true })

      const store = useAuthStore()
      store.token = 'all-session-token'
      store.user = { id: 1, email: 'test@example.com' } as any

      const result = await store.logoutAll()

      const deleteAllCall = mockFetch.mock.calls.find(
        (call: any[]) => call[0] === '/api/auth/sessions/all' && call[1]?.method === 'DELETE'
      )
      expect(deleteAllCall).toBeDefined()
      expect(result.success).toBe(true)
      expect(store.token).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('fetchWithAuth', () => {
    it('should add Bearer header when token exists', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) })

      const store = useAuthStore()
      store.token = 'bearer-token'

      await store.fetchWithAuth('/api/some-endpoint', { method: 'GET' })

      const fetchCall = mockFetch.mock.calls.find(
        (call: any[]) => call[0] === '/api/some-endpoint'
      )
      expect(fetchCall).toBeDefined()
      expect(fetchCall![1].headers['Authorization']).toBe('Bearer bearer-token')
    })
  })
})
