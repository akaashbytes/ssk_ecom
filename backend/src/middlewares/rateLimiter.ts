import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
}) => {
  const store = new Map<string, RateLimitRecord>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
    const now = Date.now();
    const record = store.get(ip);

    if (!record || now > record.resetAt) {
      store.set(ip, {
        count: 1,
        resetAt: now + options.windowMs,
      });
      next();
      return;
    }

    if (record.count >= options.max) {
      const waitSeconds = Math.ceil((record.resetAt - now) / 1000);
      res.status(429).json({
        success: false,
        message: `${options.message} Please retry in ${waitSeconds} seconds.`,
      });
      return;
    }

    record.count++;
    next();
  };
};

// Rate limiter for admin login: 10 attempts per 15 minutes
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts.',
});

// Rate limiter for customer order tracking: 30 requests per minute
export const trackingRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many tracking lookups.',
});
