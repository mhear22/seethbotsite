/**
 * General Repository
 *
 * Handles general API calls including health checks, rankings, quotes, and gender detection.
 * Provides 4 endpoints for general operations.
 */

import { apiGet, apiPost } from '../utils/api';
import type {
  HealthResponse,
  RankingItem,
  RankingsResponse,
  Quote,
  QuoteResponse,
  GenderRequest,
  GenderResponse
} from './types/general.types';

class GeneralRepository {
  /**
   * Check API health status
   */
  async getHealth(): Promise<HealthResponse> {
    return apiGet<HealthResponse>('/api/health');
  }

  /**
   * Get user rankings
   */
  async getRankings(): Promise<RankingItem[]> {
    const response = await apiGet<RankingsResponse>('/api/rankings');
    return response.rankings;
  }

  /**
   * Get a random quote
   */
  async getQuote(): Promise<Quote> {
    const response = await apiGet<QuoteResponse>('/api/quote');
    return response.quote;
  }

  /**
   * Detect gender from a name
   * @param name - The name to analyze
   * @param country - Optional country code for regional name data
   */
  async detectGender(name: string, country?: number): Promise<GenderResponse> {
    const request: GenderRequest = { name, country };
    return apiPost<GenderResponse>('/api/gender', request);
  }
}

// Export singleton instance
export const generalRepository = new GeneralRepository();
