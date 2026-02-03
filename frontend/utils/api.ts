/**
 * API Utility Functions for seethbotsite frontend
 * Simplified without authentication requirements
 */

import { getApiBaseUrl } from '../config/api.config';

/**
 * Build a full URL by prepending the configured base URL
 * @param path - The API path (e.g., '/api/movies')
 * @returns Full URL with base URL prepended if configured
 */
export const buildUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();

  // If no base URL is configured, return the path as-is (relative path)
  if (!baseUrl) {
    return path;
  }

  // Remove trailing slash from baseUrl and leading slash from path if both exist
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
};

/**
 * Simple fetch wrapper with error handling
 */
export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const fullUrl = buildUrl(url);

  const response = await fetch(fullUrl, {
    ...options,
    headers
  });

  // Handle rate limiting
  if (response.status === 429) {
    const errorData = await response.json();
    const retryAfter = errorData.retryAfter || 60;
    console.error(`Rate limited. Please wait ${retryAfter} seconds before retrying`);
    throw new Error('RATE_LIMITED');
  }

  return response;
};

/**
 * Handle API errors and show user-friendly messages
 */
export const handleApiError = (error: unknown, defaultMessage: string = 'An error occurred'): string => {
  if (error instanceof Error) {
    switch (error.message) {
      case 'RATE_LIMITED':
        return 'You are making too many requests. Please wait a moment and try again.';
      default:
        return error.message || defaultMessage;
    }
  }
  return defaultMessage;
};

/**
 * Generic API GET request
 */
export const apiGet = async <T = unknown>(url: string): Promise<T> => {
  const response = await apiFetch(url, { method: 'GET' });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'GET request failed');
  }

  return response.json();
};

/**
 * Generic API POST request
 */
export const apiPost = async <T = unknown>(url: string, data?: unknown): Promise<T> => {
  const response = await apiFetch(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'POST request failed');
  }

  return response.json();
};

/**
 * Generic API DELETE request
 */
export const apiDelete = async <T = unknown>(url: string): Promise<T> => {
  const response = await apiFetch(url, { method: 'DELETE' });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'DELETE request failed');
  }

  return response.json();
};

/**
 * Show an error message
 */
export const showError = (message: string): void => {
  console.error(message);
  alert(message);
};

/**
 * Show a success message
 */
export const showSuccess = (message: string): void => {
  console.log(message);
  alert(message);
};

/**
 * API endpoint constants
 */
export const API_ENDPOINTS = {
  // General
  HEALTH: '/api/health',
  RANKINGS: '/api/rankings',
  QUOTE: '/api/quote',

  // Movies
  MOVIES: '/api/movies',
  MOVIE_VOTING_ROUND: '/api/movies/voting-round',
  MOVIE_VOTING_ROUND_START: '/api/movies/voting-round/start',
  MOVIE_VOTING_ROUND_END: '/api/movies/voting-round/end',
  MOVIE_VOTING_ROUND_RESET: '/api/movies/voting-round/reset',
  MOVIE_VOTES: '/api/movies/votes',
  MOVIE_VOTE: '/api/movies/vote',

  // Stocks
  STOCKS: '/api/stocks',
  STOCK_BUY: '/api/stocks/buy',
  STOCK_SELL: '/api/stocks/sell',
  PORTFOLIO: (userId: string) => `/api/portfolio/${userId}`,

  // Click counter
  CLICKS: '/api/clicks',
  CLICK_INCREMENT: '/api/clicks/increment',
  CLICK_RESET: '/api/clicks/reset',

  // Gender
  GENDER: '/api/gender'
} as const;

export default {
  buildUrl,
  apiFetch,
  handleApiError,
  apiGet,
  apiPost,
  apiDelete,
  showError,
  showSuccess,
  API_ENDPOINTS
};
