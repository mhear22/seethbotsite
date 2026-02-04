/**
 * Tickets Repository
 *
 * Handles all ticket-related API calls including fetching, creating, updating, and deleting tickets.
 * Uses type-safe openapi-fetch client for API communication.
 */

import { apiClient } from '../utils/apiClient';

class TicketsRepository {
  /**
   * Get all tickets with optional filtering
   * @param status - Filter by status (all, pending, needs-info, completed, declined, in-progress)
   * @param type - Filter by type (all, feature, bug, feedback)
   * @param priority - Filter by priority (all, high, medium, low)
   */
  async getTickets(status?: string, type?: string, priority?: string) {
    const { data, error } = await apiClient.GET('/tickets', {
      params: {
        query: {
          status: status as any,
          type: type as any,
          priority: priority as any
        }
      }
    });

    if (error) {
      throw new Error(error.error || 'Failed to get tickets');
    }

    return data?.tickets || [];
  }

  /**
   * Create a new ticket
   * @param title - Ticket title
   * @param description - Ticket description
   * @param creatorId - Optional creator ID
   */
  async createTicket(title: string, description: string, creatorId?: string) {
    const { data, error } = await apiClient.POST('/tickets', {
      body: {
        title,
        description,
        creator_id: creatorId
      }
    });

    if (error) {
      throw new Error(error.error || 'Failed to create ticket');
    }

    return data?.ticket;
  }

  /**
   * Update an existing ticket
   * @param id - Ticket ID
   * @param updates - Object with fields to update
   */
  async updateTicket(id: number, updates: {
    title?: string;
    description?: string;
    status?: 'pending' | 'needs-info' | 'completed' | 'declined';
    response?: string;
    creator_id?: string;
  }) {
    const { data, error } = await apiClient.PATCH('/tickets/{id}', {
      params: {
        path: { id }
      },
      body: updates
    });

    if (error) {
      throw new Error(error.error || 'Failed to update ticket');
    }

    return data?.ticket;
  }

  /**
   * Delete a ticket
   * @param id - Ticket ID
   * @param creatorId - Optional creator ID (for authorization)
   */
  async deleteTicket(id: number, creatorId?: string) {
    const { data, error } = await apiClient.DELETE('/tickets/{id}', {
      params: {
        path: { id }
      },
      headers: creatorId ? { 'X-Creator-ID': creatorId } : undefined,
      body: creatorId ? { creator_id: creatorId } : undefined
    });

    if (error) {
      throw new Error(error.error || 'Failed to delete ticket');
    }

    return data;
  }

  /**
   * Get ticket processing ignore mode status
   */
  async getIgnoreMode() {
    const { data, error } = await apiClient.GET('/tickets/settings/ignore-mode', {});

    if (error) {
      throw new Error(error.error || 'Failed to get ignore mode');
    }

    return data?.ignoreMode ?? false;
  }

  /**
   * Set ticket processing ignore mode
   * @param ignoreMode - Whether to pause ticket processing
   */
  async setIgnoreMode(ignoreMode: boolean) {
    const { data, error } = await apiClient.PATCH('/tickets/settings/ignore-mode', {
      body: { ignoreMode }
    });

    if (error) {
      throw new Error(error.error || 'Failed to set ignore mode');
    }

    return data?.ignoreMode;
  }

  /**
   * Get last ticket collection timestamp
   */
  async getLastCollection() {
    const { data, error } = await apiClient.GET('/tickets/settings/last-collection', {});

    if (error) {
      throw new Error(error.error || 'Failed to get last collection');
    }

    return data?.lastCollection;
  }

  /**
   * Set last ticket collection timestamp
   * @param lastCollection - ISO timestamp string
   */
  async setLastCollection(lastCollection: string) {
    const { data, error } = await apiClient.PATCH('/tickets/settings/last-collection', {
      body: { lastCollection }
    });

    if (error) {
      throw new Error(error.error || 'Failed to set last collection');
    }

    return data?.lastCollection;
  }
}

// Export singleton instance
export const ticketsRepository = new TicketsRepository();
