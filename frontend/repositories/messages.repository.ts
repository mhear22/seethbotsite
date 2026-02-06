import apiClient from '../utils/apiClient'
import type {
  Message,
  MessageWithSender,
  Conversation,
  CreateConversationParams,
  SendMessageParams,
  EditMessageParams,
  GetMessagesParams
} from './types/messages.types'

/**
 * Get all conversations for the current user
 */
export async function getConversations(): Promise<{ conversations: Conversation[] }> {
  const response = await apiClient.get('/messages/conversations')
  return response.data
}

/**
 * Create a new direct message conversation
 */
export async function createConversation(params: CreateConversationParams): Promise<{ conversation: Conversation }> {
  const response = await apiClient.post('/messages/conversations', params)
  return response.data
}

/**
 * Get a specific conversation by ID
 */
export async function getConversation(conversationId: number): Promise<{ conversation: Conversation }> {
  const response = await apiClient.get(`/messages/conversations/${conversationId}`)
  return response.data
}

/**
 * Get messages in a conversation
 */
export async function getMessages(params: GetMessagesParams): Promise<{ messages: MessageWithSender[] }> {
  const { conversationId, limit = 50, offset = 0 } = params
  const response = await apiClient.get(`/messages/conversations/${conversationId}/messages`, {
    params: { limit, offset }
  })
  return response.data
}

/**
 * Send a message to a conversation
 */
export async function sendMessage(params: SendMessageParams): Promise<{ message: Message }> {
  const { conversationId, content } = params
  const response = await apiClient.post(`/messages/conversations/${conversationId}/messages`, { content })
  return response.data
}

/**
 * Edit a message
 */
export async function editMessage(messageId: number, params: EditMessageParams): Promise<{ message: Message }> {
  const response = await apiClient.put(`/messages/${messageId}`, params)
  return response.data
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: number): Promise<{ message: string }> {
  const response = await apiClient.delete(`/messages/${messageId}`)
  return response.data
}

/**
 * Mark a conversation as read
 */
export async function markConversationAsRead(conversationId: number): Promise<{ message: string }> {
  const response = await apiClient.post(`/messages/conversations/${conversationId}/read`)
  return response.data
}

// Export as repository object
export const messagesRepository = {
  getConversations,
  createConversation,
  getConversation,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markConversationAsRead
}
