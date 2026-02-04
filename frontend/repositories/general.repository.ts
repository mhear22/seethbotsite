/**
 * General Repository
 *
 * Handles general API calls including health checks, rankings, quotes, and gender detection.
 * Uses type-safe openapi-fetch client for API communication.
 */

import { apiClient } from '../utils/apiClient';

class GeneralRepository {
  /**
   * Check API health status
   */
  async getHealth() {
    const { data, error } = await apiClient.GET('/health', {});

    if (error) {
      throw new Error(error.error || 'Failed to get health status');
    }

    return data;
  }

  /**
   * Get user rankings
   */
  async getRankings() {
    const { data, error } = await apiClient.GET('/rankings', {});

    if (error) {
      throw new Error(error.error || 'Failed to get rankings');
    }

    return data?.rankings || [];
  }

  /**
   * Get a random quote
   */
  async getQuote() {
    const { data, error } = await apiClient.GET('/quote', {});

    if (error) {
      throw new Error(error.error || 'Failed to get quote');
    }

    return data?.quote;
  }

  /**
   * Detect gender from a name
   * @param name - The name to analyze
   * @param country - Optional country code for regional name data
   */
  async detectGender(name: string, country?: number) {
    const { data, error } = await apiClient.POST('/gender', {
      body: { name, country },
    });

    if (error) {
      throw new Error(error.error || 'Failed to detect gender');
    }

    return data;
  }
}

// Export singleton instance
export const generalRepository = new GeneralRepository();
