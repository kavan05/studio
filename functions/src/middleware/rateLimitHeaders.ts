// functions/src/middleware/rateLimitHeaders.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

const DAILY_LIMIT = parseInt(process.env.RATE_LIMIT_PER_DAY || "1000");

/**
 * Middleware to add rate limit headers to responses
 * These headers inform clients about their API usage limits
 */
export const rateLimitHeaders = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Calculate reset time (midnight UTC)
  const now = new Date();
  const resetTime = new Date(now);
  resetTime.setUTCHours(24, 0, 0, 0);
  const resetTimestamp = Math.floor(resetTime.getTime() / 1000);

  // Get current usage from user data (set by rate limiter middleware)
  const requestsUsed = req.user?.requestsToday || 0;
  const remaining = Math.max(0, DAILY_LIMIT - requestsUsed);

  // Set standard rate limit headers
  res.setHeader("X-RateLimit-Limit", DAILY_LIMIT.toString());
  res.setHeader("X-RateLimit-Remaining", remaining.toString());
  res.setHeader("X-RateLimit-Reset", resetTimestamp.toString());
  res.setHeader("X-RateLimit-Policy", `${DAILY_LIMIT};w=86400`);

  // Add Retry-After header if rate limited
  if (remaining === 0) {
    const secondsUntilReset = resetTimestamp - Math.floor(Date.now() / 1000);
    res.setHeader("Retry-After", secondsUntilReset.toString());
  }

  return next();
};

/**
 * Helper to get rate limit info for a user
 */
export function getRateLimitInfo(requestsUsed: number): {
  limit: number;
  remaining: number;
  resetAt: Date;
  percentUsed: number;
} {
  const now = new Date();
  const resetAt = new Date(now);
  resetAt.setUTCHours(24, 0, 0, 0);

  const remaining = Math.max(0, DAILY_LIMIT - requestsUsed);
  const percentUsed = (requestsUsed / DAILY_LIMIT) * 100;

  return {
    limit: DAILY_LIMIT,
    remaining,
    resetAt,
    percentUsed: Math.round(percentUsed * 100) / 100,
  };
}
