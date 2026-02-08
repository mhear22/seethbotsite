/**
 * Sync Service
 * Handles device tracking, conflict detection, and sync logging
 * for account synchronization across multiple devices.
 */

import Database from 'better-sqlite3';
import path from 'path';

// Use the users.db database for sync tables (shares with auth tables)
const DB_PATH = path.join(__dirname, '..', '..', 'data', 'users.db');

/**
 * Initialize the sync database
 */
export function initSyncDB(): Database.Database {
  const db = new Database(DB_PATH);

  // Create user_devices table
  db.exec(`
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
    )
  `);

  // Create sync_log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      device_id TEXT NOT NULL,
      sync_type TEXT NOT NULL,
      status TEXT NOT NULL,
      items_synced INTEGER DEFAULT 0,
      conflicts_found INTEGER DEFAULT 0,
      conflicts_resolved INTEGER DEFAULT 0,
      error_message TEXT,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_devices_device_id ON user_devices(device_id);
    CREATE INDEX IF NOT EXISTS idx_sync_log_user_id ON sync_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_sync_log_device_id ON sync_log(device_id);
    CREATE INDEX IF NOT EXISTS idx_sync_log_started_at ON sync_log(started_at);
  `);

  return db;
}

let dbInstance: Database.Database | null = null;

export function getSyncDB(): Database.Database {
  if (!dbInstance) {
    dbInstance = initSyncDB();
  }
  return dbInstance;
}

/**
 * Device interface
 */
export interface UserDevice {
  id: number;
  user_id: number;
  device_id: string;
  device_name: string | null;
  device_type: string | null;
  platform: string | null;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Sync log interface
 */
export interface SyncLog {
  id: number;
  user_id: number;
  device_id: string;
  sync_type: 'upload' | 'download';
  status: 'success' | 'partial' | 'failed';
  items_synced: number;
  conflicts_found: number;
  conflicts_resolved: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

/**
 * Sync data interface
 */
export interface SyncData {
  tickets?: any[];
  settings?: any[];
  version: number;
  timestamp: string;
}

/**
 * Sync status interface
 */
export interface SyncStatus {
  last_sync_time: string | null;
  total_devices: number;
  recent_syncs: SyncLog[];
  conflicts_pending: number;
}

/**
 * Conflict resolution strategy
 */
export type ConflictResolutionStrategy = 'last-write-wins' | 'user-prompted' | 'merge';

/**
 * Conflict interface
 */
export interface Conflict {
  id: string;
  type: string;
  local_version: any;
  remote_version: any;
  timestamp: string;
}

/**
 * Register or update a device
 */
export function registerOrUpdateDevice(
  userId: number,
  deviceId: string,
  deviceName?: string,
  deviceType?: string,
  platform?: string
): UserDevice {
  const db = getSyncDB();
  const now = new Date().toISOString();

  // Check if device exists
  const existing = db.prepare(
    'SELECT * FROM user_devices WHERE device_id = ? AND user_id = ?'
  ).get(deviceId, userId) as UserDevice | undefined;

  if (existing) {
    // Update device
    db.prepare(`
      UPDATE user_devices
      SET device_name = COALESCE(?, device_name),
          device_type = COALESCE(?, device_type),
          platform = COALESCE(?, platform),
          updated_at = ?
      WHERE id = ?
    `).run(
      deviceName || null,
      deviceType || null,
      platform || null,
      now,
      existing.id
    );
    return { ...existing, updated_at: now };
  } else {
    // Insert new device
    const result = db.prepare(`
      INSERT INTO user_devices (user_id, device_id, device_name, device_type, platform, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, deviceId, deviceName || null, deviceType || null, platform || null, now, now);

    return db.prepare('SELECT * FROM user_devices WHERE id = ?').get(result.lastInsertRowid) as UserDevice;
  }
}

/**
 * Get all devices for a user
 */
export function getUserDevices(userId: number): UserDevice[] {
  const db = getSyncDB();
  return db.prepare('SELECT * FROM user_devices WHERE user_id = ? ORDER BY last_sync DESC').all(userId) as UserDevice[];
}

/**
 * Update last sync time for a device
 */
