/**
 * Theme Repository
 *
 * Handles theme preference API calls including getting and updating user theme preferences.
 * Uses type-safe openapi-fetch client for API communication.
 */

import { apiClient } from '../utils/apiClient';
import type {
  ThemePreferences,
  ThemePreferencesResponse,
  ThemePreferencesRequest,
} from './types/theme.types';

class ThemeRepository {
  /**
   * Get user's theme preferences
   */
  async getThemePreferences(): Promise<ThemePreferences> {
    const { data, error } = await apiClient.GET('/api/auth/theme', {});

    if (error) {
      throw new Error(error.error || 'Failed to get theme preferences');
    }

    return (data as ThemePreferencesResponse).preferences;
  }

  /**
   * Update user's theme preferences
   * @param preferences - The theme preferences to update
   */
  async updateThemePreferences(
    preferences: ThemePreferences
  ): Promise<ThemePreferences> {
    const { data, error } = await apiClient.PUT('/api/auth/theme', {
      body: {
        preferences,
      } as ThemePreferencesRequest,
    });

    if (error) {
      throw new Error(error.error || 'Failed to update theme preferences');
    }

    return (data as ThemePreferencesResponse).preferences;
  }
}

// Export singleton instance
export const themeRepository = new ThemeRepository();
