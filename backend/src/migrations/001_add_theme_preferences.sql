-- Migration 001: Add theme_preferences table
-- Description: Creates theme_preferences table for storing user theme customization settings
-- Created for ticket #186: Theme customization: Backend API

-- Create theme_preferences table
CREATE TABLE IF NOT EXISTS theme_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  theme_name TEXT NOT NULL DEFAULT 'dark',
  primary_color TEXT DEFAULT '#ec4899',
  secondary_color TEXT DEFAULT '#8b5cf6',
  background_color TEXT DEFAULT '#1a1a2e',
  text_color TEXT DEFAULT '#ffffff',
  accent_color TEXT DEFAULT '#f97316',
  custom_settings TEXT, -- JSON string for additional theme parameters
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_theme_preferences_user_id ON theme_preferences(user_id);

-- Create a trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_theme_preferences_timestamp
AFTER UPDATE ON theme_preferences
FOR EACH ROW
BEGIN
  UPDATE theme_preferences SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
