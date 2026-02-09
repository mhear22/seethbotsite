<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useAuthStore } from '../../stores/useAuthStore'

const { isAuthenticated } = useAuth()
const authStore = useAuthStore()

// Local state
const discordConfigured = ref(false)
const isLinked = ref(false)
const discordUsername = ref<string | null>(null)
const discordAvatarUrl = ref<string | null>(null)
const linkingInProgress = ref(false)
const error = ref<string | null>(null)
const success = ref(false)
const avatarSyncing = ref(false)

// Check Discord configuration on mount
onMounted(async () => {
  if (!isAuthenticated.value) return

  await checkDiscordConfigured()
  await loadDiscordStatus()
})

/**
 * Check if Discord integration is configured on the backend
 */
const checkDiscordConfigured = async () => {
  try {
    const response = await fetch('/api/discord/configured')
    const data = await response.json()
    discordConfigured.value = data.configured
  } catch (err) {
    console.error('Failed to check Discord configuration:', err)
    discordConfigured.value = false
  }
}

/**
 * Load Discord link status from user data
 */
const loadDiscordStatus = async () => {
  if (!isAuthenticated.value) return

  const user = authStore.user
  if (user) {
    isLinked.value = !!user.discord_id
    discordUsername.value = user.discord_username
    discordAvatarUrl.value = user.discord_id && user.discord_avatar
      ? getDiscordAvatarUrl(user.discord_id, user.discord_avatar)
      : null
  }
}

/**
 * Get Discord avatar URL
 */
