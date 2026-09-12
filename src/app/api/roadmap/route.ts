import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { getDb, hasDatabase } from '@/lib/db';
import { getRedis } from '@/lib/redis';
import { getRoadmapRateLimit } from '@/lib/rate-limit';

const RequestSchema = z.object({
  skill: z.string().trim().min(2).max(120),
  userId: z.string().trim().min(1).max(191).optional(),
});

const WeekSchema = z.object({
  week: z.number().int().min(1).max(12),
  title: z.string().trim().min(1).max(160),
  tasks: z.array(z.string().trim().min(1).max(300)).min(2).max(8),
});

const RoadmapSchema = z.array(WeekSchema).min(4).max(4);
type Roadmap = z.infer<typeof RoadmapSchema>;

type ProviderResult = {
  roadmap: Roadmap;
  provider: 'nvidia' | 'openrouter';
  model: string;
};

function requestIdentity(request: Request, userId?: string) {
  if (userId) return `user:${userId}`;
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const real = request.headers.get('x-real-ip')?.trim();
  return `ip:${forwarded || real || 'unknown'}`;
}

function extractRoadmap(content: string): Roadmap {
  let jsonString = content.trim();

  if (jsonString.includes('```json')) {
    jsonString = jsonString.split('```json')[1]?.split('```')[0]?.trim() || jsonString;
  } else if (jsonString.includes('```')) {
    jsonString = jsonString.split('```')[1]?.split('```')[0]?.trim() || jsonString;
  }

  return RoadmapSchema.parse(JSON.parse(jsonString));
}

async function generateWithNvidia(prompt: string): Promise<ProviderResult> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error('NVIDIA_API_KEY is not configured');

  const model = process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct';
  const client = new OpenAI({
    apiKey,
    baseURL: 'https://integrate.api.nvidia.com/v1',
    timeout: 30_000,
    maxRetries: 1,
  });

  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 1024,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('NVIDIA returned no content');

  return { roadmap: extractRoadmap(content), provider: 'nvidia', model };
}

async function generateWithOpenRouter(prompt: string): Promise<ProviderResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured');

  const model = process.env.OPENROUTER_MODEL || 'openrouter/auto';
  const siteUrl = process.env.OPENROUTER_SITE_URL;
  const appName = process.env.OPENROUTER_APP_NAME || 'Skill Swap';

  const defaultHeaders: Record<string, string> = {};
  if (siteUrl) defaultHeaders['HTTP-Referer'] = siteUrl;
  if (appName) defaultHeaders['X-Title'] = appName;

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders,
    timeout: 30_000,
    maxRetries: 1,
  });

  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 1024,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('OpenRouter returned no content');

  return { roadmap: extractRoadmap(content), provider: 'openrouter', model };
}

async function generateRoadmap(prompt: string): Promise<ProviderResult> {
  const errors: string[] = [];

  try {
    return await generateWithNvidia(prompt);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`NVIDIA: ${message}`);
    console.warn('NVIDIA roadmap generation failed; attempting OpenRouter fallback:', message);
  }

  try {
    return await generateWithOpenRouter(prompt);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`OpenRouter: ${message}`);
    console.error('OpenRouter roadmap fallback failed:', message);
  }

  throw new Error(`All AI providers failed. ${errors.join(' | ')}`);
}

export async function POST(req: Request) {
  try {
    const input = RequestSchema.parse(await req.json());
    const limiter = getRoadmapRateLimit();

    if (limiter) {
      const limit = await limiter.limit(requestIdentity(req, input.userId));
      if (!limit.success) {
        return NextResponse.json(
          { error: 'Too many roadmap requests. Try again shortly.' },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': String(limit.limit),
              'X-RateLimit-Remaining': String(limit.remaining),
              'X-RateLimit-Reset': String(limit.reset),
            },
          },
        );
      }
    }

    const normalizedSkill = input.skill.toLowerCase().replace(/\s+/g, ' ').trim();
    const cacheKey = `skillswap:roadmap:v2:${normalizedSkill}`;
    const redis = getRedis();

    if (redis) {
      try {
        const cached = await redis.get<Roadmap>(cacheKey);
        if (cached) {
          const validated = RoadmapSchema.parse(cached);
          await persistRoadmap(input.userId, input.skill, validated, 'redis-cache');
          return NextResponse.json({ roadmap: validated, cached: true, provider: 'cache' });
        }
      } catch (cacheError) {
        console.warn('Roadmap cache read failed:', cacheError);
      }
    }

    const prompt = `You are an expert AI tutor. Generate a 4-week learning roadmap for the skill: "${input.skill}".
Return ONLY a strictly valid JSON array with exactly 4 objects and no markdown/backticks.
Each object must match:
{
  "week": 1,
  "title": "Short title for the week",
  "tasks": ["Task 1", "Task 2", "Task 3"]
}`;

    const generated = await generateRoadmap(prompt);

    if (redis) {
      try {
        await redis.set(cacheKey, generated.roadmap, { ex: 60 * 60 * 24 });
      } catch (cacheError) {
        console.warn('Roadmap cache write failed:', cacheError);
      }
    }

    await persistRoadmap(
      input.userId,
      input.skill,
      generated.roadmap,
      `${generated.provider}:${generated.model}`,
    );

    return NextResponse.json({
      roadmap: generated.roadmap,
      cached: false,
      provider: generated.provider,
      model: generated.model,
    });
  } catch (error) {
    console.error('AI Route Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = error instanceof z.ZodError ? 400 : 502;
    return NextResponse.json({ error: 'Failed to generate roadmap', details: message }, { status });
  }
}

async function persistRoadmap(
  userId: string | undefined,
  skill: string,
  plan: Roadmap,
  model: string,
) {
  if (!hasDatabase) return;

  try {
    const sql = getDb();

    if (userId) {
      await sql`
        INSERT INTO users (id, updated_at)
        VALUES (${userId}, now())
        ON CONFLICT (id) DO UPDATE SET updated_at = now()
      `;
    }

    await sql`
      INSERT INTO roadmaps (user_id, skill, plan, model)
      VALUES (${userId ?? null}, ${skill}, ${JSON.stringify(plan)}::jsonb, ${model})
    `;
  } catch (dbError) {
    console.warn('Roadmap persistence failed:', dbError);
  }
}
