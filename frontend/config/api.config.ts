/**
 * API Configuration
 *
 * Provides runtime and build-time configuration for API base URLs.
 *
 * Priority order:
 * 1. Runtime override via window.__API_BASE_URL__ (for Docker/K8s deployments)
 * 2. Build-time environment variable VITE_API_BASE_URL
 * 3. Empty string (defaults to relative paths)
 */

declare global {
  interface Window {
    __API_BASE_URL__?: string;
  }
}

/**
 * Get the configured API base URL
 * @returns The base URL for API requests (may be empty for relative paths)
 */
export function getApiBaseUrl(): string {
  // Check for runtime override first (useful for Docker containers)
  if (typeof window !== 'undefined' && window.__API_BASE_URL__) {
    return window.__API_BASE_URL__;
  }

  // Fall back to build-time environment variable
  return import.meta.env.VITE_API_BASE_URL || '';
}
