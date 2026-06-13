import { prisma } from '../lib/prisma';

/**
 * Favorite item interface
 */
export interface Favorite {
  id: number;
  user_id: number;
  item_type: string;
  item_id: string;
  display_name: string | null;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create favorite input interface
 */
export interface CreateFavoriteInput {
  item_type: 'page' | 'panel' | 'feature';
  item_id: string;
  display_name: string;
}

/**
 * Update favorite input interface
 */
export interface UpdateFavoriteInput {
  display_name?: string;
  order_index?: number;
}

/**
 * Get all favorites for a user, sorted by order_index
 */
export async function getFavoritesByUserId(userId: number): Promise<Favorite[]> {
  return prisma.favorite.findMany({
    where: { user_id: userId },
    orderBy: [
      { order_index: 'asc' },
      { created_at: 'asc' }
    ]
  });
}

/**
 * Get a favorite by ID
 */
export async function getFavoriteById(favoriteId: number): Promise<Favorite | null> {
  return prisma.favorite.findUnique({
    where: { id: favoriteId }
  });
}

/**
 * Add a favorite for a user
 */
export async function addFavorite(userId: number, input: CreateFavoriteInput): Promise<Favorite> {
  // Check if already favorited
  const existing = await prisma.favorite.findFirst({
    where: {
      user_id: userId,
      item_type: input.item_type,
      item_id: input.item_id
    }
  });

  if (existing) {
    throw new Error('Item already favorited');
  }

  // Get current highest order_index for this user
  const maxOrder = await prisma.favorite.findFirst({
    where: { user_id: userId },
    orderBy: { order_index: 'desc' },
    select: { order_index: true }
  });

  const orderIndex = (maxOrder?.order_index ?? -1) + 1;

  return prisma.favorite.create({
    data: {
      user_id: userId,
      item_type: input.item_type,
      item_id: input.item_id,
      display_name: input.display_name,
      order_index: orderIndex
    }
  });
}

/**
 * Remove a favorite by ID
 */
export async function removeFavorite(favoriteId: number, userId: number): Promise<boolean> {
  // Verify favorite belongs to user
  const favorite = await getFavoriteById(favoriteId);
  if (!favorite || favorite.user_id !== userId) {
    throw new Error('Favorite not found or access denied');
  }

  await prisma.favorite.delete({
    where: { id: favoriteId }
  });

  return true;
}

/**
 * Remove a favorite by item type and ID
 */
export async function removeFavoriteByItem(userId: number, itemType: string, itemId: string): Promise<boolean> {
  const result = await prisma.favorite.deleteMany({
    where: {
      user_id: userId,
      item_type: itemType,
      item_id: itemId
    }
  });

  return result.count > 0;
}

/**
 * Update a favorite
 */
export async function updateFavorite(favoriteId: number, userId: number, updates: UpdateFavoriteInput): Promise<Favorite | null> {
  // Verify favorite belongs to user
  const favorite = await getFavoriteById(favoriteId);
  if (!favorite || favorite.user_id !== userId) {
    throw new Error('Favorite not found or access denied');
  }

  return prisma.favorite.update({
    where: { id: favoriteId },
    data: {
      ...updates,
      updated_at: new Date()
    }
  });
}

/**
 * Reorder favorites for a user
 */
export async function reorderFavorites(userId: number, favoriteIds: number[]): Promise<Favorite[]> {
  // Verify all favorites belong to user
  const userFavorites = await prisma.favorite.findMany({
    where: {
      user_id: userId,
      id: { in: favoriteIds }
    }
  });

  if (userFavorites.length !== favoriteIds.length) {
    throw new Error('One or more favorites not found or access denied');
  }

  // Update order indices atomically in a single transaction
  await prisma.$transaction(
    favoriteIds.map((id, index) =>
      prisma.favorite.update({
        where: { id },
        data: { order_index: index }
      })
    )
  );

  return getFavoritesByUserId(userId);
}

/**
 * Check if an item is favorited by a user
 */
export async function isFavorited(userId: number, itemType: string, itemId: string): Promise<boolean> {
  const count = await prisma.favorite.count({
    where: {
      user_id: userId,
      item_type: itemType,
      item_id: itemId
    }
  });

  return count > 0;
}

export default {
  getFavoritesByUserId,
  getFavoriteById,
  addFavorite,
  removeFavorite,
  removeFavoriteByItem,
  updateFavorite,
  reorderFavorites,
  isFavorited
};
