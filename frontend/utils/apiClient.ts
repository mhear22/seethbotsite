/**
 * Type-safe API client using openapi-fetch
 * This client is generated from the backend's OpenAPI specification
 */

import createClient from 'openapi-fetch';
import type { paths } from '../types/openapi';
import { getApiBaseUrl } from '../config/api.config';

// Create the API client with the generated types
export const apiClient = createClient<paths>({
  baseUrl: getApiBaseUrl() || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export a default export for convenience
export default apiClient;

/**
 * Wrapper for GET requests with error handling
 */
export async function apiGet<T extends keyof paths>(
  path: T,
  init?: Parameters<typeof apiClient>[1]
) {
  const response = await apiClient.GET(path, init);

  if (response.error) {
    throw new Error(JSON.stringify(response.error));
  }

  return response.data;
}

/**
 * Wrapper for POST requests with error handling
 */
export async function apiPost<T extends keyof paths>(
  path: T,
  init?: Parameters<typeof apiClient>[1]
) {
  const response = await apiClient.POST(path, init);

  if (response.error) {
    throw new Error(JSON.stringify(response.error));
  }

  return response.data;
}

/**
 * Wrapper for PUT requests with error handling
 */
export async function apiPut<T extends keyof paths>(
  path: T,
  init?: Parameters<typeof apiClient>[1]
) {
  const response = await apiClient.PUT(path, init);

  if (response.error) {
    throw new Error(JSON.stringify(response.error));
  }

  return response.data;
}

/**
 * Wrapper for PATCH requests with error handling
 */
export async function apiPatch<T extends keyof paths>(
  path: T,
  init?: Parameters<typeof apiClient>[1]
) {
  const response = await apiClient.PATCH(path, init);

  if (response.error) {
    throw new Error(JSON.stringify(response.error));
  }

  return response.data;
}

/**
 * Wrapper for DELETE requests with error handling
 */
export async function apiDelete<T extends keyof paths>(
  path: T,
  init?: Parameters<typeof apiClient>[1]
) {
  const response = await apiClient.DELETE(path, init);

  if (response.error) {
    throw new Error(JSON.stringify(response.error));
  }

  return response.data;
}
