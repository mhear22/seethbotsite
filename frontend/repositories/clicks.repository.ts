/**
 * Clicks Repository
 *
 * Handles all click counter-related API calls.
 * Provides 3 endpoints for click counter operations.
 */

import { apiGet, apiPost } from '../utils/api';
import type { ClickData, ClickResponse } from './types/clicks.types';

class ClicksRepository {
  /**
   * Get the current click count
   */
  async getCount(): Promise<ClickData> {
    return apiGet<ClickResponse>('/api/clicks');
  }

  /**
   * Increment the click count
   */
  async increment(): Promise<ClickData> {
    return apiPost<ClickResponse>('/api/clicks/increment');
  }

  /**
   * Reset the click count to zero
   */
  async reset(): Promise<ClickData> {
    return apiPost<ClickResponse>('/api/clicks/reset');
  }
}

// Export singleton instance
export const clicksRepository = new ClicksRepository();
