/**
 * API Client
 *
 * Type-safe API client using openapi-fetch
 * Generated types are imported from openapi.ts
 */

import createClient from 'openapi-fetch';
import type { paths } from '../types/openapi';
import { getApiBaseUrl } from '../../config/api.config';

// Create the API client with type-safe paths
export const apiClient = createClient<paths>({
  baseUrl: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to prepend base URL if configured
const originalFetch = apiClient.FETCH;

apiClient.FETCH = async (url, init) => {
  const baseUrl = getApiBaseUrl();

  if (baseUrl) {
    // Prepend base URL to the request
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;

    return originalFetch(`${normalizedBase}${normalizedUrl}`, init);
  }

  return originalFetch(url, init);
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

export default apiClient;
