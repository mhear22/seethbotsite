/**
 * Auth Composable
 *
 * Thin wrapper around useAuthStore Pinia store.
 * Provides backward compatibility while delegating to the centralized store.
 * @deprecated Prefer using useAuthStore directly for new code
 */

import { computed } from 'vue'
import { useAuthStore } from '../stores/useAuthStore'

// Export composable that wraps the store
export function useAuth() {
  const authStore = useAuthStore()

  return {
    // State (computed refs from store)
    user: computed(() => authStore.user),
    token: computed(() => authStore.token),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    loading: computed(() => authStore.loading),
    error: computed(() => authStore.error),
    sessions: computed(() => authStore.sessions),

    // Actions (delegated to store)
    init: authStore.init,
    validateToken: authStore.validateToken,
    refreshToken: authStore.refreshToken,
    register: authStore.register,
    login: authStore.login,
    logout: authStore.logout,
    updateProfile: authStore.updateProfile,
    changePassword: authStore.changePassword,
    deleteAccount: authStore.deleteAccount,
    getSessions: authStore.getSessions,
    logoutSession: authStore.logoutSession,
    logoutAll: authStore.logoutAll,
    loadSettings: authStore.loadSettings,
    saveSettings: authStore.saveSettings,
    clearAuth: authStore.clearAuth,
    fetchWithAuth: authStore.fetchWithAuth
  }
}

// Re-export types for convenience
export type { User, Session } from '../stores/useAuthStore'
