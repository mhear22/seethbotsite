import Database from 'better-sqlite3';
import { getDB } from './tickets-db';
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
   * Build filter query
   * Returns SQL query and parameters
   */
  buildFilterQuery(filters: TicketFilters): { query: string; params: any[] } {
    const { status = 'all', type = 'all', priority = 'all', tag, category } = filters;

    let query = 'SELECT * FROM tickets WHERE is_deleted = 0';
    const params: any[] = [];

    // Map "in-progress" to "needs-info" for frontend compatibility
    const statusFilter = status === 'in-progress' ? 'needs-info' : status;

    if (statusFilter !== 'all') {
      query += ' AND status = ?';
      params.push(statusFilter);
    }

    if (type !== 'all') {
      query += ' AND type = ?';
      params.push(type);
    }

    if (priority !== 'all') {
      query += ' AND priority = ?';
      params.push(priority);
    }

    // Filter by tag (tags are comma-separated, so we use LIKE)
    if (tag && typeof tag === 'string') {
      query += ' AND tags LIKE ?';
      params.push(`%${tag}%`);
    }

    // Filter by category
    if (category && typeof category === 'string') {
      query += ' AND category = ?';
      params.push(category);
    }

    return { query, params };
  }

  /**
   * Filter by status array
   */
  filterByStatus(query: string, params: any[], statuses: string[]): { query: string; params: any[] } {
    if (!statuses || statuses.length === 0) {
      return { query, params };
    }

    const placeholders = statuses.map(() => '?').join(',');
    query += ` AND status IN (${placeholders})`;
    params.push(...statuses);

    return { query, params };
  }

  /**
   * Filter by type array
   */
  filterByType(query: string, params: any[], types: string[]): { query: string; params: any[] } {
    if (!types || types.length === 0) {
      return { query, params };
    }

    const placeholders = types.map(() => '?').join(',');
    query += ` AND type IN (${placeholders})`;
    params.push(...types);

    return { query, params };
  }

  /**
   * Filter by priority array
   */
  filterByPriority(query: string, params: any[], priorities: string[]): { query: string; params: any[] } {
    if (!priorities || priorities.length === 0) {
      return { query, params };
    }

    const placeholders = priorities.map(() => '?').join(',');
    query += ` AND priority IN (${placeholders})`;
    params.push(...priorities);

    return { query, params };
  }

  /**
   * Filter by category array
   */
  filterByCategory(query: string, params: any[], categories: string[]): { query: string; params: any[] } {
    if (!categories || categories.length === 0) {
      return { query, params };
    }

    const placeholders = categories.map(() => '?').join(',');
    query += ` AND category IN (${placeholders})`;
    params.push(...categories);

    return { query, params };
  }

  /**
   * Filter by creator
   */
  filterByCreator(query: string, params: any[], creatorId: string): { query: string; params: any[] } {
    if (!creatorId) {
      return { query, params };
    }

    query += ' AND creator_id = ?';
    params.push(creatorId);

    return { query, params };
  }

  /**
   * Filter by blocked status
   */
  filterByBlocked(query: string, params: any[], blocked: boolean): { query: string; params: any[] } {
    if (blocked === undefined) {
      return { query, params };
    }

    // Note: This is a simplified check - in production, you'd need to
    // fetch tickets with dependencies and check their status
    // For now, we'll handle this in application logic after fetching
    return { query, params };
  }

  /**
   * Search tickets by term
   * Searches in title and description fields
   */
  searchTickets(filters: TicketFilters, searchTerm: string): TicketWithComputed[] {
    const db = getDB();
    let { query, params } = this.buildFilterQuery(filters);

    // Add search condition
    query += ' AND (title LIKE ? OR description LIKE ?)';
    const searchPattern = `%${searchTerm}%`;
    params.push(searchPattern, searchPattern);

    // Sort by created_at
    query += ' ORDER BY created_at DESC';

    const tickets = db.prepare(query).all(...params) as any[];

    // Add computed fields to each ticket
    return tickets.map((ticket: any) => {
      const dependencies = ticket.dependencies
        ? JSON.parse(ticket.dependencies)
        : [];

      return {
        ...ticket,
        dependencies,
        blocked: this.isTicketBlockedLocal(db, dependencies)
      };
    });
  }

  /**
   * Build sort query
   */
  buildSortQuery(query: string, sortBy: string = 'created_at'): string {
    if (sortBy === 'relevance') {
      // Sort by relevance: older pending tickets first, then newer
      query += ' ORDER BY CASE status ' +
                'WHEN \'pending\' THEN 1 ' +
                'WHEN \'needs-info\' THEN 2 ' +
                'WHEN \'unresolved\' THEN 2.5 ' +
                'WHEN \'completed\' THEN 3 ' +
                'WHEN \'declined\' THEN 4 ' +
                'ELSE 5 END, created_at ASC';
    } else if (sortBy === 'created_at' || sortBy === 'updated_at') {
      query += ` ORDER BY ${sortBy} DESC`;
    } else {
      query += ' ORDER BY created_at ASC';
    }

    return query;
  }

  /**
   * Build pagination query
   */
  buildPaginationQuery(query: string, page: number = 1, limit: number = 50): { query: string; offset: number } {
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    return { query, offset };
  }

  /**
   * Get filtered tickets with sorting and pagination
   */
  async getFilteredTickets(filters: TicketFilters & { page?: number; limit?: number }): Promise<{
    tickets: TicketWithComputed[];
    total: number;
  }> {
    const db = getDB();
    const { page = 1, limit = 50, sortBy = 'relevance' } = filters;

    // Build base query
    let { query, params } = this.buildFilterQuery(filters);

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const totalResult = db.prepare(countQuery).get(...params) as { count: number };
    const total = totalResult.count;

    // Add sorting
    query = this.buildSortQuery(query, sortBy);

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const tickets = db.prepare(query).all(...params) as any[];

    // Add computed fields to each ticket
    const ticketsWithComputed = tickets.map((ticket: any) => {
      const dependencies = ticket.dependencies
        ? JSON.parse(ticket.dependencies)
        : [];

      return {
        ...ticket,
        dependencies,
        blocked: this.isTicketBlockedLocal(db, dependencies),
        relevanceScore: ticketsService.calculateRelevanceScore(ticket),
        daysSinceCreation: ticketsService.getDaysSinceCreation(ticket)
      };
    });

    // If sorting by relevance, sort the results
    if (sortBy === 'relevance') {
      ticketsWithComputed.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    return { tickets: ticketsWithComputed, total };
  }

  /**
   * Local helper to check if ticket is blocked (avoids circular dependency)
   */
  private isTicketBlockedLocal(db: Database.Database, dependencies: number[]): boolean {
    if (!dependencies || dependencies.length === 0) return false;

    for (const depId of dependencies) {
      const depTicket = db.prepare('SELECT status FROM tickets WHERE id = ? AND is_deleted = 0').get(depId) as { status: string } | undefined;
      if (!depTicket || !['completed', 'declined'].includes(depTicket.status)) {
        return true;
      }
    }

    return false;
  }
}

// Export singleton instance
export const ticketsFilterService = new TicketsFilterService();
