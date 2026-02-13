import { prisma } from '../lib/prisma';

/**
 * Theme preferences interface (mapped to Prisma Theme model)
 */
export interface ThemePreferences {
  id: number;
  user_id: number;
  preset: string;
  custom_colors: string | null;
  dark_mode: boolean;
  high_contrast: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Theme preferences input interface (for creating/updating)
 */
export interface ThemePreferencesInput {
  preset?: string;
  custom_colors?: Record<string, any>;
  dark_mode?: boolean;
  high_contrast?: boolean;
}

/**
 * Color validation result
 */
interface ColorValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Theme preset interface
 */
export interface ThemePreset {
  name: string;
  label: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  accent_color: string;
}

/**
 * Predefined theme presets
 */
const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'dark',
    label: 'Dark',
    primary_color: '#ec4899',
    secondary_color: '#8b5cf6',
    background_color: '#1a1a2e',
    text_color: '#ffffff',
    accent_color: '#f97316'
  },
  {
    name: 'light',
    label: 'Light',
    primary_color: '#ec4899',
    secondary_color: '#8b5cf6',
    background_color: '#ffffff',
    text_color: '#1a1a2e',
    accent_color: '#f97316'
  },
  {
    name: 'sunset',
    label: 'Sunset',
    primary_color: '#f97316',
    secondary_color: '#ef4444',
    background_color: '#1e1b4b',
    text_color: '#fef3c7',
    accent_color: '#fbbf24'
  },
  {
    name: 'ocean',
    label: 'Ocean',
    primary_color: '#3b82f6',
    secondary_color: '#06b6d4',
    background_color: '#0f172a',
    text_color: '#e2e8f0',
    accent_color: '#22d3ee'
  },
  {
    name: 'forest',
    label: 'Forest',
    primary_color: '#22c55e',
    secondary_color: '#10b981',
    background_color: '#14532d',
    text_color: '#f0fdf4',
    accent_color: '#4ade80'
  },
  {
    name: 'neon',
    label: 'Neon',
    primary_color: '#ff00ff',
    secondary_color: '#00ffff',
    background_color: '#000000',
    text_color: '#ffffff',
    accent_color: '#ffff00'
  }
];

/**
 * Validate hex color
 */
function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Validate theme colors
 */
export function validateThemeColors(colors: Partial<Record<string, string>>): ColorValidationResult {
  const errors: string[] = [];

  const colorFields = ['primary_color', 'secondary_color', 'background_color', 'text_color', 'accent_color'];

  for (const field of colorFields) {
    if (colors[field] && !isValidHexColor(colors[field])) {
      errors.push(`${field} must be a valid hex color (e.g., #ec4899)`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get theme preferences by user ID
 */
export async function getThemePreferences(userId: number): Promise<ThemePreferences | null> {
  const theme = await prisma.theme.findUnique({
    where: { user_id: userId }
  });

  if (!theme) return null;

  return theme;
}

/**
 * Save or update theme preferences for a user
 */
export async function saveThemePreferences(
  userId: number,
  preferences: ThemePreferencesInput
): Promise<ThemePreferences> {
  // Validate colors if custom_colors provided
  if (preferences.custom_colors) {
    const validation = validateThemeColors(preferences.custom_colors);
    if (!validation.valid) {
      throw new Error(`Invalid theme colors: ${validation.errors.join(', ')}`);
    }
  }

  const existingPreferences = await getThemePreferences(userId);

  // Prepare data
  const data = {
    preset: preferences.preset || 'dark',
    custom_colors: preferences.custom_colors ? JSON.stringify(preferences.custom_colors) : null,
    dark_mode: preferences.dark_mode !== undefined ? preferences.dark_mode : true,
    high_contrast: preferences.high_contrast !== undefined ? preferences.high_contrast : false
  };

  if (existingPreferences) {
    // Update existing preferences
    return await prisma.theme.update({
      where: { user_id: userId },
      data
    });
  } else {
    // Create new preferences
    return await prisma.theme.create({
      data: {
        user_id: userId,
        ...data
      }
    });
  }
}

/**
 * Get all available theme presets
 */
export function getThemePresets(): ThemePreset[] {
  return THEME_PRESETS;
}

/**
 * Get a specific theme preset by name
 */
export function getThemePreset(name: string): ThemePreset | null {
  return THEME_PRESETS.find(p => p.name === name) || null;
}

/**
 * Get or create default theme preferences for a user
 */
export async function getOrCreateDefaultThemePreferences(userId: number): Promise<ThemePreferences> {
  const existing = await getThemePreferences(userId);

  if (existing) {
    return existing;
  }

  // Create with default dark theme
  return saveThemePreferences(userId, {
    preset: 'dark',
    dark_mode: true,
    high_contrast: false
  });
}

/**
 * Initialize theme database (STUB for backward compatibility)
 * @deprecated Theme table is managed by Prisma migrations
 */
export async function initThemeDB(): Promise<void> {
  console.warn('initThemeDB() is deprecated. Theme table is managed by Prisma migrations.');
  return;
}

/**
 * Delete theme preferences for a user
 */
export async function deleteThemePreferences(userId: number): Promise<boolean> {
  try {
    await prisma.theme.delete({
      where: { user_id: userId }
    });
    return true;
  } catch (error) {
    return false;
  }
}

export default {
  getThemePreferences,
  saveThemePreferences,
  getThemePresets,
  getThemePreset,
  getOrCreateDefaultThemePreferences,
  deleteThemePreferences,
  validateThemeColors
};
