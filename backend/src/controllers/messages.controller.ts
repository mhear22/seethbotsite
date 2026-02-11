import { Router, Request, Response } from 'express';
import {
  createDirectConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markConversationAsRead,
  getConversation
} from '../messages';
import { validateTokenAndGetUser } from '../users';

const router = Router();

/**
 * Helper to extract user from JWT token
 */
async function getUserFromToken(req: Request): Promise<{ user: any; session: any } | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return validateTokenAndGetUser(token);
}

/**
 * @openapi
 * /api/messages/conversations:
 *   get:
 *     tags: [Messages]
 *     summary: Get all conversations for current user
 *     description: Returns all conversations the authenticated user is participating in.
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       type:
 *                         type: string
 *                         enum: [direct, group]
 *                       created_at:
 *                         type: string
 *                       updated_at:
 *                         type: string
 *                       participants:
 *                         type: array
 *                         items:
 *                           type: object
 *                       last_message:
 *                         type: object
 *                       unread_count:
 *                         type: integer
 *       401:
 *         description: Not authenticated
 */
router.get('/messages/conversations', async (req: Request, res: Response) => {
  try {
    const result = await getUserFromToken(req);

    if (!result) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const conversations = getUserConversations(result.user.id);
    res.json({ conversations });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

/**
 * @openapi
 * /api/messages/conversations:
 *   post:
 *     tags: [Messages]
 *     summary: Create a new direct message conversation
 *     description: Creates a new direct message conversation between the authenticated user and another user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user to message
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     type:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                     updated_at:
 *                       type: string
 *       401:
 *         description: Not authenticated
 *       400:
 *         description: Invalid request
 */
router.post('/messages/conversations', async (req: Request, res: Response) => {
  try {
    const result = await getUserFromToken(req);

    if (!result) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { userId } = req.body;

    if (!userId || typeof userId !== 'number' || userId <= 0) {
      return res.status(400).json({ error: 'Valid user ID is required' });
    }

    if (userId === result.user.id) {
      return res.status(400).json({ error: 'Cannot create conversation with yourself' });
    }

    const conversation = createDirectConversation(result.user.id, userId);
    res.status(201).json({ conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

/**
 * @openapi
 * /api/messages/conversations/{id}:
 *   get:
 *     tags: [Messages]
 *     summary: Get a specific conversation
 *     description: Returns details of a specific conversation, including participants and unread count.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Conversation not found
 */
router.get('/messages/conversations/:id', async (req: Request, res: Response) => {
  try {
    const result = await getUserFromToken(req);

    if (!result) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const conversationId = parseInt(req.params.id);

    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    const conversation = getConversation(conversationId, result.user.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

/**
 * @openapi
 * /api/messages/conversations/{id}/messages:
 *   get:
 *     tags: [Messages]
 *     summary: Get messages in a conversation
 *     description: Returns paginated messages from a conversation.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Conversation not found
 */
router.get('/messages/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    const result = await getUserFromToken(req);

    if (!result) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const conversationId = parseInt(req.params.id);
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    const messages = getConversationMessages(conversationId, result.user.id, limit, offset);
    res.json({ messages });
  } catch (error: any) {
    if (error.message === 'User is not a participant in this conversation') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

/**
 * @openapi
 * /api/messages/conversations/{id}/messages:
 *   post:
 *     tags: [Messages]
 *     summary: Send a message to a conversation
 *     description: Sends a new message to the specified conversation.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 5000
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       401:
 *         description: Not authenticated
 *       400:
 *         description: Invalid request
 */
router.post('/messages/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    const result = await getUserFromToken(req);

    if (!result) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const conversationId = parseInt(req.params.id);
    const { content } = req.body;

    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const message = sendMessage(conversationId, result.user.id, content);
    res.status(201).json({ message });
  } catch (error: any) {
    if (error.message === 'User is not a participant in this conversation' ||
        error.message === 'Message content cannot be empty' ||
        error.message === 'Message content too long (max 5000 characters)') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * @openapi
 * /api/messages/{id}:
 *   put:
 *     tags: [Messages]
 *     summary: Edit a message
 *     description: Edits a message sent by the authenticated user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 5000
 *     responses:
 *       200:
 *         description: Message edited successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to edit this message
 *       404:
 *         description: Message not found
 */
router.put('/messages/:id', async (req: Request, res: Response) => {
  try {
    const result = await getUserFromToken(req);

    if (!result) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const messageId = parseInt(req.params.id);
    const { content } = req.body;

    if (isNaN(messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const message = editMessage(messageId, result.user.id, content);
    res.json({ message });
  } catch (error: any) {
    if (error.message === 'Message not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'User is not the sender of this message' ||
        error.message === 'Cannot edit deleted message') {
      return res.status(403).json({ error: error.message });
    }
    if (error.message === 'Message content cannot be empty' ||
        error.message === 'Message content too long (max 5000 characters)') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error editing message:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
});

/**
 * @openapi
 * /api/messages/{id}:
 *   delete:
 *     tags: [Messages]
 *     summary: Delete a message
 *     description: Soft-deletes a message sent by the authenticated user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to delete this message
 *       404:
 *         description: Message not found
 */
router.delete('/messages/:id', async (req: Request, res: Response) => {
  try {
    const result = await getUserFromToken(req);

    if (!result) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const messageId = parseInt(req.params.id);

    if (isNaN(messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    deleteMessage(messageId, result.user.id);
    res.json({ message: 'Message deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Message not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'User is not the sender of this message') {
      return res.status(403).json({ error: error.message });
    }
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

/**
 * @openapi
 * /api/messages/conversations/{id}/read:
 *   post:
 *     tags: [Messages]
 *     summary: Mark conversation as read
 *     description: Marks all messages in the conversation as read for the current user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conversation marked as read
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Conversation not found
 */
router.post('/messages/conversations/:id/read', async (req: Request, res: Response) => {
  try {
    const result = await getUserFromToken(req);

    if (!result) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const conversationId = parseInt(req.params.id);

    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    markConversationAsRead(conversationId, result.user.id);
    res.json({ message: 'Conversation marked as read' });
  } catch (error: any) {
    if (error.message === 'User is not a participant in this conversation') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ error: 'Failed to mark conversation as read' });
  }
});

export default router;
