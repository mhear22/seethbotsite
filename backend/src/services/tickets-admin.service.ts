import Database from 'better-sqlite3';
import { getDB } from './tickets-db';
import { ticketsService } from './tickets.service';

/**
 * Admin operation result
 */
export interface AdminOperationResult {
  success: boolean;
  affectedCount: number;
  message?: string;
}

/**
 * Tickets Admin Service
 *
 * Handles admin-only operations for tickets.
 */
export class TicketsAdminService {
  /**
   * Bulk update ticket status
   */
  async bulkUpdateStatus(ticketIds: number[], status: string): Promise<AdminOperationResult> {
    if (!['pending', 'needs-info', 'completed', 'declined', 'unresolved'].includes(status)) {
      return {
        success: false,
        affectedCount: 0,
        message: 'Invalid status value'
      };
    }

    const db = getDB();

    try {
      const stmt = db.prepare('UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (?) AND is_deleted = 0');
      const result = stmt.run(status, ticketIds.join(','));

      return {
        success: true,
        affectedCount: result.changes,
        message: `Updated ${result.changes} tickets to status '${status}'`
      };
    } catch (error) {
      return {
        success: false,
        affectedCount: 0,
        message: `Failed to update tickets: ${(error as Error).message}`
      };
    }
  }

  /**
   * Bulk soft delete tickets
   */
  async bulkDeleteTickets(ticketIds: number[]): Promise<AdminOperationResult> {
    const db = getDB();

    try {
      const stmt = db.prepare('UPDATE tickets SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id IN (?)');
      const result = stmt.run(ticketIds.join(','));

      return {
        success: true,
        affectedCount: result.changes,
        message: `Deleted ${result.changes} tickets`
      };
    } catch (error) {
      return {
        success: false,
        affectedCount: 0,
        message: `Failed to delete tickets: ${(error as Error).message}`
      };
    }
  }

  /**
   * Bulk restore tickets
   */
  async bulkRestoreTickets(ticketIds: number[]): Promise<AdminOperationResult> {
    const db = getDB();

    try {
      const stmt = db.prepare('UPDATE tickets SET is_deleted = 0, updated_at = CURRENT_TIMESTAMP WHERE id IN (?)');
      const result = stmt.run(ticketIds.join(','));

      return {
        success: true,
        affectedCount: result.changes,
        message: `Restored ${result.changes} tickets`
      };
    } catch (error) {
      return {
        success: false,
        affectedCount: 0,
        message: `Failed to restore tickets: ${(error as Error).message}`
      };
    }
  }

