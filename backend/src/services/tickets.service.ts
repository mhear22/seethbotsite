import Database from 'better-sqlite3';
import { getDB, parseDependencies, isTicketBlocked, safeJsonParse } from './tickets-db';

/**
 * Create ticket DTO
 */
export interface CreateTicketDTO {
  title: string;
  description?: string;
  creator_id?: string;
  type?: string;
  priority?: string;
  tags?: string;
  category?: string;
  dependencies?: number[];
}

/**
 * Update ticket DTO
 */
export interface UpdateTicketDTO {
  status?: string;
  response?: string;
  title?: string;
  description?: string;
  creator_id?: string;
  type?: string;
  priority?: string;
  tags?: string;
  category?: string;
  dependencies?: number[];
}

/**
 * Ticket response with computed fields
 */
export interface TicketWithComputed {
  id: number;
  title: string;
  description: string;
  status: string;
  response?: string;
  creator_id?: string;
  type: string;
  priority: string;
  tags?: string;
  category?: string;
  dependencies: number[];
  blocked: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Core Tickets Service
 *
 * Handles ticket CRUD operations including validation and business rules.
 */
export class TicketsService {
  /**
   * Create a new ticket
   */
  async createTicket(data: CreateTicketDTO): Promise<TicketWithComputed> {
    const { title, description, creator_id, type, priority, tags, category, dependencies } = data;

    // Validate required fields
    if (!title || title.trim().length === 0) {
      throw new Error('Title is required');
    }

    const db = getDB();

    // Parse dependencies from description if not explicitly provided
    let parsedDependencies: number[] = [];
    if (dependencies && Array.isArray(dependencies)) {
      parsedDependencies = dependencies;
    } else {
      parsedDependencies = parseDependencies(description || null);
    }

    // Validate dependencies exist
    for (const depId of parsedDependencies) {
      const exists = db.prepare('SELECT id FROM tickets WHERE id = ? AND is_deleted = 0').get(depId);
      if (!exists) {
        throw new Error(`Dependency ticket #${depId} does not exist`);
      }
    }

    // Check for circular dependencies
    // This would require a more complex check, for now we'll just validate that deps exist

    // Store dependencies as JSON string
    const dependenciesJson = parsedDependencies.length > 0 ? JSON.stringify(parsedDependencies) : null;

    // Auto-set status based on dependencies
    const initialStatus = parsedDependencies.length > 0 ? 'pending' : 'pending';

    const stmt = db.prepare(`
      INSERT INTO tickets (title, description, status, creator_id, type, priority, tags, category, dependencies, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    const result = stmt.run(
      title.trim(),
      (description || '').trim() || null,
      initialStatus,
      creator_id || null,
      type || 'feature',
      priority || 'medium',
      tags || null,
      category || null,
      dependenciesJson
    );

    const newTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(result.lastInsertRowid) as any;

    // Add computed fields to response
    return {
      ...newTicket,
      dependencies: parsedDependencies,
      blocked: isTicketBlocked(db, parsedDependencies)
    };
  }

  /**
   * Get a single ticket by ID
   */
  async getTicket(id: number): Promise<TicketWithComputed | null> {
    const db = getDB();

    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ? AND is_deleted = 0').get(id) as any;
    if (!ticket) {
      return null;
    }

    // Parse dependencies from database
    const dependencies = safeJsonParse<number[]>(ticket.dependencies, []);

    return {
      ...ticket,
      dependencies,
      blocked: isTicketBlocked(db, dependencies)
    };
  }

  /**
   * Get all tickets with optional filters
   */
  async getAllTickets(filters: {
    status?: string;
    type?: string;
    priority?: string;
    tag?: string;
    category?: string;
  } = {}): Promise<TicketWithComputed[]> {
    const db = getDB();
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

    // Sort by created_at for base query (filtering service handles complex sorting)
    query += ' ORDER BY created_at DESC';

    const tickets = db.prepare(query).all(...params) as any[];

    // Add computed fields to each ticket
    return tickets.map((ticket: any) => {
      const dependencies = safeJsonParse<number[]>(ticket.dependencies, []);

      return {
        ...ticket,
        dependencies,
        blocked: isTicketBlocked(db, dependencies)
      };
    });
  }

  /**
   * Update a ticket
   */
  async updateTicket(id: number, data: UpdateTicketDTO): Promise<TicketWithComputed> {
    const { status, response, title, description, type, priority, tags, category, dependencies } = data;

    // Check if any field is provided
    if (!status && !response && !title && !description && !tags && !category && !dependencies && !type && !priority) {
      throw new Error('At least one field must be provided');
    }

    // Validate status if provided
    if (status && !['pending', 'needs-info', 'completed', 'declined', 'unresolved'].includes(status)) {
      throw new Error('Invalid status value');
    }

    // Validate title/description if provided
    if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
      throw new Error('Title must be a non-empty string');
    }

    if (description !== undefined && (typeof description !== 'string' || description.trim().length === 0)) {
      throw new Error('Description must be a non-empty string');
    }

    const db = getDB();

    // Check if ticket exists (exclude soft-deleted)
    const existing = db.prepare('SELECT * FROM tickets WHERE id = ? AND is_deleted = 0').get(id) as any;
    if (!existing) {
      throw new Error('Ticket not found');
    }

    // Prevent editing tickets that are not in 'pending' status
    const isEditing = title !== undefined || description !== undefined;
    if (isEditing && existing.status !== 'pending') {
      throw new Error('Cannot edit tickets that are not in pending status');
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    // Auto-reset from "needs-info" to "pending" when user edits title/description
    const shouldResetStatus = (title !== undefined || description !== undefined) && existing.status === 'needs-info';

    if (status) {
      updates.push('status = ?');
      values.push(status);
    } else if (shouldResetStatus) {
      updates.push('status = ?');
      values.push('pending');
    }

    if (response !== undefined) {
      updates.push('response = ?');
      values.push(response);
    }
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title.trim());
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description.trim());
    }
    if (type !== undefined) {
      updates.push('type = ?');
      values.push(type);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      values.push(priority);
    }
    if (tags !== undefined) {
      updates.push('tags = ?');
      values.push(tags.trim());
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category.trim());
    }
    if (dependencies !== undefined) {
      // Allow manual override of dependencies
      const depsArray = Array.isArray(dependencies) ? dependencies : [];
      updates.push('dependencies = ?');
      values.push(depsArray.length > 0 ? JSON.stringify(depsArray) : null);
    }
    updates.push('updated_at = CURRENT_TIMESTAMP');

    const stmt = db.prepare(`UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values, id);

    const updatedTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id) as any;

