import { NextResponse } from 'next/server';
import { getDb, hasDatabase } from '@/lib/db';
import { getRedis, hasRedis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = {
    ok: true,
    database: { configured: hasDatabase, reachable: false },
    redis: { configured: hasRedis, reachable: false },
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

  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
