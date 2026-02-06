import { Request, Response, NextFunction } from 'express';
import { recordPageView } from './controllers/analytics.controller';

/**
 * Middleware to track page views for analytics
 * This will be applied to all routes except API endpoints
 */
export const trackPageView = (req: Request, res: Response, next: NextFunction) => {
  // Skip tracking for API endpoints
  if (req.path.startsWith('/api/')) {
    return next();
  }

  // Skip tracking for static files
  if (req.path.includes('.')) {
    return next();
  }

  // Get userId from session if available
  const userId = (req as any).session?.userId || (req as any).userId;

  // Track the page view
  recordPageView(req.path, userId);

  next();
};

export default trackPageView;
