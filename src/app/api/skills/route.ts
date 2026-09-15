import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { apiError } from '@/lib/http';
import { requireUser } from '@/lib/server-auth';
import { ensureUser } from '@/lib/users';

const SkillSchema = z.object({
  name: z.string().trim().min(2).max(100),
  kind: z.enum(['teach', 'learn']),
  level: z.string().trim().max(80).nullable().optional(),
}).strict();
const DeleteSchema = z.object({ skillId: z.number().int().positive(), kind: z.enum(['teach', 'learn']) }).strict();

async function list(userId: string) {
  const sql = getDb();
  return sql`SELECT s.id, s.name, us.kind, us.level FROM user_skills us JOIN skills s ON s.id = us.skill_id WHERE us.user_id = ${userId} ORDER BY us.kind, s.name`;
}

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    await ensureUser(user);
    return NextResponse.json({ skills: await list(user.uid) });
  } catch (error) {
    return apiError(error, 'Unable to load skills');
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    await ensureUser(user);
    const input = SkillSchema.parse(await request.json());
    const sql = getDb();
    const normalizedName = input.name.replace(/\s+/g, ' ').trim();
    const rows = await sql`INSERT INTO skills(name) VALUES (${normalizedName}) ON CONFLICT(name) DO UPDATE SET name = EXCLUDED.name RETURNING id`;
    const skillId = Number(rows[0].id);
    await sql`
      INSERT INTO user_skills(user_id, skill_id, kind, level)
      VALUES (${user.uid}, ${skillId}, ${input.kind}, ${input.level ?? null})
      ON CONFLICT(user_id, skill_id, kind) DO UPDATE SET level = EXCLUDED.level
    `;
    return NextResponse.json({ skills: await list(user.uid) }, { status: 201 });
  } catch (error) {
    return apiError(error, 'Unable to add skill');
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser(request);
    const input = DeleteSchema.parse(await request.json());
    const sql = getDb();
    await sql`DELETE FROM user_skills WHERE user_id = ${user.uid} AND skill_id = ${input.skillId} AND kind = ${input.kind}`;
    return NextResponse.json({ skills: await list(user.uid) });
  } catch (error) {
    return apiError(error, 'Unable to remove skill');
  }
}
