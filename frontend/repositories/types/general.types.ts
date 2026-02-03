/**
 * General API Domain Type Definitions
 */

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  message?: string;
}

export interface RankingItem {
  name: string;
  score: number;
  avatar: string;
  isCurrentUser?: boolean;
}

export interface RankingsResponse {
  rankings: RankingItem[];
}

export interface Quote {
  text: string;
  author: string;
  category?: string;
}

export interface QuoteResponse {
  quote: Quote;
}

export interface GenderRequest {
  name: string;
  country?: number;
}

export interface GenderResponse {
  name: string;
  gender: 'male' | 'female' | 'unknown';
  probability: number;
}
