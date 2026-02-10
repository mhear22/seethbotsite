-- Migration: Add reactions table
-- Description: Creates reactions table for emoji reactions on messages, posts, and comments
-- Created for ticket #182: Reaction system: Database and API

-- Reactions table
-- Stores emoji reactions from users on various targets (messages, posts, comments)
CREATE TABLE IF NOT EXISTS reactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  target_type TEXT NOT NULL CHECK(target_type IN ('message', 'post', 'comment')),
  target_id INTEGER NOT NULL,
  emoji TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, target_type, target_id, emoji)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reactions_target ON reactions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_emoji ON reactions(emoji);
