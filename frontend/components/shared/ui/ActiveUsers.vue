<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../../../stores/useAppStore'
import { useAuth } from '../../../composables/useAuth'
import { useUserId } from '../../../composables/useUserId'

interface ActiveUser {
  userId: string
  userName: string
  avatar?: string
}

interface PresenceMessage {
  type: 'presence_update' | 'user_joined' | 'user_left' | 'heartbeat'
  data?: any
}

// Props
const props = defineProps<{
  isOpen: boolean
}>()

// Emits
const emit = defineEmits<{
  toggle: []
}>()

// Store & Composables
const appStore = useAppStore()
const auth = useAuth()
const { userId } = useUserId()

// Router
const route = useRoute()

// State
const activeUsers = ref<ActiveUser[]>([])
const ws = ref<WebSocket | null>(null)
const heartbeatInterval = ref<number | null>(null)
const lastPage = ref<string>('')

// Computed
const currentUserName = computed(() => {
  // Try to get user name from auth, otherwise use 'Anonymous'
  return auth.user.value?.display_name || 'Anonymous'
})

const userAvatar = computed(() => {
  // Generate avatar based on user name if not set
  if (auth.user.value?.display_name) {
    const name = auth.user.value.display_name
    // Simple avatar generation based on name
    const emojis = ['👤', '🧑', '👩', '🧔', '👱', '🦸', '🧙', '🎭']
    const index = name.length % emojis.length
    return emojis[index]
  }
  return '👤'
})

const currentPage = computed(() => {
  // Get current page from route
  const routeName = route.path.replace(/^\//, '') || 'home'
  return routeName
})

// WebSocket URL
const getWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host

  return `${protocol}//${host}/ws?userId=${encodeURIComponent(userId.value)}&userName=${encodeURIComponent(currentUserName.value)}&avatar=${encodeURIComponent(userAvatar.value)}&page=${encodeURIComponent(currentPage.value)}`
}

// Connect to WebSocket
function connectWebSocket() {
  if (ws.value && ws.value.readyState === WebSocket.OPEN) {
    ws.value.close()
  }

  try {
    const url = getWebSocketUrl()
    ws.value = new WebSocket(url)

    ws.value.onopen = () => {
      console.log('[ActiveUsers] Connected to WebSocket')
      lastPage.value = currentPage.value
    }

    ws.value.onmessage = (event) => {
      try {
        const message: PresenceMessage = JSON.parse(event.data)
        handlePresenceMessage(message)
      } catch (error) {
        console.error('[ActiveUsers] Error parsing message:', error)
      }
    }

    ws.value.onerror = (error) => {
      console.error('[ActiveUsers] WebSocket error:', error)
    }

    ws.value.onclose = () => {
      console.log('[ActiveUsers] WebSocket closed')
      // Attempt to reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000)
    }
  } catch (error) {
    console.error('[ActiveUsers] Error connecting to WebSocket:', error)
  }
}

// Handle presence messages
function handlePresenceMessage(message: PresenceMessage) {
  switch (message.type) {
    case 'presence_update':
      if (message.data?.activeUsers) {
        activeUsers.value = message.data.activeUsers
      }
      break

    case 'user_joined':
      if (message.data) {
        const newUser: ActiveUser = {
          userId: message.data.userId,
          userName: message.data.userName,
          avatar: message.data.avatar
        }
        // Add user if not already in list
        if (!activeUsers.value.find(u => u.userId === newUser.userId)) {
          activeUsers.value = [...activeUsers.value, newUser]
        }
      }
      break

    case 'user_left':
      if (message.data) {
        activeUsers.value = activeUsers.value.filter(u => u.userId !== message.data.userId)
      }
      break
  }
}

