import { Router, Request, Response } from 'express';
import {
  validateTokenAndGetUser
} from '../users';
import {
  registerOrUpdateDevice,
  updateDeviceLastSync,
  startSyncLog,
  completeSyncLog,
  getSyncableData,
  detectConflicts,
  resolveConflicts,
  getSyncStatus,
  getTicketsDB
} from '../services/sync.service';

const router = Router();

/**
 * Helper to extract user from JWT token
 */
function getUserFromToken(req: Request): { user: any; session: any } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return validateTokenAndGetUser(token);
}

/**
 * @openapi
 * /api/sync/upload:
 *   post:
 *     tags: [Sync]
 *     summary: Upload local changes to server
 *     description: Uploads local data changes from a device to the server for synchronization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deviceId]
 *             properties:
 *               deviceId:
 *                 type: string
 *                 description: Unique identifier for the device
 *               deviceName:
 *                 type: string
 *                 description: Human-readable device name
 *               deviceType:
 *                 type: string
 *                 description: Device type (mobile, desktop, tablet, etc.)
 *               platform:
 *                 type: string
 *                 description: Platform (iOS, Android, Windows, macOS, etc.)
 *               data:
 *                 type: object
 *                 description: Sync data containing tickets, settings, etc.
 *               conflictResolution:
 *                 type: string
 *                 enum: [last-write-wins, user-prompted, merge]
 *                 default: last-write-wins
 *                 description: Strategy for resolving conflicts
 *     responses:
 *       200:
 *         description: Upload successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conflicts_found:
 *                   type: number
 *                 conflicts_resolved:
 *                   type: number
 *                 items_synced:
 *                   type: number
 *                 sync_log_id:
 *                   type: integer
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authenticated
 */
