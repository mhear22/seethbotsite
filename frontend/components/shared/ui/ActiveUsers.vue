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
  <div class="active-users-content-wrapper">
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
.active-users-content-wrapper {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0 0 12px 12px;
  overflow: hidden;
  margin-top: -2px;
}

.dark .active-users-content-wrapper {
  background: rgba(40, 44, 52, 0.95);
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
  transition: background 0.2s ease, transform 0.2s ease;
}

.user-item:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: scale(1.005);
}

.dark .user-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .user-name {
  color: #e0e0e0;
}

.user-status {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.dark .user-status {
  color: #aaa;
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
  color: #666;
  text-align: center;
}

.dark .no-users {
  color: #aaa;
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
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(245, 245, 245, 0.5);
}

.dark .panel-footer {
  border-top-color: rgba(255, 255, 255, 0.1);
  background: rgba(30, 30, 40, 0.5);
}

.you-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #666;
}

.dark .you-indicator {
  color: #aaa;
}

.you-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.you-text {
  flex: 1;
}

/* Scrollbar styling */
.users-list::-webkit-scrollbar {
  width: 6px;
}

.users-list::-webkit-scrollbar-track {
  background: transparent;
}

.users-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.users-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

.dark .users-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
}

.dark .users-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}
</style>
