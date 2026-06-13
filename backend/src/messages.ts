import prisma from './lib/prisma';

/**
 * Conversation interface
 */
export interface Conversation {
  id: number;
  type: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Conversation participant interface
 */
export interface ConversationParticipant {
  id: number;
  conversation_id: number;
  user_id: number;
  joined_at: Date;
  last_read_at: Date | null;
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
  created_at: Date;
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
    created_at: Date;
  };
  unread_count: number;
}

/**
 * Create a new direct message conversation between two users
 */
export async function createDirectConversation(user1Id: number, user2Id: number): Promise<Conversation> {
  // Check if a direct conversation already exists between these users
  const existingParticipant = await prisma.conversationParticipant.findFirst({
    where: {
      user_id: user1Id,
      conversation: {
        type: 'direct',
        participants: {
          some: {
            user_id: user2Id,
          },
        },
      },
    },
    include: {
      conversation: true,
    },
  });

  if (existingParticipant) {
    return existingParticipant.conversation;
  }

  // Create new conversation with participants in a transaction
  const conversation = await prisma.conversation.create({
    data: {
      type: 'direct',
      participants: {
        create: [{ user_id: user1Id }, { user_id: user2Id }],
      },
    },
  });

  return conversation;
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: number): Promise<ConversationWithDetails[]> {
  const participations = await prisma.conversationParticipant.findMany({
    where: {
      user_id: userId,
    },
    include: {
      conversation: {
        include: {
          participants: {
            include: {
              // Assuming there's a User relation on ConversationParticipant
              // but since the schema doesn't show it, we need to fetch users separately
            },
          },
          messages: {
            where: {
              is_deleted: false,
            },
            orderBy: {
              created_at: 'desc',
            },
            take: 1,
          },
        },
      },
    },
    orderBy: {
      conversation: {
        updated_at: 'desc',
      },
    },
  });

  // Get all unique user IDs from conversations to batch fetch user data
  const userIds = new Set<number>();
  participations.forEach((p) => {
    p.conversation.participants.forEach((participant) => {
      userIds.add(participant.user_id);
    });
  });

  // Batch fetch users
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: Array.from(userIds),
      },
    },
    select: {
      id: true,
      email: true,
      display_name: true,
      avatar_url: true,
    },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  // Compute unread counts for all conversations in parallel so the per-conversation
  // count queries pipeline instead of running sequentially. Each query keeps its own
  // per-conversation last_read_at cutoff to preserve exact filtering.
  const unreadCounts = await Promise.all(
    participations.map((participation) =>
      prisma.message.count({
        where: {
          conversation_id: participation.conversation.id,
          sender_id: {
            not: userId,
          },
          is_deleted: false,
          created_at: {
            gt: participation.last_read_at ?? new Date(0),
          },
        },
      })
    )
  );

  const results: ConversationWithDetails[] = [];

  for (let i = 0; i < participations.length; i++) {
    const participation = participations[i];
    const conv = participation.conversation;

    // Build participants array with user info
    const participants = conv.participants.map((p) => {
      const user = userMap.get(p.user_id);
      return {
        user_id: p.user_id,
        display_name: user?.display_name ?? null,
        avatar_url: user?.avatar_url ?? null,
        email: user?.email ?? '',
      };
    });

    // Get last message
    const lastMessage = conv.messages[0];

    // Get unread count (computed in parallel above)
    const unreadCount = unreadCounts[i];

    results.push({
      id: conv.id,
      type: conv.type,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      participants,
      last_message: lastMessage
        ? {
            id: lastMessage.id,
            content: lastMessage.content,
            sender_id: lastMessage.sender_id,
            created_at: lastMessage.created_at,
          }
        : undefined,
      unread_count: unreadCount,
    });
  }

  return results;
}

/**
 * Get messages in a conversation
 */
