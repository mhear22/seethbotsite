import { prisma } from '../lib/prisma';

/**
 * Reaction interface
 */
export interface Reaction {
  id: number;
  user_id: number;
  target_type: string;
  target_id: string;
  emoji: string;
  created_at: Date;
}

/**
 * Aggregated reaction count interface
 */
export interface ReactionCount {
  emoji: string;
  count: number;
  user_ids: number[];
}

/**
 * Add or remove a reaction
 * If user already reacted with this emoji, it removes the reaction (toggle)
 * Otherwise, it adds the reaction
 */
export async function toggleReaction(
  userId: number,
  targetType: 'message' | 'post' | 'comment',
  targetId: string,
  emoji: string
): Promise<{ added: boolean; removed: boolean }> {
  // Check if reaction already exists
  const existingReaction = await prisma.reaction.findFirst({
    where: {
      user_id: userId,
      target_type: targetType,
      target_id: targetId,
      emoji: emoji
    }
  });

  if (existingReaction) {
    // Remove reaction (toggle off)
    await prisma.reaction.delete({
      where: { id: existingReaction.id }
    });
    return { added: false, removed: true };
  } else {
    // Add reaction
    await prisma.reaction.create({
      data: {
        user_id: userId,
        target_type: targetType,
        target_id: targetId,
        emoji: emoji
      }
    });
    return { added: true, removed: false };
  }
}

/**
 * Add a reaction (force add, don't toggle)
 */
export async function addReaction(
  userId: number,
  targetType: 'message' | 'post' | 'comment',
  targetId: string,
  emoji: string
): Promise<Reaction | null> {
  try {
    return prisma.reaction.create({
      data: {
        user_id: userId,
        target_type: targetType,
        target_id: targetId,
        emoji: emoji
      }
    });
  } catch (error) {
    // Reaction already exists (UNIQUE constraint)
    return null;
  }
}

/**
 * Remove a specific reaction by ID
 */
export async function removeReactionById(reactionId: number, userId: number): Promise<boolean> {
  const reaction = await prisma.reaction.findUnique({
    where: { id: reactionId }
  });

  if (!reaction || reaction.user_id !== userId) {
    return false;
  }

  await prisma.reaction.delete({
    where: { id: reactionId }
  });

  return true;
}

/**
 * Remove a reaction by user, target, and emoji
 */
export async function removeReaction(
  userId: number,
  targetType: 'message' | 'post' | 'comment',
  targetId: string,
  emoji: string
): Promise<boolean> {
  const result = await prisma.reaction.deleteMany({
    where: {
      user_id: userId,
      target_type: targetType,
      target_id: targetId,
      emoji: emoji
    }
  });

  return result.count > 0;
}

/**
 * Get all reactions for a target
 */
export async function getReactionsForTarget(
  targetType: 'message' | 'post' | 'comment',
  targetId: string
): Promise<Reaction[]> {
  return prisma.reaction.findMany({
    where: {
      target_type: targetType,
      target_id: targetId
    },
    orderBy: { created_at: 'asc' }
  });
}

/**
 * Get aggregated reaction counts for a target
 * Returns array of { emoji, count, user_ids }
 */
export async function getReactionCountsForTarget(
  targetType: 'message' | 'post' | 'comment',
  targetId: string
): Promise<ReactionCount[]> {
  const reactions = await prisma.reaction.findMany({
    where: {
      target_type: targetType,
      target_id: targetId
    },
    select: {
      emoji: true,
      user_id: true
    }
  });

  // Aggregate by emoji
  const counts = new Map<string, { count: number; user_ids: number[] }>();

  for (const reaction of reactions) {
    const existing = counts.get(reaction.emoji);
    if (existing) {
      existing.count++;
      existing.user_ids.push(reaction.user_id);
    } else {
      counts.set(reaction.emoji, {
        count: 1,
        user_ids: [reaction.user_id]
      });
    }
  }

  // Convert to array and sort by count
  return Array.from(counts.entries())
    .map(([emoji, data]) => ({
      emoji,
      count: data.count,
      user_ids: data.user_ids
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Check if a user has reacted to a target with a specific emoji
 */
export async function hasUserReacted(
  userId: number,
  targetType: 'message' | 'post' | 'comment',
  targetId: string,
  emoji: string
): Promise<boolean> {
  const count = await prisma.reaction.count({
    where: {
      user_id: userId,
      target_type: targetType,
      target_id: targetId,
      emoji: emoji
    }
  });

  return count > 0;
}

/**
 * Get all reactions by a user
 */
export async function getReactionsByUser(userId: number): Promise<Reaction[]> {
  return prisma.reaction.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' }
  });
}
