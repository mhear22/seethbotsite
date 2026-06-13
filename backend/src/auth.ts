import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { randomBytes } from 'crypto';

/**
 * Simple API key authentication for seethbotsite
 *
 * This implementation uses:
 * - Simple API keys stored in environment variables
 * - JWT tokens for session management (optional future enhancement)
 * - Middleware to protect endpoints that modify data
 */

// Load API keys from environment variables
// Format: SEETHBOT_API_KEYS=key1,key2,key3 (comma-separated)
const API_KEYS = process.env.SEETHBOT_API_KEYS
  ? process.env.SEETHBOT_API_KEYS.split(',').map(k => k.trim())
  : [];

// JWT secret for token generation (REQUIRED - no fallback for security)
// App will fail to start if SEETHBOT_JWT_SECRET is not set
if (!process.env.SEETHBOT_JWT_SECRET) {
  throw new Error(
    'CRITICAL: SEETHBOT_JWT_SECRET environment variable must be set. ' +
    'Generate a secure secret with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
  );
}
const JWT_SECRET: string = process.env.SEETHBOT_JWT_SECRET;

// JWT expiry time
const JWT_EXPIRY: string = process.env.SEETHBOT_JWT_EXPIRY || '24h';

/**
 * API key types
 */
export enum ApiKeyType {
  READ_ONLY = 'read_only',
  READ_WRITE = 'read_write',
  ADMIN = 'admin'
}

/**
 * API key metadata
 */
interface ApiKeyInfo {
  key: string;
  type: ApiKeyType;
  description: string;
  createdAt: Date;
}

// For demonstration, register some API keys
// In production, this would come from a database
const registeredKeys: Map<string, ApiKeyInfo> = new Map();

/**
 * Initialize API keys
 *
 * In production, only keys from SEETHBOT_API_KEYS are registered; no default
 * admin key is auto-created. In development, a convenience admin key is
 * generated to ease local testing.
 */
export const initializeApiKeys = () => {
  // Only auto-create a default admin key outside of production. This is a
  // dev convenience and must never exist in a live deployment.
  if (process.env.NODE_ENV !== 'production') {
    const defaultAdminKey = generateApiKey();

    registeredKeys.set(defaultAdminKey, {
      key: defaultAdminKey,
      type: ApiKeyType.ADMIN,
      description: 'Default admin key for development',
      createdAt: new Date()
    });

    console.log('[Auth] Default admin key generated for development. Set SEETHBOT_API_KEYS to use your own keys.');
  } else {
    console.log('[Auth] Running in production mode. Set SEETHBOT_API_KEYS env var to configure API keys.');
  }

  // Add any keys from environment
  for (const envKey of API_KEYS) {
    registeredKeys.set(envKey, {
      key: envKey,
      type: ApiKeyType.READ_WRITE,
      description: 'Key from environment',
      createdAt: new Date()
    });
  }

  if (process.env.NODE_ENV === 'production' && registeredKeys.size === 0) {
    console.warn('[Auth] WARNING: No API keys configured. Write-protected endpoints will reject all requests. Set SEETHBOT_API_KEYS.');
  }

  console.log(`[Auth] Total active API keys: ${registeredKeys.size}`);
};

/**
 * Generate a random API key
 */
export const generateApiKey = (): string => {
  return `sk_${randomBytes(24).toString('base64url')}`;
};

/**
 * Validate an API key
 */
export const validateApiKey = (apiKey: string): ApiKeyInfo | null => {
  if (!apiKey) {
    return null;
  }

  const keyInfo = registeredKeys.get(apiKey);
  return keyInfo || null;
};

/**
 * Register an API key (for testing purposes)
 */
export const registerApiKey = (apiKey: string, type: ApiKeyType = ApiKeyType.ADMIN): void => {
  registeredKeys.set(apiKey, {
    key: apiKey,
    type,
    description: 'Test API key',
    createdAt: new Date()
  });
};

/**
 * Extract API key from request
 * Checks Authorization header and X-API-Key header
 */
export const extractApiKey = (req: Request): string | null => {
  // Check Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check X-API-Key header
  const apiKey = req.headers['x-api-key'];
  if (typeof apiKey === 'string') {
    return apiKey;
  }

  return null;
};

/**
 * Middleware to require API key authentication
 * Protects endpoints that require authentication
 */
export const requireApiKey = (requiredType: ApiKeyType = ApiKeyType.READ_WRITE) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const apiKey = extractApiKey(req);

    if (!apiKey) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide an API key via X-API-Key or Authorization: Bearer header'
      });
    }

    const keyInfo = validateApiKey(apiKey);

    if (!keyInfo) {
      return res.status(403).json({
        error: 'Invalid API key',
        message: 'The provided API key is not valid'
      });
    }

    // Check if key has sufficient permissions
    const typeHierarchy = {
      [ApiKeyType.READ_ONLY]: 1,
      [ApiKeyType.READ_WRITE]: 2,
      [ApiKeyType.ADMIN]: 3
    };

    if (typeHierarchy[keyInfo.type] < typeHierarchy[requiredType]) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This endpoint requires ${requiredType} permissions`
      });
    }

    // Attach key info to request for later use
    (req as any).auth = {
      apiKey,
      keyType: keyInfo.type
    };

    next();
  };
};

/**
 * Middleware for read-only endpoints (optional auth)
 * Allows anonymous access but tracks authenticated users
 */
export const optionalApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = extractApiKey(req);

  if (apiKey) {
    const keyInfo = validateApiKey(apiKey);
    if (keyInfo) {
      (req as any).auth = {
        apiKey,
        keyType: keyInfo.type
      };
    }
  }

  next();
};

/**
 * Generate a JWT token from an API key
 * Useful for maintaining sessions
 */
export const generateToken = (apiKey: string): string => {
  const keyInfo = validateApiKey(apiKey);

  if (!keyInfo) {
    throw new Error('Invalid API key');
  }

  const payload = {
    keyType: keyInfo.type,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY } as SignOptions);
};

/**
 * Validate a JWT token
 */
export const validateToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Middleware to require JWT token (alternative to API key)
 */
export const requireToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please provide a JWT token via Authorization: Bearer header'
    });
  }

  const token = authHeader.substring(7);
  const decoded = validateToken(token);

  if (!decoded) {
    return res.status(403).json({
      error: 'Invalid or expired token',
      message: 'Please authenticate again'
    });
  }

  (req as any).auth = {
    token,
    keyType: decoded.keyType
  };

  next();
};

/**
 * Check if a request is authenticated
 */
export const isAuthenticated = (req: Request): boolean => {
  return !!(req as any).auth;
};

/**
 * Get the authentication type of the request
 */
export const getAuthType = (req: Request): ApiKeyType | null => {
  const auth = (req as any).auth;
  return auth ? auth.keyType : null;
};

/**
 * Middleware to log authentication attempts
 */
export const logAuthAttempt = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = extractApiKey(req);
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  if (apiKey) {
    const keyInfo = validateApiKey(apiKey);
    if (keyInfo) {
      console.log(`[Auth] Valid API key used by ${ip} (${keyInfo.type})`);
    } else {
      console.warn(`[Auth] Invalid API key attempted by ${ip}`);
    }
  }

  next();
};

// Initialize API keys on module load
initializeApiKeys();

export default {
  generateApiKey,
  validateApiKey,
  requireApiKey,
  optionalApiKey,
  generateToken,
  validateToken,
  requireToken,
  isAuthenticated,
  getAuthType,
  logAuthAttempt,
  ApiKeyType
};
