import { prisma } from '../lib/prisma';

/**
 * Admin operation result
 */
export interface AdminOperationResult {
  success: boolean;
  affectedCount: number;
  message?: string;
}

/**
 * Tickets Admin Service (Legacy)
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

    try {
      const result = await prisma.ticket.updateMany({
        where: {
          id: { in: ticketIds },
          is_deleted: false
        },
        data: { status }
      });

      return {
        success: true,
        affectedCount: result.count,
        message: `Updated ${result.count} tickets to status '${status}'`
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
    try {
      const result = await prisma.ticket.updateMany({
        where: {
          id: { in: ticketIds }
        },
        data: { is_deleted: true }
      });

      return {
        success: true,
        affectedCount: result.count,
        message: `Deleted ${result.count} tickets`
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
    try {
      const result = await prisma.ticket.updateMany({
        where: {
          id: { in: ticketIds }
        },
        data: { is_deleted: false }
      });

      return {
        success: true,
        affectedCount: result.count,
        message: `Restored ${result.count} tickets`
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
    // Check if ticket exists
    const exists = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true }
    });

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

      await prisma.ticket.update({
        where: { id: ticketId },
        data: { dependencies: dependenciesJson }
      });

      return {
        success: true,
        affectedCount: 1,
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
    // Check if ticket exists
    const exists = await prisma.ticket.findUnique({
      where: { id: ticketId, is_deleted: false },
      select: { id: true }
    });

    if (!exists) {
      return {
        success: false,
        affectedCount: 0,
        message: 'Ticket not found'
      };
    }

    try {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { creator_id: newCreatorId }
      });

      return {
        success: true,
        affectedCount: 1,
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
    // Check if ticket exists
    const exists = await prisma.ticket.findUnique({
      where: { id: ticketId, is_deleted: false },
      select: { id: true }
    });

    if (!exists) {
      return {
        success: false,
        affectedCount: 0,
        message: 'Ticket not found'
      };
    }

    try {
      // Clear dependencies to unblock the ticket
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { dependencies: null }
      });

      return {
        success: true,
        affectedCount: 1,
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

    // Check if ticket exists
    const exists = await prisma.ticket.findUnique({
      where: { id: ticketId, is_deleted: false },
      select: { id: true }
    });

    if (!exists) {
      return {
        success: false,
        affectedCount: 0,
        message: 'Ticket not found'
      };
    }

    try {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { priority: newPriority }
      });

      return {
        success: true,
        affectedCount: 1,
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
    try {
      console.log(`[ADMIN AUDIT] User ${userId} performed ${action}:`, details);
    } catch (error) {
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
    // Table doesn't exist in Prisma schema yet
    return [];
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
    // Table doesn't exist in Prisma schema yet
    return {
      logs: [],
      total: 0
    };
  }
}

// Export singleton instance
export const ticketsAdminService = new TicketsAdminService();
