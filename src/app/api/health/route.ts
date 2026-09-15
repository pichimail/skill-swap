import { NextResponse } from 'next/server';
import { getDb, hasDatabase } from '@/lib/db';
import { isFirebaseAdminConfigured } from '@/lib/firebase-admin';
import { checkSchemaVersion, EXPECTED_SCHEMA_VERSION } from '@/lib/migrations';
import { getRedis, hasRedis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  const nvidiaConfigured = Boolean(process.env.NVIDIA_API_KEY);
  const openRouterConfigured = Boolean(process.env.OPENROUTER_API_KEY);
  const liveKitConfigured = Boolean(
    (process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL) &&
      process.env.LIVEKIT_API_KEY &&
      process.env.LIVEKIT_API_SECRET,
  );

  const result = {
    ok: true,
    database: { configured: hasDatabase, reachable: false },
    schema: { ready: false, version: null as string | null, expected: EXPECTED_SCHEMA_VERSION },
    redis: { configured: hasRedis, reachable: false },
    auth: { firebaseAdmin: isFirebaseAdminConfigured() },
    realtime: { livekit: liveKitConfigured },
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
      const schemaState = await checkSchemaVersion();
      result.schema.ready = schemaState.ready;
      result.schema.version = schemaState.version;
      if (!schemaState.ready) result.ok = false;
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

  if (!result.auth.firebaseAdmin) result.ok = false;
  if (!result.ai.ready) result.ok = false;
  if (!result.realtime.livekit) result.ok = false;

  return NextResponse.json(result, {
    status: result.ok ? 200 : 503,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
