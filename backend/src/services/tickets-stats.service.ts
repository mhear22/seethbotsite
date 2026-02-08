import Database from 'better-sqlite3';
import { getDB, safeJsonParse } from './tickets-db';

/**
 * Overall ticket statistics
 */
export interface TicketStats {
  totalTickets: number;
  byStatus: Record<string, number>;
  blocked: number;
  averageAgeDays: number;
}

/**
 * Time-based metrics
 */
export interface TimeBasedMetrics {
  ticketsByAgeRanges: Record<string, number>;
  staleTickets: number;
}

/**
 * Analytics data
 */
export interface TicketAnalytics {
  ticketsCreatedOverTime: Array<{ date: string; count: number }>;
  ticketsCompletedOverTime: Array<{ date: string; count: number }>;
  averageCompletionTimeHours: number | null;
  topCreators: Array<{ creator_id: string; count: number }>;
  oldestTickets: Array<{ id: number; title: string; created_at: string; daysSinceCreation: number }>;
}

/**
 * Distribution statistics
 */
export interface DistributionStats {
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
}

/**
 * Tickets Stats Service
 *
 * Handles statistics calculation and analytics aggregation for tickets.
 */
export class TicketsStatsService {
  /**
   * Get overall ticket statistics
   */
  getTicketStats(filters: { status?: string } = {}): TicketStats {
    const db = getDB();
    let query = 'SELECT COUNT(*) as count FROM tickets WHERE is_deleted = 0';
    const params: any[] = [];

    if (filters.status && filters.status !== 'all') {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    const totalResult = db.prepare(query).get(...params) as { count: number };

    // Get tickets by status
    const ticketsByStatus = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM tickets
      WHERE is_deleted = 0
      GROUP BY status
    `).all() as any[];

    const byStatus: Record<string, number> = ticketsByStatus.reduce(
      (acc: Record<string, number>, row: any) => {
        acc[row.status] = row.count;
        return acc;
      },
      {}
    );

    // Calculate blocked tickets (tickets with dependencies that aren't completed)
    const allTickets = db.prepare('SELECT * FROM tickets WHERE is_deleted = 0').all() as any[];
    let blocked = 0;
    let totalAge = 0;

    for (const ticket of allTickets) {
      const dependencies = ticket.dependencies ? JSON.parse(ticket.dependencies) : [];
      if (dependencies.length > 0) {
        let isBlocked = false;
        for (const depId of dependencies) {
          const depTicket = db.prepare('SELECT status FROM tickets WHERE id = ? AND is_deleted = 0').get(depId) as { status: string } | undefined;
          if (!depTicket || !['completed', 'declined'].includes(depTicket.status)) {
            isBlocked = true;
            break;
          }
        }
        if (isBlocked) {
          blocked++;
        }
      }

      // Calculate age
      const createdDate = new Date(ticket.created_at);
      const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      totalAge += daysSinceCreation;
    }

    const averageAgeDays = allTickets.length > 0 ? Math.round(totalAge / allTickets.length) : 0;

    return {
      totalTickets: totalResult.count,
      byStatus,
      blocked,
      averageAgeDays
    };
  }

  /**
   * Get status distribution
   */
  getStatusDistribution(): Record<string, number> {
    const db = getDB();

    const ticketsByStatus = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM tickets
      WHERE is_deleted = 0
      GROUP BY status
    `).all() as any[];

    return ticketsByStatus.reduce(
      (acc: Record<string, number>, row: any) => {
        acc[row.status] = row.count;
        return acc;
      },
      {}
    );
  }

  /**
   * Get type distribution
   */
  getTypeDistribution(): Record<string, number> {
    const db = getDB();

    const ticketsByType = db.prepare(`
      SELECT type, COUNT(*) as count
      FROM tickets
      WHERE is_deleted = 0
      GROUP BY type
    `).all() as any[];

    return ticketsByType.reduce(
      (acc: Record<string, number>, row: any) => {
        acc[row.type] = row.count;
        return acc;
      },
      {}
    );
  }

  /**
   * Get priority distribution
   */
  getPriorityDistribution(): Record<string, number> {
    const db = getDB();

    const ticketsByPriority = db.prepare(`
      SELECT priority, COUNT(*) as count
      FROM tickets
      WHERE is_deleted = 0
      GROUP BY priority
    `).all() as any[];

    return ticketsByPriority.reduce(
      (acc: Record<string, number>, row: any) => {
        acc[row.priority] = row.count;
        return acc;
      },
      {}
    );
  }