export function updateDeviceLastSync(userId: number, deviceId: string): void {
  const db = getSyncDB();
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE user_devices
    SET last_sync = ?, updated_at = ?
    WHERE device_id = ? AND user_id = ?
  `).run(now, now, deviceId, userId);
}

/**
 * Start a sync log entry
 */
export function startSyncLog(
  userId: number,
  deviceId: string,
  syncType: 'upload' | 'download'
): number {
  const db = getSyncDB();
  const result = db.prepare(`
    INSERT INTO sync_log (user_id, device_id, sync_type, status, started_at)
    VALUES (?, ?, ?, 'partial', ?)
  `).run(userId, deviceId, syncType, new Date().toISOString());
  return Number(result.lastInsertRowid);
}

/**
 * Complete a sync log entry
 */
export function completeSyncLog(
  logId: number,
  status: 'success' | 'partial' | 'failed',
  itemsSynced: number = 0,
  conflictsFound: number = 0,
  conflictsResolved: number = 0,
  errorMessage: string | null = null
): void {
  const db = getSyncDB();
  db.prepare(`
    UPDATE sync_log
    SET status = ?, items_synced = ?, conflicts_found = ?, conflicts_resolved = ?, error_message = ?, completed_at = ?
    WHERE id = ?
  `).run(
    status,
    itemsSynced,
    conflictsFound,
    conflictsResolved,
    errorMessage,
    new Date().toISOString(),
    logId
  );
}

/**
 * Get recent sync logs for a user
 */
export function getRecentSyncLogs(userId: number, limit: number = 10): SyncLog[] {
  const db = getSyncDB();
  return db.prepare(`
    SELECT * FROM sync_log
    WHERE user_id = ?
    ORDER BY started_at DESC
    LIMIT ?
  `).all(userId, limit) as SyncLog[];
}

/**
 * Get sync status for a user
 */
export function getSyncStatus(userId: number): SyncStatus {
  const db = getSyncDB();
  const devices = getUserDevices(userId);
  const recentSyncs = getRecentSyncLogs(userId, 5);

  // Get last sync time from any device
  let lastSyncTime: string | null = null;
  for (const device of devices) {
    if (device.last_sync && (!lastSyncTime || new Date(device.last_sync) > new Date(lastSyncTime))) {
      lastSyncTime = device.last_sync;
    }
  }

  // Count pending conflicts (syncs with conflicts that haven't been resolved)
  const conflictsPending = db.prepare(`
    SELECT COUNT(*) as count FROM sync_log
    WHERE user_id = ? AND status = 'partial' AND conflicts_found > conflicts_resolved
  `).get(userId) as { count: number };

  return {
    last_sync_time: lastSyncTime,
    total_devices: devices.length,
    recent_syncs: recentSyncs,
    conflicts_pending: conflictsPending.count
  };
}

/**
 * Detect conflicts between local and remote data
 */
export function detectConflicts(
  localData: SyncData,
  remoteData: SyncData
): Conflict[] {
  const conflicts: Conflict[] = [];

  // Check for conflicts in tickets
  if (localData.tickets && remoteData.tickets) {
    const localTickets = new Map(localData.tickets.map(t => [t.id, t]));
    const remoteTickets = new Map(remoteData.tickets.map(t => [t.id, t]));

    // Find tickets that exist in both but have different versions
    for (const [id, localTicket] of localTickets) {
      const remoteTicket = remoteTickets.get(id);
      if (remoteTicket && localTicket.updated_at !== remoteTicket.updated_at) {
        conflicts.push({
          id: `ticket-${id}`,
          type: 'ticket',
          local_version: localTicket,
          remote_version: remoteTicket,
          timestamp: Math.max(
            new Date(localTicket.updated_at).getTime(),
            new Date(remoteTicket.updated_at).getTime()
          ).toString()
        });
      }
    }
  }

  // Check for conflicts in settings
  if (localData.settings && remoteData.settings) {
    const localSettings = new Map(localData.settings.map(s => [s.key, s]));
    const remoteSettings = new Map(remoteData.settings.map(s => [s.key, s]));

    for (const [key, localSetting] of localSettings) {
      const remoteSetting = remoteSettings.get(key);
      if (remoteSetting && localSetting.updated_at !== remoteSetting.updated_at) {
        conflicts.push({
          id: `setting-${key}`,
          type: 'setting',
          local_version: localSetting,
          remote_version: remoteSetting,
          timestamp: Math.max(
            new Date(localSetting.updated_at).getTime(),
            new Date(remoteSetting.updated_at).getTime()
          ).toString()
        });
      }
    }
  }

  return conflicts;
}

/**
 * Resolve conflicts using specified strategy
 */
export function resolveConflicts(
  conflicts: Conflict[],
  strategy: ConflictResolutionStrategy,
  localData: SyncData,
  remoteData: SyncData
): { resolvedData: SyncData; resolvedConflicts: number } {
  const resolvedData = { ...remoteData };
  let resolvedCount = 0;

  for (const conflict of conflicts) {
    switch (strategy) {
      case 'last-write-wins':
        // Use the version with the most recent timestamp
        const localTimestamp = conflict.local_version.updated_at
          ? new Date(conflict.local_version.updated_at).getTime()
          : 0;
        const remoteTimestamp = conflict.remote_version.updated_at
          ? new Date(conflict.remote_version.updated_at).getTime()
          : 0;

        if (localTimestamp > remoteTimestamp) {
          // Use local version
          if (conflict.type === 'ticket') {
            resolvedData.tickets = resolvedData.tickets?.map(t =>
              t.id === conflict.local_version.id ? conflict.local_version : t
            );
          } else if (conflict.type === 'setting') {
            resolvedData.settings = resolvedData.settings?.map(s =>
              s.key === conflict.local_version.key ? conflict.local_version : s
            );
          }
        }
        // Otherwise keep remote (default)
        resolvedCount++;
        break;

      case 'merge':
        // Attempt to merge - for now just use remote version
        // In a full implementation, you'd do intelligent merging
        resolvedCount++;
        break;

      case 'user-prompted':
        // This strategy requires user input, so we can't auto-resolve
        // The conflicts should be returned to the user for manual resolution
        break;
    }
  }

  return { resolvedData, resolvedConflicts: resolvedCount };
}

/**
 * Get syncable data from tickets database
 */
export function getSyncableData(userId?: number): SyncData {
  const db = getTicketsDB();

  // Get tickets (optionally filtered by user)
  let tickets: any[] = [];
  try {
    if (userId) {
      tickets = db.prepare(`
        SELECT id, title, description, status, response, creator_id,
               created_at, updated_at, type, priority, tags, category, version
        FROM tickets
        WHERE creator_id = ? AND is_deleted = 0
        ORDER BY updated_at DESC
      `).all(userId);
    } else {
      tickets = db.prepare(`
        SELECT id, title, description, status, response, creator_id,
               created_at, updated_at, type, priority, tags, category, version
        FROM tickets
        WHERE is_deleted = 0
        ORDER BY updated_at DESC
      `).all();
    }
  } catch (err) {
    // If version column doesn't exist yet, select without it
    if (userId) {
      tickets = db.prepare(`
        SELECT id, title, description, status, response, creator_id,
               created_at, updated_at, type, priority, tags, category
        FROM tickets
        WHERE creator_id = ? AND is_deleted = 0
        ORDER BY updated_at DESC
      `).all(userId);
    } else {
      tickets = db.prepare(`
        SELECT id, title, description, status, response, creator_id,
               created_at, updated_at, type, priority, tags, category
        FROM tickets
        WHERE is_deleted = 0
        ORDER BY updated_at DESC
      `).all();
    }
  }

  // Get settings
  let settings: any[] = [];
  try {
    settings = db.prepare(`
      SELECT key, value, updated_at, version
      FROM settings
      ORDER BY key
    `).all();
  } catch (err) {
    // If version column doesn't exist yet, select without it
    settings = db.prepare(`
      SELECT key, value, updated_at
      FROM settings
      ORDER BY key
    `).all();
  }

  return {
    tickets,
    settings,
    version: 1,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get tickets database for updates
 * Also ensures version columns exist for sync
 */
export function getTicketsDB(): Database.Database {
  const { getDB } = require('../services/tickets-db');
  const db = getDB();

  // Ensure version column exists in tickets table
  try {
    db.exec(`ALTER TABLE tickets ADD COLUMN version INTEGER DEFAULT 1`);
  } catch (err) {
    // Column already exists, ignore
  }

  // Ensure version column exists in settings table
  try {
    db.exec(`ALTER TABLE settings ADD COLUMN version INTEGER DEFAULT 1`);
  } catch (err) {
    // Column already exists, ignore
  }

  return db;
}
