import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AiUnavailableError, generateRoadmap, RoadmapSchema, type Roadmap } from '@/lib/ai';
import { getDb } from '@/lib/db';
import { apiError } from '@/lib/http';
import { getRoadmapRateLimits } from '@/lib/rate-limit';
import { getRedis } from '@/lib/redis';
import { getClientIp, normalizeSkill } from '@/lib/roadmap-utils';
import { requireUser } from '@/lib/server-auth';
import { ensureUser } from '@/lib/users';

const RequestSchema = z.object({ skill: z.string().trim().min(2).max(120) }).strict();

async function saveRoadmap(userId: string, skill: string, normalizedSkill: string, plan: Roadmap, provider: string, model: string) {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO roadmaps (user_id, skill, normalized_skill, plan, provider, model, updated_at)
    VALUES (${userId}, ${skill}, ${normalizedSkill}, ${JSON.stringify(plan)}::jsonb, ${provider}, ${model}, now())
    ON CONFLICT (user_id, normalized_skill) WHERE user_id IS NOT NULL AND normalized_skill IS NOT NULL
    DO UPDATE SET skill = EXCLUDED.skill, plan = EXCLUDED.plan, provider = EXCLUDED.provider, model = EXCLUDED.model, updated_at = now()
    RETURNING id, skill, plan, provider, model, updated_at
  `;
  return rows[0];
}

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    await ensureUser(user);
    const sql = getDb();
    const url = new URL(request.url);
    const skill = url.searchParams.get('skill');
    if (skill) {
      const normalized = normalizeSkill(skill);
      const rows = await sql`SELECT id, skill, plan, provider, model, updated_at FROM roadmaps WHERE user_id = ${user.uid} AND normalized_skill = ${normalized} LIMIT 1`;
      return NextResponse.json({ roadmap: rows[0] ?? null });
    }
    const rows = await sql`SELECT id, skill, plan, provider, model, updated_at FROM roadmaps WHERE user_id = ${user.uid} ORDER BY updated_at DESC LIMIT 20`;
    return NextResponse.json({ roadmaps: rows });
  } catch (error) {
    return apiError(error, 'Unable to load roadmaps');
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    await ensureUser(user);
    const input = RequestSchema.parse(await request.json());
    const redis = getRedis();
    const limits = getRoadmapRateLimits();
    if ((!redis || !limits) && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'AI generation is temporarily unavailable' }, { status: 503 });
    }

    if (limits) {
      const ip = getClientIp(request);
      const [userLimit, ipLimit] = await Promise.all([
        limits.userLimiter.limit(user.uid),
        limits.ipLimiter.limit(ip),
      ]);
      if (!userLimit.success || !ipLimit.success) {
        return NextResponse.json(
          { error: 'Too many roadmap requests. Try again shortly.' },
          { status: 429, headers: { 'Retry-After': '600' } },
        );
      }
    }

    const normalizedSkill = normalizeSkill(input.skill);
    const cacheKey = `skillswap:roadmap:v3:${normalizedSkill}`;
    if (redis) {
      const cached = await redis.get<Roadmap>(cacheKey).catch(() => null);
      if (cached) {
        const validated = RoadmapSchema.parse(cached);
        await saveRoadmap(user.uid, input.skill, normalizedSkill, validated, 'cache', 'redis');
        return NextResponse.json({ roadmap: validated, cached: true, provider: 'cache', model: 'redis' });
      }
    }

    let generated;
    try {
      generated = await generateRoadmap(input.skill);
    } catch (error) {
      if (error instanceof AiUnavailableError) {
        return NextResponse.json({ error: 'AI generation is temporarily unavailable' }, { status: 502 });
      }
      throw error;
    }

    if (redis) await redis.set(cacheKey, generated.roadmap, { ex: 86_400 }).catch(() => undefined);
    await saveRoadmap(user.uid, input.skill, normalizedSkill, generated.roadmap, generated.provider, generated.model);

    const sql = getDb();
    await sql`
      INSERT INTO analytics_events (user_id, event_name, metadata)
      VALUES (${user.uid}, 'ai_roadmap_generated', ${JSON.stringify({ provider: generated.provider, model: generated.model, ...generated.usage })}::jsonb)
    `;
    console.info('roadmap_ai_usage', { userId: user.uid, provider: generated.provider, model: generated.model, ...generated.usage });

    return NextResponse.json({ roadmap: generated.roadmap, cached: false, provider: generated.provider, model: generated.model });
  } catch (error) {
    return apiError(error, 'Failed to generate roadmap');
  }
}
