export interface Message {
  id: number
  conversation_id: number
  sender_id: number
  content: string
  is_deleted: boolean
  created_at: string
}

export interface MessageWithSender extends Message {
  sender_email: string
  sender_display_name: string | null
  sender_avatar_url: string | null
}

export interface User {
  user_id: number
  display_name: string | null
  avatar_url: string | null
  email: string
}

export interface LastMessage {
  id: number
  content: string
  sender_id: number
  created_at: string
}

export interface Conversation {
  id: number
  type: 'direct' | 'group'
  created_at: string
  updated_at: string
  participants: User[]
  last_message?: LastMessage
  unread_count: number
}

export interface CreateConversationParams {
  userId: number
}

export interface SendMessageParams {
  conversationId: number
  content: string
}

export interface EditMessageParams {
  content: string
}

export interface GetMessagesParams {
  conversationId: number
  limit?: number
  offset?: number
}