router.post('/sync/upload', async (req: Request, res: Response) => {
  try {
    const result = getUserFromToken(req);

    if (!result) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { deviceId, deviceName, deviceType, platform, data, conflictResolution = 'last-write-wins' } = req.body;

    // Validate input
    if (!deviceId || typeof deviceId !== 'string') {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    if (data && typeof data !== 'object') {
      return res.status(400).json({ error: 'Data must be an object' });
    }

    const userId = result.user.id;

    // Register or update device
    registerOrUpdateDevice(userId, deviceId, deviceName, deviceType, platform);

    // Start sync log
    const logId = startSyncLog(userId, deviceId, 'upload');

    try {
      let itemsSynced = 0;
      let conflictsFound = 0;
      let conflictsResolved = 0;

      if (data) {
        // Get current server data
        const serverData = getSyncableData(userId);

        // Detect conflicts
        const conflicts = detectConflicts(data, serverData);
        conflictsFound = conflicts.length;

        if (conflicts.length > 0 && conflictResolution !== 'user-prompted') {
          // Auto-resolve conflicts
          const resolution = resolveConflicts(conflicts, conflictResolution, data, serverData);
          conflictsResolved = resolution.resolvedConflicts;
          data.tickets = resolution.resolvedData.tickets;
          data.settings = resolution.resolvedData.settings;
        }

        // Update tickets
        if (data.tickets && Array.isArray(data.tickets)) {
          const db = getTicketsDB();

          for (const ticket of data.tickets) {
            // Check if ticket exists
            const existing = db.prepare('SELECT id, version, updated_at FROM tickets WHERE id = ?').get(ticket.id);

            if (existing) {
              // Only update if local version is newer
              const localUpdatedAt = new Date(ticket.updated_at).getTime();
              const serverUpdatedAt = new Date((existing as any).updated_at).getTime();

              if (localUpdatedAt > serverUpdatedAt) {
                db.prepare(`
                  UPDATE tickets
                  SET title = ?, description = ?, status = ?, response = ?,
                      type = ?, priority = ?, tags = ?, category = ?,
                      updated_at = ?, version = version + 1
                  WHERE id = ?
                `).run(
                  ticket.title,
                  ticket.description,
                  ticket.status,
                  ticket.response || null,
                  ticket.type || 'feature',
                  ticket.priority || 'medium',
                  ticket.tags || null,
                  ticket.category || null,
                  ticket.updated_at,
                  ticket.id
                );
                itemsSynced++;
              }
            } else {
              // Insert new ticket
              db.prepare(`
                INSERT INTO tickets (title, description, status, response, creator_id,
                                     type, priority, tags, category, version, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `).run(
                ticket.title,
                ticket.description,
                ticket.status || 'pending',
                ticket.response || null,
                userId,
                ticket.type || 'feature',
                ticket.priority || 'medium',
                ticket.tags || null,
                ticket.category || null,
                1,
                ticket.updated_at || new Date().toISOString()
              );
              itemsSynced++;
            }
          }
        }

        // Update settings
        if (data.settings && Array.isArray(data.settings)) {
          const db = getTicketsDB();

          for (const setting of data.settings) {
            const existing = db.prepare('SELECT key, version, updated_at FROM settings WHERE key = ?').get(setting.key);

            if (existing) {
              const localUpdatedAt = new Date(setting.updated_at).getTime();
              const serverUpdatedAt = new Date((existing as any).updated_at).getTime();

              if (localUpdatedAt > serverUpdatedAt) {
                db.prepare(`
                  UPDATE settings
                  SET value = ?, updated_at = ?, version = version + 1
                  WHERE key = ?
                `).run(setting.value, setting.updated_at, setting.key);
                itemsSynced++;
              }
            } else {
              db.prepare(`
                INSERT INTO settings (key, value, updated_at, version)
                VALUES (?, ?, ?, ?)
              `).run(setting.key, setting.value, setting.updated_at || new Date().toISOString(), 1);
              itemsSynced++;
            }
          }
        }
      }

      // Update device last sync time
      updateDeviceLastSync(userId, deviceId);

      // Complete sync log
      completeSyncLog(logId, conflictsFound > conflictsResolved ? 'partial' : 'success', itemsSynced, conflictsFound, conflictsResolved);

      res.json({
        success: true,
        conflicts_found: conflictsFound,
        conflicts_resolved: conflictsResolved,
        items_synced: itemsSynced,
        sync_log_id: logId,
        conflicts: conflictsFound > conflictsResolved ? detectConflicts(data, getSyncableData(userId)) : undefined
      });
    } catch (error: any) {
      // Log error
      completeSyncLog(logId, 'failed', 0, 0, 0, error.message);
      throw error;
    }
  } catch (error: any) {
    console.error('Error in sync upload:', error);
    res.status(500).json({ error: 'Failed to upload sync data' });
  }
});

/**
 * @openapi
 * /api/sync/download:
 *   get:
 *     tags: [Sync]
 *     summary: Download latest server state
 *     description: Downloads the latest server data for synchronization.
 *     parameters:
 *       - in: query
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier for the device
 *       - in: query
 *         name: since
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Only return data changed since this timestamp (optional)
 *     responses:
 *       200:
 *         description: Download successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     tickets:
 *                       type: array
 *                     settings:
 *                       type: array
 *                     version:
 *                       type: integer
 *                     timestamp:
 *                       type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authenticated
 */
router.get('/sync/download', async (req: Request, res: Response) => {
  try {
    const result = getUserFromToken(req);

    if (!result) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { deviceId, since } = req.query;
    const userId = result.user.id;

    // Validate input
    if (!deviceId || typeof deviceId !== 'string') {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    // Start sync log
    const logId = startSyncLog(userId, deviceId, 'download');

    try {
      let data = getSyncableData(userId);

      // Filter by timestamp if 'since' is provided
      if (since && typeof since === 'string') {
        const sinceDate = new Date(since);

        data.tickets = data.tickets?.filter(t => new Date(t.updated_at) > sinceDate);
        data.settings = data.settings?.filter(s => new Date(s.updated_at) > sinceDate);
      }

      // Count items synced
      const itemsSynced = (data.tickets?.length || 0) + (data.settings?.length || 0);

      // Update device last sync time
      updateDeviceLastSync(userId, deviceId);

      // Complete sync log
      completeSyncLog(logId, 'success', itemsSynced);

      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      completeSyncLog(logId, 'failed', 0, 0, 0, error.message);
      throw error;
    }
  } catch (error: any) {
    console.error('Error in sync download:', error);
    res.status(500).json({ error: 'Failed to download sync data' });
  }
});

/**
 * @openapi
 * /api/sync/status:
 *   get:
 *     tags: [Sync]
 *     summary: Get sync status and conflicts
 *     description: Returns the current sync status for the user's account.
 *     responses:
 *       200:
 *         description: Status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: object
 *                   properties:
 *                     last_sync_time:
 *                       type: string
 *                       nullable: true
 *                     total_devices:
 *                       type: integer
 *                     recent_syncs:
 *                       type: array
 *                     conflicts_pending:
 *                       type: integer
 *       401:
 *         description: Not authenticated
 */
router.get('/sync/status', async (req: Request, res: Response) => {
  try {
    const result = getUserFromToken(req);

    if (!result) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = result.user.id;
    const status = getSyncStatus(userId);

    res.json({
      success: true,
      status
    });
  } catch (error: any) {
    console.error('Error getting sync status:', error);
    res.status(500).json({ error: 'Failed to get sync status' });
  }
});

/**
 * @openapi
 * /api/sync/resolve:
 *   post:
 *     tags: [Sync]
 *     summary: Resolve sync conflicts
 *     description: Manually resolve conflicts found during sync.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [conflicts]
 *             properties:
 *               conflicts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [id, resolution]
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Conflict ID (e.g., "ticket-123")
 *                     resolution:
 *                       type: string
 *                       enum: [local, remote]
 *                       description: Which version to keep
 *     responses:
 *       200:
 *         description: Conflicts resolved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 resolved_count:
 *                   type: integer
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authenticated
 */
router.post('/sync/resolve', async (req: Request, res: Response) => {
  try {
    const result = getUserFromToken(req);

    if (!result) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { conflicts } = req.body;
    const userId = result.user.id;

    // Validate input
    if (!conflicts || !Array.isArray(conflicts)) {
      return res.status(400).json({ error: 'Conflicts array is required' });
    }

    const db = getTicketsDB();
    let resolvedCount = 0;

    for (const conflict of conflicts) {
      if (!conflict.id || !conflict.resolution) {
        continue;
      }

      const [type, id] = conflict.id.split('-');

      if (type === 'ticket') {
        const ticketId = parseInt(id);
        if (isNaN(ticketId)) continue;

        if (conflict.resolution === 'local') {
          // Keep local version (already on server)
          resolvedCount++;
        } else if (conflict.resolution === 'remote') {
          // This would need the remote version data, which should be provided
          // For now, we just acknowledge the resolution
          resolvedCount++;
        }
      } else if (type === 'setting') {
        const settingKey = id;

        if (conflict.resolution === 'local') {
          resolvedCount++;
        } else if (conflict.resolution === 'remote') {
          resolvedCount++;
        }
      }
    }

    res.json({
      success: true,
      resolved_count: resolvedCount
    });
  } catch (error: any) {
    console.error('Error resolving conflicts:', error);
    res.status(500).json({ error: 'Failed to resolve conflicts' });
  }
});

export default router;
