/**
 * Authentication Middleware
 *
 * Provides middleware functions for protecting routes with JWT authentication.
 *
 * Part of ticket #196: Account sync database and backend auth
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { validateTokenAndGetUser } from '../users';

/**
 * Extend Express Request to include user information
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        display_name: string | null;
        created_at: string;
        updated_at: string;
      };
      session?: {
        id: number;
        user_id: number;
        device_name: string | null;
        device_type: string | null;
        token: string;
        expires_at: string;
        created_at: string;
        last_used_at: string;
      };
    }
  }
}

/**
 * Middleware to require authentication
 * Extracts JWT from Authorization header and validates it
 *
 * Usage:
 *   router.get('/protected', requireAuth, handler);
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid JWT token via Authorization: Bearer header'
      });
      return;
    }

    const token = authHeader.substring(7);

    // Verify token and get user
    const result = validateTokenAndGetUser(token);

    if (!result) {
      res.status(401).json({
        error: 'Invalid or expired token',
        message: 'Please login again'
      });
      return;
    }

    // Attach user and session to request
    req.user = result.user;
    req.session = result.session;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Authentication error',
      message: 'Failed to authenticate'
    });
  }
}

/**
 * Middleware for optional authentication
 * Attaches user info if token is present, but doesn't require it
 *
 * Usage:
 *   router.get('/public-data', optionalAuth, handler);
 *
 * In the handler, check if req.user exists to determine if user is authenticated
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      // Verify token and get user (don't fail if invalid)
      const result = validateTokenAndGetUser(token);

      if (result) {
        // Attach user and session to request
        req.user = result.user;
        req.session = result.session;
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth, just continue without user info
    console.error('Optional auth middleware error:', error);
    next();
  }
}

/**
 * Middleware to verify user ID matches the authenticated user
 * Useful for ensuring users can only access their own data
 *
 * Usage:
 *   router.get('/users/:id', requireAuth, requireUserIdMatch, handler);
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export function requireUserIdMatch(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Please login to continue'
    });
    return;
  }

  const requestedUserId = parseInt(req.params.id || req.params.userId);

  if (isNaN(requestedUserId)) {
    res.status(400).json({
      error: 'Invalid user ID'
    });
    return;
  }

  if (req.user.id !== requestedUserId) {
    res.status(403).json({
      error: 'Access denied',
      message: 'You can only access your own data'
    });
    return;
  }

  next();
}

/**
 * Middleware to check if user is an admin
 * Placeholder for future admin role support
 *
 * Usage:
 *   router.get('/admin/users', requireAuth, requireAdmin, handler);
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Please login to continue'
    });
    return;
  }

  // Check if user has admin role
  // This is a placeholder - implement actual admin role check when needed
  const isAdmin = false;

  if (!isAdmin) {
    res.status(403).json({
      error: 'Access denied',
      message: 'Admin privileges required'
    });
    return;
  }

  next();
}

export default {
  requireAuth,
  optionalAuth,
  requireUserIdMatch,
  requireAdmin
};
