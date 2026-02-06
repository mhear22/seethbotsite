<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { messagesRepository } from '../../repositories/messages.repository'
import type { Conversation, MessageWithSender } from '../../repositories/types/messages.types'
import { messagesRepository as repo } from '../../repositories/messages.repository'

interface Props {
  conversation: Conversation
}

const props = defineProps<Props>()

const emit = defineEmits<{
  refresh: []
}>()

const messages = ref<MessageWithSender[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref<string | null>(null)
const newMessageContent = ref('')
const sending = ref(false)
const editingMessage = ref<MessageWithSender | null>(null)
const editContent = ref('')

// Load messages for the conversation
const loadMessages = async () => {
  loading.value = true
  error.value = null

  try {
    const result = await repo.getMessages({ conversationId: props.conversation.id })
    messages.value = result.messages
    scrollToBottom()

    // Mark as read
    await repo.markConversationAsRead(props.conversation.id)
  } catch (err) {
    console.error('Failed to load messages:', err)
    error.value = 'Failed to load messages'
  } finally {
    loading.value = false
  }
}

// Send a new message
const sendMessage = async () => {
  const content = newMessageContent.value.trim()

  if (!content) return

  sending.value = true
  error.value = null

  try {
    await repo.sendMessage({
      conversationId: props.conversation.id,
      content
    })

    newMessageContent.value = ''
    await loadMessages()
    emit('refresh')
  } catch (err) {
    console.error('Failed to send message:', err)
    error.value = 'Failed to send message'
  } finally {
    sending.value = false
  }
}

// Edit a message
const editMessage = async () => {
  if (!editingMessage.value) return

  const content = editContent.value.trim()

  if (!content) return

  sending.value = true
  error.value = null

  try {
    await repo.editMessage(editingMessage.value.id, { content })
    editingMessage.value = null
    editContent.value = ''
    await loadMessages()
  } catch (err) {
    console.error('Failed to edit message:', err)
    error.value = 'Failed to edit message'
  } finally {
    sending.value = false
  }
}

// Start editing a message
const startEditing = (message: MessageWithSender) => {
  editingMessage.value = message
  editContent.value = message.content
}

// Cancel editing
const cancelEditing = () => {
  editingMessage.value = null
  editContent.value = ''
}

// Delete a message
const deleteMessage = async (message: MessageWithSender) => {
  if (!confirm('Are you sure you want to delete this message?')) return

  try {
    await repo.deleteMessage(message.id)
    await loadMessages()
    emit('refresh')
  } catch (err) {
    console.error('Failed to delete message:', err)
    error.value = 'Failed to delete message'
  }
}

// Get current user ID
const getCurrentUserId = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user).id : 0
}

// Check if message is from current user
const isOwnMessage = (message: MessageWithSender) => {
  return message.sender_id === getCurrentUserId()
}

// Format timestamp
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp)
  const today = new Date()

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

// Check if date separator is needed
const needsDateSeparator = (index: number) => {
  if (index === 0) return true

  const current = new Date(messages.value[index].created_at)
  const previous = new Date(messages.value[index - 1].created_at)

  return current.toDateString() !== previous.toDateString()
}

// Scroll to bottom of messages
const messagesContainer = ref<HTMLElement | null>(null)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Watch for conversation changes
watch(() => props.conversation.id, () => {
  loadMessages()
})

// Load on mount
onMounted(() => {
  loadMessages()
})
</script>

