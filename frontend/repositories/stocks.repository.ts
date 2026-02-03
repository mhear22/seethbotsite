/**
 * Stocks Repository
 *
 * Handles all stock market-related API calls including stocks, portfolio, and trading.
 * Provides 4 endpoints for stock market operations.
 */

import { apiGet, apiPost } from '../utils/api';
import type {
  Stock,
  Portfolio,
  StocksResponse,
  PortfolioResponse,
  TradeRequest,
  TradeResponse
} from './types/stocks.types';

class StocksRepository {
  /**
   * Get all available stocks
   */
  async getStocks(): Promise<Stock[]> {
    const response = await apiGet<StocksResponse>('/api/stocks');
    return response.stocks;
  }

  /**
   * Get a user's portfolio
   * @param userId - The user ID
   */
  async getPortfolio(userId: string): Promise<PortfolioResponse> {
    return apiGet<PortfolioResponse>(`/api/portfolio/${userId}`);
  }

  /**
   * Buy stock shares
   * @param userId - The user ID
   * @param stockName - The name of the stock
   * @param shares - Number of shares to buy
   */
  async buyStock(userId: string, stockName: string, shares: number): Promise<TradeResponse> {
    const request: TradeRequest = { userId, stockName, shares };
    return apiPost<TradeResponse>('/api/stocks/buy', request);
  }

  /**
   * Sell stock shares
   * @param userId - The user ID
   * @param stockName - The name of the stock
   * @param shares - Number of shares to sell
   */
  async sellStock(userId: string, stockName: string, shares: number): Promise<TradeResponse> {
    const request: TradeRequest = { userId, stockName, shares };
    return apiPost<TradeResponse>('/api/stocks/sell', request);
  }
}

// Export singleton instance
export const stocksRepository = new StocksRepository();
