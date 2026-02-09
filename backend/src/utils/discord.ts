/**
 * Discord OAuth2 Integration
 *
 * Handles Discord OAuth2 authentication flow for linking Discord accounts
 * to existing user accounts.
 *
 * Required Environment Variables:
 * - DISCORD_CLIENT_ID: Discord application client ID
 * - DISCORD_CLIENT_SECRET: Discord application client secret
 * - DISCORD_CALLBACK_URL: OAuth callback URL (e.g., http://localhost:3001/api/discord/callback)
 * - DISCORD_BOT_TOKEN: Discord bot token (for fetching additional user data)
 */

import axios from 'axios';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

// Discord OAuth2 scopes
export const DISCORD_SCOPES = ['identify', 'email'];

// Discord OAuth configuration
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
export const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
export const DISCORD_CALLBACK_URL = process.env.DISCORD_CALLBACK_URL || 'http://localhost:3001/api/discord/callback';
export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';

/**
 * Discord user information interface
 */
export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email: string | null;
  verified: boolean;
  locale: string | null;
  mfa_enabled: boolean;
  public_flags: number;
}

/**
 * Generate Discord OAuth2 authorization URL
 *
 * @param state - Optional state parameter for CSRF protection
 * @returns The authorization URL to redirect the user to
 */
export function getDiscordAuthUrl(state?: string): string {
  if (!DISCORD_CLIENT_ID) {
    throw new Error('DISCORD_CLIENT_ID environment variable is not set');
  }

  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_CALLBACK_URL,
    response_type: 'code',
    scope: DISCORD_SCOPES.join(' ')
  });

  if (state) {
    params.append('state', state);
  }

  return `${DISCORD_API_BASE}/oauth2/authorize?${params.toString()}`;
}

/**
 * Exchange OAuth code for access token
 *
 * @param code - Authorization code from Discord callback
 * @returns Access token object
 */
export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}> {
  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
    throw new Error('Discord OAuth credentials not configured');
  }

  const response = await axios.post(
    `${DISCORD_API_BASE}/oauth2/token`,
    new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: DISCORD_CALLBACK_URL
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data as {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
  };
}

/**
 * Get Discord user information using access token
 *
 * @param accessToken - Discord OAuth access token
 * @returns Discord user information
 */
export async function getDiscordUser(accessToken: string): Promise<DiscordUser> {
  const response = await axios.get(`${DISCORD_API_BASE}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return response.data as DiscordUser;
}

/**
 * Get Discord user avatar URL
 *
 * @param userId - Discord user ID
 * @param avatarHash - Discord avatar hash (from user object)
 * @param size - Avatar size in pixels (default: 256)
 * @returns Full avatar URL
 */
export function getDiscordAvatarUrl(userId: string, avatarHash: string | null, size: number = 256): string | null {
  if (!avatarHash) {
    return null;
  }

  const extension = avatarHash.startsWith('a_') ? 'gif' : 'png';
  return `${DISCORD_API_BASE}/avatars/${userId}/${avatarHash}.${extension}?size=${size}`;
}

/**
 * Generate a secure state token for OAuth flow
 *
 * @returns Random state string
 */
export function generateStateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let state = '';
  const randomBytes = require('crypto').randomBytes(32);

  for (let i = 0; i < 32; i++) {
    state += chars[randomBytes[i] % chars.length];
  }

  return state;
}

/**
 * Check if Discord integration is properly configured
 *
 * @returns True if Discord credentials are set
 */
export function isDiscordConfigured(): boolean {
  return !!(DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET && DISCORD_CALLBACK_URL);
}

export default {
  getDiscordAuthUrl,
  exchangeCodeForToken,
  getDiscordUser,
  getDiscordAvatarUrl,
  generateStateToken,
  isDiscordConfigured
};