  /**
   * Force update ticket dependencies (override validation)
   */
  async forceUpdateDependencies(ticketId: number, dependencies: number[]): Promise<AdminOperationResult> {
    const db = getDB();

    // Check if ticket exists
    const exists = db.prepare('SELECT id FROM tickets WHERE id = ?').get(ticketId);
    if (!exists) {
      return {
        success: false,
        affectedCount: 0,
        message: 'Ticket not found'
      };
    }

    try {
      const depsArray = Array.isArray(dependencies) ? dependencies : [];
      const dependenciesJson = depsArray.length > 0 ? JSON.stringify(depsArray) : null;

      const stmt = db.prepare('UPDATE tickets SET dependencies = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      const result = stmt.run(dependenciesJson, ticketId);

      return {
        success: true,
        affectedCount: result.changes,
        message: `Updated dependencies for ticket #${ticketId}`
      };
    } catch (error) {
      return {
        success: false,
        affectedCount: 0,
        message: `Failed to update dependencies: ${(error as Error).message}`
      };
    }
  }

  /**
   * Reassign ticket to a different creator
   */
  async reassignTicket(ticketId: number, newCreatorId: string): Promise<AdminOperationResult> {
    const db = getDB();

    // Check if ticket exists
    const exists = db.prepare('SELECT id FROM tickets WHERE id = ? AND is_deleted = 0').get(ticketId);
    if (!exists) {
      return {
        success: false,
        affectedCount: 0,
        message: 'Ticket not found'
      };
    }

    try {
      const stmt = db.prepare('UPDATE tickets SET creator_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      const result = stmt.run(newCreatorId, ticketId);

      return {
        success: true,
        affectedCount: result.changes,
        message: `Reassigned ticket #${ticketId} to creator ${newCreatorId}`
      };
    } catch (error) {
      return {
        success: false,
        affectedCount: 0,
        message: `Failed to reassign ticket: ${(error as Error).message}`
      };
    }
  }

  /**
   * Force unblock a ticket (ignore dependencies)
   * This doesn't actually change the dependencies, but clears them temporarily
   */
  async forceUnblockTicket(ticketId: number): Promise<AdminOperationResult> {
    const db = getDB();

    // Check if ticket exists
    const exists = db.prepare('SELECT id FROM tickets WHERE id = ? AND is_deleted = 0').get(ticketId);
    if (!exists) {
      return {
        success: false,
        affectedCount: 0,
        message: 'Ticket not found'
      };
    }

    try {
      // Clear dependencies to unblock the ticket
      const stmt = db.prepare('UPDATE tickets SET dependencies = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      const result = stmt.run(ticketId);

      return {
        success: true,
        affectedCount: result.changes,
        message: `Force unblocked ticket #${ticketId}`
      };
    } catch (error) {
      return {
        success: false,
        affectedCount: 0,
        message: `Failed to unblock ticket: ${(error as Error).message}`
      };
    }
  }

  /**
   * Escalate ticket priority
   */
  async escalateTicket(ticketId: number, newPriority: string): Promise<AdminOperationResult> {
    if (!['high', 'medium', 'low'].includes(newPriority)) {
      return {
        success: false,
        affectedCount: 0,
        message: 'Invalid priority value'
      };
    }

    const db = getDB();

    // Check if ticket exists
    const exists = db.prepare('SELECT id FROM tickets WHERE id = ? AND is_deleted = 0').get(ticketId);
    if (!exists) {
      return {
        success: false,
        affectedCount: 0,
        message: 'Ticket not found'
      };
    }

    try {
      const stmt = db.prepare('UPDATE tickets SET priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      const result = stmt.run(newPriority, ticketId);

      return {
        success: true,
        affectedCount: result.changes,
        message: `Escalated ticket #${ticketId} to ${newPriority} priority`
      };
    } catch (error) {
      return {
        success: false,
        affectedCount: 0,
        message: `Failed to escalate ticket: ${(error as Error).message}`
      };
    }
  }

  /**
   * Mark ticket as urgent
   */
  async markAsUrgent(ticketId: number): Promise<AdminOperationResult> {
    return this.escalateTicket(ticketId, 'high');
  }

  /**
   * Log admin action
   */
  logAdminAction(userId: string, action: string, details: any): void {
    const db = getDB();

    try {
      // Create admin_audit_log table if it doesn't exist
      db.exec(`
        CREATE TABLE IF NOT EXISTS admin_audit_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          action TEXT NOT NULL,
          details TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const stmt = db.prepare(`
        INSERT INTO admin_audit_log (user_id, action, details, created_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `);
      stmt.run(userId, action, JSON.stringify(details));
    } catch (error) {
      // Log creation failed, but don't throw
      console.error('Failed to log admin action:', error);
    }
  }

  /**
   * Get audit log for a ticket
   */
  getAuditLog(ticketId: number): Array<{
    id: number;
    user_id: string;
    action: string;
    details: string;
    created_at: string;
  }> {
    const db = getDB();

    try {
      const logs = db.prepare(`
        SELECT * FROM admin_audit_log
        WHERE details LIKE ?
        ORDER BY created_at DESC
      `).all(`%ticketId":${ticketId}%`) as Array<any>;

      return logs.map(log => ({
        id: log.id,
        user_id: log.user_id,
        action: log.action,
        details: log.details,
        created_at: log.created_at
      }));
    } catch (error) {
      // Table might not exist
      return [];
    }
  }

  /**
   * Get all audit logs (paginated)
   */
  getAllAuditLogs(page: number = 1, limit: number = 50): {
    logs: Array<{
      id: number;
      user_id: string;
      action: string;
      details: string;
      created_at: string;
    }>;
    total: number;
  } {
    const db = getDB();

    try {
      // Get total count
      const totalResult = db.prepare('SELECT COUNT(*) as count FROM admin_audit_log').get() as { count: number };
      const total = totalResult.count;

      // Get paginated logs
      const offset = (page - 1) * limit;
      const logs = db.prepare(`
        SELECT * FROM admin_audit_log
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `).all(limit, offset) as Array<any>;

      return {
        logs: logs.map(log => ({
          id: log.id,
          user_id: log.user_id,
          action: log.action,
          details: log.details,
          created_at: log.created_at
        })),
        total
      };
    } catch (error) {
      // Table might not exist
      return {
        logs: [],
        total: 0
      };
    }
  }
}

// Export singleton instance
export const ticketsAdminService = new TicketsAdminService();
