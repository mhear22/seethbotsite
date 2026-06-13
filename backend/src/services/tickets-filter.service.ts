import { prisma } from '../lib/prisma';
import { safeJsonParse, isTicketBlocked } from './tickets-db';
import { TicketWithComputed, ticketsService } from './tickets.service';

/**
 * Filter options for tickets
 */
export interface TicketFilters {
  status?: string;
  type?: string;
  priority?: string;
  tag?: string;
  category?: string;
  sortBy?: 'relevance' | 'created_at' | 'updated_at';
}

/**
 * Tickets Filter Service
 *
 * Handles filtering, searching, and sorting of tickets.
 */
export class TicketsFilterService {
  /**
   * Build Prisma where clause from filters
   */
  buildWhereClause(filters: TicketFilters): any {
    const { status = 'all', type = 'all', priority = 'all', tag, category } = filters;

    const where: any = { is_deleted: false };

    // Map "in-progress" to "needs-info" for frontend compatibility
    const statusFilter = status === 'in-progress' ? 'needs-info' : status;

    if (statusFilter !== 'all') {
      where.status = statusFilter;
    }

    if (type !== 'all') {
      where.type = type;
    }

    if (priority !== 'all') {
      where.priority = priority;
    }

    // Filter by tag (tags are comma-separated, so we use contains)
    if (tag && typeof tag === 'string') {
      where.tags = { contains: tag };
    }

    // Filter by category
    if (category && typeof category === 'string') {
      where.category = category;
    }

    return where;
  }

  /**
   * Filter by status array
   */
  addStatusFilter(where: any, statuses: string[]): any {
    if (!statuses || statuses.length === 0) {
      return where;
    }

    where.status = { in: statuses };
    return where;
  }

  /**
   * Filter by type array
   */
  addTypeFilter(where: any, types: string[]): any {
    if (!types || types.length === 0) {
      return where;
    }

    where.type = { in: types };
    return where;
  }

  /**
   * Filter by priority array
   */
  addPriorityFilter(where: any, priorities: string[]): any {
    if (!priorities || priorities.length === 0) {
      return where;
    }

    where.priority = { in: priorities };
    return where;
  }

  /**
   * Filter by category array
   */
  addCategoryFilter(where: any, categories: string[]): any {
    if (!categories || categories.length === 0) {
      return where;
    }

    where.category = { in: categories };
    return where;
  }

  /**
   * Filter by creator
   */
  addCreatorFilter(where: any, creatorId: string): any {
    if (!creatorId) {
      return where;
    }

    where.creator_id = creatorId;
    return where;
  }

  /**
   * Filter by blocked status
   */
  async filterByBlocked(tickets: TicketWithComputed[], blocked: boolean): Promise<TicketWithComputed[]> {
    if (blocked === undefined) {
      return tickets;
    }

    return tickets.filter(ticket => ticket.blocked === blocked);
  }

  /**
   * Search tickets by term
   * Searches in title and description fields
   */
  async searchTickets(filters: TicketFilters, searchTerm: string): Promise<TicketWithComputed[]> {
    const where = this.buildWhereClause(filters);

    // Add search condition
    where.OR = [
      { title: { contains: searchTerm } },
      { description: { contains: searchTerm } }
    ];

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { created_at: 'desc' }
    });

    // Add computed fields to each ticket
    return Promise.all(tickets.map(async (ticket) => {
      const dependencies = safeJsonParse<number[]>(ticket.dependencies, []);

      return {
        ...ticket,
        dependencies,
        blocked: await isTicketBlocked(dependencies)
      };
    }));
  }

  /**
   * Build Prisma orderBy from sortBy parameter
   */
  buildOrderBy(sortBy: string = 'created_at'): any {
    if (sortBy === 'relevance') {
      // For relevance, we'll sort in memory after fetching
      // Sort by status priority first, then by created_at
      return { created_at: 'asc' as const };
    } else if (sortBy === 'created_at' || sortBy === 'updated_at') {
      return { [sortBy]: 'desc' as const };
    } else {
      return { created_at: 'asc' as const };
    }
  }

  /**
   * Get filtered tickets with sorting and pagination
   */
  async getFilteredTickets(filters: TicketFilters & { page?: number; limit?: number }): Promise<{
    tickets: TicketWithComputed[];
    total: number;
  }> {
    const { page = 1, limit = 50, sortBy = 'relevance' } = filters;

    // Build where clause
    const where = this.buildWhereClause(filters);

    // Get total count
    const total = await prisma.ticket.count({ where });

    // Get tickets with pagination
    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: this.buildOrderBy(sortBy),
      skip: (page - 1) * limit,
      take: limit
    });

    // Parse dependencies once per ticket
    const parsedDependencies = tickets.map(ticket =>
      safeJsonParse<number[]>(ticket.dependencies, [])
    );

    // Batch-fetch all dependency statuses in a single query to avoid an N+1
    // (previously each ticket awaited isTicketBlocked, which queried per dependency).
    const allDepIds = Array.from(new Set(parsedDependencies.flat()));
    const depTickets = allDepIds.length > 0
      ? await prisma.ticket.findMany({
          where: { id: { in: allDepIds } },
          select: { id: true, status: true }
        })
      : [];
    const depStatusById = new Map(depTickets.map(dep => [dep.id, dep.status]));

    // A ticket is blocked if any dependency is missing OR its status is not
    // completed/declined (preserving isTicketBlocked semantics).
    const isBlocked = (dependencies: number[]): boolean => {
      if (!dependencies || dependencies.length === 0) return false;
      return dependencies.some(depId => {
        const status = depStatusById.get(depId);
        return status === undefined || !['completed', 'declined'].includes(status);
      });
    };

    // Add computed fields to each ticket
    const ticketsWithComputed = tickets.map((ticket, index) => {
      const dependencies = parsedDependencies[index];

      return {
        ...ticket,
        dependencies,
        blocked: isBlocked(dependencies),
        relevanceScore: ticketsService.calculateRelevanceScore(ticket),
        daysSinceCreation: ticketsService.getDaysSinceCreation(ticket)
      };
    });

    // If sorting by relevance, sort the results in memory
    if (sortBy === 'relevance') {
      // Custom sort: by status priority, then by relevance score
      const statusPriority: Record<string, number> = {
        'pending': 1,
        'needs-info': 2,
        'unresolved': 2.5,
        'completed': 3,
        'declined': 4
      };

      ticketsWithComputed.sort((a, b) => {
        const priorityA = statusPriority[a.status] || 5;
        const priorityB = statusPriority[b.status] || 5;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        return b.relevanceScore - a.relevanceScore;
      });
    }

    return { tickets: ticketsWithComputed, total };
  }
}

// Export singleton instance
export const ticketsFilterService = new TicketsFilterService();