export async function getConversationMessages(
  conversationId: number,
  userId: number,
  limit: number = 50,
  offset: number = 0
): Promise<MessageWithSender[]> {
  // Verify user is in the conversation
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversation_id_user_id: {
        conversation_id: conversationId,
        user_id: userId,
      },
    },
  });

  if (!participant) {
    throw new Error('User is not a participant in this conversation');
  }

  // Update conversation updated_at timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updated_at: new Date() },
  });

  // Get messages with sender info
  const messages = await prisma.message.findMany({
    where: {
      conversation_id: conversationId,
      is_deleted: false,
    },
    include: {
      user: {
        select: {
          email: true,
          display_name: true,
          avatar_url: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
    take: limit,
    skip: offset,
  });

  // Transform to MessageWithSender format and reverse for chronological order
  return messages.reverse().map((msg) => ({
    id: msg.id,
    conversation_id: msg.conversation_id,
    sender_id: msg.sender_id,
    content: msg.content,
    is_deleted: msg.is_deleted,
    created_at: msg.created_at,
    sender_email: msg.user.email,
    sender_display_name: msg.user.display_name,
    sender_avatar_url: msg.user.avatar_url,
  }));
}

/**
 * Send a message to a conversation
 */
export async function sendMessage(conversationId: number, senderId: number, content: string): Promise<Message> {
  if (!content || content.trim().length === 0) {
    throw new Error('Message content cannot be empty');
  }

  if (content.length > 5000) {
    throw new Error('Message content too long (max 5000 characters)');
  }

  // Verify user is in the conversation
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversation_id_user_id: {
        conversation_id: conversationId,
        user_id: senderId,
      },
    },
  });

  if (!participant) {
    throw new Error('User is not a participant in this conversation');
  }

  // Create message and update conversation timestamp in a transaction
  const message = await prisma.$transaction(async (tx) => {
    const newMessage = await tx.message.create({
      data: {
        conversation_id: conversationId,
        sender_id: senderId,
        content: content.trim(),
      },
    });

    await tx.conversation.update({
      where: { id: conversationId },
      data: { updated_at: new Date() },
    });

    return newMessage;
  });

  return message;
}

/**
 * Edit a message
 */
export async function editMessage(messageId: number, userId: number, content: string): Promise<Message> {
  if (!content || content.trim().length === 0) {
    throw new Error('Message content cannot be empty');
  }

  if (content.length > 5000) {
    throw new Error('Message content too long (max 5000 characters)');
  }

  // Get the message
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

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
  const updatedMessage = await prisma.message.update({
    where: { id: messageId },
    data: { content: content.trim() },
  });

  return updatedMessage;
}

/**
 * Delete a message (soft delete)
 */
export async function deleteMessage(messageId: number, userId: number): Promise<void> {
  // Get the message
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new Error('Message not found');
  }

  if (message.sender_id !== userId) {
    throw new Error('User is not the sender of this message');
  }

  // Soft delete
  await prisma.message.update({
    where: { id: messageId },
    data: { is_deleted: true },
  });
}

/**
 * Mark a conversation as read for a user
 */
export async function markConversationAsRead(conversationId: number, userId: number): Promise<void> {
  // Verify user is in the conversation
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversation_id_user_id: {
        conversation_id: conversationId,
        user_id: userId,
      },
    },
  });

  if (!participant) {
    throw new Error('User is not a participant in this conversation');
  }

  // Update last_read_at
  await prisma.conversationParticipant.update({
    where: {
      conversation_id_user_id: {
        conversation_id: conversationId,
        user_id: userId,
      },
    },
    data: { last_read_at: new Date() },
  });
}

/**
 * Get a single conversation by ID with details
 */
export async function getConversation(conversationId: number, userId: number): Promise<ConversationWithDetails | null> {
  // Verify user is in the conversation
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversation_id_user_id: {
        conversation_id: conversationId,
        user_id: userId,
      },
    },
  });

  if (!participant) {
    return null;
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: true,
      messages: {
        where: {
          is_deleted: false,
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 1,
      },
    },
  });

  if (!conversation) {
    return null;
  }

  // Fetch user data for all participants
  const userIds = conversation.participants.map((p) => p.user_id);
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      id: true,
      email: true,
      display_name: true,
      avatar_url: true,
    },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  // Build participants array with user info
  const participants = conversation.participants.map((p) => {
    const user = userMap.get(p.user_id);
    return {
      user_id: p.user_id,
      display_name: user?.display_name ?? null,
      avatar_url: user?.avatar_url ?? null,
      email: user?.email ?? '',
    };
  });

  // Get last message
  const lastMessage = conversation.messages[0];

  // Get unread count
  const unreadCount = await prisma.message.count({
    where: {
      conversation_id: conversationId,
      sender_id: {
        not: userId,
      },
      is_deleted: false,
      created_at: {
        gt: participant.last_read_at ?? new Date(0),
      },
    },
  });

  return {
    id: conversation.id,
    type: conversation.type,
    created_at: conversation.created_at,
    updated_at: conversation.updated_at,
    participants,
    last_message: lastMessage
      ? {
          id: lastMessage.id,
          content: lastMessage.content,
          sender_id: lastMessage.sender_id,
          created_at: lastMessage.created_at,
        }
      : undefined,
    unread_count: unreadCount,
  };
}
