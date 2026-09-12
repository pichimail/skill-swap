import { Ratelimit } from '@upstash/ratelimit';
import { getRedis } from '@/lib/redis';

let limiter: Ratelimit | null | undefined;

export function getRoadmapRateLimit() {
  if (limiter !== undefined) return limiter;

  const redis = getRedis();
  if (!redis) {
    limiter = null;
    return limiter;
  }

  limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(8, '10 m'),
    analytics: true,
    prefix: 'skillswap:roadmap',
  });

  return limiter;
}
