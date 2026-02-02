/**
 * API Utility Functions for seethbotsite frontend
 * Handles authentication, error handling, and API calls
 */

// API key - in production, this should be stored securely (e.g., environment variable, secure cookie)
const API_KEY = import.meta.env.VITE_API_KEY || localStorage.getItem('seethbot_api_key') || '';

/**
 * Set the API key for authenticated requests
 */
export const setApiKey = (key: string): void => {
  localStorage.setItem('seethbot_api_key', key);
};

/**
 * Get the current API key
 */
export const getApiKey = (): string => {
  return localStorage.getItem('seethbot_api_key') || '';
};

/**
 * Clear the API key (logout)
 */
export const clearApiKey = (): void => {
  localStorage.removeItem('seethbot_api_key');
};

/**
 * Check if user is authenticated (has API key)
 */
export const isAuthenticated = (): boolean => {
  return !!getApiKey();
};

/**
 * Fetch with authentication
 * Automatically adds API key header and handles auth errors
 */
export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const apiKey = getApiKey();

  const headers = {
    'Content-Type': 'application/json',
    ...(apiKey && { 'X-API-Key': apiKey }),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  // Handle authentication errors
  if (response.status === 401) {
    // Missing API key
    console.error('Authentication required: Please provide an API key');
    throw new Error('AUTH_REQUIRED');
  }

  if (response.status === 403) {
    // Invalid API key or insufficient permissions
    const errorData = await response.json();
    if (errorData.error === 'Invalid API key') {
      console.error('Invalid API key: Please check your API key');
      throw new Error('INVALID_API_KEY');
    } else if (errorData.error === 'Insufficient permissions') {
      console.error('Insufficient permissions: Your API key does not have access to this resource');
      throw new Error('INSUFFICIENT_PERMISSIONS');
    }
    throw new Error('FORBIDDEN');
  }

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
      case 'AUTH_REQUIRED':
        return 'Authentication required. Please enter your API key.';
      case 'INVALID_API_KEY':
        return 'Invalid API key. Please check your API key and try again.';
      case 'INSUFFICIENT_PERMISSIONS':
        return 'You do not have permission to perform this action.';
      case 'RATE_LIMITED':
        return 'You are making too many requests. Please wait a moment and try again.';
      default:
        return error.message || defaultMessage;
    }
  }
  return defaultMessage;
};

/**
 * Prompt user for API key if not set
 * Returns true if API key is set, false otherwise
 */
export const ensureApiKey = (): boolean => {
  if (!isAuthenticated()) {
    const key = prompt(
      'Authentication Required\n\n' +
      'This action requires an API key. Please enter your API key:\n\n' +
      '(You can get the API key from the server logs or set it in your environment)'
    );

    if (key) {
      setApiKey(key);
      return true;
    }
    return false;
  }
  return true;
};

/**
 * Generic API GET request
 */
export const apiGet = async <T = unknown>(url: string): Promise<T> => {
  const response = await authFetch(url, { method: 'GET' });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'GET request failed');
  }

  return response.json();
};

/**
 * Generic API POST request
 * Requires API key
 */
export const apiPost = async <T = unknown>(url: string, data?: unknown): Promise<T> => {
  // Ensure API key before making request
  if (!ensureApiKey()) {
    throw new Error('AUTH_REQUIRED');
  }

  const response = await authFetch(url, {
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
 * Requires API key
 */
export const apiDelete = async <T = unknown>(url: string): Promise<T> => {
  // Ensure API key before making request
  if (!ensureApiKey()) {
    throw new Error('AUTH_REQUIRED');
  }

  const response = await authFetch(url, { method: 'DELETE' });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'DELETE request failed');
  }

  return response.json();
};

/**
 * Show an error toast/notification
 * This is a placeholder - integrate with your actual notification system
 */
export const showError = (message: string): void => {
  // For now, use alert. In production, use a proper toast/notification system
  console.error(message);
  alert(message);
};

/**
 * Show a success toast/notification
 * This is a placeholder - integrate with your actual notification system
 */
export const showSuccess = (message: string): void => {
  // For now, use alert. In production, use a proper toast/notification system
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
  setApiKey,
  getApiKey,
  clearApiKey,
  isAuthenticated,
  authFetch,
  handleApiError,
  ensureApiKey,
  apiGet,
  apiPost,
  apiDelete,
  showError,
  showSuccess,
  API_ENDPOINTS
};
