import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { apiError } from '@/lib/http';
import { requireUser } from '@/lib/server-auth';

const ReadSchema = z.object({ id: z.string().uuid().optional(), all: z.boolean().optional() }).refine((value) => value.id || value.all, { message: 'Notification id or all=true is required' });

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const sql = getDb();
    const rows = await sql`SELECT id, type, payload, read_at, created_at FROM notifications WHERE user_id = ${user.uid} ORDER BY created_at DESC LIMIT 50`;
    const counts = await sql`SELECT count(*)::int AS unread FROM notifications WHERE user_id = ${user.uid} AND read_at IS NULL`;
    return NextResponse.json({ notifications: rows, unread: Number(counts[0]?.unread ?? 0) });
  } catch (error) {
    return apiError(error, 'Unable to load notifications');
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser(request);
    const input = ReadSchema.parse(await request.json());
    const sql = getDb();
    if (input.all) await sql`UPDATE notifications SET read_at = now() WHERE user_id = ${user.uid} AND read_at IS NULL`;
    else await sql`UPDATE notifications SET read_at = now() WHERE id = ${input.id}::uuid AND user_id = ${user.uid}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, 'Unable to update notifications');
  }
}
