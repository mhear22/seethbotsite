/**
 * Sync Service
 * Handles device tracking, conflict detection, and sync logging
 * for account synchronization across multiple devices.
 */

import { prisma } from '../lib/prisma';

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
  last_sync: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Sync log interface
 */
export interface SyncLog {
  id: number;
  user_id: number;
  device_id: string;
  sync_type: string;
  status: string;
  items_synced: number;
  conflicts_found: number;
  conflicts_resolved: number;
  error_message: string | null;
  started_at: Date;
  completed_at: Date | null;
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
export async function registerOrUpdateDevice(
  userId: number,
  deviceId: string,
  deviceName?: string,
  deviceType?: string,
  platform?: string
): Promise<UserDevice> {
  const now = new Date();

  // Check if device exists
  const existing = await prisma.userDevice.findFirst({
    where: {
      user_id: userId,
      device_id: deviceId
    }
  });

  if (existing) {
    return prisma.userDevice.update({
      where: { id: existing.id },
      data: {
        device_name: deviceName ?? existing.device_name,
        device_type: deviceType ?? existing.device_type,
        platform: platform ?? existing.platform,
        updated_at: now
      }
    });
  } else {
    return prisma.userDevice.create({
      data: {
        user_id: userId,
        device_id: deviceId,
        device_name: deviceName ?? null,
        device_type: deviceType ?? null,
        platform: platform ?? null,
        created_at: now,
        updated_at: now
      }
    });
  }
}

/**
 * Get all devices for a user
 */
export async function getUserDevices(userId: number): Promise<UserDevice[]> {
  return prisma.userDevice.findMany({
    where: { user_id: userId },
    orderBy: { last_sync: 'desc' }
  });
}

/**
 * Update last sync time for a device
 */
export async function updateDeviceLastSync(userId: number, deviceId: string): Promise<void> {
  const now = new Date();
  await prisma.userDevice.updateMany({
    where: {
      user_id: userId,
      device_id: deviceId
    },
    data: {
      last_sync: now,
      updated_at: now
    }
  });
}

/**
 * Start a sync log entry
 */
export async function startSyncLog(
  userId: number,
  deviceId: string,
  syncType: 'upload' | 'download'
): Promise<number> {
  const syncLog = await prisma.syncLog.create({
    data: {
      user_id: userId,
      device_id: deviceId,
      sync_type: syncType,
      status: 'partial',
      started_at: new Date()
    }
  });
  return syncLog.id;
}

/**
 * Complete a sync log entry
 */
export async function completeSyncLog(
  logId: number,
  status: 'success' | 'partial' | 'failed',
  itemsSynced: number = 0,
  conflictsFound: number = 0,
  conflictsResolved: number = 0,
  errorMessage: string | null = null
): Promise<void> {
  await prisma.syncLog.update({
    where: { id: logId },
    data: {
      status: status,
      items_synced: itemsSynced,
      conflicts_found: conflictsFound,
      conflicts_resolved: conflictsResolved,
      error_message: errorMessage,
      completed_at: new Date()
    }
  });
}

/**
 * Get recent sync logs for a user
 */
export async function getRecentSyncLogs(userId: number, limit: number = 10): Promise<SyncLog[]> {
  return prisma.syncLog.findMany({
    where: { user_id: userId },
    orderBy: { started_at: 'desc' },
    take: limit
  });
}

/**
 * Get sync status for a user
 */
export async function getSyncStatus(userId: number): Promise<SyncStatus> {
  const devices = await getUserDevices(userId);
  const recentSyncs = await getRecentSyncLogs(userId, 5);

  // Get last sync time from any device
  let lastSyncTime: string | null = null;
  for (const device of devices) {
    if (device.last_sync && (!lastSyncTime || new Date(device.last_sync) > new Date(lastSyncTime))) {
      lastSyncTime = device.last_sync.toISOString();
    }
  }

  // Count pending conflicts (syncs with conflicts that haven't been resolved)
  const conflictsPending = await prisma.syncLog.count({
    where: {
      user_id: userId,
      status: 'partial',
      conflicts_found: { gt: 0 }
    }
  });

  return {
    last_sync_time: lastSyncTime,
    total_devices: devices.length,
    recent_syncs: recentSyncs,
    conflicts_pending: conflictsPending
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
export async function getSyncableData(userId?: number): Promise<SyncData> {
  // Get tickets (optionally filtered by user)
  const tickets = await prisma.ticket.findMany({
    where: {
      is_deleted: false,
      ...(userId && { creator_id: userId.toString() })
    },
    orderBy: { updated_at: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      response: true,
      creator_id: true,
      created_at: true,
      updated_at: true,
      type: true,
      priority: true,
      tags: true,
      category: true
    }
  });

  // Get settings
  const settings = await prisma.setting.findMany({
    orderBy: { key: 'asc' }
  });

  return {
    tickets: tickets.map(t => ({ ...t, version: 1 })),
    settings: settings.map(s => ({ ...s, version: 1 })),
    version: 1,
    timestamp: new Date().toISOString()
  };
}
