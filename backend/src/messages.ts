import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcrypt';

const DB_PATH = path.join(__dirname, '..', 'data', 'messages.db');

/**
 * Initialize the messages database
 */
export function initMessagesDB(): Database.Database {
  const db = new Database(DB_PATH);

  // Attach users database for JOIN queries
  const usersDBPath = path.join(__dirname, '..', 'data', 'users.db');
  db.exec(`ATTACH DATABASE '${usersDBPath}' AS backend_data`);

  // Create conversations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('direct', 'group')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create conversation_participants table
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversation_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_read_at DATETIME,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      UNIQUE(conversation_id, user_id)
    )
  `);

  // Create messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      is_deleted BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
    CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
  `);

  return db;
}

let dbInstance: Database.Database | null = null;

export function getMessagesDB(): Database.Database {
  if (!dbInstance) {
    dbInstance = initMessagesDB();
  }
  return dbInstance;
}

/**
 * Conversation interface
 */
export interface Conversation {
  id: number;
  type: 'direct' | 'group';
  created_at: string;
  updated_at: string;
}

/**
 * Conversation participant interface
 */
export interface ConversationParticipant {
  id: number;
  conversation_id: number;
  user_id: number;
  joined_at: string;
  last_read_at: string | null;
}

/**
 * Message interface
 */
export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  is_deleted: boolean;
  created_at: string;
}

/**
 * Extended message with sender info
 */
export interface MessageWithSender extends Message {
  sender_email: string;
  sender_display_name: string | null;
  sender_avatar_url: string | null;
}

/**
 * Extended conversation with participants and last message
 */
export interface ConversationWithDetails extends Conversation {
  participants: Array<{
    user_id: number;
    display_name: string | null;
    avatar_url: string | null;
    email: string;
  }>;
  last_message?: {
    id: number;
    content: string;
    sender_id: number;
    created_at: string;
  };
  unread_count: number;
}

/**
 * Get user ID from a JWT token
 */
function getUserIdFromToken(token: string): number | null {
  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.SEETHBOT_JWT_SECRET || 'change-this-in-production-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

/**
 * Create a new direct message conversation between two users
 */
export function createDirectConversation(user1Id: number, user2Id: number): Conversation {
  const db = getMessagesDB();

  // Check if a direct conversation already exists between these users
  const existing = db.prepare(`
    SELECT c.id
    FROM conversations c
    JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = ?
    JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = ?
    WHERE c.type = 'direct'
  `).get(user1Id, user2Id) as any;

  if (existing) {
    return db.prepare('SELECT * FROM conversations WHERE id = ?').get(existing.id) as Conversation;
  }

  // Create new conversation
  const result = db.prepare('INSERT INTO conversations (type) VALUES (?)').run('direct');
  const conversationId = result.lastInsertRowid as number;

  // Add participants
  db.prepare('INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)').run(conversationId, user1Id);
  db.prepare('INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)').run(conversationId, user2Id);

  return db.prepare('SELECT * FROM conversations WHERE id = ?').get(conversationId) as Conversation;
}

/**
 * Get all conversations for a user
 */
export function getUserConversations(userId: number): ConversationWithDetails[] {
  const db = getMessagesDB();

  const conversations = db.prepare(`
    SELECT DISTINCT c.*
    FROM conversations c
    JOIN conversation_participants cp ON c.id = cp.conversation_id
    WHERE cp.user_id = ?
    ORDER BY c.updated_at DESC
  `).all(userId) as Conversation[];

  return conversations.map(conv => {
    // Get participants
    const participants = db.prepare(`
      SELECT cp.user_id, u.display_name, u.avatar_url, u.email
      FROM conversation_participants cp
      JOIN backend_data.users u ON cp.user_id = u.id
      WHERE cp.conversation_id = ?
    `).all(conv.id) as any[];

    // Get last message
    const lastMessage = db.prepare(`
      SELECT id, content, sender_id, created_at
      FROM messages
      WHERE conversation_id = ? AND is_deleted = 0
      ORDER BY created_at DESC
      LIMIT 1
    `).get(conv.id) as any;

    // Get unread count
    const unreadResult = db.prepare(`
      SELECT COUNT(*) as count
      FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE cp.conversation_id = ?
        AND cp.user_id = ?
        AND m.sender_id != ?
        AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01')
        AND m.is_deleted = 0
    `).get(conv.id, userId, userId) as any;

    return {
      ...conv,
      participants,
      last_message: lastMessage || undefined,
      unread_count: unreadResult.count
    } as ConversationWithDetails;
  });
}

/**
 * Get messages in a conversation
 */
export function getConversationMessages(conversationId: number, userId: number, limit: number = 50, offset: number = 0): MessageWithSender[] {
  const db = getMessagesDB();

  // Verify user is in the conversation
  const participant = db.prepare('SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?')
    .get(conversationId, userId);

  if (!participant) {
    throw new Error('User is not a participant in this conversation');
  }

  // Update conversation updated_at timestamp
  db.prepare('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(conversationId);

  // Get messages with sender info
  const messages = db.prepare(`
    SELECT
      m.*,
      u.email as sender_email,
      u.display_name as sender_display_name,
      u.avatar_url as sender_avatar_url
    FROM messages m
    JOIN backend_data.users u ON m.sender_id = u.id
    WHERE m.conversation_id = ? AND m.is_deleted = 0
    ORDER BY m.created_at DESC
    LIMIT ? OFFSET ?
  `).all(conversationId, limit, offset) as MessageWithSender[];

  // Return in chronological order
  return messages.reverse();
}

/**
 * Send a message to a conversation
 */
export function sendMessage(conversationId: number, senderId: number, content: string): Message {
  const db = getMessagesDB();

  if (!content || content.trim().length === 0) {
    throw new Error('Message content cannot be empty');
  }

  if (content.length > 5000) {
    throw new Error('Message content too long (max 5000 characters)');
  }

  // Verify user is in the conversation
  const participant = db.prepare('SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?')
    .get(conversationId, senderId);

  if (!participant) {
    throw new Error('User is not a participant in this conversation');
  }

  // Insert message
  const result = db.prepare(`
    INSERT INTO messages (conversation_id, sender_id, content)
    VALUES (?, ?, ?)
  `).run(conversationId, senderId, content.trim());

  // Update conversation updated_at timestamp
  db.prepare('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(conversationId);

  return db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid) as Message;
}

/**
 * Edit a message
 */
export function editMessage(messageId: number, userId: number, content: string): Message {
  const db = getMessagesDB();

  if (!content || content.trim().length === 0) {
    throw new Error('Message content cannot be empty');
  }

  if (content.length > 5000) {
    throw new Error('Message content too long (max 5000 characters)');
  }

  // Verify user owns the message
  const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId) as Message;

  if (!message) {
    throw new Error('Message not found');
  }

  if (message.sender_id !== userId) {
    throw new Error('User is not the sender of this message');
  }

  if (message.is_deleted) {
    throw new Error('Cannot edit deleted message');
  }

  // Update message
  db.prepare('UPDATE messages SET content = ? WHERE id = ?').run(content.trim(), messageId);

  return db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId) as Message;
}

