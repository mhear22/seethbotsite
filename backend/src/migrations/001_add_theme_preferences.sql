-- Migration 001: Add theme_preferences to users table
-- This migration adds a theme_preferences column to store user theme settings

-- Add theme_preferences column as TEXT (SQLite doesn't support JSONB natively)
-- Will store JSON: {"preset":"dark","customColors":{...},"options":{...}}
ALTER TABLE users ADD COLUMN theme_preferences TEXT DEFAULT NULL;

-- Set default value for existing users (dark theme)
UPDATE users SET theme_preferences = '{"preset":"dark","customColors":{"primary":"#ec4899","background":"#1a1a2e","text":"#ffffff","accent":"#f97316","cardBackground":"#16213e"},"options":{"darkMode":true,"highContrast":false,"reduceMotion":false}}' WHERE theme_preferences IS NULL;
