import { prisma } from '../lib/prisma';

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
  async getTicketStats(filters: { status?: string } = {}): Promise<TicketStats> {
    const where: any = { is_deleted: false };
    if (filters.status && filters.status !== 'all') {
      where.status = filters.status;
    }

    const totalTickets = await prisma.ticket.count({ where });

    const ticketsByStatus = await prisma.ticket.groupBy({
      by: ['status'],
      where: { is_deleted: false },
      _count: { status: true }
    });

    const byStatus: Record<string, number> = ticketsByStatus.reduce(
      (acc, row) => {
        acc[row.status] = row._count.status;
        return acc;
      },
      {} as Record<string, number>
    );

    const allTickets = await prisma.ticket.findMany({
      where: { is_deleted: false },
      select: { dependencies: true, created_at: true }
    });

    let blocked = 0;
    let totalAge = 0;
    const now = Date.now();

    for (const ticket of allTickets) {
      const dependencies: number[] = ticket.dependencies ? JSON.parse(ticket.dependencies) : [];
      if (dependencies.length > 0) {
        let isBlocked = false;
        for (const depId of dependencies) {
          const depTicket = await prisma.ticket.findUnique({
            where: { id: depId },
            select: { status: true, is_deleted: true }
          });
          if (!depTicket || depTicket.is_deleted || !['completed', 'declined'].includes(depTicket.status)) {
            isBlocked = true;
            break;
          }
        }
        if (isBlocked) blocked++;
      }
      totalAge += Math.floor((now - ticket.created_at.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      totalTickets,
      byStatus,
      blocked,
      averageAgeDays: allTickets.length > 0 ? Math.round(totalAge / allTickets.length) : 0
    };
  }

  /**
   * Get status distribution
   */
  async getStatusDistribution(): Promise<Record<string, number>> {
    const rows = await prisma.ticket.groupBy({
      by: ['status'],
      where: { is_deleted: false },
      _count: { status: true }
    });

    return rows.reduce((acc, row) => {
      acc[row.status] = row._count.status;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Get type distribution
   */
  async getTypeDistribution(): Promise<Record<string, number>> {
    const rows = await prisma.ticket.groupBy({
      by: ['type'],
      where: { is_deleted: false },
      _count: { type: true }
    });

    return rows.reduce((acc, row) => {
      acc[row.type] = row._count.type;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Get priority distribution
   */
  async getPriorityDistribution(): Promise<Record<string, number>> {
    const rows = await prisma.ticket.groupBy({
      by: ['priority'],
      where: { is_deleted: false },
      _count: { priority: true }
    });

    return rows.reduce((acc, row) => {
      acc[row.priority] = row._count.priority;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Get category distribution
   */
  async getCategoryDistribution(): Promise<Record<string, number>> {
    const rows = await prisma.ticket.groupBy({
      by: ['category'],
      where: { is_deleted: false, category: { not: null } },
      _count: { category: true }
    });

    return rows.reduce((acc, row) => {
      if (row.category) acc[row.category] = row._count.category;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Get all distribution statistics
   */
  async getAllDistributions(): Promise<DistributionStats> {
    const [byStatus, byType, byPriority, byCategory] = await Promise.all([
      this.getStatusDistribution(),
      this.getTypeDistribution(),
      this.getPriorityDistribution(),
      this.getCategoryDistribution()
    ]);
    return { byStatus, byType, byPriority, byCategory };
  }

  /**
   * Get tickets created over time (chart data)
   */
  async getTicketsCreatedOverTime(days: number = 30): Promise<Array<{ date: string; count: number }>> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const tickets = await prisma.ticket.findMany({
      where: { is_deleted: false, created_at: { gte: cutoffDate } },
      select: { created_at: true }
    });

    const dateCounts: Record<string, number> = {};
    for (const ticket of tickets) {
      const dateStr = ticket.created_at.toISOString().split('T')[0];
      dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    }

    return Object.entries(dateCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get tickets completed over time (completion rate trend)
   */
  async getTicketsCompletedOverTime(days: number = 30): Promise<Array<{ date: string; count: number }>> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const tickets = await prisma.ticket.findMany({
      where: {
        is_deleted: false,
        status: { in: ['completed', 'declined'] },
        updated_at: { gte: cutoffDate }
      },
      select: { updated_at: true }
    });

    const dateCounts: Record<string, number> = {};
    for (const ticket of tickets) {
      const dateStr = ticket.updated_at.toISOString().split('T')[0];
      dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    }

    return Object.entries(dateCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get average completion time
   */
  async getAverageCompletionTime(): Promise<number | null> {
    const completedTickets = await prisma.ticket.findMany({
      where: { status: 'completed', is_deleted: false },
      select: { created_at: true, updated_at: true }
    });

    if (completedTickets.length < 2) return null;

    let totalCompletionTime = 0;
    for (const ticket of completedTickets) {
      totalCompletionTime += (ticket.updated_at.getTime() - ticket.created_at.getTime()) / (1000 * 60 * 60);
    }

    return Math.round((totalCompletionTime / completedTickets.length) * 100) / 100;
  }

  /**
   * Get top creators
   */
  async getTopCreators(limit: number = 10): Promise<Array<{ creator_id: string; count: number }>> {
    const creators = await prisma.ticket.groupBy({
      by: ['creator_id'],
      where: { is_deleted: false, creator_id: { not: null } },
      _count: { creator_id: true },
      orderBy: { _count: { creator_id: 'desc' } },
      take: limit
    });

    return creators
      .filter(c => c.creator_id !== null)
      .map(c => ({ creator_id: c.creator_id as string, count: c._count.creator_id }));
  }

  /**
   * Get oldest tickets
   */
  async getOldestTickets(limit: number = 10): Promise<Array<{ id: number; title: string; created_at: string; daysSinceCreation: number }>> {
    const tickets = await prisma.ticket.findMany({
      where: { is_deleted: false, status: { in: ['pending', 'needs-info', 'unresolved'] } },
      select: { id: true, title: true, created_at: true },
      orderBy: { created_at: 'asc' },
      take: limit
    });

    const now = Date.now();
    return tickets.map(ticket => ({
      id: ticket.id,
      title: ticket.title,
      created_at: ticket.created_at.toISOString(),
      daysSinceCreation: Math.floor((now - ticket.created_at.getTime()) / (1000 * 60 * 60 * 24))
    }));
  }

  /**
   * Get tickets grouped by age ranges
   */
  async getTicketsByAgeRanges(): Promise<Record<string, number>> {
    const tickets = await prisma.ticket.findMany({
      where: { is_deleted: false },
      select: { created_at: true }
    });

    const ranges: Record<string, number> = {
      '0-7 days': 0,
      '8-30 days': 0,
      '31-90 days': 0,
      '90+ days': 0
    };

    const now = Date.now();
    for (const ticket of tickets) {
      const days = Math.floor((now - ticket.created_at.getTime()) / (1000 * 60 * 60 * 24));
      if (days <= 7) ranges['0-7 days']++;
      else if (days <= 30) ranges['8-30 days']++;
      else if (days <= 90) ranges['31-90 days']++;
      else ranges['90+ days']++;
    }

    return ranges;
  }

  /**
   * Get stale tickets (in needs-info status for too long)
   */
  async getStaleTickets(thresholdDays: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - thresholdDays);

    return prisma.ticket.count({
      where: { status: 'needs-info', updated_at: { lt: cutoffDate }, is_deleted: false }
    });
  }

  /**
   * Get comprehensive statistics for the dashboard
   */
  async getDashboardStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    oldestTicket: any;
    newestTicket: any;
    dates: any;
  }> {
    const [total, ticketsByStatus, byType, byPriority, oldestTicket, newestTicket, dateRanges, completedDateRange] = await Promise.all([
      prisma.ticket.count({ where: { is_deleted: false } }),
      prisma.ticket.groupBy({
        by: ['status'],
        where: { is_deleted: false },
        _count: { status: true }
      }),
      this.getTypeDistribution(),
      this.getPriorityDistribution(),
      prisma.ticket.findFirst({
        where: { is_deleted: false },
        select: { id: true, title: true, created_at: true },
        orderBy: { created_at: 'asc' }
      }),
      prisma.ticket.findFirst({
        where: { is_deleted: false },
        select: { id: true, title: true, created_at: true },
        orderBy: { created_at: 'desc' }
      }),
      prisma.ticket.aggregate({
        where: { is_deleted: false },
        _min: { created_at: true },
        _max: { created_at: true }
      }),
      prisma.ticket.aggregate({
        where: { is_deleted: false, status: 'completed' },
        _min: { updated_at: true },
        _max: { updated_at: true }
      })
    ]);

    const byStatus = ticketsByStatus.reduce((acc, row) => {
      acc[row.status] = row._count.status;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byStatus,
      byType,
      byPriority,
      oldestTicket,
      newestTicket,
      dates: {
        oldestCreated: dateRanges._min.created_at?.toISOString() || null,
        newestCreated: dateRanges._max.created_at?.toISOString() || null,
        oldestCompleted: completedDateRange._min.updated_at?.toISOString() || null,
        newestCompleted: completedDateRange._max.updated_at?.toISOString() || null
      }
    };
  }

  /**
   * Get estimated wait time for new tickets
   */
  async getEstimatedWaitTime(): Promise<{
    estimatedWaitTimeMinutes: number | null;
    sampleSize: number;
    averageCompletionTimeHours: number | null;
  }> {
    const completedTickets = await prisma.ticket.findMany({
      where: { status: 'completed', is_deleted: false },
      select: { created_at: true, updated_at: true },
      orderBy: { updated_at: 'desc' },
      take: 10
    });

    if (completedTickets.length < 2) {
      return {
        estimatedWaitTimeMinutes: null,
        sampleSize: completedTickets.length,
        averageCompletionTimeHours: null
      };
    }

    let totalCompletionTime = 0;
    for (const ticket of completedTickets) {
      totalCompletionTime += (ticket.updated_at.getTime() - ticket.created_at.getTime()) / (1000 * 60 * 60);
    }

    const averageCompletionTimeHours = totalCompletionTime / completedTickets.length;

    return {
      estimatedWaitTimeMinutes: Math.round(averageCompletionTimeHours * 60),
      sampleSize: completedTickets.length,
      averageCompletionTimeHours: Math.round(averageCompletionTimeHours * 100) / 100
    };
  }

  /**
   * Get all tags with usage counts
   */
  async getAllTags(): Promise<Array<{ name: string; count: number }>> {
    const tickets = await prisma.ticket.findMany({
      where: { is_deleted: false, tags: { not: null } },
      select: { tags: true }
    });

    const tagCounts: Record<string, number> = {};
    for (const ticket of tickets) {
      if (!ticket.tags) continue;
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
  async getAllCategories(): Promise<Array<{ name: string; count: number }>> {
    const rows = await prisma.ticket.groupBy({
      by: ['category'],
      where: { is_deleted: false, category: { not: null } },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } }
    });

    return rows
      .filter(r => r.category && r.category.trim().length > 0)
      .map(r => ({ name: r.category as string, count: r._count.category }));
  }
}

// Export singleton instance
export const ticketsStatsService = new TicketsStatsService();