  /**
   * Get category distribution
   */
  getCategoryDistribution(): Record<string, number> {
    const db = getDB();

    const ticketsByCategory = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM tickets
      WHERE is_deleted = 0 AND category IS NOT NULL AND category != ''
      GROUP BY category
    `).all() as any[];

    return ticketsByCategory.reduce(
      (acc: Record<string, number>, row: any) => {
        acc[row.category] = row.count;
        return acc;
      },
      {}
    );
  }

  /**
   * Get all distribution statistics
   */
  getAllDistributions(): DistributionStats {
    return {
      byStatus: this.getStatusDistribution(),
      byType: this.getTypeDistribution(),
      byPriority: this.getPriorityDistribution(),
      byCategory: this.getCategoryDistribution()
    };
  }

  /**
   * Get tickets created over time (chart data)
   */
  getTicketsCreatedOverTime(days: number = 30): Array<{ date: string; count: number }> {
    const db = getDB();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const tickets = db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM tickets
      WHERE is_deleted = 0 AND created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all(cutoffDate.toISOString()) as Array<{ date: string; count: number }>;

    return tickets;
  }

  /**
   * Get tickets completed over time (completion rate trend)
   */
  getTicketsCompletedOverTime(days: number = 30): Array<{ date: string; count: number }> {
    const db = getDB();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const tickets = db.prepare(`
      SELECT DATE(updated_at) as date, COUNT(*) as count
      FROM tickets
      WHERE is_deleted = 0 AND status IN ('completed', 'declined') AND updated_at >= ?
      GROUP BY DATE(updated_at)
      ORDER BY date ASC
    `).all(cutoffDate.toISOString()) as Array<{ date: string; count: number }>;

    return tickets;
  }

  /**
   * Get average completion time
   */
  getAverageCompletionTime(): number | null {
    const db = getDB();

    const completedTickets = db.prepare(`
      SELECT created_at, updated_at
      FROM tickets
      WHERE status IN ('completed', 'completed') AND is_deleted = 0
    `).all() as Array<{ created_at: string; updated_at: string }>;

    if (completedTickets.length < 2) {
      return null;
    }

    let totalCompletionTime = 0;
    for (const ticket of completedTickets) {
      const created = new Date(ticket.created_at);
      const updated = new Date(ticket.updated_at);
      const completionTimeHours = (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
      totalCompletionTime += completionTimeHours;
    }

    return Math.round((totalCompletionTime / completedTickets.length) * 100) / 100;
  }

  /**
   * Get top creators
   */
  getTopCreators(limit: number = 10): Array<{ creator_id: string; count: number }> {
    const db = getDB();

    const creators = db.prepare(`
      SELECT creator_id, COUNT(*) as count
      FROM tickets
      WHERE is_deleted = 0 AND creator_id IS NOT NULL
      GROUP BY creator_id
      ORDER BY count DESC
      LIMIT ?
    `).all(limit) as Array<{ creator_id: string; count: number }>;

    return creators;
  }

  /**
   * Get oldest tickets
   */
  getOldestTickets(limit: number = 10): Array<{ id: number; title: string; created_at: string; daysSinceCreation: number }> {
    const db = getDB();

    const tickets = db.prepare(`
      SELECT id, title, created_at
      FROM tickets
      WHERE is_deleted = 0 AND status IN ('pending', 'needs-info', 'unresolved')
      ORDER BY created_at ASC
      LIMIT ?
    `).all(limit) as Array<{ id: number; title: string; created_at: string }>;

    const now = Date.now();
    return tickets.map(ticket => {
      const createdDate = new Date(ticket.created_at);
      const daysSinceCreation = Math.floor((now - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      return {
        ...ticket,
        daysSinceCreation
      };
    });
  }

  /**
   * Get tickets grouped by age ranges
   */
  getTicketsByAgeRanges(): Record<string, number> {
    const db = getDB();

    const tickets = db.prepare('SELECT created_at FROM tickets WHERE is_deleted = 0').all() as Array<{ created_at: string }>;

    const ranges: Record<string, number> = {
      '0-7 days': 0,
      '8-30 days': 0,
      '31-90 days': 0,
      '90+ days': 0
    };

    const now = Date.now();
    for (const ticket of tickets) {
      const createdDate = new Date(ticket.created_at);
      const daysSinceCreation = Math.floor((now - createdDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceCreation <= 7) {
        ranges['0-7 days']++;
      } else if (daysSinceCreation <= 30) {
        ranges['8-30 days']++;
      } else if (daysSinceCreation <= 90) {
        ranges['31-90 days']++;
      } else {
        ranges['90+ days']++;
      }
    }

    return ranges;
  }

  /**
   * Get stale tickets (in needs-info status for too long)
   */
  getStaleTickets(thresholdDays: number = 7): number {
    const db = getDB();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - thresholdDays);

    const staleTickets = db.prepare(`
      SELECT COUNT(*) as count
      FROM tickets
      WHERE status = 'needs-info' AND updated_at < ? AND is_deleted = 0
    `).get(cutoffDate.toISOString()) as { count: number };

    return staleTickets.count;
  }

  /**
   * Get comprehensive statistics for the dashboard
   */
  getDashboardStats(): {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    oldestTicket: any;
    newestTicket: any;
    dates: any;
  } {
    const db = getDB();

    // Get total ticket count
    const totalTickets = db.prepare('SELECT COUNT(*) as count FROM tickets WHERE is_deleted = 0').get() as { count: number };

    // Get tickets by status
    const ticketsByStatus = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM tickets
      WHERE is_deleted = 0
      GROUP BY status
    `).all() as any[];

