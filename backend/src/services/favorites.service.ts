import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs/promises';

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'users.db');

/**
 * Favorite item interface
 */
export interface Favorite {
  id: number;
  user_id: number;
  item_type: 'page' | 'panel' | 'feature';
  item_id: string;
  display_name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
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
 * Initialize favorites database table
 */
export async function initFavoritesDB(): Promise<Database.Database> {
  const db = new Database(DB_PATH);

  // Read and execute the migration
  const migrationPath = path.join(__dirname, '..', 'migrations', '002_add_user_favorites.sql');
  try {
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');
    db.exec(migrationSQL);
    console.log('[Favorites] Database initialized successfully');
  } catch (error) {
    console.error('[Favorites] Failed to initialize database:', error);
    throw error;
  }

  return db;
}

let dbInstance: Database.Database | null = null;
let initPromise: Promise<Database.Database> | null = null;

export async function getFavoritesDB(): Promise<Database.Database> {
  if (!dbInstance) {
    if (!initPromise) {
      initPromise = initFavoritesDB().then(db => {
        dbInstance = db;
        return db;
      });
    }
    await initPromise;
  }
  return dbInstance!;
}

// Synchronous version for immediate access (must be called after initialization)
export function getFavoritesDBSync(): Database.Database {
  if (!dbInstance) {
    throw new Error('Favorites database not initialized. Call getFavoritesDB() first.');
  }
  return dbInstance;
}

/**
 * Get all favorites for a user, sorted by order_index
 */
export async function getFavoritesByUserId(userId: number): Promise<Favorite[]> {
  const db = await getFavoritesDB();
  const favorites = db.prepare(`
    SELECT * FROM user_favorites
    WHERE user_id = ?
    ORDER BY order_index ASC, created_at ASC
  `).all(userId) as Favorite[];
  return favorites;
}

/**
 * Get a favorite by ID
 */
export async function getFavoriteById(favoriteId: number): Promise<Favorite | null> {
  const db = await getFavoritesDB();
  const favorite = db.prepare('SELECT * FROM user_favorites WHERE id = ?').get(favoriteId) as Favorite | undefined;
  return favorite || null;
}

/**
 * Add a favorite for a user
 */
export async function addFavorite(userId: number, input: CreateFavoriteInput): Promise<Favorite> {
  const db = await getFavoritesDB();

  // Check if already favorited
  const existing = db.prepare(`
    SELECT * FROM user_favorites
    WHERE user_id = ? AND item_type = ? AND item_id = ?
  `).get(userId, input.item_type, input.item_id);

  if (existing) {
    throw new Error('Item already favorited');
  }

  // Get the current highest order_index for this user
  const maxOrder = db.prepare(`
    SELECT MAX(order_index) as max_order FROM user_favorites WHERE user_id = ?
  `).get(userId) as { max_order: number | null };

  const orderIndex = (maxOrder?.max_order ?? -1) + 1;

  const result = db.prepare(`
    INSERT INTO user_favorites (user_id, item_type, item_id, display_name, order_index)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, input.item_type, input.item_id, input.display_name, orderIndex);

  return (await getFavoriteById(result.lastInsertRowid as number))!;
}

/**
 * Remove a favorite by ID
 */
export async function removeFavorite(favoriteId: number, userId: number): Promise<boolean> {
  const db = await getFavoritesDB();

  // Verify the favorite belongs to the user
  const favorite = await getFavoriteById(favoriteId);
  if (!favorite || favorite.user_id !== userId) {
    throw new Error('Favorite not found or access denied');
  }

  const result = db.prepare('DELETE FROM user_favorites WHERE id = ?').run(favoriteId);
  return result.changes > 0;
}

/**
 * Remove a favorite by item type and ID
 */
export async function removeFavoriteByItem(userId: number, itemType: string, itemId: string): Promise<boolean> {
  const db = await getFavoritesDB();

  const result = db.prepare(`
    DELETE FROM user_favorites
    WHERE user_id = ? AND item_type = ? AND item_id = ?
  `).run(userId, itemType, itemId);

  return result.changes > 0;
}

/**
 * Update a favorite
 */
export async function updateFavorite(favoriteId: number, userId: number, updates: UpdateFavoriteInput): Promise<Favorite | null> {
  const db = await getFavoritesDB();

  // Verify the favorite belongs to the user
  const favorite = await getFavoriteById(favoriteId);
  if (!favorite || favorite.user_id !== userId) {
    throw new Error('Favorite not found or access denied');
  }

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.display_name !== undefined) {
    fields.push('display_name = ?');
    values.push(updates.display_name);
  }

  if (updates.order_index !== undefined) {
    fields.push('order_index = ?');
    values.push(updates.order_index);
  }

  if (fields.length === 0) {
    return favorite;
  }

  values.push(favoriteId);

  db.prepare(`
    UPDATE user_favorites
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(...values);

  return await getFavoriteById(favoriteId);
}

/**
 * Reorder favorites for a user
 */
export async function reorderFavorites(userId: number, favoriteIds: number[]): Promise<Favorite[]> {
  const db = await getFavoritesDB();

  // Verify all favorites belong to the user
  const placeholders = favoriteIds.map(() => '?').join(',');
  const userFavorites = db.prepare(`
    SELECT * FROM user_favorites
    WHERE user_id = ? AND id IN (${placeholders})
  `).all(userId, ...favoriteIds) as Favorite[];

  if (userFavorites.length !== favoriteIds.length) {
    throw new Error('One or more favorites not found or access denied');
  }

  // Update order indices
  const stmt = db.prepare('UPDATE user_favorites SET order_index = ? WHERE id = ?');
  const updateMany = db.transaction((ids: number[]) => {
    ids.forEach((id, index) => {
      stmt.run(index, id);
    });
  });

  updateMany(favoriteIds);

  return await getFavoritesByUserId(userId);
}

/**
 * Check if an item is favorited by a user
 */
export async function isFavorited(userId: number, itemType: string, itemId: string): Promise<boolean> {
  const db = await getFavoritesDB();

  const result = db.prepare(`
    SELECT COUNT(*) as count FROM user_favorites
    WHERE user_id = ? AND item_type = ? AND item_id = ?
  `).get(userId, itemType, itemId) as { count: number };

  return result.count > 0;
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
