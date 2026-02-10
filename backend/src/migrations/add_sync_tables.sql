-- Migration: Add sync tables for account synchronization
-- Description: Creates tables for device tracking, sync logging, and data versioning
-- Created for ticket #176: Account sync: Backend API implementation
-- Note: This migration uses the users.db database

-- User devices table
-- Tracks all devices connected to a user account
CREATE TABLE IF NOT EXISTS user_devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  device_id TEXT UNIQUE NOT NULL,
  device_name TEXT,
  device_type TEXT,
  platform TEXT,
  last_sync DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sync log table
-- Tracks all sync operations for audit trail
CREATE TABLE IF NOT EXISTS sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  device_id TEXT NOT NULL,
  sync_type TEXT NOT NULL, -- 'upload' or 'download'
  status TEXT NOT NULL, -- 'success', 'partial', 'failed'
  items_synced INTEGER DEFAULT 0,
  conflicts_found INTEGER DEFAULT 0,
  conflicts_resolved INTEGER DEFAULT 0,
  error_message TEXT,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_device_id ON user_devices(device_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_user_id ON sync_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_device_id ON sync_log(device_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_started_at ON sync_log(started_at);

-- Note: The version columns for tickets and settings tables will be added via the sync service
-- on first access to avoid database locking issues across multiple databases
