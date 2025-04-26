import { Request, Response, NextFunction, RequestHandler } from 'express';
import config from '../config/config';

interface RateLimitInfo {
  timestamp: number;
  count: number;
}

const rateLimits = new Map<string, RateLimitInfo>();

/**
 * Simple in-memory rate limiting middleware
 * In production, consider using a Redis-based solution instead
 */
export const rateLimiter: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const windowMs = config.rateLimitWindowMs;
  const maxRequests = config.rateLimitMax;
  
  // Clean up old entries
  for (const [key, value] of rateLimits.entries()) {
    if (now - value.timestamp > windowMs) {
      rateLimits.delete(key);
    }
  }
  
  // Get or create rate limit info for this IP
  const rateLimit = rateLimits.get(ip) || { timestamp: now, count: 0 };
  
  // Reset if outside window
  if (now - rateLimit.timestamp > windowMs) {
    rateLimit.timestamp = now;
    rateLimit.count = 0;
  }
  
  // Increment request count
  rateLimit.count++;
  
  // Update rate limit info
  rateLimits.set(ip, rateLimit);
  
  // Set headers
  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - rateLimit.count));
  
  // If over limit, send error response
  if (rateLimit.count > maxRequests) {
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later'
    });
    return;
  }
  
  next();
};