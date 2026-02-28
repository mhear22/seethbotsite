import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

declare global {
  namespace Express {
    interface Request {
      subscription?: {
        tier: string;
        status: string;
        isActive: boolean;
      };
    }
  }
}

/**
 * Middleware to check if user has an active subscription
 * Must be used after requireAuth middleware
 */
export function requireSubscription(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      subscription_tier: true,
      subscription_status: true,
      subscription_end: true
    }
  }).then(user => {
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const tier = user.subscription_tier || 'free';
    const status = user.subscription_status || 'none';

    // Check if subscription is still valid
    let isActive = status === 'active';
    if (isActive && user.subscription_end) {
      const now = new Date();
      if (now > user.subscription_end) {
        isActive = false;
      }
    }

    req.subscription = {
      tier,
      status: isActive ? 'active' : status,
      isActive
    };

    if (!isActive) {
      return res.status(402).json({
        error: 'Subscription required',
        message: 'You need an active subscription to access this feature',
        subscriptionUrl: '/shop'
      });
    }

    next();
  }).catch(error => {
    console.error('Error checking subscription:', error);
    res.status(500).json({ error: 'Failed to check subscription status' });
  });
}

/**
 * Middleware to check if user has a specific subscription tier or higher
 * @param minTier - Minimum required tier ('basic', 'pro', 'premium')
 */
export function requireTier(minTier: string) {
  const tierLevels: Record<string, number> = {
    'free': 0,
    'basic': 1,
    'pro': 2,
    'premium': 3
  };

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        subscription_tier: true,
        subscription_status: true,
        subscription_end: true
      }
    }).then(user => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const tier = user.subscription_tier || 'free';
      const status = user.subscription_status || 'none';

      // Check if subscription is still valid
      let isActive = status === 'active';
      if (isActive && user.subscription_end) {
        const now = new Date();
        if (now > user.subscription_end) {
          isActive = false;
        }
      }

      const userLevel = tierLevels[tier] || 0;
      const requiredLevel = tierLevels[minTier] || 0;

      req.subscription = {
        tier,
        status: isActive ? 'active' : status,
        isActive
      };

      if (!isActive || userLevel < requiredLevel) {
        return res.status(403).json({
          error: 'Subscription tier required',
          message: `This feature requires ${minTier} tier or higher`,
          currentTier: tier,
          requiredTier: minTier,
          subscriptionUrl: '/shop'
        });
      }

      next();
    }).catch(error => {
      console.error('Error checking subscription tier:', error);
      res.status(500).json({ error: 'Failed to check subscription status' });
    });
  };
}

/**
 * Optional middleware that adds subscription info to request but doesn't block
 */
export function addSubscriptionInfo(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next();
  }

  prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      subscription_tier: true,
      subscription_status: true,
      subscription_end: true
    }
  }).then(user => {
    if (user) {
      const tier = user.subscription_tier || 'free';
      const status = user.subscription_status || 'none';

      let isActive = status === 'active';
      if (isActive && user.subscription_end) {
        const now = new Date();
        if (now > user.subscription_end) {
          isActive = false;
        }
      }

      req.subscription = {
        tier,
        status: isActive ? 'active' : status,
        isActive
      };
    }
    next();
  }).catch(error => {
    console.error('Error fetching subscription info:', error);
    next();
  });
}
