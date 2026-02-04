/**
 * Clicks Repository
 *
 * Handles all click counter-related API calls.
 * Uses type-safe openapi-fetch client for API communication.
 */

import { apiClient } from '../utils/apiClient';

class ClicksRepository {
  /**
   * Get the current click count
   */
  async getCount() {
    const { data, error } = await apiClient.GET('/clicks', {});

    if (error) {
      throw new Error(error.error || 'Failed to get click count');
    }

    return data;
  }

  /**
   * Increment the click count
   */
  async increment() {
    const { data, error } = await apiClient.POST('/clicks/increment', {});

    if (error) {
      throw new Error(error.error || 'Failed to increment clicks');
    }

    return data;
  }

  /**
   * Reset the click count to zero
   */
  async reset() {
    const { data, error } = await apiClient.POST('/clicks/reset', {});

    if (error) {
      throw new Error(error.error || 'Failed to reset clicks');
    }

    return data;
  }
}

// Export singleton instance
export const clicksRepository = new ClicksRepository();
