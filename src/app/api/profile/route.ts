import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { apiError } from '@/lib/http';
import { requireUser } from '@/lib/server-auth';
import { ensureUser } from '@/lib/users';

const ProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(160).optional(),
  bio: z.string().trim().max(1200).nullable().optional(),
  location: z.string().trim().max(160).nullable().optional(),
  timezone: z.string().trim().max(100).nullable().optional(),
}).strict();

async function loadProfile(userId: string) {
  const sql = getDb();
  const users = await sql`SELECT id, email, display_name, avatar_url, bio, location, timezone, is_active, created_at FROM users WHERE id = ${userId} LIMIT 1`;
  const skills = await sql`SELECT s.id, s.name, us.kind, us.level FROM user_skills us JOIN skills s ON s.id = us.skill_id WHERE us.user_id = ${userId} ORDER BY us.kind, s.name`;
  return { ...users[0], skills };
}

export async function GET(request: Request) {
  try { const user = await requireUser(request); await ensureUser(user); return NextResponse.json({ profile: await loadProfile(user.uid) }); }
  catch (error) { return apiError(error, 'Unable to load profile'); }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser(request); await ensureUser(user); const input = ProfileSchema.parse(await request.json()); const sql = getDb();
    await sql`UPDATE users SET display_name = CASE WHEN ${input.displayName !== undefined} THEN ${input.displayName ?? null} ELSE display_name END, bio = CASE WHEN ${input.bio !== undefined} THEN ${input.bio ?? null} ELSE bio END, location = CASE WHEN ${input.location !== undefined} THEN ${input.location ?? null} ELSE location END, timezone = CASE WHEN ${input.timezone !== undefined} THEN ${input.timezone ?? null} ELSE timezone END, updated_at = now() WHERE id = ${user.uid}`;
    return NextResponse.json({ profile: await loadProfile(user.uid) });
  } catch (error) { return apiError(error, 'Unable to update profile'); }
}
