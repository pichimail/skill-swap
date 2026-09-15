import 'server-only';

import OpenAI from 'openai';
import { z } from 'zod';

export const WeekSchema = z.object({
  week: z.number().int().min(1).max(4),
  title: z.string().trim().min(1).max(160),
  tasks: z.array(z.string().trim().min(1).max(300)).min(2).max(8),
});
export const RoadmapSchema = z.array(WeekSchema).length(4);
export type Roadmap = z.infer<typeof RoadmapSchema>;

export type AiResult = {
  roadmap: Roadmap;
  provider: 'nvidia' | 'openrouter';
  model: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
};

export class AiUnavailableError extends Error {
  constructor() {
    super('AI providers unavailable');
    this.name = 'AiUnavailableError';
  }
}

function parseRoadmap(content: string) {
  let text = content.trim();
  if (text.includes('```json')) text = text.split('```json')[1]?.split('```')[0]?.trim() || text;
  else if (text.includes('```')) text = text.split('```')[1]?.split('```')[0]?.trim() || text;
  return RoadmapSchema.parse(JSON.parse(text));
}

function usageOf(usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | undefined) {
  return {
    promptTokens: usage?.prompt_tokens ?? 0,
    completionTokens: usage?.completion_tokens ?? 0,
    totalTokens: usage?.total_tokens ?? 0,
  };
}

async function callProvider(provider: 'nvidia' | 'openrouter', prompt: string): Promise<AiResult> {
  const isNvidia = provider === 'nvidia';
  const apiKey = isNvidia ? process.env.NVIDIA_API_KEY : process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('provider_not_configured');
  const model = isNvidia
    ? process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct'
    : process.env.OPENROUTER_MODEL || 'openrouter/auto';

  const headers: Record<string, string> = {};
  if (!isNvidia && process.env.OPENROUTER_SITE_URL) headers['HTTP-Referer'] = process.env.OPENROUTER_SITE_URL;
  if (!isNvidia) headers['X-Title'] = process.env.OPENROUTER_APP_NAME || 'Skill Swap';

  const client = new OpenAI({
    apiKey,
    baseURL: isNvidia ? 'https://integrate.api.nvidia.com/v1' : 'https://openrouter.ai/api/v1',
    defaultHeaders: headers,
    timeout: 30_000,
    maxRetries: 1,
  });
  const response = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 1200,
  });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('empty_provider_response');
  return { roadmap: parseRoadmap(content), provider, model, usage: usageOf(response.usage) };
}

export async function generateRoadmap(skill: string): Promise<AiResult> {
  const prompt = `You are an expert tutor. Create a practical four-week learning roadmap for "${skill}". Return only a valid JSON array with exactly four objects. Each object must contain: {"week":1,"title":"short title","tasks":["task 1","task 2","task 3"]}. Weeks must be numbered 1 through 4.`;

  for (const provider of ['nvidia', 'openrouter'] as const) {
    try {
      return await callProvider(provider, prompt);
    } catch (error) {
      console.warn('roadmap_provider_failed', {
        provider,
        category: error instanceof z.ZodError ? 'invalid_output' : error instanceof SyntaxError ? 'invalid_json' : 'provider_error',
      });
    }
  }
  throw new AiUnavailableError();
}