<template>
  <div class="message-thread">
    <div class="thread-header">
      <div class="header-info">
        <h2>{{ conversation.type === 'direct' ? 'Direct Message' : 'Group Chat' }}</h2>
        <p class="participants">
          {{ conversation.participants.map(p => p.display_name || p.email).join(', ') }}
        </p>
      </div>
    </div>

    <div ref="messagesContainer" class="messages-container">
      <div v-if="loading" class="loading-state">
        <p>Loading messages...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="loadMessages" class="retry-button">Retry</button>
      </div>

      <div v-else-if="messages.length === 0" class="empty-state">
        <p>No messages yet</p>
        <p class="hint">Send a message to start the conversation</p>
      </div>

      <div v-else class="messages-list">
        <div v-for="(message, index) in messages" :key="message.id">
          <!-- Date separator -->
          <div v-if="needsDateSeparator(index)" class="date-separator">
            <span>{{ formatDate(message.created_at) }}</span>
          </div>

          <!-- Editing mode -->
          <div v-if="editingMessage?.id === message.id" class="message-row editing">
            <div class="message-content edit-mode">
              <textarea
                v-model="editContent"
                rows="3"
                maxlength="5000"
                placeholder="Edit your message..."
              />
              <div class="edit-actions">
                <button @click="cancelEditing" class="cancel-button" :disabled="sending">
                  Cancel
                </button>
                <button @click="editMessage" class="save-button" :disabled="sending">
                  {{ sending ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Normal message -->
          <div v-else :class="['message-row', { own: isOwnMessage(message) }]">
            <div class="message-bubble">
              <div v-if="!isOwnMessage(message)" class="sender-name">
                {{ message.sender_display_name || message.sender_email }}
              </div>

              <div class="message-text">{{ message.content }}</div>

              <div class="message-meta">
                <span class="message-time">{{ formatTime(message.created_at) }}</span>

                <div v-if="isOwnMessage(message)" class="message-actions">
                  <button @click="startEditing(message)" class="action-button edit" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button @click="deleteMessage(message)" class="action-button delete" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message input -->
    <div class="message-input">
      <textarea
        v-model="newMessageContent"
        placeholder="Type a message..."
        rows="1"
        maxlength="5000"
        @keydown.enter.exact.prevent="sendMessage"
        @keydown.enter.shift="newMessageContent += '\n'"
      />

      <div class="input-actions">
        <span class="char-count">{{ newMessageContent.length }} / 5000</span>
        <button
          @click="sendMessage"
          class="send-button"
          :disabled="!newMessageContent.trim() || sending"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-thread {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
}

.thread-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.header-info h2 {
  margin: 0;
  font-size: 1.125rem;
}

.participants {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--text-secondary);
  text-align: center;
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

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-separator {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

.date-separator span {
  background: var(--bg-tertiary);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.message-row {
  display: flex;
  margin-bottom: 0.25rem;
}

.message-row.own {
  justify-content: flex-end;
}

.message-row.editing {
  justify-content: center;
}

.message-bubble {
  max-width: 70%;
  padding: 0.75rem;
  border-radius: 1rem;
  background: var(--bg-tertiary);
}

.message-row.own .message-bubble {
  background: var(--accent-primary);
  color: var(--text-on-accent);
}

.sender-name {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--text-secondary);
}

.message-row.own .sender-name {
  display: none;
}

.message-text {
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.4;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.25rem;
  gap: 0.5rem;
}

.message-time {
  font-size: 0.6875rem;
  opacity: 0.7;
}

.message-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.message-bubble:hover .message-actions {
  opacity: 1;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.action-button:hover {
  opacity: 1;
}

.message-row.own .action-button {
  color: var(--text-on-accent);
}

.edit-mode textarea {
  width: 100%;
  min-height: 60px;
  max-height: 200px;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
}

.edit-mode textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.cancel-button,
.save-button {
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

.save-button {
  background: var(--accent-primary);
  color: var(--text-on-accent);
  border: none;
}

.save-button:hover:not(:disabled) {
  background: var(--accent-hover);
}

.cancel-button:disabled,
.save-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Message input */
.message-input {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.message-input textarea {
  width: 100%;
  min-height: 44px;
  max-height: 120px;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.9375rem;
  resize: none;
  overflow-y: auto;
}

.message-input textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.message-input textarea::placeholder {
  color: var(--text-tertiary);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.char-count {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.send-button {
  background: var(--accent-primary);
  color: var(--text-on-accent);
  border: none;
  border-radius: 0.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.send-button:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.send-button:active:not(:disabled) {
  transform: translateY(0);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .message-bubble {
    max-width: 85%;
  }
}
</style>
