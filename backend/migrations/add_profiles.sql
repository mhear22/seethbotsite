-- Migration: Add user profiles table
-- Description: Creates user_profiles table for storing user profile information
-- Created for ticket #178: User profiles - Database and API

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT CHECK(length(bio) <= 500),
  avatar_url TEXT,
  profile_banner_url TEXT,
  status_message TEXT CHECK(length(status_message) <= 140),
  location TEXT,
  website TEXT,
  social_links TEXT, -- JSON string
  is_public BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_public ON user_profiles(is_public);

-- Create a trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_user_profiles_timestamp
AFTER UPDATE ON user_profiles
FOR EACH ROW
BEGIN
  UPDATE user_profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