    // Add computed fields to response
    const depsArray = safeJsonParse<number[]>(updatedTicket.dependencies, []);
    return {
      ...updatedTicket,
      dependencies: depsArray,
      blocked: isTicketBlocked(db, depsArray)
    };
  }

  /**
   * Soft delete a ticket
   */
  async deleteTicket(id: number, creator_id?: string): Promise<void> {
    const db = getDB();

    // Check if ticket exists (exclude soft-deleted)
    const existing = db.prepare('SELECT * FROM tickets WHERE id = ? AND is_deleted = 0').get(id) as any;
    if (!existing) {
      throw new Error('Ticket not found');
    }

    // Users can only delete their own tickets if creator_id is provided
    if (creator_id && existing.creator_id !== creator_id) {
      throw new Error('Unauthorized: You can only delete your own tickets');
    }

    const stmt = db.prepare('UPDATE tickets SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(id);
  }

  /**
   * Restore a soft-deleted ticket
   */
  async restoreTicket(id: number): Promise<TicketWithComputed> {
    const db = getDB();

    // Check if ticket exists (include soft-deleted)
    const existing = db.prepare('SELECT * FROM tickets WHERE id = ? AND is_deleted = 1').get(id) as any;
    if (!existing) {
      throw new Error('Ticket not found or not deleted');
    }

    const stmt = db.prepare('UPDATE tickets SET is_deleted = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(id);

    return this.getTicket(id) as Promise<TicketWithComputed>;
  }

  /**
   * Calculate relevance score for a ticket
   */
  calculateRelevanceScore(ticket: any): number {
    const now = new Date();
    const createdDate = new Date(ticket.created_at);
    const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    // Relevance score calculation:
    // - Pending tickets: higher score for older tickets
    // - Completed/Declined: lower score
    // - Base score depends on status
    // - Age multiplier increases score for pending tickets
    let baseScore = 0;
    switch (ticket.status) {
      case 'pending':
        baseScore = 100 - Math.min(daysSinceCreation * 2, 50); // 100-50, decreases with age
        break;
      case 'needs-info':
        baseScore = 90 - Math.min(daysSinceCreation * 2, 40); // 90-50
        break;
      case 'unresolved':
        baseScore = 85 - Math.min(daysSinceCreation * 2, 35); // 85-50, high priority
        break;
      case 'completed':
        baseScore = 30; // Completed tickets are less relevant
        break;
      case 'declined':
        baseScore = 10; // Declined tickets are least relevant
        break;
      default:
        baseScore = 50;
    }

    return baseScore;
  }

  /**
   * Get days since creation for a ticket
   */
  getDaysSinceCreation(ticket: any): number {
    const now = new Date();
    const createdDate = new Date(ticket.created_at);
    return Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  }
}

// Export singleton instance
export const ticketsService = new TicketsService();
