<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { messagesRepository } from '../../repositories/messages.repository'
import type { Conversation } from '../../repositories/types/messages.types'
import ConversationList from '../messages/ConversationList.vue'
import MessageThread from '../messages/MessageThread.vue'

const { isAuthenticated } = useAuth()

const conversations = ref<Conversation[]>([])
const selectedConversation = ref<Conversation | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Load conversations
const loadConversations = async () => {
  if (!isAuthenticated.value) return

  loading.value = true
  error.value = null

  try {
    const result = await messagesRepository.getConversations()
    conversations.value = result.conversations
  } catch (err) {
    console.error('Failed to load conversations:', err)
    error.value = 'Failed to load conversations'
  } finally {
    loading.value = false
  }
}

// Select a conversation
const selectConversation = (conversation: Conversation) => {
  selectedConversation.value = conversation
}

// Create new conversation
const createConversation = async (userId: number) => {
  try {
    const result = await messagesRepository.createConversation({ userId })
    const newConversation = result.conversation

    // Add to conversations list if not already there
    const existingIndex = conversations.value.findIndex(c => c.id === newConversation.id)
    if (existingIndex === -1) {
      conversations.value.unshift(newConversation)
    }

    // Select the new conversation
    selectedConversation.value = newConversation
  } catch (err) {
    console.error('Failed to create conversation:', err)
    throw err
  }
}

// Refresh conversations (e.g., after sending a message)
const refreshConversations = async () => {
  await loadConversations()
}

// Load on mount
onMounted(() => {
  if (isAuthenticated.value) {
    loadConversations()
  }
})

// Show login prompt if not authenticated
const showLoginPrompt = computed(() => !isAuthenticated.value)
</script>

<template>
  <div class="messages-page">
    <div v-if="showLoginPrompt" class="login-prompt">
      <h1>Messages</h1>
      <p>Please log in to send and receive messages.</p>
      <router-link to="/auth" class="login-button">Log In</router-link>
    </div>

    <div v-else class="messages-container">
      <ConversationList
        :conversations="conversations"
        :selected-conversation="selectedConversation"
        :loading="loading"
        :error="error"
        @select="selectConversation"
        @create="createConversation"
        @refresh="refreshConversations"
      />

      <MessageThread
        v-if="selectedConversation"
        :conversation="selectedConversation"
        @refresh="refreshConversations"
      />

      <div v-else class="no-conversation-selected">
        <p>Select a conversation or create a new one to start messaging.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.messages-page {
  width: 100%;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  text-align: center;
}

.login-prompt h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.login-prompt p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.login-button {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: var(--accent-primary);
  color: var(--text-on-accent);
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.messages-container {
  display: grid;
  grid-template-columns: 350px 1fr;
  height: calc(100vh - 60px);
  gap: 1px;
  background: var(--border-color);
}

.no-conversation-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .messages-container {
    grid-template-columns: 1fr;
  }

  .messages-container :deep(.conversation-list) {
    display: block;
  }

  .messages-container :deep(.message-thread) {
    display: none;
  }

  .messages-container.has-conversation :deep(.conversation-list) {
    display: none;
  }

  .messages-container.has-conversation :deep(.message-thread) {
    display: flex;
  }
}
</style>
