import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export const hasRedis = Boolean(url && token);

let client: Redis | null = null;

export function getRedis() {
  if (!url || !token) return null;
  if (!client) client = new Redis({ url, token });
  return client;
}
