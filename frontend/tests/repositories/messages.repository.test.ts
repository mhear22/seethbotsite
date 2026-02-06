/**
 * Tests for messages repository
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPut = vi.fn()
const mockDelete = vi.fn()
vi.mock('../../repositories/../utils/apiClient', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
    put: (...args: any[]) => mockPut(...args),
    delete: (...args: any[]) => mockDelete(...args)
  }
}))

import {
  getConversations,
  createConversation,
  getConversation,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markConversationAsRead,
  messagesRepository
} from '../../repositories/messages.repository'

describe('messagesRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getConversations', () => {
    it('should call correct endpoint', async () => {
      const mockData = { conversations: [{ id: 1, name: 'Test' }] }
      mockGet.mockResolvedValue({ data: mockData })

      const result = await getConversations()

      expect(mockGet).toHaveBeenCalledWith('/messages/conversations')
      expect(result).toEqual(mockData)
    })
  })

  describe('createConversation', () => {
    it('should send params to correct endpoint', async () => {
      const params = { participantIds: [1, 2], name: 'New Chat' }
      mockPost.mockResolvedValue({ data: { conversation: { id: 5, name: 'New Chat' } } })

      const result = await createConversation(params as any)

      expect(mockPost).toHaveBeenCalledWith('/messages/conversations', params)
      expect(result).toEqual({ conversation: { id: 5, name: 'New Chat' } })
    })
  })

  describe('getConversation', () => {
    it('should pass conversation ID in URL', async () => {
      const mockConversation = { conversation: { id: 42, name: 'Test Chat' } }
      mockGet.mockResolvedValue({ data: mockConversation })

      const result = await getConversation(42)

      expect(mockGet).toHaveBeenCalledWith('/messages/conversations/42')
      expect(result).toEqual(mockConversation)
    })
  })

  describe('getMessages', () => {
    it('should pass conversationId and pagination params', async () => {
      const mockMessages = { messages: [{ id: 1, content: 'Hello' }] }
      mockGet.mockResolvedValue({ data: mockMessages })

      const result = await getMessages({ conversationId: 10, limit: 25, offset: 5 })

      expect(mockGet).toHaveBeenCalledWith('/messages/conversations/10/messages', {
        params: { limit: 25, offset: 5 }
      })
      expect(result).toEqual(mockMessages)
    })

    it('should use default limit 50 and offset 0', async () => {
      mockGet.mockResolvedValue({ data: { messages: [] } })

      await getMessages({ conversationId: 7 } as any)

      expect(mockGet).toHaveBeenCalledWith('/messages/conversations/7/messages', {
        params: { limit: 50, offset: 0 }
      })
    })
  })

  describe('sendMessage', () => {
    it('should send content to correct URL', async () => {
      const mockMessage = { message: { id: 99, content: 'Hi there' } }
      mockPost.mockResolvedValue({ data: mockMessage })

      const result = await sendMessage({ conversationId: 10, content: 'Hi there' })

      expect(mockPost).toHaveBeenCalledWith('/messages/conversations/10/messages', {
        content: 'Hi there'
      })
      expect(result).toEqual(mockMessage)
    })
  })

  describe('editMessage', () => {
    it('should send PUT with params', async () => {
      const editParams = { content: 'Updated message' }
      mockPut.mockResolvedValue({ data: { message: { id: 5, content: 'Updated message' } } })

      const result = await editMessage(5, editParams as any)

      expect(mockPut).toHaveBeenCalledWith('/messages/5', editParams)
      expect(result).toEqual({ message: { id: 5, content: 'Updated message' } })
    })
  })

  describe('deleteMessage', () => {
    it('should send DELETE to correct endpoint', async () => {
      mockDelete.mockResolvedValue({ data: { message: 'Message deleted' } })

      const result = await deleteMessage(15)

      expect(mockDelete).toHaveBeenCalledWith('/messages/15')
      expect(result).toEqual({ message: 'Message deleted' })
    })
  })

  describe('markConversationAsRead', () => {
    it('should call correct endpoint', async () => {
      mockPost.mockResolvedValue({ data: { message: 'Marked as read' } })

      const result = await markConversationAsRead(8)

      expect(mockPost).toHaveBeenCalledWith('/messages/conversations/8/read')
      expect(result).toEqual({ message: 'Marked as read' })
    })
  })

  describe('messagesRepository object', () => {
    it('should have all methods', () => {
      expect(messagesRepository.getConversations).toBe(getConversations)
      expect(messagesRepository.createConversation).toBe(createConversation)
      expect(messagesRepository.getConversation).toBe(getConversation)
      expect(messagesRepository.getMessages).toBe(getMessages)
      expect(messagesRepository.sendMessage).toBe(sendMessage)
      expect(messagesRepository.editMessage).toBe(editMessage)
      expect(messagesRepository.deleteMessage).toBe(deleteMessage)
      expect(messagesRepository.markConversationAsRead).toBe(markConversationAsRead)
    })
  })
})
