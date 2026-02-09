import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs/promises';

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'users.db');

/**
 * Theme preferences interface
 */
export interface ThemePreferences {
  id: number;
  user_id: number;
  theme_name: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  custom_settings: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Theme preferences input interface (for creating/updating)
 */
export interface ThemePreferencesInput {
  theme_name?: string;
  primary_color?: string;
  secondary_color?: string;
  background_color?: string;
  text_color?: string;
  accent_color?: string;
  custom_settings?: Record<string, any>;
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
 * Initialize theme database table
 */
export async function initThemeDB(): Promise<Database.Database> {
  const db = new Database(DB_PATH);

  // Read and execute the migration
  const migrationPath = path.join(__dirname, '..', 'migrations', '001_add_theme_preferences.sql');
  try {
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');
    db.exec(migrationSQL);
    console.log('[Theme] Database initialized successfully');
  } catch (error) {
    console.error('[Theme] Failed to initialize database:', error);
    throw error;
  }

  return db;
}

let dbInstance: Database.Database | null = null;
let initPromise: Promise<Database.Database> | null = null;

export async function getThemeDB(): Promise<Database.Database> {
  if (!dbInstance) {
    if (!initPromise) {
      initPromise = initThemeDB().then(db => {
        dbInstance = db;
        return db;
      });
    }
    await initPromise;
  }
  return dbInstance!;
}

/**
 * Validate hex color
 */
function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Validate theme colors
 */
export function validateThemeColors(colors: Partial<ThemePreferencesInput>): ColorValidationResult {
  const errors: string[] = [];

  if (colors.primary_color && !isValidHexColor(colors.primary_color)) {
    errors.push('primary_color must be a valid hex color (e.g., #ec4899)');
  }

  if (colors.secondary_color && !isValidHexColor(colors.secondary_color)) {
    errors.push('secondary_color must be a valid hex color (e.g., #8b5cf6)');
  }

  if (colors.background_color && !isValidHexColor(colors.background_color)) {
    errors.push('background_color must be a valid hex color (e.g., #1a1a2e)');
  }

  if (colors.text_color && !isValidHexColor(colors.text_color)) {
    errors.push('text_color must be a valid hex color (e.g., #ffffff)');
  }

  if (colors.accent_color && !isValidHexColor(colors.accent_color)) {
    errors.push('accent_color must be a valid hex color (e.g., #f97316)');
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
  const db = await getThemeDB();
  const preferences = db.prepare('SELECT * FROM theme_preferences WHERE user_id = ?').get(userId) as ThemePreferences | undefined;
  return preferences || null;
}

/**
 * Save or update theme preferences for a user
 */
export async function saveThemePreferences(
  userId: number,
  preferences: ThemePreferencesInput
): Promise<ThemePreferences> {
  const db = await getThemeDB();

  // Validate colors
  const validation = validateThemeColors(preferences);
  if (!validation.valid) {
    throw new Error(`Invalid theme colors: ${validation.errors.join(', ')}`);
  }

  const existingPreferences = await getThemePreferences(userId);

  // Prepare data
  const data = {
    user_id: userId,
    theme_name: preferences.theme_name || 'dark',
    primary_color: preferences.primary_color || '#ec4899',
    secondary_color: preferences.secondary_color || '#8b5cf6',
    background_color: preferences.background_color || '#1a1a2e',
    text_color: preferences.text_color || '#ffffff',
    accent_color: preferences.accent_color || '#f97316',
    custom_settings: preferences.custom_settings ? JSON.stringify(preferences.custom_settings) : null
  };

  if (existingPreferences) {
    // Update existing preferences
    db.prepare(`
      UPDATE theme_preferences
      SET theme_name = ?, primary_color = ?, secondary_color = ?,
          background_color = ?, text_color = ?, accent_color = ?, custom_settings = ?
      WHERE id = ?
    `).run(
      data.theme_name,
      data.primary_color,
      data.secondary_color,
      data.background_color,
      data.text_color,
      data.accent_color,
      data.custom_settings,
      existingPreferences.id
    );

    return (await getThemePreferences(userId))!;
  } else {
    // Create new preferences
    const result = db.prepare(`
      INSERT INTO theme_preferences
      (user_id, theme_name, primary_color, secondary_color, background_color, text_color, accent_color, custom_settings)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.user_id,
      data.theme_name,
      data.primary_color,
      data.secondary_color,
      data.background_color,
      data.text_color,
      data.accent_color,
      data.custom_settings
    );

    return (await getThemePreferences(userId))!;
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
    theme_name: 'dark',
    primary_color: '#ec4899',
    secondary_color: '#8b5cf6',
    background_color: '#1a1a2e',
    text_color: '#ffffff',
    accent_color: '#f97316'
  });
}

/**
 * Delete theme preferences for a user
 */
export async function deleteThemePreferences(userId: number): Promise<boolean> {
  const db = await getThemeDB();
  const result = db.prepare('DELETE FROM theme_preferences WHERE user_id = ?').run(userId);
  return result.changes > 0;
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
