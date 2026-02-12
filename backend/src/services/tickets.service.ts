import { prisma } from '../lib/prisma';
import { parseDependencies, isTicketBlocked, safeJsonParse } from './tickets-db';

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
  response?: string | null;
  creator_id?: string | null;
  type: string;
  priority: string;
  tags?: string | null;
  category?: string | null;
  dependencies: number[];
  blocked: boolean;
  created_at: Date;
  updated_at: Date;
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

    // Parse dependencies from description if not explicitly provided
    let parsedDependencies: number[] = [];
    if (dependencies && Array.isArray(dependencies)) {
      parsedDependencies = dependencies;
    } else {
      parsedDependencies = parseDependencies(description || null);
    }

    // Validate dependencies exist
    for (const depId of parsedDependencies) {
      const exists = await prisma.ticket.findUnique({
        where: { id: depId },
        select: { id: true }
      });
      if (!exists) {
        throw new Error(`Dependency ticket #${depId} does not exist`);
      }
    }

    // Check for circular dependencies
    // This would require a more complex check, for now we'll just validate that deps exist

    // Store dependencies as JSON string
    const dependenciesJson = parsedDependencies.length > 0 ? JSON.stringify(parsedDependencies) : null;

    // Create ticket
    const newTicket = await prisma.ticket.create({
      data: {
        title: title.trim(),
        description: (description || '').trim() || null,
        status: 'pending',
        creator_id: creator_id || null,
        type: type || 'feature',
        priority: priority || 'medium',
        tags: tags || null,
        category: category || null,
        dependencies: dependenciesJson
      }
    });

    // Add computed fields to response
    return {
      ...newTicket,
      dependencies: parsedDependencies,
      blocked: await isTicketBlocked(parsedDependencies)
    };
  }

  /**
   * Get a single ticket by ID
   */
  async getTicket(id: number): Promise<TicketWithComputed | null> {
    const ticket = await prisma.ticket.findUnique({
      where: { id, is_deleted: false }
    });

    if (!ticket) {
      return null;
    }

    // Parse dependencies from database
    const dependencies = safeJsonParse<number[]>(ticket.dependencies, []);

    return {
      ...ticket,
      dependencies,
      blocked: await isTicketBlocked(dependencies)
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
    const { status = 'all', type = 'all', priority = 'all', tag, category } = filters;

    // Build where clause
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

    // Check if ticket exists (exclude soft-deleted)
    const existing = await prisma.ticket.findUnique({
      where: { id, is_deleted: false }
    });

    if (!existing) {
      throw new Error('Ticket not found');
    }

    // Prevent editing tickets that are not in 'pending' status
    const isEditing = title !== undefined || description !== undefined;
    if (isEditing && existing.status !== 'pending') {
      throw new Error('Cannot edit tickets that are not in pending status');
    }

    // Build update data
    const updateData: any = {};

    // Auto-reset from "needs-info" to "pending" when user edits title/description
    const shouldResetStatus = (title !== undefined || description !== undefined) && existing.status === 'needs-info';

    if (status) {
      updateData.status = status;
    } else if (shouldResetStatus) {
      updateData.status = 'pending';
    }

    if (response !== undefined) {
      updateData.response = response;
    }
    if (title !== undefined) {
      updateData.title = title.trim();
    }
    if (description !== undefined) {
      updateData.description = description.trim();
    }
    if (type !== undefined) {
      updateData.type = type;
    }
    if (priority !== undefined) {
      updateData.priority = priority;
    }
    if (tags !== undefined) {
      updateData.tags = tags.trim();
    }
    if (category !== undefined) {
      updateData.category = category.trim();
    }
    if (dependencies !== undefined) {
      // Allow manual override of dependencies
      const depsArray = Array.isArray(dependencies) ? dependencies : [];
      updateData.dependencies = depsArray.length > 0 ? JSON.stringify(depsArray) : null;
    }

    // Update ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: updateData
    });

    // Add computed fields to response
    const depsArray = safeJsonParse<number[]>(updatedTicket.dependencies, []);
    return {
      ...updatedTicket,
      dependencies: depsArray,
      blocked: await isTicketBlocked(depsArray)
    };
  }

  /**
   * Soft delete a ticket
   */
  async deleteTicket(id: number, creator_id?: string): Promise<void> {
    // Check if ticket exists (exclude soft-deleted)
    const existing = await prisma.ticket.findUnique({
      where: { id, is_deleted: false }
    });

    if (!existing) {
      throw new Error('Ticket not found');
    }

    // Users can only delete their own tickets if creator_id is provided
    if (creator_id && existing.creator_id !== creator_id) {
      throw new Error('Unauthorized: You can only delete your own tickets');
    }

    await prisma.ticket.update({
      where: { id },
      data: { is_deleted: true }
    });
  }

  /**
   * Restore a soft-deleted ticket
   */
  async restoreTicket(id: number): Promise<TicketWithComputed> {
    // Check if ticket exists (include soft-deleted)
    const existing = await prisma.ticket.findUnique({
      where: { id, is_deleted: true }
    });

    if (!existing) {
      throw new Error('Ticket not found or not deleted');
    }

    await prisma.ticket.update({
      where: { id },
      data: { is_deleted: false }
    });

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
