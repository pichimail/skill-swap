import { Ratelimit } from '@upstash/ratelimit';
import { getRedis } from '@/lib/redis';

let userLimiter: Ratelimit | null | undefined;
let ipLimiter: Ratelimit | null | undefined;

export function getRoadmapRateLimits() {
  if (userLimiter !== undefined && ipLimiter !== undefined) {
    return userLimiter && ipLimiter ? { userLimiter, ipLimiter } : null;
  }
  const redis = getRedis();
  if (!redis) {
    userLimiter = null;
    ipLimiter = null;
    return null;
  }
  userLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(8, '10 m'),
    analytics: true,
    prefix: 'skillswap:roadmap:user',
  });
  ipLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '10 m'),
    analytics: true,
    prefix: 'skillswap:roadmap:ip',
  });
  return { userLimiter, ipLimiter };
}
