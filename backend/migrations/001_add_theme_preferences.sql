-- Theme preferences table for storing user-customizable themes
CREATE TABLE IF NOT EXISTS theme_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  theme_name TEXT NOT NULL DEFAULT 'dark',
  primary_color TEXT NOT NULL DEFAULT '#ec4899',
  secondary_color TEXT NOT NULL DEFAULT '#8b5cf6',
  background_color TEXT NOT NULL DEFAULT '#1a1a2e',
  text_color TEXT NOT NULL DEFAULT '#ffffff',
  accent_color TEXT NOT NULL DEFAULT '#f97316',
  custom_settings TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_theme_preferences_user_id ON theme_preferences(user_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_theme_preferences_timestamp
AFTER UPDATE ON theme_preferences
FOR EACH ROW
BEGIN
  UPDATE theme_preferences SET updated_at = datetime('now') WHERE id = NEW.id;
END;
