/**
 * Stocks Repository
 *
 * Handles all stock market-related API calls including stocks, portfolio, and trading.
 * Uses type-safe openapi-fetch client for API communication.
 */

import { apiClient } from '../utils/apiClient';

class StocksRepository {
  /**
   * Get all available stocks
   */
  async getStocks() {
    const { data, error } = await apiClient.GET('/stocks', {});

    if (error) {
      throw new Error(error.error || 'Failed to get stocks');
    }

    return data?.stocks || [];
  }

  /**
   * Get a user's portfolio
   * @param userId - The user ID
   */
  async getPortfolio(userId: string) {
    const { data, error } = await apiClient.GET('/portfolio/{userId}', {
      params: {
        path: { userId },
      },
    });

    if (error) {
      throw new Error(error.error || 'Failed to get portfolio');
    }

    return data;
  }

  /**
   * Buy stock shares
   * @param userId - The user ID
   * @param stockName - The name of the stock
   * @param shares - Number of shares to buy
   */
  async buyStock(userId: string, stockName: string, shares: number) {
    const { data, error } = await apiClient.POST('/stocks/buy', {
      body: { userId, stockName, shares },
    });

    if (error) {
      throw new Error(error.error || 'Failed to buy shares');
    }

    return data;
  }

  /**
   * Sell stock shares
   * @param userId - The user ID
   * @param stockName - The name of the stock
   * @param shares - Number of shares to sell
   */
  async sellStock(userId: string, stockName: string, shares: number) {
    const { data, error } = await apiClient.POST('/stocks/sell', {
      body: { userId, stockName, shares },
    });

    if (error) {
      throw new Error(error.error || 'Failed to sell shares');
    }

    return data;
  }
}

// Export singleton instance
export const stocksRepository = new StocksRepository();
