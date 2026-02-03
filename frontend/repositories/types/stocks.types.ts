/**
 * Stock Market Domain Type Definitions
 */

export interface Stock {
  name: string;
  avatar: string;
  price: number;
  coolnessScore: number;
  shares: number;
  minPrice: number;
  maxPrice: number;
  priceHistory: { timestamp: number; price: number }[];
}

export interface Holding {
  [stockName: string]: number;
}

export interface Transaction {
  timestamp: number;
  type: 'buy' | 'sell';
  stockName: string;
  shares: number;
  price: number;
  total: number;
}

export interface Portfolio {
  userId: string;
  cash: number;
  holdings: Holding;
  transactions: Transaction[];
}

export interface StocksResponse {
  stocks: Stock[];
}

export interface PortfolioResponse {
  portfolio: Portfolio;
  portfolioValue: number;
}

export interface TradeRequest {
  userId: string;
  stockName: string;
  shares: number;
}

export interface TradeResponse {
  success: boolean;
  message: string;
  portfolio: Portfolio;
  portfolioValue: number;
}
