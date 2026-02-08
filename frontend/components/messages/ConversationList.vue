<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Conversation } from '../../repositories/types/messages.types'
import { messagesRepository } from '../../repositories/messages.repository'
import { formatTimeAgo } from '../../utils/format'

interface Props {
  conversations: Conversation[]
  selectedConversation: Conversation | null
  loading: boolean
  error: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [conversation: Conversation]
  create: [userId: number]
  refresh: []
}>()

const showCreateModal = ref(false)
const newUserId = ref('')
const createError = ref<string | null>(null)
const creating = ref(false)

// Get other participant's display name
const getDisplayName = (conversation: Conversation) => {
  // For direct messages, get the other user's display name
  if (conversation.type === 'direct') {
    const otherUser = conversation.participants.find(p => p.user_id !== getCurrentUserId())
    return otherUser?.display_name || otherUser?.email || 'Unknown'
  }
  return 'Group Chat'
}

// Get current user ID from localStorage
const getCurrentUserId = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user).id : 0
}

// Handle creating conversation
const handleCreateConversation = async () => {
  const userId = parseInt(newUserId.value)

  if (isNaN(userId) || userId <= 0) {
    createError.value = 'Please enter a valid user ID'
    return
  }

  createError.value = null
  creating.value = true

  try {
    await emit('create', userId)
    showCreateModal.value = false
    newUserId.value = ''
  } catch (err) {
    createError.value = 'Failed to create conversation. User may not exist.'
    console.error(err)
  } finally {
    creating.value = false
  }
}

// Get avatar URL or default
const getAvatarUrl = (conversation: Conversation) => {
  const otherUser = conversation.participants.find(p => p.user_id !== getCurrentUserId())
  return otherUser?.avatar_url || '/default-avatar.png'
}

// Truncate last message
const truncateMessage = (content: string, maxLength = 50) => {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}
</script>

<template>
  <div class="conversation-list">
    <div class="conversation-header">
      <h2>Messages</h2>
      <button @click="showCreateModal = true" class="create-button" title="New conversation">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <p>Loading conversations...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="emit('refresh')" class="retry-button">Retry</button>
    </div>

    <div v-else-if="conversations.length === 0" class="empty-state">
      <p>No conversations yet</p>
      <p class="hint">Create a new conversation to start messaging</p>
    </div>

    <div v-else class="conversations-scroll">
      <div
        v-for="conversation in conversations"
        :key="conversation.id"
        :class="['conversation-item', { active: selectedConversation?.id === conversation.id }]"
        @click="emit('select', conversation)"
      >
        <div class="conversation-avatar">
          <img :src="getAvatarUrl(conversation)" :alt="getDisplayName(conversation)" />
          <div v-if="conversation.unread_count > 0" class="unread-badge">
            {{ conversation.unread_count > 9 ? '9+' : conversation.unread_count }}
          </div>
        </div>

        <div class="conversation-content">
          <div class="conversation-header-row">
            <span class="conversation-name">{{ getDisplayName(conversation) }}</span>
            <span class="conversation-time">{{ formatTimeAgo(conversation.updated_at) }}</span>
          </div>

          <div class="conversation-preview">
            <span v-if="conversation.last_message" class="message-preview">
              {{ truncateMessage(conversation.last_message.content) }}
            </span>
            <span v-else class="message-preview empty">No messages yet</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Conversation Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>New Conversation</h3>
          <button @click="showCreateModal = false" class="close-button">&times;</button>
        </div>

        <div class="modal-body">
          <label for="userId">User ID</label>
          <input
            id="userId"
            v-model="newUserId"
            type="number"
            placeholder="Enter user ID"
            @keyup.enter="handleCreateConversation"
          />

          <p v-if="createError" class="error">{{ createError }}</p>
        </div>

        <div class="modal-footer">
          <button @click="showCreateModal = false" class="cancel-button" :disabled="creating">
            Cancel
          </button>
          <button @click="handleCreateConversation" class="submit-button" :disabled="creating">
            {{ creating ? 'Creating...' : 'Create' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.conversation-list {
  background: var(--bg-secondary);
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.conversation-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.create-button {
  background: var(--accent-primary);
  color: var(--text-on-accent);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.create-button:hover {
  background: var(--accent-hover);
}

.loading-state,
.error-state,
.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: var(--accent-primary);
  color: var(--text-on-accent);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

.hint {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.conversations-scroll {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  padding: 1rem;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s;
}

.conversation-item:hover {
  background: var(--bg-hover);
}

.conversation-item.active {
  background: var(--bg-active);
  border-left: 3px solid var(--accent-primary);
}

.conversation-avatar {
  position: relative;
  margin-right: 1rem;
}

.conversation-avatar img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--bg-tertiary);
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--accent-primary);
  color: var(--text-on-accent);
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0 4px;
}

.conversation-content {
  flex: 1;
  min-width: 0;
}

.conversation-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.conversation-name {
  font-weight: 600;
  font-size: 0.9375rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  margin-left: 0.5rem;
}

.message-preview {
  font-size: 0.875rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-preview.empty {
  font-style: italic;
  color: var(--text-tertiary);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  width: 32px;
  height: 32px;
}

.close-button:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: 1rem;
}

.modal-body label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.modal-body input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
}

.modal-body input:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.error {
  color: #e74c3c;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

.cancel-button,
.submit-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-button {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: none;
}

.cancel-button:hover:not(:disabled) {
  background: var(--border-color);
}

.submit-button {
  background: var(--accent-primary);
  color: var(--text-on-accent);
  border: none;
}

.submit-button:hover:not(:disabled) {
  background: var(--accent-hover);
}

.submit-button:disabled,
.cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
