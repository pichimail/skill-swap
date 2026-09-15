import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { apiError } from '@/lib/http';
import { requireUser } from '@/lib/server-auth';

const BlockSchema = z.object({ targetUserId: z.string().min(1).max(191) }).strict();

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const sql = getDb();
    const rows = await sql`SELECT u.id, u.display_name, u.avatar_url, b.created_at FROM user_blocks b JOIN users u ON u.id = b.blocked_id WHERE b.blocker_id = ${user.uid} ORDER BY b.created_at DESC`;
    return NextResponse.json({ blocks: rows });
  } catch (error) {
    return apiError(error, 'Unable to load blocked users');
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const { targetUserId } = BlockSchema.parse(await request.json());
    if (targetUserId === user.uid) return NextResponse.json({ error: 'Invalid block target' }, { status: 400 });
    const sql = getDb();
    await sql`INSERT INTO user_blocks(blocker_id, blocked_id) VALUES (${user.uid}, ${targetUserId}) ON CONFLICT DO NOTHING`;
    await sql`UPDATE matches SET status = 'blocked', updated_at = now() WHERE ((user_a = ${user.uid} AND user_b = ${targetUserId}) OR (user_a = ${targetUserId} AND user_b = ${user.uid})) AND status IN ('pending','accepted')`;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return apiError(error, 'Unable to block user');
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser(request);
    const { targetUserId } = BlockSchema.parse(await request.json());
    const sql = getDb();
    await sql`DELETE FROM user_blocks WHERE blocker_id = ${user.uid} AND blocked_id = ${targetUserId}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, 'Unable to unblock user');
  }
}
