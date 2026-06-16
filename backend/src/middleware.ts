import { Request, Response, NextFunction } from 'express';
import validator from 'validator';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';

/**
 * Rate limiter configuration
 * Tracks requests per IP address in memory
 * Uses bounded LRU eviction to prevent unbounded memory growth
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastAccessed: number; // For LRU eviction
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const MAX_STORE_SIZE = 10000; // Maximum entries before LRU eviction kicks in

// IMPORTANT: These limits are intentionally EXTREMELY HIGH because this is a real-time
// multiplayer game app. During active gameplay, users send frequent WebSocket messages,
// game state updates, and API calls (battle actions, position updates, etc.).
// A typical 60-second battle could easily generate 100+ requests per player.
// Lower limits would break the core multiplayer experience.
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 10000; // Very high - this is a real-time game, not a typical REST API

/**
 * Rate limiter middleware
 * Limits requests per IP address to prevent abuse
 * Implements bounded storage with LRU eviction
 */
export const rateLimiter = (maxRequests: number = DEFAULT_MAX_REQUESTS, windowMs: number = DEFAULT_WINDOW_MS) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    // Get or create rate limit entry for this IP
    let entry = rateLimitStore.get(ip);

    // Reset if window has expired
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
        lastAccessed: now
      };
      rateLimitStore.set(ip, entry);
    } else {
      // Update last accessed time for LRU tracking
      entry.lastAccessed = now;
    }

    // LRU eviction if store exceeds maximum size
    if (rateLimitStore.size > MAX_STORE_SIZE) {
      // Find and remove the least recently accessed entries (bottom 20%)
      const entries = Array.from(rateLimitStore.entries())
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      
      const toRemove = Math.ceil(MAX_STORE_SIZE * 0.2);
      for (let i = 0; i < toRemove && i < entries.length; i++) {
        rateLimitStore.delete(entries[i][0]);
      }
      
      console.log(`[RateLimit] LRU evicted ${toRemove} entries (store size: ${rateLimitStore.size})`);
    }

    // Increment counter
    entry.count++;

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.set('Retry-After', retryAfter.toString());
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter,
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`
      });
    }

    // Add rate limit headers
    res.set('X-RateLimit-Limit', maxRequests.toString());
    res.set('X-RateLimit-Remaining', (maxRequests - entry.count).toString());
    res.set('X-RateLimit-Reset', entry.resetTime.toString());

    next();
  };
};

/**
 * String sanitization middleware
 * Strips HTML tags, escapes special characters, prevents XSS
 */
export const sanitizeString = (str: string, maxLength: number = 1000): string => {
  if (typeof str !== 'string') {
    return str;
  }

  // Remove all HTML tags
  let sanitized = validator.stripLow(str);

  // Escape HTML entities to prevent XSS
  sanitized = validator.escape(sanitized);

  // Trim whitespace
  sanitized = sanitized.trim();

  // Truncate if too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};

/**
 * Middleware to sanitize request body
 */
export const sanitizeBody = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const field of fields) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        // Use different max lengths for different types of fields
        const maxLength = field === 'title' || field === 'notes' ? 500 : 100;
        req.body[field] = sanitizeString(req.body[field], maxLength);
      }
    }
    next();
  };
};

/**
 * Middleware to sanitize URL parameters
 */
export const sanitizeParams = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const field of fields) {
      if (req.params[field] && typeof req.params[field] === 'string') {
        req.params[field] = sanitizeString(req.params[field], 100);
      }
    }
    next();
  };
};

/**
 * Validation error handler
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * Common validation chains
 */
export const validations = {
  // Movie validations
  addMovie: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title must be less than 200 characters')
      .matches(/^[\p{L}\p{N}\s\-_:'".,!?\(\)]+$/u)
      .withMessage('Title contains invalid characters'),
    body('suggestedBy')
      .trim()
      .notEmpty()
      .withMessage('SuggestedBy is required')
      .isLength({ max: 100 })
      .withMessage('SuggestedBy must be less than 100 characters')
      .matches(/^[\p{L}\p{N}\s]+$/u)
      .withMessage('Name contains invalid characters'),
    body('year')
      .optional()
      .isInt({ min: 1900, max: 2100 })
      .withMessage('Year must be between 1900 and 2100'),
    body('genre')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Genre must be less than 100 characters'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes must be less than 500 characters'),
    body('thumbnail')
      .optional()
      .isURL()
      .withMessage('Thumbnail must be a valid URL')
  ],

  // Stock market validations
  tradeStock: [
    body('userId')
      .trim()
      .notEmpty()
      .withMessage('UserId is required')
      .isLength({ max: 100 })
      .withMessage('UserId must be less than 100 characters'),
    body('stockName')
      .trim()
      .notEmpty()
      .withMessage('StockName is required')
      .isLength({ max: 50 })
      .withMessage('StockName must be less than 50 characters'),
    body('shares')
      .isInt({ min: 1 })
      .withMessage('Shares must be a positive integer')
  ],

  // Vote validations
  addVote: [
    body('userId')
      .trim()
      .notEmpty()
      .withMessage('UserId is required')
      .isLength({ max: 100 })
      .withMessage('UserId must be less than 100 characters'),
    body('rankings')
      .isArray({ min: 1 })
      .withMessage('Rankings must be a non-empty array'),
    body('rankings.*')
      .isInt({ min: 1 })
      .withMessage('Each ranking must be a positive integer (movie ID)')
  ],

  // Voting round validations
  startVotingRound: [
    body('movieIds')
      .isArray({ min: 2 })
      .withMessage('movieIds must be an array with at least 2 movies'),
    body('movieIds.*')
      .isInt({ min: 1 })
      .withMessage('Each movieId must be a positive integer')
  ],

  // Gender detection validations
  detectGender: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 100 })
      .withMessage('Name must be less than 100 characters')
      .matches(/^[\p{L}\s\-']+$/u)
      .withMessage('Name contains invalid characters'),
    body('country')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Country must be a non-negative integer')
  ]
};

/**
 * Security headers middleware
 * Adds security-related HTTP headers
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent MIME type sniffing
  res.set('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.set('X-Frame-Options', 'DENY');

  // Enable XSS protection
  res.set('X-XSS-Protection', '1; mode=block');

  // Prevent referrer leakage
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy
  // Note: 'unsafe-eval' is required by Vue 3's template compiler in development/non-optimized builds.
  // For production, consider nonce-based CSP with pre-compiled templates to remove this directive.
  res.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' wss: https:;");

  // HSTS (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
};

/**
 * Error logging middleware
 * Logs errors with timestamp and request info
 */
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const requestInfo = {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  };

  console.error(`[${timestamp}] ERROR:`, err.message);
  console.error('Request:', JSON.stringify(requestInfo, null, 2));
  console.error('Stack:', err.stack);

  next(err);
};

/**
 * Clean up old rate limit entries periodically
 * Runs every 5 minutes
 */
const CLEANUP_INTERVAL = 5 * 60 * 1000;

if (typeof process !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    let cleaned = 0;

    for (const [ip, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(ip);
        cleaned++;
      }
    }

    // Log store size for monitoring
    console.log(`[RateLimit] Store size: ${rateLimitStore.size}/${MAX_STORE_SIZE} entries`);

    if (cleaned > 0) {
      console.log(`[RateLimit] Cleaned up ${cleaned} expired entries`);
    }
  }, CLEANUP_INTERVAL);
}
