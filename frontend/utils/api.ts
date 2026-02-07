/**
 * Shared API Utility
 *
 * Provides a consistent interface for all API calls with:
 * - Automatic authentication header injection
 * - Centralized error handling
 * - Type-safe response handling
 * - Request/response interceptors
 */

import { getApiBaseUrl } from '../config/api.config';

// ============================================================================
// Types
// ============================================================================

export interface ApiRequestOptions extends RequestInit {
  headers?: HeadersInit;
  skipAuth?: boolean;
}

export interface ApiResponse<T = unknown> {
  data: T;
  error?: ApiError;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Array<{ field: string; message: string }>;
}

// ============================================================================
// Auth Management
// ============================================================================

const AUTH_TOKEN_KEY = 'auth_token';

/**
 * Get the stored auth token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Set the auth token
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * Clear the auth token
 */
export const clearAuthToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

/**
 * Get auth headers for requests
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// ============================================================================
// URL Building
// ============================================================================

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

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Parse an error response from the API
 */
export const parseApiError = async (response: Response): Promise<ApiError> => {
  try {
    const data = await response.json();
    return {
      message: data.error || data.message || 'An error occurred',
      status: response.status,
      code: data.code,
      details: data.details,
    };
  } catch {
    return {
      message: response.statusText || 'An error occurred',
      status: response.status,
    };
  }
};

/**
 * Handle API errors and show user-friendly messages
 * Parses validation details if available
 */
export const handleApiError = (error: unknown, defaultMessage: string = 'An error occurred'): string => {
  // Handle Error instances
  if (error instanceof Error) {
    switch (error.message) {
      case 'RATE_LIMITED':
        return 'You are making too many requests. Please wait a moment and try again.';
      default:
        return error.message || defaultMessage;
    }
  }

  // Handle API error objects with validation details
  if (error && typeof error === 'object') {
    const errorObj = error as { error?: string; details?: Array<{ field: string; message: string }> };

    // If we have validation details, extract and format them
    if (errorObj.details && Array.isArray(errorObj.details) && errorObj.details.length > 0) {
      const fieldErrors = errorObj.details.map(detail => {
        // Format field name (e.g., "suggestedBy" -> "Suggested By")
        const formattedField = detail.field
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim();

        return `${formattedField}: ${detail.message}`;
      });

      return fieldErrors.join('\n');
    }

    // Otherwise return the generic error message
    if (errorObj.error) {
      return errorObj.error;
    }
  }

  return defaultMessage;
};

/**
 * Create an error from a response
 */
export const createApiError = async (response: Response): Promise<Error> => {
  const errorData = await parseApiError(response);

  // Handle rate limiting
  if (response.status === 429) {
    return new Error('RATE_LIMITED');
  }

  return new Error(errorData.message);
};

// ============================================================================
// Core Fetch Function
// ============================================================================

/**
 * Core fetch wrapper with error handling and auth headers
 */
export const apiFetch = async (url: string, options: ApiRequestOptions = {}): Promise<Response> => {
  const { skipAuth = false, headers = {}, ...restOptions } = options;

  // Merge headers
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add auth headers if not skipped
  if (!skipAuth) {
    Object.assign(requestHeaders, getAuthHeaders());
  }

  const fullUrl = buildUrl(url);

  const response = await fetch(fullUrl, {
    ...restOptions,
    headers: requestHeaders,
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

// ============================================================================
// HTTP Method Wrappers
// ============================================================================

/**
 * Generic API GET request
 */
export const apiGet = async <T = unknown>(
  url: string,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<T> => {
  const response = await apiFetch(url, {
    ...options,
    method: 'GET',
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
};

/**
 * Generic API POST request
 */
export const apiPost = async <T = unknown>(
  url: string,
  data?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<T> => {
  const response = await apiFetch(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
};

/**
 * Generic API PUT request
 */
export const apiPut = async <T = unknown>(
  url: string,
  data?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<T> => {
  const response = await apiFetch(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
};

/**
 * Generic API PATCH request
 */
export const apiPatch = async <T = unknown>(
  url: string,
  data?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<T> => {
  const response = await apiFetch(url, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
};

/**
 * Generic API DELETE request
 */
export const apiDelete = async <T = unknown>(
  url: string,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<T> => {
  const response = await apiFetch(url, {
    ...options,
    method: 'DELETE',
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
};

// ============================================================================
// Utilities
// ============================================================================

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
  GENDER: '/api/gender',
} as const;

// ============================================================================
// Default Export
// ============================================================================

export default {
  // Auth
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  getAuthHeaders,

  // URL
  buildUrl,

  // Error handling
  parseApiError,
  handleApiError,
  createApiError,

  // Core fetch
  apiFetch,

  // HTTP methods
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,

  // Utilities
  showError,
  showSuccess,
  API_ENDPOINTS,
};