// Send heartbeat
function sendHeartbeat() {
  if (ws.value && ws.value.readyState === WebSocket.OPEN) {
    // Check if page changed
    if (currentPage.value !== lastPage.value) {
      ws.value.send(JSON.stringify({
        type: 'heartbeat',
        data: {
          page: currentPage.value
        }
      }))
      lastPage.value = currentPage.value
    } else {
      // Regular heartbeat
      ws.value.send(JSON.stringify({
        type: 'heartbeat'
      }))
    }
  }
}

// Lifecycle
onMounted(() => {
  // Connect to WebSocket
  connectWebSocket()

  // Send heartbeat every 30 seconds
  heartbeatInterval.value = window.setInterval(sendHeartbeat, 30000)
})

onUnmounted(() => {
  // Clear heartbeat interval
  if (heartbeatInterval.value) {
    clearInterval(heartbeatInterval.value)
  }

  // Close WebSocket connection
  if (ws.value && ws.value.readyState === WebSocket.OPEN) {
    ws.value.close()
  }
})
</script>

<template>
  <div
    v-if="isOpen"
    class="active-users-panel"
  >
    <div class="panel-header">
      <span class="panel-title">Active Users</span>
      <button class="close-btn" @click="emit('toggle')">×</button>
    </div>

    <div class="users-list">
      <div
        v-for="user in activeUsers"
        :key="user.userId"
        class="user-item"
        :title="user.userName"
      >
        <div class="user-avatar">
          {{ user.avatar || '👤' }}
        </div>
        <div class="user-info">
          <div class="user-name">{{ user.userName }}</div>
          <div class="user-status online">Online</div>
        </div>
      </div>

      <div v-if="activeUsers.length === 0" class="no-users">
        <div class="no-users-icon">👻</div>
        <div class="no-users-text">No other users here</div>
      </div>
    </div>

    <div class="panel-footer">
      <div class="you-indicator">
        <span class="you-avatar">{{ userAvatar }}</span>
        <span class="you-text">You: {{ currentUserName }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.active-users-panel {
  position: fixed;
  top: 100px;
  right: 20px;
  width: 280px;
  max-height: 400px;
  background: var(--bg-secondary, #ffffff);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 1000;
  transition: transform 0.3s ease, opacity 0.3s ease;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.panel-title {
  font-weight: 600;
  font-size: 14px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.users-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  transition: background 0.2s ease;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-item:hover {
  background: var(--bg-tertiary, #f5f5f5);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  font-size: 14px;
  color: var(--text-primary, #333);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-status {
  font-size: 12px;
  color: var(--text-secondary, #666);
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-status.online::before {
  content: '';
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  display: inline-block;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.no-users {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: var(--text-secondary, #666);
  text-align: center;
}

.no-users-icon {
  font-size: 48px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.no-users-text {
  font-size: 14px;
}

.panel-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color, #e0e0e0);
  background: var(--bg-secondary, #f9f9f9);
}

.you-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-secondary, #666);
}

.you-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.you-text {
  flex: 1;
}

/* Dark mode support */
.main-app.dark .active-users-panel {
  background: #1a1a2e;
}

.main-app.dark .panel-header {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.main-app.dark .user-item:hover {
  background: #2a2a4e;
}

.main-app.dark .user-name {
  color: #e0e0e0;
}

.main-app.dark .user-status {
  color: #b0b0b0;
}

.main-app.dark .panel-footer {
  background: #151525;
  border-top-color: #2a2a4e;
}

.main-app.dark .you-indicator {
  color: #b0b0b0;
}

/* Scrollbar styling */
.users-list::-webkit-scrollbar {
  width: 6px;
}

.users-list::-webkit-scrollbar-track {
  background: transparent;
}

.users-list::-webkit-scrollbar-thumb {
  background: var(--border-color, #e0e0e0);
  border-radius: 3px;
}

.users-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary, #666);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .active-users-panel {
    top: auto;
    bottom: 80px;
    right: 10px;
    left: 10px;
    width: auto;
    max-height: 300px;
  }
}
</style>