/**
 * Delete a message (soft delete)
 */
export function deleteMessage(messageId: number, userId: number): void {
  const db = getMessagesDB();

  // Verify user owns the message
  const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId) as Message;

  if (!message) {
    throw new Error('Message not found');
  }

  if (message.sender_id !== userId) {
    throw new Error('User is not the sender of this message');
  }

  // Soft delete
  db.prepare('UPDATE messages SET is_deleted = 1 WHERE id = ?').run(messageId);
}

/**
 * Mark a conversation as read for a user
 */
export function markConversationAsRead(conversationId: number, userId: number): void {
  const db = getMessagesDB();

  // Verify user is in the conversation
  const participant = db.prepare('SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?')
    .get(conversationId, userId);

  if (!participant) {
    throw new Error('User is not a participant in this conversation');
  }

  // Update last_read_at
  db.prepare(`
    UPDATE conversation_participants
    SET last_read_at = CURRENT_TIMESTAMP
    WHERE conversation_id = ? AND user_id = ?
  `).run(conversationId, userId);
}

/**
 * Get a single conversation by ID with details
 */
export function getConversation(conversationId: number, userId: number): ConversationWithDetails | null {
  const db = getMessagesDB();

  // Verify user is in the conversation
  const participant = db.prepare('SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?')
    .get(conversationId, userId);

  if (!participant) {
    return null;
  }

  const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(conversationId) as Conversation;

  // Get participants
  const participants = db.prepare(`
    SELECT cp.user_id, u.display_name, u.avatar_url, u.email
    FROM conversation_participants cp
    JOIN backend_data.users u ON cp.user_id = u.id
    WHERE cp.conversation_id = ?
  `).all(conversationId) as any[];

  // Get last message
  const lastMessage = db.prepare(`
    SELECT id, content, sender_id, created_at
    FROM messages
    WHERE conversation_id = ? AND is_deleted = 0
    ORDER BY created_at DESC
    LIMIT 1
  `).get(conversationId) as any;

  // Get unread count
  const unreadResult = db.prepare(`
    SELECT COUNT(*) as count
    FROM messages m
    JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE cp.conversation_id = ?
      AND cp.user_id = ?
      AND m.sender_id != ?
      AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01')
      AND m.is_deleted = 0
  `).get(conversationId, userId, userId) as any;

  return {
    ...conversation,
    participants,
    last_message: lastMessage || undefined,
    unread_count: unreadResult.count
  } as ConversationWithDetails;
}
