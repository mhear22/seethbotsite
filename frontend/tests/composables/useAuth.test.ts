/**
 * Tests for useAuth composable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
    mockFetch.mockReset()
  })

  afterEach(() => {
    mockFetch.mockReset()
  })

  /**
   * Helper: dynamically import useAuth with a fresh module to reset the
   * module-level `initialized` flag and `state` ref.
   */
  const loadUseAuth = async () => {
    const mod = await import('../../composables/useAuth')
    return mod.useAuth()
  }

  describe('initialization', () => {
    it('should initialize with no auth when no token in localStorage', async () => {
      // initAuth runs on module load. No token stored, so fetch should not be called for /auth/me
      const auth = await loadUseAuth()

      expect(auth.user.value).toBeNull()
      expect(auth.token.value).toBeNull()
      expect(auth.isAuthenticated.value).toBe(false)
      expect(auth.loading.value).toBe(false)
      expect(auth.error.value).toBeNull()
    })

    it('should initialize with token from localStorage and validate it', async () => {
      localStorage.setItem('auth_token', 'saved-token-123')

      // The module will call validateToken -> fetch /auth/me
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          email: 'test@example.com',
          display_name: 'Tester',
          created_at: '2025-01-01',
          updated_at: '2025-01-01'
        })
      })

      const auth = await loadUseAuth()

      expect(auth.token.value).toBe('saved-token-123')
      expect(auth.isAuthenticated.value).toBe(true)
    })
  })

  describe('register', () => {
    it('should send correct request to /auth/register', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          user: { id: 1, email: 'new@example.com', display_name: 'New User' }
        })
      })

      const auth = await loadUseAuth()
      await auth.register('new@example.com', 'password123', 'New User')

      // Find the register call (might not be the first if initAuth also fetched)
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
          user: { id: 1, email: 'new@example.com', display_name: 'New User' }
        })
      })

      const auth = await loadUseAuth()
      const result = await auth.register('new@example.com', 'password123')

      expect(result.success).toBe(true)
      expect(result.user).toBeDefined()
      expect(result.user!.email).toBe('new@example.com')
    })

    it('should return error on failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Email already exists'
        })
      })

      const auth = await loadUseAuth()
      const result = await auth.register('existing@example.com', 'password123')

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

      const auth = await loadUseAuth()
      await auth.login('user@example.com', 'mypassword')

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

      const auth = await loadUseAuth()
      const result = await auth.login('user@example.com', 'password')

      expect(result.success).toBe(true)
      expect(auth.token.value).toBe('login-token-xyz')
      expect(auth.isAuthenticated.value).toBe(true)
      expect(localStorage.getItem('auth_token')).toBe('login-token-xyz')
    })

    it('should return error on failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Invalid credentials'
        })
      })

      const auth = await loadUseAuth()
      const result = await auth.login('user@example.com', 'wrongpassword')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
    })
  })

  describe('logout', () => {
    it('should clear auth state', async () => {
      // Setup: login first to have a token
      localStorage.setItem('auth_token', 'existing-token')
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 1,
          email: 'test@example.com',
          display_name: 'Test'
        })
      })

      const auth = await loadUseAuth()

      // Now logout
      mockFetch.mockResolvedValueOnce({ ok: true })
      await auth.logout()

      expect(auth.user.value).toBeNull()
      expect(auth.token.value).toBeNull()
      expect(auth.isAuthenticated.value).toBe(false)
      expect(localStorage.getItem('auth_token')).toBeNull()
    })

    it('should call /auth/logout endpoint', async () => {
      localStorage.setItem('auth_token', 'token-for-logout')
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 1,
          email: 'test@example.com',
          display_name: 'Test'
        })
      })

      const auth = await loadUseAuth()
      mockFetch.mockClear()

      mockFetch.mockResolvedValueOnce({ ok: true })
      await auth.logout()

      const logoutCall = mockFetch.mock.calls.find(
        (call: any[]) => call[0] === '/api/auth/logout'
      )
      expect(logoutCall).toBeDefined()
      expect(logoutCall![1].method).toBe('POST')
    })
  })

  describe('updateProfile', () => {
    it('should send PATCH with displayName', async () => {
      localStorage.setItem('auth_token', 'update-token')
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          user: { id: 1, email: 'test@example.com', display_name: 'New Name' }
        })
      })

      const auth = await loadUseAuth()
      mockFetch.mockClear()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          user: { id: 1, email: 'test@example.com', display_name: 'New Name' }
        })
      })

      await auth.updateProfile('New Name')

      const profileCall = mockFetch.mock.calls.find(
        (call: any[]) => call[0] === '/api/auth/profile'
      )
      expect(profileCall).toBeDefined()
      expect(profileCall![1].method).toBe('PATCH')
      const body = JSON.parse(profileCall![1].body)
      expect(body.displayName).toBe('New Name')
    })
  })

  describe('changePassword', () => {
    it('should send correct request', async () => {
      localStorage.setItem('auth_token', 'pw-token')
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1, email: 'test@example.com', display_name: 'Test' })
      })

      const auth = await loadUseAuth()
      mockFetch.mockClear()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      const result = await auth.changePassword('oldpass', 'newpass')

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
  })

  describe('deleteAccount', () => {
    it('should clear auth on success', async () => {
      localStorage.setItem('auth_token', 'delete-token')
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1, email: 'test@example.com', display_name: 'Test' })
      })

      const auth = await loadUseAuth()
      mockFetch.mockClear()

      mockFetch.mockResolvedValueOnce({ ok: true })

      const result = await auth.deleteAccount('mypassword')

      expect(result.success).toBe(true)
      expect(auth.token.value).toBeNull()
      expect(auth.isAuthenticated.value).toBe(false)
      expect(localStorage.getItem('auth_token')).toBeNull()
    })
  })

  describe('getSessions', () => {
    it('should return sessions array', async () => {
      localStorage.setItem('auth_token', 'sessions-token')
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1, email: 'test@example.com', display_name: 'Test' })
      })

      const auth = await loadUseAuth()
      mockFetch.mockClear()

      const sessionsData = [
        { id: 1, user_id: 1, device_name: 'Chrome', token: 'tok1', expires_at: '', created_at: '', last_used_at: '' },
        { id: 2, user_id: 1, device_name: 'Firefox', token: 'tok2', expires_at: '', created_at: '', last_used_at: '' }
      ]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => sessionsData
      })

      const sessions = await auth.getSessions()

      expect(sessions).toHaveLength(2)
      expect(sessions[0].device_name).toBe('Chrome')
      expect(sessions[1].device_name).toBe('Firefox')
    })

    it('should return empty array when no token', async () => {
      // No token in localStorage, so no auth
      const auth = await loadUseAuth()

      const sessions = await auth.getSessions()

      expect(sessions).toEqual([])
    })
  })

  describe('logoutSession', () => {
    it('should send DELETE to /auth/sessions/:id', async () => {
      localStorage.setItem('auth_token', 'session-token')
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1, email: 'test@example.com', display_name: 'Test' })
      })

      const auth = await loadUseAuth()
      mockFetch.mockClear()

      mockFetch.mockResolvedValueOnce({ ok: true })

      const result = await auth.logoutSession(42)

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
      localStorage.setItem('auth_token', 'all-session-token')
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1, email: 'test@example.com', display_name: 'Test' })
      })

      const auth = await loadUseAuth()
      mockFetch.mockClear()

      mockFetch.mockResolvedValueOnce({ ok: true })

      const result = await auth.logoutAll()

      const deleteAllCall = mockFetch.mock.calls.find(
        (call: any[]) => call[0] === '/api/auth/sessions' && call[1]?.method === 'DELETE'
      )
      expect(deleteAllCall).toBeDefined()
      expect(result.success).toBe(true)
      expect(auth.token.value).toBeNull()
      expect(auth.isAuthenticated.value).toBe(false)
    })
  })

  describe('fetchWithAuth', () => {
    it('should add Bearer header when token exists', async () => {
      localStorage.setItem('auth_token', 'bearer-token')
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1, email: 'test@example.com', display_name: 'Test' })
      })

      const auth = await loadUseAuth()
      mockFetch.mockClear()

      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) })

      await auth.fetchWithAuth('/api/some-endpoint', { method: 'GET' })

      const fetchCall = mockFetch.mock.calls.find(
        (call: any[]) => call[0] === '/api/some-endpoint'
      )
      expect(fetchCall).toBeDefined()
      expect(fetchCall![1].headers['Authorization']).toBe('Bearer bearer-token')
    })
  })
})