const getDiscordAvatarUrl = (userId: string, avatarHash: string): string => {
  const extension = avatarHash.startsWith('a_') ? 'gif' : 'png'
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${extension}?size=256`
}

/**
 * Start Discord OAuth flow
 */
const linkDiscord = async () => {
  if (!isAuthenticated.value || linkingInProgress.value) return

  try {
    linkingInProgress.value = true
    error.value = null

    const response = await fetch('/api/discord/link/start', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to start Discord linking')
    }

    // Redirect to Discord OAuth page
    window.location.href = data.authorizationUrl
  } catch (err: any) {
    console.error('Failed to link Discord:', err)
    error.value = err.message || 'Failed to link Discord account'
    linkingInProgress.value = false
  }
}

/**
 * Unlink Discord account
 */
const unlinkDiscord = async () => {
  if (!isAuthenticated.value) return

  try {
    error.value = null

    const response = await fetch('/api/discord/unlink', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to unlink Discord account')
    }

    // Update local state
    isLinked.value = false
    discordUsername.value = null
    discordAvatarUrl.value = null

    // Refresh user data from store
    await authStore.fetchUser()

    showSuccessMessage()
  } catch (err: any) {
    console.error('Failed to unlink Discord:', err)
    error.value = err.message || 'Failed to unlink Discord account'
  }
}

/**
 * Sync Discord avatar to profile
 */
const syncAvatar = async () => {
  if (!isAuthenticated.value || avatarSyncing.value) return

  try {
    avatarSyncing.value = true
    error.value = null

    const response = await fetch('/api/discord/sync-avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to sync Discord avatar')
    }

    // Refresh user data from store
    await authStore.fetchUser()

    showSuccessMessage()
  } catch (err: any) {
    console.error('Failed to sync Discord avatar:', err)
    error.value = err.message || 'Failed to sync Discord avatar'
  } finally {
    avatarSyncing.value = false
  }
}

/**
 * Show success message
 */
const showSuccessMessage = () => {
  success.value = true
  setTimeout(() => {
    success.value = false
  }, 2000)
}
</script>

<template>
  <div v-if="isAuthenticated" class="discord-settings">
    <h2 class="section-title">🎮 Discord Integration</h2>

    <!-- Error message -->
    <div v-if="error" class="error-message">
      ❌ {{ error }}
      <button @click="error = null" class="error-close">×</button>
    </div>

    <!-- Success message -->
    <div v-if="success" class="success-message">
      ✅ Action completed successfully!
    </div>

    <!-- Discord not configured -->
    <div v-if="!discordConfigured" class="not-configured">
      <div class="info-icon">ℹ️</div>
      <div class="info-text">
        <strong>Discord integration is not configured</strong>
        <p>Please contact the site administrator to set up Discord OAuth credentials.</p>
      </div>
    </div>

    <!-- Discord configured but not linked -->
    <div v-else-if="discordConfigured && !isLinked" class="discord-status not-linked">
      <div class="status-icon">🔗</div>
      <div class="status-content">
        <div class="status-title">Link Your Discord Account</div>
        <div class="status-desc">
          Connect your Discord account to enable avatar sync and more features.
        </div>
      </div>
      <button
        @click="linkDiscord"
        class="discord-btn"
        :disabled="linkingInProgress"
      >
        {{ linkingInProgress ? '🔄 Connecting...' : '🎮 Link Discord' }}
      </button>
    </div>

    <!-- Discord linked -->
    <div v-else-if="discordConfigured && isLinked" class="discord-status linked">
      <div class="discord-user">
        <div v-if="discordAvatarUrl" class="discord-avatar">
          <img :src="discordAvatarUrl" alt="Discord Avatar" />
        </div>
        <div class="discord-user-info">
          <div class="status-title">
            <span class="discord-icon">🎮</span>
            {{ discordUsername }}
          </div>
          <div class="status-desc">Your Discord account is linked</div>
        </div>
      </div>

      <div class="discord-actions">
        <button
          @click="syncAvatar"
          class="discord-btn sync-btn"
          :disabled="avatarSyncing"
        >
          {{ avatarSyncing ? '🔄 Syncing...' : '🖼️ Sync Avatar to Profile' }}
        </button>
        <button
          @click="unlinkDiscord"
          class="discord-btn unlink-btn"
        >
          🔓 Unlink Discord
        </button>
      </div>
    </div>

    <!-- Info section -->
    <div class="discord-info">
      <h3>📚 What can you do with Discord?</h3>
      <ul>
        <li><strong>Link your account:</strong> Connect your Discord profile to your account</li>
        <li><strong>Sync avatar:</strong> Use your Discord avatar as your profile picture</li>
        <li><strong>Easy login:</strong> Future Discord login support (coming soon)</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.discord-settings {
  width: 100%;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #ff6b9d;
}

.dark .section-title {
  color: #ffb6c1;
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #c53030;
}

.dark .error-message {
  background: rgba(229, 62, 62, 0.1);
  border-color: rgba(229, 62, 62, 0.3);
  color: #feb2b2;
}

.error-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: inherit;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.error-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

.success-message {
  background: #f0fff4;
  border: 1px solid #c6f6d5;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  color: #2f855a;
}

.dark .success-message {
  background: rgba(72, 187, 120, 0.1);
  border-color: rgba(72, 187, 120, 0.3);
  color: #9ae6b4;
}

.not-configured {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: #ebf8ff;
  border-radius: 8px;
  border-left: 4px solid #4299e1;
}

.dark .not-configured {
  background: rgba(66, 153, 225, 0.1);
  border-left-color: #4299e1;
}

.info-icon {
  font-size: 2rem;
}

.info-text strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #2b6cb0;
}

.dark .info-text strong {
  color: #90cdf4;
}

.info-text p {
  margin: 0;
  color: #4a5568;
}

.dark .info-text p {
  color: #a0aec0;
}

.discord-status {
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.not-linked {
  background: #fef5e7;
  border-left: 4px solid #f6ad55;
}

.dark .not-linked {
  background: rgba(246, 173, 85, 0.1);
}

.linked {
  background: #f0fff4;
  border-left: 4px solid #48bb78;
}

.dark .linked {
  background: rgba(72, 187, 120, 0.1);
}

.status-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.status-content {
  margin-bottom: 1rem;
}

.status-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.dark .status-title {
  color: #e2e8f0;
}

.status-desc {
  color: #718096;
}

.dark .status-desc {
  color: #a0aec0;
}

.discord-user {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.discord-avatar img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid #5865f2;
}

.discord-icon {
  margin-right: 0.5rem;
}

.discord-user-info .status-title {
  display: flex;
  align-items: center;
}

.discord-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.discord-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.discord-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.discord-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.sync-btn {
  background: #5865f2;
  color: white;
}

.sync-btn:hover:not(:disabled) {
  background: #4752c4;
}

.unlink-btn {
  background: #ed4245;
  color: white;
}

.unlink-btn:hover:not(:disabled) {
  background: #c93b3e;
}

.discord-btn:not(.sync-btn):not(.unlink-btn) {
  background: #5865f2;
  color: white;
}

.discord-btn:not(.sync-btn):not(.unlink-btn):hover:not(:disabled) {
  background: #4752c4;
}

.discord-info {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
}

.dark .discord-info {
  background: rgba(255, 255, 255, 0.05);
}

.discord-info h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: #4a5568;
}

.dark .discord-info h3 {
  color: #a0aec0;
}

.discord-info ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #718096;
}

.dark .discord-info ul {
  color: #a0aec0;
}

.discord-info li {
  margin-bottom: 0.5rem;
}

.discord-info li:last-child {
  margin-bottom: 0;
}

.discord-info strong {
  color: #2d3748;
}

.dark .discord-info strong {
  color: #e2e8f0;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .discord-user {
    flex-direction: column;
    text-align: center;
  }

  .discord-user-info .status-title {
    justify-content: center;
  }

  .discord-actions {
    flex-direction: column;
  }

  .discord-btn {
    width: 100%;
  }

  .not-configured {
    flex-direction: column;
    text-align: center;
  }
}
</style>
