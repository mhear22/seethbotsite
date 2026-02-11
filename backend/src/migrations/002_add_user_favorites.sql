-- Migration 002: Add user_favorites table for quick favorites feature
-- This migration adds a table to store user favorites for pages, panels, and features

CREATE TABLE IF NOT EXISTS user_favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('page', 'panel', 'feature')),
  item_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, item_type, item_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_type ON user_favorites(item_type);
CREATE INDEX IF NOT EXISTS idx_user_favorites_order ON user_favorites(user_id, order_index);
