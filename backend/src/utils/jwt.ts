/**
 * JWT Utility Functions
 *
 * Provides functions for generating and verifying JWT tokens
 * for authentication purposes.
 *
 * Part of ticket #196: Account sync database and backend auth
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET: string = process.env.SEETHBOT_JWT_SECRET || 'change-this-in-production-secret-key';
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes as per ticket requirements
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days as per ticket requirements

/**
 * JWT payload interface
 */
export interface JWTPayload {
  userId: number;
  iat?: number;
  exp?: number;
}

/**
 * Generate an access token for a user
 * Access tokens are short-lived (15 minutes) for security
 *
 * @param userId - The user ID to encode in the token
 * @returns A JWT access token string
 */
export function generateAccessToken(userId: number): string {
  const payload: JWTPayload = {
    userId
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY
  } as jwt.SignOptions);
}

/**
 * Generate a refresh token
 * Refresh tokens are random strings (not JWT) stored in the database
 * They are longer-lived (7 days) and used to get new access tokens
 *
 * @returns A random refresh token string
 */
export function generateRefreshToken(): string {
  // Generate a cryptographically secure random token
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const randomBytes = require('crypto').randomBytes(32);

  for (let i = 0; i < 32; i++) {
    token += chars[randomBytes[i] % chars.length];
  }

  return token;
}

/**
 * Hash a refresh token for secure storage in the database
 *
 * @param token - The refresh token to hash
 * @returns A Promise resolving to the hashed token
 */
export async function hashRefreshToken(token: string): Promise<string> {
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  return await bcrypt.hash(token, saltRounds);
}

/**
 * Verify an access token and return the decoded payload
 *
 * @param token - The JWT access token to verify
 * @returns The decoded payload if valid, null otherwise
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Generate a JWT token with custom expiry
 * Useful for session tokens with longer lifetimes
 *
 * @param userId - The user ID to encode in the token
 * @param expiresIn - Expiry time (e.g., '30d', '7d', '24h')
 * @returns A JWT token string
 */
export function generateToken(userId: number, expiresIn: string = '30d'): string {
  const payload: JWTPayload = {
    userId
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: expiresIn
  } as jwt.SignOptions);
}

/**
 * Verify a JWT token with custom expiry support
 *
 * @param token - The JWT token to verify
 * @returns The decoded payload if valid, null otherwise
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export default {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  verifyAccessToken,
  generateToken,
  verifyToken
};
