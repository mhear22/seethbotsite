/**
 * Theme API Domain Type Definitions
 */

export interface ThemeColors {
  primary: string;
  background: string;
  text: string;
  accent: string;
  cardBackground: string;
}

export interface ThemeOptions {
  darkMode: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
}

export interface ThemePreferences {
  preset: string;
  customColors: ThemeColors;
  options: ThemeOptions;
}

export interface ThemePreferencesResponse {
  success: boolean;
  preferences: ThemePreferences;
}

export interface ThemePreferencesRequest {
  preferences: ThemePreferences;
}
