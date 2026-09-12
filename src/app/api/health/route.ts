import { NextResponse } from 'next/server';
import { getDb, hasDatabase } from '@/lib/db';
import { getRedis, hasRedis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  const nvidiaConfigured = Boolean(process.env.NVIDIA_API_KEY);
  const openRouterConfigured = Boolean(process.env.OPENROUTER_API_KEY);

  const result = {
    ok: true,
    database: { configured: hasDatabase, reachable: false },
    redis: { configured: hasRedis, reachable: false },
    ai: {
      ready: nvidiaConfigured || openRouterConfigured,
      nvidia: {
        configured: nvidiaConfigured,
        model: process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct',
      },
      openrouter: {
        configured: openRouterConfigured,
        model: process.env.OPENROUTER_MODEL || 'openrouter/auto',
      },
    },
  };

  if (hasDatabase) {
    try {
      const sql = getDb();
      await sql`SELECT 1 AS ok`;
      result.database.reachable = true;
    } catch {
      result.ok = false;
    }
  } else {
    result.ok = false;
  }

  if (hasRedis) {
    try {
      const redis = getRedis();
      if (redis) {
        await redis.set('skillswap:health', Date.now(), { ex: 60 });
        result.redis.reachable = true;
      }
    } catch {
      result.ok = false;
    }
  } else {
    result.ok = false;
  }

  if (!result.ai.ready) result.ok = false;

  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