    const byStatus: Record<string, number> = ticketsByStatus.reduce(
      (acc: Record<string, number>, row: any) => {
        acc[row.status] = row.count;
        return acc;
      },
      {}
    );

    // Get oldest ticket
    const oldestTicket = db.prepare(`
      SELECT id, title, created_at
      FROM tickets
      WHERE is_deleted = 0
      ORDER BY created_at ASC
      LIMIT 1
    `).get() as any;

    // Get newest ticket
    const newestTicket = db.prepare(`
      SELECT id, title, created_at
      FROM tickets
      WHERE is_deleted = 0
      ORDER BY created_at DESC
      LIMIT 1
    `).get() as any;

    // Get date ranges
    const dates = db.prepare(`
      SELECT
        MIN(created_at) as oldestCreated,
        MAX(created_at) as newestCreated,
        MIN(CASE WHEN status = 'completed' THEN updated_at END) as oldestCompleted,
        MAX(CASE WHEN status = 'completed' THEN updated_at END) as newestCompleted
      FROM tickets
      WHERE is_deleted = 0
    `).get() as any;

    return {
      total: totalTickets.count,
      byStatus,
      byType: this.getTypeDistribution(),
      byPriority: this.getPriorityDistribution(),
      oldestTicket,
      newestTicket,
      dates: {
        oldestCreated: dates.oldestCreated,
        newestCreated: dates.newestCreated,
        oldestCompleted: dates.oldestCompleted || null,
        newestCompleted: dates.newestCompleted || null
      }
    };
  }

  /**
   * Get estimated wait time for new tickets
   */
  getEstimatedWaitTime(): {
    estimatedWaitTimeMinutes: number | null;
    sampleSize: number;
    averageCompletionTimeHours: number | null;
  } {
    const db = getDB();

    // Get the last 10 completed tickets
    const completedTickets = db.prepare(`
      SELECT created_at, updated_at
      FROM tickets
      WHERE status IN ('completed', 'complete')
        AND is_deleted = 0
      ORDER BY updated_at DESC
      LIMIT 10
    `).all() as Array<{ created_at: string; updated_at: string }>;

    // If we have fewer than 2 completed tickets, return null
    if (completedTickets.length < 2) {
      return {
        estimatedWaitTimeMinutes: null,
        sampleSize: completedTickets.length,
        averageCompletionTimeHours: null
      };
    }

    // Calculate the average completion time
    let totalCompletionTime = 0;
    for (const ticket of completedTickets) {
      const created = new Date(ticket.created_at);
      const updated = new Date(ticket.updated_at);
      const completionTimeHours = (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
      totalCompletionTime += completionTimeHours;
    }

    const averageCompletionTimeHours = totalCompletionTime / completedTickets.length;
    const estimatedWaitTimeMinutes = Math.round(averageCompletionTimeHours * 60);

    return {
      estimatedWaitTimeMinutes,
      sampleSize: completedTickets.length,
      averageCompletionTimeHours: Math.round(averageCompletionTimeHours * 100) / 100
    };
  }

  /**
   * Get all tags with usage counts
   */
  getAllTags(): Array<{ name: string; count: number }> {
    const db = getDB();

    const tickets = db.prepare('SELECT tags FROM tickets WHERE tags IS NOT NULL AND tags != "" AND is_deleted = 0').all() as Array<{ tags: string }>;

    const tagCounts: Record<string, number> = {};
    for (const ticket of tickets) {
      const tags = ticket.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      for (const tag of tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    return Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get all categories with usage counts
   */
  getAllCategories(): Array<{ name: string; count: number }> {
    const db = getDB();

    const tickets = db.prepare('SELECT category FROM tickets WHERE category IS NOT NULL AND category != "" AND is_deleted = 0').all() as Array<{ category: string }>;

    const categoryCounts: Record<string, number> = {};
    for (const ticket of tickets) {
      const category = ticket.category.trim();
      if (category.length > 0) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    }

    return Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }
}

// Export singleton instance
export const ticketsStatsService = new TicketsStatsService();
