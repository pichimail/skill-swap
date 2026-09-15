import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { apiError } from '@/lib/http';
import { requireUser } from '@/lib/server-auth';

const MessageSchema = z.object({ body: z.string().trim().min(1).max(5000) }).strict();

async function requireMembership(conversationId: string, userId: string) {
  const sql = getDb();
  const rows = await sql`SELECT conversation_id FROM conversation_members WHERE conversation_id = ${conversationId}::uuid AND user_id = ${userId} LIMIT 1`;
  return Boolean(rows[0]);
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    if (!(await requireMembership(id, user.uid))) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    const sql = getDb();
    const rows = await sql`SELECT id, sender_id, body, created_at, edited_at FROM messages WHERE conversation_id = ${id}::uuid ORDER BY created_at DESC LIMIT 100`;
    await sql`UPDATE conversation_members SET last_read_at = now() WHERE conversation_id = ${id}::uuid AND user_id = ${user.uid}`;
    return NextResponse.json({ messages: [...rows].reverse() });
  } catch (error) {
    return apiError(error, 'Unable to load messages');
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    if (!(await requireMembership(id, user.uid))) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    const input = MessageSchema.parse(await request.json());
    const sql = getDb();
    const blocked = await sql`
      SELECT 1 FROM conversation_members other
      JOIN user_blocks b ON (b.blocker_id = ${user.uid} AND b.blocked_id = other.user_id) OR (b.blocker_id = other.user_id AND b.blocked_id = ${user.uid})
      WHERE other.conversation_id = ${id}::uuid AND other.user_id <> ${user.uid} LIMIT 1
    `;
    if (blocked[0]) return NextResponse.json({ error: 'Messaging unavailable' }, { status: 403 });
    const rows = await sql`INSERT INTO messages(conversation_id, sender_id, body) VALUES (${id}::uuid, ${user.uid}, ${input.body}) RETURNING id, sender_id, body, created_at`;
    await sql`UPDATE conversations SET updated_at = now() WHERE id = ${id}::uuid`;
    await sql`
      INSERT INTO notifications(user_id, type, payload)
      SELECT cm.user_id, 'message', ${JSON.stringify({ conversationId: id, senderId: user.uid })}::jsonb
      FROM conversation_members cm WHERE cm.conversation_id = ${id}::uuid AND cm.user_id <> ${user.uid}
    `;
    return NextResponse.json({ message: rows[0] }, { status: 201 });
  } catch (error) {
    return apiError(error, 'Unable to send message');
  }
}
